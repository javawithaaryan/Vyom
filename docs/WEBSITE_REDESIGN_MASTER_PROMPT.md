# Website Redesign & Production Readiness — Master Prompt

> **How to use:** Copy everything below the divider into an AI assistant or attach as a team brief. Replace all `{{PLACEHOLDER}}` values before execution. Do not invent analytics numbers, user counts, or performance baselines—measure the live site first.

---

## Required Inputs (supply before starting)

| Input | Required | Notes |
|-------|----------|-------|
| `{{SITE_URL}}` | Yes | Production and staging URLs |
| `{{STAGING_URL}}` | Recommended | For safe QA |
| `{{PRIMARY_PERSONA}}` | Yes | Role, goals, pain points (1–2 paragraphs) |
| `{{SECONDARY_PERSONAS}}` | Optional | Additional audiences |
| `{{BRAND_VOICE}}` | Yes | Tone adjectives + anti-patterns (e.g. avoid “synergy”, robotic CTAs) |
| `{{DESIGN_FILES}}` | If any | Figma/Sketch links, export paths, or “greenfield” |
| `{{ANALYTICS_ACCESS}}` | Recommended | GA4, Plausible, Mixpanel, or “none—install in Phase 2” |
| `{{AUTH_MODEL}}` | Yes | None / email-password / OAuth / SSO |
| `{{TECH_STACK}}` | Yes | e.g. React + Vite, Node API, Python ML service |
| `{{REPO_PATH}}` | Yes | Monorepo layout, deploy targets |
| `{{LEGAL_REQUIREMENTS}}` | Yes | GDPR, COPPA, industry regs |
| `{{EXISTING_SITEMAP}}` | Optional | Crawl output or manual list |
| `{{SUCCESS_KPIS}}` | Yes | Business metrics the redesign must support |
| `{{CONSTRAINTS}}` | Optional | Budget, timeline, must-keep URLs, brand colors to retain |

**Example (Vyom — replace with your truth):**

- Site: `{{SITE_URL}}` — fraud/scam detection product (“Vyom AI”)
- Persona: security-conscious consumer or SMB ops lead monitoring transactions and messages
- Stack: `client/` (React), `server/` (Node), `ai-engine/` (Python)
- Auth: email/password + protected dashboard routes

---

# MASTER PROMPT BODY (give this to AI or team)

You are a senior UX/UI/product engineer and full-stack designer. Audit, redesign, and deliver a **production-ready**, **human-centric** website that feels **handcrafted and alive**, not generic or AI-slop. Every recommendation must include **measurable acceptance criteria** and **test steps**. Use industry best practices only—no fictional metrics or invented user research.

**Product personality (customize):**

| Attribute | Target |
|-----------|--------|
| Tone | Warm, clear, confident—not corporate sterile |
| Emotional response | Trust, calm vigilance, competence |
| Anti-patterns | Purple-gradient SaaS clichés, lorem ipsum, fake testimonials, hollow superlatives |
| Visual | High contrast, depth in neutrals, warm accents used sparingly for emphasis |

---

## 1) Project Overview

### Mission statement (template)

> We help `{{PRIMARY_PERSONA}}` accomplish `{{CORE_JOB_TO_BE_DONE}}` by `{{PRIMARY_VALUE_PROP}}`, with an experience that feels `{{BRAND_VOICE}}`.

### Success metrics

| Type | KPI | Target (measure baseline first) | How to measure |
|------|-----|--------------------------------|----------------|
| Quantitative | LCP | < 2.5s on mobile (75th percentile) | Lighthouse, CrUX if available |
| Quantitative | CLS | < 0.1 | Lighthouse |
| Quantitative | INP / TTI proxy | INP < 200ms where tracked | RUM, Lighthouse |
| Quantitative | Task completion | e.g. signup → first dashboard view ≥ X% | Funnel in analytics |
| Quantitative | Error rate | Form/API errors < agreed threshold | Logs, Sentry |
| Qualitative | Brand perception | “Feels trustworthy / human” in moderated tests | 5-user sessions, SUS optional |
| Qualitative | A11y | Zero critical axe violations on key flows | axe, manual keyboard |
| SEO | Indexed core pages | All MVP URLs in sitemap, valid metadata | Search Console |
| Security | Critical vulns | 0 high/critical in dep scan before launch | npm audit, Snyk |

