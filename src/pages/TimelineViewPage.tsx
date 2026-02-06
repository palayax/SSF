import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, Badge, SeverityBadge, SearchInput } from '@/components/common';
import {
  ZoomIn,
  ZoomOut,
  Filter,
  Calendar,
  Copy,
  X,
  Monitor,
  Cloud,
  Shield,
  Activity,
  UserX,
  Server,
  ArrowRight,
  Lock,
  Unlock,
  Network,
  Key,
  HardDrive,
  Mail,
  RotateCw,
  Skull,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTimestamp } from '@/utils/formatters';

// Mock timeline events
const MOCK_EVENTS = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T02:30:15'),
    source: 'windows_security',
    severity: 'critical' as const,
    title: 'Suspicious Process Execution',
    summary: 'PsExec.exe executed with SYSTEM privileges',
    category: 'process_execution',
    rawLog: 'EventID: 4688\nProcess Name: C:\\Windows\\System32\\PsExec.exe\nUser: NT AUTHORITY\\SYSTEM',
    relatedCount: 3,
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T02:31:00'),
    source: 'firewall',
    severity: 'high' as const,
    title: 'Outbound Connection to Known C2',
    summary: 'Connection to 185.220.101.42:443 blocked',
    category: 'network_connection',
    rawLog: 'Action: Block\nDirection: Outbound\nDest IP: 185.220.101.42\nDest Port: 443',
    relatedCount: 5,
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15T02:32:30'),
    source: 'windows_security',
    severity: 'medium' as const,
    title: 'Scheduled Task Created',
    summary: 'New scheduled task "WindowsUpdate" created',
    category: 'persistence',
    rawLog: 'Task Name: WindowsUpdate\nAction: C:\\Users\\Public\\update.exe\nTrigger: At startup',
    relatedCount: 1,
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15T02:35:00'),
    source: 'azure_activity',
    severity: 'high' as const,
    title: 'Bulk File Download',
    summary: '1,247 files downloaded from SharePoint',
    category: 'data_exfiltration',
    rawLog: 'Operation: FileDownloaded\nCount: 1247\nUser: jsmith@company.com',
    relatedCount: 2,
  },
  {
    id: '5',
    timestamp: new Date('2024-01-15T02:40:00'),
    source: 'windows_security',
    severity: 'critical' as const,
    title: 'Lateral Movement Detected',
    summary: 'Remote WMI execution on DC-MAIN-01',
    category: 'lateral_movement',
    rawLog: 'EventID: 4624\nLogon Type: 3\nTarget: DC-MAIN-01\nSource: ACCT-WS-042',
    relatedCount: 8,
  },
];

/**
 * Timeline View Page
 *
 * Interactive timeline visualization:
 * - Horizontal timeline with events
 * - Event markers by severity
 * - Drill-down to raw logs
 * - Correlation lines
 */
