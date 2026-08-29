-- =====================================================================
-- B2B E-COMMERCE PLATFORM — PRODUCTION DATABASE SCHEMA
-- Engine target: PostgreSQL 14+
-- Author: Principal Database Architect
-- =====================================================================
--
-- DESIGN NOTES (read before extending this schema)
--
-- 1. IDENTITY: BIGSERIAL/IDENTITY surrogate keys are used everywhere for
--    join performance and index compactness. External-system references
--    (legacy DB sync) are kept as separate `external_id` VARCHAR columns,
--    never as the primary key, since legacy IDs are not guaranteed stable
--    or globally unique across entity types.
--
-- 2. CATEGORIES: implemented as a self-referencing adjacency list
--    (parent_id) rather than a closure table. This supports the required
--    3-level depth (Category -> Group -> Subgroup) and arbitrary custom
--    nav nodes cleanly. If deep recursive querying becomes a bottleneck,
--    a materialized closure table (category_closure) can be added later
--    without breaking this base structure.
--
-- 3. CUSTOM ATTRIBUTES: modeled as EAV (attribute_definitions +
--    product_attribute_values) because attributes are category-specific,
--    open-ended, and administrator-defined at runtime. A fixed-column
--    approach would require schema migrations for every new attribute.
--
-- 4. ORDER SNAPSHOTTING: orders NEVER join live to products/addresses for
--    historical financial data. order_items and order_addresses freeze a
--    copy of every fact (price, VAT rate, packaging, address) at the
--    moment of purchase, so later edits to a product or address cannot
--    silently rewrite order history. product_id / user_id FKs are kept
--    ON DELETE SET NULL / kept for traceability only, never authoritative.
--
-- 5. PROMOTIONS: a promotion can target categories, brands and/or
--    individual clients simultaneously via three junction tables. Empty
--    junctions for a promotion = applies storefront-wide. Application
--    logic treats multiple populated junctions as OR'd scope (a product
--    qualifies if it matches ANY targeted category/brand, and a client
--    qualifies if targeted OR no client restriction exists).
--
-- 6. NOTIFICATIONS / IMPORTS: modeled as durable log/outbox tables
--    (notification_log, import_batches, import_logs) rather than
--    fire-and-forget side effects, so admin email delivery and legacy
--    data sync are both auditable and retryable.
--
-- =====================================================================


-- =====================================================================
-- SECTION 0: EXTENSIONS & SHARED UTILITIES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- for fuzzy/partial text search (gin_trgm_ops)

-- Generic trigger to keep updated_at current on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
-- SECTION 1: TYPE CODE REFERENCE (no native SQL enums)
-- =====================================================================
--
-- All "enum-like" columns are plain SMALLINT with a CHECK constraint,
-- not native PostgreSQL ENUM types. The mapping lives only in the C#
-- backend (e.g. `enum UserStatus { Pending = 1, ... }`) and the DB just
-- stores/validates the integer. This keeps EF Core scaffolding simple
-- (plain int, no MapEnum<T>() config) and makes adding a new value a
-- pure C# change (no ALTER TYPE migration). The CHECK constraint on
-- each column is the only DB-level guard against invalid values — keep
-- it in sync with the C# enum by hand whenever a value is added/removed.
--
-- user_addresses.address_type / order_addresses.address_type      (AddressType)
--   1 = Billing, 2 = Shipping
--
-- users.status                                                    (UserStatus)
--   1 = Pending, 2 = Approved, 3 = Rejected, 4 = Suspended
--
-- order_items.packaging_unit_used                                 (PackagingUnit)
--   1 = Piece, 2 = Box, 3 = Package
--
-- orders.status / order_status_history.status                     (OrderStatus)
--   1 = Pending, 2 = Confirmed, 3 = Processing, 4 = Shipped,
--   5 = Delivered, 6 = Cancelled, 7 = Refunded
--
-- promotions.discount_type                                        (DiscountType)
--   1 = Percentage, 2 = FixedAmount
--
-- attribute_definitions.data_type                                 (AttributeDataType)
--   1 = Text, 2 = Number, 3 = Boolean, 4 = Date
--
-- company_contacts.contact_type                                   (ContactType)
--   1 = Phone, 2 = Email, 3 = Address, 4 = RegistrationNumber
--
-- import_batches.status                                           (ImportStatus)
--   1 = Pending, 2 = Running, 3 = Success, 4 = Failed, 5 = Partial
--
-- import_logs.status                                              (ImportRecordStatus)
--   1 = Success, 2 = Failed, 3 = Skipped
--
-- notification_log.status                                         (NotificationStatus)
--   1 = Pending, 2 = Sent, 3 = Failed
-- =====================================================================