### Definition of done (release)

- [ ] All Phase 1 (MVP) pages pass functional + a11y + performance thresholds
- [ ] Design tokens documented and implemented in code
- [ ] Analytics events fire with documented payloads (privacy-compliant)
- [ ] Security checklist signed off
- [ ] QA matrix executed on target browsers/devices
- [ ] Rollback plan documented and tested once on staging

---

## 2) Full Site Inventory and Page Map

### 2.1 How to audit

**Automated discovery**

```bash
# Crawl (install first: npm i -g linkinator)
npx linkinator {{SITE_URL}} --recurse --skip "mailto:|tel:"

# Lighthouse CI (example)
npx lighthouse {{SITE_URL}} --output=json --output-path=./reports/lighthouse-home.json --chrome-flags="--headless"

# Accessibility quick scan
npx @axe-core/cli {{SITE_URL}}
```

**Manual checks**

- [ ] Click every nav item and footer link
- [ ] Logged-out vs logged-in route matrix
- [ ] Form submit success/failure/empty states
- [ ] 404 and deep links
- [ ] Print stylesheet (if required)
- [ ] robots.txt, sitemap.xml, canonical tags

**Deliverable:** `sitemap-inventory.md` with URL, page type, auth required, priority, owner.

### 2.2 Page-type table template

Duplicate one table per discovered page. Fill `{{PAGE_NAME}}`, `{{ROUTE}}`.

#### Page: `{{PAGE_NAME}}` — `{{ROUTE}}`

| Field | Content |
|-------|---------|
| **Purpose** | |
| **Primary user goals** | |
| **Secondary goals** | |
| **Required data / APIs** | |
| **Integrations** | Auth, payments, websockets, ML API, etc. |
| **Required components** | Buttons, forms, cards, modals, tables, toasts, charts |
| **Primary flows** | Step 1 → 2 → 3 |
| **Edge cases** | Empty data, API down, session expired, rate limit |
| **Functional acceptance criteria** | Given/When/Then bullets |
| **UX acceptance criteria** | Loading states, focus order, error recovery |
| **Performance** | LCP element identified; budget for JS weight |
| **Accessibility** | WCAG 2.1 AA checks for this page |
| **Priority** | MVP / Phase 2 / Phase 3 |
| **Effort** | S / M / L |

### 2.3 Standard page types (prefilled templates — customize)

#### Homepage `/`

| Field | Guidance |
|-------|----------|
| Purpose | Orient, build trust, primary CTA |
| Goals | Understand product; sign up or log in |
| Components | Hero, social proof (real only), feature grid, CTA, footer |
| Edge cases | Slow images, CTA without JS |
| Acceptance | LCP ≤ 2.5s; H1 one per page; CTA keyboard-focusable; contrast AA |
| Priority / Effort | MVP / M |

#### Listing / index (e.g. transactions, inbox)

| Field | Guidance |
|-------|----------|
| Purpose | Scan, filter, act |
| Components | Search, filters, table/cards, pagination, empty state |
| Edge cases | Zero results, 1000+ rows (virtualize), stale cache |
| Acceptance | Sort/filter announced to SR where needed; skeleton → content CLS < 0.1 |
| Priority / Effort | MVP / M |

#### Detail (e.g. single alert, transaction)

| Field | Guidance |
|-------|----------|
| Purpose | Deep context + actions |
| Components | Breadcrumb, metadata, actions, related items |
| Edge cases | 404 item, permission denied |
| Acceptance | Clear heading hierarchy; destructive actions confirmed |
| Priority / Effort | Phase 2 / M |

#### Dashboard (authenticated)

| Field | Guidance |
|-------|----------|
| Purpose | At-a-glance status + drill-down |
| Components | Sidebar/nav, stats, charts, activity feed, date range |
| Integrations | REST + websocket updates if real-time |
| Edge cases | Partial API failure, live updates while filtered |
| Acceptance | Session timeout redirect; live region for new alerts (optional) |
| Priority / Effort | MVP / L |

#### Account / auth (login, register, reset)

| Field | Guidance |
|-------|----------|
| Purpose | Secure access |
| Components | Forms, validation, password rules, OAuth buttons |
| Edge cases | Wrong password, locked account, email not verified |
| Acceptance | Labels associated; errors linked via `aria-describedby`; rate limit UX |
| Priority / Effort | MVP / M |

