-- =====================================================================
-- Migration 2026-10-10: admin settings
-- =====================================================================
-- Adds the app_settings table (SECTION 8b of b2b_ecommerce_schema.sql) and seeds it with the
-- default settings. Safe to re-run: existing settings rows are never overwritten.
--
--   psql -h localhost -U postgres -d elkaro_db -f migrations/2026-10-10_import-and-settings.sql
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS app_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Initial records - the app's defaults. Keys are camelCase, as the server reads them.
INSERT INTO app_settings (key, value) VALUES
    ('import.columns', '{
        "ean": "EAN",
        "name": "Nosaukums",
        "brand": "Zīmols",
        "price": "Cena",
        "soldByPiece": "gb",
        "piecesPerPackage": "iep.",
        "piecesPerBox": "kaste",
        "description": "Apraksts",
        "catalog": "Katalogs",
        "group": "Grupa",
        "subgroup": "apakšgrupa"
    }'),
    ('admin.display', '{
        "stickyActionsColumn": true
    }')
ON CONFLICT (key) DO NOTHING;

COMMIT;