-- =====================================================================
-- SECTION 2: USERS, ROLES & ACCESS CONTROL
-- =====================================================================

CREATE TABLE IF NOT EXISTS roles (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(30) NOT NULL UNIQUE,   -- 'admin', 'business'
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id                  BIGSERIAL PRIMARY KEY,
    role_id             SMALLINT NOT NULL REFERENCES roles(id),

    -- Required profile fields
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    business_name       VARCHAR(255),
    registration_number VARCHAR(50),
    vat_number          VARCHAR(50),
    phone               VARCHAR(30),
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    is_vat_exempt       BOOLEAN NOT NULL DEFAULT false,

    -- Business account approval workflow (UserStatus: see type code reference)
    status              SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (1,2,3,4)),
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    rejection_reason    VARCHAR(500),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CHECK constraints can't reference other tables (e.g. roles), so this rule
-- — business accounts must carry business_name/registration_number/vat_number —
-- is enforced here instead of a (disallowed) subquery-based CHECK constraint.
CREATE OR REPLACE FUNCTION enforce_business_required_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_role_name VARCHAR(30);
BEGIN
    SELECT name INTO v_role_name FROM roles WHERE id = NEW.role_id;

    IF v_role_name = 'business' THEN
        IF NEW.business_name IS NULL OR NEW.registration_number IS NULL OR NEW.vat_number IS NULL THEN
            RAISE EXCEPTION 'business_name, registration_number, and vat_number are required for business accounts';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_business_required_fields ON users;
CREATE TRIGGER trg_enforce_business_required_fields
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION enforce_business_required_fields();

CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role_id, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Multiple billing/shipping addresses per business account
CREATE TABLE IF NOT EXISTS user_addresses (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type  SMALLINT NOT NULL CHECK (address_type IN (1,2)),  -- AddressType
    label         VARCHAR(100),           -- e.g. "Warehouse #2"
    contact_name  VARCHAR(150),
    line1         VARCHAR(255) NOT NULL,
    line2         VARCHAR(255),
    city          VARCHAR(120) NOT NULL,
    region        VARCHAR(120),
    postal_code   VARCHAR(20) NOT NULL,
    country_code  CHAR(2) NOT NULL,
    phone         VARCHAR(30),
    is_default    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER trg_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id, address_type);

-- Ensures only one default address per (user, type)
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_default_address
    ON user_addresses(user_id, address_type)
    WHERE is_default = true;

-- Durable outbox for admin email notifications (e.g. new business registration)
CREATE TABLE IF NOT EXISTS notification_log (
    id               BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(80) NOT NULL,      -- 'business_registration_request', 'order_created_admin_alert', etc.
    recipient_email  VARCHAR(255) NOT NULL,
    related_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    related_order_id BIGINT,  -- FK added after orders table is created, see Section 6
    status           SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (1,2,3)),  -- NotificationStatus
    sent_at          TIMESTAMPTZ,
    error_message    VARCHAR(500),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);

-- Auto-enqueue an admin notification whenever a business account is created
CREATE OR REPLACE FUNCTION enqueue_business_registration_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 1 THEN -- UserStatus.Pending
        INSERT INTO notification_log (notification_type, recipient_email, related_user_id)
        SELECT 'business_registration_request', u.email, NEW.id
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE r.name = 'admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_admin_on_registration ON users;
CREATE TRIGGER trg_notify_admin_on_registration
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION enqueue_business_registration_notification();


-- =====================================================================
-- SECTION 3: PRODUCTS, CATALOG & INVENTORY METADATA
-- =====================================================================