#### Checkout (if applicable)

| Field | Guidance |
|-------|----------|
| Purpose | Complete purchase |
| Acceptance | Progress indicator; confirm before charge; receipt state |
| Priority / Effort | Phase 2 / L |

#### Settings

| Field | Guidance |
|-------|----------|
| Purpose | Preferences, security, notifications |
| Acceptance | Save feedback; unsaved changes warning |
| Priority / Effort | Phase 2 / M |

#### Help / FAQ

| Field | Guidance |
|-------|----------|
| Purpose | Self-serve support |
| Acceptance | Accordion keyboard accessible; searchable content |
| Priority / Effort | Phase 2 / S |

#### 404 / error pages

| Field | Guidance |
|-------|----------|
| Purpose | Recover gracefully |
| Acceptance | Helpful copy + link home; HTTP status correct |
| Priority / Effort | MVP / S |

#### Legal (privacy, terms)

| Field | Guidance |
|-------|----------|
| Purpose | Compliance |
| Acceptance | Readable typography; last-updated date; linked from footer |
| Priority / Effort | MVP / S |

### 2.4 Vyom-oriented inventory starter (verify against repo)

| Route | Type | MVP? | Effort |
|-------|------|------|--------|
| `/` | Landing | Yes | M |
| `/login`, `/register` | Auth | Yes | M |
| `/dashboard` | Dashboard | Yes | L |
| `/fraud-detection` | Analyzer | Yes | M |
| `/scam-analyzer` | Inbox | Yes | M |
| `*` | 404 | Yes | S |

---

## 3) Component Library and Design System

### 3.1 Design token structure

**File layout (example)**

```
design-tokens/
  tokens.json          # Style Dictionary source
  css/
    variables.css      # --vyom-* custom properties
  tailwind/            # optional theme extension
```

**Generate tokens (example)**

```bash
npm install -D style-dictionary
# style-dictionary build --config sd.config.js
```

### 3.2 Color tokens (placeholders — calibrate with contrast checker)

| Token | Role | Example placeholder | Contrast rule |
|-------|------|---------------------|---------------|
| `--color-bg-base` | Page background | `#F7F4F0` warm off-white | Text on bg ≥ 4.5:1 |
| `--color-bg-surface` | Cards, panels | `#FFFFFF` | — |
| `--color-bg-elevated` | Modals, dropdowns | `#FFFFFF` + shadow | — |
| `--color-text-primary` | Body | `#1C1917` | ≥ 4.5:1 on surface |
| `--color-text-secondary` | Meta | `#57534E` | ≥ 4.5:1 on surface |
| `--color-primary` | Primary actions | `#0F766E` deep teal | White text ≥ 4.5:1 |
| `--color-accent-warm` | Highlights, badges | `#C2410C` or `#B45309` | Pair with dark text or white per pair |
| `--color-border-subtle` | Dividers | `#E7E5E4` | Visible, not harsh |
| `--color-success` | Positive | `#15803D` | Icon + text pair checked |
| `--color-warning` | Caution | `#A16207` | — |
| `--color-destructive` | Delete, block | `#B91C1C` | — |
| `--color-focus-ring` | Keyboard focus | `#0F766E` 2px offset | Visible on all interactive |

**Warm, non-generic palette rules**

- Prefer **one** warm accent + **one** cool primary; avoid rainbow UI.
- Neutrals: stone/warm gray, not pure `#888` on `#fff`.
- Use accent for **emphasis only** (≤ ~10% of visible area).
- Test **light and dark** if dark mode is in scope (Phase 3).

### 3.3 Typography tokens

| Token | Use | Example |
|-------|-----|---------|
| `--font-family-sans` | UI | `system-ui, "Segoe UI", sans-serif` or licensed webfont |
| `--font-family-display` | Headlines | Optional distinctive face |
| `--font-size-xs` … `--font-size-3xl` | Scale | Modular scale 1.125 or 1.2 |
| `--line-height-tight` / `--line-height-normal` | | 1.25 / 1.5 |
| `--font-weight-regular` / `--font-weight-semibold` | | 400 / 600 |

### 3.4 Spacing, radius, elevation

| Token | Example |
|-------|---------|
| `--space-1` … `--space-16` | 4px base grid (4, 8, 12, 16, 24, 32, 48, 64) |
| `--radius-sm` / `--radius-md` / `--radius-lg` | 4px / 8px / 12px |
| `--shadow-sm` / `--shadow-md` | Subtle; avoid heavy drop shadows everywhere |

