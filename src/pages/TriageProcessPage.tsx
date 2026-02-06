import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, CircularProgress, Progress } from '@/components/common';
import { TRIAGE_PHASES } from '@/utils/constants';
import {
  Play,
  Pause,
  CheckCircle,
  Activity,
  FileSearch,
  Database,
  GitBranch,
  Radar,
  Search,
  Globe,
  AlertTriangle,
  Eye,
  KeyRound,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatTimestamp } from '@/utils/formatters';

interface CTIResult {
  id: string;
  type: 'pii_exposure' | 'leaked_credentials' | 'darknet_mention' | 'paste_site' | 'breach_database';
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  date: string;
  indicators: string[];
}

const MOCK_CTI_RESULTS: CTIResult[] = [
  {
    id: 'cti-1',
    type: 'leaked_credentials',
    source: 'BreachDB (OSINT)',
    severity: 'critical',
    title: 'Compromised credentials found in 2024 data breach',
    description: '12 corporate email addresses with password hashes found in recent breach dump. Includes admin accounts.',
    date: '2024-01-10',
    indicators: ['admin.jsmith@company.com', 'svc-backup@company.com', 'sarah.j@company.com'],
  },
  {
    id: 'cti-2',
    type: 'darknet_mention',
    source: 'Darknet Forum Monitoring',
    severity: 'high',
    title: 'Company network access for sale on darknet forum',
    description: 'Initial access broker offering VPN credentials and internal network maps. Listed 3 days before the incident.',
    date: '2024-01-12',
    indicators: ['vpn.company.com', 'RDP access - Finance segment', '$5,000 asking price'],
  },
  {
    id: 'cti-3',
    type: 'pii_exposure',
    source: 'Public Paste Sites',
    severity: 'high',
    title: 'Employee PII leaked on paste site',
    description: 'Partial employee directory with names, email addresses, phone numbers, and department info found on public paste site.',
    date: '2024-01-08',
    indicators: ['~250 employee records', 'Names, emails, phone numbers', 'Department structure'],
  },
  {
    id: 'cti-4',
    type: 'breach_database',
    source: 'Have I Been Pwned (OSINT)',
    severity: 'medium',
    title: 'Domain appears in 3 known breach databases',
    description: 'company.com domain found across multiple breach databases with varying dates and data types exposed.',
    date: '2023-11-15',
    indicators: ['LinkedIn breach (2023)', 'Third-party SaaS breach (2024)', 'Marketing platform leak (2023)'],
  },
  {
    id: 'cti-5',
    type: 'paste_site',
    source: 'GitHub/Gist OSINT',
    severity: 'medium',
    title: 'Internal API keys found in public GitHub repos',
    description: 'AWS access keys and internal API tokens committed to public repositories by developers.',
    date: '2024-01-05',
    indicators: ['AWS Access Key: AKIA****', 'Slack webhook URL', 'Internal API bearer token'],
  },
];

interface ActivityLog {
  id: string;
  timestamp: Date;
  phase: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface FindingCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  ambiguous: number;
}

/**
 * Triage Process Page
 */
