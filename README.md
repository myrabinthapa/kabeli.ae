# Kabeli website — Vercel deployment

Production-oriented Astro static site for **kabeli.ae**.

## Deploy

1. Upload this folder to a GitHub repository.
2. In Vercel, import the repository and select the **Astro** framework preset.
3. Build command: `npm run build`; output directory: `dist`; install command: `npm ci`.
4. Deploy. Add custom domain `kabeli.ae` and follow the DNS records provided **by your Vercel project**.
5. Verify homepage, `/contact`, `/privacy`, `/terms`, `/sitemap.xml`, and `/robots.txt` on production.

## Local development

`npm ci` then `npm run dev` / `npm run build`.

## Contact behaviour

Contact form uses a **mailto draft**, not a backend. Visitor must press **Send** in their own email app. Confirm `hello@kabeli.ae` is an active mailbox before launch. If you need server-side delivery, add a protected API, provider key in Vercel environment variables, anti-spam, and update the privacy policy.

## Pre-launch business/legal review

Confirm the company's exact registered trade name, RAKEZ jurisdiction and mailbox. Have qualified UAE counsel review the privacy notice and website terms for your actual processing/contract requirements. Current copy does not assert testimonials, case studies, awards, or registered numbers without evidence. Update the policies if analytics, advertising pixels, CRM/form storage, or other third-party services are added.

## SEO

Canonical and Open Graph meta tags, organisation structured data, robots and sitemap are included. After deployment, submit sitemap to Google Search Console. Ensure custom domain redirects (www vs apex) are configured in Vercel.
