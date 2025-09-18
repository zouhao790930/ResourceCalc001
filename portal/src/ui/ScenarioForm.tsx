import React, { useState } from 'react';
import { ScenarioInput, ScenarioType } from '../calc/logic';

interface Props {
  scenarioType: ScenarioType;
  input: ScenarioInput;
  onChange: (v: ScenarioInput) => void;
}

const HELP_TEXT: Record<string, string> = {
  queriesPerMonth: 'Total queries executed for offline evaluation in one month (QPM).',
  workdaysPerMonth: 'Number of workdays used to distribute monthly offline queries.',
  activeHoursPerDay: 'Active hours per workday generating offline queries.',
  directQps: 'Direct queries per second input (alternative to monthly breakdown).',
  liveBaselineQps: 'Current live baseline queries per second before experimental load.',
  forkPercent: 'Percentage of live traffic duplicated for the shadow run.',
  forkCount: 'Number of parallel fork copies of the sampled traffic.',
  treatmentShare: 'Fraction (0–1) of users allocated to treatment population.',
  deltaFactor: 'Expected incremental per-user QPS uplift (0–1).',
  deltaMau: 'Incremental Monthly Active Users (growth driver).',
  dauMauRatio: 'Daily Active Users to Monthly Active Users ratio (0–1).',
  qpd: 'Average user queries per DAU per day (QPD).',
  realizationFactor: 'Realization factor ρ adjusting theoretical to observed usage (0–1).',
  pcf: 'Peak Concurrency Factor scaling average load to peak demand.',
  xap_lss: 'Average downstream requests from XAP to LSS per incoming request.',
  lss_cso: 'Average downstream requests from LSS to CSO per upstream request.',
  cso_store: 'Average downstream requests from CSO to Store per upstream request.',
  xap: 'CPU cores consumed per request at XAP.',
  lss: 'CPU cores consumed per request at LSS.',
  cso: 'CPU cores consumed per request at CSO.',
  store: 'CPU cores consumed per request at Store.'
};

