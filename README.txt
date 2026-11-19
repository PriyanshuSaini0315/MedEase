MedEase — pharmacy billing website (static, no backend)

HOW TO RUN
  1. Unzip, open the folder "medease-site" in VS Code (File > Open Folder).
  2. Right-click index.html > "Open with Live Server".
     (or just double-click index.html, or run: python3 -m http.server 8000)

FOLDERS
  index.html   Landing page (start here)
  html/        all other pages
  css/         styles.css, app.css, dashboard.css, reports.css, pages.css
  js/          one JavaScript file per page + shared files
               (store.js = browser storage, common.js = sidebar/user, crud.js = list pages)

FLOW
  index -> Sign up -> Welcome -> Dashboard
  index -> Sign in -> Dashboard   (any valid-looking email + password; the shop
                                   name you used at sign-up is remembered)

PAGES (all in the sidebar)
  Dashboard, Token Queue, Products, Billing (Create Invoice, Invoice List),
  Inventory (Stock List, Near Expiry), Purchases, Parties, Reports, Alerts, Settings

DATA
  There is no server. Products, Parties, Purchases, Tokens and Settings are saved in
  your browser (localStorage) - add/edit/delete works and survives refresh.
  Stock List, Near Expiry, Alerts, Invoice List and Reports use sample data in
  js/inventory-data.js, js/invoices.js and js/reports.js.
  Settings > "Reset sample data" restores the starting data.
