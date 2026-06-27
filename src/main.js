// App Bootstrap Entry Point (Option 2 - Minimalist Light Dashboard)
import { initCharts } from './charts.js';
import { 
  renderCustomerTable, 
  populateTimelineDropdown, 
  selectCustomer, 
  bindEvents, 
  initDropdownItems,
  checkAuthState,
  showToast,
  initGoogleIdentityServices
} from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Bind Interactions & Event Hooks (so login selectors are active immediately)
    bindEvents();

    // 2. Check active authentication state
    const loggedIn = checkAuthState();

    // Initialize Google Identity Services SDK
    initGoogleIdentityServices();

    // 3. Initialize Visualizations (Chart.js and accessible tables)
    initCharts();

    // 4. Populate Dropdowns & Lists
    populateTimelineDropdown();
    
    // 5. Render Data Table
    renderCustomerTable();

    // 6. Initialize notifications, directory tables, segment cards
    initDropdownItems();

    // 7. Select default customer (Liam O'Connell) to show timeline
    selectCustomer('liam-oconnell');

    // 8. Show Welcome Notification if already logged in
    if (loggedIn) {
      showToast("Predicta Churn Platform online. Loaded 24,510 profiles.", "success");
    }
    
  } catch (error) {
    console.error("Dashboard initialization error:", error);
    showToast("Failed to initialize dashboard parameters.", "danger");
  }
});
