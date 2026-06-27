// Mock Churn Analytics Datasets (Option 2 - Minimalist Light Dashboard)

// Risk thresholds used across the app (can be mutated by settings)
export const riskThresholds = {
  high: 75,
  medium: 50
};

// Initial KPI metric values per cohort scope
export const cohortKPIs = {
  "all-customers": {
    totalCustomers: { value: "24,510", change: "+1.8%", trend: [23800, 23950, 24100, 24220, 24380, 24510] },
    retentionRate: { value: "88.4%", change: "+0.5%", trend: [87.5, 87.8, 88.0, 88.1, 88.3, 88.4] },
    churnRisk: { value: "6.2%", change: "-0.3%", trend: [6.8, 6.6, 6.5, 6.4, 6.3, 6.2] },
    revenueRisk: { value: "$412k", change: "Alert", trend: [390, 420, 405, 415, 395, 412] }
  },
  "near-cirolint": {
    totalCustomers: { value: "4,102", change: "+0.9%", trend: [4010, 4032, 4055, 4070, 4092, 4102] },
    retentionRate: { value: "81.2%", change: "-1.2%", trend: [82.5, 82.2, 81.9, 81.6, 81.4, 81.2] },
    churnRisk: { value: "14.5%", change: "+2.1%", trend: [12.4, 12.8, 13.2, 13.9, 14.1, 14.5] },
    revenueRisk: { value: "$185k", change: "Critical", trend: [150, 162, 170, 178, 180, 185] }
  },
  "enterprise": {
    totalCustomers: { value: "882", change: "+4.2%", trend: [840, 850, 858, 868, 875, 882] },
    retentionRate: { value: "94.8%", change: "+0.2%", trend: [94.5, 94.6, 94.6, 94.7, 94.7, 94.8] },
    churnRisk: { value: "3.1%", change: "-0.5%", trend: [3.6, 3.5, 3.4, 3.3, 3.2, 3.1] },
    revenueRisk: { value: "$120k", change: "Stable", trend: [140, 132, 128, 125, 122, 120] }
  }
};

// Initial state for KPIs
export const kpiData = { ...cohortKPIs["all-customers"] };

export const trendData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  active: [16000, 18500, 17200, 19800, 18200, 21500],
  churned: [3800, 2800, 3100, 2200, 2700, 1900]
};

export const churnDrivers = [
  { factor: "Pricing Sensitivity", value: 32 },
  { factor: "Onboarding Friction", value: 25 },
  { factor: "Feature Gaps", value: 18 },
  { factor: "Competitor Pricing", value: 14 },
  { factor: "UI/UX Issues", value: 11 }
];

