import Chart from 'chart.js/auto';
import { kpiData, trendData, churnDrivers } from './data.js';

let mainTrendChartInstance = null;
let driversChartInstance = null;
let riskChartInstance = null;
let simulationChartInstance = null;

// Helpers to draw sparkline charts in KPI cards
function createSparkline(canvasId, dataPoints, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  
  // Custom subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 30);
  gradient.addColorStop(0, color + '33'); // 20% opacity
  gradient.addColorStop(1, color + '00'); // Transparent

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataPoints.map((_, i) => i),
      defaultData: dataPoints,
      datasets: [{
        data: [...dataPoints],
        borderColor: color,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: gradient,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

// Function to populate accessible data tables
function populateAccessibleTables() {
  // Trends table
  const trendsBody = document.querySelector('#trends-accessible-table tbody');
  if (trendsBody) {
    trendsBody.innerHTML = '';
    trendData.labels.forEach((label, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row">${label}</th>
        <td>${trendData.active[idx].toLocaleString()}</td>
        <td>${trendData.churned[idx].toLocaleString()}</td>
      `;
      trendsBody.appendChild(tr);
    });
  }

  // Churn drivers table
  const driversBody = document.querySelector('#drivers-accessible-table tbody');
  if (driversBody) {
    driversBody.innerHTML = '';
    churnDrivers.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row">${item.factor}</th>
        <td>${item.value}%</td>
      `;
      driversBody.appendChild(tr);
    });
  }
}

// Global sparkline tracking list to update dynamically on cohort switches
const activeSparklines = {};

export function initCharts() {
  populateAccessibleTables();

  // Draw KPI Sparklines
  activeSparklines['total'] = createSparkline('sparkline-total-customers', kpiData.totalCustomers.trend, '#0284c7');
  activeSparklines['retention'] = createSparkline('sparkline-retention-rate', kpiData.retentionRate.trend, '#10b981');
  activeSparklines['risk'] = createSparkline('sparkline-churn-risk', kpiData.churnRisk.trend, '#ef4444');
  activeSparklines['revenue'] = createSparkline('sparkline-revenue-risk', kpiData.revenueRisk.trend, '#ef4444');

  // Main Trend Chart
  const mainCtx = document.getElementById('trends-main-chart').getContext('2d');
  const activeGradient = mainCtx.createLinearGradient(0, 0, 0, 240);
  activeGradient.addColorStop(0, '#10b98126');
  activeGradient.addColorStop(1, '#10b98100');

  const churnedGradient = mainCtx.createLinearGradient(0, 0, 0, 240);
  churnedGradient.addColorStop(0, '#f59e0b26');
  churnedGradient.addColorStop(1, '#f59e0b00');

  mainTrendChartInstance = new Chart(mainCtx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: 'Active Users',
          data: [...trendData.active],
          borderColor: '#10b981',
          backgroundColor: activeGradient,
          fill: true,
          tension: 0.45,
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 6,
          pointRadius: 3
        },
        {
          label: 'Churned Users',
          data: [...trendData.churned],
          borderColor: '#f59e0b',
          backgroundColor: churnedGradient,
          fill: true,
          tension: 0.45,
          borderWidth: 2.5,
          pointBackgroundColor: '#f59e0b',
          pointHoverRadius: 6,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 12, weight: '500' },
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            color: '#64748b'
          }
        },
        tooltip: {
          padding: 12,
          bodyFont: { family: 'Inter' },
          titleFont: { family: 'Inter', weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' }
        },
        y: {
          grid: { color: '#e2e8f0' },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' }
        }
      }
    }
  });

  // Top Churn Drivers Chart
  const driversCtx = document.getElementById('drivers-bar-chart').getContext('2d');
  driversChartInstance = new Chart(driversCtx, {
    type: 'bar',
    data: {
      labels: churnDrivers.map(d => d.factor),
      datasets: [{
        label: 'Impact Percentage',
        data: churnDrivers.map(d => d.value),
        backgroundColor: ['#f59e0b', '#64748b', '#64748b', '#64748b', '#64748b'],
        borderRadius: 4,
        barThickness: 16
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.raw}% impact`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#e2e8f0' },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#64748b',
            callback: (val) => `${val}%`
          },
          max: 40
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11, weight: '500' }, color: '#0f172a' }
        }
      }
    }
  });

  // AI Predictions risk chart
  const riskCtx = document.getElementById('predictions-risk-chart').getContext('2d');
  riskChartInstance = new Chart(riskCtx, {
    type: 'bar',
    data: {
      labels: ['Low', 'Medium', 'High'],
      datasets: [{
        data: [15420, 7810, 1280],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 4,
        barThickness: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.raw.toLocaleString()} customers`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#64748b' }
        },
        y: { display: false }
      }
    }
  });

  // Initialize Simulation Chart
  initSimulationChart();
}

