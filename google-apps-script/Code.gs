/**
 * =====================================================================
 * NIPM HOSUR CHAPTER — website form handler
 * ---------------------------------------------------------------------
 * Receives the Contact form, the Contribution (payment confirmation) form
 * and the IR Conference 2026 registration form from www.nipmhosur.in, then:
 *
 *   1. appends a timestamped row to a Google Sheet
 *   2. emails the details to admin@nipmhosur.in
 *      (payment screenshots are attached to the email)
 *   3. saves the screenshot to a Drive folder and records its link
 *   4. sends the visitor a short acknowledgement
 *
 * Setup instructions are in SETUP.md — read that first.
 * =====================================================================
 */

/* ----------------------------- SETTINGS ----------------------------- */

var SETTINGS = {

  // Where submissions are emailed. Add more addresses separated by commas.
  ADMIN_EMAIL: 'admin@nipmhosur.in',

  // The Google Sheet that stores submissions.
  // Paste the ID from the sheet's URL:
  //   https://docs.google.com/spreadsheets/d/THIS_LONG_ID_HERE/edit
  // Leave it as '' if you created this script from inside the sheet
  // (Extensions > Apps Script) — it will use that sheet automatically.
  SHEET_ID: '',

  // Tab names inside the sheet. They are created automatically.
  CONTACT_TAB: 'Contact Enquiries',
  PAYMENT_TAB: 'Payment Confirmations',

  // Tab that stores IR Conference 2026 delegate registrations.
  IRCON_TAB: 'IR Conference 2026 Registrations',

  // Tab that stores IR Conference 2026 sponsorship registrations.
  SPONSOR_TAB: 'IR Conference 2026 Sponsors',

  // Drive folder for payment screenshots. Created automatically.
  DRIVE_FOLDER: 'NIPM Hosur — Payment Screenshots',

  // Drive folder for IR Conference 2026 payment screenshots. Created automatically.
  IRCON_FOLDER: 'NIPM Hosur — IR Conference 2026 Payment Proofs',

  // Show the payment screenshot as a picture inside the sheet cell, not
  // just as a link. To make this work Google needs to be able to render the
  // file without a login, so each screenshot is shared as "anyone with the
  // link can view".
  //
  //   >>> The link is long and random, and the files are never listed
  //   >>> publicly or indexed — but anyone who is given the URL can open
  //   >>> that screenshot. If you would rather not allow that, set this to
  //   >>> false: the Screenshot Preview column then reads "Open the link",
  //   >>> the Drive link column still works for signed-in Chapter staff,
  //   >>> and the screenshot still arrives attached to the email.
  EMBED_SCREENSHOT_IN_SHEET: true,

  // Height in pixels for a row that carries a screenshot preview.
  SCREENSHOT_ROW_HEIGHT: 130,

  // Send the visitor a confirmation email too.
  ACKNOWLEDGE_VISITOR: true,

  // Reject anything larger than this (bytes). Keeps mailbox usage sane.
  MAX_FILE_BYTES: 5 * 1024 * 1024,

  // Displayed timezone for the timestamp column.
  TIMEZONE: 'Asia/Kolkata'
};

/* --------------------------- ENTRY POINTS --------------------------- */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'Empty request' });
    }

    var data = JSON.parse(e.postData.contents);

    if (data.formType === 'contact') return handleContact(data);
    if (data.formType === 'contribution') return handleContribution(data);
    if (data.formType === 'ircon-registration') return handleIrconRegistration(data);
    if (data.formType === 'ircon-sponsor') return handleSponsorRegistration(data);

    return json({ ok: false, error: 'Unknown form type' });

  } catch (err) {
    // Keep a copy so a failed submission is never silently lost.
    try {
      MailApp.sendEmail(SETTINGS.ADMIN_EMAIL,
        'NIPM website form — error',
        'A submission could not be processed.\n\nError: ' + err
        + '\n\nRaw payload:\n' + (e && e.postData ? e.postData.contents : '(none)').slice(0, 20000));
    } catch (ignore) {}
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'NIPM Hosur form handler', status: 'running' });
}

