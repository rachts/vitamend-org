# VitaMend — Production OCR & Google Gemini Setup Guide

This document outlines the architecture, configuration, and operational guidelines for VitaMend’s built-in Optical Character Recognition (OCR) Engine powered by **Google Gemini AI** (`gemini-1.5-flash`) inside **Next.js 15 App Router**.

---

## 1. Architecture Overview

To maintain low latency, serverless deployment efficiency, and zero external dependency friction, the entire OCR and pharmaceutical validation pipeline runs directly inside Next.js without requiring standalone microservices or complex billing setups.

```
┌───────────────────────────────┐
│ Client (Donation Wizard UI)   │
│ app/(public)/donate/          │
└──────────────┬────────────────┘
               │ Multipart/form-data (Field: image)
               ▼
┌───────────────────────────────┐
│ Next.js API Route             │
│ app/api/ocr/route.ts          │
└──────────────┬────────────────┘
               │
               ├── 1. Size & Mime-Type check (Max 10MB, JPG/PNG/WEBP/PDF)
               ├── 2. Gemini OCR Engine (lib/ai/gemini-ocr.ts) ──► Google Gemini API
               ├── 3. Property Extractor (lib/extractor.ts)
               └── 4. Pharmaceutical Validator (lib/validator.ts)
```

### Key Modules:
- **`app/api/ocr/route.ts`**: The secure API endpoint handling rate-limiting, file boundary checks, image buffer extraction, and JSON response formation.
- **`lib/ai/gemini-ocr.ts`**: Handles secure server-side SDK calls via `@google/generative-ai` (`gemini-1.5-flash`), performing intelligent pharmaceutical field extraction and OCR text detection.
- **`lib/vision.ts`**: Compatibility layer routing buffer analysis requests directly to `gemini-ocr.ts`, computing symbol confidence scores and blur detection without external cloud credentials.
- **`lib/extractor.ts`**: Parsing engine extracting regulatory identifiers: **Medicine Name**, **Dosage Strength**, **Batch / Lot Number**, **Expiration Date**, **Manufacturer**, and **MRP**.
- **`lib/validator.ts`**: Enforces CDSCO rules and drug distribution safety policies (rejects expired products, warns on near-expiration items, requires batch trackability).
- **`types/medicine.ts`**: TypeScript type definitions ensuring type-safety across front-end and API layers.

---

## 2. Google Gemini API Setup Instructions

The Gemini API offers a robust, free tier with no credit card or billing configuration required.

### Step 1: Obtain a Free Gemini API Key
1. Visit Google AI Studio: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Click **Create API key**.
3. Select an existing Google Cloud project or let AI Studio create one automatically.
4. Copy your newly generated API key. No billing account is needed for the Gemini Flash model.

---

## 3. Environment Configuration (`.env.local`)

Add your Gemini API key to `.env`, `.env.local`, and `.env.production`:

```env
# Get free API key from:
# https://aistudio.google.com/apikey
# No billing required for Gemini Flash
GEMINI_API_KEY=your_actual_api_key_here
```

### Development Simulation Mode
When developing offline or running Automated unit tests without network access, the system automatically defaults to test-mode mock extraction, or you can explicitly enable it:

```env
MOCK_OCR_MODE="true"
```

---

## 4. Testing Suite

The OCR pipeline includes unit tests built with **Vitest**, verifying extraction accuracy against sample prescription drug labels, regulatory safety assertions, and HTTP route error handling.

To run the full OCR testing suite locally:

```bash
# Execute unit test suite once
npm test

# Run tests in continuous watch mode
npm run test:watch
```

### Test File Inventory:
- **`tests/fixtures/sample-labels.ts`**: Contains authentic mock text from packaging scans (Amoxicillin, Lisinopril, Paracetamol) and simulated error states.
- **`tests/extractor.test.ts`**: Validates proper extraction of doses, brand origins, alphanumeric batches, and dates.
- **`tests/validator.test.ts`**: Enforces strict rejection of past expiration dates (`isBefore`) and requires lot trackability.
- **`tests/ocr-api.test.ts`**: Simulates HTTP Multipart/Form-Data requests, verifying adherence to 10MB size limits and image formats.

---

## 5. Error Handling Reference

When an upload fails inspection, the `/api/ocr` route returns structured JSON with clear user actionable diagnostic codes:

| Error Code | HTTP Status | Trigger Condition | Recommended User Action |
| :--- | :--- | :--- | :--- |
| `NO_TEXT_DETECTED` | `422 Unprocessable` | OCR Engine couldn't recognize characters | Attach a picture containing the packaging label text |
| `BLURRED_IMAGE` | `422 Unprocessable` | Average word confidence falls below 55% | Re-take photograph in stable, natural ambient lighting |
| `LOW_CONFIDENCE` | `422 Unprocessable` | Ambiguous symbols or distorted ink | Manually type label attributes in the Edit Preview form |
| `LARGE_FILE` | `413 Payload Too Large` | Image file size exceeds 10 MB | Compress image or select lower resolution camera setting |
| `UNSUPPORTED_FILE` | `415 Unsupported Media`| Format is not JPG, JPEG, PNG, WEBP, or PDF | Convert file or select a compatible image asset |
| `API_ERROR` | `500 Internal Error` | Network connectivity failure or invalid API key | Check system networking or `.env.local` API key |