// Create the What-If simulation line graph
function initSimulationChart() {
  const simCanvas = document.getElementById('simulation-chart');
  if (!simCanvas) return;
  const ctx = simCanvas.getContext('2d');

  const baselineData = [6.2, 6.4, 6.7, 7.1, 7.3, 7.6]; // 30-day risk trend baseline
  const projectedData = [...baselineData];

  simulationChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
      datasets: [
        {
          label: 'Baseline Churn Trend',
          data: baselineData,
          borderColor: '#64748b',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Projected Churn (Simulated)',
          data: projectedData,
          borderColor: '#10b981',
          borderWidth: 3,
          backgroundColor: '#10b98115',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Inter', size: 11, weight: '500' }, color: '#64748b' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10 }, color: '#64748b' }
        },
        y: {
          grid: { color: '#e2e8f0' },
          ticks: {
            font: { family: 'Inter', size: 10 },
            color: '#64748b',
            callback: (val) => `${val}%`
          },
          suggestedMin: 2,
          suggestedMax: 10
        }
      }
    }
  });
}

// Recalculates and updates the simulated What-If projected chart
export function updateSimulationChart(supportSla, discounts, training) {
  if (!simulationChartInstance) return { projected: 6.2, drop: 0.0 };

  // Math simulation values:
  // SLA hours target (2 to 48 hours). Lower is better. Baseline is 24 hours.
  const slaFactor = (24 - supportSla) * 0.04; // e.g. 24 -> 0%, 2 -> +0.88%, 48 -> -0.96%
  
  // discount percent (0% to 30%). Higher is better.
  const discountFactor = discounts * 0.05; // e.g. 30 -> +1.5%
  
  // training sessions (0 to 5 sessions). Higher is better.
  const trainingFactor = training * 0.3; // e.g. 5 -> +1.5%

  const totalReduction = slaFactor + discountFactor + trainingFactor; // Percentage points reduced
  const currentBaseline = 6.2;
  
  // Compute simulated data points
  const baselineValues = [6.2, 6.4, 6.7, 7.1, 7.3, 7.6];
  const simulatedValues = baselineValues.map((base, idx) => {
    if (idx === 0) return base; // Start is fixed at current baseline
    // Progressively scale reduction over time
    const reductionScale = idx / 5; // scales from 0.2 to 1.0
    const calculated = base - (totalReduction * reductionScale);
    return Math.max(1.0, parseFloat(calculated.toFixed(2))); // Capped at 1% min
  });

  // Update datasets
  simulationChartInstance.data.datasets[1].data = simulatedValues;
  simulationChartInstance.update();

  const finalProjected = simulatedValues[simulatedValues.length - 1];
  const finalBaseline = baselineValues[baselineValues.length - 1];
  const absoluteDrop = parseFloat((finalBaseline - finalProjected).toFixed(1));

  return {
    projected: finalProjected,
    drop: Math.max(0, absoluteDrop)
  };
}

