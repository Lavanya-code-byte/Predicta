import { highRiskCustomers, timelines, riskThresholds, cohortKPIs, mockNotifications } from './data.js';
import { updateTrendsChart, updateDriversChart, updateSimulationChart, updateChartsForCohort } from './charts.js';

let activeCustomerId = 'liam-oconnell'; // Default selected customer for dashboard timeline
let filteredDashboardCustomers = [...highRiskCustomers];

// Directory State
let directoryCurrentPage = 1;
const directoryPageSize = 10;
let filteredDirectoryCustomers = [...highRiskCustomers];

// DOM Element references
const tableBody = document.getElementById('predictions-table-body');
const searchInput = document.getElementById('global-search');
const userSelectDropdown = document.getElementById('timeline-user-select');
const timelineAvatar = document.getElementById('timeline-avatar');
const timelineUserName = document.getElementById('timeline-user-name');
const timelineUserPlan = document.getElementById('timeline-user-plan');
const timelineListItems = document.getElementById('timeline-list-items');

// Dialog Elements
const engageDialog = document.getElementById('engage-dialog');
const dialogCustAvatar = document.getElementById('dialog-cust-avatar');
const dialogCustName = document.getElementById('dialog-cust-name');
const dialogCustScore = document.getElementById('dialog-cust-score');
const dialogCustPlan = document.getElementById('dialog-cust-plan');
const dialogDriverTag = document.getElementById('dialog-driver-tag');
const dialogDriverDesc = document.getElementById('dialog-driver-desc');
const engageForm = document.getElementById('engage-outreach-form');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// Header Dropdowns
const notificationDropdown = document.getElementById('notification-dropdown');
const profileDropdown = document.getElementById('profile-dropdown');

// Directory Elements
const directoryTableBody = document.getElementById('directory-table-body');
const dirSearchInput = document.getElementById('dir-search-input');
const dirFilterPlan = document.getElementById('dir-filter-plan');
const dirFilterRisk = document.getElementById('dir-filter-risk');
const paginationText = document.getElementById('pagination-text');
const paginationPrevBtn = document.getElementById('pagination-prev-btn');
const paginationNextBtn = document.getElementById('pagination-next-btn');

// Predictions Simulator Sliders
const sliderSla = document.getElementById('slider-sla');
const sliderDiscount = document.getElementById('slider-discount');
const sliderTraining = document.getElementById('slider-training');
const valSla = document.getElementById('val-slider-sla');
const valDiscount = document.getElementById('val-slider-discount');
const valTraining = document.getElementById('val-slider-training');
const simProjectedChurn = document.getElementById('sim-projected-churn');
const simChurnReduction = document.getElementById('sim-churn-reduction');

// Settings Elements
const settingsHighSlider = document.getElementById('settings-threshold-high');
const settingsMedSlider = document.getElementById('settings-threshold-med');
const valSettingsHigh = document.getElementById('val-settings-threshold-high');
const valSettingsMed = document.getElementById('val-settings-threshold-med');

// Authentication Elements
const loginGate = document.getElementById('login-gate');
const googleChooserDialog = document.getElementById('google-chooser-dialog');
const googleSignupSubform = document.getElementById('google-signup-subform');
const googleAccountsList = document.getElementById('google-accounts-list');

// ==========================================
// TOAST NOTIFICATIONS & POPUPS
// ==========================================
export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'danger') {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// AUTHENTICATION LOGIC (Google Login/Signup)
// ==========================================
export function checkAuthState() {
  const session = localStorage.getItem('predicta_user');
  if (session) {
    try {
      const user = JSON.parse(session);
      loginGate.classList.add('hidden');
      updateHeaderProfile(user);
      return true;
    } catch (e) {
      console.error("Corrupted authentication session:", e);
      logoutUser();
      return false;
    }
  } else {
    loginGate.classList.remove('hidden');
    return false;
  }
}

function loginUser(userObject) {
  localStorage.setItem('predicta_user', JSON.stringify(userObject));
  loginGate.classList.add('hidden');
  updateHeaderProfile(userObject);
  showToast(`Welcome back, ${userObject.name}! Authenticated.`, 'success');
}

function logoutUser() {
  localStorage.removeItem('predicta_user');
  loginGate.classList.remove('hidden');
  
  // Re-initialize GSI button state if Client ID is configured
  initGoogleIdentityServices();

  showToast("Session cleared. Logged out.", "warning");
}

function updateHeaderProfile(user) {
  document.getElementById('hdr-user-avatar').src = user.avatar;
  document.getElementById('hdr-user-name').textContent = user.name;
  document.getElementById('hdr-user-role').textContent = user.role;
  document.getElementById('dropdown-profile-name').textContent = user.name;
  document.getElementById('dropdown-profile-email').textContent = user.email;
}

// Decodes standard Base64-Url Google JWT token payload clientside
function decodeGoogleJwt(credential) {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT payload decoding failure:", error);
    return null;
  }
}

