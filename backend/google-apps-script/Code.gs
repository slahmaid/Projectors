/**
 * Google Apps Script order endpoint for landing page.
 *
 * Expected columns in sheet "Orders":
 * Date | Model | Quantity | Price | Unit Price | Full name | City | Address | Phone number | Source form | Page URL
 */

const SHEET_NAME = "Orders";
const SECRET_TOKEN = "v1_7f9c2e1a4d8b6c3f0e5a9b2d7c1f4a8e6b3d9c0f2a7e5b1d4c8f6a3e0b9d2c";

function doGet() {
  return json_(200, { ok: true, message: "Order endpoint ready. Use POST." });
}

function doPost(e) {
  try {
    const body = parseJsonBody_(e);
    if (!body) return json_(400, { ok: false, error: "INVALID_JSON" });
    if ((body.token || "").trim() !== SECRET_TOKEN) {
      return json_(401, { ok: false, error: "UNAUTHORIZED" });
    }

    const model = cleanText_(body.model);
    const quantity = toPositiveInt_(body.quantity);
    const price = toPositiveInt_(body.price);
    const unitPrice = toPositiveInt_(body.price_unit);
    const fullname = cleanText_(body.fullname);
    const city = cleanText_(body.city);
    const address = cleanText_(body.address);
    const phone = cleanText_(body.phone);
    const sourceForm = cleanText_(body.source_form);
    const pageUrl = cleanText_(body.page_url);

    if (!model || !quantity || !fullname || !city || !address || !phone) {
      return json_(422, { ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateSheet_();
      sheet.appendRow([
        new Date(),
        model,
        quantity,
        price,
        unitPrice,
        fullname,
        city,
        address,
        phone,
        sourceForm,
        pageUrl
      ]);
    } finally {
      lock.releaseLock();
    }

    return json_(200, { ok: true });
  } catch (err) {
    return json_(500, { ok: false, error: "SERVER_ERROR", detail: String(err) });
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date",
      "Model",
      "Quantity",
      "Price",
      "Unit Price",
      "Full name",
      "City",
      "Address",
      "Phone number",
      "Source form",
      "Page URL"
    ]);
  }
  return sheet;
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    return JSON.parse(e.postData.contents);
  } catch (_) {
    return null;
  }
}

function cleanText_(v) {
  return String(v || "").trim().replace(/\s+/g, " ");
}

function toPositiveInt_(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const int = Math.floor(n);
  return int > 0 ? int : 0;
}

function json_(statusCode, payload) {
  return ContentService.createTextOutput(JSON.stringify({
    status: statusCode,
    ...payload
  })).setMimeType(ContentService.MimeType.JSON);
}
