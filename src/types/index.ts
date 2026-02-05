// ============================================================================
// Core Types for Self-Service Forensic Prototype
// ============================================================================

// ----------------------------------------------------------------------------
// Scenario Types
// ----------------------------------------------------------------------------

export type ScenarioType =
  | 'ransomware'
  | 'data_exfiltration'
  | 'insider_threat'
  | 'web_dos'
  | 'ai_breach';

export interface ScenarioDefinition {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  incidentDescription: IncidentDescription;
  connectors: ConnectorConfig[];
  organizationContext: OrganizationContext;
  triageData: TriageData;
  events: TimelineEvent[];
  findings: Finding[];
  ambiguousFindings: AmbiguousFinding[];
  reportTemplate: ReportTemplate;
}

// ----------------------------------------------------------------------------
// Organization Context Types
// ----------------------------------------------------------------------------

export interface OrganizationContext {
  documents: UploadedDocument[];
  repositories: ConnectedRepository[];
  extractedEntities: ExtractedEntities;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'json' | 'yaml' | 'visio';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'parsing' | 'parsed' | 'error';
  errorMessage?: string;
  extractedData?: DocumentExtraction;
}

export interface DocumentExtraction {
  systems: ExtractedSystem[];
  networks: ExtractedNetwork[];
  processes: BusinessProcess[];
  compliance: ComplianceRequirement[];
}

export interface ConnectedRepository {
  id: string;
  type: 'github' | 'gitlab' | 'sharepoint' | 'bitbucket';
  name: string;
  url: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSync?: Date;
  filesCount?: number;
}

export interface ExtractedEntities {
  systems: ExtractedSystem[];
  networks: ExtractedNetwork[];
  processes: BusinessProcess[];
  compliance: ComplianceRequirement[];
  recoveryObjectives: RecoveryObjective[];
}

export interface ExtractedSystem {
  id: string;
  hostname: string;
  ip?: string;
  role: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  sourceDocument: string;
  owner?: string;
  os?: string;
  services?: string[];
}

export interface ExtractedNetwork {
  id: string;
  name: string;
  cidr: string;
  vlan?: number;
  description: string;
  sourceDocument: string;
}

export interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  rto: number; // hours
  rpo: number; // hours
  dependentSystems: string[];
  sourceDocument: string;
}

export interface ComplianceRequirement {
  id: string;
  framework: string; // e.g., 'SOC2', 'HIPAA', 'PCI-DSS', 'GDPR'
  requirement: string;
  description: string;
  applicableSystems: string[];
  sourceDocument: string;
}

export interface RecoveryObjective {
  processId: string;
  processName: string;
  rto: number;
  rpo: number;
  tier: 1 | 2 | 3 | 4;
}

// ----------------------------------------------------------------------------
// Infrastructure Validation Types
// ----------------------------------------------------------------------------

export interface ValidationState {
  systems: SystemValidation[];
  autoValidateEnabled: boolean;
  lastFullValidation?: Date;
  discrepancies: Discrepancy[];
  isValidating: boolean;
}

export interface SystemValidation {
  systemId: string;
  hostname: string;
  documentedIP: string;
  role: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  validationMethods: ValidationMethod[];
  results: ValidationResult[];
  overallStatus: 'verified' | 'failed' | 'pending' | 'unknown';
  lastChecked?: Date;
}

export type ValidationMethod =
  | 'ping'
  | 'dns'
  | 'spn'
  | 'ad_lookup'
  | 'port_scan'
  | 'cert_check';

