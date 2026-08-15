# NIPM Hosur Chapter — website

Static site. Upload the whole folder to the web root; there is nothing to
install or compile.

---

## What was added in this update

**1. Announcements bell**
A bell sits in the navigation beside Contact, with a red count badge for items
the visitor has not seen yet. Opening the panel clears the badge. The four
announcements are set in `nipm-config.js`.

**2. Gallery**
All 80 photographs are on `gallery.html` with a full-screen viewer (arrow keys,
swipe, Escape to close). The home page shows the first five in a mosaic with
a **View all 80 photographs** button. Images were resized and recompressed —
103 MB down to 23 MB — so pages stay fast on mobile data.

**3. Leadership**
The five office bearers, with photographs, on the home page and on
`about.html`. The seven placeholder portraits that shipped with the original
site have been deleted.

**4. FAQs**
Seven questions with answers, on the home page (`index.html#faq`) and repeated
at the foot of the Contact page.

**5. Testimonials** *(removed August 2026)*
The leadership quote cards and the scrolling Member Voices rail have been taken
off the site completely, along with their CSS, their script and the
`memberTestimonials` list in `nipm-config.js`.

**6. Member benefits**
Networking · Learning · Careers · Events · Resources · Leadership — on the home
page and on `membership.html`.

**7. Contact form**
Sends to admin@nipmhosur.in and records a row in Google Sheets.
Needs the one-time setup below.

**8. Payment confirmation form**
On `contribute.html`, below the bank details. Collects name, phone, email,
company, membership status, amount and a **required payment screenshot**, then
emails it all to admin@nipmhosur.in with the screenshot attached and records it
in Google Sheets.

**9. Footer credit**
"All rights reserved to and developed by Tri Stone Industries Pvt Ltd, Trichy"
on every page.

**10. Events archive**
Sixteen programmes on `events.html`, filterable by year, each with its own page
carrying the full write-up, speakers, venue and timings. Every event offers its
brochure as a **PDF** and as a **JPG**, and the poster images open full screen.
Brochure files live in `events/brochures/`.

**11. Member voices**
An auto-scrolling rail of member testimonials on the home page, directly above
the FAQs. It pauses when the pointer is over it and falls back to a static grid
for visitors who have reduced motion turned on.
⚠️ **Names, roles and photographs are placeholders.** See below.

**12. Chapter social accounts**
Facebook, Instagram and LinkedIn in the footer now point at the Hosur Chapter's
own accounts rather than the national body's.

**13. Fixes in this round**
- The brochure block on every event page now lays out properly: poster previews
  on the left, download panel on the right, stacking on phones. The styles for
  it were missing entirely, which is why it looked unaligned.
- Announcements now match the real events. One of them previously pointed at
  `event-labour-codes-workshop.html`, a page that no longer exists.
- The IR Conference button in the menu bar glows every 2 seconds.
- `seal.png` had an opaque white background, which showed as a pale rectangle
  behind every page header. It is now transparent.
- The menu bar collapses to the burger at 1240px instead of 1080px, so the
  bell no longer gets clipped, and the header fits small phones.

---

## Two things still need real content

**1. Member testimonials.** Open `nipm-config.js` and edit
`memberTestimonials`. The quotes are usable as written, but replace every
`name`, `role` and `photo` with a member who has agreed to be quoted. Photos go
in the website folder — square images, 440 px or larger. `member-1.png` to
`member-6.png` are blank placeholders.

**2. Leadership testimonials.** The three quotes on the home page are also
placeholder wording. Search `class="tmn"` in `index.html`.

---

## One thing left to do

**The two forms are not connected yet.** Follow
`google-apps-script/SETUP.md` — about ten minutes — then paste the URL it
gives you into `nipm-config.js`.

Until that is done, both forms still work: they open the visitor's email app
with everything filled in, addressed to admin@nipmhosur.in. Nobody hits a dead
end, but nothing reaches the spreadsheet.

---

## Day-to-day editing

### Post a new announcement

Open `nipm-config.js` and add an entry at the **top** of `announcements`:

```js
{
  id: "natcon-2027",                       // must be new — this is what makes
  icon: "📢",                              // the red badge appear
  title: "NATCON 2027 dates announced",
  text: "One short supporting line.",
  date: "March 2027",
  link: "events.html"                      // optional
},
```

Give every new item a **new `id`**. That is what tells returning visitors
something has changed. Upload `nipm-config.js` — no other file changes.

