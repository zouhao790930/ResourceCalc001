import { 
  DEFAULT_CPU_PER_RPS, 
  DEFAULT_FANOUT, 
  ScenarioInput, 
  ScenarioType, 
  calculateScenario,
  getConfiguredCoefficients,
  createScenarioInput
} from '../calc/logic';
import React, { useCallback, useState, useEffect } from 'react';

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
  
  // Load configuration on component mount
  useEffect(() => {
    try {
      const coeffs = getConfiguredCoefficients();
      setConfiguredCoefficients(coeffs);
      setInput(prev => ({ ...prev, coefficients: coeffs }));
      console.log('Portal loaded with performance coefficients from configuration');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setError('Failed to load performance configuration. Using default values.');
    }
  }, []);
  const tabs: ScenarioType[] = ['offline_ab','shadow_ab','online_ab_delta','inorganic_growth'];
  const activeIndex = tabs.indexOf(scenarioType);

  const onKeyTabs = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    let idx = activeIndex;
    if (e.key === 'ArrowRight') idx = (activeIndex + 1) % tabs.length; 
    else if (e.key === 'ArrowLeft') idx = (activeIndex - 1 + tabs.length) % tabs.length; 
    else if (e.key === 'Home') idx = 0; 
    else if (e.key === 'End') idx = tabs.length - 1;
    setScenarioType(tabs[idx]);
    // After state update, focus the new tab on next tick
    requestAnimationFrame(() => {
      const btn = document.querySelector<HTMLButtonElement>(`#tab-${tabs[idx]}`);
      btn?.focus();
    });
  }, [activeIndex, tabs]);
  const [result, setResult] = useState<any>(null);

  const compute = () => {
    try {
      setError(null);
      const r = calculateScenario({ ...input, scenarioType });
      setResult(r);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  };

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
                onClick={() => { setScenarioType(t as ScenarioType); setResult(null); }}
              >{t.replace(/_/g, ' ').toUpperCase()}</button>
            ))}
          </div>
          <div id="scenario-panel" role="tabpanel" aria-labelledby={`tab-${scenarioType}`}>
            <ScenarioForm scenarioType={scenarioType} input={input} onChange={setInput} />
          </div>
          <div className="mt-1">
            <button onClick={compute} className="primary">Compute Resources</button>
          </div>
          {error && <div className="alert-error">{error}</div>}
        </div>
        {result && (
          <div className="panel">
            <Results result={result} />
          </div>
        )}
      </div>
      <footer>v0.1.0 • All calculations approximate.</footer>
    </div>
  );
};