// Expanded High-Risk Customer list for Directory and search/pagination (16 items)
export const highRiskCustomers = [
  {
    id: "alice-brown",
    name: "Alice Brown",
    avatar: "AB",
    company: "Acme Corp",
    plan: "Enterprise",
    churnScore: 88,
    activity: "Low",
    lastActive: "2h ago",
    driver: "Pricing Sensitivity",
    driverDesc: "Alice has visited the subscription pricing page twice in the last 48 hours and exported contract specifications. Churn risk profile is high due to potential cost concerns."
  },
  {
    id: "liam-oconnell",
    name: "Liam O'Connell",
    avatar: "LO",
    company: "O'Connell Tech",
    plan: "Pro Plan",
    churnScore: 85,
    activity: "Low",
    lastActive: "4h ago",
    driver: "Onboarding Friction",
    driverDesc: "Liam's setup checklist is incomplete. The workspace has zero third-party integrations configured 14 days after signup."
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    avatar: "SJ",
    company: "Apex Global",
    plan: "Enterprise",
    churnScore: 78,
    activity: "Medium",
    lastActive: "1d ago",
    driver: "Feature Gaps",
    driverDesc: "Sarah submitted a support request regarding SOC2 compliance templates, which are critical for their compliance audit and currently unavailable."
  },
  {
    id: "michael-chang",
    name: "Michael Chang",
    avatar: "MC",
    company: "Chang Design",
    plan: "Growth Plan",
    churnScore: 72,
    activity: "Medium",
    lastActive: "1d ago",
    driver: "Competitor Pricing",
    driverDesc: "Michael has engaged in talks with competitive sales reps. Account manager notes that billing term comparisons were requested."
  },
  {
    id: "david-miller",
    name: "David Miller",
    avatar: "DM",
    company: "Miller Logistics",
    plan: "Enterprise",
    churnScore: 68,
    activity: "Medium",
    lastActive: "3d ago",
    driver: "UI/UX Issues",
    driverDesc: "David experienced recurrent dashboard layout crashes (5 error events logged in console) combined with slow CSV exports."
  },
  {
    id: "emma-watson",
    name: "Emma Watson",
    avatar: "EW",
    company: "Watson Legal",
    plan: "Pro Plan",
    churnScore: 62,
    activity: "High",
    lastActive: "5h ago",
    driver: "Onboarding Friction",
    driverDesc: "Emma added 5 user seats but only 1 has completed logging in. High risk of unused seats causing down-sell or cancellation at renewal."
  },
  {
    id: "john-doe",
    name: "John Doe",
    avatar: "JD",
    company: "JD Ventures",
    plan: "Growth Plan",
    churnScore: 58,
    activity: "Medium",
    lastActive: "6h ago",
    driver: "Pricing Sensitivity",
    driverDesc: "Frequent visits to the billing statement and downgrade policy pages on their portal."
  },
  {
    id: "clara-oswald",
    name: "Clara Oswald",
    avatar: "CO",
    company: "Tardis Media",
    plan: "Pro Plan",
    churnScore: 54,
    activity: "Low",
    lastActive: "2d ago",
    driver: "UI/UX Issues",
    driverDesc: "Logged 12 page timeout events during heavy workspace configuration."
  },
  {
    id: "bruce-wayne",
    name: "Bruce Wayne",
    avatar: "BW",
    company: "Wayne Enterprises",
    plan: "Enterprise",
    churnScore: 48,
    activity: "High",
    lastActive: "1h ago",
    driver: "Feature Gaps",
    driverDesc: "Bruce requested dark mode analytics and custom dashboard exports not currently supported."
  },
  {
    id: "diana-prince",
    name: "Diana Prince",
    avatar: "DP",
    company: "Themyscira Arts",
    plan: "Growth Plan",
    churnScore: 45,
    activity: "High",
    lastActive: "20m ago",
    driver: "None",
    driverDesc: "Overall usage parameters are healthy, but account manager flagged a slight decrease in session lengths."
  },
  {
    id: "clark-kent",
    name: "Clark Kent",
    avatar: "CK",
    company: "Daily Planet",
    plan: "Pro Plan",
    churnScore: 38,
    activity: "High",
    lastActive: "30m ago",
    driver: "UI/UX Issues",
    driverDesc: "Minor complaints about fonts and spacing in reports exports module."
  },
  {
    id: "tony-stark",
    name: "Tony Stark",
    avatar: "TS",
    company: "Stark Industries",
    plan: "Enterprise",
    churnScore: 32,
    activity: "High",
    lastActive: "5m ago",
    driver: "None",
    driverDesc: "Very active account. High volume API transactions, minimal churn indicators."
  },
  {
    id: "peter-parker",
    name: "Peter Parker",
    avatar: "PP",
    company: "Parker Photos",
    plan: "Growth Plan",
    churnScore: 28,
    activity: "Medium",
    lastActive: "4d ago",
    driver: "Pricing Sensitivity",
    driverDesc: "Payment failed once last month due to an expired credit card; updated card details immediately."
  },
  {
    id: "barry-allen",
    name: "Barry Allen",
    avatar: "BA",
    company: "Central Science",
    plan: "Pro Plan",
    churnScore: 24,
    activity: "High",
    lastActive: "1h ago",
    driver: "None",
    driverDesc: "User runs bulk exports extremely fast. Highly satisfied with page load speeds."
  },
  {
    id: "arthur-curry",
    name: "Arthur Curry",
    avatar: "AC",
    company: "Atlantis Seafood",
    plan: "Growth Plan",
    churnScore: 18,
    activity: "Low",
    lastActive: "1w ago",
    driver: "Onboarding Friction",
    driverDesc: "Active user has not logged in during the past 7 days. Customer Success team needs to trigger engagement emails."
  },
  {
    id: "selina-kyle",
    name: "Selina Kyle",
    avatar: "SK",
    company: "Cat Jewelry",
    plan: "Pro Plan",
    churnScore: 12,
    activity: "High",
    lastActive: "2h ago",
    driver: "None",
    driverDesc: "Account health is excellent. High product utilization and active integrations."
  }
];

