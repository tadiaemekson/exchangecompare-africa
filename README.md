# ExchangeCompare Africa 🌍💸

An API-First comparison platform built to analyze money transfer fees, traditional bank rates, fintech services, P2P direct agents, and cryptocurrency exchanges in real-time across Africa. 

---

## 🚀 Key Features

*   **Real-Time Category Comparisons**: Compare rates dynamically split into four distinct categories:
    *   **🚀 Fintech & Transfer**: Modern remittance services (e.g., Wise, Taptap Send).
    *   **🏦 Traditional Banks**: Regional and international banking options (e.g., Ecobank, UBA).
    *   **👤 Direct Agents (P2P)**: Escrow agent networks supporting cash payouts or direct bank deposits.
    *   **🪙 Crypto Exchanges**: P2P crypto and fiat swaps (USDT, BTC, ETH, SOL).
*   **Bilingual Application Support (FR & EN)**: Complete translation toggle across all main interfaces (Home, Auth, User Dashboard, Admin Dashboard) with selection persistence using `localStorage`.
*   **P2P Direct Agent Workflow**: Integrated local in-app beneficiary details modal. Upon confirmation, a structured copy-paste message is generated for local operators (prefilled into a WhatsApp group chat link or copied to clipboard).
*   **User Dashboard**:
    *   SaaS subscription plans configuration simulator.
    *   Dynamic rate alerts setting (notifies by email when a currency pair is above/below a specific target rate).
    *   Complete simulation and transfer transaction histories.
*   **Admin Dashboard**:
    *   Console metrics for active users, providers, connected rates, and conversions.
    *   Providers and currencies managers.
    *   Exchange rates variable and fixed fee controllers.
    *   Manual rate overrides.
    *   Live transaction queue tracking.
*   **Automated Rate Synchronization**: CLI command line engine integrated with the Fawaz Ahmed Currency API (with Cloudflare fallbacks) to sync thousands of currency rates.

---

## 🛠️ Technology Stack

### Backend (API Engine)
*   **Framework**: Laravel (PHP 8.2+)
*   **Database**: SQLite (Development) / MySQL (Production)
*   **Authentication**: Laravel Sanctum (Token-based SPA auth)
*   **Services**: Fawaz Ahmed Currency API integration, Mail notifier.

### Frontend (SPA Client)
*   **Framework**: React 18+ with TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS & Vanilla CSS (Tailored HSL theme, glassmorphic grids, modern typography)
*   **UI Components**: Shadcn UI (Card, Dialog, Table, Input, Dialog, Select primitives) & Lucide Icons
*   **State & API Client**: Axios with local storage synchronizer.

---

## 📂 Project Structure

```
exchangecompare-africa/
├── backend/                 # Laravel RESTful API
│   ├── app/                 # Services, Command line, Controllers
│   ├── config/              # Service parameters
│   ├── database/            # Migrations & Seeders
│   └── routes/api.php       # Protected & Public REST Endpoints
├── frontend/                # React TypeScript client SPA
│   ├── src/
│   │   ├── components/      # Shared components & Shadcn UI wrappers
│   │   ├── pages/           # Home, Auth, User Dashboard, Admin
│   │   ├── services/        # Axios API configurations
│   │   ├── index.css        # Core custom design tokens
│   │   └── App.tsx          # Client-side router definition
└── README.md                # Repository overview documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   **PHP** >= 8.2 & **Composer**
*   **Node.js** >= 18 & **npm**
*   **WAMP/MAMP/LAMP** or SQLite driver configured

---

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install composer dependencies:
    ```bash
    composer install
    ```
3.  Initialize environment configuration:
    ```bash
    cp .env.example .env
    ```
4.  Configure your database inside `.env`. For SQLite:
    ```env
    DB_CONNECTION=sqlite
    # Delete or comment out other DB parameters. Let Laravel create database.sqlite
    ```
5.  Generate the app key:
    ```bash
    php artisan key:generate
    ```
6.  Run database migrations and populate default seeders (creates demo admin and operators):
    ```bash
    php artisan migrate:fresh --seed
    ```
7.  Synchronize the exchange rates database:
    ```bash
    php artisan rates:sync
    ```
8.  Start the local development API server:
    ```bash
    php artisan serve
    ```
    *By default, the backend will be available at `http://127.0.0.1:8000`.*

---

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Ensure the environment configuration points to your backend URL inside `src/services/api.ts` (defaults to `http://127.0.0.1:8000/api`).
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *By default, the frontend will be available at `http://localhost:5173`.*

---

## 📡 CLI Commands & Syncing

To manually trigger or schedule currency rate syncs, use the built-in console command:

```bash
# Sync standard rates using today's currency api values
php artisan rates:sync

# Sync rates for a specific date (Format: YYYY-MM-DD)
php artisan rates:sync --date=2026-06-01

# Sync from a custom endpoint or fallback API
php artisan rates:sync --endpoint=latest
```

---

## 👥 Demo Logins

After running `db:seed`, you can log in using these default credentials:

*   **Administrator**:
    *   **Email**: `admin@exchangecompare.africa`
    *   **Password**: `password`
*   **Standard Demo User**:
    *   **Email**: `user@example.com`
    *   **Password**: `password`

---

## 📜 License

This project is open-source software licensed under the [MIT license](LICENSE).
