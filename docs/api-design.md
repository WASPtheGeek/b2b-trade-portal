# Elkaro / b2b-trade-portal — API Design

**Date:** 2026-08-29
**Scope:** ASP.NET Core Web API design for the B2B wholesale portal (server-side of the `b2b-trade-portal` repo)

## 0. What I reviewed before designing this

I looked at `/media/margarita/recovery/Projects/b2b-trade-portal` directly rather than designing in a vacuum:

- **`src/server`** is currently the untouched `dotnet new webapi` scaffold — `Program.cs` still returns `WeatherForecast`, no `Controllers/`, `Models/`, or `DbContext` exist yet. `server.csproj` targets **`net8.0`** with EF Core 8 + `Npgsql.EntityFrameworkCore.PostgreSQL` + Swashbuckle already referenced. (Note: `README.md` says **.NET 9** — the `.csproj` says **net8.0**. Worth confirming which is correct before scaffolding controllers.)
- **`src/client`** is a real Next.js app that already *fixes part of the API contract*, even though the backend doesn't implement it yet:
  - `services/auth.ts`, `services/orders.ts`, `services/products.ts` call concrete routes.
  - `types/{product,order,user}.ts` define the exact shapes the frontend expects back.
  - `lib/api.ts` is a thin fetch wrapper: JSON body, `Authorization: Bearer <token>`, throws on non-2xx with whatever JSON body comes back.
  - Pages exist (with TODOs) for login, register (invite-gated), checkout, profile/order-history, and three admin screens: CSV import, users/invites, orders.

So this design treats those files as **existing contract, not a clean slate** — I've designed to match them where they already commit to a shape, and called out explicitly where your requested scope (companies/buyers, promotions, invoicing, fulfillment) requires extending or occasionally breaking that early contract.

Concretely, the frontend already assumes these routes exist:

| Route (from `services/*.ts`) | Used by |
|---|---|
| `POST /api/auth/login` | `authService.login` |
| `POST /api/auth/register` | `authService.register` |
| `GET /api/auth/me` | `authService.me` |
| `POST /api/auth/invites` | `authService.createInvite` (admin/users page) |
| `GET /api/orders` | `ordersService.listForCurrentUser` |
| `GET /api/admin/orders` | `ordersService.listAll` (admin/orders page) |
| `GET /api/orders/{id}` | `ordersService.getById` |
| `POST /api/orders` | `ordersService.create` (checkout page) |
| `GET /api/products` | `productsService.list` |
| `GET /api/products/{id}` | `productsService.getById` (product detail page) |
| `GET /api/categories/{slug}/products` | `productsService.getByCategorySlug` |
| `POST /api/admin/products/import` | referenced directly in a TODO comment in `CsvUploader` |

Everything below is designed around these.

---

## 1. Requirements

### Functional (confirmed with you)
- Public catalog browsing, **no prices for guests** (per `README.md`: "Guest: browse titles, categories, images without prices").
- Invite-only B2B registration; once authenticated, buyers see dynamic/hidden pricing and choose a packaging unit (**pcs / pack / box**).
- **Company accounts with multiple buyer users**, roles, and (per your scope) approval workflows — this is new relative to today's flat `User.role: guest|client|admin`.
- Quotes → orders → checkout.
- Invoicing, payment terms, fulfillment/shipping, returns.
- Admin CSV/XLSX catalog import with columns: `EAN, Nosaukums, Zīmols, Cena, gb, iep., kaste, Apraksts, Katalogs, Grupa, apakšgrupa`.
- Admin-managed promotions.

### Non-functional (assumed — flag if wrong)
- Small team, pre-launch — optimize for a single deployable Web API + Postgres, not microservices.
- Invite-only means low guest traffic; no need for CDN/edge caching on day one, but the catalog list endpoint should support paging from the start since wholesale catalogs get large fast.
- CSV/XLSX imports can be large (thousands of SKUs) — must not block the request thread.
- JWT bearer auth (your choice), matching the `Authorization: Bearer` header `lib/api.ts` already sends.

### Constraints
- .NET 8 (per `.csproj`) / PostgreSQL / EF Core / Swagger already wired.
- Three frontend service files already commit to route shapes (table above) — changing them is a coordinated change, not a free one.

---

## 2. High-level architecture

