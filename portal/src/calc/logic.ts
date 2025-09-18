import { ConfigurationLoader } from '../config/ConfigurationLoader';

export type ScenarioType = 'offline_ab' | 'shadow_ab' | 'online_ab_delta' | 'inorganic_growth';

export interface FanoutCoefficients {
  xap_lss: number;
  lss_cso: number;
  cso_store: number;
}

export interface CpuPerRpsCoefficients {
  xap: number;
  lss: number;
  cso: number;
  store: number;
}

export interface ScenarioParameters {
  // Offline
  queriesPerMonth?: number;
  workdaysPerMonth?: number;
  activeHoursPerDay?: number;
  directQps?: number;  // Alternative to monthly breakdown
  // Shadow / Online
  liveBaselineQps?: number;
  forkPercent?: number;
  forkCount?: number;
  treatmentShare?: number;
  deltaFactor?: number;
  // Inorganic
  deltaMau?: number;
  dauMauRatio?: number;
  qpd?: number;
  realizationFactor?: number;
  pcf?: number;
}

export interface ScenarioInput {
  scenarioType: ScenarioType;
  parameters: ScenarioParameters;
  coefficients: {
    fanout: FanoutCoefficients;
    cpuPerRps: CpuPerRpsCoefficients;
  };
}

export interface CalculationResult {
  effectiveQps: number;
  rps: { xap: number; lss: number; cso: number; store: number };
  cores: { xap: number; lss: number; cso: number; store: number; total: number };
}

function ensurePositive(name: string, v: number | undefined, allowZero = false) {
  if (v === undefined) throw new Error(`${name} missing`);
  if (allowZero) {
    if (v < 0) throw new Error(`${name} must be >= 0`);
  } else if (v <= 0) throw new Error(`${name} must be > 0`);
  return v;
}

function getValueOrDefault(value: number | undefined, defaultValue: number, allowZero = false): number {
  const finalValue = value ?? defaultValue;
  if (allowZero) {
    if (finalValue < 0) return defaultValue;
  } else if (finalValue <= 0) return defaultValue;
  return finalValue;
}

export function calculateScenario(input: ScenarioInput): CalculationResult {
  const { scenarioType, parameters: p, coefficients } = input;
  const { fanout, cpuPerRps } = coefficients;

  // Validation for coefficients
  [fanout.xap_lss, fanout.lss_cso, fanout.cso_store, cpuPerRps.xap, cpuPerRps.lss, cpuPerRps.cso, cpuPerRps.store].forEach(v => {
    if (!(v > 0)) throw new Error('Coefficient values must be > 0');
  });

  let effectiveQps: number;
  switch (scenarioType) {
    case 'offline_ab': {
      if (p.directQps !== undefined) {
        effectiveQps = ensurePositive('directQps', p.directQps);
      } else {
        const qpm = getValueOrDefault(p.queriesPerMonth, 1000);
        const wd = getValueOrDefault(p.workdaysPerMonth, 18);
        const hours = getValueOrDefault(p.activeHoursPerDay, 5);
        effectiveQps = qpm / (wd * hours * 3600);
      }
      break;
    }
    case 'shadow_ab': {
      if (p.directQps !== undefined) {
        effectiveQps = ensurePositive('directQps', p.directQps);
      } else {
        const live = getValueOrDefault(p.liveBaselineQps, 2000, true);
        const forkPct = getValueOrDefault(p.forkPercent, 20, true);
        const forkCount = getValueOrDefault(p.forkCount, 2);
        effectiveQps = live * (forkPct / 100) * forkCount;
      }
      break;
    }
    case 'online_ab_delta': {
      if (p.directQps !== undefined) {
        effectiveQps = ensurePositive('directQps', p.directQps);
      } else {
        const live = getValueOrDefault(p.liveBaselineQps, 3000, true);
        const share = getValueOrDefault(p.treatmentShare, 0.5, true);
        const delta = getValueOrDefault(p.deltaFactor, 0.1, true);
        if (share > 1 || delta > 1) {
          // Use defaults if values are invalid
          const safeShare = share > 1 ? 0.5 : share;
          const safeDelta = delta > 1 ? 0.1 : delta;
          effectiveQps = live * safeShare * safeDelta;
        } else {
          effectiveQps = live * share * delta;
        }
      }
      break;
    }
    case 'inorganic_growth': {
      if (p.directQps !== undefined) {
        effectiveQps = ensurePositive('directQps', p.directQps);
      } else {
        const deltaMau = getValueOrDefault(p.deltaMau, 10000, true);
        const ratio = getValueOrDefault(p.dauMauRatio, 0.35, true);
        const qpd = getValueOrDefault(p.qpd, 2.4, true);
        const realization = getValueOrDefault(p.realizationFactor, 0.85, true);
        const pcf = getValueOrDefault(p.pcf, 6.0);
        
        // Use safe values if fractions are invalid
        const safeRatio = ratio > 1 ? 0.35 : ratio;
        const safeRealization = realization > 1 ? 0.85 : realization;
        
        const deltaDau = deltaMau * safeRatio;
        effectiveQps = ((deltaDau * qpd * safeRealization) / 86400) * pcf;
      }
      break;
    }
    default:
      throw new Error('Unknown scenarioType');
  }

  const rps_xap = effectiveQps;
  const rps_lss = rps_xap * fanout.xap_lss;
  const rps_cso = rps_lss * fanout.lss_cso;
  const rps_store = rps_cso * fanout.cso_store;

  const cores_xap = rps_xap * cpuPerRps.xap;
  const cores_lss = rps_lss * cpuPerRps.lss;
  const cores_cso = rps_cso * cpuPerRps.cso;
  const cores_store = rps_store * cpuPerRps.store;
  const total = cores_xap + cores_lss + cores_cso + cores_store;

  return {
    effectiveQps,
    rps: { xap: rps_xap, lss: rps_lss, cso: rps_cso, store: rps_store },
    cores: { xap: cores_xap, lss: cores_lss, cso: cores_cso, store: cores_store, total }
  };
}

