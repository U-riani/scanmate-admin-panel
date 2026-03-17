Please fix the following bugs and add new features to the Scanmate admin panel:

---

## 🐛 BUG FIXES

### 1. First-time Create fails
When creating any record for the first time, it fails. Second attempt works fine.
- Investigate and fix the root cause (likely a race condition or missing await/refresh)
- Should work correctly on the FIRST attempt every time

### 2. Transfer Actions not working
Transfer actions (approve, reject, complete, etc.) are throwing errors.
- Debug all transfer action endpoints and buttons
- Fix error handling on both frontend and backend
- Show proper success/error messages after each action

### 3. Terminal errors on startup
Backend throws errors on uvicorn startup (see logs). 
- Review app/main.py and fix any startup exceptions
- Ensure the app boots cleanly without errors

---

## ✨ NEW FEATURES

### 4. Warehouses field — replace ID input with Multi-Select dropdown
Currently: "Warehouses (comma-separated IDs)" — user types raw IDs
Replace with:
- A proper multi-select dropdown component
- Options should show warehouse NAMES (not IDs)
- Fetch warehouse list from the API
- Submit the selected IDs to the backend (same as before, just better UX)

### 5. Import Template Download
On every page that has an Import/Upload button, add a "Download Template" button next to it.
- Button label: "Download Template" with a download icon
- Each module gets its own template with the correct column headers
- Template format: .xlsx or .csv
- Modules: Warehouses, Users, Roles, Transfers, Transfer Lines, Inventorizations, Inventorization Lines, Price Uploads

### 6. Warehouse Selector in Header — improvements
The warehouse selector shown next to the user avatar in the top header needs:
a) Add an "All Warehouses" option at the top of the list
b) Improve the design — make it look more polished:
   - Styled dropdown with warehouse name displayed clearly
   - Nice hover/active states
   - Small warehouse icon next to the selector
   - Smooth open/close animation

---

## 📋 NOTES
- Keep all existing functionality intact
- Use existing API endpoints where possible
- For new endpoints needed, add them to the FastAPI backend as well
- Test that everything works end-to-end after changes