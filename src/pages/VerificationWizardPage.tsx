import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, Badge, SeverityBadge, Progress } from '@/components/common';
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  History,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Mock ambiguous findings
const MOCK_FINDINGS = [
  {
    id: '1',
    title: 'PsExec Remote Execution',
    category: 'dual_use_tool',
    severity: 'medium' as const,
    confidence: 65,
    description: 'PsExec was used to execute commands on remote systems. This tool has legitimate administrative uses but is commonly abused by attackers.',
    evidence: [
      { type: 'Event Log', content: 'EventID 4688: Process PsExec.exe created' },
      { type: 'Process', content: 'Parent: cmd.exe, User: CORP\\admin_jsmith' },
    ],
    historicalContext: 'This user has used PsExec 3 times in the past month for legitimate patching.',
    expertGuidance: 'Review the target systems and timing. PsExec usage outside maintenance windows is suspicious.',
    legitimateUseCases: ['System patching', 'Remote administration', 'Incident response'],
    suspiciousIndicators: ['Unusual timing (2:30 AM)', 'Multiple targets in sequence', 'SYSTEM privilege usage'],
  },
  {
    id: '2',
    title: 'Bulk File Access',
    category: 'data_theft',
    severity: 'high' as const,
    confidence: 72,
    description: 'Large number of files accessed from finance share in short timeframe.',
    evidence: [
      { type: 'File Access', content: '1,247 files accessed in 15 minutes' },
      { type: 'User Activity', content: 'User: jsmith, Time: 02:35-02:50 AM' },
    ],
    historicalContext: 'User typically accesses 20-30 files per day during business hours.',
    expertGuidance: 'This is a significant deviation from baseline. Check if there was authorized backup or migration.',
    legitimateUseCases: ['Quarter-end reporting', 'Authorized backup', 'Department migration'],
    suspiciousIndicators: ['Off-hours activity', '6000% above baseline', 'Sensitive file types'],
  },
  {
    id: '3',
    title: 'Scheduled Task Persistence',
    category: 'persistence_mechanism',
    severity: 'high' as const,
    confidence: 85,
    description: 'New scheduled task created pointing to executable in Public folder.',
    evidence: [
      { type: 'Task Details', content: 'Task: WindowsUpdate, Action: C:\\Users\\Public\\update.exe' },
      { type: 'Timing', content: 'Created 3 minutes after initial compromise indicator' },
    ],
    historicalContext: 'No legitimate tasks have been created in Public folder in past year.',
    expertGuidance: 'Tasks in Public folder are highly suspicious. Likely malicious persistence mechanism.',
    legitimateUseCases: ['IT deployment scripts', 'Third-party installers'],
    suspiciousIndicators: ['Public folder location', 'Generic task name', 'Timing correlation'],
  },
];

type Classification = 'malicious' | 'benign' | 'needs_investigation';

/**
 * Verification Wizard Page
 *
 * Guided review of ambiguous findings:
 * - Card-based finding display
 * - Classification options
 * - Evidence display
 * - Context panel
 */
