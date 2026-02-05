/**
 * Scenario Data Index
 *
 * Exports all pre-populated scenario data for the forensic prototype.
 * Each scenario includes:
 * - Incident description
 * - Organization context (mocked documents)
 * - Infrastructure systems
 * - Timeline events
 * - Findings for verification
 * - Report data
 */

import { ransomwareScenario } from './ransomware';
import { dataExfiltrationScenario } from './dataExfiltration';
import { insiderThreatScenario } from './insiderThreat';
import { webDosScenario } from './webDos';
import { aiBreachScenario } from './aiBreach';
import { ScenarioType } from '@/types';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  incidentDescription: {
    description: string;
    startDate: string;
    endDate?: string;
    patientZero: string;
    affectedSystems: string[];
    iocs: Array<{ type: string; value: string }>;
  };
  organizationContext: {
    documents: Array<{
      id: string;
      filename: string;
      type: string;
      status: 'parsed';
    }>;
    extractedSystems: Array<{
      hostname: string;
      ip: string;
      role: string;
      criticality: 'critical' | 'high' | 'medium' | 'low';
    }>;
    extractedNetworks: Array<{
      name: string;
      cidr: string;
      vlan: number;
      purpose: string;
    }>;
  };
  connectors: Array<{
    id: string;
    name: string;
    type: string;
    category: 'endpoint' | 'cloud' | 'peripheral';
    status: 'connected' | 'pending';
  }>;
  timelineEvents: Array<{
    id: string;
    timestamp: string;
    source: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    rawLog?: string;
    relatedEventIds?: string[];
  }>;
  findings: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
    category: string;
    evidence: Array<{ type: string; content: string }>;
    suggestedClassification: 'malicious' | 'benign' | 'needs_investigation';
  }>;
  reportData: {
    executiveSummary: string;
    businessImpact: {
      operational: 'critical' | 'high' | 'medium' | 'low';
      financial: 'critical' | 'high' | 'medium' | 'low';
      reputational: 'critical' | 'high' | 'medium' | 'low';
      regulatory: 'critical' | 'high' | 'medium' | 'low';
    };
    recommendations: Array<{
      priority: 'immediate' | 'short_term' | 'long_term';
      title: string;
      description: string;
    }>;
    gaps: Array<{
      category: string;
      current: number;
      target: number;
      gap: string;
    }>;
  };
}

export const scenarios: Record<ScenarioType, Scenario> = {
  ransomware: ransomwareScenario,
  data_exfiltration: dataExfiltrationScenario,
  insider_threat: insiderThreatScenario,
  web_dos: webDosScenario,
  ai_breach: aiBreachScenario,
};

export function getScenario(type: ScenarioType): Scenario {
  return scenarios[type];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}
