# Connecting the forms to Gmail and Google Sheets

Three forms post to one Google Apps Script: **Contact**, **Contribute**
(payment confirmation) and **IR Conference 2026 registration**. It emails every
submission to **admin@nipmhosur.in** and appends a timestamped row to a Google
Sheet. Payment screenshots are attached to the email and saved to Drive.

Do this once. It takes about ten minutes and costs nothing.

---

## 1. Create the sheet

1. Sign in to Google as the account that owns **admin@nipmhosur.in** (or an
   account that can send as it).
2. Go to <https://sheets.new> and name the file **NIPM Hosur — Website
   Submissions**.
3. Leave it empty. The script creates the four tabs it needs on first use,
   one per form:
   *Contact Enquiries*, *Payment Confirmations*,
   *IR Conference 2026 Registrations* and *IR Conference 2026 Sponsors*.
   All four are emailed to **admin@nipmhosur.in** as well, with the payment
   screenshot attached where the form collects one, and the same screenshot
   shown as a picture in the sheet's *Screenshot Preview* column.

   The preview works by sharing each screenshot as *anyone with the link can
   view* so Google can render it. If you would rather the files stayed private
   to Chapter staff, set `EMBED_SCREENSHOT_IN_SHEET: false` near the top of
   `Code.gs`; the *Screenshot Link* column and the email attachment still work.

   Apps Script needs Drive sharing permission for this, so if you are updating
   an existing deployment, run the script once from the editor and accept the
   authorisation prompt again.

## 2. Add the script

1. In that sheet choose **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs`.
3. Open `Code.gs` from this folder, copy all of it, and paste it in.
4. Click the **save** icon.

Because the script lives inside the sheet, you can leave `SHEET_ID` empty —
it finds the sheet on its own. If you would rather keep the script separate,
create it at <https://script.google.com>, then copy the long ID out of the
sheet's URL into `SETTINGS.SHEET_ID`.

## 3. Check the settings

At the top of `Code.gs`, confirm:

| Setting | Value |
| --- | --- |
| `ADMIN_EMAIL` | `admin@nipmhosur.in` |
| `ACKNOWLEDGE_VISITOR` | `true` sends the visitor a confirmation too |
| `TIMEZONE` | `Asia/Kolkata` |

To copy submissions to a second person, use a comma:
`ADMIN_EMAIL: 'admin@nipmhosur.in, chairman@nipmhosur.in'`

## 4. Authorise it

1. Pick **runSelfTest** from the function dropdown and press **Run**.
2. Google asks for permission. Choose your account → **Advanced** →
   **Go to (project name)** → **Allow**.
   The warning screen is normal for a script you wrote yourself.
3. Check that a test row appeared in the sheet and a test email arrived.
   Delete the test row afterwards.

## 5. Deploy it

1. **Deploy → New deployment**.
2. Press the gear beside *Select type* and choose **Web app**.
3. Set:
   - **Description**: `NIPM Hosur forms`
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**  ← this must be *Anyone*, not
     *Anyone with a Google account*, or visitors will get an error.
4. **Deploy**, then **copy the Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycbx.....................number/exec
   ```

## 6. Put the URL on the site

Open **`nipm-config.js`** in the website folder and paste the URL:

```js
formEndpoint: "https://script.google.com/macros/s/AKfycbx.................../exec",
```

Upload `nipm-config.js` to the server. Both forms are now live.

## 7. Test from the live site

- Send a message from **Contact**. It should land in the mailbox and in the
  *Contact Enquiries* tab.
- Submit the **Contribute** form with a screenshot. It should arrive with the
  image attached, appear in *Payment Confirmations*, and the screenshot should
  be in the Drive folder *NIPM Hosur — Payment Screenshots*.
- Submit the **IR Conference 2026 registration** form
  (`ir-conference-register.html`) with a transaction ID and a screenshot. A new
  row should appear in *IR Conference 2026 Registrations* with the status
  column reading *Payment to be verified*, and the screenshot should be in the
  Drive folder *NIPM Hosur — IR Conference 2026 Payment Proofs*. The delegate
  gets an acknowledgement that says the seat is not yet confirmed.

