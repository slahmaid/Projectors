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
| `backend/google-apps-script/Code.gs` | Google Sheets webhook (Apps Script) |

## Run locally

Open `index.html` in a browser, or serve the folder so asset paths resolve correctly:

```bash
npx --yes serve .
```

Then open the URL shown (e.g. `http://localhost:3000`).

## Optional React scaffold

The `src/components/` folder holds a small header example that imports `assets/logo.svg`. It is not wired to the static HTML build; use it only if you add a bundler (e.g. Vite + React).

## Google Sheets + WhatsApp (both active)

Forms now support dual behavior:

- Send order data to Google Sheets endpoint (if configured)
- Redirect customer to WhatsApp confirmation chat

### Apps Script setup

1. Create a Google Sheet and open **Extensions -> Apps Script**.
2. Paste `backend/google-apps-script/Code.gs`.
3. Change `SECRET_TOKEN` in the script.
4. Deploy as **Web app** (execute as: Me, access: Anyone).
5. Copy Web app URL.

### Connect forms

In `index.html`, set these attributes on both forms (`#order-form` and `#order-form-retarget`):

- `data-sheet-endpoint="YOUR_WEB_APP_URL"`
- `data-sheet-token="YOUR_SECRET_TOKEN"`

If these are empty, WhatsApp redirect still works and Sheet submission is skipped.
