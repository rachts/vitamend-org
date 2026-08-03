# 🚀 VitaMend Deployment Guide

This guide explains how to run and deploy the VitaMend project.

## Requirements

Before getting started, make sure you have:

- Node.js 18+
- npm
- MongoDB Atlas account
- Vercel account (for deployment)

---

## 1. Clone the Repository

```bash
git clone https://github.com/rachts/vitamend-official.git
cd vitamend-official
```

Install dependencies:

```bash
npm install
```

---

## 2. Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
BLOB_READ_WRITE_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Fill in the values according to your setup.

---

## 3. Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 4. Deploy on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables.
4. Click **Deploy**.

That's it.

---

## MongoDB Atlas

1. Create a cluster.
2. Create a database user.
3. Allow network access.
4. Copy the connection string.
5. Add it as:

```env
MONGODB_URI=your_connection_string
```

---

## Build Commands

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Start Production

```bash
npm start
```

Type Checking

```bash
npm run type-check
```

---

## Common Issues

### MongoDB Connection Error

- Check the connection string.
- Verify database user credentials.
- Ensure network access is enabled.

### Build Errors

Run

```bash
npm run build
```

locally to identify any issues before deploying.

### Environment Variables Not Found

Make sure all required variables are added to both your local `.env.local` file and the Vercel project settings.

---

## OCR Service (Optional)

The repository also includes an optional FastAPI OCR service used for medicine verification.

Run it separately if OCR functionality is required.

---

## Notes

This project was developed as a hackathon prototype. Some services such as Google OAuth and the OCR module are optional and can be disabled during local development if not required.