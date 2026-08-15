# 🛒 B2B Trade Portal

High-performance B2B trade portal & wholesale catalog designed for seamless mobile performance, featuring invite-only access, multi-unit packaging options (pcs/packs/boxes), hidden dynamic pricing, and easy CSV catalog management.

---

## 🛠 Tech Stack

* **Frontend:** Next.js (React, TypeScript, Tailwind CSS / Shadcn UI)
* **Backend:** C# (.NET 9 Web API)
* **Database:** PostgreSQL / SQL Server
* **Architecture:** Monorepo with Hybrid Rendering (SSG/ISR + Client-side Hydration)

---

## 📁 Repository Structure

```text
b2b-trade-portal/
├── .github/
│   └── workflows/             # CI/CD pipelines
├── src/
│   ├── client/                # Next.js Frontend App
│   │   ├── app/               # App Router pages & API routes
│   │   ├── components/        # UI components (Shadcn UI / Data Grid)
│   │   └── package.json
│   └── server/                # C# .NET Web API
│       ├── Controllers/       # Auth, Products, Orders, Import
│       ├── Models/            # Database entities & DTOs
│       └── B2bTradePortal.csproj
├── docker-compose.yml          # Local development stack (API + Database)
├── .gitignore
└── README.md
```

## 🚀 Quick Start (Local Development)
### Prerequisites
* Node.js (v20+)
* .NET 9 SDK
* PostgreSQL or SQL Server

### 1. Backend (.NET Web API)
```bash
# Navigate to server directory
cd src/server

# Configure database connection string in appsettings.Development.json
# Run database migrations and start API
dotnet restore
dotnet run
```

### 2. Frontend (Next.js)

```bash
# Navigate to client directory
cd src/client

# Install dependencies
npm install

# Set environment variables in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```
## 🔐 User Roles & Key Features

* **Guest:** Publicly browse product titles, categories, and images without prices.
* **B2B Client:** Invite-only login. Access dynamic pricing, select packaging units (pcs/packs/boxes), add items to cart, and submit email quote requests.
* **Admin (Manager):** Simple CSV/Excel price list import endpoint/interface and client invitation link generator.