/* ---------------------------- HANDLERS ------------------------------ */

function handleContact(d) {
  var name = clean(d.name), email = clean(d.email);
  if (!name || !email) return json({ ok: false, error: 'Name and email are required' });

  var when = stamp();

  sheetFor(SETTINGS.CONTACT_TAB, [
    'Date & Time', 'Name', 'Email', 'Phone', 'Subject', 'Reference Member', 'Message', 'Submitted From'
  ]).appendRow([
    when, name, email, clean(d.phone), clean(d.subject), clean(d.reference), clean(d.message), clean(d.page)
  ]);

  MailApp.sendEmail({
    to: SETTINGS.ADMIN_EMAIL,
    replyTo: email,
    subject: 'Website enquiry: ' + (clean(d.subject) || 'General') + ' — ' + name,
    htmlBody: card('New enquiry from the website', [
      ['Received', when],
      ['Name', name],
      ['Email', link('mailto:' + email, email)],
      ['Phone', clean(d.phone) || '—'],
      ['Subject', clean(d.subject) || '—'],
      ['Reference member', clean(d.reference) || '—'],
      ['Message', clean(d.message).replace(/\n/g, '<br>')],
      ['Page', clean(d.page)]
    ], 'Reply directly to this email to respond to ' + name + '.')
  });

  if (SETTINGS.ACKNOWLEDGE_VISITOR) {
    safeMail(email, 'We have your message — NIPM Hosur Chapter',
      card('Thank you for writing to us', [
        ['Your subject', clean(d.subject) || 'General enquiry'],
        ['Your message', clean(d.message).replace(/\n/g, '<br>')]
      ], 'A member of the NIPM Hosur Chapter team will reply to this address shortly. '
       + 'For anything urgent, call +91 94876 34638.'));
  }

  return json({ ok: true });
}

