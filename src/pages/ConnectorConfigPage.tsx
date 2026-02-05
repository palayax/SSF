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
  const [activeTab, setActiveTab] = useState<'endpoints' | 'cloud' | 'peripherals'>('endpoints');
  const [configuredConnectors, setConfiguredConnectors] = useState<Set<ConnectorType>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(null);

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
      </div>

      {/* Connector Grid */}
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
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="Service account username"
            />
          </div>
          <div>
            <label className="label">Password / Key</label>
            <input
              type="password"
              className="input"
              placeholder="Service account password"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="mockMode" className="rounded" defaultChecked />
            <label htmlFor="mockMode" className="text-sm text-slate-600 dark:text-slate-400">
              Use simulated data for demo
            </label>
          </div>
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