CREATE TABLE IF NOT EXISTS brands (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    external_id VARCHAR(100) UNIQUE,
    logo_filename VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vat_rates (
    id         SMALLSERIAL PRIMARY KEY,
    rate       NUMERIC(5,2) NOT NULL CHECK (rate >= 0),   -- e.g. 21.00 for 21%
    label      VARCHAR(50) NOT NULL UNIQUE,                -- e.g. "Standard PVN"
    is_default BOOLEAN NOT NULL DEFAULT false,
    valid_from DATE NOT NULL DEFAULT current_date,
    valid_to   DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_vat_rate_default ON vat_rates(is_default) WHERE is_default = true;

-- Nested categories: Category -> Group -> Subgroup, plus admin-created
-- temporary/custom navigation nodes (e.g. "Special Offers")
CREATE TABLE IF NOT EXISTS categories (
    id            BIGSERIAL PRIMARY KEY,
    parent_id     BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(160) NOT NULL,
    description   TEXT,
    sort_order    INT NOT NULL DEFAULT 0,
    is_custom     BOOLEAN NOT NULL DEFAULT false,     -- admin-created temporary nav node
    show_in_menu  BOOLEAN NOT NULL DEFAULT true,
    active_from   TIMESTAMPTZ,                        -- optional time window for custom nodes
    active_to     TIMESTAMPTZ,
    external_id   VARCHAR(100) UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_category_not_self_parent CHECK (parent_id IS DISTINCT FROM id)
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_parent_slug ON categories(COALESCE(parent_id, 0), slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_menu ON categories(show_in_menu) WHERE show_in_menu = true;

CREATE TABLE IF NOT EXISTS products (
    id                 BIGSERIAL PRIMARY KEY,
    sku                VARCHAR(80) NOT NULL UNIQUE,
    external_id        VARCHAR(100) UNIQUE,             -- legacy DB sync key
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    base_price         NUMERIC(12,4) NOT NULL CHECK (base_price >= 0), -- price w/o VAT, per 1 piece
    vat_rate_id        SMALLINT NOT NULL REFERENCES vat_rates(id),
    brand_id           BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    ean                VARCHAR(20),

    -- Packaging units
    sold_by_piece      BOOLEAN NOT NULL DEFAULT true,
    pieces_per_box     INT CHECK (pieces_per_box IS NULL OR pieces_per_box > 0),
    pieces_per_package INT CHECK (pieces_per_package IS NULL OR pieces_per_package > 0),

    date_added         DATE NOT NULL DEFAULT current_date,
    is_active          BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_ean ON products(ean);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Many-to-many: a product can live in multiple categories, including
-- custom/temporary navigation nodes simultaneously with its real category.
CREATE TABLE IF NOT EXISTS product_categories (
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary  BOOLEAN NOT NULL DEFAULT false,
    sort_order  INT NOT NULL DEFAULT 0,     -- admin-managed manual display/export order within the category
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id, sort_order);

-- Auto-assign new products to the end of the category's current order,
-- so newly imported/added products don't collide at position 0 and admins
-- can freely rearrange via the grid afterwards.
CREATE OR REPLACE FUNCTION assign_next_product_sort_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sort_order = 0 THEN
        SELECT COALESCE(MAX(sort_order), 0) + 1 INTO NEW.sort_order
        FROM product_categories
        WHERE category_id = NEW.category_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_categories_sort_order ON product_categories;
CREATE TRIGGER trg_product_categories_sort_order
    BEFORE INSERT ON product_categories
    FOR EACH ROW EXECUTE FUNCTION assign_next_product_sort_order();

CREATE TABLE IF NOT EXISTS product_images (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    filename   VARCHAR(255) NOT NULL,
    alt_text   VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order);

-- Dynamic, category-scoped custom attributes (EAV pattern)
CREATE TABLE IF NOT EXISTS attribute_definitions (
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE, -- NULL = global attribute
    name        VARCHAR(100) NOT NULL,          -- e.g. "Age"
    data_type   SMALLINT NOT NULL DEFAULT 1 CHECK (data_type IN (1,2,3,4)),  -- AttributeDataType
    unit        VARCHAR(30),                    -- e.g. "years", "cm"
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (category_id, name)
);

CREATE TABLE IF NOT EXISTS product_attribute_values (
    id                     BIGSERIAL PRIMARY KEY,
    product_id             BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_definition_id BIGINT NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
    value_text             VARCHAR(500) NOT NULL,   -- e.g. "4+"; typed validation handled in app layer

    UNIQUE (product_id, attribute_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_pav_attribute ON product_attribute_values(attribute_definition_id);


-- =====================================================================
-- SECTION 4: PROMOTIONS / SALES
-- =====================================================================

CREATE TABLE IF NOT EXISTS promotions (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    discount_type  SMALLINT NOT NULL CHECK (discount_type IN (1,2)),  -- DiscountType
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    starts_at      TIMESTAMPTZ NOT NULL,
    ends_at        TIMESTAMPTZ NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_promotion_window CHECK (ends_at > starts_at)
);

DROP TRIGGER IF EXISTS trg_promotions_updated_at ON promotions;
CREATE TRIGGER trg_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_promotions_active_window ON promotions(is_active, starts_at, ends_at);

-- Targeting: category, brand, and/or specific business clients (any combination)
CREATE TABLE IF NOT EXISTS promotion_categories (
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    category_id  BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, category_id)
);

CREATE TABLE IF NOT EXISTS promotion_brands (
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    brand_id     BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, brand_id)
);

CREATE TABLE IF NOT EXISTS promotion_clients (
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promotion_clients_user ON promotion_clients(user_id);


-- =====================================================================
-- SECTION 5: WISHLIST
-- =====================================================================

CREATE TABLE IF NOT EXISTS wishlist_items (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);


-- =====================================================================
-- SECTION 6: ORDERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS orders (
    id              BIGSERIAL PRIMARY KEY,
    order_number    VARCHAR(40) NOT NULL UNIQUE,      -- human-facing reference, e.g. ORD-2026-000123
    user_id         BIGINT NOT NULL REFERENCES users(id),
    status          SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (1,2,3,4,5,6,7)),  -- OrderStatus
    currency        CHAR(3) NOT NULL DEFAULT 'EUR',
    subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    vat_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    placed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Frozen copy of billing & shipping address at time of purchase.
-- Deliberately NOT a FK-only reference to user_addresses, since those
-- rows can later be edited or deleted by the business account.
CREATE TABLE IF NOT EXISTS order_addresses (
    id                   BIGSERIAL PRIMARY KEY,
    order_id             BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    address_type         SMALLINT NOT NULL CHECK (address_type IN (1,2)),  -- AddressType
    source_address_id    BIGINT REFERENCES user_addresses(id) ON DELETE SET NULL, -- traceability only
    contact_name         VARCHAR(150),
    business_name        VARCHAR(255),
    registration_number  VARCHAR(50),
    vat_number           VARCHAR(50),
    line1                VARCHAR(255) NOT NULL,
    line2                VARCHAR(255),
    city                 VARCHAR(120) NOT NULL,
    region                VARCHAR(120),
    postal_code           VARCHAR(20) NOT NULL,
    country_code          CHAR(2) NOT NULL,
    phone                 VARCHAR(30),

    UNIQUE (order_id, address_type)
);

-- Line items: full price/VAT/packaging snapshot at time of purchase
CREATE TABLE IF NOT EXISTS order_items (
    id                     BIGSERIAL PRIMARY KEY,
    order_id               BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id             BIGINT REFERENCES products(id) ON DELETE SET NULL, -- traceability only

    -- Snapshots (authoritative — never re-derived from live product data)
    sku_snapshot           VARCHAR(80) NOT NULL,
    product_name_snapshot  VARCHAR(255) NOT NULL,
    brand_snapshot         VARCHAR(150),
    packaging_unit_used    SMALLINT NOT NULL CHECK (packaging_unit_used IN (1,2,3)),  -- PackagingUnit
    pieces_per_unit_snapshot INT NOT NULL DEFAULT 1 CHECK (pieces_per_unit_snapshot > 0),
    quantity               INT NOT NULL CHECK (quantity > 0),     -- quantity in packaging_unit_used
    unit_price_snapshot    NUMERIC(12,4) NOT NULL,                -- price w/o VAT, per single piece
    vat_rate_snapshot      NUMERIC(5,2) NOT NULL,

    -- Derived, stored for reporting speed and immutability
    line_subtotal          NUMERIC(12,2) NOT NULL,   -- qty * pieces_per_unit * unit_price
    line_vat_amount        NUMERIC(12,2) NOT NULL,
    line_total             NUMERIC(12,2) NOT NULL,

    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Keep orders.subtotal_amount / vat_amount / total_amount always in sync
-- with the sum of their order_items, so totals can never drift out of
-- sync with the line items that make them up.
CREATE OR REPLACE FUNCTION recalc_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    affected_order_id BIGINT;
BEGIN
    affected_order_id := COALESCE(NEW.order_id, OLD.order_id);

    UPDATE orders o
    SET subtotal_amount = COALESCE(t.subtotal, 0),
        vat_amount       = COALESCE(t.vat, 0),
        total_amount     = COALESCE(t.total, 0)
    FROM (
        SELECT
            SUM(line_subtotal)  AS subtotal,
            SUM(line_vat_amount) AS vat,
            SUM(line_total)      AS total
        FROM order_items
        WHERE order_id = affected_order_id
    ) t
    WHERE o.id = affected_order_id;

    RETURN NULL; -- AFTER trigger on order_items, no need to return a row
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalc_order_totals ON order_items;
CREATE TRIGGER trg_recalc_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION recalc_order_totals();

CREATE TABLE IF NOT EXISTS order_status_history (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     SMALLINT NOT NULL CHECK (status IN (1,2,3,4,5,6,7)),  -- OrderStatus
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    note       VARCHAR(500),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, changed_at);

-- Auto-log every status transition
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO order_status_history (order_id, status)
        VALUES (NEW.id, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_status_log ON orders;
CREATE TRIGGER trg_order_status_log
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- notification_log.related_order_id references this table; added here since
-- orders did not exist yet when notification_log was created in Section 2.
-- Guarded so re-running the script doesn't fail if the constraint already exists.
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notification_log_order'
    ) THEN
        ALTER TABLE notification_log
            ADD CONSTRAINT fk_notification_log_order
            FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enqueue notifications when a new order is placed:
--   - one row per admin, alerting them to the new order
--   - one row to the client, confirming their order was received
CREATE OR REPLACE FUNCTION enqueue_order_created_notifications()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_log (notification_type, recipient_email, related_user_id, related_order_id)
    SELECT 'order_created_admin_alert', u.email, NEW.user_id, NEW.id
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name = 'admin';

    INSERT INTO notification_log (notification_type, recipient_email, related_user_id, related_order_id)
    SELECT 'order_created_client_confirmation', u.email, u.id, NEW.id
    FROM users u
    WHERE u.id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_order_created ON orders;
CREATE TRIGGER trg_notify_on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION enqueue_order_created_notifications();


-- =====================================================================
-- SECTION 7: COMPANY CONTACTS (dynamic, admin-managed)
-- =====================================================================

CREATE TABLE IF NOT EXISTS company_contacts (
    id                  BIGSERIAL PRIMARY KEY,
    contact_type        SMALLINT NOT NULL CHECK (contact_type IN (1,2,3,4)),  -- ContactType
    label               VARCHAR(100),              -- e.g. "Support Line", "Head Office"

    -- Used for phone / email / registration_number types
    value_text          VARCHAR(255),

    -- Used for address type
    line1               VARCHAR(255),
    line2               VARCHAR(255),
    city                VARCHAR(120),
    region              VARCHAR(120),
    postal_code         VARCHAR(20),
    country_code        CHAR(2),

    is_primary          BOOLEAN NOT NULL DEFAULT false,
    is_active            BOOLEAN NOT NULL DEFAULT true,
    sort_order           INT NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_contact_value CHECK (
        (contact_type = 3 AND line1 IS NOT NULL)        -- 3 = Address
        OR (contact_type <> 3 AND value_text IS NOT NULL)
    )
);

DROP TRIGGER IF EXISTS trg_company_contacts_updated_at ON company_contacts;
CREATE TRIGGER trg_company_contacts_updated_at
    BEFORE UPDATE ON company_contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_company_contacts_type ON company_contacts(contact_type, is_active);


-- =====================================================================
-- SECTION 8: IMPORT / SYNC LOGGING (legacy DB integration)
-- =====================================================================

CREATE TABLE IF NOT EXISTS import_batches (
    id             BIGSERIAL PRIMARY KEY,
    batch_uuid     UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    source_system  VARCHAR(100) NOT NULL,       -- e.g. "legacy_erp"
    entity_type    VARCHAR(50) NOT NULL,        -- e.g. "products", "categories"
    status         SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (1,2,3,4,5)),  -- ImportStatus
    total_records  INT NOT NULL DEFAULT 0,
    success_count  INT NOT NULL DEFAULT 0,
    failure_count  INT NOT NULL DEFAULT 0,
    triggered_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at    TIMESTAMPTZ,
    notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status, started_at DESC);

CREATE TABLE IF NOT EXISTS import_logs (
    id                 BIGSERIAL PRIMARY KEY,
    batch_id           BIGINT NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
    entity_type        VARCHAR(50) NOT NULL,
    external_id        VARCHAR(100),
    internal_record_id BIGINT,                 -- resulting local PK, if successful
    status             SMALLINT NOT NULL CHECK (status IN (1,2,3)),  -- ImportRecordStatus
    error_message      VARCHAR(1000),
    payload            JSONB,                  -- raw source record for debugging/reprocessing
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_logs_batch ON import_logs(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_import_logs_external_id ON import_logs(external_id);


-- =====================================================================
-- SECTION 9: SEED DATA (minimal bootstrap)
-- =====================================================================

INSERT INTO roles (name, description) VALUES
    ('admin', 'Full data management capabilities'),
    ('business', 'Approved B2B client account')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vat_rates (rate, label, is_default) VALUES
    (21.00, 'Standard PVN', true),
    (0.00, 'VAT Exempt', false)
ON CONFLICT (label) DO NOTHING;

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