export const ScenarioForm: React.FC<Props> = ({ scenarioType, input, onChange }) => {
  const p = input.parameters;
  const [openHelp, setOpenHelp] = useState<Record<string, boolean>>({});
  const [useDirectQps, setUseDirectQps] = useState(false);

  const toggleHelp = (name: string) => {
    setOpenHelp(o => ({ ...o, [name]: !o[name] }));
  };

  const handleQpsToggle = (checked: boolean) => {
    setUseDirectQps(checked);
    if (!checked) {
      // Clear directQps when toggling off to ensure fallback to detailed parameters
      const { directQps, ...otherParams } = input.parameters;
      onChange({ ...input, parameters: otherParams });
    } else {
      // Set default directQps when toggling on based on scenario type
      const defaultQps = getDefaultQpsForScenario(scenarioType);
      onChange({ ...input, parameters: { ...input.parameters, directQps: defaultQps } });
    }
  };

  const getDefaultQpsForScenario = (scenario: string): number => {
    switch (scenario) {
      case 'offline_ab': return 100;
      case 'shadow_ab': return 400;
      case 'online_ab_delta': return 150;
      case 'inorganic_growth': return 50;
      default: return 100;
    }
  };

  const setParam = (key: string, value: any) => {
    onChange({ ...input, parameters: { ...input.parameters, [key]: value } });
  };

  const setFanout = (key: 'xap_lss'|'lss_cso'|'cso_store', value: number) => {
    onChange({ ...input, coefficients: { ...input.coefficients, fanout: { ...input.coefficients.fanout, [key]: value } } });
  };
  const setCpu = (key: 'xap'|'lss'|'cso'|'store', value: number) => {
    onChange({ ...input, coefficients: { ...input.coefficients, cpuPerRps: { ...input.coefficients.cpuPerRps, [key]: value } } });
  };

  const numberField = (label: string, name: string, value: any, step = 'any', handler: (n: string, v: any) => void = setParam) => {
    const help = HELP_TEXT[name];
    const open = !!openHelp[name];
    return (
      <label className="field-label">
        <span className="label-row">
          <span>{label}</span>
          {help && (
            <span className="help-wrapper">
              <button
                type="button"
                className="help-btn"
                aria-label={`Help: ${label}`}
                aria-expanded={open ? 'true' : 'false'}
                aria-controls={`tip-${name}`}
                onClick={() => toggleHelp(name)}
              >?</button>
              {open && (
                <div id={`tip-${name}`} role="tooltip" className="tooltip">
                  {help}
                </div>
              )}
            </span>
          )}
        </span>
        <input
          type="number"
          step={step}
          value={value ?? ''}
          onChange={e => handler(name, e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </label>
    );
  };

  const renderQpsCalculationExplanation = () => {
    switch (scenarioType) {
      case 'offline_ab':
        return (
          <div className="explanation">
            <strong>Parameters → QPS Calculation:</strong><br/>
            QPS = Queries/Month ÷ (Workdays/Month × Hours/Day × 3600 seconds/hour)<br/>
            <em>Example: 1000 queries ÷ (18 days × 5 hours × 3600s) = 0.0031 QPS</em>
          </div>
        );
      case 'shadow_ab':
        return (
          <div className="explanation">
            <strong>Parameters → QPS Calculation:</strong><br/>
            QPS = Live Baseline QPS × (Fork % ÷ 100) × Fork Count<br/>
            <em>Example: 2000 QPS × (20% ÷ 100) × 2 forks = 800 QPS</em>
          </div>
        );
      case 'online_ab_delta':
        return (
          <div className="explanation">
            <strong>Parameters → QPS Calculation:</strong><br/>
            QPS = Live Baseline QPS × Treatment Share × Delta Factor<br/>
            <em>Example: 3000 QPS × 0.5 share × 0.1 delta = 150 QPS</em>
          </div>
        );
      case 'inorganic_growth':
        return (
          <div className="explanation">
            <strong>Parameters → QPS Calculation:</strong><br/>
            ΔDAU = ΔMAU × DAU/MAU Ratio<br/>
            Daily QPS = (ΔDAU × QPD × Realization Factor) ÷ 86400 seconds/day<br/>
            Peak QPS = Daily QPS × Peak Concurrency Factor (PCF)<br/>
            <em>Example: (10000 × 0.35 × 2.4 × 0.85) ÷ 86400 × 6 = 2.08 QPS</em>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCpuCalculationExplanation = () => (
    <div className="explanation">
      <strong>QPS → CPU Cores Calculation:</strong><br/>
      1. <strong>Request Distribution:</strong><br/>
      &nbsp;&nbsp;XAP RPS = Effective QPS<br/>
      &nbsp;&nbsp;LSS RPS = XAP RPS × {input.coefficients.fanout.xap_lss} (XAP→LSS fanout)<br/>
      &nbsp;&nbsp;CSO RPS = LSS RPS × {input.coefficients.fanout.lss_cso} (LSS→CSO fanout)<br/>
      &nbsp;&nbsp;Store RPS = CSO RPS × {input.coefficients.fanout.cso_store} (CSO→Store fanout)<br/>
      <br/>
      2. <strong>CPU Core Requirements:</strong><br/>
      &nbsp;&nbsp;XAP Cores = XAP RPS × {input.coefficients.cpuPerRps.xap} cores/req<br/>
      &nbsp;&nbsp;LSS Cores = LSS RPS × {input.coefficients.cpuPerRps.lss} cores/req<br/>
      &nbsp;&nbsp;CSO Cores = CSO RPS × {input.coefficients.cpuPerRps.cso} cores/req<br/>
      &nbsp;&nbsp;Store Cores = Store RPS × {input.coefficients.cpuPerRps.store} cores/req<br/>
      &nbsp;&nbsp;<strong>Total = Sum of all service cores</strong>
    </div>
  );

  return (
    <form className="grid-form" onSubmit={e => e.preventDefault()}>
      {scenarioType === 'offline_ab' && <>
        <div className="full-row">
          <label className="input-mode-toggle">
            <input 
              type="checkbox" 
              checked={useDirectQps} 
              onChange={e => handleQpsToggle(e.target.checked)}
            />
            <span>Use direct QPS input instead of monthly breakdown</span>
          </label>
        </div>
        {useDirectQps ? (
          <>
            {numberField('Direct QPS', 'directQps', p.directQps ?? 100)}
          </>
        ) : (
          <>
            {numberField('Queries / Month', 'queriesPerMonth', p.queriesPerMonth ?? 1000)}
            {numberField('Workdays / Month', 'workdaysPerMonth', p.workdaysPerMonth ?? 18)}
            {numberField('Active Hours / Day', 'activeHoursPerDay', p.activeHoursPerDay ?? 5)}
            <details className="calculation-explanation full-row">
              <summary>📊 How are parameters converted to QPS?</summary>
              {renderQpsCalculationExplanation()}
            </details>
          </>
        )}
      </>}
      {scenarioType === 'shadow_ab' && <>
        <div className="full-row">
          <label className="input-mode-toggle">
            <input 
              type="checkbox" 
              checked={useDirectQps} 
              onChange={e => handleQpsToggle(e.target.checked)}
            />
            <span>Use direct QPS input instead of baseline + fork parameters</span>
          </label>
        </div>
        {useDirectQps ? (
          <>
            {numberField('Direct QPS', 'directQps', p.directQps ?? 400)}
          </>
        ) : (
          <>
            {numberField('Live Baseline QPS', 'liveBaselineQps', p.liveBaselineQps ?? 2000)}
            {numberField('Fork %', 'forkPercent', p.forkPercent ?? 20)}
            {numberField('Fork Count', 'forkCount', p.forkCount ?? 2, '1')}
            <details className="calculation-explanation full-row">
              <summary>📊 How are parameters converted to QPS?</summary>
              {renderQpsCalculationExplanation()}
            </details>
          </>
        )}
      </>}
      {scenarioType === 'online_ab_delta' && <>
        <div className="full-row">
          <label className="input-mode-toggle">
            <input 
              type="checkbox" 
              checked={useDirectQps} 
              onChange={e => handleQpsToggle(e.target.checked)}
            />
            <span>Use direct QPS input instead of baseline + delta calculation</span>
          </label>
        </div>
        {useDirectQps ? (
          <>
            {numberField('Direct QPS', 'directQps', p.directQps ?? 150)}
          </>
        ) : (
          <>
            {numberField('Live Baseline QPS', 'liveBaselineQps', p.liveBaselineQps ?? 3000)}
            {numberField('Treatment Share (0-1)', 'treatmentShare', p.treatmentShare ?? 0.5)}
            {numberField('Delta Factor (0-1)', 'deltaFactor', p.deltaFactor ?? 0.1)}
            <details className="calculation-explanation full-row">
              <summary>📊 How are parameters converted to QPS?</summary>
              {renderQpsCalculationExplanation()}
            </details>
          </>
        )}
      </>}
      {scenarioType === 'inorganic_growth' && <>
        <div className="full-row">
          <label className="input-mode-toggle">
            <input 
              type="checkbox" 
              checked={useDirectQps} 
              onChange={e => handleQpsToggle(e.target.checked)}
            />
            <span>Use direct QPS input instead of growth parameter calculation</span>
          </label>
        </div>
        {useDirectQps ? (
          <>
            {numberField('Direct QPS', 'directQps', p.directQps ?? 50)}
          </>
        ) : (
          <>
            {numberField('ΔMAU', 'deltaMau', p.deltaMau ?? 10000)}
            {numberField('DAU/MAU Ratio (0-1)', 'dauMauRatio', p.dauMauRatio ?? 0.35)}
            {numberField('QPD', 'qpd', p.qpd ?? 2.4)}
            {numberField('Realization Factor ρ (0-1)', 'realizationFactor', p.realizationFactor ?? 0.85)}
            {numberField('PCF', 'pcf', p.pcf ?? 6.0)}
            <details className="calculation-explanation full-row">
              <summary>📊 How are parameters converted to QPS?</summary>
              {renderQpsCalculationExplanation()}
            </details>
          </>
        )}
      </>}

      <details className="calculation-explanation full-row">
        <summary>🔧 How is QPS converted to CPU cores?</summary>
        {renderCpuCalculationExplanation()}
      </details>

      <details className="advanced full-row" aria-label="Advanced coefficients">
        <summary>Advanced Coefficients</summary>
  <fieldset className="full-row">
          <legend>Fan-out</legend>
          <div className="inline-group">
            {numberField('XAP→LSS', 'xap_lss', input.coefficients.fanout.xap_lss, 'any', (n,v)=>setFanout(n as any, v))}
            {numberField('LSS→CSO', 'lss_cso', input.coefficients.fanout.lss_cso, 'any', (n,v)=>setFanout(n as any, v))}
            {numberField('CSO→Store', 'cso_store', input.coefficients.fanout.cso_store, 'any', (n,v)=>setFanout(n as any, v))}
          </div>
        </fieldset>
        <fieldset className="full-row">
          <legend>CPU / RPS</legend>
          <div className="inline-group">
            {numberField('XAP', 'xap', input.coefficients.cpuPerRps.xap, 'any', (n,v)=>setCpu(n as any, v))}
            {numberField('LSS', 'lss', input.coefficients.cpuPerRps.lss, 'any', (n,v)=>setCpu(n as any, v))}
            {numberField('CSO', 'cso', input.coefficients.cpuPerRps.cso, 'any', (n,v)=>setCpu(n as any, v))}
            {numberField('Store', 'store', input.coefficients.cpuPerRps.store, 'any', (n,v)=>setCpu(n as any, v))}
          </div>
        </fieldset>
      </details>
    </form>
  );
};
