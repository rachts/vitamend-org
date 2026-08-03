# Deployment Guide

Deploying VitaMend on Vercel is relatively straightforward but has a few gotchas.

## Environment Variables
You need these set in Vercel before you deploy, or your build might fail (or the app will crash on load).

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0...
# Auth
NEXTAUTH_SECRET=generate_something_random
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
# AI
GEMINI_API_KEY=your_gemini_key
# Other
ALLOWED_ORIGINS=https://your-custom-domain.com
```

## Vercel Steps
1. Import your repository into Vercel.
2. Select the "Next.js" framework preset.
3. Paste in all the environment variables.
4. Hit Deploy.

## Gotchas & Fixes
- **Auth.js with Vercel Preview URLs**: If you're using preview deployments, the `NEXTAUTH_URL` will be wrong for the preview URL. NextAuth v5 usually infers this, but double check if login fails on previews.
- **Middleware CORS**: The middleware restricts access by origin. Make sure you add `.vercel.app` to your allowed origins or your preview deployments will get blocked.
- **Edge Runtime Warnings**: You might see warnings during build about `jose` and `CompressionStream`. These are safe to ignore, they are silenced in `next.config.mjs`.