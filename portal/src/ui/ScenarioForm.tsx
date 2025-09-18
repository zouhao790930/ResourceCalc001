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

  const toggleHelp = (name: string) => {
    setOpenHelp(o => ({ ...o, [name]: !o[name] }));
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

  return (
    <form className="grid-form" onSubmit={e => e.preventDefault()}>
      {scenarioType === 'offline_ab' && <>
        {numberField('Queries / Month', 'queriesPerMonth', p.queriesPerMonth ?? 1000)}
        {numberField('Workdays / Month', 'workdaysPerMonth', p.workdaysPerMonth ?? 18)}
        {numberField('Active Hours / Day', 'activeHoursPerDay', p.activeHoursPerDay ?? 5)}
      </>}
      {scenarioType === 'shadow_ab' && <>
        {numberField('Live Baseline QPS', 'liveBaselineQps', p.liveBaselineQps ?? 2000)}
        {numberField('Fork %', 'forkPercent', p.forkPercent ?? 20)}
        {numberField('Fork Count', 'forkCount', p.forkCount ?? 2, '1')}
      </>}
      {scenarioType === 'online_ab_delta' && <>
        {numberField('Live Baseline QPS', 'liveBaselineQps', p.liveBaselineQps ?? 3000)}
        {numberField('Treatment Share (0-1)', 'treatmentShare', p.treatmentShare ?? 0.5)}
        {numberField('Delta Factor (0-1)', 'deltaFactor', p.deltaFactor ?? 0.1)}
      </>}
      {scenarioType === 'inorganic_growth' && <>
        {numberField('ΔMAU', 'deltaMau', p.deltaMau ?? 10000)}
        {numberField('DAU/MAU Ratio (0-1)', 'dauMauRatio', p.dauMauRatio ?? 0.35)}
        {numberField('QPD', 'qpd', p.qpd ?? 2.4)}
        {numberField('Realization Factor ρ (0-1)', 'realizationFactor', p.realizationFactor ?? 0.85)}
        {numberField('PCF', 'pcf', p.pcf ?? 6.0)}
      </>}

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