// Handles the credentials packet sent from Google SDK
function handleGoogleSignInResponse(response) {
  const payload = decodeGoogleJwt(response.credential);
  if (payload) {
    loginUser({
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
      role: "Google Authenticated Analyst"
    });
  } else {
    showToast("Google login failed during payload decryption.", "danger");
  }
}

// Initializes official Google Identity Services SDK
export function initGoogleIdentityServices() {
  const container = document.getElementById('google-signin-container');
  if (!container) return;

  const savedClientId = localStorage.getItem('predicta_google_client_id') || '475279042708-1k939ar9461bni097a2m4k14f06hhd8v.apps.googleusercontent.com';

  if (savedClientId) {
    // Official Google Credentials Setup
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: savedClientId,
          callback: handleGoogleSignInResponse
        });

        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'rectangular'
        });

        // Trigger One Tap sign-in prompt dynamically
        window.google.accounts.id.prompt();
      } else {
        // SDK script failed to load or is offline. Check if script is currently loading.
        const script = document.querySelector('script[src*="gsi/client"]');
        if (script && !script.dataset.loadedListenerAdded) {
          script.dataset.loadedListenerAdded = "true";
          script.addEventListener('load', () => {
            initGoogleIdentityServices();
          });
          script.addEventListener('error', () => {
            renderOfflineButton(container);
          });
          // Timeout fallback in case it fails silently or takes too long
          setTimeout(() => {
            if (!window.google || !window.google.accounts) {
              renderOfflineButton(container);
            }
          }, 3500);
        } else if (!script || script.dataset.loadedListenerAdded) {
          renderOfflineButton(container);
        }
      }
    } catch (err) {
      console.error("GIS initialization error:", err);
      renderOfflineButton(container);
    }
  } else {
    // Show placeholder button alerting user to setup configuration or trigger demo mode
    container.innerHTML = `
      <button class="google-gsi-placeholder-btn" id="btn-mock-gsi-trigger">
        <svg viewBox="0 0 24 24" width="16" height="16" class="google-g-logo" aria-hidden="true">
          <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.99 1 12 1 7.35 1 3.37 3.65 1.44 7.5l3.82 2.96C6.18 7.37 8.87 5.04 12 5.04z"/>
          <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-5.02 3.7-8.62z"/>
          <path fill="#fbbc05" d="M5.26 14.54c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.44 6.98C.52 8.84 0 10.91 0 13s.52 4.16 1.44 6.02l3.82-2.48z"/>
          <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.13 0-5.82-2.33-6.74-5.42L1.44 15.4C3.37 19.25 7.35 23 12 23z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
    `;
    const btn = document.getElementById('btn-mock-gsi-trigger');
    if (btn) {
      btn.addEventListener('click', triggerSimulatedChooser);
    }
  }
}

function renderOfflineButton(container) {
  container.innerHTML = `
    <button class="google-gsi-placeholder-btn" id="btn-mock-gsi-trigger">
      <svg viewBox="0 0 24 24" width="16" height="16" class="google-g-logo" aria-hidden="true">
        <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.99 1 12 1 7.35 1 3.37 3.65 1.44 7.5l3.82 2.96C6.18 7.37 8.87 5.04 12 5.04z"/>
        <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-5.02 3.7-8.62z"/>
        <path fill="#fbbc05" d="M5.26 14.54c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.44 6.98C.52 8.84 0 10.91 0 13s.52 4.16 1.44 6.02l3.82-2.48z"/>
        <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.13 0-5.82-2.33-6.74-5.42L1.44 15.4C3.37 19.25 7.35 23 12 23z"/>
      </svg>
      <span>Sign in with Google (Offline)</span>
    </button>
  `;
  const btn = document.getElementById('btn-mock-gsi-trigger');
  if (btn) {
    btn.addEventListener('click', triggerSimulatedChooser);
  }
}

