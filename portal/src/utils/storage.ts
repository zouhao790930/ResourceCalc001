import { ScenarioInput, ScenarioType, CalculationResult } from '../calc/logic';

// Storage schema version for future compatibility
const STORAGE_VERSION = '1.0.0';
const STORAGE_KEY = 'resourcecalc-state';

export interface StoredState {
  version: string;
  timestamp: number;
  activeScenario: ScenarioType;
  scenarios: Record<ScenarioType, ScenarioInput>;
  lastResult?: CalculationResult;
  lastCalculatedScenario?: ScenarioType;
}

export interface StorageUtilities {
  saveState: (state: Partial<StoredState>) => void;
  loadState: () => StoredState | null;
  clearState: () => void;
  isStorageAvailable: () => boolean;
  getStorageInfo: () => { hasData: boolean; timestamp?: number; version?: string };
}

class LocalStorageManager implements StorageUtilities {
  private key = STORAGE_KEY;

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  saveState(state: Partial<StoredState>): void {
    if (!this.isStorageAvailable()) {
      console.warn('Local storage not available, state will not be persisted');
      return;
    }

    try {
      const existing = this.loadState();
      const newState: StoredState = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        activeScenario: state.activeScenario || existing?.activeScenario || 'shadow_ab',
        scenarios: state.scenarios || existing?.scenarios || {} as Record<ScenarioType, ScenarioInput>,
        lastResult: state.lastResult || existing?.lastResult,
        lastCalculatedScenario: state.lastCalculatedScenario || existing?.lastCalculatedScenario,
      };

      localStorage.setItem(this.key, JSON.stringify(newState));
      console.log('State saved to local storage', { timestamp: newState.timestamp });
    } catch (error) {
      console.error('Failed to save state to local storage:', error);
    }
  }

  loadState(): StoredState | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as StoredState;
      
      // Version compatibility check
      if (parsed.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch: ${parsed.version} vs ${STORAGE_VERSION}, clearing old data`);
        this.clearState();
        return null;
      }

      console.log('State loaded from local storage', { 
        timestamp: parsed.timestamp, 
        activeScenario: parsed.activeScenario,
        hasResult: !!parsed.lastResult 
      });
      
      return parsed;
    } catch (error) {
      console.error('Failed to load state from local storage:', error);
      this.clearState(); // Clear corrupted data
      return null;
    }
  }

  clearState(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.key);
      console.log('Cleared state from local storage');
    } catch (error) {
      console.error('Failed to clear state from local storage:', error);
    }
  }

  getStorageInfo(): { hasData: boolean; timestamp?: number; version?: string } {
    const state = this.loadState();
    return {
      hasData: !!state,
      timestamp: state?.timestamp,
      version: state?.version,
    };
  }
}

// Export singleton instance
export const storage: StorageUtilities = new LocalStorageManager();

// Helper functions for common operations
export const saveScenarioState = (scenarioType: ScenarioType, input: ScenarioInput): void => {
  const existing = storage.loadState();
  const scenarios = existing?.scenarios || {} as Record<ScenarioType, ScenarioInput>;
  scenarios[scenarioType] = input;
  
  storage.saveState({
    activeScenario: scenarioType,
    scenarios,
  });
};

export const saveCalculationResult = (scenarioType: ScenarioType, result: CalculationResult): void => {
  storage.saveState({
    lastResult: result,
    lastCalculatedScenario: scenarioType,
  });
};

export const getScenarioState = (scenarioType: ScenarioType): ScenarioInput | null => {
  const state = storage.loadState();
  return state?.scenarios[scenarioType] || null;
};

export const getLastCalculation = (): { result: CalculationResult; scenario: ScenarioType } | null => {
  const state = storage.loadState();
  if (state?.lastResult && state?.lastCalculatedScenario) {
    return {
      result: state.lastResult,
      scenario: state.lastCalculatedScenario,
    };
  }
  return null;
};

export const formatStorageTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};