export const DEFAULT_FANOUT: FanoutCoefficients = {
  xap_lss: 1.0,
  lss_cso: 1.0,
  cso_store: 1.0
};

export const DEFAULT_CPU_PER_RPS: CpuPerRpsCoefficients = {
  xap: 0.01,
  lss: 0.02,
  cso: 0.015,
  store: 0.005
};

// Load coefficients from configuration
export function getConfiguredCoefficients(): { fanout: FanoutCoefficients; cpuPerRps: CpuPerRpsCoefficients } {
  try {
    const configLoader = ConfigurationLoader.getInstance();
    
    // Validate configuration
    if (!configLoader.validateConfig()) {
      console.warn('Configuration validation failed, using default coefficients');
      return { fanout: DEFAULT_FANOUT, cpuPerRps: DEFAULT_CPU_PER_RPS };
    }
    
    const fanout = configLoader.getFanoutCoefficients();
    const cpuPerRps = configLoader.getCpuPerRpsCoefficients();
    
    console.log('Using configured coefficients v' + configLoader.getConfig().version);
    console.log('CPU per RPS:', cpuPerRps);
    console.log('Fanout ratios:', fanout);
    
    return { fanout, cpuPerRps };
  } catch (error) {
    console.error('Failed to load configuration, using defaults:', error);
    return { fanout: DEFAULT_FANOUT, cpuPerRps: DEFAULT_CPU_PER_RPS };
  }
}

// Helper function to create scenario input with configured coefficients
export function createScenarioInput(
  scenarioType: ScenarioType, 
  parameters: ScenarioParameters,
  overrideCoefficients?: { fanout?: Partial<FanoutCoefficients>; cpuPerRps?: Partial<CpuPerRpsCoefficients> }
): ScenarioInput {
  const configured = getConfiguredCoefficients();
  
  return {
    scenarioType,
    parameters,
    coefficients: {
      fanout: { ...configured.fanout, ...overrideCoefficients?.fanout },
      cpuPerRps: { ...configured.cpuPerRps, ...overrideCoefficients?.cpuPerRps }
    }
  };
}
