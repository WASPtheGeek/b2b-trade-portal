# Elkaro

**A B2B wholesale ordering portal — private catalog, dynamic pricing, and quote-based checkout for approved business customers.**

### 🚧 Build Progress

```
Overall                          ███████░░░░░░░░░░░░░  39%

BACKEND
  Architecture & Planning        ████████████████████ 100%
  Database Architecture          ████████████████████ 100%
  Environment Setup              ███████░░░░░░░░░░░░░  35%
  Authentication & Authorization ████████████░░░░░░░░  60%
  Product Catalog                ████████████░░░░░░░░  60%
  Catalog Import (CSV/XLSX)      ███████████████░░░░░  75%
  Orders & Checkout              █████████████░░░░░░░  65%
  Promotions & Pricing           ██████████░░░░░░░░░░  50%
  Fulfillment                    ░░░░░░░░░░░░░░░░░░░░   0%

FRONTEND
  UI/UX Design                   ░░░░░░░░░░░░░░░░░░░░   0%
  Admin Panel                    ░░░░░░░░░░░░░░░░░░░░   0%
  Customer Storefront            ░░░░░░░░░░░░░░░░░░░░   0%

LAUNCH & DEPLOYMENT
  Infrastructure Setup           ░░░░░░░░░░░░░░░░░░░░   0%
  Production Deployment          ░░░░░░░░░░░░░░░░░░░░   0%
```

