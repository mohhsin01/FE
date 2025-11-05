<template>
  <div class="seller-dashboard">
    <!-- Header Section with Gradient Background -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-logo">
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="4" height="8" rx="1" fill="#60a5fa"/>
                <rect x="10" y="5" width="4" height="11" rx="1" fill="#10b981"/>
                <rect x="17" y="3" width="4" height="13" rx="1" fill="#a78bfa"/>
              </svg>
            </div>
            <div class="logo-glow"></div>
          </div>
        </div>
        <h1>Seller Performance Dashboard</h1>
        <p class="subtitle">View real-time sales insights and metrics</p>
      </div>
    </div>

    <!-- Seller Selection Dropdown -->
    <div class="input-section">
      <div class="input-header">
        <span class="input-icon">👤</span>
        <label for="sellerSelect">Select Seller</label>
      </div>
      <div class="select-wrapper">
        <select
          id="sellerSelect"
          v-model="selectedSellerId"
          @change="fetchSellerSummary"
          :disabled="loading || sellersLoading"
          class="seller-select"
        >
          <option value="" disabled>-- Select a seller --</option>
          <option
            v-for="seller in sellers"
            :key="seller.id"
            :value="seller.id"
          >
            {{ seller.name || `Seller #${seller.id}` }} (ID: {{ seller.id }})
          </option>
        </select>
      </div>
      <div v-if="sellersLoading" class="loading-sellers">
        <span class="loading-dot"></span>
        <span>Loading sellers...</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <strong>{{ error }}</strong>
        <p v-if="errorMessage">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Fetching seller data...</p>
    </div>

    <!-- Seller Summary Data -->
    <div v-if="summary && !loading" class="summary-container">
      <!-- Metrics Cards -->
      <div class="metrics-section-title">
        <div class="section-title-content">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13L8 8L13 12L21 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 4H21V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h2>Performance Metrics</h2>
            <p class="section-subtitle">Weekly overview</p>
          </div>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-card sales">
          <div class="metric-card-header">
            <div class="metric-icon-wrapper sales-bg">
              <div class="metric-icon">📊</div>
            </div>
            <div class="metric-trend">
              <span class="trend-up">↑</span>
            </div>
          </div>
          <div class="metric-content">
            <h3>Total Sales</h3>
            <p class="metric-value">{{ summary.totalSalesThisWeek }}</p>
            <p class="metric-label">This Week</p>
            <div class="metric-footer">
              <span class="metric-badge">Active</span>
            </div>
          </div>
        </div>

        <div class="metric-card revenue">
          <div class="metric-card-header">
            <div class="metric-icon-wrapper revenue-bg">
              <div class="metric-icon">💰</div>
            </div>
            <div class="metric-trend">
              <span class="trend-up">↑</span>
            </div>
          </div>
          <div class="metric-content">
            <h3>Total Revenue</h3>
            <p class="metric-value">${{ formatCurrency(summary.totalRevenueThisWeek) }}</p>
            <p class="metric-label">This Week</p>
            <div class="metric-footer">
              <span class="metric-badge revenue-badge">Revenue</span>
            </div>
          </div>
        </div>

        <div class="metric-card return-rate" :class="{ 'warning': summary.returnRate > 10 }">
          <div class="metric-card-header">
            <div class="metric-icon-wrapper return-bg">
              <div class="metric-icon">↩️</div>
            </div>
            <div class="metric-trend">
              <span :class="summary.returnRate > 10 ? 'trend-down' : 'trend-up'">
                {{ summary.returnRate > 10 ? '↓' : '↑' }}
              </span>
            </div>
          </div>
          <div class="metric-content">
            <h3>Return Rate</h3>
            <p class="metric-value">{{ (summary.returnRate || 0).toFixed(2) }}%</p>
            <p class="metric-label">This Week</p>
            <div class="metric-footer">
              <span :class="summary.returnRate > 10 ? 'metric-badge warning-badge' : 'metric-badge success-badge'">
                {{ summary.returnRate > 10 ? 'High' : 'Normal' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="summary.alerts && summary.alerts.length > 0" class="alerts-section">
        <div class="alerts-header">
          <div class="alerts-title-wrapper">
            <div class="alert-icon-wrapper-large">⚠️</div>
            <div>
              <h2 class="alerts-title">Alerts & Notifications</h2>
              <p class="alerts-subtitle">{{ summary.alerts.length }} active alert{{ summary.alerts.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>
        <div class="alerts-list">
          <div
            v-for="(alert, index) in summary.alerts"
            :key="index"
            class="alert-item"
          >
            <div class="alert-indicator"></div>
            <div class="alert-content">
              <span class="alert-text">{{ alert }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Alerts Message -->
      <div v-else class="no-alerts">
        <div class="no-alerts-icon">✅</div>
        <h3>All Clear!</h3>
        <p>No alerts - All metrics are within normal range</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!summary && !loading && !error" class="empty-state">
      <p>Select a seller from the dropdown above to view performance metrics</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSellerSummary, getSellers } from '../services/api.js';

const selectedSellerId = ref('');
const sellers = ref([]);
const summary = ref(null);
const loading = ref(false);
const sellersLoading = ref(false);
const error = ref(null);
const errorMessage = ref(null);

// Load sellers on component mount
onMounted(async () => {
  await loadSellers();
});

const loadSellers = async () => {
  sellersLoading.value = true;
  try {
    // Show sellers 1-10 in dropdown
    sellers.value = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Seller ${i + 1}`,
    }));
  } catch (err) {
    // Fallback to hardcoded list if something goes wrong
    sellers.value = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Seller ${i + 1}`,
    }));
  } finally {
    sellersLoading.value = false;
  }
};

const fetchSellerSummary = async () => {
  if (!selectedSellerId.value) {
    error.value = 'Please select a seller';
    summary.value = null;
    return;
  }

  loading.value = true;
  error.value = null;
  errorMessage.value = null;
  summary.value = null;

  try {
    // Convert sellerId to number to ensure proper API call
    const sellerId = Number(selectedSellerId.value);
    const result = await getSellerSummary(sellerId);

    if (result.success) {
      summary.value = result.data;
      error.value = null;
      errorMessage.value = null;
    } else {
      // Check if seller doesn't exist (404 error)
      if (result.status === 404 || result.error === 'Seller not found') {
        error.value = 'Seller Not Found';
        errorMessage.value = `Looks like seller ${sellerId} isn't registered with us yet. Try selecting a different seller.`;
      } else {
        error.value = result.error;
        errorMessage.value = result.message;
      }
      summary.value = null;
    }
  } catch (err) {
    error.value = 'Unexpected error';
    errorMessage.value = err.message;
    summary.value = null;
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

<style scoped>
.seller-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  min-height: 100vh;
  position: relative;
  z-index: 10;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 1rem;
  padding: 2.5rem 0 1.5rem;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-logo {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(183, 148, 246, 0.15) 50%, rgba(255, 107, 157, 0.15) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2), 0 0 8px rgba(183, 148, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 212, 255, 0.3));
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(183, 148, 246, 0.15) 40%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
}

.dashboard-header h1 {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00d4ff 0%, #5b8def 25%, #b794f6 50%, #ff6b9d 75%, #ffc857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0;
  letter-spacing: -0.03em;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
  position: relative;
  filter: drop-shadow(0 2px 8px rgba(0, 212, 255, 0.2));
}

.dashboard-header h1::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #00d4ff, #b794f6, #ff6b9d, transparent);
  border-radius: 2px;
  box-shadow: 
    0 0 6px rgba(0, 212, 255, 0.3),
    0 0 12px rgba(183, 148, 246, 0.2);
}

