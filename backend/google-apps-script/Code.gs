/**
 * Google Apps Script — append landing-page orders to a Google Sheet.
 *
 * Sheet tab: "Orders"
 * Columns: Date | Model | Quantity | Total (MAD) | Full name | City | Address | Phone | Form | Page URL
 *
 * 1) Create/open a Google Sheet bound to this script (or use container-bound script from Sheet).
 * 2) Replace SECRET_TOKEN below with a long random string.
 * 3) Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 * 4) Copy the Web app URL into index.html: data-sheet-endpoint="..."
 * 5) Put the same token in index.html: data-sheet-token="..."
 */
var SHEET_NAME = "Orders";
var SECRET_TOKEN = "1df6fe69dc607f88fec71e6cbb1c4793aef13be5b5939bd7997e51d07d43cd8b725093acf25c45810d3bad6360904cca";

function doGet() {
  return jsonResponse_(200, { ok: true, message: "Order endpoint active. POST JSON to submit." });
}

function doPost(e) {
  try {
    var body = parseJsonBody_(e);
    if (!body) {
      return jsonResponse_(400, { ok: false, error: "INVALID_JSON" });
    }
    if (body.token !== SECRET_TOKEN) {
      return jsonResponse_(401, { ok: false, error: "UNAUTHORIZED" });
    }
    if (String(body.honeypot || "").trim()) {
      return jsonResponse_(200, { ok: true, skipped: true });
    }

    var model = cleanText_(body.model);
    var quantity = toPositiveInt_(body.quantity);
    var price = toPositiveInt_(body.price);
    var fullname = cleanText_(body.fullname);
    var city = cleanText_(body.city);
    var address = cleanText_(body.address);
    var phone = cleanPhone_(body.phone);
    var formId = cleanText_(body.form_id);
    var pageUrl = cleanText_(body.page_url);

    if (!model || !quantity || !price || !fullname || !city || !address || !phone) {
      return jsonResponse_(422, { ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var sheet = getOrCreateSheet_();
      sheet.appendRow([
        new Date(),
        model,
        quantity,
        price,
        fullname,
        city,
        address,
        phone,
        formId,
        pageUrl
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_(200, { ok: true });
  } catch (err) {
    return jsonResponse_(500, { ok: false, error: "SERVER_ERROR", detail: String(err) });
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date",
      "Model",
      "Quantity",
      "Total (MAD)",
      "Full name",
      "City",
      "Address",
      "Phone",
      "Form",
      "Page URL"
    ]);
  }
  return sheet;
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return null;
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (ex) {
    return null;
  }
}

function cleanText_(v) {
  return String(v || "").trim().replace(/\s+/g, " ");
}

function cleanPhone_(v) {
  var s = String(v || "").trim();
  if (!s) {
    return "";
  }
  return s.slice(0, 30);
}

function toPositiveInt_(v) {
  var n = parseInt(String(v), 10);
  if (isNaN(n) || n < 1) {
    return 0;
  }
  return n;
}

function jsonResponse_(code, obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