### 3.5 Component spec table template

| Field | Example |
|-------|---------|
| **Name** | `Button` |
| **Figma** | `Components / Button / Primary` |
| **Storybook** | `Components/Button/Button.stories.tsx` |
| **Anatomy** | label, optional icon L/R, loading spinner |
| **Variants** | primary, secondary, ghost, destructive |
| **States** | default, hover, active, focus-visible, disabled, loading |
| **Interaction** | min 44×44px touch; `disabled` + `aria-busy` when loading |
| **ARIA** | `button` or `a`; `aria-label` if icon-only |
| **Responsive** | Full-width on mobile optional for primary CTA |
| **Motion** | 150ms ease-out background; respect `prefers-reduced-motion` |
| **CSS class** | `.vyom-btn`, `.vyom-btn--primary` |
| **Acceptance** | Focus ring visible; contrast AA; activates on Enter/Space |

**Core components to spec:** Button, Link, TextInput, Textarea, Select, Checkbox, Radio, Card, Modal, Toast, Tabs, Table, Pagination, Badge, Alert, Skeleton, Sidebar, NavBar, Breadcrumb, EmptyState, ChartContainer.

### 3.6 Naming conventions

| Layer | Convention |
|-------|------------|
| React | `PascalCase` in `src/components/` |
| CSS | BEM-like `.vyom-block__element--modifier` or CSS modules |
| Tokens | `--vyom-{category}-{name}` |
| Stories | `Category/ComponentName` |

### 3.7 Storybook setup (example)

```bash
cd client && npx storybook@latest init
npm run storybook
```

Deliverable: Storybook with all MVP components, controls for variants, a11y addon enabled.

---

## 4) UX and Interaction Guidelines

### 4.1 Motion

