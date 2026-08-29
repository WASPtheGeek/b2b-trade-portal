# Elkaro

**A B2B wholesale ordering portal — private catalog, dynamic pricing, and quote-based checkout for approved business customers.**

- [Status](#project-status--roadmap)
- [.NET](#tech-stack)
- [Frontend](#tech-stack)
- [Database](#tech-stack)
- [License](#license)

### 🚧 Build Progress

```
Overall                          ███░░░░░░░░░░░░░░░░░  16%

BACKEND
  Architecture & Planning        ████████████████████ 100%
  Database Architecture          ████████████████████ 100%
  Environment Setup              █████░░░░░░░░░░░░░░░  25%
  Authentication & Authorization ░░░░░░░░░░░░░░░░░░░░   0%
  Product Catalog                ░░░░░░░░░░░░░░░░░░░░   0%
  Catalog Import (CSV/XLSX)      ░░░░░░░░░░░░░░░░░░░░   0%
  Orders & Checkout              ░░░░░░░░░░░░░░░░░░░░   0%
  Promotions & Pricing           ░░░░░░░░░░░░░░░░░░░░   0%
  Invoicing & Fulfillment        ░░░░░░░░░░░░░░░░░░░░   0%

FRONTEND
  UI/UX Design                   ░░░░░░░░░░░░░░░░░░░░   0%
  Admin Panel                    ░░░░░░░░░░░░░░░░░░░░   0%
  Customer Storefront            ░░░░░░░░░░░░░░░░░░░░   0%

LAUNCH & DEPLOYMENT
  Infrastructure Setup           ░░░░░░░░░░░░░░░░░░░░   0%
  Production Deployment          ░░░░░░░░░░░░░░░░░░░░   0%
```

*Full breakdown in [Project Status & Roadmap](#project-status--roadmap) below.*

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

The public storefront lets anyone browse product names, categories, and images — no account required. Pricing, packaging options, and the ability to place an order are unlocked only for approved business accounts, which are created by invitation rather than open signup. When a customer places an order, nothing is charged automatically: the request is submitted as a quote, and the Elkaro team confirms final pricing and availability directly with the customer before it's fulfilled.

The product catalog itself is kept in sync with the client's existing ERP/accounting software through a simple, manual CSV/Excel import — no live integration required, and no change to how the client's back office already works.

## Key Features

**Public storefront** — Guests can browse the full catalog (titles, categories, images) with no login and no pricing shown, so the catalog can be shared and searched freely without exposing trade pricing.

**Invite-only trade accounts** — New business accounts are created only through an invitation link issued by an administrator, keeping the customer base to genuine trade partners.

**Dynamic, hidden-by-default pricing** — Prices and packaging pricing are resolved and shown only to authenticated accounts; the API itself withholds pricing data from anonymous requests rather than relying on the storefront to hide it.

**Flexible packaging units** — Every product can be ordered by the individual piece, by pack, or by box, matching how the client's suppliers actually package stock. Some products are pack- or box-only, and the catalog enforces that.

**Quote-request checkout, not a payment gateway** — Placing an order submits a request; there is no online payment step. The Elkaro team reviews, confirms pricing and availability, and fulfills the order outside the checkout flow.

**Manual catalog import from ERP exports** — Administrators upload a CSV or Excel file exported directly from the client's existing accounting/ERP system to add or update thousands of products at once, with per-row validation and error reporting.

**Category-based navigation** — A three-level category hierarchy (Catalog → Group → Subgroup) drives both browsing and the CSV import mapping, plus admin-managed temporary/promotional navigation nodes.

**Promotions** — Administrators can run percentage or fixed-amount promotions scoped to a category, a brand, specific customers, or storefront-wide.

**Admin back office** — Screens for managing the catalog, imports, customer accounts and invites, and orders, without needing direct database access.

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (React, TypeScript) | App Router; server-rendered/static catalog pages, client-side cart and pricing interactions |
| UI | Tailwind CSS, shadcn/ui, TailAdmin | Component primitives and admin layout patterns |
| Data tables | TanStack Table | Virtualized scrolling for catalog views with thousands of rows |
| Backend | ASP.NET Core Web API (.NET 10 LTS) | REST API — authentication, business logic, catalog import, email notifications |
| Database | PostgreSQL 14+ | Accessed via Entity Framework Core / Npgsql |
| Local development | Docker Desktop, DBeaver / pgAdmin | Containerized Postgres and API for local dev |
| Hosting |  |  |

The full stack is built on free, open-source software end to end — the only recurring cost is the server itself.

## Architecture

Elkaro is a monorepo with a clear split between the public/customer-facing frontend and the backend API that owns all business logic and data access:

```
                         HTTPS + JSON (Bearer JWT)
 Next.js (SSR/ISR)  ────────────────────►  ASP.NET Core Web API
                                            │
                                            ├─ Identity, roles & invite-only registration
                                            ├─ EF Core ──► PostgreSQL
                                            ├─ Background job host ──► CSV/XLSX import jobs
                                            ├─ Email sender ──► invites, order/quote confirmations
                                            └─ File storage ──► uploaded price lists, invoice PDFs
```

A few architectural decisions worth calling out:

- **Pricing is never trusted from the client.** Every price, SKU, and name used in an order is resolved and stamped on the server at the moment of purchase — never accepted as-is from a request body.
- **Orders are immutable snapshots.** Once placed, an order freezes the price, VAT rate, packaging, and address in use at that moment, so later catalog or account edits can never silently rewrite order history.
- **One business account, one login.** Each customer account represents a single person rather than a multi-user company with internal approval chains — kept intentionally simple to match how these accounts are actually used.
- **A quote is just an order in its earliest state.** Rather than a separate quote-negotiation system, a submitted order starts in a `pending` status and moves through review to fulfillment in place — there's no multi-round back-and-forth to support.


<details>
<summary><strong>Full task breakdown</strong> (click to expand)</summary>

#### Backend

**Architecture & Planning — 🟢 Completed**
- [x] Functional requirements confirmed (guest browsing, invite-only accounts, packaging hierarchy, quote checkout, manual catalog import)
- [x] Technology stack selected
- [x] Full API design completed and all open design questions resolved

**Database Architecture — 🟢 Completed**
- [x] Full production PostgreSQL schema designed — accounts, catalog, categories, custom attributes, promotions, orders with full snapshotting, notification outbox, import audit logging

**Environment Setup — 🟡 In Progress**
- [x] Backend project retargeted to .NET 10 (current LTS) with dependencies updated
- [ ] Local database environment provisioned (Docker Compose)
- [ ] EF Core data models and migrations generated from the schema
- [ ] Environment/configuration setup

**Authentication & Authorization — 🔴 Not Started**
- [ ] Registration (invite-gated), login, and session endpoints
- [ ] Invite creation, validation, and revocation
- [ ] Business account approval workflow
- [ ] Role-based access control (admin vs. business account) enforced on every endpoint

**Product Catalog — 🔴 Not Started**
- [ ] Category browsing and admin management (3-level hierarchy)
- [ ] Product listing, detail, and admin CRUD
- [ ] Server-enforced pricing visibility rule for guests
- [ ] Category-specific custom product attributes

**Catalog Import (CSV/XLSX) — 🔴 Not Started**
- [ ] Asynchronous CSV/Excel import processing
- [ ] Column mapping and per-row validation
- [ ] Import job status, error reporting, and history for admins

**Orders & Checkout — 🔴 Not Started**
- [ ] Order submission with server-side price/name resolution
- [ ] Order history, cancellation, and reorder
- [ ] Admin order review and status management
- [ ] Order and quote email notifications

**Promotions & Pricing — 🔴 Not Started**
- [ ] Promotion management (category/brand/customer scoped)
- [ ] Per-customer contract/tiered pricing

**Invoicing & Fulfillment — 🔴 Not Started**
- [ ] Invoice generation and status tracking
- [ ] Credit limits and payment terms
- [ ] Shipment tracking
- [ ] Returns management

#### Frontend

**UI/UX Design — 🔴 Not Started**
- [ ] Wireframes for key flows (catalog browsing, product detail, checkout, admin screens)
- [ ] Visual design / mockups (using the existing Tailwind + shadcn/ui + TailAdmin direction)
- [ ] Design system: colors, typography, spacing, shared components
- [ ] Client review & sign-off before build begins

**Admin Panel — 🔴 Not Started**
- [ ] Catalog & CSV import management
- [ ] Customer account & invite management
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

## Key Deliverables & Next Steps

**Delivered so far:**
- A complete, documented functional specification for the platform
- A full production-ready PostgreSQL database schema covering every core area of the business (accounts, catalog, categories, custom attributes, promotions, orders with full audit history, and import logging)
- A complete API design specifying every endpoint the platform needs, matched to the schema, with all outstanding design decisions resolved
- The backend project environment updated to a current, long-term-supported technology baseline (.NET 10)

**What comes next:**
1. Stand up the database and generate the backend's data-access layer from the finished schema.
2. Build authentication and invite-only account registration — the foundation every other feature depends on.
3. Build the product catalog and enforce the pricing-visibility rule for guests.
4. Build the catalog import tool so the client's real product data can be loaded and tested early.
5. Build the order/quote checkout flow.
6. Layer in promotions, contract pricing, invoicing, and fulfillment.
7. Build the real customer-facing and admin frontend against the finished API.
8. Deploy to production infrastructure and go live with a real catalog import.

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
│       ├── Data/                # DbContext & migrations
│       ├── Services/
│       ├── Models/
│       └── Program.cs
├── docs/                        # Project documentation (schema, API design, decision log)
├── docker-compose.yml
└── README.md
```

## Getting Started

> The setup steps below reflect the target developer workflow. As backend implementation is still in progress, some of these steps (migrations, running the API) will become available as the Backend → Environment Setup and Authentication & Authorization work lands.

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
| [`docs/api-design.md`](./docs/api-design.md) | Complete API design: endpoints, domain model, conventions, resolved decisions |

## License

This is proprietary software developed for a private client engagement. All rights reserved.