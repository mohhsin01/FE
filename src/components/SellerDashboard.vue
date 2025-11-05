<template>
  <div class="seller-dashboard">
    <div class="dashboard-header">
      <h1>Seller Performance Dashboard</h1>
      <p class="subtitle">View real-time sales insights and metrics</p>
    </div>

    <!-- Seller Selection Dropdown -->
    <div class="input-section">
      <label for="sellerSelect">Select Seller:</label>
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
      <div v-if="sellersLoading" class="loading-sellers">
        Loading sellers...
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Fetching seller data...</p>
    </div>

    <!-- Seller Summary Data -->
    <div v-if="summary && !loading" class="summary-container">
      <!-- Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card sales">
          <div class="metric-icon">📊</div>
          <div class="metric-content">
            <h3>Total Sales</h3>
            <p class="metric-value">{{ summary.totalSalesThisWeek }}</p>
            <p class="metric-label">This Week</p>
          </div>
        </div>

        <div class="metric-card revenue">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>Total Revenue</h3>
            <p class="metric-value">${{ formatCurrency(summary.totalRevenueThisWeek) }}</p>
            <p class="metric-label">This Week</p>
          </div>
        </div>

        <div class="metric-card return-rate" :class="{ 'warning': summary.returnRate > 10 }">
          <div class="metric-icon">↩️</div>
          <div class="metric-content">
            <h3>Return Rate</h3>
            <p class="metric-value">{{ (summary.returnRate || 0).toFixed(2) }}%</p>
            <p class="metric-label">This Week</p>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="summary.alerts && summary.alerts.length > 0" class="alerts-section">
        <h2 class="alerts-title">
          <span class="alert-icon">⚠️</span>
          Alerts
        </h2>
        <div class="alerts-list">
          <div
            v-for="(alert, index) in summary.alerts"
            :key="index"
            class="alert-item"
          >
            {{ alert }}
          </div>
        </div>
      </div>

      <!-- No Alerts Message -->
      <div v-else class="no-alerts">
        <p>✅ No alerts - All metrics are within normal range</p>
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
    const result = await getSellers();
    if (result.success && result.data && result.data.length > 0) {
      sellers.value = result.data;
    } else {
      // Fallback: If backend doesn't have sellers endpoint, use a range of IDs
      // This allows the frontend to work even without the sellers endpoint
      sellers.value = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Seller ${i + 1}`,
      }));
    }
  } catch (err) {
    // Fallback to hardcoded list if API fails
    sellers.value = Array.from({ length: 20 }, (_, i) => ({
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
      error.value = result.error;
      errorMessage.value = result.message;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.input-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.seller-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.seller-select:focus {
  outline: none;
  border-color: #42b883;
}

.seller-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.loading-sellers {
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.error-message {
  background: #fee;
  border: 2px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.error-message p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.summary-container {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.metric-card.sales {
  border-left: 4px solid #3498db;
}

.metric-card.revenue {
  border-left: 4px solid #2ecc71;
}

.metric-card.return-rate {
  border-left: 4px solid #e74c3c;
}

.metric-card.return-rate.warning {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border-left-color: #e74c3c;
}

.metric-icon {
  font-size: 3rem;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.metric-label {
  margin: 0.5rem 0 0 0;
  color: #95a5a6;
  font-size: 0.9rem;
}

.alerts-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alerts-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: #e74c3c;
  font-size: 1.5rem;
}

.alert-icon {
  font-size: 1.8rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  padding: 1rem;
  background: #fff5f5;
  border-left: 4px solid #e74c3c;
  border-radius: 6px;
  color: #c33;
  font-weight: 500;
}

.no-alerts {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #2ecc71;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #95a5a6;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .seller-dashboard {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .seller-select {
    font-size: 0.9rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 2rem;
  }
}
</style>

