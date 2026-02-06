import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, Button, Tooltip, Modal } from '@/components/common';
import { CONNECTOR_CATEGORIES, CONNECTOR_INFO } from '@/utils/constants';
import {
  Monitor,
  Terminal,
  Apple,
  Cloud,
  Mail,
  Shield,
  HardDrive,
  MailWarning,
  Globe,
  Settings,
  CheckCircle,
  KeyRound,
  FileKey,
  Upload,
  Package,
  Download,
  Server,
  HardDriveDownload,
  Tag,
  X,
  Search,
  Radar,
  Wifi,
  Scan,
  ChevronDown,
  ChevronRight,
  Loader2,
  Network,
  Eye,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ConnectorType } from '@/types';

// Mock auto-discovery results
interface DiscoveryResult {
  id: string;
  name: string;
  type: string;
  ip: string;
  os?: string;
  status: 'online' | 'offline' | 'filtered';
  ports: number[];
  services: string[];
  risk: 'critical' | 'high' | 'medium' | 'low';
}

const MOCK_DISCOVERY_RESULTS: Record<string, DiscoveryResult[]> = {
  servers: [
    { id: 'd1', name: 'DC-MAIN-01', type: 'Domain Controller', ip: '10.0.1.10', os: 'Windows Server 2022', status: 'online', ports: [53, 88, 389, 445, 636], services: ['DNS', 'Kerberos', 'LDAP', 'SMB'], risk: 'critical' },
    { id: 'd2', name: 'DC-BACKUP-01', type: 'Domain Controller', ip: '10.0.1.11', os: 'Windows Server 2022', status: 'online', ports: [53, 88, 389, 445], services: ['DNS', 'Kerberos', 'LDAP', 'SMB'], risk: 'critical' },
    { id: 'd3', name: 'FS-FINANCE-01', type: 'File Server', ip: '10.0.2.20', os: 'Windows Server 2019', status: 'online', ports: [445, 3389], services: ['SMB', 'RDP'], risk: 'high' },
    { id: 'd4', name: 'SQL-DB-01', type: 'Database Server', ip: '10.0.3.30', os: 'Windows Server 2019', status: 'online', ports: [1433, 3389], services: ['MSSQL', 'RDP'], risk: 'high' },
    { id: 'd5', name: 'WEB-APP-01', type: 'Web Server', ip: '10.0.4.40', os: 'Ubuntu 22.04', status: 'online', ports: [80, 443, 22], services: ['HTTP', 'HTTPS', 'SSH'], risk: 'medium' },
    { id: 'd6', name: 'EXCH-01', type: 'Exchange Server', ip: '10.0.1.15', os: 'Windows Server 2019', status: 'online', ports: [25, 443, 587], services: ['SMTP', 'HTTPS', 'Submission'], risk: 'high' },
  ],
  endpoints: [
    { id: 'e1', name: 'WS-FIN-042', type: 'Workstation', ip: '10.0.10.42', os: 'Windows 11 Pro', status: 'online', ports: [135, 445], services: ['RPC', 'SMB'], risk: 'high' },
    { id: 'e2', name: 'WS-HR-015', type: 'Workstation', ip: '10.0.10.15', os: 'Windows 11 Pro', status: 'online', ports: [135, 445], services: ['RPC', 'SMB'], risk: 'medium' },
    { id: 'e3', name: 'WS-IT-001', type: 'Workstation', ip: '10.0.10.1', os: 'Windows 11 Pro', status: 'online', ports: [135, 445, 3389], services: ['RPC', 'SMB', 'RDP'], risk: 'medium' },
    { id: 'e4', name: 'LPT-EXEC-003', type: 'Laptop', ip: '10.0.11.3', os: 'macOS Sonoma', status: 'offline', ports: [], services: [], risk: 'low' },
  ],
  peripherals: [
    { id: 'p1', name: 'FW-EDGE-01', type: 'Firewall', ip: '10.0.0.1', status: 'online', ports: [443, 8443], services: ['HTTPS Mgmt', 'VPN'], risk: 'critical' },
    { id: 'p2', name: 'SW-CORE-01', type: 'Core Switch', ip: '10.0.0.2', status: 'online', ports: [22, 443], services: ['SSH', 'HTTPS'], risk: 'high' },
    { id: 'p3', name: 'WAF-01', type: 'Web App Firewall', ip: '10.0.0.5', status: 'online', ports: [443, 8443], services: ['HTTPS', 'Mgmt'], risk: 'high' },
    { id: 'p4', name: 'IDS-01', type: 'IDS/IPS', ip: '10.0.0.6', status: 'online', ports: [443], services: ['HTTPS Mgmt'], risk: 'medium' },
  ],
  cloud: [
    { id: 'c1', name: 'AWS Account (Prod)', type: 'AWS', ip: 'aws:123456789012', status: 'online', ports: [], services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudTrail'], risk: 'high' },
    { id: 'c2', name: 'Azure Tenant', type: 'Azure', ip: 'azure:tenant-abc-123', status: 'online', ports: [], services: ['Azure AD', 'VMs', 'Storage', 'Key Vault'], risk: 'critical' },
    { id: 'c3', name: 'O365 Tenant', type: 'Office 365', ip: 'o365:tenant-abc-123', status: 'online', ports: [], services: ['Exchange Online', 'SharePoint', 'Teams', 'OneDrive'], risk: 'high' },
  ],
  internet: [
    { id: 'i1', name: 'mail.company.com', type: 'SMTP Gateway', ip: '203.0.113.10', status: 'online', ports: [25, 443, 587], services: ['SMTP', 'HTTPS', 'Submission'], risk: 'high' },
    { id: 'i2', name: 'vpn.company.com', type: 'VPN Gateway', ip: '203.0.113.11', status: 'online', ports: [443, 1194], services: ['HTTPS', 'OpenVPN'], risk: 'critical' },
    { id: 'i3', name: 'app.company.com', type: 'Web Application', ip: '203.0.113.20', status: 'online', ports: [80, 443], services: ['HTTP', 'HTTPS'], risk: 'high' },
    { id: 'i4', name: 'api.company.com', type: 'REST API', ip: '203.0.113.21', status: 'online', ports: [443], services: ['HTTPS'], risk: 'medium' },
    { id: 'i5', name: 'ftp.company.com', type: 'FTP Server', ip: '203.0.113.30', status: 'filtered', ports: [21, 990], services: ['FTP', 'FTPS'], risk: 'high' },
  ],
};

/**
 * Connector Configuration Page
 */
export default function ConnectorConfigPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'cloud' | 'peripherals' | 'collector' | 'discovery'>('endpoints');
  const [configuredConnectors, setConfiguredConnectors] = useState<Set<ConnectorType>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(null);
  const [authMethod, setAuthMethod] = useState<'credentials' | 'certificate' | 'ssh_key'>('credentials');
  const [collectorModalOpen, setCollectorModalOpen] = useState(false);
  const [collectorPlatform, setCollectorPlatform] = useState<'windows' | 'linux'>('windows');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [collectorBuilt, setCollectorBuilt] = useState(false);
  const [buildingCollector, setBuildingCollector] = useState(false);

  // Tags state per connector
  const [connectorTags, setConnectorTags] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState('');
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);

  // Auto-Discovery state
  const [discoveryCategory, setDiscoveryCategory] = useState<'servers' | 'endpoints' | 'peripherals' | 'cloud' | 'internet'>('servers');
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResult[]>([]);
  const [discoveryDomain, setDiscoveryDomain] = useState('');
  const [discoveryIPRange, setDiscoveryIPRange] = useState('');
  const [expandedDiscovery, setExpandedDiscovery] = useState<string | null>(null);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/incident');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/validation');
  };

  const handleConfigureConnector = (connectorType: ConnectorType) => {
    setSelectedConnector(connectorType);
    setModalOpen(true);
  };

  const handleSaveConnector = () => {
    if (selectedConnector) {
      setConfiguredConnectors(new Set([...configuredConnectors, selectedConnector]));
    }
    setModalOpen(false);
    setSelectedConnector(null);
  };

  const handleAddTag = (connectorKey: string) => {
    if (tagInput.trim()) {
      const existing = connectorTags[connectorKey] || [];
      if (!existing.includes(tagInput.trim())) {
        setConnectorTags({ ...connectorTags, [connectorKey]: [...existing, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (connectorKey: string, tag: string) => {
    const existing = connectorTags[connectorKey] || [];
    setConnectorTags({ ...connectorTags, [connectorKey]: existing.filter((t) => t !== tag) });
  };

  const handleRunDiscovery = () => {
    setDiscoveryRunning(true);
    setDiscoveryResults([]);
    setTimeout(() => {
      setDiscoveryResults(MOCK_DISCOVERY_RESULTS[discoveryCategory] || []);
      setDiscoveryRunning(false);
    }, 3000);
  };

  const getConnectorIcon = (type: ConnectorType) => {
    const icons: Record<ConnectorType, React.ReactNode> = {
      windows: <Monitor className="w-6 h-6" />,
      linux: <Terminal className="w-6 h-6" />,
      macos: <Apple className="w-6 h-6" />,
      aws: <Cloud className="w-6 h-6" />,
      azure: <Cloud className="w-6 h-6" />,
      gcp: <Cloud className="w-6 h-6" />,
      o365: <Mail className="w-6 h-6" />,
      gsuite: <Mail className="w-6 h-6" />,
      firewall: <Shield className="w-6 h-6" />,
      storage: <HardDrive className="w-6 h-6" />,
      email_gateway: <MailWarning className="w-6 h-6" />,
      proxy_waf: <Globe className="w-6 h-6" />,
    };
    return icons[type];
  };

  const currentCategory = CONNECTOR_CATEGORIES.find((c) => c.id === activeTab);

  return (
    <PageContainer
      title="Connector Configuration"
      subtitle="Configure data sources for forensic analysis"
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Incident"
          onContinue={handleContinue}
          continueLabel="Continue"
          middleContent={
            <span className="text-sm text-slate-500">
              {configuredConnectors.size} connector{configuredConnectors.size !== 1 ? 's' : ''} configured
            </span>
          }
        />
      }
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {CONNECTOR_CATEGORIES.map((category) => (
          <Tooltip key={category.id} content={category.description}>
            <button
              onClick={() => setActiveTab(category.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                activeTab === category.id
                  ? 'border-forensic-500 text-forensic-600 dark:text-forensic-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {category.name}
            </button>
          </Tooltip>
        ))}
        <Tooltip content="Agentless collection via portable tools or disk images">
          <button
            onClick={() => setActiveTab('collector')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === 'collector'
                ? 'border-forensic-500 text-forensic-600 dark:text-forensic-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            Agentless / Offline
          </button>
        </Tooltip>
        <Tooltip content="Auto-discover servers, endpoints, peripherals, cloud, and internet-facing assets">
          <button
            onClick={() => setActiveTab('discovery')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'discovery'
                ? 'border-forensic-500 text-forensic-600 dark:text-forensic-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <Radar className="w-3.5 h-3.5" />
            Auto-Discovery
          </button>
        </Tooltip>
      </div>

      {/* Connector Grid - Existing connectors */}
      {activeTab !== 'collector' && activeTab !== 'discovery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCategory?.connectors.map((connectorType) => {
            const info = CONNECTOR_INFO[connectorType];
            const isConfigured = configuredConnectors.has(connectorType);

            return (
              <ConnectorCard
                key={connectorType}
                type={connectorType}
                name={info.name}
                description={info.description}
                icon={getConnectorIcon(connectorType)}
                isConfigured={isConfigured}
                onConfigure={() => handleConfigureConnector(connectorType)}
                tags={connectorTags[connectorType] || []}
                isEditingTags={editingTagsFor === connectorType}
                onToggleEditTags={() => setEditingTagsFor(editingTagsFor === connectorType ? null : connectorType)}
                tagInput={editingTagsFor === connectorType ? tagInput : ''}
                onTagInputChange={(v) => setTagInput(v)}
                onAddTag={() => handleAddTag(connectorType)}
                onRemoveTag={(tag) => handleRemoveTag(connectorType, tag)}
              />
            );
          })}
        </div>
      )}

      {/* Agentless / Offline Tab */}
      {activeTab === 'collector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Portable Collector Card */}
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-forensic-400 dark:hover:border-forensic-500 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-forensic-100 dark:bg-forensic-900/30 rounded-lg">
                  <Package className="w-8 h-8 text-forensic-600 dark:text-forensic-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Craft Portable Collector
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 mb-3">
                    Build a lightweight executable that collects forensic artifacts without installing an agent. Run on any Windows or Linux system via USB or network share.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">No Installation</span>
                    <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full">USB Portable</span>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full">Customizable</span>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Configure and build a portable forensic collector">
                      <Button size="sm" onClick={() => setCollectorModalOpen(true)} leftIcon={<Settings className="w-4 h-4" />}>
                        Configure & Build
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>

            {/* Disk Image Upload Card */}
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-forensic-400 dark:hover:border-forensic-500 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Server className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Upload Disk Image
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 mb-3">
                    Upload VM disk images or forensic images for triage without connecting to live systems. Supports VMDK, VHD, VHDX, E01, RAW, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">VMDK</span>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">VHD/VHDX</span>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">E01</span>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">RAW/DD</span>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Upload a forensic disk image for offline analysis">
                      <Button size="sm" onClick={() => setImageModalOpen(true)} leftIcon={<Upload className="w-4 h-4" />}>
                        Upload Image
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Uploaded Images List */}
          {uploadedImages.length > 0 && (
            <Card>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Uploaded Images ({uploadedImages.length})</h4>
              <div className="space-y-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <HardDrive className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{img}</p>
                      <p className="text-xs text-slate-500">VMDK &middot; 42.5 GB &middot; Uploaded just now</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Ready for triage</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Auto-Discovery Tab */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          {/* Discovery Configuration */}
          <Card className="bg-gradient-to-br from-forensic-50 to-white dark:from-forensic-900/20 dark:to-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-forensic-100 dark:bg-forensic-900/30 rounded-lg">
                <Radar className="w-6 h-6 text-forensic-600 dark:text-forensic-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Auto-Discovery</h2>
                <p className="text-sm text-slate-500">Discover assets automatically based on domain, IP ranges, and credentials</p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Domain / Tenant</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., company.com or Azure Tenant ID"
                  value={discoveryDomain}
                  onChange={(e) => setDiscoveryDomain(e.target.value)}
                />
              </div>
              <div>
                <label className="label">IP Range / CIDR</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 10.0.0.0/16 or 192.168.1.0/24"
                  value={discoveryIPRange}
                  onChange={(e) => setDiscoveryIPRange(e.target.value)}
                />
              </div>
            </div>

            {/* Discovery Category Selection */}
            <div className="mb-4">
              <label className="label mb-2 block">Discovery Scope</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {([
                  { id: 'servers', label: 'Servers', icon: <Server className="w-4 h-4" />, desc: 'DCs, File Servers, DBs' },
                  { id: 'endpoints', label: 'Endpoints', icon: <Monitor className="w-4 h-4" />, desc: 'Workstations, Laptops' },
                  { id: 'peripherals', label: 'Peripherals', icon: <Shield className="w-4 h-4" />, desc: 'Firewalls, Switches, IDS' },
                  { id: 'cloud', label: 'Cloud Services', icon: <Cloud className="w-4 h-4" />, desc: 'AWS, Azure, O365, GCP' },
                  { id: 'internet', label: 'Internet-Facing', icon: <Globe className="w-4 h-4" />, desc: 'Public IPs & Services' },
                ] as const).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDiscoveryCategory(cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors',
                      discoveryCategory === cat.id
                        ? 'border-forensic-500 bg-forensic-50 text-forensic-700 dark:bg-forensic-900/20 dark:text-forensic-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {cat.icon}
                    {cat.label}
                    <span className="text-[10px] text-slate-400 font-normal">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials for Discovery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Username / Access Key</label>
                <input type="text" className="input" placeholder="Discovery account credentials" />
              </div>
              <div>
                <label className="label">Password / Secret Key</label>
                <input type="password" className="input" placeholder="Authentication secret" />
              </div>
              <div className="flex items-end">
                <Tooltip content={`Run discovery scan for ${discoveryCategory}`}>
                  <Button
                    onClick={handleRunDiscovery}
                    isLoading={discoveryRunning}
                    leftIcon={<Scan className="w-4 h-4" />}
                    className="w-full"
                  >
                    {discoveryRunning ? 'Scanning...' : 'Run Discovery'}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Discovery Progress */}
          {discoveryRunning && (
            <Card className="border-forensic-200 dark:border-forensic-800">
              <div className="flex items-center gap-3 p-2">
                <Loader2 className="w-5 h-5 animate-spin text-forensic-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Scanning network for {discoveryCategory}...</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Sending probes</span>
                    <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Resolving hostnames</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Fingerprinting services</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Discovery Results */}
          {discoveryResults.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-forensic-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Discovery Results — {discoveryResults.length} assets found
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" leftIcon={<Download className="w-3 h-3" />}>Export</Button>
                  <Button size="sm" leftIcon={<Settings className="w-3 h-3" />}>Configure All</Button>
                </div>
              </div>

              <div className="space-y-2">
                {discoveryResults.map((result) => (
                  <div key={result.id} className={cn(
                    'border rounded-lg transition-all',
                    result.risk === 'critical' ? 'border-red-200 dark:border-red-900/50' :
                    result.risk === 'high' ? 'border-orange-200 dark:border-orange-900/50' :
                    'border-slate-200 dark:border-slate-700'
                  )}>
                    <button
                      onClick={() => setExpandedDiscovery(expandedDiscovery === result.id ? null : result.id)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        result.status === 'online' ? 'bg-green-500' :
                        result.status === 'filtered' ? 'bg-yellow-500' : 'bg-slate-300'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{result.name}</span>
                          <span className="text-xs text-slate-400">{result.type}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{result.ip}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          result.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          result.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          result.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        )}>{result.risk}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs',
                          result.status === 'online' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          result.status === 'filtered' ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-100 text-slate-400'
                        )}>{result.status}</span>
                        {expandedDiscovery === result.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {expandedDiscovery === result.id && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2 text-xs">
                          {result.os && (
                            <div className="flex gap-2"><span className="text-slate-500 w-20">OS:</span><span className="text-slate-700 dark:text-slate-300">{result.os}</span></div>
                          )}
                          <div className="flex gap-2"><span className="text-slate-500 w-20">Open Ports:</span><span className="font-mono text-slate-700 dark:text-slate-300">{result.ports.length > 0 ? result.ports.join(', ') : 'N/A (Cloud)'}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500 w-20">Services:</span><span className="text-slate-700 dark:text-slate-300">{result.services.join(', ')}</span></div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" leftIcon={<Settings className="w-3 h-3" />}>Configure Connector</Button>
                            <Button size="sm" variant="ghost" leftIcon={<Tag className="w-3 h-3" />}>Add Tags</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!discoveryRunning && discoveryResults.length === 0 && (
            <Card className="text-center py-12">
              <Radar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Configure domain, IP range, and credentials above, then run discovery</p>
              <p className="text-slate-400 text-xs mt-1">Scans for servers, endpoints, peripherals, cloud services, and internet-facing assets</p>
            </Card>
          )}
        </div>
      )}

      {/* Configuration Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Configure ${selectedConnector ? CONNECTOR_INFO[selectedConnector].name : ''}`}
        description="Enter connection details for this data source"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Tooltip content="Verify connectivity to this system (simulated)">
              <Button variant="outline">Test Connection</Button>
            </Tooltip>
            <Button onClick={handleSaveConnector}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Hostname / IP</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., 10.0.1.10 or server.domain.com"
            />
          </div>

          {/* Authentication Method Selection */}
          <div>
            <label className="label mb-2 block">Authentication Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAuthMethod('credentials')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors',
                  authMethod === 'credentials'
                    ? 'border-forensic-500 bg-forensic-50 text-forensic-700 dark:bg-forensic-900/20 dark:text-forensic-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                )}
              >
                <KeyRound className="w-4 h-4" />
                Credentials
              </button>
              <button
                onClick={() => setAuthMethod('certificate')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors',
                  authMethod === 'certificate'
                    ? 'border-forensic-500 bg-forensic-50 text-forensic-700 dark:bg-forensic-900/20 dark:text-forensic-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                )}
              >
                <FileKey className="w-4 h-4" />
                Certificate
              </button>
              <button
                onClick={() => setAuthMethod('ssh_key')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors',
                  authMethod === 'ssh_key'
                    ? 'border-forensic-500 bg-forensic-50 text-forensic-700 dark:bg-forensic-900/20 dark:text-forensic-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                )}
              >
                <Terminal className="w-4 h-4" />
                SSH Key
              </button>
            </div>
          </div>

          {/* Credentials fields */}
          {authMethod === 'credentials' && (
            <>
              <div>
                <label className="label">Username</label>
                <input type="text" className="input" placeholder="Service account username" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Service account password" />
              </div>
            </>
          )}

          {/* Certificate fields */}
          {authMethod === 'certificate' && (
            <>
              <div>
                <label className="label">Certificate File (.pem, .pfx, .p12)</label>
                <div className={cn(
                  'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer',
                  'border-slate-300 dark:border-slate-600',
                  'hover:border-forensic-400 dark:hover:border-forensic-500',
                  'transition-colors duration-200'
                )}>
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500">
                    Drag & drop or <span className="text-forensic-500 font-medium">browse</span> certificate file
                  </p>
                  <input type="file" accept=".pem,.pfx,.p12,.cer,.crt" className="hidden" />
                </div>
              </div>
              <div>
                <label className="label">Certificate Password (if applicable)</label>
                <input type="password" className="input" placeholder="Private key passphrase" />
              </div>
              <div>
                <label className="label">CA Bundle (optional)</label>
                <input type="text" className="input" placeholder="Path to CA bundle or paste CA cert" />
              </div>
            </>
          )}

          {/* SSH Key fields */}
          {authMethod === 'ssh_key' && (
            <>
              <div>
                <label className="label">Username</label>
                <input type="text" className="input" placeholder="SSH username (e.g., root, forensic-svc)" />
              </div>
              <div>
                <label className="label">SSH Private Key</label>
                <div className={cn(
                  'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer',
                  'border-slate-300 dark:border-slate-600',
                  'hover:border-forensic-400 dark:hover:border-forensic-500',
                  'transition-colors duration-200'
                )}>
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500">
                    Upload <span className="text-forensic-500 font-medium">id_rsa</span>, <span className="text-forensic-500 font-medium">id_ed25519</span>, or other key file
                  </p>
                  <input type="file" accept=".pem,.key,.pub" className="hidden" />
                </div>
              </div>
              <div>
                <label className="label">Key Passphrase (if applicable)</label>
                <input type="password" className="input" placeholder="SSH key passphrase" />
              </div>
              <div>
                <label className="label">SSH Port</label>
                <input type="number" className="input" placeholder="22" defaultValue={22} />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="mockMode" className="rounded" defaultChecked />
            <label htmlFor="mockMode" className="text-sm text-slate-600 dark:text-slate-400">
              Use simulated data for demo
            </label>
          </div>
        </div>
      </Modal>

      {/* Portable Collector Modal */}
      <Modal
        open={collectorModalOpen}
        onOpenChange={setCollectorModalOpen}
        title="Craft Portable Collector"
        description="Build a lightweight forensic collector for offline triage"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCollectorModalOpen(false)}>
              Cancel
            </Button>
            <Tooltip content="Generate a portable collector package">
              <Button
                onClick={() => {
                  setBuildingCollector(true);
                  setTimeout(() => {
                    setBuildingCollector(false);
                    setCollectorBuilt(true);
                  }, 2000);
                }}
                isLoading={buildingCollector}
                leftIcon={<Package className="w-4 h-4" />}
              >
                Build Collector
              </Button>
            </Tooltip>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Target Platform</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCollectorPlatform('windows')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                  collectorPlatform === 'windows'
                    ? 'border-forensic-500 bg-forensic-50 dark:bg-forensic-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <Monitor className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-sm font-medium">Windows</p>
                  <p className="text-xs text-slate-500">.exe portable</p>
                </div>
              </button>
              <button
                onClick={() => setCollectorPlatform('linux')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                  collectorPlatform === 'linux'
                    ? 'border-forensic-500 bg-forensic-50 dark:bg-forensic-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <Terminal className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-sm font-medium">Linux</p>
                  <p className="text-xs text-slate-500">Shell script / binary</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Collection Scope</label>
            <div className="space-y-2">
              {[
                { id: 'evtlogs', label: 'Event Logs / Syslog', checked: true },
                { id: 'registry', label: collectorPlatform === 'windows' ? 'Registry Hives' : 'Config Files (/etc)', checked: true },
                { id: 'filesystem', label: 'File System Metadata (MFT / Inodes)', checked: true },
                { id: 'memory', label: 'Memory Dump (RAM)', checked: false },
                { id: 'network', label: 'Network Connections & ARP Table', checked: true },
                { id: 'processes', label: 'Running Processes & Services', checked: true },
                { id: 'persistence', label: 'Persistence Mechanisms (Startup, Cron, Tasks)', checked: true },
                { id: 'browser', label: 'Browser Artifacts', checked: false },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="rounded" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Output Format</label>
            <select className="input" defaultValue="zip">
              <option value="zip">ZIP Archive (compressed)</option>
              <option value="tar">TAR.GZ Archive</option>
              <option value="raw">Raw directory structure</option>
            </select>
          </div>

          {collectorBuilt && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Collector Ready</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                {collectorPlatform === 'windows' ? 'forensic-collector-win-x64.exe' : 'forensic-collector-linux-x64.sh'} (2.4 MB)
              </p>
              <Button size="sm" variant="outline" leftIcon={<Download className="w-3 h-3" />}>
                Download Collector
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        title="Upload Disk Image"
        description="Upload a forensic disk image for offline triage analysis"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setImageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUploadedImages([...uploadedImages, 'server-backup-2024.vmdk']);
                setImageModalOpen(false);
              }}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload & Analyze
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Supported Formats</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { format: 'VMDK', desc: 'VMware disk' },
                { format: 'VHD', desc: 'Hyper-V (Gen1)' },
                { format: 'VHDX', desc: 'Hyper-V (Gen2)' },
                { format: 'E01', desc: 'EnCase image' },
                { format: 'RAW/DD', desc: 'Raw disk image' },
                { format: 'QCOW2', desc: 'QEMU disk' },
                { format: 'OVA', desc: 'Open Virtual' },
                { format: 'ISO', desc: 'Disk image' },
              ].map((item) => (
                <div key={item.format} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs">
                  <HardDrive className="w-3 h-3 text-slate-400" />
                  <span className="font-medium">{item.format}</span>
                  <span className="text-slate-400">- {item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Disk Image File</label>
            <div className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
              'border-slate-300 dark:border-slate-600',
              'hover:border-forensic-400 dark:hover:border-forensic-500',
              'transition-colors duration-200'
            )}>
              <HardDriveDownload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag & Drop or <span className="text-forensic-500 font-medium">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                VMDK, VHD, VHDX, E01, RAW, QCOW2, OVA, ISO
              </p>
              <input type="file" accept=".vmdk,.vhd,.vhdx,.e01,.dd,.raw,.qcow2,.ova,.iso" className="hidden" />
            </div>
          </div>

          <div>
            <label className="label">Image Description</label>
            <input type="text" className="input" placeholder="e.g., Finance Server backup from Jan 15" />
          </div>

          <div>
            <label className="label">Source System Hostname (optional)</label>
            <input type="text" className="input" placeholder="e.g., FS-FINANCE-01" />
          </div>

          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <label className="label">Uploaded Images</label>
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 dark:text-green-300">{img}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
}

/**
 * Connector Card Component with Tags
 */
interface ConnectorCardProps {
  type: ConnectorType;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConfigured: boolean;
  onConfigure: () => void;
  tags: string[];
  isEditingTags: boolean;
  onToggleEditTags: () => void;
  tagInput: string;
  onTagInputChange: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

function ConnectorCard({
  name,
  description,
  icon,
  isConfigured,
  onConfigure,
  tags,
  isEditingTags,
  onToggleEditTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: ConnectorCardProps) {
  return (
    <Card className={cn(isConfigured && 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900')}>
      <div className="flex items-start gap-3">
        <div className={cn('text-slate-400', isConfigured && 'text-green-500')}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              {name}
            </h4>
            {isConfigured && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{description}</p>

          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-forensic-50 dark:bg-forensic-900/20 text-forensic-600 dark:text-forensic-400 text-xs rounded-full border border-forensic-200 dark:border-forensic-800"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveTag(tag); }}
                    className="hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Edit Inline */}
          {isEditingTags && (
            <div className="flex items-center gap-1 mt-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); }}}
                placeholder="Add tag..."
                className="flex-1 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-forensic-400"
              />
              <Button size="sm" variant="ghost" onClick={onAddTag}>
                <CheckCircle className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Tooltip content="Open configuration form for this data source">
          <Button
            size="sm"
            variant={isConfigured ? 'secondary' : 'primary'}
            onClick={onConfigure}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            {isConfigured ? 'Reconfigure' : 'Configure'}
          </Button>
        </Tooltip>
        <Tooltip content="Add tags to categorize this resource">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleEditTags}
            leftIcon={<Tag className="w-3.5 h-3.5" />}
          >
            Tags
          </Button>
        </Tooltip>
        <Tooltip content="Use simulated data instead of real connection">
          <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer ml-auto">
            <input type="checkbox" defaultChecked className="rounded w-3 h-3" />
            Mock
          </label>
        </Tooltip>
      </div>
    </Card>
  );
}