---

## Changing the script later

Any time you edit `Code.gs`, go to **Deploy → Manage deployments**, press the
pencil, set **Version** to **New version**, and **Deploy**. The URL stays the
same, so `nipm-config.js` does not need to change.

## If something goes wrong

**Visitors see "we could not send that from the website just now."**
The site could not reach the script. Check that `formEndpoint` in
`nipm-config.js` is exact and ends in `/exec`, and that *Who has access* is
set to **Anyone**. Nothing is lost — the visitor is offered a pre-filled email
to admin@nipmhosur.in instead.

**Nothing arrives by email but rows appear in the sheet.**
You have hit the Gmail daily send quota (100/day on a free account, 1,500/day
on Workspace). The sheet still has everything.

**"Payment screenshot is required."**
The visitor pressed submit without attaching an image, or the image was over
5 MB. Raise `MAX_FILE_BYTES` if you want to allow larger files.

**Screenshots are missing from Drive but attached to the email.**
The script could not create the folder. Check Drive storage on the account.
The email attachment is the reliable copy.

## Working the IR Conference registrations

The *IR Conference 2026 Registrations* tab is the delegate list. Every row
arrives with **Status** set to *Payment to be verified*.

1. Match the **UPI Transaction / UTR** column against the SBI statement.
2. Open the **Screenshot** link to confirm the amount and the date.
3. Change **Status** to `Confirmed` (or `Rejected — payment not traced`) by
   hand, and send the delegate their confirmation on WhatsApp or by email.

The sheet is also the source for the accommodation list (**Accommodation**
column) and the billing details. Filter on those before the hotel deadline.

### Bulk registrations

Bulk bookings are saved in this same tab — there is no separate group sheet.
A booking for four people writes **four rows**, one per person, sharing a
**Registration ID**, the same **UPI Transaction / UTR** and the same
**Screenshot** link.

* **Person No.** is 1 for the delegate who filled the form and paid, then 2, 3,
  4… for the rest of the group.
* **Registered By** repeats the payer's name on every row, so you can sort or
  filter a whole group together.
* **Amount Paid** carries the real figure only on Person 1's row; the others
  read *Paid with IRC26-…*, so totalling the column never double-counts.
* **No. of Delegates in Booking** and **Calculated Total** are repeated on
  every row of the booking for reference.

Because there is one row per human being, the row count is the headcount —
filter **Food Preference** for the caterer, **Accommodation** for the hotel,
and use Name / Organisation / Designation straight off the tab for badges.

When you verify a payment, set **Status** on every row sharing that
Registration ID, not just the first.

### Reference member

Every form now carries a **Reference Member** column — who referred the
registration. The two conference forms also capture the reference member's
mobile number. Useful for recognising the members who bring the most delegates
in.

Registration fees are set in two places and must match if they ever change:
the fee cards on `ir-conference.html` / `ir-conference-register.html`, and the
`data-fee` values on the category dropdown in `ir-conference-register.html`
(the dropdown drives the "amount payable" figure shown to the delegate).

## Working the sponsor registrations

The *IR Conference 2026 Sponsors* tab works the same way as the delegate tab,
with two extra columns:

- **Status** — starts at *Payment to be verified*. Before confirming, check the
  category still has a slot free (Title 1, Platinum 3, Gold 3, Silver Cat-1 3,
  Bronze 5, Stall 20).
- **Logo Received** — starts at *No*. Set it to *Yes* once the sponsor sends
  their vector or high-resolution logo, so nothing is missed at print time.

Sponsorship amounts are set in the category dropdown on
`ir-conference-sponsor.html` (the `data-fee` values), on the tier cards, and in
the benefit table on `ir-conference.html`. Change all three together.

## Keeping records tidy

All four tabs grow indefinitely. Once a quarter, copy old rows to an archive
sheet and clear them. Payment screenshots in Drive are worth keeping for at
least one financial year.
