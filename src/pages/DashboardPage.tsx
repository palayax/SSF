import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Upload,
  User,
  Globe,
  Brain,
  Clock,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Card, Tooltip } from '@/components/common';
import { Header } from '@/components/layout';
import { useSessionStore } from '@/store';
import { formatRelativeTime } from '@/utils/formatters';
import type { ScenarioType } from '@/types';

/**
 * Dashboard Page - Entry point for the forensic prototype
 *
 * Features:
 * - Scenario selection cards
 * - Quick start for custom investigations
 * - Recent sessions panel
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { createSession, recentSessions, loadSession, clearRecentSessions } =
    useSessionStore();

  const handleStartNew = () => {
    createSession();
    navigate('/context');
  };

  const handleSelectScenario = (scenarioType: ScenarioType) => {
    createSession(scenarioType);
    navigate('/context');
  };

  const handleResumeSession = (sessionId: string) => {
    loadSession(sessionId);
    navigate('/context');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header showProgress={false} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Self-Service Forensic Triage
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Quick diagnostic before professional incident response. Upload
            organizational context, configure data sources, and get actionable
            insights.
          </p>
          <Tooltip content="Begin a new forensic investigation from scratch">
            <Button
              size="lg"
              onClick={handleStartNew}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start New Investigation
            </Button>
          </Tooltip>
        </div>

        {/* Scenario Selection */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Select a Scenario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Choose a pre-populated scenario to see the full workflow with
            realistic demo data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCENARIOS.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={() => handleSelectScenario(scenario.id)}
              />
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Sessions
              </h2>
              <Tooltip content="Remove all saved session history">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSessions}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Clear
                </Button>
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSessions.slice(0, 6).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onResume={() => handleResumeSession(session.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/**
 * Scenario definitions for the dashboard
 */
const SCENARIOS: {
  id: ScenarioType;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}[] = [
  {
    id: 'ransomware',
    title: 'Ransomware Attack',
    description:
      'Enterprise ransomware infection with lateral movement and file encryption',
    icon: <Lock className="w-8 h-8" />,
    difficulty: 'intermediate',
  },
  {
    id: 'data_exfiltration',
    title: 'Data Exfiltration',
    description:
      'Sensitive data theft via compromised cloud storage and sync tools',
    icon: <Upload className="w-8 h-8" />,
    difficulty: 'advanced',
  },
  {
    id: 'insider_threat',
    title: 'Insider Threat',
    description:
      'Malicious activity by authorized user with privileged access',
    icon: <User className="w-8 h-8" />,
    difficulty: 'advanced',
  },
  {
    id: 'web_dos',
    title: 'Web Resource DOS',
    description:
      'Application-layer denial of service attack on public web services',
    icon: <Globe className="w-8 h-8" />,
    difficulty: 'beginner',
  },
  {
    id: 'ai_breach',
    title: 'AI-Related Breach',
    description:
      'Security incident involving AI/ML systems and data poisoning',
    icon: <Brain className="w-8 h-8" />,
    difficulty: 'advanced',
  },
];

/**
 * Scenario Card Component
 */
interface ScenarioCardProps {
  scenario: (typeof SCENARIOS)[0];
  onSelect: () => void;
}

function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  const difficultyColors = {
    beginner:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Tooltip content={`Load ${scenario.title} scenario with pre-populated data`}>
      <Card
        hoverable
        onClick={onSelect}
        className="cursor-pointer text-center h-full"
      >
        <div className="flex flex-col items-center gap-3 p-2">
          <div className="text-forensic-500 dark:text-forensic-400">
            {scenario.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {scenario.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {scenario.description}
            </p>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
              difficultyColors[scenario.difficulty]
            )}
          >
            {scenario.difficulty}
          </span>
        </div>
      </Card>
    </Tooltip>
  );
}

/**
 * Session Card Component
 */
interface SessionCardProps {
  session: {
    id: string;
    scenarioType: string;
    lastModified: Date;
    currentStep: number;
    isComplete: boolean;
  };
  onResume: () => void;
}

function SessionCard({ session, onResume }: SessionCardProps) {
  const scenarioLabels: Record<string, string> = {
    ransomware: 'Ransomware Attack',
    data_exfiltration: 'Data Exfiltration',
    insider_threat: 'Insider Threat',
    web_dos: 'Web Resource DOS',
    ai_breach: 'AI-Related Breach',
    custom: 'Custom Investigation',
  };

  return (
    <Tooltip content="Continue this investigation session">
      <Card hoverable onClick={onResume} className="cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {scenarioLabels[session.scenarioType] || 'Investigation'}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(session.lastModified)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                session.isComplete
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {session.isComplete ? 'Complete' : `Step ${session.currentStep + 1}`}
            </span>
          </div>
        </div>
      </Card>
    </Tooltip>
  );
}