```
                         HTTPS + JSON (Bearer JWT)
 Next.js (SSR/ISR)  ───────────────────────────────►  ASP.NET Core Web API
                                                          │
                                                          ├─ ASP.NET Core Identity (users, roles, invites)
                                                          ├─ EF Core ──► PostgreSQL
                                                          ├─ Background job host ──► CSV/XLSX import jobs
                                                          ├─ Email sender (invites, quote/order emails, invoices)
                                                          └─ File storage (uploaded price lists, invoice PDFs)
```

Single Web API project (as scaffolded), organized as **attribute-routed Controllers** grouped by feature — the README already documents a `Controllers/` + `Models/` layout, so I'd keep growing that rather than a giant `Program.cs` of minimal APIs. Suggested controller grouping:

`AuthController`, `InvitesController`, `CompaniesController`, `CategoriesController`, `ProductsController`, `Admin/ProductsController`, `Admin/ImportController`, `PricingController` (+ `Admin/PriceListsController`), `PromotionsController` (+ `Admin/PromotionsController`), `OrdersController` (+ `Admin/OrdersController`), `InvoicesController`, `Admin/ReturnsController`.

---

## 3. Domain model (ERD, ASCII)

```
Company ──1───N── User            [role: buyer | company_admin | admin]  (Company is NEW)
   │                 │
   │                 └── InviteLink (token, email?, expiresAt, usedAt?)  [existing shape]
   │
   ├──1───N── Order ──1───N── OrderItem ──N───1── Product
   │             │
   │             ├──0..1── Invoice ──1───N── Payment
   │             ├──0..1── Shipment
   │             └──1───N── ReturnRequest
   │
   ├──N───1── PriceList ──1───N── PriceListItem ──N───1── Product   (company-specific / tier pricing)
   │
Product ──N───1── Category (self-referencing: Catalog → Group → Subgroup)   (hierarchy is NEW)
Product ──1───N── ProductPackagingOption [unit: pcs|pack|box, factor, price?]   [existing shape]

Promotion ──N───N── (Product | Category | Company)   [scope]

ImportJob ──1───N── ImportRowError
```

Two deliberate departures from today's frontend types, both additive:

1. **`Company` entity.** Today `User` just has an optional `companyName: string`. To support multi-user buyer accounts with roles and approval, `User` needs a `CompanyId` FK, and a real `Company` table needs to hold billing/credit/payment-terms/assigned-price-list data. `companyName` can stay as a denormalized display fallback.
2. **Category hierarchy.** Today `ProductCategory` is flat (`id, slug, name`). Your CSV has three levels (`Katalogs > Grupa > apakšgrupa`). I'd add `parentId?` and a `level: "catalog" | "group" | "subgroup"` — additive to the existing shape, so `CategoryTree`/`TechnicalProductTable` don't break.

---

## 4. API endpoint catalog

`[existing]` = frontend already calls this exact route. `[new]` = needed for your requested scope but not yet referenced by the client code I found.

### 4.1 Auth & invitations

| Method & route | Auth | Body → Response | Notes |
|---|---|---|---|
| `POST /api/auth/register` | Anonymous + valid `inviteToken` | `{inviteToken, email, password, companyName?}` → `{token, user}` | `[existing]` — matches `RegisterPayload`/`LoginResponse` exactly |
| `POST /api/auth/login` | Anonymous | `{email, password}` → `{token, user}` | `[existing]` |
| `GET /api/auth/me` | Bearer | → `User` | `[existing]` |
| `POST /api/auth/invites` | Bearer (Admin) | `{email?}` → `InviteLink` | `[existing]` — matches `authService.createInvite` |
| `GET /api/auth/invites` | Bearer (Admin) | → `InviteLink[]` | `[new]` — the admin/users page has a placeholder for "Existing Users"; this plus the users list below fills it |
| `DELETE /api/auth/invites/{id}` | Bearer (Admin) | 204 | `[new]` — revoke an unused invite |
| `GET /api/auth/invites/{token}/validate` | Anonymous | → `{valid, email?, expiresAt}` | `[new]` — lets the register page show a friendly error/pre-fill instead of failing only on submit |
| `POST /api/auth/refresh` / `POST /api/auth/logout` | Bearer | — | `[new, optional]` — only needed once you move to short-lived access tokens + refresh tokens; fine to skip for MVP with a longer-lived JWT |

