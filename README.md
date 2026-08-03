# VitaMend

A platform for medicine redistribution to tackle surplus medicine waste in India. 

## Why I Built This
Growing up, I constantly saw perfectly good medicine expire in our family cabinet while knowing that rural clinics just a few miles away were struggling with critical shortages. The bureaucracy around donating medicine is intense, and the manual verification processes make it almost impossible to scale. I built VitaMend to bridge this gap, using AI OCR to automate the intake and verification of donations, and matching those with real-time clinic shortage data.

## What I Learned
Building this wasn't straightforward. Handling image uploads, OCR, and trying to get structured data out of AI models reliably took a lot of iteration. I originally tried to use a complex scoring system for AI verification, but realized simple thresholds were much more robust. I also learned a lot about Next.js 15 routing, caching, and how to properly set up Auth.js (NextAuth v5) with MongoDB.

## Known Issues
- Gemini 1.5 Flash OCR sometimes returns markdown blocks (```json) instead of raw JSON, which breaks the parsing step. I've added a fallback to strip these, but it's brittle.
- MongoDB connection drops occasionally on cold start in serverless environments.
- Fuzzy matching for duplicate medicines is too naive. It will match "Paracetamol" and "Para-Cetamol" as completely different medicines. Needs a proper Levenshtein distance implementation.