To take an announcement down, delete its block. Keep the list to four or five;
the panel scrolls beyond that.

### Add gallery photographs

Put the full-size image in `gallery/` as `gal-81.jpg` and a smaller copy in
`gallery/thumbs/` under the same name, then add one line to `gallery.html`
alongside the others:

```html
<a href="gallery/gal-81.jpg" data-lb="NIPM Hosur Chapter — photograph 81 of 81">
  <img src="gallery/thumbs/gal-81.jpg" alt="NIPM Hosur Chapter photograph 81"
       loading="lazy" decoding="async" /></a>
```

Keep full-size images around 1600 px on the long edge and thumbnails around
700 px, or pages get slow.

### Add an event

Event pages are generated, so the quickest route is to copy an existing
`event-*.html`, change the text, and add a matching card to `events.html`.
For each event you need:

- the poster at `events/<slug>-1.jpg` (about 1200 px wide)
- a thumbnail at `events/thumbs/<slug>-1.jpg` (about 600 px wide)
- the brochure at `events/brochures/<slug>.pdf`

Then update the count in the *Archive* heading on `events.html`, and add the
new page to `sitemap.xml`.

### Change a member testimonial

Everything is in `memberTestimonials` in `nipm-config.js` — quote, name, role
and photo filename. Add or remove entries freely; the rail adjusts its speed to
the number of cards. Upload `nipm-config.js` and the photographs.

### Change a leader or a role

The photographs are `team-chairman.png`, `team-vice-chairman.png`,
`team-secretary.png`, `team-treasurer.png` and `team-addl-secretary.png`.
Replace the file, keeping the same name and the circular gold ring, and the
site picks it up. Names and roles appear in `index.html` and `about.html`.

### Change an FAQ

The questions live in `index.html` and `contact.html`. Edit both so they match.

---

## Notes

- Every page carries its own copy of the stylesheet and scripts, which is how
  the original site was built. A change to shared styling has to be made in all
  twenty-six HTML files.
- The bell badge remembers what a visitor has read using their browser's local
  storage. Nothing is sent anywhere and it clears with their browsing data.
- Announcements, gallery images and the FAQ all work with JavaScript turned
  off, apart from the bell panel and the full-screen image viewer.

---

## Latest revision

- **Brochure sections realigned.** Every event page now shows the download bar
  full width with the poster grid beneath it. Tiles share one shape, so rows
  line up whether an event has one poster or four, and posters are shown whole
  rather than cropped.
- **The bell follows the events.** Give an announcement an `on` date
  (`YYYY-MM-DD`) in `nipm-config.js` and it sorts itself: anything still to
  come is listed first and tagged **Upcoming**, then past events newest first,
  then undated notices. Leave an event in the list after it happens and it
  drops down on its own.
- **IR Conference pill** in the navigation now glows every 2 seconds.
- **Executive Committee** added below the office bearers on the home page and
  on `about.html`: Sivakavya, Sivabaskar, Rakesh, Vimal Francis and
  Rajendrakumar, with photographs.

---

## IR Conference 2026 (August 2026 update)

**Conference page — `ir-conference.html`**
Now carries the full detail from the conference brochure alongside the
sponsorship proposal: the two-day residential format, the 400+ delegate
profile, key takeaways, who should attend, registration fees, accommodation,
about Hosur, and the four-step how-to-register strip. The hero buttons lead to
**Register Now**, fees, brochures and sponsorship.

**Registration fees** (per delegate, two-day residential, inclusive of GST):

| Category | Base | Payable |
| --- | --- | --- |
| Early-bird (limited period, subject to seat availability) | ₹7,000 + 18% GST | **₹8,260** |
| NIPM members | ₹7,500 + 18% GST | **₹8,850** |
| Non-NIPM members | ₹7,900 + 18% GST | **₹9,322** |

**Brochure downloads**
Both brochures download from three places — `events.html` (under the Coming Up
card), `ir-conference.html#brochures`, and the registration page:

- `events/brochures/ir-conference-2026-brochure.pdf` — the conference brochure
- `events/brochures/ir-conference-2026-sponsorship-brochure.pdf` — the sponsorship proposal

Every page of both brochures is also shown as a thumbnail that opens full
screen, generated into `events/` and `events/thumbs/`.

