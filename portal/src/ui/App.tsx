import { 
  DEFAULT_CPU_PER_RPS, 
  DEFAULT_FANOUT, 
  ScenarioInput, 
  ScenarioType, 
  ScenarioParameters,
  calculateScenario,
  getConfiguredCoefficients,
  createScenarioInput,
  CalculationResult
} from '../calc/logic';
import React, { useCallback, useState, useEffect } from 'react';
import { 
  storage, 
  saveScenarioState, 
  saveCalculationResult, 
  getScenarioState, 
  getLastCalculation,
  formatStorageTimestamp 
} from '../utils/storage';
import { 
  exportCalculationData, 
  importCalculationData, 
  getExportSummary, 
  mergeImportedData, 
  ExportData 
} from '../utils/exportImport';

import { Results } from './Results';
import { ScenarioForm } from './ScenarioForm';

export const App: React.FC = () => {
  const [scenarioType, setScenarioType] = useState<ScenarioType>('shadow_ab');
  const [configuredCoefficients, setConfiguredCoefficients] = useState(() => getConfiguredCoefficients());
  const [input, setInput] = useState<ScenarioInput>(() => {
    const coeffs = getConfiguredCoefficients();
    return {
      scenarioType: 'shadow_ab',
      parameters: {
        liveBaselineQps: 2000,
        forkPercent: 20,
        forkCount: 2
      },
      coefficients: coeffs
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ hasData: boolean; timestamp?: number }>({ hasData: false });
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);
  
  // Load configuration and saved state on component mount
  useEffect(() => {
    try {
      const coeffs = getConfiguredCoefficients();
      setConfiguredCoefficients(coeffs);
      
      // Check for saved state
      const savedState = storage.loadState();
      if (savedState) {
        console.log('Restoring saved state from local storage');
        
        // Restore active scenario
        setScenarioType(savedState.activeScenario);
        
        // Restore scenario input for the active scenario
        const scenarioInput = savedState.scenarios[savedState.activeScenario];
        if (scenarioInput) {
          // Update coefficients to current ones while preserving parameters
          setInput({
            ...scenarioInput,
            coefficients: coeffs
          });
        }
        
        // Restore last calculation result if it matches current scenario
        if (savedState.lastResult && savedState.lastCalculatedScenario === savedState.activeScenario) {
          setResult(savedState.lastResult);
        }
        
        setStorageInfo({ hasData: true, timestamp: savedState.timestamp });
      } else {
        // No saved state, use defaults with current coefficients
        setInput(prev => ({ ...prev, coefficients: coeffs }));
        setStorageInfo({ hasData: false });
      }
      
      console.log('Portal loaded with performance coefficients from configuration');
    } catch (error) {
      console.error('Failed to load configuration or saved state:', error);
      setError('Failed to load configuration. Using default values.');
    }
  }, []);
  const tabs: ScenarioType[] = ['offline_ab','shadow_ab','online_ab_delta','inorganic_growth'];
  const activeIndex = tabs.indexOf(scenarioType);

  const getDefaultParameters = (scenarioType: ScenarioType): ScenarioParameters => {
    switch (scenarioType) {
      case 'offline_ab':
        return {
          queriesPerMonth: 1000,
          workdaysPerMonth: 18,
          activeHoursPerDay: 5
        };
      case 'shadow_ab':
        return {
          liveBaselineQps: 2000,
          forkPercent: 20,
          forkCount: 2
        };
      case 'online_ab_delta':
        return {
          liveBaselineQps: 3000,
          treatmentShare: 0.5,
          deltaFactor: 0.1
        };
      case 'inorganic_growth':
        return {
          deltaMau: 10000,
          dauMauRatio: 0.35,
          qpd: 2.4,
          realizationFactor: 0.85,
          pcf: 6.0
        };
      default:
        return {};
    }
  };

  const handleScenarioChange = useCallback((newScenarioType: ScenarioType) => {
    // Save current scenario state before switching
    saveScenarioState(scenarioType, input);
    
    setScenarioType(newScenarioType);
    setResult(null); // Clear result when switching scenarios
    
    // Load saved state for new scenario if available
    const savedInput = getScenarioState(newScenarioType);
    if (savedInput) {
      // Use saved input but update coefficients to current ones
      setInput({
        ...savedInput,
        scenarioType: newScenarioType,
        coefficients: configuredCoefficients
      });
    } else {
      // Create fresh input for this scenario
      const defaultParams = getDefaultParameters(newScenarioType);
      const freshInput = createScenarioInput(newScenarioType, defaultParams);
      setInput(freshInput);
    }
    
    // Check if we have a saved calculation for this scenario
    const lastCalc = getLastCalculation();
    if (lastCalc && lastCalc.scenario === newScenarioType) {
      setResult(lastCalc.result);
    }
  }, [scenarioType, input, configuredCoefficients]);

  const handleInputChange = useCallback((newInput: ScenarioInput) => {
    setInput(newInput);
    // Auto-save the current scenario state
    saveScenarioState(scenarioType, newInput);
    // Clear result when input changes
    setResult(null);
  }, [scenarioType]);

  const onKeyTabs = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    let idx = activeIndex;
    if (e.key === 'ArrowRight') idx = (activeIndex + 1) % tabs.length; 
    else if (e.key === 'ArrowLeft') idx = (activeIndex - 1 + tabs.length) % tabs.length; 
    else if (e.key === 'Home') idx = 0; 
    else if (e.key === 'End') idx = tabs.length - 1;
    
    const newScenarioType = tabs[idx];
    handleScenarioChange(newScenarioType);
    
    // After state update, focus the new tab on next tick
    requestAnimationFrame(() => {
      const btn = document.querySelector<HTMLButtonElement>(`#tab-${newScenarioType}`);
      btn?.focus();
    });
  }, [activeIndex, tabs, handleScenarioChange]);

  const compute = () => {
    try {
      setError(null);
      const r = calculateScenario({ ...input, scenarioType });
      setResult(r);
      
      // Save calculation result to local storage
      saveCalculationResult(scenarioType, r);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  };

  // Export/Import handlers
  const handleExport = useCallback(() => {
    try {
      // Collect all scenario data from storage
      const allScenarios = {} as { [key in ScenarioType]?: { input: ScenarioInput; result?: CalculationResult; lastCalculated?: string } };
      const state = storage.loadState();
      
      tabs.forEach(tab => {
        const savedInput = getScenarioState(tab);
        const lastCalc = getLastCalculation();
        
        if (savedInput || (lastCalc && lastCalc.scenario === tab) || tab === scenarioType) {
          allScenarios[tab] = {
            // Use current input if this is the active scenario, otherwise use saved input
            input: tab === scenarioType ? input : (savedInput || createScenarioInput(tab, getDefaultParameters(tab))),
            result: lastCalc && lastCalc.scenario === tab ? lastCalc.result : (tab === scenarioType && result ? result : undefined),
            lastCalculated: lastCalc && lastCalc.scenario === tab && state?.timestamp 
              ? new Date(state.timestamp).toISOString() 
              : (tab === scenarioType && result ? new Date().toISOString() : undefined)
          };
        }
      });

      exportCalculationData(allScenarios, scenarioType);
    } catch (error) {
      setError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [scenarioType, input, result, tabs]);

  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    importCalculationData(file)
      .then(importData => {
        setImportPreview(importData);
      })
      .catch(error => {
        setError(error.message);
        setIsImporting(false);
      });

    // Clear the input so the same file can be selected again
    event.target.value = '';
  }, []);

  const handleConfirmImport = useCallback((replaceAll: boolean = true) => {
    if (!importPreview) return;

    try {
      // Get current scenarios from storage
      const currentScenarios = {} as { [key in ScenarioType]?: { input: ScenarioInput; result?: CalculationResult; lastCalculated?: string } };
      const state = storage.loadState();
      
      tabs.forEach(tab => {
        const savedInput = getScenarioState(tab);
        const lastCalc = getLastCalculation();
        
        if (savedInput || (lastCalc && lastCalc.scenario === tab)) {
          currentScenarios[tab] = {
            input: savedInput || (tab === scenarioType ? input : createScenarioInput(tab, getDefaultParameters(tab))),
            result: lastCalc && lastCalc.scenario === tab ? lastCalc.result : undefined,
            lastCalculated: lastCalc && lastCalc.scenario === tab && state?.timestamp 
              ? new Date(state.timestamp).toISOString() 
              : undefined
          };
        }
      });

      // Merge imported data
      const { scenarios: mergedScenarios, activeScenario } = mergeImportedData(
        importPreview,
        currentScenarios,
        replaceAll ? 'replace' : 'merge'
      );

      // Save all imported scenarios to storage
      Object.entries(mergedScenarios).forEach(([type, data]) => {
        if (data) {
          saveScenarioState(type as ScenarioType, data.input);
          if (data.result) {
            saveCalculationResult(type as ScenarioType, data.result);
          }
        }
      });

      // Switch to the imported active scenario and load its input parameters
      const importedActiveScenarioData = mergedScenarios[activeScenario];
      if (importedActiveScenarioData) {
        setScenarioType(activeScenario);
        // Set the input to the imported input parameters with current coefficients
        setInput({
          ...importedActiveScenarioData.input,
          scenarioType: activeScenario,
          coefficients: configuredCoefficients
        });
        // Set the result if available
        if (importedActiveScenarioData.result) {
          setResult(importedActiveScenarioData.result);
        } else {
          setResult(null);
        }
      } else {
        // Fallback to handleScenarioChange if no data for active scenario
        handleScenarioChange(activeScenario);
      }

      // Clear import state
      setImportPreview(null);
      setIsImporting(false);
      
      // Show success message
      setError(null);
    } catch (error) {
      setError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [importPreview, tabs, scenarioType, input, configuredCoefficients, handleScenarioChange]);

  const handleCancelImport = useCallback(() => {
    setImportPreview(null);
    setIsImporting(false);
  }, []);

  return (
    <div className="app-root">
      <div className="header-row">
        <h1>Copilot CPU Estimation Portal</h1>
      </div>
      <div className="layout">
        <div className="panel">
          <h2>Scenario Configuration</h2>
          <div
            role="tablist"
            aria-label="Scenario Types"
            className="tablist"
            onKeyDown={onKeyTabs}
          >
            {tabs.map((t, i) => (
              <button
                key={t}
                id={`tab-${t}`}
                role="tab"
                className="tab-btn"
                aria-selected={scenarioType===t ? 'true' : 'false'}
                aria-controls="scenario-panel"
                tabIndex={i === activeIndex ? 0 : -1}
                onClick={() => handleScenarioChange(t as ScenarioType)}
              >{t.replace(/_/g, ' ').toUpperCase()}</button>
            ))}
          </div>
          <div id="scenario-panel" role="tabpanel" aria-labelledby={`tab-${scenarioType}`}>
            <ScenarioForm scenarioType={scenarioType} input={input} onChange={handleInputChange} />
          </div>
          <div className="mt-1">
            <button onClick={compute} className="primary">Compute Resources</button>
            <div className="export-import-controls" style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleExport} className="secondary" style={{ fontSize: '14px' }}>
                📤 Export Data
              </button>
              <label className="secondary" style={{ fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                📥 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {storageInfo.hasData && storageInfo.timestamp && (
              <div className="storage-info">
                💾 Last saved: {formatStorageTimestamp(storageInfo.timestamp)}
              </div>
            )}
          </div>
          {error && <div className="alert-error">{error}</div>}
        </div>
        {result && (
          <div className="panel">
            <Results result={result} />
          </div>
        )}
      </div>
      
      {/* Import Preview Modal */}
      {importPreview && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ marginTop: 0 }}>Import Calculation Data</h3>
            <p>The following data will be imported:</p>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {getExportSummary(importPreview)}
            </pre>
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <p><strong>Import options:</strong></p>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input type="radio" name="importMode" value="replace" defaultChecked />
                <span style={{ marginLeft: '8px' }}>Replace all current data</span>
              </label>
              <label style={{ display: 'block' }}>
                <input type="radio" name="importMode" value="merge" />
                <span style={{ marginLeft: '8px' }}>Merge with current data (keep existing scenarios)</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelImport} className="secondary">
                Cancel
              </button>
              <button 
                onClick={() => {
                  const replaceMode = (document.querySelector('input[name="importMode"]:checked') as HTMLInputElement)?.value === 'replace';
                  handleConfirmImport(replaceMode);
                }}
                className="primary"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay for import */}
      {isImporting && !importPreview && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>Processing import file...</p>
          </div>
        </div>
      )}
      
      <footer>v0.1.0 • All calculations approximate.</footer>
    </div>
  );
};