function triggerSimulatedChooser() {
  googleSignupSubform.classList.add('hidden');
  googleAccountsList.classList.remove('hidden');
  googleChooserDialog.showModal();
}

// ==========================================
// VIEW ROUTER (SPA navigation)
// ==========================================
function switchView(viewName) {
  document.querySelectorAll('.dashboard-view').forEach(view => {
    view.classList.add('hidden');
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  document.querySelectorAll('#sidebar-nav a').forEach(nav => {
    nav.classList.remove('active');
  });
  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  if (viewName === 'customers') {
    refreshDirectoryTable();
  } else if (viewName === 'predictions') {
    triggerSimulation();
  } else if (viewName === 'segments') {
    renderSegments();
  }
}

// ==========================================
// COHORT METRICS FILTER
// ==========================================
function applyCohortFilter(cohortKey) {
  const data = cohortKPIs[cohortKey] || cohortKPIs["all-customers"];

  document.getElementById('val-total-customers').textContent = data.totalCustomers.value;
  document.getElementById('badge-total-customers').textContent = data.totalCustomers.change;

  document.getElementById('val-retention-rate').textContent = data.retentionRate.value;
  document.getElementById('badge-retention-rate').textContent = data.retentionRate.change;

  document.getElementById('val-churn-risk').textContent = data.churnRisk.value;
  document.getElementById('badge-churn-risk').textContent = data.churnRisk.change;

  document.getElementById('val-revenue-risk').textContent = data.revenueRisk.value;

  const revenueCard = document.getElementById('kpi-revenue-risk');
  const alertBadge = data.revenueRisk.change;
  if (alertBadge === 'Stable') {
    revenueCard.classList.remove('danger-alert');
    revenueCard.querySelector('.risk-indicator').style.color = 'var(--color-success)';
    revenueCard.querySelector('.risk-indicator').style.backgroundColor = 'var(--color-success-light)';
  } else if (alertBadge === 'Critical' || alertBadge === 'Alert') {
    revenueCard.classList.add('danger-alert');
    revenueCard.querySelector('.risk-indicator').style.color = 'var(--color-danger)';
    revenueCard.querySelector('.risk-indicator').style.backgroundColor = 'var(--color-danger-light)';
  }

  const hrLabel = document.getElementById('high-risk-count');
  if (cohortKey === 'near-cirolint') {
    hrLabel.textContent = '772';
  } else if (cohortKey === 'enterprise') {
    hrLabel.textContent = '18';
  } else {
    hrLabel.textContent = '1,280';
  }

  updateChartsForCohort(cohortKey);
}

// ==========================================
// DASHBOARD VIEW TAB: HIGHRISK CUSTOMER TABLE
// ==========================================
export function renderCustomerTable() {
  tableBody.innerHTML = '';
  
  if (filteredDashboardCustomers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: var(--space-lg);">
          No matching high-risk customers found.
        </td>
      </tr>
    `;
    return;
  }

  filteredDashboardCustomers.forEach(cust => {
    let scoreClass = 'text-success';
    if (cust.churnScore >= riskThresholds.high) {
      scoreClass = 'text-danger';
    } else if (cust.churnScore >= riskThresholds.medium) {
      scoreClass = 'text-warning';
    }

    const tr = document.createElement('tr');
    if (cust.id === activeCustomerId) {
      tr.classList.add('selected-row');
      tr.style.backgroundColor = 'var(--color-primary-light)';
    }

    tr.innerHTML = `
      <td class="table-cust-cell" style="cursor: pointer;">
        <span class="user-avatar-sm" style="display: inline-flex; vertical-align: middle; margin-inline-end: var(--space-sm); background-color: var(--color-primary); font-size: 0.75rem; width: 28px; height: 28px;">
          ${cust.avatar}
        </span>
        <span style="vertical-align: middle;">${cust.name}</span>
      </td>
      <td>${cust.plan}</td>
      <td><span class="score-badge ${scoreClass}">${cust.churnScore}%</span></td>
      <td>${cust.activity}</td>
      <td class="text-right">
        <button class="btn-engage" data-id="${cust.id}">Engage</button>
      </td>
    `;

    tr.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        selectCustomer(cust.id);
      }
    });

    tableBody.appendChild(tr);
  });

  document.querySelectorAll('#predictions-table-body .btn-engage').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEngagementModal(btn.getAttribute('data-id'));
    });
  });
}

// Select a customer and update active UI state
export function selectCustomer(customerId) {
  activeCustomerId = customerId;
  populateTimelineDropdown();
  
  document.querySelectorAll('#predictions-table-body tr').forEach(tr => {
    tr.style.backgroundColor = '';
    tr.classList.remove('selected-row');
  });

  const rows = tableBody.children;
  filteredDashboardCustomers.forEach((cust, index) => {
    if (cust.id === customerId && rows[index]) {
      rows[index].style.backgroundColor = 'var(--color-primary-light)';
      rows[index].classList.add('selected-row');
    }
  });

  renderTimeline(customerId);
}

// Populate timeline select dropdown
export function populateTimelineDropdown() {
  userSelectDropdown.innerHTML = '';
  highRiskCustomers.forEach(cust => {
    const opt = document.createElement('option');
    opt.value = cust.id;
    opt.textContent = cust.name;
    if (cust.id === activeCustomerId) opt.selected = true;
    userSelectDropdown.appendChild(opt);
  });
}

// Render Subscriber Activity Timeline
function renderTimeline(customerId) {
  const customer = highRiskCustomers.find(c => c.id === customerId);
  const events = timelines[customerId] || [];

  if (!customer) return;

  timelineAvatar.textContent = customer.avatar;
  timelineUserName.textContent = customer.name;
  timelineUserPlan.textContent = `${customer.plan} Plan`;

  timelineListItems.innerHTML = '';
  if (events.length === 0) {
    timelineListItems.innerHTML = '<li class="timeline-item" style="color: var(--text-muted); padding: var(--space-md);">No recent logs.</li>';
    return;
  }

  events.forEach(evt => {
    const li = document.createElement('li');
    li.className = 'timeline-item';
    li.innerHTML = `
      <div class="timeline-marker ${evt.markerClass}" aria-hidden="true"></div>
      <div class="timeline-meta">
        <span class="timeline-time">${evt.date} &bull; ${evt.time}</span>
        <span class="timeline-type text-${evt.markerClass}">${evt.type}</span>
      </div>
      <div class="timeline-body">
        <h4>${evt.title}</h4>
        <p>${evt.desc}</p>
      </div>
    `;
    timelineListItems.appendChild(li);
  });
}

// ==========================================
// VIEW 2: CUSTOMER DIRECTORY (Search, Filters, Pages)
// ==========================================
function refreshDirectoryTable() {
  const query = dirSearchInput.value.toLowerCase().trim();
  const planVal = dirFilterPlan.value;
  const riskVal = dirFilterRisk.value;

  filteredDirectoryCustomers = highRiskCustomers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(query) ||
                          cust.company.toLowerCase().includes(query) ||
                          cust.plan.toLowerCase().includes(query);
    
    let matchesPlan = true;
    if (planVal !== 'all') {
      matchesPlan = cust.plan.toLowerCase().includes(planVal);
    }

    let matchesRisk = true;
    if (riskVal !== 'all') {
      const score = cust.churnScore;
      if (riskVal === 'high') {
        matchesRisk = score >= riskThresholds.high;
      } else if (riskVal === 'medium') {
        matchesRisk = score >= riskThresholds.medium && score < riskThresholds.high;
      } else if (riskVal === 'low') {
        matchesRisk = score < riskThresholds.medium;
      }
    }

    return matchesSearch && matchesPlan && matchesRisk;
  });

  const totalCount = filteredDirectoryCustomers.length;
  const maxPages = Math.ceil(totalCount / directoryPageSize) || 1;
  if (directoryCurrentPage > maxPages) directoryCurrentPage = maxPages;

  paginationPrevBtn.disabled = directoryCurrentPage === 1;
  paginationNextBtn.disabled = directoryCurrentPage === maxPages;

  const startIdx = (directoryCurrentPage - 1) * directoryPageSize;
  const endIdx = Math.min(startIdx + directoryPageSize, totalCount);
  
  paginationText.textContent = totalCount > 0 
    ? `Showing ${startIdx + 1}-${endIdx} of ${totalCount} records`
    : `Showing 0-0 of 0 records`;

  directoryTableBody.innerHTML = '';
  const pageItems = filteredDirectoryCustomers.slice(startIdx, endIdx);

  if (pageItems.length === 0) {
    directoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: var(--space-xl);">
          No matching customer directory entries.
        </td>
      </tr>
    `;
    return;
  }

  pageItems.forEach(cust => {
    let scoreClass = 'text-success';
    if (cust.churnScore >= riskThresholds.high) {
      scoreClass = 'text-danger';
    } else if (cust.churnScore >= riskThresholds.medium) {
      scoreClass = 'text-warning';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="table-cust-cell">
        <span class="user-avatar-sm" style="display: inline-flex; vertical-align: middle; margin-inline-end: var(--space-sm); background-color: var(--color-primary); font-size: 0.75rem; width: 28px; height: 28px;">
          ${cust.avatar}
        </span>
        <span style="vertical-align: middle;">${cust.name}</span>
      </td>
      <td>${cust.company}</td>
      <td>${cust.plan}</td>
      <td><span class="score-badge ${scoreClass}">${cust.churnScore}%</span></td>
      <td>${cust.activity}</td>
      <td>${cust.lastActive}</td>
      <td class="text-right">
        <button class="btn-engage" data-id="${cust.id}">Engage</button>
      </td>
    `;
    directoryTableBody.appendChild(tr);
  });

  document.querySelectorAll('.directory-table .btn-engage').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEngagementModal(btn.getAttribute('data-id'));
    });
  });
}

// ==========================================
// VIEW 3: PREDICTIONS WHAT-IF SIMULATOR
// ==========================================
function triggerSimulation() {
  const sla = parseInt(sliderSla.value);
  const discount = parseInt(sliderDiscount.value);
  const training = parseInt(sliderTraining.value);

  valSla.textContent = `${sla} hours`;
  valDiscount.textContent = `${discount}%`;
  valTraining.textContent = `${training} session${training === 1 ? '' : 's'}`;

  const results = updateSimulationChart(sla, discount, training);

  simProjectedChurn.textContent = `${results.projected}%`;
  simChurnReduction.textContent = `-${results.drop}%`;

  if (results.drop > 1.5) {
    simProjectedChurn.className = 'sim-value text-success';
  } else if (results.drop > 0) {
    simProjectedChurn.className = 'sim-value text-primary';
  } else {
    simProjectedChurn.className = 'sim-value';
  }
}

// ==========================================
// VIEW 4: AUTOMATED COHORT SEGMENTS
// ==========================================
function renderSegments() {
  const grid = document.getElementById('segments-grid-container');
  if (!grid) return;

  const segments = [
    {
      title: "Slipping Giants",
      desc: "Enterprise accounts currently scoring above the High Risk threshold. Immediate outreach required.",
      criteria: (c) => c.plan === 'Enterprise' && c.churnScore >= riskThresholds.high,
      badge: "Critical Alert",
      badgeClass: "badge-danger",
      actionText: "Prioritize CSM Outreach"
    },
    {
      title: "Healthy Champions",
      desc: "Accounts showing high activity levels and extremely low risk indicators. Excellent for referral requests.",
      criteria: (c) => c.churnScore < riskThresholds.medium && c.activity === 'High',
      badge: "Stable Hub",
      badgeClass: "badge-success",
      actionText: "Request Referrals"
    },
    {
      title: "New Joiners - Slow Onboarding",
      desc: "Accounts created recently displaying low application activity scores. Friction points detected.",
      criteria: (c) => c.activity === 'Low' && (c.id === 'liam-oconnell' || c.id === 'emma-watson' || c.id === 'arthur-curry'),
      badge: "Friction Point",
      badgeClass: "badge-danger",
      actionText: "Trigger Onboarding Flow"
    },
    {
      title: "Price Sensitive Accounts",
      desc: "Users flagged with Pricing Sensitivity. Frequently visits billing, invoicing, and terms pages.",
      criteria: (c) => c.driver === "Pricing Sensitivity",
      badge: "Warning",
      badgeClass: "badge-danger",
      actionText: "Send Incentive Bundle"
    }
  ];

  grid.innerHTML = '';

  segments.forEach(seg => {
    const members = highRiskCustomers.filter(seg.criteria);
    const count = members.length;
    const avgScore = count > 0 
      ? Math.round(members.reduce((acc, c) => acc + c.churnScore, 0) / count)
      : 0;

    let scoreClass = 'text-success';
    if (avgScore >= riskThresholds.high) {
      scoreClass = 'text-danger';
    } else if (avgScore >= riskThresholds.medium) {
      scoreClass = 'text-warning';
    }

    const card = document.createElement('div');
    card.className = 'segment-card';
    card.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:var(--space-sm);">
        <div class="segment-card-header">
          <h3>${seg.title}</h3>
          <span class="badge ${seg.badgeClass}">${seg.badge}</span>
        </div>
        <p class="segment-desc">${seg.desc}</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        <div class="segment-stats">
          <div class="segment-stat-item">
            <span class="segment-stat-label">Accounts</span>
            <span class="segment-stat-value">${count}</span>
          </div>
          <div class="segment-stat-item">
            <span class="segment-stat-label">Avg Risk</span>
            <span class="segment-stat-value ${scoreClass}">${avgScore}%</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm segment-action-btn" data-seg-title="${seg.title}" ${count === 0 ? 'disabled' : ''}>
          ${seg.actionText}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.segment-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-seg-title');
      showToast(`Campaign initiated for cohort: ${title}`, 'success');
    });
  });
}

// ==========================================
// VIEW 5: CSV REPORT EXPORTER
// ==========================================
function exportCustomerCSV() {
  let csvContent = "Customer Name,Company,Plan,Churn Score (%),Activity Level,Last Active,Primary Driver\n";

  highRiskCustomers.forEach(cust => {
    const row = [
      `"${cust.name}"`,
      `"${cust.company}"`,
      `"${cust.plan}"`,
      cust.churnScore,
      `"${cust.activity}"`,
      `"${cust.lastActive}"`,
      `"${cust.driver}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "Predicta_Churn_Risk_Executive_Export.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("CSV Export downloaded successfully.", "success");
}

// ==========================================
// VIEW 6: THRESHOLD SETTINGS SYNCRONIZER
// ==========================================
function syncThresholdSliders() {
  const highVal = parseInt(settingsHighSlider.value);
  const medVal = parseInt(settingsMedSlider.value);

  valSettingsHigh.textContent = `${highVal}%`;
  valSettingsMed.textContent = `${medVal}%`;

  riskThresholds.high = highVal;
  riskThresholds.medium = medVal;

  renderCustomerTable();
  refreshDirectoryTable();
  renderSegments();
}

// ==========================================
// NOTIFICATIONS DROPDOWN POPULATOR
// ==========================================
function renderNotifications() {
  const listItems = document.getElementById('notification-list-items');
  const countEl = document.getElementById('notification-count');
  
  if (!listItems) return;

  const unreadCount = mockNotifications.filter(n => n.unread).length;
  
  if (unreadCount > 0) {
    countEl.textContent = unreadCount;
    countEl.style.display = 'flex';
  } else {
    countEl.style.display = 'none';
  }

  listItems.innerHTML = '';
  mockNotifications.forEach(nt => {
    const li = document.createElement('li');
    li.className = 'notification-list-item';
    li.innerHTML = `
      <div class="notification-dot ${nt.markerClass}" aria-hidden="true" style="${nt.unread ? 'opacity:1;' : 'opacity:0.2;'}"></div>
      <div class="notification-content">
        <span class="notification-title">${nt.title}</span>
        <span class="notification-desc">${nt.desc}</span>
        <span class="notification-time">${nt.time}</span>
      </div>
    `;

    li.addEventListener('click', () => {
      nt.unread = false;
      renderNotifications();
      showToast(`Alert: ${nt.title}`, 'info');
      notificationDropdown.classList.add('hidden');
    });

    listItems.appendChild(li);
  });
}

// ==========================================
// CLIENT OUTREACH POPULAR DIALOG MODAL
// ==========================================
function openEngagementModal(customerId) {
  const customer = highRiskCustomers.find(c => c.id === customerId);
  if (!customer) return;

  dialogCustAvatar.textContent = customer.avatar;
  dialogCustName.textContent = customer.name;
  dialogCustScore.textContent = `Score: ${customer.churnScore}%`;
  
  let scoreClass = 'text-success';
  if (customer.churnScore >= riskThresholds.high) {
    scoreClass = 'text-danger';
  } else if (customer.churnScore >= riskThresholds.medium) {
    scoreClass = 'text-warning';
  }
  dialogCustScore.className = `badge-pill bg-danger-light ${scoreClass}`;
  
  dialogCustPlan.textContent = `${customer.plan} Plan • Last Active: ${customer.lastActive}`;
  dialogDriverTag.textContent = customer.driver;
  dialogDriverDesc.textContent = customer.driverDesc;
  
  engageForm.setAttribute('data-target-cust-id', customerId);
  document.getElementById('outreach-notes').value = '';
  engageDialog.showModal();
}

// ==========================================
// INTERACTIVE EVENT BINDINGS
// ==========================================
export function bindEvents() {


  // Clicking an account row in the Google chooser authenticates that profile
  document.querySelectorAll('.google-account-row').forEach(row => {
    row.addEventListener('click', () => {
      if (row.id === 'google-acc-custom-trigger') {
        googleAccountsList.classList.add('hidden');
        googleSignupSubform.classList.remove('hidden');
        return;
      }

      const name = row.getAttribute('data-account-name');
      const email = row.getAttribute('data-account-email');
      const avatar = row.getAttribute('data-account-avatar');
      const role = row.getAttribute('data-account-role');

      loginUser({ name, email, avatar, role });
      googleChooserDialog.close();
    });
  });

  // Signup Back Button click
  document.getElementById('google-signup-back').addEventListener('click', () => {
    googleSignupSubform.classList.add('hidden');
    googleAccountsList.classList.remove('hidden');
  });

  // Custom Signup Form Submit
  document.getElementById('google-custom-signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('google-signup-name').value.trim();
    const email = document.getElementById('google-signup-email').value.trim();
    const avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";

    loginUser({ name, email, avatar, role: "Predicta Analyst" });
    
    document.getElementById('google-custom-signup-form').reset();
    googleChooserDialog.close();
  });


  // LOGOUT TRIGGER
  document.getElementById('profile-menu-logout').addEventListener('click', (e) => {
    e.preventDefault();
    logoutUser();
    profileDropdown.classList.add('hidden');
  });

  // VIEW SWITCH ROUTER
  document.querySelectorAll('#sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // SEARCH INPUT (Dashboard Sidebar table)
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredDashboardCustomers = highRiskCustomers.filter(cust => 
      cust.name.toLowerCase().includes(query) ||
      cust.plan.toLowerCase().includes(query) ||
      cust.churnScore.toString().includes(query)
    );
    renderCustomerTable();
  });

  // COHORT FILTER SYSTEM
  document.getElementById('cohort-select').addEventListener('change', (e) => {
    const scope = e.target.value;
    applyCohortFilter(scope);
    
    let label = "All Customers";
    if (scope === 'near-cirolint') label = "Near Cirolint Cohort";
    if (scope === 'enterprise') label = "Enterprise Only";
    showToast(`Cohort scope filtered to: ${label}`, 'info');
  });

  // GRAPH TIME DROPDOWNS
  document.getElementById('trend-timeframe').addEventListener('change', (e) => {
    updateTrendsChart(e.target.value);
    const label = e.target.value === 'annual-overview' ? 'Annual Overview' : '6 Months Active Trend';
    showToast(`Chart updated to: ${label}`, 'success');
  });

  document.getElementById('drivers-segment').addEventListener('change', (e) => {
    updateDriversChart(e.target.value);
    const label = e.target.value === 'support-tickets' ? 'Support Ticket Volumes' : 'Key Churn Drivers';
    showToast(`Drivers analysis changed to: ${label}`, 'success');
  });

  // HEADER OVERLAYS
  document.getElementById('notification-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.add('hidden');
    notificationDropdown.classList.toggle('hidden');
  });

  document.getElementById('user-profile-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown.classList.add('hidden');
    profileDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    notificationDropdown.classList.add('hidden');
    profileDropdown.classList.add('hidden');
  });

  notificationDropdown.addEventListener('click', (e) => e.stopPropagation());
  profileDropdown.addEventListener('click', (e) => e.stopPropagation());

  document.getElementById('profile-menu-settings').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('settings');
    profileDropdown.classList.add('hidden');
  });
  document.getElementById('profile-menu-billing').addEventListener('click', (e) => {
    e.preventDefault();
    showToast("Profile Billing Portal requested.", "info");
    profileDropdown.classList.add('hidden');
  });

  // DIRECTORY CONTROLS (Search & filters)
  dirSearchInput.addEventListener('input', () => {
    directoryCurrentPage = 1;
    refreshDirectoryTable();
  });

  dirFilterPlan.addEventListener('change', () => {
    directoryCurrentPage = 1;
    refreshDirectoryTable();
  });

  dirFilterRisk.addEventListener('change', () => {
    directoryCurrentPage = 1;
  });

  paginationPrevBtn.addEventListener('click', () => {
    if (directoryCurrentPage > 1) {
      directoryCurrentPage--;
      refreshDirectoryTable();
    }
  });

  paginationNextBtn.addEventListener('click', () => {
    const totalCount = filteredDirectoryCustomers.length;
    const maxPages = Math.ceil(totalCount / directoryPageSize) || 1;
    if (directoryCurrentPage < maxPages) {
      directoryCurrentPage++;
      refreshDirectoryTable();
    }
  });

  sliderSla.addEventListener('input', triggerSimulation);
  sliderDiscount.addEventListener('input', triggerSimulation);
  sliderTraining.addEventListener('input', triggerSimulation);

  document.getElementById('btn-export-csv').addEventListener('click', exportCustomerCSV);

  settingsHighSlider.addEventListener('input', syncThresholdSliders);
  settingsMedSlider.addEventListener('input', syncThresholdSliders);

  document.getElementById('cancel-engage-btn').addEventListener('click', () => engageDialog.close());
  document.getElementById('close-engage-dialog').addEventListener('click', () => engageDialog.close());

  engageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const customerId = engageForm.getAttribute('data-target-cust-id');
    const customer = highRiskCustomers.find(c => c.id === customerId);

    if (!customer) return;

    const channel = document.getElementById('outreach-channel').value;
    const incentive = document.getElementById('outreach-incentive').value;
    const notes = document.getElementById('outreach-notes').value.trim();

    const channelLabel = channel === 'email' ? 'Direct Email' : channel === 'call' ? 'Escalation Call' : 'In-App Alert';
    const incentiveLabel = incentive === 'discount' ? '15% Annual Discount' : incentive === 'training' ? 'Free Training Session' : incentive === 'add-on' ? 'Complimentary Add-on' : 'Basic Outreach';

    const originalScore = customer.churnScore;
    const newScore = Math.max(10, originalScore - 15);
    customer.churnScore = newScore;

    const newTimelineItem = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today",
      type: "outreach",
      markerClass: "outreach",
      title: `CS Outreach Logged (${channelLabel})`,
      desc: `Offered ${incentiveLabel}. Notes: ${notes || 'No extra notes.'}`
    };

    if (!timelines[customerId]) timelines[customerId] = [];
    timelines[customerId].unshift(newTimelineItem);

    renderCustomerTable();
    refreshDirectoryTable();
    renderSegments();
    selectCustomer(customerId);

    const autoEmailSetting = document.getElementById('settings-auto-email').checked;
    const slackAlertSetting = document.getElementById('settings-slack-alert').checked;

    if (autoEmailSetting) {
      showToast(`[Auto-Outreach] Draft template compiled for ${customer.name}.`, 'info');
    }
    if (slackAlertSetting) {
      showToast(`[Slack Log] Dispatched warning into #customer-success channel.`, 'info');
    }

    showToast(`Outreach logged for ${customer.name}! Churn score reduced from ${originalScore}% to ${newScore}%.`, 'success');
    engageDialog.close();
  });
}

// Initializing dropdown lists on launch
export function initDropdownItems() {
  renderNotifications();
  refreshDirectoryTable();
  renderSegments();
}