export interface ValidationResult {
  method: ValidationMethod;
  status: 'success' | 'failed' | 'pending' | 'skipped';
  message?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface Discrepancy {
  id: string;
  systemId: string;
  hostname: string;
  type:
    | 'ip_mismatch'
    | 'not_in_ad'
    | 'dns_mismatch'
    | 'missing_spn'
    | 'unexpected_service'
    | 'missing_service'
    | 'cert_expired'
    | 'cert_mismatch';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  documented: string;
  actual: string;
}

// ----------------------------------------------------------------------------
// Incident Description Types
// ----------------------------------------------------------------------------

export interface IncidentDescription {
  naturalLanguage: string;
  startDate: Date;
  timezone: string;
  patientZero: SystemIdentifier;
  iocs: IOC[];
  criticalSystems: SystemIdentifier[];
  compromisedCredentials: Credential[];
  additionalNotes?: string;
}

export interface SystemIdentifier {
  hostname: string;
  ip?: string;
  type: 'workstation' | 'server' | 'appliance' | 'cloud_resource' | 'other';
  os?: string;
}

export interface IOC {
  id: string;
  type: 'hash' | 'ip' | 'domain' | 'email' | 'url' | 'file_path' | 'registry_key' | 'user_agent' | 'other';
  value: string;
  description?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Credential {
  id: string;
  username: string;
  scope: string;
  compromiseType: 'phished' | 'harvested' | 'brute_forced' | 'credential_stuffing' | 'api_key_leak' | 'authorized_abuse' | 'unknown';
}

// ----------------------------------------------------------------------------
// Connector Types
// ----------------------------------------------------------------------------

export interface ConnectorConfig {
  id: string;
  type: ConnectorType;
  name: string;
  status: 'configured' | 'unconfigured' | 'error' | 'testing';
  config: Record<string, unknown>;
  lastTested?: Date;
  mockMode: boolean;
}

export type ConnectorType =
  // Endpoints
  | 'windows'
  | 'linux'
  | 'macos'
  // Cloud
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'o365'
  | 'gsuite'
  // Peripherals
  | 'firewall'
  | 'storage'
  | 'email_gateway'
  | 'proxy_waf';

export interface ConnectorCategory {
  id: 'endpoints' | 'cloud' | 'peripherals';
  name: string;
  description: string;
  connectors: ConnectorType[];
}

// ----------------------------------------------------------------------------
// Triage Types
// ----------------------------------------------------------------------------

export interface TriageData {
  phases: TriagePhase[];
  activities: ActivityDefinition[];
}

export interface TriagePhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  subtasks: TriageSubtask[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface TriageSubtask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  details?: string;
}

export interface ActivityDefinition {
  id: string;
  phase: string;
  step: number;
  message: string;
  source: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  timestamp?: Date;
}

export interface TriageState {
  status: 'idle' | 'running' | 'paused' | 'complete' | 'error';
  overallProgress: number;
  phases: TriagePhase[];
  activityLog: ActivityLogEntry[];
  findings: Finding[];
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  phase: string;
  message: string;
  source: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

// ----------------------------------------------------------------------------
// Timeline Types
// ----------------------------------------------------------------------------

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  source: DataSource;
  category: EventCategory;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  summary: string;
  details: Record<string, unknown>;
  rawLog: string;
  correlationId?: string;
  relatedEventIds: string[];
  mitreAttack?: MitreMapping;
  artifacts: ArtifactReference[];
  verificationRequired: boolean;
  verificationStatus?: 'pending' | 'malicious' | 'benign' | 'needs_investigation';
}

export type DataSource =
  | 'windows_security'
  | 'windows_system'
  | 'windows_application'
  | 'linux_auth'
  | 'linux_syslog'
  | 'macos_unified'
  | 'aws_cloudtrail'
  | 'azure_activity'
  | 'o365_audit'
  | 'firewall'
  | 'proxy'
  | 'email_gateway'
  | 'edr'
  | 'network_flow';

export type EventCategory =
  | 'authentication'
  | 'authorization'
  | 'process_execution'
  | 'file_activity'
  | 'network_connection'
  | 'registry_modification'
  | 'scheduled_task'
  | 'service_activity'
  | 'user_management'
  | 'policy_change'
  | 'malware_detection'
  | 'data_exfiltration'
  | 'lateral_movement'
  | 'privilege_escalation'
  | 'persistence'
  | 'defense_evasion';

export interface MitreMapping {
  tactic: string;
  technique: string;
  subtechnique?: string;
  id: string;
}

export interface ArtifactReference {
  id: string;
  type: 'file' | 'memory_dump' | 'registry_key' | 'process' | 'network_capture' | 'log_entry';
  name: string;
  path?: string;
  hash?: string;
  size?: number;
  content?: string;
}

export interface TimelineFilters {
  dateRange: { start: Date; end: Date };
  sources: DataSource[];
  severities: TimelineEvent['severity'][];
  categories: EventCategory[];
  searchQuery: string;
}

export type TimelineViewMode = 'chronological' | 'cluster' | 'attack-chain';

// ----------------------------------------------------------------------------
// Finding & Verification Types
// ----------------------------------------------------------------------------

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  title: string;
  description: string;
  evidence: Evidence[];
  affectedSystems: SystemIdentifier[];
  mitreAttack?: MitreMapping;
  isAmbiguous: boolean;
  ambiguityReason?: string;
  finalClassification?: 'malicious' | 'benign' | 'needs_investigation';
  analystNotes?: string;
  timestamp: Date;
}

export type FindingCategory =
  | 'malware'
  | 'unauthorized_access'
  | 'data_theft'
  | 'policy_violation'
  | 'configuration_issue'
  | 'suspicious_activity'
  | 'lateral_movement'
  | 'privilege_escalation'
  | 'persistence_mechanism'
  | 'defense_evasion'
  | 'dual_use_tool';

export interface Evidence {
  id: string;
  type: 'log_entry' | 'file' | 'screenshot' | 'network_capture' | 'memory_artifact' | 'registry';
  title: string;
  summary: string;
  content: string;
  timestamp: Date;
  source: string;
}

export interface AmbiguousFinding extends Finding {
  isAmbiguous: true;
  ambiguityReason: string;
  historicalContext: HistoricalData[];
  baselineComparison: BaselineComparison;
  expertGuidance: string;
  possibleClassifications: PossibleClassification[];
  toolName?: string;
  legitimateUseCases?: string[];
  suspiciousIndicators?: string[];
}

export interface HistoricalData {
  date: Date;
  description: string;
  outcome: 'legitimate' | 'malicious' | 'unknown';
}

export interface BaselineComparison {
  metric: string;
  baseline: number | string;
  current: number | string;
  deviation: string;
  isAnomaly: boolean;
}

export interface PossibleClassification {
  classification: 'malicious' | 'benign' | 'needs_investigation';
  reasoning: string;
  probability: number;
}

export interface VerificationDecision {
  findingId: string;
  classification: 'malicious' | 'benign' | 'needs_investigation';
  confidence: 'high' | 'medium' | 'low';
  justification: string;
  timestamp: Date;
}

// ----------------------------------------------------------------------------
// Report Types
// ----------------------------------------------------------------------------

export interface ReportTemplate {
  executiveSummary: string;
  businessImpact: BusinessImpactAssessment;
  findings: Finding[];
  timeline: TimelineEvent[];
  recommendations: Recommendation[];
  gapAnalysis: GapAnalysisItem[];
  validationResults?: SystemValidation[];
}

export interface BusinessImpactAssessment {
  operational: ImpactLevel;
  financial: ImpactLevel;
  reputational: ImpactLevel;
  regulatory: ImpactLevel;
  overallScore: number; // 0-100
  affectedProcesses: string[];
  estimatedRecoveryTime: string;
  dataAtRisk: string[];
}

export interface ImpactLevel {
  level: 'critical' | 'high' | 'medium' | 'low' | 'none';
  description: string;
  metrics?: Record<string, string | number>;
}

export interface Recommendation {
  id: string;
  priority: 'immediate' | 'short_term' | 'long_term';
  category: 'containment' | 'eradication' | 'recovery' | 'prevention' | 'detection';
  title: string;
  description: string;
  steps: string[];
  estimatedEffort: string;
  relatedFindings: string[];
}

export interface GapAnalysisItem {
  id: string;
  category: string;
  currentState: string;
  desiredState: string;
  gap: string;
  remediation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  maturityScore: number; // 0-5
}

// ----------------------------------------------------------------------------
// Session Types
// ----------------------------------------------------------------------------

export interface Session {
  id: string;
  createdAt: Date;
  lastModified: Date;
  scenarioType: ScenarioType | 'custom';
  currentStep: number;
  isComplete: boolean;
  incidentDescription?: IncidentDescription;
  organizationContext?: OrganizationContext;
  validationState?: ValidationState;
  connectors: ConnectorConfig[];
  triageState?: TriageState;
  timelineEvents: TimelineEvent[];
  findings: Finding[];
  verificationDecisions: VerificationDecision[];
}

// ----------------------------------------------------------------------------
// UI State Types
// ----------------------------------------------------------------------------

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  effectiveTheme: 'light' | 'dark';
  sidebarExpanded: boolean;
  tooltipsEnabled: boolean;
  activeModal: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoClose?: boolean;
}

// ----------------------------------------------------------------------------
// Workflow Step Types
// ----------------------------------------------------------------------------

export type WorkflowStep =
  | 'dashboard'
  | 'organization_context'
  | 'incident_description'
  | 'connector_config'
  | 'infrastructure_validation'
  | 'triage'
  | 'timeline'
  | 'verification'
  | 'report';

export const WORKFLOW_STEPS: { step: WorkflowStep; label: string; number: number }[] = [
  { step: 'organization_context', label: 'Context', number: 1 },
  { step: 'incident_description', label: 'Incident', number: 2 },
  { step: 'connector_config', label: 'Connectors', number: 3 },
  { step: 'infrastructure_validation', label: 'Validation', number: 4 },
  { step: 'triage', label: 'Triage', number: 5 },
  { step: 'timeline', label: 'Timeline', number: 6 },
  { step: 'verification', label: 'Verify', number: 7 },
  { step: 'report', label: 'Report', number: 8 },
];