**Registration page — `ir-conference-register.html`**
A separate page: fees, then the SBI QR and bank details, then the delegate
form. The form collects the delegate's details, category, number of delegates,
accommodation and food requirement, GST details for the invoice, amount paid,
payment mode, **UPI transaction ID / UTR** and a **payment screenshot**. The
last two are compulsory — the form will not submit without both. The amount
payable updates as the category and delegate count change.

Submissions go to the **IR Conference 2026 Registrations** tab of the same
Google Sheet, are emailed to admin@nipmhosur.in with the screenshot attached,
and the screenshot is filed in Drive under *NIPM Hosur — IR Conference 2026
Payment Proofs*. The delegate gets an acknowledgement stating the seat is
confirmed only after the payment is verified. See
`google-apps-script/SETUP.md`.

If `formEndpoint` in `nipm-config.js` is still empty, the form falls back to
opening a pre-filled email to admin@nipmhosur.in — so nothing is lost, but the
sheet stays empty until the script is deployed.

### Sponsor registration (second update)

`ir-conference-sponsor.html` is the sponsor equivalent of the delegate page:
sponsorship categories, the SBI QR and bank details, then a form that captures
the organisation, contact person, category, add-ons, GST/billing details,
amount paid, **UPI transaction ID / UTR** and the **payment screenshot** — both
compulsory, exactly as on the delegate form.

Amount payable is calculated live: category + ₹25,000 if an additional stall is
ticked + ₹7,000 per extra delegate pass.

| Category | Investment | Passes | Max partners |
| --- | --- | --- | --- |
| Title Sponsor | ₹10,00,000 | 6 | 1 |
| Platinum | ₹7,00,000 | 4 | 3 |
| Gold | ₹5,00,000 | 3 | 3 |
| Silver Cat-1 | ₹3,00,000 | 2 | 3 |
| Takeaway Sponsor | kits worth ₹2,00,000 | — | — |
| Bronze | ₹1,00,000 | 1 | 5 |
| Stall | ₹50,000 | passes at ₹7,000 each | 20 |

Sponsor submissions land in their own tab, **IR Conference 2026 Sponsors**,
with Status and Logo Received columns to work from.

Both routes are offered side by side in a two-column block — *Delegate
Registration* and *Sponsor Registration* — on `ir-conference.html#registration`,
at the top of both form pages, and from the Events page.

The WhatsApp and other icon buttons now size their icons through a shared
`.btn svg` rule, so the label sits on the same line as the icon, and button
rows stack full-width below 520px.

---

## IR Conference 2026 — third update (registration visibility & bulk booking)

### 1. The register button never leaves the screen

A red-bordered **register bar** sits directly under the navigation on
`ir-conference.html`, `ir-conference-register.html` and
`ir-conference-sponsor.html`. It is `position:sticky`, so it stays pinned below
the menu for the whole page — scrolling never hides it. It carries the dates,
the three fee levels and two buttons: **Register Now** and **Become a Sponsor**.

A **floating red pill** also fades in at the bottom-right of those pages once
the visitor has scrolled past the hero, so the call to action is reachable from
any point in the page without scrolling back up.

Counting the places a delegate can start a registration on
`ir-conference.html`: the sticky bar, the hero buttons, the *Delegate
Registration* card in *Two ways to join*, a new button pair under the fee
cards, the *Four steps to your seat* block, the closing strip, and the floating
pill.

The bar sits below the menu using a `--navh` CSS variable that the shared
script sets from the real nav height, so it stays correct on every breakpoint.

### 2. Fees state what they include

Each of the three fee cards — Early-Bird, NIPM Members, Non-NIPM Members — now
carries a tick line reading *"Fee includes accommodation for the residential
programme and all food — breakfast, lunch, dinner and refreshments on both
days."* This appears on both `ir-conference.html` and
`ir-conference-register.html`, and the notes under the cards say the same.

### 3. Bulk (group) registration

The delegate form opens with a two-way choice:

* **Individual Registration** — one delegate, the form behaves as before.
* **Bulk / Group Registration** — reveals a *Number of delegates (including
  you)* dropdown from 2 to 30.

The person filling the form is **Person 1** and their details are the ones at
the top of the form. Choosing, say, 4 delegates instantly draws three cards —
**Person 2**, **Person 3**, **Person 4** — each capturing:

| Field | Required |
| --- | --- |
| Name | yes |
| Mobile number | yes |
| Email ID | yes |
| Gender | yes |
| Food preference | yes |
| Designation | optional |
| Organisation name | yes |
| Organisation location | yes |