export default function VerificationWizardPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Classification>>({});
  const [justification, setJustification] = useState('');

  const currentFinding = MOCK_FINDINGS[currentIndex];
  const totalFindings = MOCK_FINDINGS.length;
  const reviewedCount = Object.keys(decisions).length;

  const handleBack = () => {
    goToPreviousStep();
    navigate('/timeline');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/report');
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setJustification('');
    }
  };

  const handleNext = () => {
    if (currentIndex < totalFindings - 1) {
      setCurrentIndex(currentIndex + 1);
      setJustification('');
    }
  };

  const handleClassify = (classification: Classification) => {
    setDecisions({
      ...decisions,
      [currentFinding.id]: classification,
    });
  };

  const handleSkipAll = () => {
    // Set all remaining as needs_investigation
    const newDecisions = { ...decisions };
    MOCK_FINDINGS.forEach((f) => {
      if (!newDecisions[f.id]) {
        newDecisions[f.id] = 'needs_investigation';
      }
    });
    setDecisions(newDecisions);
  };

  const currentDecision = decisions[currentFinding.id];

  return (
    <PageContainer
      title="Verification Wizard"
      subtitle="Review and classify ambiguous findings"
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Timeline"
          onContinue={handleContinue}
          continueLabel="Generate Report"
          continueDisabled={reviewedCount < totalFindings}
        />
      }
    >
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Finding {currentIndex + 1} of {totalFindings}
          </span>
          <Progress value={(reviewedCount / totalFindings) * 100} className="w-32" />
          <span className="text-sm text-slate-500">
            {reviewedCount} reviewed
          </span>
        </div>
        <Tooltip content="Accept defaults for remaining items">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipAll}
            leftIcon={<SkipForward className="w-4 h-4" />}
          >
            Skip All
          </Button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finding Card */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            {/* Finding Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">#{currentIndex + 1}</Badge>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {currentFinding.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={currentFinding.severity} />
                  <Badge variant="info">{currentFinding.category.replace('_', ' ')}</Badge>
                </div>
              </div>
              <div className="text-right">
                <Tooltip content="Automated confidence level">
                  <div>
                    <span className="text-sm text-slate-500">Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={currentFinding.confidence}
                        size="sm"
                        className="w-16"
                        variant={
                          currentFinding.confidence > 75
                            ? 'danger'
                            : currentFinding.confidence > 50
                            ? 'warning'
                            : 'default'
                        }
                      />
                      <span className="text-sm font-medium">{currentFinding.confidence}%</span>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-slate-700 dark:text-slate-300">
                {currentFinding.description}
              </p>
            </div>

            {/* Evidence */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFinding.evidence.map((ev, idx) => (
                  <Tooltip key={idx} content="View complete evidence">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{ev.type}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {ev.content}
                      </p>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Classification */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Classification
              </h4>
              <div className="flex gap-3">
                <Tooltip content="Confirm this activity as malicious based on evidence">
                  <button
                    onClick={() => handleClassify('malicious')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors',
                      currentDecision === 'malicious'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                    )}
                  >
                    <XCircle className={cn(
                      'w-5 h-5',
                      currentDecision === 'malicious' ? 'text-red-500' : 'text-slate-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      currentDecision === 'malicious' ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      Malicious
                    </span>
                  </button>
                </Tooltip>
                <Tooltip content="Mark as legitimate activity">
                  <button
                    onClick={() => handleClassify('benign')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors',
                      currentDecision === 'benign'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                    )}
                  >
                    <CheckCircle className={cn(
                      'w-5 h-5',
                      currentDecision === 'benign' ? 'text-green-500' : 'text-slate-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      currentDecision === 'benign' ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      Benign
                    </span>
                  </button>
                </Tooltip>
                <Tooltip content="Flag for deeper analysis">
                  <button
                    onClick={() => handleClassify('needs_investigation')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors',
                      currentDecision === 'needs_investigation'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300'
                    )}
                  >
                    <HelpCircle className={cn(
                      'w-5 h-5',
                      currentDecision === 'needs_investigation' ? 'text-yellow-500' : 'text-slate-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      currentDecision === 'needs_investigation' ? 'text-yellow-700 dark:text-yellow-300' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      Investigate
                    </span>
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Justification (optional)
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Add notes for your decision..."
                className="input min-h-[80px]"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {MOCK_FINDINGS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      'w-3 h-3 rounded-full transition-colors',
                      idx === currentIndex
                        ? 'bg-forensic-500'
                        : decisions[MOCK_FINDINGS[idx].id]
                        ? decisions[MOCK_FINDINGS[idx].id] === 'malicious'
                          ? 'bg-red-500'
                          : decisions[MOCK_FINDINGS[idx].id] === 'benign'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={handleNext}
                disabled={currentIndex === totalFindings - 1}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </Card>
        </div>

        {/* Context Panel */}
        <div>
          <Card className="sticky top-24">
            <CardHeader title="Context" />
            <div className="space-y-4 mt-4">
              {/* Historical Context */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Historical Context
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentFinding.historicalContext}
                </p>
              </div>

              {/* Expert Guidance */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Expert Guidance
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentFinding.expertGuidance}
                </p>
              </div>

              {/* Legitimate Use Cases */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Legitimate Use Cases
                </h4>
                <ul className="space-y-1">
                  {currentFinding.legitimateUseCases.map((use, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suspicious Indicators */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Suspicious Indicators
                </h4>
                <ul className="space-y-1">
                  {currentFinding.suspiciousIndicators.map((indicator, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