| Guideline | Value |
|-----------|-------|
| Micro-interactions | 100–200ms |
| Page transitions | 200–300ms max |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` or ease-out |
| Reduced motion | `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }` |

### 4.2 Forms

- Validate on blur + on submit; don’t block typing with aggressive inline errors.
- Associate errors: `aria-invalid="true"` + `aria-describedby` pointing to error id.
- Autofocus first field only on dedicated auth pages—not globally.
- Tab order follows visual order; Enter submits single-column forms.

### 4.3 Navigation

- Max **7±2** top-level items; group the rest in sidebar/settings.
- Breadcrumbs when depth ≥ 3.
- Progressive disclosure for advanced fraud/scam settings.

### 4.4 Microcopy library (humanized variants)

**CTA — Sign up**

1. Friendly: “Create your free account”
2. Confident: “Start protecting your transactions”
3. Concise: “Sign up”

**CTA — Primary dashboard**

1. “Open dashboard”
2. “See today’s alerts”
3. “Go to overview”

**Confirmation — Save settings**

1. “Saved. You’re good to go.”
2. “Changes saved.”
3. “All set—we updated your preferences.”

**Empty state — No transactions**

1. “Nothing suspicious yet—that’s a good sign.”
2. “No alerts in this range. Try widening the date filter.”
3. “You’re clear for now. We’ll flag anything odd here.”

**Error — Network**

1. “We couldn’t reach the server. Check your connection and try again.”
2. “Connection hiccup—retry in a moment?”
3. “Offline? Reconnect and tap Retry.”

**Error — 404**

1. “This page wandered off. Head home?”
2. “We can’t find that page.”
3. “Lost signal—try the dashboard instead.”

**Loading**

1. “Checking your latest activity…”
2. “Analyzing…”
3. “One moment”

**Destructive confirm**

1. “Delete this alert? You can’t undo this.”
2. “Remove permanently?”

Pick **one** tone family per product and stay consistent.

---

## 5) Visual Design and Color Guidance

### 5.1 Semantic roles

| Role | Application |
|------|-------------|
| `background` | Page canvas; warm neutral |
| `surface` | Cards, sidebars |
| `accent` | Key metrics, active nav—not full backgrounds |
| `success` / `warning` / `destructive` | Status only; never as body text color on large blocks |

### 5.2 Contrast test checklist

- [ ] All body text ≥ **4.5:1** (AA)
- [ ] Large text (≥18px bold or 24px) ≥ **3:1**
- [ ] UI components & graphical objects ≥ **3:1**
- [ ] Focus indicators distinguishable ≥ **3:1** against adjacent colors
- Tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), Figma plugin “Stark”, axe

### 5.3 Imagery

- Real product screenshots > abstract 3D blobs.
- Photography: natural light, diverse hands/contexts if people shown.
- Icons: consistent stroke (1.5–2px); mix outlined + filled only if systematic.
- Hero: one clear focal point; avoid text on busy imagery without scrim (opacity 40–60%).

---

## 6) Responsiveness and Layout

### 6.1 Breakpoints

| Name | Min width | Layout notes |
|------|-----------|--------------|
| `xs` | 0 | Single column; bottom nav or hamburger |
| `sm` | 640px | Increased padding |
| `md` | 768px | Sidebar collapsible |
| `lg` | 1024px | Persistent sidebar (e.g. 280px); main fluid |
| `xl` | 1280px | Max content width ~1200–1280px centered |

### 6.2 Component behavior

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Sidebar | Overlay drawer | Fixed `pl-[280px]` or token equivalent |
| Tables | Horizontal scroll or card stack | Full table |
| Charts | Simplified series / tap for detail | Full legend |
| Modals | Full-screen sheet | Centered max-width 480–560px |

### 6.3 Touch targets

- Minimum **44×44px** interactive targets.
- Spacing between targets ≥ **8px**.

---

## 7) Performance and Optimization Checklist

### 7.1 Targets (industry guidance — measure your baseline)

| Metric | Target (good) | Pass/fail in CI |
|--------|---------------|-----------------|
| LCP | < 2.5s | Fail if > 4.0s on synthetic mobile |
| CLS | < 0.1 | Fail if > 0.25 |
| TBT / INP proxy | Lower is better | Track trend |
| Total page weight | Set budget per template | Fail if budget exceeded |

### 7.2 Implementations

- [ ] Responsive images: `srcset`, WebP/AVIF, explicit `width`/`height`
- [ ] Critical CSS for above-the-fold
- [ ] Code-split routes: `React.lazy` + `Suspense`
- [ ] Preconnect to API origin: `<link rel="preconnect" href="...">`
- [ ] Cache static assets (immutable filenames)
- [ ] Lazy-load below-fold charts and heavy libs
- [ ] Compress API payloads; paginate lists

### 7.3 Measurement commands

```bash
npx lighthouse {{SITE_URL}} --only-categories=performance,accessibility,best-practices,seo --view

