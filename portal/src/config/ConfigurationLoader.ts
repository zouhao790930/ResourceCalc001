import performanceConfig from './performance-coefficients.json';

export interface PerformanceConfig {
  version: string;
  lastUpdated: string;
  cpuCoefficients: {
    lssCpuPerRequest: { value: number; unit: string; description: string };
    storeCpuPerRequest: { value: number; unit: string; description: string };
    csoCpuPerRequest: { value: number; unit: string; description: string };
    xapCpuPerRequest: { value: number; unit: string; description: string };
    totalCpuPerRequest: { value: number; unit: string; description: string };
  };
  fanoutMetrics: {
    xapLssFanout: { typical: number; peak: number; unit: string; description: string };
    lssCsoFanout: { typical: number; peak: number; unit: string; description: string };
    csoStoreFanout: { typical: number; peak: number; unit: string; description: string };
  };
  performanceBaselines: {
    totalCpuCores: { baseline: number; peak: number; unit: string; description: string };
    cpuUtilization: { target: number; warning: number; critical: number; unit: string; description: string };
  };
  costModels: {
    azureVmCosts: Record<string, { coresPerVm: number; costPerHour: number; currency: string }>;
  };
  scalingParameters: {
    autoScaling: { scaleOutThreshold: number; scaleInThreshold: number; cooldownPeriod: number; unit: string };
    capacityPlanning: { growthRate: number; seasonalMultiplier: number; bufferPercentage: number };
  };
}

export class ConfigurationLoader {
  private static instance: ConfigurationLoader;
  private config: PerformanceConfig;
  
  private constructor() {
    this.config = performanceConfig as PerformanceConfig;
    console.log(`Loaded performance configuration v${this.config.version} (updated ${this.config.lastUpdated})`);
  }
  
  public static getInstance(): ConfigurationLoader {
    if (!ConfigurationLoader.instance) {
      ConfigurationLoader.instance = new ConfigurationLoader();
    }
    return ConfigurationLoader.instance;
  }
  
  public getConfig(): PerformanceConfig {
    return this.config;
  }
  
  // Convert dashboard coefficients to calculation logic format
  public getFanoutCoefficients() {
    // All fanout metrics are now standardized as ratios (requests/request)
    // No conversion needed - use values directly
    return {
      xap_lss: this.config.fanoutMetrics.xapLssFanout.typical, // 3.5 requests/request
      lss_cso: this.config.fanoutMetrics.lssCsoFanout.typical, // 4.5 requests/request
      cso_store: this.config.fanoutMetrics.csoStoreFanout.typical // 6.5 requests/request
    };
  }
  
  public getCpuPerRpsCoefficients() {
    return {
      xap: this.config.cpuCoefficients.xapCpuPerRequest.value,
      lss: this.config.cpuCoefficients.lssCpuPerRequest.value,
      cso: this.config.cpuCoefficients.csoCpuPerRequest.value,
      store: this.config.cpuCoefficients.storeCpuPerRequest.value
    };
  }
  
  public getCostingParameters() {
    return {
      vmCosts: this.config.costModels.azureVmCosts,
      utilizationTargets: this.config.performanceBaselines.cpuUtilization,
      scalingParams: this.config.scalingParameters
    };
  }
  
  public getPerformanceBaselines() {
    return {
      totalCores: this.config.performanceBaselines.totalCpuCores,
      utilization: this.config.performanceBaselines.cpuUtilization
    };
  }
  
  // Method to reload configuration (useful for hot-reloading in development)
  public async reloadConfig(): Promise<void> {
    try {
      // In a real app, this would fetch from an API or re-read the file
      console.log('Configuration reloaded');
    } catch (error) {
      console.error('Failed to reload configuration:', error);
    }
  }
  
  // Validate configuration integrity
  public validateConfig(): boolean {
    try {
      const cpuCoeffs = this.getCpuPerRpsCoefficients();
      const fanoutCoeffs = this.getFanoutCoefficients();
      
      // Check all coefficients are positive numbers
      Object.values(cpuCoeffs).forEach(val => {
        if (typeof val !== 'number' || val <= 0) {
          throw new Error(`Invalid CPU coefficient: ${val}`);
        }
      });
      
      Object.values(fanoutCoeffs).forEach(val => {
        if (typeof val !== 'number' || val <= 0) {
          throw new Error(`Invalid fanout coefficient: ${val}`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }
}