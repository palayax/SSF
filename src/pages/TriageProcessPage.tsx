import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatTimestamp } from '@/utils/formatters';

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
 *
 * Simulated forensic triage:
 * - Progress dashboard
 * - Phase cards
 * - Activity feed
 * - Findings summary
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
      {/* Overall Progress */}
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
            <div className="mt-4 flex gap-2 justify-center sm:justify-start">
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
            </div>
          </div>
        </div>
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