### 4.2 Companies & buyers (new — this is what "multi-user buyers" needs)

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/admin/companies` | Admin | list/search all companies |
| `POST /api/admin/companies` | Admin | create company: name, reg. no., VAT id, billing address, payment terms (e.g. Net 30), credit limit, assigned price list |
| `GET /api/admin/companies/{id}` | Admin | |
| `PUT /api/admin/companies/{id}` | Admin | |
| `PATCH /api/admin/companies/{id}/status` | Admin | active / suspended |
| `GET /api/companies/me` | Bearer (any company user) | the caller's own company profile |
| `GET /api/admin/companies/{id}/users` | Admin | |
| `POST /api/admin/companies/{id}/users/invite` | Admin or `company_admin` (own company) | reuses the invite mechanism, pre-scoped to a company with role `buyer` |
| `PATCH /api/admin/companies/{id}/users/{userId}/role` | Admin or `company_admin` (own) | promote/demote `buyer` ↔ `company_admin` |
| `DELETE /api/admin/companies/{id}/users/{userId}` | Admin or `company_admin` (own) | remove a buyer |

### 4.3 Categories

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/categories` | Anonymous | `[new]` — flat list with `parentId`/`level` so the client can build the tree itself |
| `GET /api/categories/{slug}` | Anonymous | `[new]` |
| `GET /api/categories/{slug}/products` | Anonymous / Bearer | `[existing]` — matches `productsService.getByCategorySlug` |
| `POST /api/admin/categories`, `PUT .../{id}`, `DELETE .../{id}` | Admin | `[new]` CRUD |

### 4.4 Products

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/products?category=&brand=&search=&page=&pageSize=` | Anonymous / Bearer | `[existing route, extended params]` — keep returning a plain `Product[]` (don't break the existing type) and add an `X-Total-Count` response header for paging, rather than wrapping the body in an envelope right now |
| `GET /api/products/{id}` | Anonymous / Bearer | `[existing]` |
| `GET /api/products/by-ean/{ean}` | Anonymous / Bearer | `[new]` — barcode lookup, useful for a future "paste EAN + qty" bulk-add flow |
| `POST /api/admin/products`, `PUT .../{id}`, `DELETE .../{id}` (soft delete → `discontinued`), `PATCH .../{id}/status` | Admin | `[new]` CRUD |

**Price visibility rule (server-side, not client-side):** `Product.price` and `ProductPackagingOption.price` should be nulled out by the API itself for anonymous callers, based on the authenticated principal — never rely on the frontend to hide a field that's already in the payload. Today's `BaseProduct.price` is typed as required/always-present while `ProductPackagingOption.price` is explicitly commented "only visible to authenticated B2B clients" — that's an inconsistency worth resolving; my recommendation is to make **both** optional and null them for guests, matching the README's "browse without prices" behaviour, unless you want guests to see an indicative "from €X" price.

### 4.5 Catalog import (CSV/XLSX)

| Method & route | Auth | Notes |
|---|---|---|
| `POST /api/admin/products/import` (multipart) | Admin | `[existing]` — exact route named in the `CsvUploader` TODO. Returns `202 Accepted` + `{jobId}` immediately; processing happens in the background (see §5). |
| `GET /api/admin/products/import/{jobId}` | Admin | `[new]` → `{status, totalRows, processedRows, createdCount, updatedCount, errorCount}` |
| `GET /api/admin/products/import/{jobId}/errors` | Admin | `[new]` — per-row error report |
| `GET /api/admin/products/import/history` | Admin | `[new]` — past import jobs |

### 4.6 Pricing (contract / tiered pricing)

Resolved price is a **serialization concern inside the Products endpoints**, not a separate call the client has to make (avoids N+1 round-trips: catalog page renders 50 products, you don't want 50 pricing calls). The admin surface for *managing* the price lists is separate:

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/admin/price-lists`, `POST /api/admin/price-lists` | Admin | `[new]` |
| `PUT /api/admin/price-lists/{id}`, `DELETE .../{id}` | Admin | `[new]` |
| `POST /api/admin/price-lists/{id}/items` | Admin | `[new]` bulk upsert of per-product overrides |
| `POST /api/admin/companies/{id}/price-list` | Admin | `[new]` assign a company to a price list/tier |

