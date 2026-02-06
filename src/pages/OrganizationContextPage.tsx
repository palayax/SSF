import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Github,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Server,
  Network,
  Shield,
  Clock,
  Users,
  KeyRound,
  Building2,
  UserCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardHeader, Tooltip } from '@/components/common';
import { PageContainer, PageNavigation, EmptyState } from '@/components/layout';
import { useSessionStore, useContextStore } from '@/store';
import { formatFileSize } from '@/utils/formatters';
import { DOCUMENT_TYPE_INFO, REPOSITORY_TYPE_INFO } from '@/utils/constants';
import type { UploadedDocument } from '@/types';
import { useCallback, useRef, useState } from 'react';

/**
 * Organization Context Page
 *
 * Allows users to:
 * - Upload documents (BIA, BCP, Network Diagrams, GRC docs)
 * - Connect to repositories (GitHub, GitLab, SharePoint)
 * - View extracted context (systems, networks, processes)
 */
export default function OrganizationContextPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();
  const {
    documents,
    repositories,
    extractedEntities,
    addDocument,
    removeDocument,
  } = useContextStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/incident');
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        await addDocument(file);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addDocument]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;

      for (const file of Array.from(files)) {
        await addDocument(file);
      }
    },
    [addDocument]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const totalSystems = extractedEntities.systems.length;
  const totalNetworks = extractedEntities.networks.length;
  const totalProcesses = extractedEntities.processes.length;
  const totalCompliance = extractedEntities.compliance.length;

  return (
    <PageContainer
      title="Organization Context"
      subtitle="Upload documents to help AI understand your environment"
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Dashboard"
          onContinue={handleContinue}
          continueLabel="Continue"
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Document Upload Section */}
        <Card>
          <CardHeader
            title="Upload Documents"
            description="Drag and drop or browse files"
          />
          <div className="mt-4">
            <Tooltip content="Drag and drop files or click to browse. Supports PDF, DOCX, XLSX, JSON, YAML, Visio">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
                  'border-slate-300 dark:border-slate-600',
                  'hover:border-forensic-400 dark:hover:border-forensic-500',
                  'transition-colors duration-200'
                )}
              >
                <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag & Drop or{' '}
                  <span className="text-forensic-500 font-medium">Browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, DOCX, XLSX, JSON, YAML, Visio
                </p>
              </div>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.json,.yaml,.yml,.vsdx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>

        {/* Repository Connection Section */}
        <Card>
          <CardHeader
            title="Connect Repository"
            description="Access documentation from code repos"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['github', 'gitlab', 'sharepoint', 'bitbucket'] as const).map(
              (repoType) => {
                const info = REPOSITORY_TYPE_INFO[repoType];
                const isConnected = repositories.some(
                  (r) => r.type === repoType && r.status === 'connected'
                );

                return (
                  <Tooltip
                    key={repoType}
                    content={`Connect to ${info.name} for infrastructure documentation`}
                  >
                    <button
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border',
                        'transition-colors duration-200',
                        isConnected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-forensic-400'
                      )}
                    >
                      <Github className="w-5 h-5" />
                      <span className="text-sm font-medium">{info.name}</span>
                      {isConnected && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </button>
                  </Tooltip>
                );
              }
            )}
          </div>
        </Card>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Uploaded Documents ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                onRemove={() => removeDocument(doc.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Extracted Context Summary */}
      {(totalSystems > 0 ||
        totalNetworks > 0 ||
        totalProcesses > 0 ||
        totalCompliance > 0) && (
        <section>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Extracted Context
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ContextSummaryCard
              icon={<Server className="w-5 h-5" />}
              label="Systems"
              count={totalSystems}
              tooltip="Systems, servers, and workstations identified"
            />
            <ContextSummaryCard
              icon={<Network className="w-5 h-5" />}
              label="Networks"
              count={totalNetworks}
              tooltip="Network segments and VLANs identified"
            />
            <ContextSummaryCard
              icon={<Clock className="w-5 h-5" />}
              label="Processes"
              count={totalProcesses}
              tooltip="Critical business processes identified"
            />
            <ContextSummaryCard
              icon={<Shield className="w-5 h-5" />}
              label="Compliance"
              count={totalCompliance}
              tooltip="Compliance requirements identified"
            />
          </div>
        </section>
      )}

      {/* IAM - Identity & Access Management */}
      {(totalSystems > 0 || documents.length > 0) && (
        <section className="mt-8 mb-8">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Identity & Access Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <IAMCube
              icon={<Users className="w-6 h-6" />}
              title="Active Directory"
              subtitle="On-Premises AD"
              status="detected"
              details={[
                { label: 'Domain Controllers', value: '2 detected' },
                { label: 'Forest', value: 'corp.local' },
                { label: 'Functional Level', value: '2016' },
                { label: 'User Accounts', value: '~1,250' },
                { label: 'Service Accounts', value: '~45' },
                { label: 'Group Policies', value: '38 linked' },
              ]}
            />
            <IAMCube
              icon={<KeyRound className="w-6 h-6" />}
              title="Azure AD / Entra ID"
              subtitle="Cloud Identity"
              status="detected"
              details={[
                { label: 'Tenant', value: 'company.onmicrosoft.com' },
                { label: 'Synced Users', value: '~1,180' },
                { label: 'Cloud-Only Users', value: '~70' },
                { label: 'MFA Enforced', value: '62%' },
                { label: 'Conditional Access', value: '8 policies' },
                { label: 'App Registrations', value: '24' },
              ]}
            />
            <IAMCube
              icon={<Building2 className="w-6 h-6" />}
              title="Hybrid Identity"
              subtitle="AD Connect Sync"
              status="synced"
              details={[
                { label: 'Sync Status', value: 'Healthy' },
                { label: 'Last Sync', value: '12 min ago' },
                { label: 'Sync Method', value: 'Password Hash' },
                { label: 'Privileged Roles', value: '15 Global Admins' },
                { label: 'Guest Accounts', value: '34' },
                { label: 'Stale Accounts (90d)', value: '127' },
              ]}
            />
          </div>
        </section>
      )}

      {/* Empty State */}
      {documents.length === 0 && repositories.length === 0 && (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No context uploaded yet"
          description="Upload documents or connect repositories to provide organizational context for better analysis."
        />
      )}
    </PageContainer>
  );
}

