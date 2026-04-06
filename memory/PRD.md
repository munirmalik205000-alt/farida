# Smartpay360 - Product Requirements Document

## Original Problem Statement
Create a modern, professional Recharge & MLM mobile application named "Smartpay360". Needs clean fintech design (Blue + Green gradient). Features include: Authentication (Referral code mandatory, OTP), User Dashboard (Income tracking, Dual Wallets: Main & E-wallet), Wallet System (Add Fund, Transfer, Admin Approval), Recharge & Services (Mobile, DTH, Utility), E-commerce Section, 20-Level MLM Plan, Admin Panel (Total control over users, funds, transactions), and Package/Coin reward system.

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT-based

## Architecture
```
/app/
├── backend/
│   ├── server.py           # All API routes (auth, wallet, packages, MLM, admin)
│   ├── tests/              # pytest test files
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, WalletCards, PackagesTab, AdminPackages, CoinHistory, IncomeStats
│   │   ├── pages/          # UserDashboard, AdminDashboard, AuthPage
│   │   ├── App.js          # Routing & Main Layout
│   │   └── index.css       # Global styles & Tailwind config
│   └── package.json
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

## What's Been Implemented

### Authentication (DONE)
- Login/Signup with mobile + password
- Referral code mandatory for signup
- JWT token-based auth
- Admin seed account auto-created

### User Dashboard (DONE - Feb 2026)
- Left sidebar navigation with 9 items: Dashboard, Package, Transaction, Recharge, User Tree, E-commerce, Withdrawal Money, Add Fund, Setting
- Tabs removed from dashboard body - sidebar drives content
- Wallet cards (Main Wallet + E-Wallet)
- Income stats grid (Total, Today, Repurchase, Users)
- Referral code display + copy

### Admin Dashboard (DONE)
- Desktop fixed sidebar with Overview, Fund Requests, Users, Packages, Settings
- Fund request approval/rejection
- Package creation
- User management

### Wallet System (DONE)
- Add Fund request (user submits, admin approves)
- E-Wallet transfer between users
- Main Wallet balance tracking
- Fund request history

### Withdrawal Money (DONE - Feb 2026)
- POST /api/wallet/withdrawal endpoint
- Supports bank, UPI, Paytm methods
- Creates pending withdrawal request + transaction record

### Packages & Coins (DONE)
- Admin creates packages (name, price, coins, image)
- Users purchase packages → balance deducted, coins awarded, ID activated

### Recharge Services (DONE - MOCKED)
- Mobile, DTH, Electricity, Gas, Water recharge forms
- Internal logic only - no real 3rd party API

### MLM / User Tree (DONE - Basic)
- Downline listing
- Commission history
- Referral-based level tracking

### E-commerce (DONE - Basic)
- Product listing
- Wallet-based purchase
- Order history

### UI/Styling (DONE - Feb 2026)
- Purple theme sidebar
- Dark blue input borders globally
- All yellow colors replaced with purple
- Emergent Visual Editor yellow artifact overrides in CSS

## Pending / P0
(None currently)

## Upcoming Tasks - P1
- Task 1: Implement full 20-level MLM Tree view (visual hierarchy)
- Task 2: Withdrawal admin approval flow
- Task 3: E-commerce UI/UX improvements (product categories, search)

## Future / P2
- Real API integrations for Mobile/DTH/Utility Recharges
- OTP-based authentication
- Backend refactor (break server.py into route modules)
- Secure token storage (httpOnly cookies)
- Package image upload functionality

## Key API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/user/dashboard
- POST /api/wallet/fund-request
- GET /api/wallet/fund-requests
- POST /api/wallet/transfer
- POST /api/wallet/withdrawal
- GET /api/transactions
- POST /api/recharge
- GET /api/packages
- POST /api/user/buy-package
- GET /api/mlm/downline
- GET /api/mlm/commissions
- GET /api/products
- POST /api/orders

## DB Collections
- users, packages, transactions, fund_requests, withdrawals, products, orders, commissions, settings
