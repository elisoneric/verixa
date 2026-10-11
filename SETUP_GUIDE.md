# Verixa ID - Production Readiness & Setup Guide

This guide details the end-to-end setup, environment configuration, credentials management, and deployment procedures for **Verixa ID**.

---

## 1. Architecture Overview

Verixa is structured as a Turbo monorepo:
* **`apps/api`**: NestJS backend providing high-throughput identity verification APIs, Paystack DVA settlement, idempotency controls, and token authentication. (Default Port: `3003` or `4000` in Docker).
* **`apps/dashboard`**: Next.js 16 + React 19 web console for developer API keys, DVA wallet top-ups, usage logs, slip generator, and analytics. (Default Port: `3001` or `3000` in Docker).
* **`apps/docs`**: Next.js developer documentation and API reference. (Default Port: `3002`).
* **`apps/www`**: Public marketing and pricing landing page.
* **`packages/ui`**: Shared UI design tokens, navigation links, and theme components.

---

## 2. Environment Variables Quick Reference

### Backend API (`apps/api/.env`)
Copy `apps/api/.env.example` to `apps/api/.env`:

```env
# Server
PORT=3003
NODE_ENV=production

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=verixa
DB_PASSWORD=your_secure_db_password
DB_NAME=verixa_db

# Cache & Idempotency Store (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Security & JWT
JWT_SECRET=generate_a_random_jwt_secret_at_least_32_characters
SYSTEM_ENCRYPTION_KEY=exact_32_character_hex_or_string_key

# Google OAuth 2.0 (Google Identity Services GIS)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# Upstream Identity Verification (Dojah)
DOJAH_APP_ID=your_dojah_app_id
DOJAH_SECRET_KEY=your_dojah_secret_key
DOJAH_ENVIRONMENT=production # or sandbox

# Super Admin Access
ADMIN_EMAILS=admin@verixaid.com,elisoneric@gmail.com

# Notifications (SMTP)
SMTP_HOST=mail.verixaid.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@verixaid.com
SMTP_PASS=your_smtp_password
SMTP_FROM_NAME=Verixa ID
SMTP_FROM_EMAIL=no-reply@verixaid.com
```

### Dashboard Frontend (`apps/dashboard/.env.local`)
Copy `apps/dashboard/.env.example` to `apps/dashboard/.env.local`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://api-verixa.esam.com.ng

# Google OAuth 2.0 Web Client ID (Must match GOOGLE_CLIENT_ID in API)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 3. Google OAuth 2.0 Setup (GIS)

Verixa uses Google Identity Services (GIS) with secure backend ID token verification. No mock or fallback accounts are ever created.

### Step 1: Create Google Cloud Project & OAuth Client ID
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your Google Cloud project.
3. Open **APIs & Services** > **OAuth consent screen**:
   * User Type: **External**.
   * Fill in App Name (e.g. `Verixa ID`), User support email, and Developer contact information.
   * Add authorized domains (e.g. `esam.com.ng`, `verixaid.com`).
4. Open **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth client ID**.
   * Application type: **Web application**.
   * Name: `Verixa Web Client`.
   * **Authorized JavaScript origins**:
     * Development: `http://localhost:3001`, `http://localhost:3000`
     * Production: `https://verixa.esam.com.ng`, `https://dashboard.verixaid.com`
   * **Authorized redirect URIs**:
     * Development: `http://localhost:3001/login`, `http://localhost:3001/register`
     * Production: `https://verixa.esam.com.ng/login`, `https://verixa.esam.com.ng/register`
5. Click **Create** and copy your **Client ID** (format: `[CLIENT_ID].apps.googleusercontent.com`).

### Step 2: Inject Client ID
* Paste the Client ID into `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `apps/dashboard/.env.local` (and your Coolify/Docker production env).
* Paste the same Client ID into `GOOGLE_CLIENT_ID` in `apps/api/.env`.

### Step 3: Verification Logic
* The dashboard initializes `google.accounts.id.initialize` and triggers GIS sign-in.
* When the user authenticates, Google delivers an ID Token (credential).
* The dashboard sends this credential to `POST /auth/google`.
* The API validates the token cryptographically via `https://oauth2.googleapis.com/tokeninfo?id_token={credential}`, checks that `aud === GOOGLE_CLIENT_ID`, and extracts verified email and profile details.
* Any unverified or missing credential immediately returns `401 Unauthorized`.

