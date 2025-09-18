import React, { useState } from 'react';
import { ConfigurationLoader } from '../config/ConfigurationLoader';

export const ConfigurationDisplay: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);
  const configLoader = ConfigurationLoader.getInstance();
  const config = configLoader.getConfig();

  if (!showConfig) {
    return (
      <div className="config-summary">
        <button 
          onClick={() => setShowConfig(true)}
          className="config-toggle-btn"
          title="Show loaded configuration details"
        >
          📊 Config: {config.source} (v{config.version})
        </button>
      </div>
    );
  }

  return (
    <div className="config-display">
      <div className="config-header">
        <h3>Performance Configuration</h3>
        <button 
          onClick={() => setShowConfig(false)}
          className="config-close-btn"
        >
          ✕
        </button>
      </div>
      
      <div className="config-content">
        <div className="config-meta">
          <p><strong>Source:</strong> {config.source}</p>
          <p><strong>Version:</strong> {config.version}</p>
          <p><strong>Last Updated:</strong> {config.lastUpdated}</p>
        </div>

        <div className="config-section">
          <h4>CPU Coefficients (cores/request)</h4>
          <div className="config-grid">
            <div><strong>XAP:</strong> {config.cpuCoefficients.xapCpuPerRequest.value.toFixed(5)}</div>
            <div><strong>LSS:</strong> {config.cpuCoefficients.lssCpuPerRequest.value.toFixed(5)}</div>
            <div><strong>CSO:</strong> {config.cpuCoefficients.csoCpuPerRequest.value.toFixed(5)}</div>
            <div><strong>Store:</strong> {config.cpuCoefficients.storeCpuPerRequest.value.toFixed(5)}</div>
            <div><strong>Total:</strong> {config.cpuCoefficients.totalCpuPerRequest.value.toFixed(5)}</div>
          </div>
        </div>

        <div className="config-section">
          <h4>Fanout Metrics</h4>
          <div className="config-grid">
            <div><strong>XAP→LSS:</strong> {config.fanoutMetrics.xapLssFanout.typical.toLocaleString()} {config.fanoutMetrics.xapLssFanout.unit} (peak: {config.fanoutMetrics.xapLssFanout.peak.toLocaleString()})</div>
            <div><strong>LSS→CSO:</strong> {config.fanoutMetrics.lssCsoFanout.typical} {config.fanoutMetrics.lssCsoFanout.unit} (peak: {config.fanoutMetrics.lssCsoFanout.peak})</div>
            <div><strong>CSO→Store:</strong> {config.fanoutMetrics.csoStoreFanout.typical} {config.fanoutMetrics.csoStoreFanout.unit} (peak: {config.fanoutMetrics.csoStoreFanout.peak})</div>
          </div>
        </div>

        <div className="config-section">
          <h4>Performance Baselines</h4>
          <div className="config-grid">
            <div><strong>CPU Cores:</strong> {config.performanceBaselines.totalCpuCores.baseline} baseline, {config.performanceBaselines.totalCpuCores.peak} peak</div>
            <div><strong>CPU Utilization:</strong> Target {(config.performanceBaselines.cpuUtilization.target * 100).toFixed(0)}%, Warning {(config.performanceBaselines.cpuUtilization.warning * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="config-section">
          <h4>Azure VM Costs (USD/hour)</h4>
          <div className="config-grid">
            {Object.entries(config.costModels.azureVmCosts).map(([vmType, details]) => (
              <div key={vmType}>
                <strong>{vmType}:</strong> ${details.costPerHour.toFixed(3)} ({details.coresPerVm} cores)
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};