# WebPageTest (CLI if configured)
# wpt test {{SITE_URL}} --location=ec2-us-east-1 --connectivity=4G
```

**Pass:** Lighthouse Performance ≥ 90 on desktop template (adjust if mobile-first contract differs). **Document** exceptions with reason.

---

## 8) Accessibility (A11y) Requirements

### 8.1 WCAG 2.1 AA checklist (excerpt)

- [ ] Keyboard: all interactive elements reachable; no traps
- [ ] Focus: visible `:focus-visible` ring
- [ ] Semantics: one `<h1>` per page; landmarks `header`, `nav`, `main`, `footer`
- [ ] Images: `alt` text meaningful or `alt=""` decorative
- [ ] Forms: `<label>` or `aria-label`; errors programmatically associated
- [ ] Color: information not conveyed by color alone
- [ ] Text resize: 200% zoom usable without horizontal scroll
- [ ] Skip link: “Skip to main content” first focusable
- [ ] Live regions: `aria-live="polite"` for toast/alert streams
- [ ] Modals: focus trap, `aria-modal="true"`, restore focus on close

### 8.2 Test cases

| ID | Steps | Expected |
|----|-------|----------|
| A11Y-01 | Tab through homepage | Logical order; visible focus |
| A11Y-02 | Submit login empty | Errors announced; focus moves to first error |
| A11Y-03 | Run axe on MVP routes | 0 critical/serious |
| A11Y-04 | 200% browser zoom | No clipped CTAs |
| A11Y-05 | Screen reader: dashboard | Headings navigate; table headers read |

### 8.3 Automation

```bash
npx @axe-core/cli {{SITE_URL}}/dashboard --save dashboard-a11y.json
# Add jest-axe or @axe-core/playwright in e2e suite
```

**Acceptance:** Zero critical axe violations on MVP routes; manual keyboard pass on auth + dashboard.

---

## 9) SEO, Metadata and Content Strategy

### 9.1 Metadata template (per page)

```html
<title>{{PAGE_TITLE}} | {{BRAND_NAME}}</title>
<meta name="description" content="{{150-160 chars unique}}" />
<link rel="canonical" href="{{CANONICAL_URL}}" />
<meta property="og:title" content="{{OG_TITLE}}" />
<meta property="og:description" content="{{OG_DESCRIPTION}}" />
<meta property="og:image" content="{{OG_IMAGE_ABSOLUTE_URL}}" />
<meta property="og:url" content="{{CANONICAL_URL}}" />
<meta name="twitter:card" content="summary_large_image" />
```

### 9.2 Content structure

- One **H1** per page matching intent.
- H2/H3 for sections only; no level skipping.
- Schema (where applicable): `Organization`, `WebSite`, `SoftwareApplication`—validate with [Google Rich Results Test](https://search.google.com/test/rich-results).

### 9.3 URLs and redirects

- [ ] Lowercase, hyphenated paths
- [ ] 301 map for any renamed routes (`/old` → `/new`)
- [ ] `sitemap.xml` + `robots.txt` reference sitemap

---

## 10) Analytics, Logging and Privacy

### 10.1 Event catalog (examples)

| Event name | Trigger | Payload example |
|------------|---------|-----------------|
| `page_view` | Route change | `{ path, title }` |
| `cta_click` | Primary CTA | `{ cta_id, page }` |
| `signup_submit` | Register form | `{ method: "email" }` — no PII in payload |
| `login_success` | Auth OK | `{ }` |
| `fraud_scan_submit` | Analyzer submit | `{ content_length_bucket }` |
| `form_error` | Validation fail | `{ form_id, field }` |
| `api_error` | 5xx/4xx surfaced | `{ endpoint, status }` |

### 10.2 Privacy

- Cookie banner before non-essential cookies (GDPR).
- Document data retention in Privacy Policy.
- Prefer **first-party** analytics or Plausible/Fathom if minimizing cookies.
- COPPA: no behavioral ads on child-directed flows.

---

## 11) Security and Reliability Checklist

- [ ] HTTPS everywhere; HSTS on production
- [ ] Auth: bcrypt/argon2 passwords; HTTP-only secure cookies or short-lived JWT + refresh strategy
- [ ] Rate limiting on auth and scan endpoints (already pattern in API)
- [ ] Input validation server-side; sanitize displayed user content
- [ ] CSP headers defined; avoid `unsafe-inline` where possible
- [ ] CORS restricted to known origins
- [ ] Dependency scan: `npm audit` / Dependabot
- [ ] Secrets in env only; `.env` gitignored
- [ ] Error handler doesn’t leak stack traces to clients
- [ ] Backups for DB; documented RPO/RTO
- [ ] Health check endpoint for deploy orchestration

---

## 12) QA, Testing and Launch Plan

### 12.1 Test pyramid

| Layer | Tool examples | Scope |
|-------|---------------|-------|
| Unit | Vitest/Jest | utils, hooks |
| Component | RTL + Storybook | UI states |
| Integration | RTL + MSW | forms + API |
| E2E | Playwright/Cypress | auth, dashboard, analyzer |

### 12.2 Browser/device matrix

| Browser | Versions |
|---------|----------|
| Chrome | last 2 |
| Firefox | last 2 |
| Safari | last 2 |
| Edge | last 2 |
| Mobile Safari / Chrome | iOS + Android current-1 |

### 12.3 Release gating

- [ ] All P0 tests green
- [ ] Lighthouse/a11y budget met
- [ ] Migrations run on staging
- [ ] Feature flags for risky changes
- [ ] Rollback: previous container image / static build tag documented

### 12.4 Post-launch monitoring

- Error rate, p95 API latency, LCP RUM, signup funnel, uptime ping

---

## 13) Handoff and Deliverables

| Artifact | Format | Owner |
|----------|--------|-------|
| Figma library | Figma file + component descriptions | Design |
| Design tokens | `tokens.json` + `variables.css` | Design + FE |
| Storybook | Deployed URL or static build | FE |
| Component docs | MDX in Storybook | FE |
| API contract | OpenAPI or README | BE |
| Acceptance tests | Playwright suite in CI | QA/FE |
| Runbooks | Deploy, rollback, incident | DevOps |

### PR review checklist

- [ ] Visual diff for UI PRs
- [ ] Token change? Contrast re-checked
- [ ] New route? Metadata + analytics event
- [ ] Migration? Staging verified

---

## 14) Prioritization and Roadmap Template

### Phase 1 — MVP (critical)

| Task | Owner | Effort | Acceptance criteria |
|------|-------|--------|---------------------|
| Tokenize colors/type/spacing | FE | M | All MVP pages use CSS vars |
| Fix contrast on primary CTAs | FE | S | axe + manual pass |
| Auth flows polished | FE/BE | M | Login/register errors human-readable |
| Dashboard load performance | FE | M | LCP < 2.5s synthetic mobile |
| 404 + legal footer links | FE | S | All links 200 |
| Core e2e: login → dashboard | QA | M | Playwright green |

### Phase 2 — Feature completion

| Task | Owner | Effort | Acceptance criteria |
|------|-------|--------|---------------------|
| Help/FAQ | Content/FE | M | Accessible accordion |
| SEO metadata all routes | FE | S | Unique titles/descriptions |
| Analytics events | FE | S | Debug panel shows fires |
| Settings page | FE/BE | L | Save + validation |

### Phase 3 — Polish & i18n

| Task | Owner | Effort | Acceptance criteria |
|------|-------|--------|---------------------|
| Dark mode | FE | L | Contrast pass both themes |
| i18n framework | FE | L | EN baseline + 1 locale |
| Advanced motion | FE | S | respects reduced-motion |
| Illustration system | Design | M | Style guide doc |

---

## 15) Example Acceptance Criteria and Test Cases

| ID | Acceptance criteria | Test steps |
|----|---------------------|------------|
| AC-01 | Homepage renders hero + CTA without layout shift | Open `/`; Lighthouse CLS < 0.1 |
| AC-02 | Signup validates email format | Submit invalid email; see inline error; SR hears error |
| AC-03 | Login success lands on dashboard | Valid creds → URL `/dashboard`; sidebar visible |
| AC-04 | Protected routes redirect | Logout; visit `/dashboard` → `/login` |
| AC-05 | Analyzer shows result or error state | Submit sample; loading → result OR friendly error |
| AC-06 | Responsive header/nav | 375px width: menu usable; 44px targets |
| AC-07 | Color contrast AA on buttons | axe + spot-check primary button |
| AC-08 | Keyboard nav dashboard | Tab to table actions; Enter activates |
| AC-09 | WebSocket/update doesn’t break layout | Trigger live event; CLS < 0.1 |
| AC-10 | 404 returns helpful page | `/nope` → 404 copy + link home |

---

## 16) How to Use This Master Prompt

### For AI assistants

1. Paste **Required Inputs** filled in.
2. Paste **Master Prompt Body** (sections 1–16).
3. Add: “Start with section 2 audit. Output `sitemap-inventory.md` and filled page tables for `{{SITE_URL}}`.”
4. Iterate: “Implement Phase 1 only” → “Open PR with token diff” → “Run Lighthouse and fix LCP.”

### For human teams

1. Design: tokens + Figma in week 1.
2. Engineering: Phase 1 parallel to audit fixes.
3. QA: e2e + a11y matrix before launch.

### Expected outputs per iteration

| Iteration | Output |
|-----------|--------|
| 1 | Site inventory + gap analysis |
| 2 | Token JSON + component specs |
| 3 | MVP implementation PRs |
| 4 | QA report + launch checklist signed |

---

## Final checklist — top 10 tasks to start first

1. [ ] Fill all `{{PLACEHOLDER}}` inputs
2. [ ] Crawl site and complete page inventory tables
3. [ ] Measure baseline Lighthouse (mobile) on `/`, `/login`, `/dashboard`
4. [ ] Define and implement CSS color/type/spacing tokens
5. [ ] Fix primary CTA and body text contrast (WCAG AA)
6. [ ] Add skip link + focus-visible styles globally
7. [ ] Code-split heavy routes; optimize LCP image/element
8. [ ] Humanize microcopy on auth errors and empty states
9. [ ] Add Playwright smoke: login → dashboard
10. [ ] Document analytics events + privacy copy in footer

---

*End of master prompt. Version: 1.0 — reusable template; site-specific values must be supplied by the team.*
