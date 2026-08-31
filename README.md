# Elkaro

**A B2B wholesale ordering portal — private catalog, dynamic pricing, and quote-based checkout for approved business customers.**

### 🚧 Build Progress

```
Overall                          ██████░░░░░░░░░░░░░░  29%

BACKEND
  Architecture & Planning        ████████████████████ 100%
  Database Architecture          ████████████████████ 100%
  Environment Setup              ████████████████████ 100%
  Authentication & Authorization █████████████████░░░  85%
  Product Catalog                ██████████████░░░░░░  70%
  Catalog Import (CSV/XLSX)      █████████████████░░░  85%
  Orders & Checkout              ████████████████░░░░  80%
  Promotions & Pricing           ██████████░░░░░░░░░░  50%

FRONTEND
  UI/UX Design & Design System   ░░░░░░░░░░░░░░░░░░░░   0%
  Admin Panel                    ░░░░░░░░░░░░░░░░░░░░   0%
  Public/Marketing Pages         ░░░░░░░░░░░░░░░░░░░░   0%
  Business Account Experience    ░░░░░░░░░░░░░░░░░░░░   0%

LAUNCH & DEPLOYMENT
  Infrastructure Setup           ░░░░░░░░░░░░░░░░░░░░   0%
  Production Deployment          ░░░░░░░░░░░░░░░░░░░░   0%
```

