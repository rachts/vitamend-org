<p align="center">
  <img src="https://raw.githubusercontent.com/rachts/vitamend-org/main/public/logo.png" alt="VitaMend Logo" width="140"/>
</p>

<h1 align="center">VitaMend</h1>

<p align="center">
  <strong>AI-Powered Medicine Donation & Redistribution Platform</strong><br>
  Connecting surplus medicines with communities that need them—securely, transparently, and intelligently.
</p>

<p align="center">
  <a href="https://github.com/rachts/vitamend-org/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"/>
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Auth.js-v5-3B82F6" alt="Auth.js"/>
</p>

---

# 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Design Philosophy](#design-philosophy)
- [Security & Compliance](#security--compliance)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

# Overview

**VitaMend** is an AI-powered medicine donation and redistribution platform that bridges the gap between medicine surplus and healthcare scarcity.

Millions of medicines remain unused while countless patients struggle to access essential treatment. VitaMend provides a secure, intelligent, and transparent ecosystem where individuals, NGOs, pharmacies, and healthcare institutions can safely donate, verify, and redistribute unused medicines.

The platform combines **artificial intelligence**, **computer vision**, and **pharmacist verification** to ensure that every medicine entering the ecosystem is authentic, safe, and compliant before reaching its next recipient.

> **Every donation verified. Every medicine tracked. Every life empowered.**

---

# Key Features

| Feature | Description |
|----------|-------------|
| 🤖 **AI Medicine Recognition** | Extracts medicine name, composition, dosage, quantity, manufacturer, batch number, and expiry date using AI-powered OCR. |
| 🔍 **Automated Verification Pipeline** | Detects damaged packaging, expired medicines, and suspicious submissions before manual review. |
| 🏥 **Pharmacist Approval System** | Licensed pharmacists perform the final verification before medicines become available for redistribution. |
| 📊 **Impact Dashboard** | Track donations, environmental impact, beneficiaries reached, and overall healthcare contribution. |
| 📦 **Inventory Management** | Monitor available medicines, expiry timelines, stock levels, and distribution status in real time. |
| 🌍 **Transparent Distribution Ledger** | Maintain complete traceability from donor to recipient through immutable transaction records. |
| 🔐 **Role-Based Authentication** | Secure authentication powered by Auth.js with separate roles for donors, pharmacists, volunteers, NGOs, and administrators. |
| 🔔 **Real-Time Notifications** | Instant updates for verification, pickup scheduling, inventory alerts, and donation progress. |
| 📱 **Progressive Web App** | Responsive experience with offline support and installable mobile interface. |

---

# System Architecture

```
                    ┌────────────────────┐
                    │     Next.js 15     │
                    │    App Router UI   │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Route Handlers    │
                    │   REST API Layer   │
                    └──────┬───────┬─────┘
                           │       │
               ┌───────────┘       └─────────────┐
               ▼                                 ▼
      ┌────────────────┐              ┌──────────────────┐
      │ Authentication │              │ AI OCR Pipeline  │
      │   Auth.js v5   │              │ Gemini + OpenAI  │
      └────────────────┘              └─────────┬────────┘
                                                │
                                                ▼
                                     ┌──────────────────┐
                                     │    MongoDB       │
                                     │   Mongoose ORM   │
                                     └──────────────────┘
```

---

# Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **UI Framework** | Tailwind CSS, Radix UI |
| **Authentication** | Auth.js (NextAuth v5) |
| **Database** | MongoDB + Mongoose |
| **Artificial Intelligence** | Google Gemini, OpenAI, AI SDK |
| **Image Processing** | OCR Pipeline, Computer Vision |
| **Testing** | Vitest, Playwright |
| **Deployment** | Vercel, Railway, Docker |

---

# API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | ALL | Authentication |
| `/api/ai/ocr` | POST | Extract medicine details |
| `/api/ai/verify-medicine` | POST | AI medicine verification |
| `/api/donations` | GET / POST | Manage donations |
| `/api/inventory` | GET / POST | Inventory operations |
| `/api/inventory/alerts` | GET | Expiry & stock alerts |
| `/api/dashboard/stats` | GET | Dashboard analytics |
| `/api/dashboard/activity` | GET | Activity timeline |
| `/api/admin/review` | GET / PATCH | Pharmacist review queue |
| `/api/analytics` | GET | Platform analytics |
| `/api/transparency/ledger` | GET | Public donation ledger |

---

# Design Philosophy

VitaMend intentionally avoids conventional "startup" design patterns.

Instead, it embraces an editorial-inspired visual language that communicates trust, healthcare professionalism, and premium craftsmanship.

### Color Palette

- Warm Linen — `#F5F2EC`
- Olive Green — `#3E492B`
- Earth Brown — `#8A6A4A`
- Soft Stone — `#E6E2D8`

### Typography

- **Cormorant Garamond** — Elegant editorial headings
- **Inter** — Clean, modern body typography

### Visual Language

- Minimalist layouts
- Soft shadows
- Organic spacing
- Fine-grain textures
- Premium card components
- High readability and accessibility

---

# Security & Compliance

VitaMend follows security-first engineering practices.

- ✅ End-to-end encrypted communication
- ✅ Encryption at rest and in transit
- ✅ Role-Based Access Control (RBAC)
- ✅ Secure HTTP-only session cookies
- ✅ CSRF protection
- ✅ Comprehensive audit logging
- ✅ AI-assisted medicine verification
- ✅ Automated recall validation
- ✅ Full donation traceability

---

# Screenshots

<p align="center">
  <img src="./public/images/community_impact.png" width="45%" alt="Community Impact"/>
  &nbsp;
  <img src="./public/images/pharmacist_verify.png" width="45%" alt="Pharmacist Dashboard"/>
</p>

<p align="center">
  <img src="./public/images/clinic_connect.png" width="45%" alt="Clinic Connect"/>
  &nbsp;
  <img src="./public/images/volunteer_donate.png" width="45%" alt="Volunteer Portal"/>
</p>

---

# Deployment

VitaMend can be deployed using:

- ▲ Vercel
- 🚄 Railway
- 🐳 Docker
- ☁️ Any Node.js-compatible cloud platform

---

# Roadmap

- AI medicine authenticity detection
- Barcode & QR code verification
- NGO logistics optimization
- Predictive inventory forecasting
- Medicine recommendation engine
- Volunteer mobile application
- Hospital integration APIs
- Blockchain-backed transparency ledger

---

# Contributing

Contributions are always welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

Please ensure all code follows the existing style guidelines and passes the test suite before submission.

---

# Team

Built with passion by the **VitaMend Team**, committed to reducing medicine waste and improving healthcare accessibility.

👥 **Founders**

https://vitamend-ngo.vercel.app/founders

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for additional details.

---

<p align="center">
  <strong>Built with ❤️ to reduce medicine waste and improve healthcare accessibility.</strong><br>
  <sub>Every donation has the potential to save a life.</sub>
</p>