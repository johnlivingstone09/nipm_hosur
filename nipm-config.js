/* =====================================================================
   NIPM HOSUR CHAPTER — site configuration
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to:
     1. Change the announcements shown in the bell menu
     2. Connect the Contact + Contribution forms to Google Sheets / email

   No other file needs to change. Upload this file after editing.
   ===================================================================== */

window.NIPM_CONFIG = {

  /* -------------------------------------------------------------------
     1. FORM ENDPOINT
     Paste the Google Apps Script Web App URL here after deploying
     google-apps-script/Code.gs  (see google-apps-script/SETUP.md).
     It looks like:
       https://script.google.com/macros/s/AKfycb..................../exec
     While this is left empty, both forms fall back to opening the
     visitor's email app addressed to admin@nipmhosur.in.
  ------------------------------------------------------------------- */
  formEndpoint: "https://script.google.com/macros/s/AKfycbzMb9jig-MVc-w36JnBQhR6OHHjqp7-y5iJGzOnMo5lHwEe13y8UdlB1a2WXqPmhFNZ/exec",

  /* Where submissions are emailed (also set inside Code.gs) */
  adminEmail: "admin@nipmhosur.in",

  /* -------------------------------------------------------------------
     2. ANNOUNCEMENTS  (newest first)
     id    : unique short string. CHANGE IT when you post a new item —
             that is what makes the red "unread" dot appear for visitors.
     icon  : any emoji
     title : the headline
     text  : one short supporting line (optional)
     date  : small label under the item (optional)
     link  : page or URL opened when clicked (optional)
     on    : the event's date as YYYY-MM-DD (optional, but recommended).
             The bell sorts by it on its own — anything still to come is
             listed first with an "Upcoming" tag, then past events newest
             first, then items with no date at all. So you can leave an
             event in the list after it happens and it moves down by itself..
             It must match a real page in this folder — a link to a page
             that has been renamed or removed gives visitors a dead end.
  ------------------------------------------------------------------- */
  announcements: [
    {
      id: "ir-conference-2026-register",
      icon: "🔴",
      on: "2026-09-19",
      title: "IR Conference 2026 — register online now",
      text: "Early-bird ₹8,260 · Members ₹8,850 · Non-members ₹9,322 — accommodation and food included. Individual or bulk/group registration.",
      date: "19 & 20 September 2026",
      link: "ir-conference-register.html"
    },
    {
      id: "ir-conference-2026-sponsors",
      icon: "\u2b50",
      on: "2026-09-19",
      title: "IR Conference 2026 — sponsorship open",
      text: "Title, Platinum, Gold, Silver, Bronze and Stall categories. Limited slots per category.",
      date: "19 & 20 September 2026",
      link: "ir-conference-sponsor.html"
    },
    {
      id: "ir-conference-2026-brochures",
      icon: "📄",
      on: "2026-09-19",
      title: "IR Conference 2026 — brochures available",
      text: "Conference brochure and sponsorship proposal, both downloadable as PDFs.",
      date: "19 & 20 September 2026",
      link: "ir-conference.html#brochures"
    },
    {
      id: "may-2026-meeting",
      icon: "🎤",
      on: "2026-05-26",
      title: "Culture by Design, Not by Chance",
      text: "Shri Britto K, Delta Electronics — May monthly meeting. Brochure available.",
      date: "26 May 2026",
      link: "event-may-2026-monthly-meeting.html"
    },
    {
      id: "april-2026-meeting",
      icon: "🎤",
      on: "2026-04-28",
      title: "Total Rewards",
      text: "Shri Sudhakar N, FANUC India — April monthly meeting.",
      date: "28 April 2026",
      link: "event-april-2026-monthly-meeting.html"
    },
    {
      id: "labour-codes-masterclass",
      icon: "📢",
      on: "2025-12-19",
      title: "New Labour Codes masterclass — materials online",
      text: "Two days with UNO MINDA, Titan, Bosch India and the Madras High Court.",
      date: "19 & 20 December 2025",
      link: "event-labour-codes-masterclass-2025.html"
    },
    {
      id: "event-brochures-2026",
      icon: "📄",
      title: "Every event brochure now downloadable",
      text: "All 16 programmes in the archive carry their brochure as a PDF or an image.",
      date: "Events archive",
      link: "events.html"
    },
    {
      id: "chapter-gallery-80",
      icon: "🖼️",
      title: "80 photographs added to the gallery",
      text: "Seminars, conclaves, industrial visits and member gatherings across the region.",
      date: "Chapter gallery",
      link: "gallery.html"
    }
  ]
};