// Triggers cohort filter swaps across all dashboard charts
export function updateChartsForCohort(cohortKey) {
  if (!mainTrendChartInstance || !riskChartInstance) return;

  if (cohortKey === 'near-cirolint') {
    // Main Trend
    mainTrendChartInstance.data.datasets[0].data = [2800, 2600, 2900, 2400, 2500, 2200];
    mainTrendChartInstance.data.datasets[1].data = [420, 480, 510, 590, 610, 680];
    
    // Risk Bar
    riskChartInstance.data.datasets[0].data = [1820, 1510, 772];
    
    // Sparklines
    if (activeSparklines['total']) activeSparklines['total'].data.datasets[0].data = [4010, 4032, 4055, 4070, 4092, 4102];
    if (activeSparklines['retention']) activeSparklines['retention'].data.datasets[0].data = [82.5, 82.2, 81.9, 81.6, 81.4, 81.2];
    if (activeSparklines['risk']) activeSparklines['risk'].data.datasets[0].data = [12.4, 12.8, 13.2, 13.9, 14.1, 14.5];
    if (activeSparklines['revenue']) activeSparklines['revenue'].data.datasets[0].data = [150, 162, 170, 178, 180, 185];

  } else if (cohortKey === 'enterprise') {
    // Main Trend
    mainTrendChartInstance.data.datasets[0].data = [820, 835, 842, 850, 868, 882];
    mainTrendChartInstance.data.datasets[1].data = [22, 20, 18, 19, 15, 12];
    
    // Risk Bar
    riskChartInstance.data.datasets[0].data = [780, 84, 18];

    // Sparklines
    if (activeSparklines['total']) activeSparklines['total'].data.datasets[0].data = [840, 850, 858, 868, 875, 882];
    if (activeSparklines['retention']) activeSparklines['retention'].data.datasets[0].data = [94.5, 94.6, 94.6, 94.7, 94.7, 94.8];
    if (activeSparklines['risk']) activeSparklines['risk'].data.datasets[0].data = [3.6, 3.5, 3.4, 3.3, 3.2, 3.1];
    if (activeSparklines['revenue']) activeSparklines['revenue'].data.datasets[0].data = [140, 132, 128, 125, 122, 120];

  } else {
    // Default All Customers
    mainTrendChartInstance.data.datasets[0].data = [...trendData.active];
    mainTrendChartInstance.data.datasets[1].data = [...trendData.churned];
    
    // Risk Bar
    riskChartInstance.data.datasets[0].data = [15420, 7810, 1280];

    // Sparklines
    if (activeSparklines['total']) activeSparklines['total'].data.datasets[0].data = [23800, 23950, 24100, 24220, 24380, 24510];
    if (activeSparklines['retention']) activeSparklines['retention'].data.datasets[0].data = [87.5, 87.8, 88.0, 88.1, 88.3, 88.4];
    if (activeSparklines['risk']) activeSparklines['risk'].data.datasets[0].data = [6.8, 6.6, 6.5, 6.4, 6.3, 6.2];
    if (activeSparklines['revenue']) activeSparklines['revenue'].data.datasets[0].data = [390, 420, 405, 415, 395, 412];
  }

  mainTrendChartInstance.update();
  riskChartInstance.update();
  
  Object.values(activeSparklines).forEach(sp => {
    if (sp) sp.update();
  });
}

// Update charts timeframe dynamically
export function updateTrendsChart(timeframe) {
  if (!mainTrendChartInstance) return;

  if (timeframe === 'annual-overview') {
    mainTrendChartInstance.data.labels = ["2021", "2022", "2023", "2024", "2025", "2026"];
    mainTrendChartInstance.data.datasets[0].data = [80000, 110000, 145000, 182000, 220000, 24510];
    mainTrendChartInstance.data.datasets[1].data = [12000, 15000, 18500, 16000, 21000, 11400];
  } else {
    mainTrendChartInstance.data.labels = trendData.labels;
    mainTrendChartInstance.data.datasets[0].data = [...trendData.active];
    mainTrendChartInstance.data.datasets[1].data = [...trendData.churned];
  }
  
  mainTrendChartInstance.update();
}

export function updateDriversChart(segment) {
  if (!driversChartInstance) return;

  if (segment === 'support-tickets') {
    driversChartInstance.data.labels = ["Slow API", "Billing Bug", "SOC2 Blocker", "SSO Issues", "UI Crash"];
    driversChartInstance.data.datasets[0].data = [142, 118, 95, 64, 42];
    driversChartInstance.options.scales.x.max = 160;
    driversChartInstance.options.plugins.tooltip.callbacks.label = (context) => ` ${context.raw} tickets`;
  } else {
    driversChartInstance.data.labels = churnDrivers.map(d => d.factor);
    driversChartInstance.data.datasets[0].data = churnDrivers.map(d => d.value);
    driversChartInstance.options.scales.x.max = 40;
    driversChartInstance.options.plugins.tooltip.callbacks.label = (context) => ` ${context.raw}% impact`;
  }

  driversChartInstance.update();
}