export default function TriageProcessPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState<number[]>(
    TRIAGE_PHASES.map(() => 0)
  );
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [findings, setFindings] = useState<FindingCount>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    ambiguous: 0,
  });

  const [ctiQuery, setCtiQuery] = useState('');
  const [ctiSearching, setCtiSearching] = useState(false);
  const [ctiResults, setCtiResults] = useState<CTIResult[]>([]);
  const [ctiSearchType, setCtiSearchType] = useState<'all' | 'pii' | 'credentials' | 'darknet'>('all');
  const [showCTI, setShowCTI] = useState(false);

  const activityRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll activity feed
  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [activityLog]);

  // Simulation logic
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setOverallProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          setIsRunning(false);
          return 100;
        }
        return next;
      });

      // Update phase progress
      setPhaseProgress((prev) => {
        const newProgress = [...prev];
        const progressPerPhase = 100 / TRIAGE_PHASES.length;

        for (let i = 0; i < TRIAGE_PHASES.length; i++) {
          const phaseStart = i * progressPerPhase;
          const phaseEnd = (i + 1) * progressPerPhase;
          const currentOverall = overallProgress + 1;

          if (currentOverall >= phaseEnd) {
            newProgress[i] = 100;
          } else if (currentOverall > phaseStart) {
            newProgress[i] = ((currentOverall - phaseStart) / progressPerPhase) * 100;
            setCurrentPhase(i);
          }
        }
        return newProgress;
      });

      // Add activity log entries
      if (Math.random() > 0.5) {
        const messages = [
          { message: 'Collecting Windows Security Event Logs...', severity: 'info' as const },
          { message: 'Analyzing authentication patterns...', severity: 'info' as const },
          { message: 'Found suspicious process execution', severity: 'warning' as const },
          { message: 'Extracting registry artifacts...', severity: 'info' as const },
          { message: 'Correlating network connections...', severity: 'info' as const },
          { message: 'Detected potential lateral movement', severity: 'warning' as const },
          { message: 'Identified scheduled task persistence', severity: 'warning' as const },
          { message: 'Phase completed successfully', severity: 'success' as const },
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setActivityLog((prev) => [
          ...prev.slice(-49),
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            phase: TRIAGE_PHASES[currentPhase]?.name || 'Analysis',
            ...msg,
          },
        ]);

        // Randomly add findings
        if (Math.random() > 0.85) {
          setFindings((prev) => {
            const key = ['critical', 'high', 'medium', 'low', 'ambiguous'][
              Math.floor(Math.random() * 5)
            ] as keyof FindingCount;
            return { ...prev, [key]: prev[key] + 1 };
          });
        }
      }
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, overallProgress, currentPhase]);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/validation');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/timeline');
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const getPhaseIcon = (index: number) => {
    const icons = [
      <Database key="db" className="w-5 h-5" />,
      <FileSearch key="search" className="w-5 h-5" />,
      <Activity key="activity" className="w-5 h-5" />,
      <GitBranch key="git" className="w-5 h-5" />,
      <Radar key="radar" className="w-5 h-5" />,
    ];
    return icons[index] || icons[0];
  };

  const getPhaseStatus = (index: number) => {
    if (phaseProgress[index] >= 100) return 'complete';
    if (phaseProgress[index] > 0) return 'running';
    return 'pending';
  };

  const handleCTISearch = useCallback(() => {
    setCtiSearching(true);
    setCtiResults([]);
    setTimeout(() => {
      const filtered = ctiSearchType === 'all'
        ? MOCK_CTI_RESULTS
        : MOCK_CTI_RESULTS.filter((r) => {
            if (ctiSearchType === 'credentials') return r.type === 'leaked_credentials' || r.type === 'breach_database';
            if (ctiSearchType === 'pii') return r.type === 'pii_exposure' || r.type === 'paste_site';
            if (ctiSearchType === 'darknet') return r.type === 'darknet_mention';
            return true;
          });
      setCtiResults(filtered);
      setCtiSearching(false);
    }, 2500);
  }, [ctiSearchType]);

  const totalFindings =
    findings.critical + findings.high + findings.medium + findings.low;

  return (
    <PageContainer
      title="Triage Process"
      subtitle="Automated forensic analysis in progress"
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Validation"
          onContinue={handleContinue}
          continueLabel="View Timeline"
          continueDisabled={overallProgress < 100}
        />
      }
    >
      {/* Overall Progress with integrated CTI */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <CircularProgress
            value={overallProgress}
            size={140}
            variant={overallProgress >= 100 ? 'success' : 'default'}
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {overallProgress >= 100
                ? 'Analysis Complete'
                : isPaused
                ? 'Paused'
                : isRunning
                ? TRIAGE_PHASES[currentPhase]?.name || 'Analyzing...'
                : 'Ready to Start'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {overallProgress >= 100
                ? `Found ${totalFindings} findings (${findings.ambiguous} require verification)`
                : isRunning
                ? 'Processing forensic data...'
                : 'Click Start to begin the automated triage process'}
            </p>
            <div className="mt-4 flex gap-2 justify-center sm:justify-start flex-wrap">
              {!isRunning && overallProgress < 100 && (
                <Tooltip content="Begin automated forensic triage">
                  <Button onClick={handleStart} leftIcon={<Play className="w-4 h-4" />}>
                    Start Triage
                  </Button>
                </Tooltip>
              )}
              {isRunning && (
                <Tooltip content={isPaused ? 'Resume the triage process' : 'Pause the triage process'}>
                  <Button
                    variant="secondary"
                    onClick={handlePause}
                    leftIcon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                </Tooltip>
              )}
              {/* CTI Toggle Button - integrated in Ready to Start area */}
              <Tooltip content="Open Cyber Threat Intelligence (CTI) OSINT search">
                <Button
                  variant={showCTI ? 'primary' : 'outline'}
                  onClick={() => setShowCTI(!showCTI)}
                  leftIcon={<Globe className="w-4 h-4" />}
                >
                  CTI / OSINT
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Integrated CTI Panel (collapsible within Ready to Start) */}
        {showCTI && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-forensic-500" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Cyber Threat Intelligence (CTI)</h4>
              <span className="text-xs text-slate-400">OSINT search for PII, credentials, darknet mentions</span>
            </div>

            {/* Search Controls */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={ctiQuery}
                  onChange={(e) => setCtiQuery(e.target.value)}
                  placeholder="Search domain, email, IP, or keyword..."
                  className="input pl-10"
                />
              </div>
              <div className="flex gap-1">
                {([
                  { id: 'all', label: 'All Sources', icon: <Globe className="w-3 h-3" /> },
                  { id: 'pii', label: 'PII / Leaks', icon: <User className="w-3 h-3" /> },
                  { id: 'credentials', label: 'Credentials', icon: <KeyRound className="w-3 h-3" /> },
                  { id: 'darknet', label: 'Darknet', icon: <Eye className="w-3 h-3" /> },
                ] as const).map((type) => (
                  <Tooltip key={type.id} content={`Search ${type.label}`}>
                    <button
                      onClick={() => setCtiSearchType(type.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        ctiSearchType === type.id
                          ? 'bg-forensic-100 text-forensic-700 dark:bg-forensic-900/30 dark:text-forensic-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  </Tooltip>
                ))}
              </div>
              <Tooltip content="Search public OSINT sources and darknet databases">
                <Button
                  onClick={handleCTISearch}
                  isLoading={ctiSearching}
                  leftIcon={<Search className="w-4 h-4" />}
                  size="sm"
                >
                  Search CTI
                </Button>
              </Tooltip>
            </div>

            {/* Search Results */}
            {ctiSearching && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-3">
                <Loader2 className="w-5 h-5 animate-spin text-forensic-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Searching threat intelligence sources...</p>
                  <p className="text-xs text-slate-500">Querying OSINT databases, breach databases, paste sites, darknet forums</p>
                </div>
              </div>
            )}

            {ctiResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{ctiResults.length} results found across open and dark sources</span>
                </div>
                {ctiResults.map((result) => (
                  <CTIResultCard key={result.id} result={result} />
                ))}
              </div>
            )}

            {!ctiSearching && ctiResults.length === 0 && (
              <div className="text-center py-4 text-slate-400">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run a CTI search to discover exposed data, leaked credentials, and darknet mentions</p>
                <p className="text-xs mt-1">Sources: OSINT databases, breach databases, paste sites, darknet forums, public repos</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Phase Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {TRIAGE_PHASES.map((phase, index) => (
          <PhaseCard
            key={phase.id}
            name={phase.name}
            icon={getPhaseIcon(index)}
            progress={phaseProgress[index]}
            status={getPhaseStatus(index)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="h-[400px] flex flex-col">
            <CardHeader title="Activity Feed" description="Real-time log of triage operations" />
            <div
              ref={activityRef}
              className="flex-1 overflow-y-auto mt-4 space-y-2"
            >
              {activityLog.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Activity will appear here when triage starts...
                </p>
              ) : (
                activityLog.map((log) => (
                  <ActivityItem key={log.id} log={log} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Findings Summary */}
        <div>
          <Card className="h-[400px]">
            <CardHeader title="Findings" description="Detected issues and anomalies" />
            <div className="mt-4 space-y-3">
              <FindingRow
                label="Critical"
                count={findings.critical}
                color="red"
              />
              <FindingRow
                label="High"
                count={findings.high}
                color="orange"
              />
              <FindingRow
                label="Medium"
                count={findings.medium}
                color="yellow"
              />
              <FindingRow
                label="Low"
                count={findings.low}
                color="green"
              />
              <hr className="border-slate-200 dark:border-slate-700" />
              <FindingRow
                label="Ambiguous"
                count={findings.ambiguous}
                color="purple"
                tooltip="Findings requiring manual review"
              />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * CTI Result Card Component
 */
function CTIResultCard({ result }: { result: CTIResult }) {
  const [expanded, setExpanded] = useState(false);

  const typeIcons: Record<CTIResult['type'], React.ReactNode> = {
    pii_exposure: <User className="w-4 h-4" />,
    leaked_credentials: <KeyRound className="w-4 h-4" />,
    darknet_mention: <Eye className="w-4 h-4" />,
    paste_site: <FileSearch className="w-4 h-4" />,
    breach_database: <Database className="w-4 h-4" />,
  };

  const typeLabels: Record<CTIResult['type'], string> = {
    pii_exposure: 'PII Exposure',
    leaked_credentials: 'Leaked Credentials',
    darknet_mention: 'Darknet Mention',
    paste_site: 'Paste Site',
    breach_database: 'Breach Database',
  };

  const severityColors: Record<string, string> = {
    critical: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
    high: 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10',
    medium: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10',
    low: 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10',
  };

  return (
    <div
      className={cn(
        'border-l-4 rounded-lg p-3 cursor-pointer transition-colors',
        severityColors[result.severity]
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="text-slate-400 mt-0.5">{typeIcons[result.type]}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              result.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              result.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            )}>
              {result.severity}
            </span>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
              {typeLabels[result.type]}
            </span>
            <span className="text-xs text-slate-400 ml-auto">{result.date}</span>
            {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
          </div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{result.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{result.description}</p>
          <p className="text-xs text-slate-400 mt-0.5">Source: {result.source}</p>

          {expanded && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Indicators Found</p>
              <div className="space-y-1">
                {result.indicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="font-mono text-slate-600 dark:text-slate-400">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Phase Card Component
 */
interface PhaseCardProps {
  name: string;
  icon: React.ReactNode;
  progress: number;
  status: 'pending' | 'running' | 'complete';
}

function PhaseCard({ name, icon, progress, status }: PhaseCardProps) {
  return (
    <Card
      className={cn(
        'text-center',
        status === 'complete' && 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            status === 'complete' && 'text-green-500',
            status === 'running' && 'text-forensic-500 animate-pulse',
            status === 'pending' && 'text-slate-300 dark:text-slate-600'
          )}
        >
          {status === 'complete' ? <CheckCircle className="w-5 h-5" /> : icon}
        </div>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {name}
        </span>
        <Progress
          value={progress}
          size="sm"
          variant={status === 'complete' ? 'success' : 'default'}
        />
      </div>
    </Card>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({ log }: { log: ActivityLog }) {
  const severityColors = {
    info: 'text-slate-400',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
        {formatTimestamp(log.timestamp)}
      </span>
      <span className={cn('flex-1', severityColors[log.severity])}>
        {log.message}
      </span>
    </div>
  );
}

/**
 * Finding Row Component
 */
interface FindingRowProps {
  label: string;
  count: number;
  color: string;
  tooltip?: string;
}

function FindingRow({ label, count, color, tooltip }: FindingRowProps) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  const content = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', colorClasses[color])} />
        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {count}
      </span>
    </div>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{content}</Tooltip>;
  }

  return content;
}
