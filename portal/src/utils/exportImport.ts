/**
 * Export/Import utilities for ResourceCalc Portal
 * Allows users to save and load their calculation data as JSON files
 */

import { ScenarioType, ScenarioInput, CalculationResult } from '../calc/logic';

export interface ExportData {
  version: string;
  exportDate: string;
  appName: string;
  scenarios: {
    [key in ScenarioType]?: {
      input: ScenarioInput;
      result?: CalculationResult;
      lastCalculated?: string;
    };
  };
  activeScenario: ScenarioType;
  metadata: {
    totalScenarios: number;
    scenariosWithResults: number;
    exportSource: string;
  };
}

/**
 * Export all calculation data to a downloadable JSON file
 */
export function exportCalculationData(
  scenarios: { [key in ScenarioType]?: { input: ScenarioInput; result?: CalculationResult; lastCalculated?: string } },
  activeScenario: ScenarioType
): void {
  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    appName: 'ResourceCalc Portal',
    scenarios: scenarios,
    activeScenario: activeScenario,
    metadata: {
      totalScenarios: Object.keys(scenarios).length,
      scenariosWithResults: Object.values(scenarios).filter(s => s.result).length,
      exportSource: 'ResourceCalc Portal Web App'
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `resourcecalc-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import calculation data from a JSON file
 */
export function importCalculationData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importData: ExportData = JSON.parse(jsonString);
        
        // Validate the imported data structure
        if (!validateImportData(importData)) {
          throw new Error('Invalid file format. Please select a valid ResourceCalc export file.');
        }
        
        resolve(importData);
      } catch (error) {
        reject(new Error(`Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the selected file.'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate imported data structure
 */
function validateImportData(data: any): data is ExportData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!data.version || !data.exportDate || !data.appName || !data.scenarios) {
    return false;
  }
  
  // Check if it's from ResourceCalc
  if (data.appName !== 'ResourceCalc Portal') {
    return false;
  }
  
  // Validate scenarios structure
  if (typeof data.scenarios !== 'object') {
    return false;
  }
  
  // Validate each scenario
  for (const [scenarioType, scenarioData] of Object.entries(data.scenarios)) {
    if (!isValidScenarioType(scenarioType)) {
      return false;
    }
    
    if (!scenarioData || typeof scenarioData !== 'object') {
      return false;
    }
    
    const scenario = scenarioData as any;
    if (!scenario.input || typeof scenario.input !== 'object') {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a string is a valid scenario type
 */
function isValidScenarioType(type: string): type is ScenarioType {
  return ['offline_ab', 'shadow_ab', 'online_ab_delta', 'inorganic_growth'].includes(type);
}

/**
 * Generate a summary of export data for user preview
 */
export function getExportSummary(data: ExportData): string {
  const { scenarios, metadata, exportDate } = data;
  const exportDateFormatted = new Date(exportDate).toLocaleDateString();
  
  const scenarioNames: { [key in ScenarioType]: string } = {
    offline_ab: 'Offline A/B Testing',
    shadow_ab: 'Shadow A/B Testing',
    online_ab_delta: 'Online A/B Testing (Delta)',
    inorganic_growth: 'Inorganic Growth'
  };
  
  const scenarioList = Object.keys(scenarios)
    .map(type => {
      const scenario = scenarios[type as ScenarioType];
      const hasResult = scenario?.result ? '✓' : '○';
      return `  ${hasResult} ${scenarioNames[type as ScenarioType]}`;
    })
    .join('\n');
  
  return `Export from ${exportDateFormatted}
${metadata.totalScenarios} scenarios total
${metadata.scenariosWithResults} with calculation results

Scenarios:
${scenarioList}`;
}

/**
 * Merge imported data with current state
 * Returns the merged scenario data and suggested active scenario
 */
export function mergeImportedData(
  importedData: ExportData,
  currentScenarios: { [key in ScenarioType]?: { input: ScenarioInput; result?: CalculationResult; lastCalculated?: string } },
  mergeStrategy: 'replace' | 'merge' = 'replace'
): {
  scenarios: { [key in ScenarioType]?: { input: ScenarioInput; result?: CalculationResult; lastCalculated?: string } };
  activeScenario: ScenarioType;
} {
  let mergedScenarios: typeof currentScenarios;
  
  if (mergeStrategy === 'replace') {
    // Replace all current data with imported data
    mergedScenarios = { ...importedData.scenarios };
  } else {
    // Merge: keep current data, add imported data for missing scenarios
    mergedScenarios = { ...currentScenarios };
    Object.entries(importedData.scenarios).forEach(([type, data]) => {
      if (!mergedScenarios[type as ScenarioType]) {
        mergedScenarios[type as ScenarioType] = data;
      }
    });
  }
  
  return {
    scenarios: mergedScenarios,
    activeScenario: importedData.activeScenario
  };
}