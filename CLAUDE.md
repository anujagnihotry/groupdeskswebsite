# GroupDesks — launch website (groupdesks.com)

## Product
GroupDesks is a shared team inbox for business WhatsApp numbers and WhatsApp groups. Teams split work into "desks" (Sales, Support, Dispatch & ops, Accounts, Owners, Communities) that all work the same chats. Key points: keep your existing number, many people logged in to one number at once from different places, web + Android + iOS apps, assignment, internal notes, group management at scale. Market: India first, broad audience (traders/distributors, growing teams, multi-branch companies).

## Current state
- `index.html` is a single self-contained static page (HTML + CSS + vanilla JS, no build step). Open it in a browser to preview.
- Sections: header, hero with inbox mock, problems, use-case tabs, features, 3 steps, "same number, many places", pricing, FAQ, early access (form + WhatsApp chat CTA), footer.
- English only. No dark mode by design.

## Design rules (keep these)
- Backgrounds: only White `#FFFFFF` and Ice blue `#EEF6FF` (plus soft tints). **No dark backgrounds, bands or footers.** Nothing green (avoid looking like WhatsApp or Periskope).
- Azure `#1468C8` = trust: headings accents, links, tabs, secondary buttons, logo.
- Sunny `#FFC93C` = action: primary buttons, highlights, step numbers. Always navy text on sunny.
- Navy `#0E2A47` text; Slate `#48607A` body copy; Muted `#5B6F87` captions; lines `#D6E4F5` / `#B9CFEA`.
- Desk tags (tint / text): Sales `#FFF3C9`/`#6B4A00`, Support `#E3F0FF`/`#0F57AA`, Dispatch `#EFEAFE`/`#5235B8`, Accounts `#FFE9DC`/`#9A3F15`.
- Fonts (Google Fonts): Sora (display), Figtree (body), JetBrains Mono (small labels/timestamps).
- Logo: two overlapping chat bubbles (azure + sunny) = two desks sharing one conversation; wordmark "Group" navy + "Desks" azure. Currently inline SVG in the header.
- Keep text/background contrast at WCAG AA (4.5:1). White text on azure is fine; never white text on sunny.
- No invented stats, customer logos or testimonials.

## Placeholders to fill
- `₹[PRICE]` and `[N]` in pricing
- `[EMAIL]` in footer
- `[+91 XXXXX XXXXX]` and `[NUMBER]` in the WhatsApp CTA (`https://wa.me/<number>`)

## Open TODOs
- Wire the early-access form (see `TODO` in the script) to a backend or form service; it currently only shows a thank-you state.
- Confirm product claims: "link your existing number", Android + iOS apps.
- Possible next steps: split CSS/JS into files, add favicon + OG image from the logo, separate use-case landing pages (e.g. distributors), privacy/terms pages, analytics, deploy to groupdesks.com hosting.