// Timeline activity log database
export const timelines = {
  "alice-brown": [
    { time: "10:15 AM", date: "Today", type: "at-risk", markerClass: "danger", title: "Pricing Page Visit", desc: "Visited the subscription billing page twice in 30 minutes." },
    { time: "4:30 PM", date: "Yesterday", type: "support", markerClass: "warning", title: "Billing Inquiry", desc: "Asked support regarding annual contract cancellation terms." },
    { time: "2:00 PM", date: "3 days ago", type: "product", markerClass: "info", title: "Slight drop in usage", desc: "API trigger count dropped 12% below their historical weekly average." },
    { time: "9:00 AM", date: "1 month ago", type: "renewal", markerClass: "success", title: "Contract Renewed", desc: "Successful renewal of standard Enterprise pricing term." }
  ],
  "liam-oconnell": [
    { time: "12:30 AM", date: "Today", type: "at-risk", markerClass: "danger", title: "Critical Drop-off", desc: "Active user count dropped by 50% week-over-week." },
    { time: "3:45 PM", date: "2 days ago", type: "support", markerClass: "warning", title: "Integration Ticket Opened", desc: "Opened ticket: 'Webhook endpoints throwing recurrent 504 errors'." },
    { time: "10:15 AM", date: "5 days ago", type: "product", markerClass: "warning", title: "Integration Errors Detected", desc: "System flagged 18 failed sync attempts on Salesforce connector." },
    { time: "9:00 AM", date: "1 week ago", type: "renewal", markerClass: "info", title: "Renewal Alert Sent", desc: "Auto-notification sent for contract review in 45 days." },
    { time: "11:00 AM", date: "2 weeks ago", type: "plan-start", markerClass: "success", title: "Plan Upgraded", desc: "Liam migrated workspace from Trial to Pro Plan." }
  ],
  "sarah-jenkins": [
    { time: "11:20 AM", date: "Today", type: "support", markerClass: "danger", title: "Security Query Submitted", desc: "Requested copy of SOC2 report and data compliance details." },
    { time: "9:00 AM", date: "2 days ago", type: "at-risk", markerClass: "warning", title: "Key User Inactivity", desc: "Primary executive sponsor hasn't logged in for 21 days." },
    { time: "4:00 PM", date: "1 week ago", type: "product", markerClass: "success", title: "Active Session Logged", desc: "14 users logged in concurrently for quarterly reporting." }
  ],
  "michael-chang": [
    { time: "1:15 PM", date: "Yesterday", type: "at-risk", markerClass: "danger", title: "Competitor Comparison", desc: "Exported tabular feature performance reports (possible migration draft)." },
    { time: "10:00 AM", date: "4 days ago", type: "support", markerClass: "info", title: "Invoices Exported", desc: "Requested full PDF invoice history for their finance team." },
    { time: "9:30 AM", date: "2 weeks ago", type: "product", markerClass: "success", title: "Custom Dashboard Configured", desc: "Created 3 custom team workspace boards." }
  ],
  "david-miller": [
    { time: "8:45 AM", date: "Yesterday", type: "product", markerClass: "danger", title: "Console Errors Logged", desc: "5 layout rendering crashes captured on dashboard viewport." },
    { time: "3:00 PM", date: "3 days ago", type: "support", markerClass: "warning", title: "Bug Ticket Logged", desc: "Reported: 'Slow loading speeds on historical exports tab'." },
    { time: "2:00 PM", date: "1 week ago", type: "product", markerClass: "success", title: "Reports Created", desc: "Successfully scheduled 2 new automated monthly PDF reports." }
  ],
  "emma-watson": [
    { time: "5:00 PM", date: "2 days ago", type: "at-risk", markerClass: "danger", title: "Low Seat Adoption", desc: "Only 1 out of 5 allocated seats is currently active." },
    { time: "11:30 AM", date: "5 days ago", type: "product", markerClass: "success", title: "Seat Invitations Sent", desc: "Emma sent workspace invitations to 4 colleagues." },
    { time: "9:00 AM", date: "2 weeks ago", type: "plan-start", markerClass: "success", title: "Workspace Activated", desc: "Welcome checklist started and workspace naming finalized." }
  ],
  "john-doe": [
    { time: "2:10 PM", date: "Today", type: "product", markerClass: "warning", title: "Billing Page Visited", desc: "Visited subscription settings and checked downgrade options." }
  ],
  "clara-oswald": [
    { time: "11:00 AM", date: "Yesterday", type: "product", markerClass: "danger", title: "Timeout errors", desc: "Faced 12 timeout errors on configuration saving API." }
  ],
  "bruce-wayne": [
    { time: "9:15 AM", date: "Today", type: "support", markerClass: "info", title: "Feature Request Submitted", desc: "Opened high-priority ticket asking for custom dashboard exports." }
  ],
  "diana-prince": [
    { time: "11:20 AM", date: "Today", type: "product", markerClass: "success", title: "Active Session Logged", desc: "Logged in via SSO and verified account settings." }
  ],
  "clark-kent": [
    { time: "10:45 AM", date: "Today", type: "product", markerClass: "success", title: "Reports Generated", desc: " Clark exported 2 weekly PDF reports." }
  ],
  "tony-stark": [
    { time: "11:35 AM", date: "Today", type: "product", markerClass: "success", title: "API Transactions Spike", desc: "Triggered 14,000 successful API payload syncs." }
  ],
  "peter-parker": [
    { time: "1:00 PM", date: "3 days ago", type: "support", markerClass: "warning", title: "Failed payment updated", desc: "Updated credit card information after expired billing ping." }
  ],
  "barry-allen": [
    { time: "10:30 AM", date: "Today", type: "product", markerClass: "success", title: "Bulk CSV Exported", desc: "Exported directory log in under 12 seconds." }
  ],
  "arthur-curry": [
    { time: "9:00 AM", date: "1 week ago", type: "product", markerClass: "warning", title: "User inactive", desc: "Zero logins or API calls logged in the last 7 days." }
  ],
  "selina-kyle": [
    { time: "9:30 AM", date: "Today", type: "product", markerClass: "success", title: "Integrations Activated", desc: "Connected Hubspot and Salesforce plugins successfully." }
  ]
};

// Initial Notification dropdown list items
export const mockNotifications = [
  {
    id: "nt-1",
    title: "Critical Risk: Alice Brown",
    desc: "Pricing sensitivity detected. Downgrade guidelines page viewed twice in 30 minutes.",
    time: "10m ago",
    markerClass: "danger",
    unread: true
  },
  {
    id: "nt-2",
    title: "Slipping Usage: Liam O'Connell",
    desc: "Active seat count dropped by 50% week-over-week.",
    time: "1h ago",
    markerClass: "danger",
    unread: true
  },
  {
    id: "nt-3",
    title: "Support escalation: Sarah Jenkins",
    desc: "Apex Global submitted security audit blocker ticket.",
    time: "3h ago",
    markerClass: "warning",
    unread: false
  }
];
