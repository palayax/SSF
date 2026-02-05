/**
 * Insider Threat Scenario
 *
 * Scenario: Disgruntled employee planning departure copies sensitive data
 * and attempts to sabotage systems before leaving.
 */

import { Scenario } from './index';

export const insiderThreatScenario: Scenario = {
  id: 'insider_threat',
  name: 'Insider Threat',
  description: 'Disgruntled employee data theft and sabotage attempt before termination',
  icon: 'UserX',
  severity: 'high',

  incidentDescription: {
    description: `HR notified Security that software developer Michael Torres submitted his resignation after being passed over for promotion. IT noticed unusual activity including large file downloads, access to systems outside his normal scope, and database queries against employee salary data.

Further investigation revealed Torres had been copying proprietary algorithms and customer data to personal cloud storage. There are also indicators he may be planning to corrupt production databases before his last day.`,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-12T16:00:00Z',
    patientZero: 'WS-DEV-023',
    affectedSystems: [
      'WS-DEV-023',
      'GIT-PROD-01',
      'DB-PROD-01',
      'DB-PROD-02',
      'JIRA-01',
      'CONFLUENCE-01',
    ],
    iocs: [
      { type: 'email', value: 'michael.torres.dev@gmail.com' },
      { type: 'domain', value: 'dropbox.com' },
      { type: 'domain', value: 'mega.nz' },
      { type: 'ip', value: '73.241.55.89' },
      { type: 'usb_device', value: 'SanDisk Ultra 256GB (Serial: 4C530000123456)' },
    ],
  },

  organizationContext: {
    documents: [
      { id: 'doc-1', filename: 'Acceptable_Use_Policy.pdf', type: 'pdf', status: 'parsed' },
      { id: 'doc-2', filename: 'HR_Termination_Procedures.docx', type: 'docx', status: 'parsed' },
      { id: 'doc-3', filename: 'Database_Access_Matrix.xlsx', type: 'xlsx', status: 'parsed' },
    ],
    extractedSystems: [
      { hostname: 'WS-DEV-023', ip: '10.20.1.123', role: 'Developer Workstation', criticality: 'medium' },
      { hostname: 'GIT-PROD-01', ip: '10.20.2.10', role: 'Production Git Server', criticality: 'critical' },
      { hostname: 'DB-PROD-01', ip: '10.20.3.10', role: 'Production Database (Primary)', criticality: 'critical' },
      { hostname: 'DB-PROD-02', ip: '10.20.3.11', role: 'Production Database (Replica)', criticality: 'critical' },
      { hostname: 'JIRA-01', ip: '10.20.4.10', role: 'Project Management', criticality: 'high' },
      { hostname: 'CONFLUENCE-01', ip: '10.20.4.20', role: 'Documentation Wiki', criticality: 'high' },
      { hostname: 'HR-DB-01', ip: '10.30.1.10', role: 'HR Database', criticality: 'critical' },
    ],
    extractedNetworks: [
      { name: 'Development', cidr: '10.20.1.0/24', vlan: 201, purpose: 'Developer Workstations' },
      { name: 'Infrastructure', cidr: '10.20.2.0/24', vlan: 202, purpose: 'Dev Infrastructure' },
      { name: 'Production DB', cidr: '10.20.3.0/24', vlan: 203, purpose: 'Production Databases' },
      { name: 'HR Systems', cidr: '10.30.0.0/16', vlan: 300, purpose: 'HR Department' },
    ],
  },

  connectors: [
    { id: 'conn-1', name: 'Microsoft Sentinel', type: 'siem', category: 'cloud', status: 'connected' },
    { id: 'conn-2', name: 'CyberArk PAM', type: 'pam', category: 'endpoint', status: 'connected' },
    { id: 'conn-3', name: 'Teramind UAM', type: 'ueba', category: 'endpoint', status: 'connected' },
    { id: 'conn-4', name: 'Azure AD', type: 'identity', category: 'cloud', status: 'connected' },
    { id: 'conn-5', name: 'Database Activity Monitor', type: 'database', category: 'peripheral', status: 'connected' },
  ],

  timelineEvents: [
    {
      id: 'evt-001',
      timestamp: '2024-02-01T09:00:00Z',
      source: 'HR System',
      category: 'hr_event',
      severity: 'info',
      title: 'Resignation Submitted',
      description: 'Michael Torres submitted resignation, effective Feb 15',
      rawLog: `EmployeeID: E10234
Name: Michael Torres
Department: Engineering
Manager: Jennifer Walsh
ResignationDate: 2024-02-01
EffectiveDate: 2024-02-15
Reason: Personal
Note: Passed over for Senior Developer promotion Jan 15`,
    },
    {
      id: 'evt-002',
      timestamp: '2024-02-01T14:30:00Z',
      source: 'Teramind',
      category: 'user_behavior',
      severity: 'medium',
      title: 'Unusual Search Activity',
      description: 'User searched for competitor job postings and data theft articles',
      rawLog: `User: michael.torres
SearchQueries:
- "how to copy git repository locally"
- "bypass DLP software"
- "competitor company careers"
- "intellectual property laws"
RiskScore: 65
Category: Flight Risk`,
    },
    {
      id: 'evt-003',
      timestamp: '2024-02-03T22:00:00Z',
      source: 'Git Server',
      category: 'source_code',
      severity: 'high',
      title: 'Repository Download - After Hours',
      description: 'User downloaded 5 repositories outside business hours',
      rawLog: `User: michael.torres
Action: clone
Repositories:
- core-algorithms (1.2GB)
- customer-analytics (800MB)
- pricing-engine (450MB)
- ml-models (2.1GB)
- api-gateway (320MB)
TotalSize: 4.87GB
Time: 22:00-23:30
Location: Remote VPN`,
    },
    {
      id: 'evt-004',
      timestamp: '2024-02-05T10:00:00Z',
      source: 'Database Monitor',
      category: 'database',
      severity: 'high',
      title: 'Unauthorized Database Access',
      description: 'User accessed HR database containing salary information',
      rawLog: `User: michael.torres
Database: HR-DB-01
Query: SELECT * FROM employees WHERE department = 'Engineering'
Tables Accessed: employees, salaries, performance_reviews
RowsReturned: 847
Authorization: NOT IN ACCESS MATRIX
Alert: Unauthorized cross-department data access`,
    },
    {
      id: 'evt-005',
      timestamp: '2024-02-06T13:45:00Z',
      source: 'Endpoint DLP',
      category: 'data_movement',
      severity: 'high',
      title: 'USB Device Copy Operation',
      description: 'Large file copy to removable USB device',
      rawLog: `Hostname: WS-DEV-023
User: michael.torres
Device: SanDisk Ultra 256GB
Serial: 4C530000123456
Operation: File Copy
Files: 2,341 files
Size: 8.2GB
Categories: Source Code, Documents, Data Exports
Action: Logged (DLP in Monitor Mode)`,
    },
    {
      id: 'evt-006',
      timestamp: '2024-02-08T02:15:00Z',
      source: 'Cloud DLP',
      category: 'data_movement',
      severity: 'critical',
      title: 'Upload to Personal Cloud Storage',
      description: 'Sensitive files uploaded to personal Dropbox account',
      rawLog: `User: michael.torres
Destination: dropbox.com
Account: michael.torres.dev@gmail.com
Files: 156 files
Size: 3.4GB
Categories: Proprietary Algorithms, Customer Data
Classification: Confidential, Restricted
Action: Allowed (Personal cloud not blocked)`,
    },
    {
      id: 'evt-007',
      timestamp: '2024-02-10T16:00:00Z',
      source: 'CyberArk',
      category: 'privileged_access',
      severity: 'critical',
      title: 'Production Database Access Attempt',
      description: 'User attempted to access production database credentials',
      rawLog: `User: michael.torres
Target: DB-PROD-01 admin credentials
Safe: Production-Database-Creds
Action: Retrieve Password
Result: DENIED - Not authorized
Reason: User not in approved list for production access
Alert: Privileged access attempt by non-authorized user`,
    },
    {
      id: 'evt-008',
      timestamp: '2024-02-11T23:30:00Z',
      source: 'Git Server',
      category: 'source_code',
      severity: 'critical',
      title: 'Destructive Git Command Detected',
      description: 'User attempted to force push to main branches',
      rawLog: `User: michael.torres
Repository: core-algorithms
Command: git push --force origin main
Branches Affected: main, release/v2.0
Result: BLOCKED by branch protection
Policy: Force push prohibited on protected branches
Alert: Potential sabotage attempt`,
    },
    {
      id: 'evt-009',
      timestamp: '2024-02-12T09:00:00Z',
      source: 'Database Monitor',
      category: 'database',
      severity: 'critical',
      title: 'DELETE Statement Attempt',
      description: 'User attempted to delete records from customer database',
      rawLog: `User: michael.torres
Database: DB-PROD-01 (via development connection)
Query: DELETE FROM customers WHERE created_at < '2024-01-01'
Result: BLOCKED - Read-only access from dev network
RowsAffected: 0 (blocked)
Alert: Destructive query attempt on production data`,
    },
    {
      id: 'evt-010',
      timestamp: '2024-02-12T16:00:00Z',
      source: 'Security Team',
      category: 'incident',
      severity: 'critical',
      title: 'Account Disabled - Investigation Started',
      description: 'Security disabled account and escalated to IR team',
      rawLog: `Ticket: SEC-2024-0089
Subject: Insider Threat Investigation - Michael Torres
Actions Taken:
- Account disabled
- VPN access revoked
- Badge access suspended
- Workstation seized for forensics
- Legal notified
Status: Active Investigation`,
    },
  ],

  findings: [
    {
      id: 'find-001',
      title: 'Post-Resignation Data Hoarding',
      description: 'User downloaded 5 proprietary code repositories (4.87GB) within days of resignation submission',
      severity: 'critical',
      confidence: 95,
      category: 'Data Theft',
      evidence: [
        { type: 'git', content: 'Clone of 5 repositories totaling 4.87GB on Feb 3' },
        { type: 'hr', content: 'Resignation submitted Feb 1, downloads started Feb 3' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-002',
      title: 'Unauthorized HR Data Access',
      description: 'Developer accessed HR salary database which is outside his authorized scope',
      severity: 'high',
      confidence: 90,
      category: 'Policy Violation',
      evidence: [
        { type: 'database', content: 'Query against employees, salaries tables' },
        { type: 'policy', content: 'Access matrix shows no HR database authorization' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-003',
      title: 'USB Data Exfiltration',
      description: '8.2GB of source code and documents copied to personal USB device',
      severity: 'critical',
      confidence: 98,
      category: 'Data Theft',
      evidence: [
        { type: 'endpoint', content: '2,341 files copied to SanDisk USB drive' },
        { type: 'classification', content: 'Files include source code and data exports' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-004',
      title: 'Cloud Storage Upload',
      description: 'Sensitive files uploaded to personal Dropbox account',
      severity: 'critical',
      confidence: 95,
      category: 'Data Theft',
      evidence: [
        { type: 'network', content: 'Upload to personal Dropbox (3.4GB)' },
        { type: 'classification', content: 'Files marked Confidential and Restricted' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-005',
      title: 'Privileged Access Attempt',
      description: 'User attempted to retrieve production database credentials without authorization',
      severity: 'high',
      confidence: 100,
      category: 'Privilege Escalation',
      evidence: [
        { type: 'pam', content: 'CyberArk denied credential retrieval request' },
        { type: 'policy', content: 'User not in approved list for production access' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-006',
      title: 'Sabotage Attempt - Force Push',
      description: 'User attempted force push to protected main branches, potentially to corrupt code history',
      severity: 'critical',
      confidence: 88,
      category: 'Sabotage',
      evidence: [
        { type: 'git', content: 'git push --force origin main blocked by branch protection' },
        { type: 'timing', content: 'Attempted at 23:30, outside normal hours' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-007',
      title: 'Sabotage Attempt - Data Deletion',
      description: 'User attempted to DELETE customer records from production database',
      severity: 'critical',
      confidence: 100,
      category: 'Sabotage',
      evidence: [
        { type: 'database', content: 'DELETE FROM customers query blocked by network segmentation' },
        { type: 'intent', content: 'Query would have affected historical customer data' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-008',
      title: 'Research on Bypassing Security',
      description: 'User searched for methods to bypass DLP and transfer data',
      severity: 'medium',
      confidence: 75,
      category: 'Reconnaissance',
      evidence: [
        { type: 'ueba', content: 'Searches for "bypass DLP software" detected' },
        { type: 'context', content: 'Searches occurred after resignation' },
      ],
      suggestedClassification: 'needs_investigation',
    },
  ],

  reportData: {
    executiveSummary: 'A disgruntled employee who resigned after being passed over for promotion engaged in systematic data theft and attempted sabotage. Over 11 days, the employee exfiltrated approximately 16GB of proprietary code and customer data via USB and cloud storage. The employee also attempted to corrupt production databases and source code repositories but was blocked by security controls.',
    businessImpact: {
      operational: 'medium',
      financial: 'high',
      reputational: 'medium',
      regulatory: 'high',
    },
    recommendations: [
      {
        priority: 'immediate',
        title: 'Legal Action Assessment',
        description: 'Work with legal to assess options for civil action and potential criminal referral.',
      },
      {
        priority: 'immediate',
        title: 'Customer Notification Assessment',
        description: 'Determine if customer data exposure requires breach notification.',
      },
      {
        priority: 'immediate',
        title: 'Competitive Intelligence',
        description: 'Monitor for use of stolen IP at competitor companies.',
      },
      {
        priority: 'short_term',
        title: 'DLP to Block Mode',
        description: 'Change endpoint DLP from monitor to block mode for sensitive data.',
      },
      {
        priority: 'short_term',
        title: 'Block Personal Cloud Storage',
        description: 'Block access to personal cloud storage services from corporate network.',
      },
      {
        priority: 'short_term',
        title: 'USB Device Control',
        description: 'Implement USB device whitelisting to prevent unauthorized data transfers.',
      },
      {
        priority: 'long_term',
        title: 'Enhanced Offboarding Process',
        description: 'Implement immediate access restriction upon resignation notice for sensitive roles.',
      },
      {
        priority: 'long_term',
        title: 'Insider Threat Program',
        description: 'Develop formal insider threat detection and response program.',
      },
    ],
    gaps: [
      { category: 'Data Loss Prevention', current: 2, target: 5, gap: 'DLP in monitor-only mode, personal cloud allowed' },
      { category: 'Access Control', current: 3, target: 5, gap: 'Cross-department data access not fully restricted' },
      { category: 'Offboarding', current: 1, target: 5, gap: 'No immediate access restriction on resignation' },
      { category: 'Device Control', current: 2, target: 5, gap: 'USB devices not controlled' },
      { category: 'Insider Threat', current: 1, target: 4, gap: 'No formal insider threat program' },
    ],
  },
};
