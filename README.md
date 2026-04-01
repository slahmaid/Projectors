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
| `backend/google-apps-script/Code.gs` | Google Sheets order backend (Apps Script) |

## Run locally

Open `index.html` in a browser, or serve the folder so asset paths resolve correctly:

```bash
npx --yes serve .
```

Then open the URL shown (e.g. `http://localhost:3000`).

## Optional React scaffold

The `src/components/` folder holds a small header example that imports `assets/logo.svg`. It is not wired to the static HTML build; use it only if you add a bundler (e.g. Vite + React).

## Orders to Google Sheets (guided setup)

This project can send orders to a Google Sheet with these columns:

- Date
- Model
- Quantity
- Price
- Full name
- City
- Address
- Phone number

### 1) Create the sheet and script

1. Create a Google Sheet named anything (example: `Solar Orders`).
2. Open **Extensions -> Apps Script**.
3. Replace the default script with `backend/google-apps-script/Code.gs`.
4. In the script, set:
   - `SECRET_TOKEN` to a long random value.

### 2) Deploy the backend

1. Click **Deploy -> New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy and copy the **Web app URL**.

### 3) Connect the landing forms

In `index.html`, set both form attributes:

- `data-sheet-endpoint="YOUR_WEB_APP_URL"`
- `data-sheet-token="YOUR_SECRET_TOKEN"`

Search for:

- `id="order-form"`
- `id="order-form-retarget"`

and set the same endpoint/token on both forms.

### 4) Test

1. Open the page and submit test data.
2. Confirm a new row appears in the `Orders` sheet.
3. Verify values map correctly to:
   - Date, Model, Quantity, Price, Full name, City, Address, Phone number

### 5) Notes

- The form uses a hidden honeypot field to reduce spam bots.
- Orders are written with script lock (`LockService`) to avoid row collisions.
- If endpoint/token is missing, submission will fail safely and show an error.
