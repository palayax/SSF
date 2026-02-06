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
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ConnectorType } from '@/types';

/**
 * Connector Configuration Page
 *
 * Configure data source connectors:
 * - Endpoints (Windows, Linux, macOS)
 * - Cloud Services (AWS, Azure, GCP, O365, GSuite)
 * - Peripherals (Firewall, Storage, Email Gateway, Proxy/WAF)
 */
export default function ConnectorConfigPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'cloud' | 'peripherals' | 'collector'>('endpoints');
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
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        {CONNECTOR_CATEGORIES.map((category) => (
          <Tooltip key={category.id} content={category.description}>
            <button
              onClick={() => setActiveTab(category.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
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
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'collector'
                ? 'border-forensic-500 text-forensic-600 dark:text-forensic-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            Agentless / Offline
          </button>
        </Tooltip>
      </div>

      {/* Connector Grid - Existing connectors */}
      {activeTab !== 'collector' && (
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
 * Connector Card Component
 */
interface ConnectorCardProps {
  type: ConnectorType;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConfigured: boolean;
  onConfigure: () => void;
}

function ConnectorCard({
  name,
  description,
  icon,
  isConfigured,
  onConfigure,
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
        <Tooltip content="Use simulated data instead of real connection">
          <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded w-3 h-3" />
            Mock
          </label>
        </Tooltip>
      </div>
    </Card>
  );
}
