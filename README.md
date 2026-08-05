<p align="center">
  <img src="frontend/public/images/campusbaazar-logo.png" alt="CampusBaazar" width="360" />
</p>

<p align="center">
  A student-to-student marketplace for useful things that deserve another semester.
</p>

## About the project

CampusBaazar helps students buy and sell textbooks, calculators, notes, lab equipment, electronics, and other study essentials within their campus community. Buyers request an item and arrange a public meeting with the seller; the platform does not collect online payments.

This project began as a full redesign of my earlier academic e-commerce backend. It grew into a complete product with its own interface, authentication model, buyer and seller workflows, inventory rules, administration tools, and free study-material library.

## What it includes

- Student registration using personal and college email addresses
- JWT authentication with student and administrator roles
- Search, categories, campus filters, saved items, cart, and buy-now flow
- Seller listings with image uploads, condition, pickup location, price, and quantity
- Optional Spring AI assistant that drafts editable, fact-based product descriptions
- Stock-aware cart controls and server-side inventory validation
- Buyer requests that sellers can accept, decline, and mark completed
- Automatic inventory reduction and sold-state handling
- Student dashboards for listings, purchases, buyer requests, and shared resources
- Admin dashboard for users, listings, requests, and study materials
- Free PDFs, notes, and lecture links organized by subject and academic year
- Responsive storefront designed for desktop and mobile

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, Lucide icons, CSS |
| Backend | Java 21, Spring Boot 3, Spring Security |
| AI | Spring AI with an optional OpenAI chat model |
| Data | Spring Data JPA, Hibernate, H2 |
| Authentication | JWT with role-based authorization |
| Build tools | npm, Maven Wrapper |

## Project structure

```text
CampusBaazar/
|-- frontend/                 React storefront and dashboards
|-- backend/                  Spring Boot REST API
|   |-- src/main/java/        Controllers, security, models, repositories
|   `-- src/test/             Backend tests
|-- .env.example              Environment variable reference
|-- CONTRIBUTING.md
|-- LICENSE
`-- README.md
```

## Run locally

### Prerequisites

- Java 21
- Node.js 20 or newer
- npm 10 or newer

### 1. Configure the backend

Copy the values from `.env.example` into your shell. The application reads environment variables directly; it does not load the file automatically.

PowerShell:

```powershell
$env:APP_JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
$env:APP_ADMIN_EMAIL="admin@yourcollege.edu"
$env:APP_ADMIN_PASSWORD="choose-a-strong-password"
```

`APP_ADMIN_EMAIL` and `APP_ADMIN_PASSWORD` are optional. When both are provided, CampusBaazar creates an administrator on first start.

To enable the optional seller description assistant:

```powershell
$env:APP_AI_ENABLED="true"
$env:OPENAI_API_KEY="your-api-key"
$env:OPENAI_MODEL="gpt-4o-mini"
```

The API key stays on the backend and is never sent to the browser. Without these variables, the rest of CampusBaazar continues to run normally.

### 2. Start the API

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8081`. Local records are stored under `backend/data/`, which is ignored by Git.

### 3. Start the frontend

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5176`. Vite proxies `/api` requests to the backend.

## Core workflow

1. A verified student publishes a listing and states how many units are available.
2. A buyer adds up to the available quantity and sends a purchase request.
3. The seller accepts or declines the request from their dashboard.
4. Students meet at the chosen campus location and inspect the item.
5. The seller marks the exchange completed. Inventory is reduced, and the listing becomes sold when stock reaches zero.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a student account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/products` | Browse marketplace listings |
| `POST` | `/api/product` | Publish a listing |
| `POST` | `/api/ai/listing-description` | Draft an editable seller description |
| `POST` | `/api/orders` | Send a purchase request |
| `PATCH` | `/api/profile/sales/status` | Accept, decline, or complete a request |
| `GET` | `/api/profile/purchases` | View buyer request statuses |
| `GET/POST` | `/api/materials` | Browse or share study resources |
| `GET` | `/api/admin/summary` | View administrator metrics |

Protected endpoints require `Authorization: Bearer <token>`.

## Quality checks

```powershell
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
.\mvnw.cmd test
```

## Security notes

- Never commit production secrets or the local H2 database.
- Use a unique `APP_JWT_SECRET` in every deployed environment.
- Create the first administrator through environment variables, then remove those variables if your hosting setup permits it.
- CampusBaazar is designed for in-person exchanges. Students should meet in a public place and inspect items before payment.

## License

CampusBaazar is available under the [MIT License](LICENSE).
