# Solar projector — landing (Morocco)

Static Arabic RTL landing page: order forms, pricing, FAQ, and SEO JSON-LD.

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Main page (entry point) |
| `css/main.css` | All styles |
| `js/main.js` | Order forms, totals, header scroll |
| `assets/logo.svg` | Header & footer logo |
| `assets/images/Hero-desktop.jpeg` | Hero (desktop) |
| `assets/images/Hero-mobile.jpeg` | Hero (mobile) |
| `privacy.html` | سياسة الخصوصية |
| `terms.html` | شروط الاستخدام |
| `preview.html` | Redirect to `index.html` (legacy bookmark) |

## Run locally

Open `index.html` in a browser, or serve the folder so asset paths resolve correctly:

```bash
npx --yes serve .
```

Then open the URL shown (e.g. `http://localhost:3000`).

## Deploy on GitHub Pages

- Push the repository to GitHub.
- Enable **Pages** in repo settings (deploy from your chosen branch/folder).
- The site is fully static; no backend runtime is required.
- Keep links as static files (`index.html`, `privacy.html`, `terms.html`).

## Optional React scaffold

The `src/components/` folder holds a small header example that imports `assets/logo.svg`. It is not wired to the static HTML build; use it only if you add a bundler (e.g. Vite + React).

## Google Sheets orders integration (GitHub Pages friendly)

The forms in `index.html` submit directly to your Google Apps Script Web App URL, so this works on static hosting (including GitHub Pages) without a Node backend.

### 1) Create the Google Sheets webhook

- Open your Google Sheet and go to **Extensions > Apps Script**.
- Copy the script from `google-apps-script/orders.gs`.
- Deploy it as a **Web app** with access set to **Anyone**.
- Copy the deployment URL.

### 2) Set the form endpoint

In `index.html`, each `.order-form` uses:

- `data-order-endpoint="https://script.google.com/macros/s/.../exec"`

Update that value whenever you redeploy a new Apps Script Web App URL.

### 3) Receive orders

When users submit either order form, payload is sent to your Apps Script URL and appended to the `Orders` sheet with these columns:

- `createdAt`, `model`, `quantity`, `unitPrice`, `total`
- `fullname`, `city`, `address`, `phone`
- `formId`, `pageUrl`, `source`

### 4) Manage/view orders (optional)

Use your Apps Script list endpoint:

- `GET https://script.google.com/macros/s/.../exec?action=list&token=<ORDER_ADMIN_TOKEN>`

If it returns `UNAUTHORIZED`, verify `ORDER_ADMIN_TOKEN` in Apps Script Script Properties and in the URL token.