export default function TimelineViewPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();

  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAttackFlow, setShowAttackFlow] = useState(true);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/triage');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/verification');
  };

  const filteredEvents = MOCK_EVENTS.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceIcon = (source: string) => {
    if (source.includes('windows')) return <Monitor className="w-4 h-4" />;
    if (source.includes('azure') || source.includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (source.includes('firewall')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
      info: 'bg-blue-500',
    };
    return colors[severity] || colors.info;
  };

  return (
    <PageContainer
      title="Timeline View"
      subtitle="Interactive timeline of security events"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip content="Zoom out on timeline">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </Tooltip>
          <span className="text-sm text-slate-500">{Math.round(zoomLevel * 100)}%</span>
          <Tooltip content="Zoom in on timeline">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      }
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Triage"
          onContinue={handleContinue}
          continueLabel="Proceed to Review"
        />
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            tooltip="Search events by keyword"
          />
        </div>
        <Tooltip content="Filter by data source">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Source
          </Button>
        </Tooltip>
        <Tooltip content="Filter by severity level">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Severity
          </Button>
        </Tooltip>
        <Tooltip content="Filter events by date range">
          <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Date Range
          </Button>
        </Tooltip>
      </div>

      {/* Attack Flow Visualization */}
      <Card className="mb-6">
        <button
          onClick={() => setShowAttackFlow(!showAttackFlow)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">Attack Flow Visualization</span>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Live</span>
          </div>
          {showAttackFlow ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {showAttackFlow && (
          <div className="mt-4 space-y-6">
            {/* Attacker & Compromised Users Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attacker Profile */}
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <Skull className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm">Threat Actor</h4>
                    <p className="text-xs text-red-600 dark:text-red-400">External / Unknown Attribution</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-red-600 dark:text-red-400">Origin IP:</span><span className="font-mono text-red-800 dark:text-red-300">185.220.101.42</span></div>
                  <div className="flex justify-between"><span className="text-red-600 dark:text-red-400">C2 Server:</span><span className="font-mono text-red-800 dark:text-red-300">update-service.xyz:443</span></div>
                  <div className="flex justify-between"><span className="text-red-600 dark:text-red-400">Initial Vector:</span><span className="text-red-800 dark:text-red-300">Phishing Email</span></div>
                  <div className="flex justify-between"><span className="text-red-600 dark:text-red-400">Tools Used:</span><span className="text-red-800 dark:text-red-300">PsExec, Mimikatz, Cobalt Strike</span></div>
                </div>
              </div>

              {/* Compromised Users */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <UserX className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">Compromised Users</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400">3 accounts confirmed compromised</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { user: 'jsmith@company.com', type: 'Phished', access: 'Domain User + VPN', icon: <Mail className="w-3 h-3" /> },
                    { user: 'admin.jsmith', type: 'Credential Theft', access: 'Domain Admin', icon: <Key className="w-3 h-3" /> },
                    { user: 'svc-backup', type: 'Token Impersonation', access: 'Backup Operator', icon: <Server className="w-3 h-3" /> },
                  ].map((u, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-orange-500">{u.icon}</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 flex-1">{u.user}</span>
                      <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-[10px]">{u.type}</span>
                      <span className="text-slate-400">{u.access}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attack Chain Workflow */}
            <div className="relative">
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Attack Chain / Kill Chain</h4>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {[
                  { phase: 'Initial Access', icon: <Mail className="w-4 h-4" />, detail: 'Phishing Email', color: 'bg-red-500', time: '02:15' },
                  { phase: 'Execution', icon: <Activity className="w-4 h-4" />, detail: 'Macro → PowerShell', color: 'bg-red-600', time: '02:18' },
                  { phase: 'Persistence', icon: <RotateCw className="w-4 h-4" />, detail: 'Scheduled Task', color: 'bg-orange-500', time: '02:25' },
                  { phase: 'Priv. Escalation', icon: <Unlock className="w-4 h-4" />, detail: 'Mimikatz DCSync', color: 'bg-orange-600', time: '02:28' },
                  { phase: 'Lateral Movement', icon: <Network className="w-4 h-4" />, detail: 'PsExec → DC, FS', color: 'bg-yellow-500', time: '02:30' },
                  { phase: 'Collection', icon: <HardDrive className="w-4 h-4" />, detail: 'Finance Share', color: 'bg-yellow-600', time: '02:35' },
                  { phase: 'Exfiltration', icon: <Cloud className="w-4 h-4" />, detail: '1,247 files → C2', color: 'bg-purple-500', time: '02:35' },
                  { phase: 'Impact', icon: <Lock className="w-4 h-4" />, detail: 'Encryption Started', color: 'bg-red-700', time: '02:40' },
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex items-center">
                    <Tooltip content={`${step.phase}: ${step.detail} (${step.time})`}>
                      <div className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg min-w-[90px] transition-transform hover:scale-105',
                        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      )}>
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', step.color)}>
                          {step.icon}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{step.phase}</span>
                        <span className="text-[9px] text-slate-400 text-center">{step.detail}</span>
                        <span className="text-[9px] font-mono text-slate-400">{step.time}</span>
                      </div>
                    </Tooltip>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-0.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Resources */}
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Affected Resources</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'WS-FIN-042', role: 'Patient Zero', severity: 'critical', icon: <Monitor className="w-4 h-4" /> },
                  { name: 'DC-MAIN-01', role: 'Domain Controller', severity: 'critical', icon: <Server className="w-4 h-4" /> },
                  { name: 'FS-FINANCE-01', role: 'File Server', severity: 'high', icon: <HardDrive className="w-4 h-4" /> },
                  { name: 'BKP-SERVER-01', role: 'Backup Server', severity: 'high', icon: <Server className="w-4 h-4" /> },
                  { name: 'WEB-APP-01', role: 'Web Server', severity: 'medium', icon: <Cloud className="w-4 h-4" /> },
                  { name: 'EXCH-01', role: 'Exchange Server', severity: 'medium', icon: <Mail className="w-4 h-4" /> },
                  { name: 'PRINT-SRV-01', role: 'Print Server', severity: 'low', icon: <Server className="w-4 h-4" /> },
                  { name: 'VPN Gateway', role: 'Network Device', severity: 'high', icon: <Shield className="w-4 h-4" /> },
                ].map((res, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-2 rounded-lg border text-xs',
                      res.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50' :
                      res.severity === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/50' :
                      res.severity === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50' :
                      'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400">{res.icon}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{res.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{res.role}</span>
                      <span className={cn(
                        'px-1 py-0.5 rounded text-[10px] font-medium',
                        res.severity === 'critical' ? 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        res.severity === 'high' ? 'bg-orange-200 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                        'bg-yellow-200 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                      )}>{res.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader
              title="Event Timeline"
              description={`${filteredEvents.length} events • Jan 15, 2024`}
            />

            {/* Timeline visualization */}
            <div className="mt-6 relative">
              {/* Time axis */}
              <div className="flex justify-between text-xs text-slate-400 mb-4">
                <span>02:30</span>
                <span>02:35</span>
                <span>02:40</span>
                <span>02:45</span>
              </div>

              {/* Event lanes */}
              <div className="space-y-4">
                {['Windows', 'Cloud', 'Network'].map((lane) => (
                  <div key={lane} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-slate-500 text-right">{lane}</span>
                    <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded relative">
                      {filteredEvents
                        .filter((e) => {
                          if (lane === 'Windows') return e.source.includes('windows');
                          if (lane === 'Cloud') return e.source.includes('azure');
                          return e.source.includes('firewall');
                        })
                        .map((event) => (
                          <Tooltip key={event.id} content={event.title}>
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className={cn(
                                'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                                'transition-transform hover:scale-150',
                                'ring-2 ring-white dark:ring-slate-900',
                                getSeverityColor(event.severity),
                                selectedEvent?.id === event.id && 'ring-4 ring-forensic-400'
                              )}
                              style={{
                                left: `${((event.timestamp.getMinutes() - 30) / 15) * 100}%`,
                              }}
                            />
                          </Tooltip>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Correlation lines (simplified) */}
              <svg className="absolute inset-0 pointer-events-none opacity-30">
                <line
                  x1="20%"
                  y1="30%"
                  x2="40%"
                  y2="70%"
                  stroke="currentColor"
                  strokeDasharray="4"
                  className="text-forensic-500"
                />
              </svg>
            </div>

            {/* Event List */}
            <div className="mt-8 space-y-2">
              {filteredEvents.map((event) => (
                <EventListItem
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onClick={() => setSelectedEvent(event)}
                  sourceIcon={getSourceIcon(event.source)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Event Detail Panel */}
        <div>
          <Card className="sticky top-24 min-h-[500px]">
            {selectedEvent ? (
              <EventDetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500">Select an event to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * Event List Item
 */
interface EventListItemProps {
  event: typeof MOCK_EVENTS[0];
  isSelected: boolean;
  onClick: () => void;
  sourceIcon: React.ReactNode;
}

function EventListItem({ event, isSelected, onClick, sourceIcon }: EventListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-forensic-50 dark:bg-forensic-900/20 ring-1 ring-forensic-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      <span className="text-slate-400">{sourceIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {event.title}
        </p>
        <p className="text-xs text-slate-500 truncate">{event.summary}</p>
      </div>
      <div className="flex items-center gap-2">
        <SeverityBadge severity={event.severity} size="sm" />
        <span className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</span>
      </div>
    </button>
  );
}

/**
 * Event Detail Panel
 */
interface EventDetailPanelProps {
  event: typeof MOCK_EVENTS[0];
  onClose: () => void;
}

function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const [showRawLog, setShowRawLog] = useState(false);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {event.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {formatDateTime(event.timestamp)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <SeverityBadge severity={event.severity} />
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Summary</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{event.summary}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Source</h4>
          <Badge variant="secondary">{event.source.replace('_', ' ')}</Badge>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Category</h4>
          <Badge variant="info">{event.category.replace('_', ' ')}</Badge>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">
            Related Events
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {event.relatedCount} correlated event{event.relatedCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <Tooltip content="View full raw log data">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawLog(!showRawLog)}
              fullWidth
            >
              {showRawLog ? 'Hide' : 'View'} Raw Log
            </Button>
          </Tooltip>

          {showRawLog && (
            <div className="mt-3 relative">
              <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                {event.rawLog}
              </pre>
              <Tooltip content="Copy raw log to clipboard">
                <button
                  onClick={() => navigator.clipboard.writeText(event.rawLog)}
                  className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