function handleContribution(d) {
  var name = clean(d.name), email = clean(d.email);
  if (!name || !email) return json({ ok: false, error: 'Name and email are required' });
  if (!d.file || !d.file.data) return json({ ok: false, error: 'Payment screenshot is required' });

  var when = stamp();

  // rebuild the screenshot
  var bytes = Utilities.base64Decode(d.file.data);
  if (bytes.length > SETTINGS.MAX_FILE_BYTES) {
    return json({ ok: false, error: 'Screenshot is larger than 5 MB' });
  }
  var safeName = (name + ' — ' + when).replace(/[\\/:*?"<>|]/g, '-') + extFor(d.file);
  var blob = Utilities.newBlob(bytes, d.file.type || 'image/jpeg', safeName);

  // keep a copy in Drive
  var shot = storeScreenshot(blob, SETTINGS.DRIVE_FOLDER);
  var fileUrl = shot.url;

  var psh = sheetFor(SETTINGS.PAYMENT_TAB, [
    'Date & Time', 'Name', 'Phone', 'Email', 'Company', 'Member Status',
    'Amount (INR)', 'Towards', 'Reference Member', 'Remarks',
    'Screenshot Preview', 'Screenshot Link', 'Submitted From'
  ]);
  psh.appendRow([
    when, name, clean(d.phone), email, clean(d.company), clean(d.membership),
    clean(d.amount), clean(d.purpose), clean(d.reference), clean(d.remarks),
    shot.preview, fileUrl, clean(d.page)
  ]);
  sizeScreenshotRows(psh, 1);

  MailApp.sendEmail({
    to: SETTINGS.ADMIN_EMAIL,
    replyTo: email,
    subject: 'Payment confirmation — ' + name + (clean(d.company) ? ' (' + clean(d.company) + ')' : ''),
    htmlBody: card('Payment details submitted', [
      ['Received', when],
      ['Name', name],
      ['Phone', clean(d.phone)],
      ['Email', link('mailto:' + email, email)],
      ['Company', clean(d.company)],
      ['Member status', clean(d.membership)],
      ['Amount', clean(d.amount) ? '₹ ' + clean(d.amount) : 'Not stated'],
      ['Towards', clean(d.purpose)],
      ['Reference member', clean(d.reference) || '—'],
      ['Remarks', clean(d.remarks) || '—'],
      ['Screenshot', fileUrl ? link(fileUrl, 'Open in Drive') : 'Attached to this email']
    ], 'The payment screenshot is attached. Match it against the bank statement before issuing the receipt.'),
    attachments: [blob]
  });

  if (SETTINGS.ACKNOWLEDGE_VISITOR) {
    safeMail(email, 'Payment details received — NIPM Hosur Chapter',
      card('Thank you — we have your payment details', [
        ['Name', name],
        ['Amount', clean(d.amount) ? '₹ ' + clean(d.amount) : 'As paid'],
        ['Towards', clean(d.purpose)]
      ], 'The Treasurer will verify the payment against our bank records and issue your receipt to this '
       + 'email address. If anything is unclear we will call you on ' + clean(d.phone) + '.'));
  }

  return json({ ok: true });
}


function handleIrconRegistration(d) {
  var name = clean(d.name), email = clean(d.email), phone = clean(d.phone);
  if (!name || !email || !phone) {
    return json({ ok: false, error: 'Name, email and mobile number are required' });
  }
  if (!clean(d.txnId)) {
    return json({ ok: false, error: 'The UPI transaction ID / UTR number is required' });
  }
  if (!d.file || !d.file.data) {
    return json({ ok: false, error: 'The payment screenshot is required' });
  }

  var when = stamp();

  // rebuild the screenshot
  var bytes = Utilities.base64Decode(d.file.data);
  if (bytes.length > SETTINGS.MAX_FILE_BYTES) {
    return json({ ok: false, error: 'Screenshot is larger than 5 MB' });
  }
  var safeName = ('IRCON2026 — ' + name + ' — ' + clean(d.txnId) + ' — ' + when)
    .replace(/[\\/:*?"<>|]/g, '-') + extFor(d.file);
  var blob = Utilities.newBlob(bytes, d.file.type || 'image/jpeg', safeName);

  // keep a copy in Drive
  var shot = storeScreenshot(blob, SETTINGS.IRCON_FOLDER);
  var fileUrl = shot.url;

  var members = Array.isArray(d.groupMembers) ? d.groupMembers : [];
  var headcount = members.length + 1;
  var isBulk = members.length > 0;

  /* A registration ID ties the rows of one bulk booking together. */
  var regId = 'IRC26-' + Utilities.formatDate(new Date(), SETTINGS.TIMEZONE, 'yyMMdd-HHmmss');

  /* -----------------------------------------------------------------
     ONE TAB FOR ALL DELEGATE REGISTRATIONS — individual and bulk.
     A bulk booking of four people writes four rows here, sharing the
     same Registration ID, UPI transaction number and screenshot, so
     the row count is always the true headcount and the tab doubles as
     the badge list, the rooming list and the caterer's count.
     ----------------------------------------------------------------- */
  var sh = sheetFor(SETTINGS.IRCON_TAB, [
    'Date & Time', 'Registration ID', 'Registration Type', 'Person No.', 'Registered By',
    'Delegate Name', 'Designation', 'Organisation', 'Organisation Location',
    'Mobile', 'Email', 'Gender', 'Food Preference',
    'NIPM Membership', 'Membership No.', 'Reference Member', 'Reference Mobile',
    'Registration Category', 'Fee per Delegate (INR)', 'No. of Delegates in Booking',
    'Calculated Total (INR)', 'Accommodation', 'GSTIN', 'Billing Name & Address',
    'Amount Paid (INR)', 'Payment Mode', 'UPI Transaction / UTR', 'Payment Date',
    'Screenshot Preview', 'Screenshot Link', 'Remarks', 'Status', 'Submitted From'
  ]);

  var regType = isBulk ? 'Bulk / group registration' : 'Individual registration';

  /* -- Person 1: the delegate who filled the form and paid -- */
  sh.appendRow([
    when, regId, regType, 1, name,
    name, clean(d.designation), clean(d.company), clean(d.city),
    phone, email, clean(d.gender), clean(d.food),
    clean(d.membership), clean(d.memberNo), clean(d.reference), clean(d.referencePhone),
    clean(d.category), clean(d.feePerDelegate), headcount,
    clean(d.calculatedTotal), clean(d.accommodation), clean(d.gstin), clean(d.billing),
    clean(d.amount), clean(d.payMode), clean(d.txnId), clean(d.payDate),
    shot.preview, fileUrl, clean(d.remarks), 'Payment to be verified', clean(d.page)
  ]);

  /* -- Person 2, 3, 4 … from the bulk registration -- */
  for (var gi = 0; gi < members.length; gi++) {
    var m = members[gi] || {};
    sh.appendRow([
      when, regId, regType, clean(m.person) || (gi + 2), name,
      clean(m.name), clean(m.designation), clean(m.organisation), clean(m.orgLocation),
      clean(m.phone), clean(m.email), clean(m.gender), clean(m.food),
      'Covered by ' + name, '', clean(d.reference), clean(d.referencePhone),
      clean(d.category), clean(d.feePerDelegate), headcount,
      clean(d.calculatedTotal), clean(d.accommodation), clean(d.gstin), clean(d.billing),
      'Paid with ' + regId, clean(d.payMode), clean(d.txnId), clean(d.payDate),
      shot.preview, fileUrl, '', 'Payment to be verified', clean(d.page)
    ]);
  }

  sizeScreenshotRows(sh, headcount);

  /* group members formatted for the notification email */
  var membersHtml = members.length
    ? members.map(function (m) {
        return '<b>Person ' + clean(m.person) + ' — ' + clean(m.name) + '</b><br>'
          + clean(m.phone) + ' &middot; ' + clean(m.email) + '<br>'
          + clean(m.gender) + ' &middot; ' + clean(m.food)
          + (clean(m.designation) ? ' &middot; ' + clean(m.designation) : '') + '<br>'
          + clean(m.organisation) + ', ' + clean(m.orgLocation);
      }).join('<br><br>')
    : '—';

  MailApp.sendEmail({
    to: SETTINGS.ADMIN_EMAIL,
    replyTo: email,
    subject: 'IR Conference 2026 registration — ' + name
      + (clean(d.company) ? ' (' + clean(d.company) + ')' : '')
      + (isBulk ? ' — ' + headcount + ' delegates' : ''),
    htmlBody: card('IR Conference 2026 — new delegate registration', [
      ['Received', when],
      ['Registration ID', '<b>' + regId + '</b>'],
      ['Delegate', name],
      ['Designation', clean(d.designation)],
      ['Organisation', clean(d.company)],
      ['City', clean(d.city) || '—'],
      ['Mobile', clean(d.phone)],
      ['Email', link('mailto:' + email, email)],
      ['Gender', clean(d.gender) || '—'],
      ['NIPM membership', clean(d.membership) + (clean(d.memberNo) ? ' — ' + clean(d.memberNo) : '')],
      ['Reference member', (clean(d.reference) || '—')
        + (clean(d.referencePhone) ? ' — ' + clean(d.referencePhone) : '')],
      ['Registration type', '<b>' + (clean(d.regMode) || 'Individual registration') + '</b>'],
      ['Category', clean(d.category)],
      ['Fee per delegate', clean(d.feePerDelegate) ? '₹ ' + clean(d.feePerDelegate) : '—'],
      ['No. of delegates', clean(d.delegates)],
      ['Calculated total', clean(d.calculatedTotal) ? '₹ ' + clean(d.calculatedTotal) : '—'],
      ['Group members', membersHtml],
      ['Accommodation', clean(d.accommodation)],
      ['Food preference', clean(d.food) || '—'],
      ['GSTIN', clean(d.gstin) || '—'],
      ['Billing details', clean(d.billing) || '—'],
      ['Amount paid', clean(d.amount) ? '₹ ' + clean(d.amount) : 'Not stated'],
      ['Payment mode', clean(d.payMode)],
      ['UPI transaction / UTR', '<b>' + clean(d.txnId) + '</b>'],
      ['Payment date', clean(d.payDate) || '—'],
      ['Remarks', clean(d.remarks).replace(/\n/g, '<br>') || '—'],
      ['Screenshot', fileUrl ? link(fileUrl, 'Open in Drive') : 'Attached to this email']
    ], 'The payment screenshot is attached. Verify the transaction ID against the bank statement, then send '
     + 'the delegate their confirmation and mark the rows as verified in the sheet. This booking has written '
     + headcount + ' row' + (headcount > 1 ? 's' : '') + ' to the "' + SETTINGS.IRCON_TAB
     + '" tab under Registration ID ' + regId + ' — one row per person.'),
    attachments: [blob]
  });

  if (SETTINGS.ACKNOWLEDGE_VISITOR) {
    safeMail(email, 'Registration received — IR Conference 2026, NIPM Hosur Chapter',
      card('Thank you — your registration has reached us', [
        ['Registration ID', regId],
        ['Delegate', name],
        ['Organisation', clean(d.company)],
        ['Category', clean(d.category)],
        ['Registration type', clean(d.regMode) || 'Individual registration'],
        ['No. of delegates', clean(d.delegates)],
        ['Accommodation', clean(d.accommodation) + ' — accommodation and food are included in the fee'],
        ['Amount paid', clean(d.amount) ? '₹ ' + clean(d.amount) : 'As paid'],
        ['UPI transaction / UTR', clean(d.txnId)],
        ['Conference', '19 &amp; 20 September 2026 — Hotel Holiday Valley, Hosur, Tamil Nadu']
      ], 'Your registration is not yet confirmed. The conference team will verify the payment against our bank '
       + 'records and send your confirmation to this email address and on WhatsApp. For anything urgent, '
       + 'WhatsApp +91 94876 34638 or write to conference@nipmhosur.in.'));
  }

  return json({ ok: true });
}


function handleSponsorRegistration(d) {
  var org = clean(d.company), name = clean(d.name), email = clean(d.email), phone = clean(d.phone);
  if (!org || !name || !email || !phone) {
    return json({ ok: false, error: 'Organisation, contact person, email and mobile number are required' });
  }
  if (!clean(d.txnId)) {
    return json({ ok: false, error: 'The UPI transaction ID / UTR number is required' });
  }
  if (!d.file || !d.file.data) {
    return json({ ok: false, error: 'The payment screenshot is required' });
  }

  var when = stamp();

  var bytes = Utilities.base64Decode(d.file.data);
  if (bytes.length > SETTINGS.MAX_FILE_BYTES) {
    return json({ ok: false, error: 'Screenshot is larger than 5 MB' });
  }
  var safeName = ('IRCON2026 SPONSOR — ' + org + ' — ' + clean(d.txnId) + ' — ' + when)
    .replace(/[\\/:*?"<>|]/g, '-') + extFor(d.file);
  var blob = Utilities.newBlob(bytes, d.file.type || 'image/jpeg', safeName);

  var shot = storeScreenshot(blob, SETTINGS.IRCON_FOLDER);
  var fileUrl = shot.url;

  var ssh = sheetFor(SETTINGS.SPONSOR_TAB, [
    'Date & Time', 'Organisation', 'Brand Name', 'Contact Person', 'Designation',
    'Mobile', 'Email', 'Website', 'City', 'Reference Member', 'Reference Mobile',
    'Sponsorship Category', 'Additional Stall', 'Extra Delegate Passes',
    'GSTIN', 'Billing Name & Address',
    'Amount Paid (INR)', 'Payment Mode', 'UPI Transaction / UTR', 'Payment Date',
    'Screenshot Preview', 'Screenshot Link', 'Remarks', 'Status', 'Logo Received', 'Submitted From'
  ]);
  ssh.appendRow([
    when, org, clean(d.brandName) || org, name, clean(d.designation),
    phone, email, clean(d.website), clean(d.city),
    clean(d.reference), clean(d.referencePhone),
    clean(d.category), clean(d.stall), clean(d.passes),
    clean(d.gstin), clean(d.billing),
    clean(d.amount), clean(d.payMode), clean(d.txnId), clean(d.payDate),
    shot.preview, fileUrl, clean(d.remarks), 'Payment to be verified', 'No', clean(d.page)
  ]);
  sizeScreenshotRows(ssh, 1);

  MailApp.sendEmail({
    to: SETTINGS.ADMIN_EMAIL,
    replyTo: email,
    subject: 'IR Conference 2026 SPONSOR — ' + org + ' (' + clean(d.category) + ')',
    htmlBody: card('IR Conference 2026 — new sponsorship registration', [
      ['Received', when],
      ['Organisation', org],
      ['Brand name', clean(d.brandName) || org],
      ['Category', '<b>' + clean(d.category) + '</b>'],
      ['Additional stall', clean(d.stall)],
      ['Extra delegate passes', clean(d.passes) || '0'],
      ['Contact person', name + ' — ' + clean(d.designation)],
      ['Mobile', phone],
      ['Email', link('mailto:' + email, email)],
      ['Website', clean(d.website) || '—'],
      ['City', clean(d.city) || '—'],
      ['Reference member', (clean(d.reference) || '—')
        + (clean(d.referencePhone) ? ' — ' + clean(d.referencePhone) : '')],
      ['GSTIN', clean(d.gstin) || '—'],
      ['Billing details', clean(d.billing) || '—'],
      ['Amount paid', clean(d.amount) ? '₹ ' + clean(d.amount) : 'Not stated'],
      ['Payment mode', clean(d.payMode)],
      ['UPI transaction / UTR', '<b>' + clean(d.txnId) + '</b>'],
      ['Payment date', clean(d.payDate) || '—'],
      ['Remarks', clean(d.remarks).replace(/\n/g, '<br>') || '—'],
      ['Screenshot', fileUrl ? link(fileUrl, 'Open in Drive') : 'Attached to this email']
    ], 'Check that the category still has a slot free before confirming — categories are limited. Verify the '
     + 'transaction against the bank statement, then collect the logo and artwork and mark the row as verified.'),
    attachments: [blob]
  });

  if (SETTINGS.ACKNOWLEDGE_VISITOR) {
    safeMail(email, 'Sponsorship received — IR Conference 2026, NIPM Hosur Chapter',
      card('Thank you — your sponsorship details have reached us', [
        ['Organisation', org],
        ['Category', clean(d.category)],
        ['Additional stall', clean(d.stall)],
        ['Extra delegate passes', clean(d.passes) || '0'],
        ['Amount paid', clean(d.amount) ? '₹ ' + clean(d.amount) : 'As paid'],
        ['UPI transaction / UTR', clean(d.txnId)],
        ['Conference', '19 &amp; 20 September 2026 — Hotel Holiday Valley, Hosur, Tamil Nadu']
      ], 'Your sponsorship is not yet confirmed. The Sponsorship Committee will verify the payment and confirm '
       + 'your category to this email address, then ask for your logo in vector or high-resolution PNG. '
       + 'For anything urgent, call +91 99528 54097 or write to conference@nipmhosur.in.'));
  }

  return json({ ok: true });
}

/* ---------------------------- HELPERS ------------------------------- */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}

function stamp() {
  return Utilities.formatDate(new Date(), SETTINGS.TIMEZONE, 'dd MMM yyyy, hh:mm a');
}

function extFor(file) {
  var t = (file.type || '').toLowerCase();
  if (t.indexOf('png') > -1) return '.png';
  if (t.indexOf('webp') > -1) return '.webp';
  if (t.indexOf('heic') > -1) return '.heic';
  return '.jpg';
}

function book() {
  return SETTINGS.SHEET_ID
    ? SpreadsheetApp.openById(SETTINGS.SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function sheetFor(tabName, headers) {
  var ss = book();
  if (!ss) throw new Error('No spreadsheet found. Set SHEET_ID in SETTINGS.');
  var sh = ss.getSheetByName(tabName);
  if (!sh) {
    sh = ss.insertSheet(tabName);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold').setBackground('#12256e').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, headers.length);
  }
  return sh;
}

/**
 * Saves the screenshot to Drive and returns
 *   { url: <Drive link>, preview: <=IMAGE() formula or a fallback string> }
 * The preview is what makes the picture appear inside the sheet cell.
 */
function storeScreenshot(blob, folderName) {
  var out = { url: '', preview: '' };
  try {
    var file = folderNamed(folderName).createFile(blob);
    out.url = file.getUrl();

    if (SETTINGS.EMBED_SCREENSHOT_IN_SHEET) {
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        out.preview = '=IMAGE("https://drive.google.com/thumbnail?id='
          + file.getId() + '&sz=w800", 4, '
          + (SETTINGS.SCREENSHOT_ROW_HEIGHT - 10) + ', '
          + (SETTINGS.SCREENSHOT_ROW_HEIGHT - 10) + ')';
      } catch (shareErr) {
        out.preview = 'Preview unavailable — open the link';
      }
    } else {
      out.preview = 'Open the link';
    }
  } catch (err) {
    out.url = 'Not saved to Drive: ' + err;
    out.preview = '';
  }
  return out;
}

/** Gives the rows just written enough height for the picture to be visible. */
function sizeScreenshotRows(sh, howMany) {
  if (!SETTINGS.EMBED_SCREENSHOT_IN_SHEET) return;
  try {
    var last = sh.getLastRow();
    var first = Math.max(2, last - howMany + 1);
    sh.setRowHeights(first, last - first + 1, SETTINGS.SCREENSHOT_ROW_HEIGHT);
  } catch (err) { /* row sizing is cosmetic — never fail a submission over it */ }
}

function folder() {
  return folderNamed(SETTINGS.DRIVE_FOLDER);
}

function folderNamed(nm) {
  var it = DriveApp.getFoldersByName(nm);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nm);
}

function link(href, text) {
  return '<a href="' + href + '" style="color:#12256e">' + text + '</a>';
}

function card(heading, rows, footNote) {
  var body = rows.map(function (r) {
    return '<tr>'
      + '<td style="padding:9px 14px;border-bottom:1px solid #e2e7f2;color:#5c657f;'
      + 'font-size:13px;white-space:nowrap;vertical-align:top">' + r[0] + '</td>'
      + '<td style="padding:9px 14px;border-bottom:1px solid #e2e7f2;color:#141b34;'
      + 'font-size:14px">' + (r[1] || '—') + '</td></tr>';
  }).join('');

  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto">'
    + '<div style="background:#12256e;color:#fff;padding:18px 22px;border-radius:6px 6px 0 0">'
    + '<div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#ff8a93">'
    + 'NIPM Hosur Chapter</div>'
    + '<div style="font-size:19px;font-weight:bold;margin-top:5px">' + heading + '</div></div>'
    + '<table style="width:100%;border-collapse:collapse;border:1px solid #e2e7f2;border-top:0">'
    + body + '</table>'
    + (footNote ? '<div style="padding:14px 18px;background:#f4f6fc;border:1px solid #e2e7f2;'
        + 'border-top:0;border-radius:0 0 6px 6px;color:#5c657f;font-size:13px">' + footNote + '</div>' : '')
    + '<div style="text-align:center;color:#8a93ab;font-size:11px;padding:14px">'
    + 'Sent automatically from www.nipmhosur.in</div></div>';
}

function safeMail(to, subject, htmlBody) {
  try {
    MailApp.sendEmail({ to: to, subject: subject, htmlBody: htmlBody, name: 'NIPM Hosur Chapter' });
  } catch (err) {
    // A bad visitor address must never fail the whole submission.
  }
}

/* ------------------------------ TEST -------------------------------- */
/**
 * Run this once from the Apps Script editor to check the sheet, the Drive
 * folder and the mailbox all work. It writes one test row to each tab.
 */
function runSelfTest() {
  handleContact({
    formType: 'contact', name: 'Test Entry', email: SETTINGS.ADMIN_EMAIL,
    phone: '+91 00000 00000', subject: 'Self test',
    message: 'This row was created by runSelfTest().', page: 'self-test'
  });
  Logger.log('Contact tab OK. Check the sheet and ' + SETTINGS.ADMIN_EMAIL + ', then delete the test rows.');
}
