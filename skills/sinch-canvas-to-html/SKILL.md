---
name: sinch-canvas-to-html
description: >-
  Convert a Cursor canvas (.canvas.tsx) into a standalone HTML file using
  Nectary design system components and tokens. Use when the user wants to
  export, distribute, or deploy a canvas as a static HTML page, or generate
  a Nectary-themed HTML report.
metadata:
  author: Sinch
  version: 1.0.0
---

# Canvas to HTML (Nectary Edition)

Convert a `.canvas.tsx` file into a standalone HTML file themed with the Nectary design system.

## Two output modes

| Mode | When to use | How it loads Nectary |
|------|-------------|----------------------|
| **Nectary Components** | Hosted on infra with CDN access | `<sinch-*>` web components via ESM import maps |
| **Nectary Tokens Only** | Fully self-contained, zero network | Inline CSS using `--sinch-*` custom properties |

Default to **Nectary Tokens Only** unless the user explicitly requests web components.

---

## Mode 1: Nectary Tokens Only (recommended default)

Embed resolved token values directly in inline CSS. No external requests.

### Token reference

Read the token source files for exact values:
- `themes/base/ref.css` — reference palette (`--sinch-ref-color-*`)
- `themes/base/sys.css` — semantic tokens (`--sinch-sys-*`)
- `themes/base/comp/*.css` — component tokens (`--sinch-comp-*`)

### CSS variable mapping

Use resolved values from `ref.css` and `sys.css` to create the inline stylesheet:

```css
:root {
  /* Surface & canvas */
  --n-bg: #F7F9FA;               /* sinch-ref-color-neutral-50 */
  --n-surface: #FFFFFF;           /* sinch-sys-color-surface-primary-default → pure */
  --n-surface-alt: #EBEEF0;      /* sinch-ref-color-neutral-100 */
  --n-border: #B7C1C7;           /* sinch-ref-color-neutral-350 */
  --n-border-subtle: #DCE2E5;    /* sinch-ref-color-neutral-200 */

  /* Text */
  --n-text: #1A2126;             /* sinch-ref-color-neutral-900 */
  --n-text-muted: #626C73;       /* sinch-ref-color-neutral-600 */
  --n-text-caption: #4B575E;     /* sinch-ref-color-neutral-700 */
  --n-text-disabled: #9EA9B0;    /* sinch-ref-color-neutral-400 */

  /* Primary */
  --n-primary: var(--sinch-ref-color-tropical-700, #0D68D1);
  --n-primary-fg: #FFFFFF;

  /* Feedback */
  --n-danger: #D63F3F;           /* sinch-sys-color-feedback-danger-default */
  --n-danger-subtle: inherit;    /* resolve from sinch-ref-color-raspberry-200 */
  --n-danger-strong: inherit;    /* sinch-ref-color-raspberry-700 */
  --n-warning: inherit;          /* sinch-ref-color-pumpkin-400 */
  --n-warning-subtle: inherit;   /* sinch-ref-color-pumpkin-200 */
  --n-success: inherit;          /* sinch-ref-color-grass-400 */
  --n-success-subtle: inherit;   /* sinch-ref-color-grass-200 */
  --n-info: inherit;             /* sinch-ref-color-ocean-500 */

  /* Shape */
  --n-radius-s: 6px;             /* sinch-sys-shape-radius-s */
  --n-radius-m: 10px;            /* sinch-sys-shape-radius-m */
  --n-radius-l: 14px;            /* sinch-sys-shape-radius-l */
  --n-radius-full: 9999px;       /* sinch-sys-shape-radius-full */

  /* Typography — use font shorthand from sys.css */
  --n-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --n-font-mono: 'SF Mono', 'Fira Code', monospace;
}
```

**Important**: Always read `themes/base/ref.css` at generation time to resolve the actual hex values. The values above are a snapshot — tokens may change between releases.

For **dark mode**, add a `prefers-color-scheme: dark` media query. Dark theme values should be read from `themes/dark/` if available, or use the neutral-800/900 end of the ref palette.

### Canvas primitive → HTML/CSS mapping

| Canvas SDK          | HTML + Nectary token CSS                                                        |
|---------------------|--------------------------------------------------------------------|
| `H1`                | `<h1>` with `font: var(--sinch-sys-font-desktop-title-xl)`        |
| `H2`                | `<h2>` with `font: var(--sinch-sys-font-desktop-title-l)`         |
| `H3`                | `<h3>` with `font: var(--sinch-sys-font-desktop-title-s)`         |
| `Text`              | `<p>` / `<span>`, tone maps to `--n-text`, `--n-text-muted`, `--n-text-caption` |
| `Link`              | `<a target="_blank">` with `color: --n-primary`                    |
| `Divider`           | `<hr>` with `border-color: --n-border-subtle`                     |
| `Stack`             | `div` flex-column with `gap`                                       |
| `Row`               | `div` flex-row with `gap`                                          |
| `Grid`              | CSS grid `repeat(N, 1fr)`                                          |
| `Card`              | `div.card` with `background: --n-surface`, `border: --n-border`, `border-radius: --n-radius-l` |
| `Stat`              | `div.stat` — large number + label                                  |
| `Pill`              | `span.pill` with `border-radius: --n-radius-full` and tone bg/fg  |
| `Table`             | `<table>` with thead sticky, striped rows using `--n-surface-alt`  |

### Pill/Tag tone mapping

Map canvas `tone` to Nectary feedback tokens:

| Tone | Background | Foreground |
|------|-----------|------------|
| `success` | `--sinch-sys-color-feedback-success-subtle` | `--sinch-sys-color-feedback-success-strong` |
| `warning` | `--sinch-sys-color-feedback-warning-subtle` | `--sinch-sys-color-feedback-warning-strong` |
| `danger` / `deleted` | `--sinch-sys-color-feedback-danger-subtle` | `--sinch-sys-color-feedback-danger-strong` |
| `info` | `--sinch-sys-color-feedback-info-subtle` | `--sinch-sys-color-feedback-info-strong` |
| `neutral` | `--sinch-ref-color-neutral-200` | `--sinch-ref-color-neutral-900` |

### Table row tones

For `rowTone` on tables, apply a subtle background to the `<tr>`:

| Row tone | `<tr>` background |
|----------|-------------------|
| `warning` | `--sinch-sys-color-feedback-warning-subtle` at 40% opacity |
| `danger` | `--sinch-sys-color-feedback-danger-subtle` at 40% opacity |

### Collapsible cards

```html
<div class="card">
  <div class="card-hdr collapsible" onclick="toggle(this)">Title</div>
  <div class="card-body collapsed">Content</div>
</div>
```

```js
function toggle(el) {
  el.classList.toggle('open')
  el.nextElementSibling.classList.toggle('collapsed')
}
```

---

## Mode 2: Nectary Web Components (CDN)

Use actual `<sinch-*>` elements loaded from the Nectary CDN.

### CDN infrastructure

- **S3 bucket**: `nectary-components`
- **Paths**: `/components/<version>/` and `/components/latest/`
- **CloudFront**: domain from `terraform/main.tf` output `cdn_url`

### HTML template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Report Title</title>

  <!-- Theme CSS (inline or from CDN) -->
  <link rel="stylesheet" href="https://<CDN_DOMAIN>/themes/base/index.css">

  <!-- Import map for component ESM resolution -->
  <script type="importmap">
  {
    "imports": {
      "@nectary/components/": "https://<CDN_DOMAIN>/components/latest/"
    }
  }
  </script>

  <!-- Registry setup -->
  <script type="module">
    import { setNectaryRegistry } from '@nectary/components/utils/element.js'
    setNectaryRegistry(window.customElements)

    // Import only the components you need
    import '@nectary/components/button/index.js'
    import '@nectary/components/card-v2/index.js'
    import '@nectary/components/tag/index.js'
    import '@nectary/components/table/index.js'
    import '@nectary/components/text/index.js'
    import '@nectary/components/title/index.js'
    import '@nectary/components/tooltip/index.js'
  </script>
</head>
<body class="nectary-theme-base">
  <!-- Use <sinch-*> elements directly -->
  <sinch-title size="xl" text="Report Title"></sinch-title>
  <sinch-tag text="Critical" color="danger"></sinch-tag>
  <sinch-card-v2>
    <sinch-text>Card content</sinch-text>
  </sinch-card-v2>
</body>
</html>
```

**Note**: Replace `<CDN_DOMAIN>` with the actual CloudFront domain. Get it from:
```bash
cd terraform && terraform output cdn_url
```

### Available components for reports

Useful `<sinch-*>` elements for dashboard/report pages:

| Element | Key attributes |
|---------|---------------|
| `sinch-title` | `size="xl\|l\|m\|s\|xs"`, `text` |
| `sinch-text` | `size="m\|s\|xs"`, `tone="default\|muted\|caption"` |
| `sinch-tag` | `text`, `color="danger\|warning\|success\|info\|default\|..."` |
| `sinch-card-v2` | Container card |
| `sinch-table` | `<sinch-table-head>`, `<sinch-table-body>`, `<sinch-table-row>`, `<sinch-table-cell>`, `<sinch-table-head-cell>` |
| `sinch-link` | `href`, `target` |
| `sinch-badge` | `value`, `color` |
| `sinch-inline-alert` | `variant="info\|warning\|danger\|success"`, `text` |
| `sinch-accordion` | Collapsible sections |
| `sinch-tooltip` | `text`, wraps any element |

---

## Dynamic data rendering

Render table rows and lists from JS data arrays:

```js
document.getElementById('my-table-body').innerHTML = data.map(row =>
  `<tr class="striped${row.warn ? ' tone-warning' : ''}">
    <td><a href="${JIRA}/${row.key}" target="_blank">${row.key}</a></td>
    <td>${row.summary}</td>
  </tr>`
).join('')
```

For Mode 2 (web components), use the same pattern but with `<sinch-table-row>` etc.

## Link helpers

```js
const JIRA = 'https://your-instance.atlassian.net/browse'
const WIKI = 'https://your-instance.atlassian.net/wiki/spaces'
const GL = 'https://gitlab.com/your-org'

function jiraLink(key) {
  return `<a href="${JIRA}/${key}" target="_blank">${key}</a>`
}
function mrLink(project, id) {
  return `<a href="${GL}/${project}/-/merge_requests/${id}" target="_blank">!${id}</a>`
}
function commitLink(project, hash) {
  return `<a href="${GL}/${project}/-/commit/${hash}" target="_blank">${hash.slice(0,8)}</a>`
}
function confluenceLink(space, pageId, title) {
  return `<a href="${WIKI}/${space}/pages/${pageId}" target="_blank">${title}</a>`
}
```

---

## Output checklist

- [ ] Single HTML file, zero external dependencies (Mode 1) or CDN-only (Mode 2)
- [ ] Uses Nectary token values for all colors, radii, typography
- [ ] Dark/light mode support (Mode 1: `prefers-color-scheme`; Mode 2: theme class swap)
- [ ] Responsive grid (collapses on mobile via `@media (max-width: 800px)`)
- [ ] All external links open in new tab (`target="_blank"`)
- [ ] Collapsible sections work without JS frameworks
- [ ] File size under 50KB (Mode 1) for fast CDN delivery
- [ ] `class="nectary-theme-base"` on root element (Mode 2)