*Every backend percentage above 35% reflects a first-draft implementation that has not yet been compiled or run — a manual, file-by-file code review is in progress in the meantime (see [Project Status & Roadmap](#project-status--roadmap)). Full breakdown below.*

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Status & Roadmap](#project-status--roadmap)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Elkaro is a purpose-built ordering portal for businesses that sell to other businesses at wholesale scale — catalogs running into the thousands of SKUs, pricing that only makes sense to a logged-in trade customer, and an ordering process that ends in a confirmed quote rather than an instant online payment.

## Key Features

**Public storefront** — Guests can browse the full catalog (titles, categories, images) with no login and no pricing shown, so the catalog can be shared and searched freely without exposing trade pricing.

**Business accounts, admin-approved** — New business accounts are currently modeled as self-registration followed by admin review (approve/reject/suspend/reactivate), keeping the customer base to genuine trade partners.

**Dynamic, hidden-by-default pricing** — Prices and packaging pricing are resolved and shown only to authenticated accounts; the API itself withholds pricing data from anonymous requests rather than relying on the storefront to hide it.

**Flexible packaging units** — Every product can be ordered by the individual piece, by pack, or by box, matching how the client's suppliers actually package stock. Some products are pack- or box-only, and the catalog enforces that.

**Quote-request checkout, not a payment gateway** — Placing an order submits a request; there is no online payment step. The Elkaro team reviews, confirms pricing and availability, and fulfills the order outside the checkout flow.

**Manual catalog import from ERP exports** — Administrators upload a CSV or Excel file exported directly from the client's existing accounting/ERP system to add or update thousands of products at once, with per-row validation and error reporting.

**Category-based navigation** — A three-level category hierarchy (Catalog → Group → Subgroup) drives both browsing and the CSV import mapping, plus admin-managed temporary/promotional navigation nodes.

**Promotions** — Administrators can run percentage or fixed-amount promotions scoped to a category, a brand, specific customers, or storefront-wide.

**Admin back office** — Screens for managing the catalog, imports, customer accounts, and orders, without needing direct database access.

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (React, TypeScript) | App Router; server-rendered/static catalog pages, client-side cart and pricing interactions |
| UI | Tailwind CSS, shadcn/ui, TailAdmin | Component primitives and admin layout patterns |
| Data tables | TanStack Table | Virtualized scrolling for catalog views with thousands of rows |
| Backend | ASP.NET Core Web API (.NET 10 LTS) | REST API — authentication, business logic, catalog import, email notifications |
| Database | PostgreSQL 14+ | Accessed via Entity Framework Core / Npgsql |
| Local development | Docker Desktop, DBeaver / pgAdmin | Containerized Postgres and API for local dev |
| Hosting | Single VPS (e.g. Hetzner, DigitalOcean) | Docker Engine/Compose, Ubuntu Server, Nginx or Caddy, Let's Encrypt SSL |

The full stack is built on free, open-source software end to end — the only recurring cost is the server itself.

## Architecture

Elkaro is a monorepo with a clear split between the public/customer-facing frontend and the backend API that owns all business logic and data access:

```
                         HTTPS + JSON (Bearer JWT)
 Next.js (SSR/ISR)  ───────────────────────────────►  ASP.NET Core Web API
                                                          │
                                                          ├─ Identity, roles & account approval workflow
                                                          ├─ EF Core ──► PostgreSQL
                                                          ├─ Background job host ──► CSV/XLSX import jobs
                                                          ├─ Email sender ──► order/quote confirmations (outbox drain still pending)
                                                          └─ File storage ──► uploaded price lists
```

A few architectural decisions worth calling out:

- **Pricing is never trusted from the client.** Every price, SKU, and name used in an order is resolved and stamped on the server at the moment of purchase — never accepted as-is from a request body.
- **Orders are immutable snapshots.** Once placed, an order freezes the price, VAT rate, packaging, and address in use at that moment, so later catalog or account edits can never silently rewrite order history.
- **One business account, one login.** Each customer account represents a single person rather than a multi-user company with internal approval chains — kept intentionally simple to match how these accounts are actually used.
- **A quote is just an order in its earliest state.** Rather than a separate quote-negotiation system, a submitted order starts in `Pending` status and moves through the schema's real 7-state `OrderStatus` enum (`Pending → Confirmed → Processing → Shipped → Delivered`, or `Cancelled`/`Refunded`) — there's no multi-round back-and-forth to support.

## Project Status & Roadmap

**Current phase:** architecture and design are complete, and a first-draft backend implementation now covers auth, product catalog, catalog import, orders, and promotions (delivered 2026-08-29). **None of this backend code has been compiled or run yet** — the sandbox it was written in had no .NET SDK or network access. In the meantime, the delivered code is being validated by manual, file-by-file review before the build attempt; validated so far: the EF Core `DbContext`, `Program.cs` (startup/DI configuration), and the audit logging code (`import_batches`/`import_logs` persistence). Controllers, services, and the remaining models are still to be reviewed. The single most important next step is still running `dotnet restore && dotnet build` and fixing whatever the compiler finds; nothing below is fully verified until that happens. This section is kept current as development progresses.

### 🖥️ Backend

| Subcategory | Status |
|---|---|
| Architecture & Planning | 🟢 Completed |
| Database Architecture | 🟢 Completed |
| Environment Setup | 🟡 In Progress — manual code review underway (DbContext, Program.cs, audit logging validated so far) |
| Authentication & Authorization | 🟡 In Progress — first draft implemented, untested |
| Product Catalog | 🟡 In Progress — first draft implemented, untested |
| Catalog Import (CSV/XLSX) | 🟡 In Progress — first draft implemented, untested |
| Orders & Checkout | 🟡 In Progress — first draft implemented, untested |
| Promotions & Pricing | 🟡 In Progress — promotions implemented (untested); contract price lists not started |
| Fulfillment | 🔴 Not Started — routes stubbed (`501`), no backing tables yet |

### 💻 Frontend

| Subcategory | Status |
|---|---|
| UI/UX Design | 🔴 Not Started |
| Admin Panel | 🔴 Not Started |
| Customer Storefront | 🔴 Not Started |

> Frontend work is deliberately sequenced *after* the backend, so it's built against a finished, **verified** API rather than a moving target. Any code currently in this repository's frontend folder is early exploratory/test work and does not reflect the final application.

### 🚀 Launch & Deployment

| Subcategory | Status |
|---|---|
| Infrastructure Setup | 🔴 Not Started |
| Production Deployment | 🔴 Not Started |

<details>
<summary><strong>Full task breakdown</strong> (click to expand)</summary>

#### Backend

**Architecture & Planning — 🟢 Completed**
- [x] Functional requirements confirmed (guest browsing, business-account approval, packaging hierarchy, quote checkout, manual catalog import)
- [x] Technology stack selected
- [x] Full API design completed and all open design questions resolved

**Database Architecture — 🟢 Completed**
- [x] Full production PostgreSQL schema designed — accounts, catalog, categories, custom attributes, promotions, orders with full snapshotting, notification outbox, import audit logging

**Environment Setup — 🟡 In Progress**
- [x] Backend project retargeted to .NET 10 (current LTS) with dependencies updated
- [x] EF Core `DbContext` and entity classes written against the hand-written schema (2026-08-29, part of the first-draft server code)
- [x] Manual code review — `Data/` (`DbContext`) validated
- [x] Manual code review — `Program.cs` (startup/DI configuration) validated
- [x] Manual code review — audit logging (`import_batches`/`import_logs` persistence) validated
- [ ] Manual code review — remaining controllers, services, and models (in progress)
- [ ] Local database environment provisioned (Docker Compose)
- [ ] Generate/apply an EF Core migration if migrations (rather than the `.sql` file) should own the schema going forward, and confirm it matches exactly
- [ ] Wire connection strings / environment-based configuration for a real deployment (`appsettings.json` placeholders exist; secrets still needed per environment)
- [ ] **Run `dotnet restore && dotnet build` against the delivered code — not done yet.** It was written with no .NET SDK or network access, so it hasn't been compiled. This is the next concrete step before anything below can be considered verified.

**Authentication & Authorization — 🟡 In Progress (first draft implemented 2026-08-29, untested)**
- [x] `AuthController`: register, login, `me` endpoints — implemented against the schema's actual self-register → admin-approve model, **not** the invite-token flow originally designed (see the note in [Overview](#overview) — still needs confirming)
- [x] `Admin/UsersController`: list/get users, approve, reject, suspend, reactivate
- [x] JWT issuance + role-based `[Authorize]` policies (admin vs. business account), including resource-ownership checks on orders
- [ ] Manual code review of this area — not yet reached
- [ ] Verify by building and running against a real Postgres instance
- [ ] Wire an actual email sender to drain the `notification_log` outbox (rows are already auto-enqueued by a DB trigger on registration)

**Product Catalog — 🟡 In Progress (first draft implemented 2026-08-29, untested)**
- [x] Category browsing and admin management (3-level hierarchy)
- [x] Product listing (paged, filterable by category/brand/search), detail, EAN lookup, admin CRUD, soft delete
- [x] Server-enforced pricing visibility rule for guests (price fields nulled server-side, not hidden client-side)
- [ ] Admin endpoint to manage category-scoped custom attribute *definitions* (attribute values are already read/returned on product detail)
- [ ] Manual code review of this area — not yet reached
- [ ] Verify by building and running

**Catalog Import (CSV/XLSX) — 🟡 In Progress (first draft implemented 2026-08-29, untested)**
- [x] Asynchronous background job host (`Channel<T>`-backed) for import processing
- [x] Parsing: `CsvHelper` (CSV) and `ClosedXML` (XLSX)
- [x] Column mapping per the resolved spec (`EAN` upsert key, `Cena` → per-piece price, `gb` → `sold_by_piece`, `iep.`/`kaste` → pack/box multipliers, `Katalogs`/`Grupa`/`apakšgrupa` → 3-level category, auto-created if missing)
- [x] Row-level validation, including rejecting rows where `gb=0` and both pack/box fields are empty (unorderable product)
- [x] Import job status polling, per-row error report, and history for admins; every batch/row persisted to `import_batches`/`import_logs`
- [x] Manual code review — audit logging (`import_batches`/`import_logs` persistence) validated
- [ ] Manual code review of the remaining import code (parsers, mapping, background service) — not yet reached
- [ ] Verify against a real multi-thousand-row supplier file once the build is confirmed working
- [ ] Confirm the convention of generating a product's `Sku` from its `EAN` on create (the supplier file has no SKU column)

**Orders & Checkout — 🟡 In Progress (first draft implemented 2026-08-29, untested)**
- [x] Order submission with server-side price/name/SKU resolution (never trusts client-submitted values)
- [x] Order history, cancellation, and reorder
- [x] Admin order review and status management (schema's real 7-state `OrderStatus` enum, not the simpler 4-state model originally sketched)
- [x] Order snapshotting via the DB's own `recalc_order_totals` trigger
- [ ] Manual code review of this area — not yet reached
- [ ] Wire an actual email sender to drain the order-created notification rows (already auto-enqueued)
- [ ] Verify by building and running

**Promotions & Pricing — 🟡 In Progress (promotions implemented 2026-08-29, untested; price lists not started)**
- [x] Promotion management (percentage/fixed discount; category/brand/customer-scoped, OR'd) — public "active for buyer" endpoint + admin CRUD
- [x] Price resolution folded into product serialization (batched to avoid N+1 on catalog pages); the seam for contract pricing is documented in `PricingService`
- [ ] Manual code review of this area — not yet reached
- [ ] Per-customer contract/tiered pricing — `Admin/PriceListsController` is stubbed (`501`) since there's no backing table yet; this needs a schema extension, not just a controller
- [ ] Verify promotions by building and running; decide the price-list schema extension

**Fulfillment — 🔴 Not Started (routes stubbed 2026-08-29)**
- [ ] Credit limits and payment terms — `Admin/CreditController` routed, returns `501`, no schema support yet
- [ ] Shipment tracking — `ShipmentsController` routed, returns `501`, no `Shipment` table yet
- [ ] Returns management — `ReturnsController` routed, returns `501`, no `ReturnRequest` table yet

#### Frontend

**UI/UX Design — 🔴 Not Started**
- [ ] Wireframes for key flows (catalog browsing, product detail, checkout, admin screens)
- [ ] Visual design / mockups (using the existing Tailwind + shadcn/ui + TailAdmin direction)
- [ ] Design system: colors, typography, spacing, shared components
- [ ] Client review & sign-off before build begins

**Admin Panel — 🔴 Not Started**
- [ ] Catalog & CSV import management
- [ ] Customer account & approval management
- [ ] Order review & status management
- [ ] Promotions & pricing management

**Customer Storefront — 🔴 Not Started**
- [ ] Public catalog browsing (no pricing shown to guests)
- [ ] Authenticated shopping experience with dynamic pricing & packaging-unit selection
- [ ] Quote-request checkout & order history

#### Launch & Deployment

**Infrastructure Setup — 🔴 Not Started**
- [ ] Production server provisioning (VPS, Docker Engine + Compose)
- [ ] Reverse proxy & SSL (Nginx/Caddy, Let's Encrypt)
- [ ] Backups & monitoring

**Production Deployment — 🔴 Not Started**
- [ ] CI/CD pipeline
- [ ] First production catalog import from the client's real export
- [ ] Go-live

</details>

This roadmap is kept up to date in this README as each phase is completed — check the status table above for the current state at any time.

## Repository Structure

```
b2b-trade-portal/
├── src/
│   ├── client/                # Next.js frontend (current contents are exploratory/test — not final)
│   │   ├── app/                # (auth) / (shop) / admin route groups
│   │   ├── components/
│   │   ├── lib/
│   │   ├── services/
│   │   └── types/
│   └── server/                 # ASP.NET Core Web API (.NET 10) — first-draft implementation delivered, not yet built/verified
│       ├── Controllers/
│       ├── Data/                # DbContext & migrations
│       ├── Services/
│       ├── Models/
│       └── Program.cs
├── docs/                        # Project documentation (schema, API design, decision log)
├── docker-compose.yml
└── README.md
```

## Getting Started

> The setup steps below reflect the target developer workflow. Backend implementation has a first draft in place, currently under manual code review, but **has not been built or run yet** — step 4 below (`dotnet build`) is the next thing to actually attempt.

**Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS)
- A Postgres client such as [DBeaver](https://dbeaver.io/) or pgAdmin (optional, for inspecting the database directly)

**Local setup**

```bash
# 1. Clone the repository
git clone <repository-url>
cd b2b-trade-portal

# 2. Start PostgreSQL locally
docker compose up -d

# 3. Apply the database schema
psql -h localhost -U <user> -d <database> -f b2b_ecommerce_schema.sql

# 4. Run the backend API
cd src/server
dotnet restore
dotnet build   # <- not yet verified to succeed; this is the current blocking step
dotnet run

# 5. Run the frontend (once real client development has started)
cd src/client
npm install
npm run dev
```

## Documentation

Detailed project documentation lives alongside this README:

| Document | Purpose |
|---|---|
| [`b2b_ecommerce_schema.sql`](./b2b_ecommerce_schema.sql) | Full PostgreSQL database schema with inline design rationale |

## License

This is proprietary software developed for a private client engagement. All rights reserved.