.subtitle {
  color: #cbd5e1;
  font-size: 1.15rem;
  font-weight: 500;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.input-section {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-section:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.input-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.input-section label {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
}

.select-wrapper {
  position: relative;
}

.seller-select {
  width: 100%;
  padding: 0.875rem 1.125rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2364748b' d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
  color: #1e293b;
  font-weight: 500;
}

.seller-select:hover:not(:disabled) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.seller-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.seller-select:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-sellers {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.error-message {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
}

.error-content {
  flex: 1;
}

.error-message strong {
  font-weight: 700;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
  color: #dc2626;
}

.error-message p {
  margin: 0;
  font-size: 0.95rem;
  color: #991b1b;
  font-weight: 500;
  line-height: 1.5;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  border: 3px solid #f1f5f9;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.25rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
}

.summary-container {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.metrics-section-title {
  margin-bottom: 2.5rem;
  padding: 0;
}

.section-title-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00d4ff 0%, #5b8def 50%, #b794f6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.4), 0 2px 8px rgba(183, 148, 246, 0.3);
  flex-shrink: 0;
}

.section-icon svg {
  width: 28px;
  height: 28px;
  color: white;
  stroke: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.metrics-section-title h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.section-subtitle {
  color: #cbd5e1;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.metric-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metric-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-icon-wrapper.sales-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.metric-icon-wrapper.revenue-bg {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.metric-icon-wrapper.return-bg {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.metric-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.metric-trend {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  font-size: 1.25rem;
  font-weight: 700;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: width 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.metric-card.sales {
  border-left-color: #3b82f6;
}

.metric-card.sales::before {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.metric-card.revenue {
  border-left-color: #10b981;
}

.metric-card.revenue::before {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.metric-card.return-rate {
  border-left-color: #ef4444;
}

.metric-card.return-rate::before {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.metric-card.return-rate.warning {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-left-color: #ef4444;
}

.metric-icon {
  font-size: 2.5rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.metric-value {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.metric-label {
  margin: 0 0 1rem 0;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.metric-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f1f5f9;
  color: #475569;
}

.metric-badge.revenue-badge {
  background: #d1fae5;
  color: #065f46;
}

.metric-badge.success-badge {
  background: #d1fae5;
  color: #065f46;
}

.metric-badge.warning-badge {
  background: #fee2e2;
  color: #991b1b;
}

.alerts-section {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05);
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
}

.alerts-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #fee2e2;
}

.alerts-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.alert-icon-wrapper-large {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
}

.alerts-title {
  margin: 0 0 0.25rem 0;
  color: #dc2626;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.alerts-subtitle {
  margin: 0;
  color: #991b1b;
  font-size: 0.9rem;
  font-weight: 600;
}

.alert-icon {
  font-size: 1.75rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  color: #991b1b;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.alert-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

.alert-content {
  flex: 1;
}

.alert-text {
  display: block;
  line-height: 1.5;
}

.no-alerts {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  text-align: center;
  border: 1px solid #d1fae5;
  border-left: 4px solid #10b981;
}

.no-alerts-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
}

.no-alerts h3 {
  margin: 0 0 0.5rem 0;
  color: #059669;
  font-size: 1.5rem;
  font-weight: 700;
}

.no-alerts p {
  margin: 0;
  color: #047857;
  font-weight: 500;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  color: #64748b;
  font-size: 1.05rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .seller-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 1.5rem 0;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .input-section {
    padding: 1.5rem;
  }

  .seller-select {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .metric-card {
    padding: 1.5rem;
  }

  .metric-value {
    font-size: 1.875rem;
  }

  .metric-icon {
    font-size: 2rem;
  }

  .alerts-section {
    padding: 1.5rem;
  }
}
</style>

