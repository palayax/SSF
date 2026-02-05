/**
 * Connector Definitions
 *
 * Mock connector configurations for the forensic prototype.
 * Defines available data sources and their configuration options.
 */

export interface ConnectorDefinition {
  id: string;
  name: string;
  type: string;
  category: 'endpoint' | 'cloud' | 'peripheral';
  description: string;
  icon: string;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  tooltip?: string;
}

export const connectorDefinitions: ConnectorDefinition[] = [
  // Endpoint Connectors
  {
    id: 'windows_events',
    name: 'Windows Event Logs',
    type: 'windows_events',
    category: 'endpoint',
    description: 'Collect Windows Security, System, and Application event logs',
    icon: 'Monitor',
    configFields: [
      {
        name: 'hosts',
        label: 'Target Hosts',
        type: 'textarea',
        placeholder: 'hostname1\nhostname2\n10.0.0.1',
        required: true,
        tooltip: 'Enter hostnames or IPs, one per line',
      },
      {
        name: 'auth_method',
        label: 'Authentication',
        type: 'select',
        options: [
          { value: 'domain', label: 'Domain Credentials' },
          { value: 'local', label: 'Local Admin' },
          { value: 'kerberos', label: 'Kerberos' },
        ],
        required: true,
        tooltip: 'Select authentication method for remote log collection',
      },
      {
        name: 'log_types',
        label: 'Log Types',
        type: 'select',
        options: [
          { value: 'all', label: 'All Logs' },
          { value: 'security', label: 'Security Only' },
          { value: 'sysmon', label: 'Security + Sysmon' },
        ],
        tooltip: 'Select which Windows event logs to collect',
      },
    ],
  },
  {
    id: 'crowdstrike',
    name: 'CrowdStrike Falcon',
    type: 'edr',
    category: 'endpoint',
    description: 'Endpoint detection and response data from CrowdStrike',
    icon: 'Shield',
    configFields: [
      {
        name: 'client_id',
        label: 'API Client ID',
        type: 'text',
        required: true,
        tooltip: 'CrowdStrike API Client ID from Falcon console',
      },
      {
        name: 'client_secret',
        label: 'API Client Secret',
        type: 'password',
        required: true,
        tooltip: 'CrowdStrike API Client Secret',
      },
      {
        name: 'base_url',
        label: 'Cloud Region',
        type: 'select',
        options: [
          { value: 'https://api.crowdstrike.com', label: 'US-1' },
          { value: 'https://api.us-2.crowdstrike.com', label: 'US-2' },
          { value: 'https://api.eu-1.crowdstrike.com', label: 'EU-1' },
        ],
        tooltip: 'Select your CrowdStrike cloud region',
      },
    ],
  },
  {
    id: 'carbon_black',
    name: 'VMware Carbon Black',
    type: 'edr',
    category: 'endpoint',
    description: 'EDR data from Carbon Black Cloud or Response',
    icon: 'Shield',
    configFields: [
      {
        name: 'api_url',
        label: 'API URL',
        type: 'text',
        placeholder: 'https://defense.conferdeploy.net',
        required: true,
        tooltip: 'Carbon Black Cloud API endpoint',
      },
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        tooltip: 'API key with appropriate permissions',
      },
      {
        name: 'org_key',
        label: 'Organization Key',
        type: 'text',
        required: true,
        tooltip: 'Your Carbon Black organization key',
      },
    ],
  },
  {
    id: 'sentinelone',
    name: 'SentinelOne',
    type: 'edr',
    category: 'endpoint',
    description: 'Endpoint data from SentinelOne platform',
    icon: 'Shield',
    configFields: [
      {
        name: 'console_url',
        label: 'Console URL',
        type: 'text',
        placeholder: 'https://usea1.sentinelone.net',
        required: true,
        tooltip: 'SentinelOne management console URL',
      },
      {
        name: 'api_token',
        label: 'API Token',
        type: 'password',
        required: true,
        tooltip: 'API token with Viewer or higher permissions',
      },
    ],
  },
  {
    id: 'active_directory',
    name: 'Active Directory',
    type: 'directory',
    category: 'endpoint',
    description: 'Query Active Directory for user and computer objects',
    icon: 'Users',
    configFields: [
      {
        name: 'domain_controller',
        label: 'Domain Controller',
        type: 'text',
        placeholder: 'dc01.domain.local',
        required: true,
        tooltip: 'Domain controller hostname or IP',
      },
      {
        name: 'base_dn',
        label: 'Base DN',
        type: 'text',
        placeholder: 'DC=domain,DC=local',
        required: true,
        tooltip: 'LDAP base distinguished name',
      },
      {
        name: 'use_ssl',
        label: 'Use LDAPS',
        type: 'checkbox',
        tooltip: 'Enable secure LDAP connection (recommended)',
      },
    ],
  },

  // Cloud Connectors
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    type: 'email',
    category: 'cloud',
    description: 'Email, SharePoint, and Azure AD logs from M365',
    icon: 'Mail',
    configFields: [
      {
        name: 'tenant_id',
        label: 'Tenant ID',
        type: 'text',
        required: true,
        tooltip: 'Azure AD Tenant ID (GUID)',
      },
      {
        name: 'client_id',
        label: 'App Client ID',
        type: 'text',
        required: true,
        tooltip: 'Azure AD App Registration Client ID',
      },
      {
        name: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        required: true,
        tooltip: 'Azure AD App Registration Client Secret',
      },
      {
        name: 'data_sources',
        label: 'Data Sources',
        type: 'select',
        options: [
          { value: 'all', label: 'All (Mail, SharePoint, Azure AD)' },
          { value: 'mail', label: 'Exchange Online Only' },
          { value: 'azuread', label: 'Azure AD Only' },
        ],
        tooltip: 'Select which M365 data sources to collect',
      },
    ],
  },
  {
    id: 'azure_sentinel',
    name: 'Microsoft Sentinel',
    type: 'siem',
    category: 'cloud',
    description: 'Security alerts and incidents from Azure Sentinel',
    icon: 'AlertTriangle',
    configFields: [
      {
        name: 'workspace_id',
        label: 'Workspace ID',
        type: 'text',
        required: true,
        tooltip: 'Log Analytics Workspace ID',
      },
      {
        name: 'workspace_key',
        label: 'Workspace Key',
        type: 'password',
        required: true,
        tooltip: 'Log Analytics Primary Key',
      },
      {
        name: 'subscription_id',
        label: 'Subscription ID',
        type: 'text',
        tooltip: 'Azure Subscription ID (optional)',
      },
    ],
  },
  {
    id: 'aws_cloudtrail',
    name: 'AWS CloudTrail',
    type: 'cloud_logs',
    category: 'cloud',
    description: 'API activity logs from AWS CloudTrail',
    icon: 'Cloud',
    configFields: [
      {
        name: 'access_key',
        label: 'Access Key ID',
        type: 'text',
        required: true,
        tooltip: 'AWS IAM Access Key ID',
      },
      {
        name: 'secret_key',
        label: 'Secret Access Key',
        type: 'password',
        required: true,
        tooltip: 'AWS IAM Secret Access Key',
      },
      {
        name: 'region',
        label: 'Region',
        type: 'select',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        ],
        tooltip: 'AWS region where CloudTrail is configured',
      },
    ],
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    type: 'email',
    category: 'cloud',
    description: 'Gmail, Drive, and Admin audit logs from Google Workspace',
    icon: 'Mail',
    configFields: [
      {
        name: 'service_account_json',
        label: 'Service Account JSON',
        type: 'textarea',
        required: true,
        tooltip: 'Paste the service account JSON key contents',
      },
      {
        name: 'admin_email',
        label: 'Admin Email',
        type: 'text',
        placeholder: 'admin@company.com',
        required: true,
        tooltip: 'Admin email for domain-wide delegation',
      },
    ],
  },
  {
    id: 'okta',
    name: 'Okta',
    type: 'identity',
    category: 'cloud',
    description: 'Identity and authentication logs from Okta',
    icon: 'Key',
    configFields: [
      {
        name: 'domain',
        label: 'Okta Domain',
        type: 'text',
        placeholder: 'company.okta.com',
        required: true,
        tooltip: 'Your Okta organization domain',
      },
      {
        name: 'api_token',
        label: 'API Token',
        type: 'password',
        required: true,
        tooltip: 'Okta API token with read permissions',
      },
    ],
  },

  // Peripheral Connectors
  {
    id: 'palo_alto',
    name: 'Palo Alto Firewall',
    type: 'firewall',
    category: 'peripheral',
    description: 'Traffic and threat logs from Palo Alto Networks firewall',
    icon: 'Shield',
    configFields: [
      {
        name: 'panorama_host',
        label: 'Panorama/Firewall IP',
        type: 'text',
        placeholder: '10.0.0.1',
        required: true,
        tooltip: 'IP address of Panorama or individual firewall',
      },
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        tooltip: 'API key generated from firewall CLI or UI',
      },
      {
        name: 'log_types',
        label: 'Log Types',
        type: 'select',
        options: [
          { value: 'all', label: 'All Logs' },
          { value: 'traffic', label: 'Traffic Only' },
          { value: 'threat', label: 'Threat Only' },
          { value: 'traffic,threat', label: 'Traffic + Threat' },
        ],
        tooltip: 'Select which log types to collect',
      },
    ],
  },
  {
    id: 'fortinet',
    name: 'Fortinet FortiGate',
    type: 'firewall',
    category: 'peripheral',
    description: 'Firewall and UTM logs from FortiGate',
    icon: 'Shield',
    configFields: [
      {
        name: 'host',
        label: 'FortiGate IP',
        type: 'text',
        required: true,
        tooltip: 'IP address of FortiGate device',
      },
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        tooltip: 'REST API key from FortiGate',
      },
      {
        name: 'vdom',
        label: 'VDOM',
        type: 'text',
        placeholder: 'root',
        tooltip: 'Virtual domain name (default: root)',
      },
    ],
  },
  {
    id: 'zscaler',
    name: 'Zscaler',
    type: 'proxy',
    category: 'peripheral',
    description: 'Web proxy and cloud security logs from Zscaler',
    icon: 'Globe',
    configFields: [
      {
        name: 'cloud',
        label: 'Zscaler Cloud',
        type: 'select',
        options: [
          { value: 'zscaler.net', label: 'Zscaler.net' },
          { value: 'zscalerone.net', label: 'ZscalerOne.net' },
          { value: 'zscalertwo.net', label: 'ZscalerTwo.net' },
          { value: 'zscloud.net', label: 'ZSCloud.net' },
        ],
        required: true,
        tooltip: 'Your Zscaler cloud instance',
      },
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        tooltip: 'Zscaler API key',
      },
      {
        name: 'username',
        label: 'Admin Username',
        type: 'text',
        required: true,
        tooltip: 'Zscaler admin username',
      },
    ],
  },
  {
    id: 'proofpoint',
    name: 'Proofpoint TAP',
    type: 'email_security',
    category: 'peripheral',
    description: 'Email threat data from Proofpoint Targeted Attack Protection',
    icon: 'Mail',
    configFields: [
      {
        name: 'service_principal',
        label: 'Service Principal',
        type: 'text',
        required: true,
        tooltip: 'TAP Service Principal',
      },
      {
        name: 'secret',
        label: 'Secret',
        type: 'password',
        required: true,
        tooltip: 'TAP API Secret',
      },
    ],
  },
  {
    id: 'splunk',
    name: 'Splunk',
    type: 'siem',
    category: 'peripheral',
    description: 'Search and retrieve logs from Splunk SIEM',
    icon: 'Database',
    configFields: [
      {
        name: 'host',
        label: 'Splunk Host',
        type: 'text',
        placeholder: 'splunk.company.com',
        required: true,
        tooltip: 'Splunk server hostname',
      },
      {
        name: 'port',
        label: 'Management Port',
        type: 'text',
        placeholder: '8089',
        tooltip: 'Splunk management port (default: 8089)',
      },
      {
        name: 'token',
        label: 'API Token',
        type: 'password',
        required: true,
        tooltip: 'Splunk HTTP Event Collector or API token',
      },
      {
        name: 'index',
        label: 'Index',
        type: 'text',
        placeholder: 'main',
        tooltip: 'Splunk index to search (default: main)',
      },
    ],
  },
];

export function getConnectorsByCategory(category: 'endpoint' | 'cloud' | 'peripheral'): ConnectorDefinition[] {
  return connectorDefinitions.filter(c => c.category === category);
}

export function getConnectorById(id: string): ConnectorDefinition | undefined {
  return connectorDefinitions.find(c => c.id === id);
}