### 4.7 Promotions

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/promotions/active` | Bearer | `[new]` — promotions eligible for the caller's company right now |
| `GET /api/admin/promotions`, `POST /api/admin/promotions` | Admin | `[new]` — type (percentage/fixed), scope (product/category/brand/company-tier), date range |
| `PUT /api/admin/promotions/{id}`, `DELETE .../{id}`, `PATCH .../{id}/status` | Admin | `[new]` |

### 4.8 Orders / quote workflow / checkout

Your checkout page copy already frames this as a quote-first flow: *"submit your quote request — our team will confirm pricing and availability by email."* Today's `Order` model (`status: pending|processing|completed|cancelled`) already fits that: `pending` **is** the quote request. I'd keep this single-entity model rather than introducing a separate `Quote` object — see the trade-off in §7.

| Method & route | Auth | Notes |
|---|---|---|
| `POST /api/orders` | Bearer | `[existing route]` — **but change what the server trusts.** The current `CreateOrderPayload` is just `{items: OrderItem[]}`, and `OrderItem` already carries `productName`, `sku`, `unitPrice` from the client. Don't persist client-supplied price/name — accept only `{productId, unit, quantity}[]` and resolve name/sku/price/promotions server-side, then snapshot them onto the order. Otherwise a buyer can submit their own price. |
| `GET /api/orders` | Bearer (own) | `[existing]` |
| `GET /api/admin/orders` | Admin | `[existing]` |
| `GET /api/orders/{id}` | Bearer (owner, same-company user, or Admin) | `[existing]` |
| `PATCH /api/admin/orders/{id}/status` | Admin | `[new]` — `pending → processing` (quote confirmed, final pricing set) `→ completed`, or `→ cancelled` |
| `POST /api/orders/{id}/cancel` | Bearer (owner, only while `pending`) | `[new]` |
| `POST /api/orders/{id}/reorder` | Bearer | `[new]` — clone a `completed` order into a new `pending` one |
| `POST /api/orders/{id}/submit-for-approval` | `buyer` | `[new, only if Company.requiresOrderApproval]` |
| `POST /api/orders/{id}/approve` / `POST /api/orders/{id}/reject-approval` | `company_admin` (same company) | `[new]` |

### 4.9 Invoicing & payments

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/invoices` | Bearer (own company) | `[new]` |
| `GET /api/invoices/{id}`, `GET /api/invoices/{id}/pdf` | Bearer (own company) or Admin | `[new]` |
| `POST /api/admin/orders/{id}/invoice` | Admin | `[new]` — generate once an order is `completed` |
| `PATCH /api/admin/invoices/{id}/status` | Admin | `[new]` — `paid` / `overdue` / `void` |
| `GET /api/admin/companies/{id}/credit`, `PATCH .../credit` | Admin | `[new]` — credit limit, outstanding balance, payment terms |

### 4.10 Fulfillment, shipping, returns

| Method & route | Auth | Notes |
|---|---|---|
| `GET /api/orders/{id}/shipment` | Bearer (owner) or Admin | `[new]` |
| `PATCH /api/admin/orders/{id}/shipment` | Admin | `[new]` — carrier, tracking number, status |
| `POST /api/orders/{id}/returns` | Bearer (owner) | `[new]` |
| `GET /api/admin/returns`, `PATCH /api/admin/returns/{id}/status` | Admin | `[new]` |

---

## 5. CSV/XLSX import design

**Column mapping** (based on the headers you gave me — a couple need confirming against a real sample row):

| Column (LV) | Meaning | Maps to | Confidence |
|---|---|---|---|
| `EAN` | Barcode | `Product.Ean` — unique, used as the upsert key | High |
| `Nosaukums` | Name | `Product.Name` | High |
| `Zīmols` | Brand | `Product.Brand` | High |
| `Cena` | Price | `Product.BasePrice` (price for the base/pcs unit, before promotions or contract pricing) | High |
| `gb` | — | Likely "gab." (pieces) — confirm whether this is a constant base-unit marker or a real quantity field | **Confirm with a sample row** |
| `iep.` | "iepakojums" (pack) | `ProductPackagingOption(unit: pack, factor)` — pieces per pack | Medium |
| `kaste` | Box | `ProductPackagingOption(unit: box, factor)` — pieces per box | Medium |
| `Apraksts` | Description | `Product.Description` | High |
| `Katalogs` | Top-level catalog | `Category(level: catalog)` | High |
| `Grupa` | Group | `Category(level: group, parent: catalog)` | High |
| `apakšgrupa` | Subgroup | `Category(level: subgroup, parent: group)` — the product's direct category | High |

