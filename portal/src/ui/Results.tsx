import { CalculationResult } from '../calc/logic';
import React from 'react';

interface Props { result: CalculationResult }

export const Results: React.FC<Props> = ({ result }) => {
  const { effectiveQps, rps, cores } = result;
  const coreEntries: Array<[string, number]> = [
    ['XAP', cores.xap],
    ['LSS', cores.lss],
    ['CSO', cores.cso],
    ['Store', cores.store]
  ];
  return (
    <section aria-live="polite" className="results-section">
      <h2>Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="td-left">Effective QPS</td><td>{effectiveQps.toFixed(4)}</td></tr>
          <tr><td className="td-left">RPS XAP</td><td>{rps.xap.toFixed(4)}</td></tr>
          <tr><td className="td-left">RPS LSS</td><td>{rps.lss.toFixed(4)}</td></tr>
          <tr><td className="td-left">RPS CSO</td><td>{rps.cso.toFixed(4)}</td></tr>
          <tr><td className="td-left">RPS Store</td><td>{rps.store.toFixed(4)}</td></tr>
          <tr><td className="td-left">Cores XAP</td><td>{cores.xap.toFixed(4)}</td></tr>
          <tr><td className="td-left">Cores LSS</td><td>{cores.lss.toFixed(4)}</td></tr>
          <tr><td className="td-left">Cores CSO</td><td>{cores.cso.toFixed(4)}</td></tr>
          <tr><td className="td-left">Cores Store</td><td>{cores.store.toFixed(4)}</td></tr>
          <tr className="total-row"><td className="td-left">Total Cores</td><td>{cores.total.toFixed(4)}</td></tr>
        </tbody>
      </table>
      <div role="figure" aria-labelledby="core-dist-title" className="results-figure">
        <h3 id="core-dist-title" className="results-figure-title">CPU Core Distribution</h3>
        <p className="sr-only" id="core-dist-desc">Relative share of total CPU cores consumed per component.</p>
        <div className="chart" role="list" aria-describedby="core-dist-desc">
          {coreEntries.map(([name, val]) => {
            const pct = cores.total > 0 ? (val / cores.total) * 100 : 0;
            return (
              <div key={name} className="chart-row" role="listitem" aria-label={`${name} ${val.toFixed(2)} cores (${pct.toFixed(1)}%)`}>
                <span className="label">{name}</span>
                <div className="chart-bar" aria-hidden="true">
                  <span className="fill" style={{ width: pct + '%' }} />
                </div>
                <span className="pct">{pct.toFixed(1)}%</span>
                <span className="cores">{val.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