*Overall is a weighted average (Backend 35% · Frontend 50% · Launch 15%) — weighted toward Frontend because it's the larger remaining body of work. Full breakdown in [Project Status & Roadmap](#project-status--roadmap) below.*

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Status & Roadmap](#project-status--roadmap)
- [Key Deliverables & Next Steps](#key-deliverables--next-steps)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Elkaro is a purpose-built ordering portal for businesses that sell to other businesses at wholesale scale — catalogs running into the thousands of SKUs, pricing that only makes sense to a logged-in trade customer, and an ordering process that ends in a confirmed quote rather than an instant online payment.

## Key Features

**Public storefront** — Guests can browse the full catalog (titles, categories, images) with no login and no pricing shown, so the catalog can be shared and searched freely without exposing trade pricing.

**Self-registration with admin approval** — Businesses register their own account; an administrator reviews and approves (or rejects) each one before it can see pricing or place orders, keeping the customer base to genuine trade partners without the friction of an invite-only process.

**Dynamic, hidden-by-default pricing** — Prices and packaging pricing are resolved and shown only to authenticated accounts; the API itself withholds pricing data from anonymous requests rather than relying on the storefront to hide it.

**Flexible packaging units** — Every product can be ordered by the individual piece, by pack, or by box, matching how the client's suppliers actually package stock. Some products are pack- or box-only, and the catalog enforces that.

**Quote-request checkout, not a payment gateway** — Placing an order submits a request; there is no online payment step. The Elkaro team reviews, confirms pricing and availability, and fulfills the order outside the checkout flow.

**Manual catalog import from ERP exports** — Administrators upload a CSV or Excel file exported directly from the client's existing accounting/ERP system to add or update thousands of products at once, with per-row validation and error reporting.

**Category-based navigation** — A three-level category hierarchy (Catalog → Group → Subgroup) drives both browsing and the CSV import mapping, plus admin-managed temporary/promotional navigation nodes.

**Promotions** — Administrators can run percentage or fixed-amount promotions scoped to a category, a brand, specific customers, or storefront-wide.

**Admin back office** — Screens for managing the catalog, imports, customer account approvals, and orders, without needing direct database access.

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
                                                          ├─ Identity, roles & self-register + admin-approval
                                                          ├─ EF Core ──► PostgreSQL
                                                          ├─ Background job host ──► CSV/XLSX import jobs
                                                          ├─ Email sender ──► approvals, order/quote confirmations
                                                          └─ File storage ──► uploaded price lists
```

A few architectural decisions worth calling out:

- **Pricing is never trusted from the client.** Every price, SKU, and name used in an order is resolved and stamped on the server at the moment of purchase — never accepted as-is from a request body.
- **Orders are immutable snapshots.** Once placed, an order freezes the price, VAT rate, packaging, and address in use at that moment, so later catalog or account edits can never silently rewrite order history.
- **One business account, one login.** Each customer account represents a single person rather than a multi-user company with internal approval chains — kept intentionally simple to match how these accounts are actually used.
- **A quote is just an order in its earliest state.** Rather than a separate quote-negotiation system, a submitted order starts in a `pending` status and moves through review to fulfillment in place — there's no multi-round back-and-forth to support.

## Project Status & Roadmap

**Current phase:** backend implementation is well underway — core account, catalog, import, order, and pricing functionality is built and working. Frontend has not started yet and is now the largest remaining body of work. This section is kept current as development progresses.

### 🖥️ Backend

| Subcategory | Status |
|---|---|
| Architecture & Planning | 🟢 Completed |
| Database Architecture | 🟢 Completed |
| Environment Setup | 🟢 Completed |
| Authentication & Authorization | 🟡 In Progress (85%) |
| Product Catalog | 🟡 In Progress (70%) |
| Catalog Import (CSV/XLSX) | 🟡 In Progress (85%) |
| Orders & Checkout | 🟡 In Progress (80%) |
| Promotions & Pricing | 🟡 In Progress (50%) |

### 💻 Frontend

| Subcategory | Status |
|---|---|
| UI/UX Design & Design System | 🔴 Not Started |
| Admin Panel | 🔴 Not Started |
| Public/Marketing Pages | 🔴 Not Started |
| Business Account Experience | 🔴 Not Started |

> Frontend work is deliberately sequenced *after* the backend, so it's built against a finished, stable API rather than a moving target. Any code currently in this repository's frontend folder is early exploratory/test work and does not reflect the final application. Given the number of screens involved (design system, full admin panel, all public marketing pages, and the authenticated business-account experience), Frontend is expected to take longer than the Backend phase did.

### 🚀 Launch & Deployment

| Subcategory | Status |
|---|---|
| Infrastructure Setup | 🔴 Not Started |
| Production Deployment | 🔴 Not Started |

<details>
<summary><strong>Full task breakdown</strong> (click to expand)</summary>

#### Backend

**Architecture & Planning — 🟢 Completed**
- [x] Functional requirements confirmed (guest browsing, self-register + admin-approved business accounts, packaging hierarchy, quote checkout, manual catalog import)
- [x] Technology stack selected
- [x] Full API design completed and all open design questions resolved

**Database Architecture — 🟢 Completed**
- [x] Full production PostgreSQL schema designed — accounts, catalog, categories, custom attributes, promotions, orders with full snapshotting, notification outbox, import audit logging

**Environment Setup — 🟢 Completed**
- [x] Backend project retargeted to .NET 10 (current LTS) with dependencies updated
- [x] EF Core `DbContext` and entity models implemented, covering the full schema (21 entities)
- [x] Local database environment set up
- [x] Database-first: `b2b_ecommerce_schema.sql` is the single source of truth, applied directly to Postgres — no EF Core migrations to generate or maintain

**Authentication & Authorization — 🟡 In Progress (85%)**
- [x] Self-registration, login, and "current user" endpoints, issuing JWTs
- [x] Business account approval workflow (admin approve / reject / suspend / reactivate) — confirmed as the account model going forward (2026-08-30), replacing the earlier invite-only plan
- [x] Role-based access control (`AdminOnly` policy) enforced on admin endpoints
- [ ] Token refresh / logout endpoint

**Product Catalog — 🟡 In Progress (70%)**
- [x] Category browsing (list, by-slug, products-by-category) with price resolution
- [x] Product listing, detail, and lookup-by-EAN, with per-product packaging options (piece/pack/box)
- [x] Server-enforced pricing visibility rule for guests (prices withheld from unauthenticated requests)
- [x] Admin catalog management endpoints (categories, products)
- [ ] Category-specific custom product attributes exposed via the API

**Catalog Import (CSV/XLSX) — 🟡 In Progress (85%)**
- [x] Asynchronous import pipeline (background queue + processor, off-thread file handling)
- [x] CSV and XLSX parsers
- [x] Import job status, per-row error reporting, and history endpoints for admins
- [ ] Configurable column mapping (currently a fixed mapping)

**Orders & Checkout — 🟡 In Progress (80%)**
- [x] Order submission with server-side price/name/VAT snapshotting
- [x] Order history, cancellation, and reorder
- [x] Admin order review and status management
- [ ] Order and quote email notifications

**Promotions & Pricing — 🟡 In Progress (50%)**
- [x] Promotion management (category/brand/customer scoped), admin CRUD
- [x] Price resolution engine (best-discount active promotion applied automatically per product)
- [ ] Per-customer contract/tiered pricing

#### Frontend

**UI/UX Design & Design System — 🔴 Not Started**
- [ ] Wireframes for key flows (catalog browsing, product detail, checkout, admin screens)
- [ ] Mobile-responsive design across all views
- [ ] Core layout components: sidebar, header, footer
- [ ] Data table design (catalog, orders, admin lists)
- [ ] Shared component library: buttons, forms, modals, inputs
- [ ] Design system: colors, typography, spacing (using the existing Tailwind + shadcn/ui + TailAdmin direction)
- [ ] Client review & sign-off before build begins

**Admin Panel — 🔴 Not Started**
- [ ] Catalog & CSV import management screens
- [ ] Order management screens
- [ ] Product management screens
- [ ] Customer account approval management
- [ ] Promotions & pricing management

**Public/Marketing Pages — 🔴 Not Started**
- [ ] Homepage / main landing page
- [ ] Category browsing pages (no pricing shown to guests)
- [ ] Product detail pages
- [ ] Contact page
- [ ] Login page
- [ ] Registration page

**Business Account Experience — 🔴 Not Started**
- [ ] Authenticated shopping experience with dynamic pricing & packaging-unit selection
- [ ] Order placement and price handling
- [ ] Order history and reorder
- [ ] Account/profile management

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

## Key Deliverables & Next Steps

**Delivered so far:**
- A complete, documented functional specification for the platform
- A full production-ready PostgreSQL database schema covering every core area of the business (accounts, catalog, categories, custom attributes, promotions, orders with full audit history, and import logging)
- A complete API design specifying every endpoint the platform needs, matched to the schema, with all outstanding design decisions resolved
- The backend project environment updated to a current, long-term-supported technology baseline (.NET 10)
- Core backend functionality implemented and working: account registration & approval with JWT-based auth, the product catalog with server-enforced pricing visibility, the async CSV/XLSX catalog import pipeline, the full order/checkout flow with server-side price snapshotting, and a promotions/pricing engine (backend is roughly 70% complete overall)

**What comes next:**
1. Finish the remaining backend work: per-customer contract/tiered pricing and order/quote email notifications.
2. Begin frontend UI/UX design and the shared design system — now the largest remaining body of work, since it covers the full admin panel, all public marketing pages, and the authenticated business-account experience.
3. Build the admin panel, public pages, and business-account experience against the finished API.
4. Deploy to production infrastructure and go live with a real catalog import.

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
│   └── server/                 # ASP.NET Core Web API (.NET 10)
│       ├── Controllers/
│       ├── Data/                # DbContext (database-first — schema owned by b2b_ecommerce_schema.sql)
│       ├── Services/
│       ├── Models/
│       └── Program.cs
├── docs/                        # Project documentation (schema, API design, decision log)
├── docker-compose.yml
└── README.md
```

## Getting Started

> The setup steps below reflect the target developer workflow. The database is database-first (schema applied directly from `b2b_ecommerce_schema.sql`, no EF Core migrations), and the local environment and backend API are already running — a few backend areas (see [Project Status & Roadmap](#project-status--roadmap)) are still in progress.

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
dotnet build
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