Change the number and the cards are added or removed on the spot. Switching
back to Individual clears them, so no hidden required fields can block the
submit button.

Person 1 now also has a **Gender** field, so the whole group is captured
consistently.

### 4. The total is calculated in the window

The *Amount payable* panel updates live as the category or the group size
changes, and now shows a breakdown:

```
Category                          NIPM Member
Fee per delegate (incl. 18% GST)  ₹ 8,850
Number of delegates               4
Total amount to pay               ₹ 35,400
```

**Amount paid** is filled in automatically from that total. If the delegate
overwrites it with something different, a red note appears asking them to check
the count and category or explain the difference in Remarks — it warns, it does
not block. Payment, the **UPI transaction ID / UTR** and the **payment
screenshot** work exactly as before, and both remain compulsory.

### 5. Reference member on every form

A **Reference member** field is now on all four forms — delegate registration,
sponsor registration, contact and contribute — so the Chapter can see who
referred each registration. The two conference forms also take the reference
member's mobile number. All of them are optional and all of them reach the
sheet and the notification email.

### 6. Sheet columns

`google-apps-script/Code.gs` was updated to match. Re-paste it into the Apps
Script editor and redeploy (**Deploy → Manage deployments → edit → New
version**) or the new fields will not be recorded.

Everything continues to go to **admin@nipmhosur.in** and into **four separate
tabs** of one Google Sheet, each row timestamped in Asia/Kolkata:

| Form | Tab |
| --- | --- |
| Contact | *Contact Enquiries* |
| Contribute / payment confirmation | *Payment Confirmations* |
| IR Conference delegates (individual **and** bulk) | *IR Conference 2026 Registrations* |
| IR Conference sponsors | *IR Conference 2026 Sponsors* |

Payment screenshots are handled three ways at once:

1. **Attached to the notification email** sent to admin@nipmhosur.in.
2. **Shown as a picture inside the sheet** — the *Screenshot Preview* column
   renders the image in the cell, and the row is given enough height to see it.
3. **Saved to Drive**, with the full-size file linked from the *Screenshot
   Link* column.

For the picture to render, Google has to be able to load the file without a
login, so each screenshot is shared as *anyone with the link can view*. The
links are long and random and the files are never listed publicly, but anyone
given a URL could open that screenshot. If you would rather not allow that, set
`EMBED_SCREENSHOT_IN_SHEET: false` at the top of `Code.gs` — the Drive link
column still works for signed-in Chapter staff and the email attachment is
unaffected.

**Bulk registrations stay in the delegate tab.** A booking for four people
writes four rows there, one per person, sharing a **Registration ID**
(`IRC26-260915-142233`), the same UPI transaction number and the same
screenshot. Row count therefore equals the true headcount, so the tab doubles
as the badge list, the rooming list and the caterer's count. Person 1 is the
delegate who filled the form and paid; Persons 2, 3, 4… carry their own name,
designation, organisation, organisation location, mobile, email, gender and
food preference, with *Paid with IRC26-…* in their Amount column so the money
is only counted once.

The delegate tab also gains: Registration Type, Person No., Registered By,
Gender, Reference Member, Reference Mobile, Fee per Delegate, No. of Delegates
in Booking and Calculated Total.

Contact, Payment Confirmations and Sponsors each gain their Reference columns.

> Existing sheets keep their old header row. Google Sheets does not rewrite a
> header that already exists, so either let the new columns append to a fresh
> tab, or rename the old tabs (e.g. add "— old") and let the script build clean
> ones on the next submission.


---

## Leadership update (August 2026)

Office bearers, in the order they now appear on `index.html` and `about.html`:

1. Ramesh Kumar K — Chairman
2. Satheesh — Vice Chairman
3. Ramajyothi M — Secretary
4. Sudhakar Kesavan — **Joint Secretary** (was previously shown as Additional Secretary)
5. Balasubramani K — Treasurer

Executive Committee, in order: Rajendrakumar, Vimal Francis, Rakesh,
Sivabaskar, Sivakavya.

The photo filename for the Joint Secretary is still `team-addl-secretary.png` —
only the displayed title changed, so the image does not need renaming.

**Testimonials and Member Voices are gone.** Removed in full: the
`#testimonials` section and the `.mvoices` rail on the home page, the *Hear
from the leadership* button on `about.html`, both CSS blocks on all 28 pages,
the member-voices script, the `memberTestimonials` array in `nipm-config.js`,
and the six `member-*.png` placeholder photographs.
