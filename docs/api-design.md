# Elkaro / b2b-trade-portal — API Design

**Date:** 2026-08-29
**Scope:** ASP.NET Core Web API design for the B2B wholesale portal (server-side of the `b2b-trade-portal` repo)

Routes for the FE:
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


High-level architecture

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

CSV/XLSX import design

**Column mapping**

| Column (LV) | Meaning | Maps to | Confidence |
|---|---|---|---|
| `EAN` | Barcode | `Product.Ean` — unique, used as the upsert key | High |
| `Nosaukums` | Name | `Product.Name` | High |
| `Zīmols` | Brand | `Product.Brand` | High |
| `Cena` | Price | `Product.BasePrice` (price for the base/pcs unit, before promotions or contract pricing) | High |
| `gb` | — | Likely "gab." (pieces) — confirm whether this is a constant base-unit marker or a real quantity field |
| `iep.` | "iepakojums" (pack) | `ProductPackagingOption(unit: pack, factor)` — pieces per pack | Medium |
| `kaste` | Box | `ProductPackagingOption(unit: box, factor)` — pieces per box | Medium |
| `Apraksts` | Description | `Product.Description` | High |
| `Katalogs` | Top-level catalog | `Category(level: catalog)` | High |
| `Grupa` | Group | `Category(level: group, parent: catalog)` | High |
| `apakšgrupa` | Subgroup | `Category(level: subgroup, parent: group)` — the product's direct category | High |

TODO's:
- Add response caching in front of `GET /api/products` once public catalog traffic actually grows — low priority while access is invite-only