/**
 * Document Item Component
 */
interface DocumentItemProps {
  document: UploadedDocument;
  onRemove: () => void;
}

function DocumentItem({ document, onRemove }: DocumentItemProps) {
  const typeInfo = DOCUMENT_TYPE_INFO[document.type] || {
    name: 'File',
    icon: 'FileText',
    color: 'text-slate-500',
  };

  const statusIcons = {
    uploading: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    parsing: <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />,
    parsed: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  const statusLabels = {
    uploading: 'Uploading...',
    parsing: 'Parsing...',
    parsed: 'Parsed',
    error: 'Error',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-slate-50 dark:bg-slate-800/50',
        'border border-slate-200 dark:border-slate-700'
      )}
    >
      <FileText className={cn('w-5 h-5', typeInfo.color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {document.filename}
        </p>
        <p className="text-xs text-slate-500">
          {formatFileSize(document.size)} &middot;{' '}
          <span className="capitalize">{typeInfo.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content={`Document is being analyzed to extract context`}>
          <div className="flex items-center gap-1">
            {statusIcons[document.status]}
            <span className="text-xs text-slate-500">{statusLabels[document.status]}</span>
          </div>
        </Tooltip>
        {document.status === 'parsed' && (
          <Tooltip content="Preview extracted data">
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
              <Eye className="w-4 h-4 text-slate-500" />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Remove document">
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * Context Summary Card
 */
interface ContextSummaryCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  tooltip: string;
}

function ContextSummaryCard({
  icon,
  label,
  count,
  tooltip,
}: ContextSummaryCardProps) {
  return (
    <Tooltip content={tooltip}>
      <Card className="text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-forensic-500">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {count}
            </p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      </Card>
    </Tooltip>
  );
}

/**
 * IAM Cube Component - 3D-style card for identity providers
 */
interface IAMCubeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: 'detected' | 'synced' | 'error' | 'not_found';
  details: { label: string; value: string }[];
}

function IAMCube({ icon, title, subtitle, status, details }: IAMCubeProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    detected: 'border-green-400 dark:border-green-600',
    synced: 'border-blue-400 dark:border-blue-600',
    error: 'border-red-400 dark:border-red-600',
    not_found: 'border-slate-300 dark:border-slate-600',
  };

  const statusBadge = {
    detected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    synced: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    not_found: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  const statusLabel = {
    detected: 'Detected',
    synced: 'Synced',
    error: 'Error',
    not_found: 'Not Found',
  };

  return (
    <Card
      className={cn(
        'relative border-2 transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50',
        statusColors[status]
      )}
    >
      <div onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              status === 'detected' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
              status === 'synced' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            )}>
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {title}
              </h4>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadge[status])}>
              {statusLabel[status]}
            </span>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Quick stats preview */}
        {!expanded && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <UserCheck className="w-3 h-3" />
            <span>{details[0]?.value}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>{details[1]?.value}</span>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
            {details.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{detail.label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