---

## 4. Paystack Dedicated Virtual Accounts (DVA) & Billing

Verixa uses Paystack for automated wallet funding and Dedicated Virtual Accounts.

### Important: No Default/Mock Bank Accounts
* Verixa does **not** generate or display fake bank accounts (e.g. mock Titan Trust Bank).
* When a user has not provisioned a DVA, the billing page displays **"Not Provisioned"**.
* To provision an account, the user must enter their **NIN, Phone Number, and Consent** directly in the dashboard modal or call `POST /billing/dva/provision`.

### Paystack Setup Checklist:
1. Register and verify your business on [Paystack](https://dashboard.paystack.com/).
2. Request activation of **Dedicated NUBAN / Dedicated Virtual Accounts** from Paystack support or your account manager.
3. Retrieve your Live Secret Key from **Settings > API Keys & Webhooks**.
4. Set `PAYSTACK_SECRET_KEY=your_paystack_secret_key_here` in `apps/api/.env`.
5. Set your Webhook URL in Paystack Dashboard:
   * URL: `https://api-verixa.esam.com.ng/billing/webhook/paystack`
   * Events to subscribe: `charge.success`, `dedicated_account.assign.success`.
6. Webhook signatures are validated using HMAC SHA512 against `PAYSTACK_SECRET_KEY`.

---

## 5. Upstream Identity Providers (Dojah)

Verixa routes verification calls through upstream providers with intelligent Redis caching and cache-split pricing.

### Setup Checklist:
1. Open [Dojah Dashboard](https://app.dojah.io/) and generate an **App ID** and **Production Secret Key**.
2. Configure credentials in `apps/api/.env`:
   ```env
   DOJAH_APP_ID=your_dojah_app_id
   DOJAH_SECRET_KEY=your_dojah_secret_key
   DOJAH_ENVIRONMENT=production
   ```
   *(Note: `vx_APP_ID`, `vx_SECRET_KEY`, and `vx_ENVIRONMENT` are also supported as backward-compatible aliases).*
3. Alternatively, super-administrators can update credentials at runtime in the Admin Portal; credentials are encrypted in PostgreSQL using `SYSTEM_ENCRYPTION_KEY` (AES-256).

---

## 6. Legal & Regulatory Compliance Safeguards

To prevent regulatory risks and intellectual property infringements:
1. **No "Official NIMC" Claims**:
   * All marketing copy, API documentation, and UI elements refer to **"Identity Verification & Standardized PDF Slips"**, **"Registry demographics"**, or **"Standardized A4 dual-slip templates"**.
   * Never refer to slips as "official government documents" or "issued by NIMC".
2. **Explicit Consent & Audit Trails**:
   * All verification queries and slip generations require explicit subscriber/user consent checkboxes or API consent declarations.
   * Every query is recorded in the PostgreSQL audit log with timestamp, IP, actor, and purpose.
3. **Target Audience**:
   * Positioned strictly as developer infrastructure for fintechs, digital lenders, online gaming/betting operators, and enterprise fraud prevention teams.

---

## 7. Build and Deployment

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run all apps simultaneously (API, Dashboard, Docs, WWW)
npm run dev
```

### Production Build Verification
```bash
# Verify entire monorepo
npm run build

# Or test individual workspaces
npm run build --workspace=apps/api
npm run build --workspace=apps/dashboard
```

### Docker / Coolify Deployment
* Production compose file: `docker-compose.coolify.yml` or `docker-compose.yml`.
* Ensure environment variables (`GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `PAYSTACK_SECRET_KEY`, `DOJAH_APP_ID`, `DOJAH_SECRET_KEY`, `JWT_SECRET`) are configured in your deployment platform's environment settings.