**Processing pipeline:** upload → store the file → enqueue a background job (an `IHostedService`/`Channel<T>` queue is enough at this scale; move to Hangfire/Quartz only if jobs must survive an app restart) → parse with `CsvHelper` (CSV) / `ClosedXML` (XLSX) → validate each row → upsert by `EAN` → record per-row errors → `CsvUploader` polls `GET /api/admin/products/import/{jobId}` for status. This has to be async — a real supplier price list can run into the thousands of rows, and a synchronous request risks a timeout and freezes the admin UI while it waits.

---

## 6. Cross-cutting conventions

- **Auth:** Bearer JWT via `[Authorize]` + policy-based authorization (`RequireRole("admin")`, a custom `SameCompany` requirement for resource ownership checks on orders/invoices/companies). Matches `lib/api.ts` exactly as-is.
- **Errors:** adopt ASP.NET Core's built-in `ProblemDetails` (RFC 7807) for all 4xx/5xx — the client already types the error body as `unknown` in `ApiError`, so this is a free upgrade, not a breaking change.
- **Pagination:** query params (`page`, `pageSize`) + `X-Total-Count` header, response body stays a plain array. This avoids breaking `Product[]`/`Order[]` today; only move to an envelope (`{items, total, page}`) if/when you cut a deliberate v2.
- **Versioning:** none for now — the three existing service files call unversioned `/api/...` paths, and introducing `/api/v1/...` today would be a pure breaking change for no benefit yet. Revisit if/when a genuinely breaking change is needed.
- **Server trusts nothing the client can lie about:** prices, names, SKUs, and promotion eligibility are always resolved server-side at write time (see the `POST /api/orders` note in §4.8).

---

## 7. Trade-offs

| Decision | Why |
|---|---|
| REST (not GraphQL) | Matches the fetch-based client already written in `services/*.ts` and the Swagger tooling already referenced in `Program.cs`; GraphQL would mean discarding that. |
| Controllers over Minimal APIs | `README.md` already documents a `Controllers/` + `Models/` structure; controllers also give you `[Authorize(Policy=...)]` attributes and easier testing as the surface grows past a handful of routes. |
| Order-status-as-quote vs. a separate `Quote` entity | Keeping `Order.status = pending` as the quote stage matches what the scaffold and checkout copy already imply, and is simpler. **Revisit** if you need multi-round quote negotiation (counter-offers, multiple quote versions per request) — that genuinely needs its own entity. |
| Introduce `Company` now, not later | It's a small additive change today (nothing depends on the flat `User.companyName` yet); retrofitting it after Orders/Invoices/Approvals already reference `User` directly would be far more painful. |
| Async CSV/XLSX import | A blocking synchronous import risks request timeouts on real supplier price lists and locks up the admin screen; a job + polling pattern costs one extra round trip but scales safely. |
| No `/api/v1` prefix yet | Three service files already call unversioned routes; adding a prefix now is a breaking change for zero current benefit. |

---

## 8. Open questions to confirm

1. `.csproj` targets `net8.0`, `README.md` says .NET 9 — which is correct?
2. OK to introduce a `Company` entity now (additive to `User`), given it's needed for multi-user buyer accounts + approval workflows you asked for?
3. Keep quotes as `Order.status = pending` (matches current checkout copy) or do you actually need multi-round quote negotiation with its own entity?
4. Should guests see **no** price at all, or an indicative "from €X"? (`BaseProduct.price` is currently typed as always-present; `packagingOptions[].price` is explicitly commented B2B-only — these two disagree today.)
5. Can you share one real sample row of the price-list file? I want to confirm what `gb` actually holds before locking the import mapping.

## 9. Suggested build order

1. Identity + JWT + invite-only registration, matching `auth.ts` exactly — bring in `Company` from the start rather than bolting it on later.
2. Categories (3-level) + Products CRUD + the server-side price-visibility rule.
3. CSV/XLSX import (async job + status polling).
4. Orders/checkout matching the existing `checkout.tsx` copy (quote-first flow) + admin status transitions.
5. Promotions + price lists (contract/tiered pricing).
6. Invoicing, credit/payment terms, shipment tracking, returns.

## 10. What I'd revisit as this grows

- Move import processing to a durable queue (Hangfire, or a cloud queue) once it needs to survive restarts or run across more than one API instance.
- Add response caching in front of `GET /api/products` once public catalog traffic actually grows — low priority while access is invite-only.
- Split "admin" into narrower policies (e.g. a warehouse-only role for fulfillment) once more back-office roles appear beyond a single `admin`.
- Introduce a real pagination envelope and path-based versioning (`/api/v2`) the first time you need a genuinely breaking change — don't do it preemptively.
