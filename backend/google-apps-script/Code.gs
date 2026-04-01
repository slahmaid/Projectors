/**
 * Google Apps Script backend for landing page orders.
 * Columns:
 * Date | Model | Quantity | Price | Full name | City | Address | Phone number
 */

const SHEET_NAME = "Orders";
const SECRET_TOKEN = "v1_9f2a1d3c7e5b4a8f6c2d0e1b3a9c7f5d";
const MAX_PHONE_LEN = 25;

function doGet() {
  return json_(200, { ok: true, message: "Order endpoint is running. Use POST to submit orders." });
}

function doPost(e) {
  try {
    const body = parseJsonBody_(e);
    if (!body) return json_(400, { ok: false, error: "INVALID_JSON" });
    if (body.token !== SECRET_TOKEN) return json_(401, { ok: false, error: "UNAUTHORIZED" });
    if ((body.honeypot || "").trim()) return json_(200, { ok: true, skipped: true });

    const model = String(body.model || "").trim();
    const quantity = toPositiveInt_(body.quantity);
    const price = toPositiveInt_(body.price);
    const fullname = cleanText_(body.fullname);
    const city = cleanText_(body.city);
    const address = cleanText_(body.address);
    const phone = cleanPhone_(body.phone);

    if (!model || !quantity || !price || !fullname || !city || !address || !phone) {
      return json_(422, { ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateSheet_();
      sheet.appendRow([
        new Date(),   // Date
        model,        // Model
        quantity,     // Quantity
        price,        // Price
        fullname,     // Full name
        city,         // City
        address,      // Address
        phone         // Phone number
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
      "Full name",
      "City",
      "Address",
      "Phone number"
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

function cleanPhone_(v) {
  const phone = String(v || "").trim();
  if (!phone) return "";
  return phone.slice(0, MAX_PHONE_LEN);
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
