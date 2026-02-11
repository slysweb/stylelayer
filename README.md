Project Specification: StyleLayer AI (MVP)
1. Project Overview
Build a high-end web application that allows users to upload a fashion portrait and generates a "Deconstructed Outfit" layout using the Jimeng (Jimeng AI) API.

Target Market: Global (US/EU)

Tech Stack: Next.js 15 (App Router), Cloudflare Pages, Cloudflare R2 (Storage), Tailwind CSS, Lucide React (Icons).

UI/UX Style: Minimalist, Editorial, High-Fashion (Ref: Vogue, Apple, Canva).

2. Core Features (Sprint 1)
Image Upload: Drag-and-drop or click to upload to Cloudflare R2.

AI Generation: Trigger Jimeng AI API via a secure backend route (Cloudflare Workers/Server Actions).

Result Display: Show a side-by-side "Before/After" view.

Download & Share: Export the generated deconstructed image in high resolution.

Layout Selection: Simple presets (Knolling style, Editorial style).

3. Technical Architecture & Implementation Details
A. Storage (Cloudflare R2)
Bucket Name: style-layer-assets

Method: Use S3-Compatible API via @aws-sdk/client-s3.

Logic: Frontend requests a Presigned URL -> Direct upload to R2 (to save bandwidth).

B. Backend (Next.js Server Actions)
Endpoint: POST /api/generate

Integration: * Call Jimeng AI API (Volcano Engine/ByteDance).

Prompt logic: "Deconstruct the clothing of the main person in the image into jacket, inner wear, pants, and shoes. Arrange them in a knolling layout (OOTD style) on a clean minimalist background."

Polling: Implement a polling or webhook mechanism to check generation status from Jimeng.

C. Database (Cloudflare D1)
Schema: * users: id, email, credits.

generations: id, userId, originalImageUrl, generatedImageUrl, status, createdAt.

4. UI/UX Requirements for Cursor
Copy this to Cursor: "Please design a modern, high-fashion web interface. Use a clean white/off-white background. The Hero section should feature a bold Serif title 'StyleLayer AI'. Create a split-screen component where the left side is an upload zone and the right side is a placeholder for the AI result. Ensure it is fully responsive for mobile users."

5. Environment Variables Template (.env.local)
Plaintext
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key_id
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=style-layer-assets
R2_PUBLIC_DOMAIN=https://your-pub-link.com

# Jimeng AI (Volcano Engine)
JIMENG_API_KEY=your_api_key
JIMENG_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/images/generations

# Database
DATABASE_ID=your_d1_db_id
6. Development Step-by-Step Instructions
Step 1: Setup Next.js 15 project with Tailwind CSS and Shadcn UI.

Step 2: Configure Cloudflare R2 client in lib/s3.ts.

Step 3: Build the /upload API to generate presigned URLs.

Step 4: Build the Generation UI with a loading state (Shimmer effect).

Step 5: Integrate the Jimeng AI API call in actions/generate-outfit.ts.

Step 6: Add "Download" functionality and basic responsive styling.

7. Prompts for Jimeng AI (Hardcoded for MVP)
To ensure high quality, use the following hidden prompt additions:

"...high quality fashion photography, soft shadows, studio lighting, highly detailed textures, realistic fabric, 4k resolution, clean edges, minimalist background."