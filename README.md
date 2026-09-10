<div align="center">

<h1>VitaMend</h1>

<p>AI-powered pharmaceutical redistribution platform — bridging surplus medicine with underserved community health clinics across India.</p>

<p>
  <a href="https://vitamend-ngo.vercel.app/"><strong>Live Demo →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/rachts/vitamend-org/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/rachts/vitamend-org/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</p>

<p>
  <img src="https://img.shields.io/github/contributors/rachts/vitamend-org?style=flat-square" alt="Contributors" />
  <img src="https://img.shields.io/github/forks/rachts/vitamend-org?style=flat-square" alt="Forks" />
  <img src="https://img.shields.io/github/stars/rachts/vitamend-org?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/github/issues/rachts/vitamend-org?style=flat-square" alt="Issues" />
  <img src="https://img.shields.io/github/license/rachts/vitamend-org?style=flat-square" alt="License" />
</p>

</div>

---

## About

Every year, over ₹5,000 crore worth of unopened, non-expired pharmaceuticals are discarded in urban India, while thousands of rural community health centres face critical shortages of essential antibiotics and chronic-care medications.

VitaMend closes this gap through a four-stage pipeline:

| Stage | What happens |
|---|---|
| **AI OCR Verification** | Gemini 1.5 Flash Vision scans medicine labels — extracting name, batch, expiry, and manufacturer with confidence scoring |
| **Pharmacist Review** | Every AI extraction requires secondary sign-off from a CDSCO-licensed pharmacist |
| **Automated Routing** | Verified surplus is matched to clinics reporting shortages via priority queue |
| **Chain-of-Custody Ledger** | Cryptographic tracking from donor intake to clinic dispatch |

---

## Tech Stack

- **Framework** — Next.js 14 (App Router, Server Components)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Database** — MongoDB Atlas via Mongoose
- **Auth** — Auth.js v5 (Credentials, JWT, RBAC)
- **AI / OCR** — Google Gemini 1.5 Flash Vision
- **Rate Limiting** — Upstash Redis
- **Validation** — Zod on all API inputs

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Donor     │────▶│  Next.js    │────▶│  MongoDB Atlas  │
│   Upload    │     │  App Router │     │  (Mongoose)     │
└─────────────┘     └──────┬──────┘     └─────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌──────────┐
        │ Gemini  │  │ Upstash │  │ Auth.js  │
        │  OCR    │  │  Redis  │  │   v5     │
        └─────────┘  └─────────┘  └──────────┘
```

**Key design decisions:**
- Server components for SEO and reduced client bundle
- Async AI pipeline — donations persist immediately, verified in background
- Levenshtein distance duplicate detection to block batch resubmission fraud
- Rate limiting scoped to donation and OCR endpoints

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- MongoDB Atlas cluster (or local instance)
- Upstash Redis instance
- Google Generative AI API key

```sh
node -v  # >= 20.0.0
npm -v   # >= 10.0.0
```

### Installation

```sh
# 1. Clone
git clone https://github.com/rachts/vitamend-org.git
cd vitamend-org

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — see Environment Variables below

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vitamend?retryWrites=true&w=majority
MONGODB_DB_NAME=vitamend

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# AI / OCR
GEMINI_API_KEY=your-gemini-api-key

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# CORS (production)
ALLOWED_ORIGINS=https://vitamend.in
```

---

## Usage

### Donor Flow
1. Sign up and upload photos of surplus medicines
2. AI OCR extracts label data (name, batch, expiry, manufacturer)
3. A licensed pharmacist reviews the extraction and packaging integrity
4. Approved medicines enter the live surplus registry

### Clinic Flow
1. Register your clinic with a valid state medical licence
2. Report urgent medicine deficits via the priority queue
3. Receive automated surplus allocation alerts
4. Track dispatches via the cryptographic ledger

### Admin / Pharmacist Dashboard
- Review AI-extracted donations pending pharmacist sign-off
- Override AI decisions when necessary
- Monitor real-time platform stats and inventory

---

## Roadmap

- [x] AI OCR medicine label scanning (Gemini 1.5 Flash Vision)
- [x] Licensed pharmacist review workflow
- [x] Role-based access control (donor, volunteer, admin)
- [x] Rate limiting & Zod input validation
- [x] Real-time surplus inventory registry
- [x] Cryptographic verification ledger
- [x] PWA manifest & offline support
- [ ] SMS/email notifications for clinic allocations
- [ ] Distribution tracking & patient-treatment metrics
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Mobile app (React Native)

See [open issues](https://github.com/rachts/vitamend-org/issues) for the full list.

---

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a pull request

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## Contact

**Rachit Tiwari** — [@rachts](https://github.com/rachts) — vitamend.org@gmail.com

- Repository: [github.com/rachts/vitamend-org](https://github.com/rachts/vitamend-org)
- Live site: [vitamend-ngo.vercel.app](https://vitamend-ngo.vercel.app)
