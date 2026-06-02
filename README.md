# 🦷 OdontoFlow — Frontend

> Angular SPA for a multi-tenant dental clinic SaaS: agenda with drag-and-drop, interactive odontogram, patient records, radiographs, finances and subscription billing.

**🌐 Language:** **English** · [Português 🇧🇷](README.pt-BR.md)

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-M2-757575?logo=angular&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

> ℹ️ **Portfolio project.** UI copy is in pt-BR (Brazilian product); the codebase, comments and commits are in English.

---

## Overview

The frontend for **OdontoFlow**, a B2B platform for dental clinics. It pairs with the [Spring Boot API](https://github.com/diegodinizm1/odontoflow-back) and showcases a cohesive, hand-crafted design system — **"Clinical Calm"**: a warm paper background, a deep pine-teal accent, **Fraunces** display type with **Hanken Grotesk** for UI, and rounded Material Symbols.

## Screenshots

| Dashboard | Login |
|-----------|-------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Login](docs/screenshots/login.png) |

| Weekly agenda (drag & drop) | Interactive odontogram |
|------------------------------|------------------------|
| ![Agenda](docs/screenshots/agenda.png) | ![Odontogram](docs/screenshots/odontogram.png) |

| Patient record | Subscription plans |
|----------------|--------------------|
| ![Record](docs/screenshots/prontuario.png) | ![Billing](docs/screenshots/billing.png) |

<details>
<summary>More — onboarding, finances &amp; team</summary>

| Onboarding | Finances | Team |
|------------|----------|------|
| ![Onboarding](docs/screenshots/onboarding.png) | ![Finances](docs/screenshots/financial.png) | ![Team](docs/screenshots/team.png) |

</details>

## Features

- 📊 **Dashboard** — landing overview with KPI cards (patients, today's appointments, monthly revenue, pending) and today's agenda.
- 🔐 **Auth & onboarding** — login and a two-step clinic registration stepper, followed by a guided setup checklist.
- 📅 **Agenda** — weekly calendar with appointment blocks you can **drag & drop to reschedule** (with server-side overlap checks), create and cancel.
- 🦷 **Interactive odontogram** — anatomically drawn teeth (SVG), click-to-cycle tooth status, live legend; in-memory state saved as a single payload.
- 👥 **Patients** — searchable list, create/edit form, full clinical record (odontogram + evolution timeline + radiographs).
- 🖼️ **Radiographs** — direct browser upload to object storage via **pre-signed URLs**.
- 💰 **Finances** — charges with status pills and monthly revenue summary.
- 💳 **Billing** — Free / Essencial / Pro plan cards, current subscription and invoices.
- 🧑‍⚕️ **Team** — invite and manage dentists and receptionists.

## Tech stack

| Area | Technology |
|------|-----------|
| Framework | Angular 21 (standalone components, **signals**) |
| Language | TypeScript |
| UI | Angular Material (M2) + Tailwind CSS v3 |
| Type & icons | Fraunces · Hanken Grotesk · Material Symbols Rounded |
| State | Signals + `model()` two-way binding |
| HTTP | `HttpClient`, functional interceptor (JWT), route guards |
| Routing | Lazy-loaded standalone routes |

## Architecture notes

- **Standalone + signals** throughout — no NgModules; reactive state via `signal`/`computed`/`model`.
- **`authInterceptor`** attaches the JWT to API calls only — pre-signed storage URLs keep their own signature.
- **`authGuard`** protects the app shell; the JWT is decoded client-side for `role`/`tenant_id`.
- **Feature-first structure** with a shared `core/` (models, services, guards, interceptors).
- **Design system in one place** — `styles.scss` defines the Material theme, design tokens and component primitives.

```
src/app
├── core/
│   ├── models/        # typed API contracts
│   ├── services/      # Auth, Patient, Appointment, Charge, Billing, Team…
│   ├── interceptors/  # authInterceptor
│   ├── guards/        # authGuard
│   └── utils/         # datetime helpers
├── features/
│   ├── auth/          # login, register
│   ├── shell/         # sidenav layout
│   ├── agenda/        # weekly calendar + drag & drop
│   ├── patients/      # list, form, prontuário (odontogram, radiographs)
│   ├── financial/     # charges
│   ├── billing/       # plans & invoices
│   ├── team/          # members
│   └── onboarding/    # post-register checklist
└── styles.scss        # design system (Material theme + tokens)
```

## Getting started

### Prerequisites
- Node.js 18+
- The [OdontoFlow backend](https://github.com/diegodinizm1/odontoflow-back) running on `http://localhost:8080`

### Run

```bash
npm install
npm start          # ng serve → http://localhost:4200
```

The API base URL is configured in `src/environments/environment.ts` (`http://localhost:8080/api`).

### Build

```bash
npm run build      # production build into dist/
```

## License

MIT — built as a portfolio project.
