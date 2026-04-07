/**
 * Google Apps Script endpoint for order collection.
 * Deploy as "Web app" and set access to "Anyone".
 */

const SHEET_NAME = 'Orders';
const ADMIN_TOKEN = PropertiesService.getScriptProperties().getProperty('ORDER_ADMIN_TOKEN');

function doPost(e) {
  try {
    const data = parsePostData_(e);
    const sheet = getOrCreateSheet_();

    if (!data.model || !data.quantity || !data.fullname || !data.city || !data.address || !data.phone) {
      return json_({ ok: false, error: 'VALIDATION_ERROR' }, 400);
    }

    sheet.appendRow([
      new Date(),
      data.model || '',
      data.quantity || '',
      data.unitPrice || '',
      data.total || '',
      data.fullname || '',
      data.city || '',
      data.address || '',
      data.phone || '',
      data.formId || '',
      data.pageUrl || '',
      data.source || ''
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'POST_FAILED' }, 500);
  }
}

function parsePostData_(e) {
  const fallback = (e && e.parameter) ? e.parameter : {};
  if (!e || !e.postData || !e.postData.contents) return fallback;

  const raw = String(e.postData.contents || '');
  const type = String((e.postData.type || '')).toLowerCase();

  if (type.indexOf('application/json') !== -1) {
    try {
      return JSON.parse(raw || '{}');
    } catch (err) {
      return fallback;
    }
  }

  // Support x-www-form-urlencoded payloads from static frontend fetch.
  return Object.assign({}, fallback);
}

function doGet(e) {
  const action = e.parameter.action || '';
  const token = e.parameter.token || '';
  if (action !== 'list' || !ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return json_({ ok: false, error: 'UNAUTHORIZED' }, 401);
  }

  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return json_({ ok: true, rows: [] });

  const headers = values[0];
  const rows = values.slice(1).reverse().map((row) => {
    const out = {};
    headers.forEach((h, i) => {
      out[h] = row[i];
    });
    return out;
  });

  return json_({ ok: true, rows: rows });
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'createdAt',
      'model',
      'quantity',
      'unitPrice',
      'total',
      'fullname',
      'city',
      'address',
      'phone',
      'formId',
      'pageUrl',
      'source'
    ]);
  }

  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
