import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, Badge, Progress } from '@/components/common';
import {
  Download,
  FileText,
  FileCode,
  Printer,
  Share2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Target,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Report Generation Page
 *
 * Final report with:
 * - Executive summary
 * - Business impact assessment
 * - Findings list
 * - Timeline summary
 * - Recommendations
 * - Gap analysis
 * - Export options
 */
export default function ReportGenerationPage() {
  const navigate = useNavigate();
  const { goToPreviousStep } = useSessionStore();

  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'json'>('pdf');
  const [includeRawLogs, setIncludeRawLogs] = useState(false);
  const [redactSensitive, setRedactSensitive] = useState(true);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/verification');
  };

  const handleExport = () => {
    // Simulate export
    alert(`Exporting report as ${selectedFormat.toUpperCase()}...`);
  };

  const handleNewInvestigation = () => {
    navigate('/');
  };

  // Mock report data
  const reportData = {
    incidentSummary: 'Ransomware attack via phishing email targeting finance department',
    affectedSystems: 12,
    totalFindings: 23,
    criticalFindings: 5,
    timeToDetection: '4 hours',
    dataAtRisk: 'Customer PII, Financial Records',
    businessImpact: {
      operational: 'high',
      financial: 'medium',
      reputational: 'low',
      regulatory: 'high',
    },
    recommendations: [
      { priority: 'immediate', title: 'Isolate affected systems', status: 'pending' },
      { priority: 'immediate', title: 'Reset compromised credentials', status: 'pending' },
      { priority: 'short_term', title: 'Implement MFA for all admin accounts', status: 'pending' },
      { priority: 'short_term', title: 'Deploy EDR solution', status: 'pending' },
      { priority: 'long_term', title: 'Security awareness training', status: 'pending' },
    ],
    gaps: [
      { category: 'Detection', current: 2, target: 4, gap: 'No behavioral analytics' },
      { category: 'Response', current: 3, target: 4, gap: 'Manual playbooks only' },
      { category: 'Prevention', current: 2, target: 5, gap: 'Limited email security' },
    ],
  };

  return (
    <PageContainer
      title="Report Generation"
      subtitle="Review and export the investigation report"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            Back to Verification
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleNewInvestigation}>
              New Investigation
            </Button>
            <Tooltip content={`Export report as ${selectedFormat.toUpperCase()}`}>
              <Button onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                Export Report
              </Button>
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Executive Summary */}
          <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-forensic-100 dark:bg-forensic-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-forensic-600 dark:text-forensic-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Executive Summary
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {reportData.incidentSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard
                    icon={<Target className="w-4 h-4" />}
                    label="Affected Systems"
                    value={reportData.affectedSystems}
                  />
                  <MetricCard
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="Total Findings"
                    value={reportData.totalFindings}
                    subValue={`${reportData.criticalFindings} critical`}
                  />
                  <MetricCard
                    icon={<Clock className="w-4 h-4" />}
                    label="Time to Detect"
                    value={reportData.timeToDetection}
                  />
                  <MetricCard
                    icon={<Activity className="w-4 h-4" />}
                    label="Data at Risk"
                    value={reportData.dataAtRisk}
                    small
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Business Impact Assessment */}
          <Card>
            <CardHeader
              title="Business Impact Assessment"
              description="Impact across key business dimensions"
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(reportData.businessImpact).map(([key, value]) => (
                <ImpactCard key={key} dimension={key} level={value as string} />
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader
              title="Recommendations"
              description="Prioritized actions to remediate and prevent"
            />
            <div className="mt-4 space-y-3">
              {reportData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <Badge
                    variant={
                      rec.priority === 'immediate'
                        ? 'danger'
                        : rec.priority === 'short_term'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {rec.priority.replace('_', ' ')}
                  </Badge>
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                    {rec.title}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Gap Analysis */}
          <Card>
            <CardHeader
              title="Gap Analysis"
              description="Security maturity assessment"
            />
            <div className="mt-4 space-y-4">
              {reportData.gaps.map((gap, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {gap.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {gap.current}/{gap.target}
                    </span>
                  </div>
                  <Progress
                    value={(gap.current / gap.target) * 100}
                    variant={gap.current < gap.target * 0.5 ? 'danger' : 'warning'}
                  />
                  <p className="text-xs text-slate-500 mt-1">{gap.gap}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Options Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader title="Export Options" />
            <div className="mt-4 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Format
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'pdf', icon: <FileText className="w-4 h-4" />, label: 'PDF Document' },
                    { id: 'html', icon: <FileCode className="w-4 h-4" />, label: 'Interactive HTML' },
                    { id: 'json', icon: <FileCode className="w-4 h-4" />, label: 'JSON Data' },
                  ].map((format) => (
                    <Tooltip key={format.id} content={`Export as ${format.label}`}>
                      <button
                        onClick={() => setSelectedFormat(format.id as 'pdf' | 'html' | 'json')}
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-lg border transition-colors',
                          selectedFormat === format.id
                            ? 'border-forensic-500 bg-forensic-50 dark:bg-forensic-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                      >
                        {format.icon}
                        <span className="text-sm">{format.label}</span>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-4 h-4 text-forensic-500 ml-auto" />
                        )}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Content Options */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Content Options
                </label>
                <div className="space-y-2">
                  <Tooltip content="Include raw log data in export">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRawLogs}
                        onChange={(e) => setIncludeRawLogs(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Include raw logs
                      </span>
                    </label>
                  </Tooltip>
                  <Tooltip content="Automatically redact sensitive data">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redactSensitive}
                        onChange={(e) => setRedactSensitive(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Redact sensitive data
                      </span>
                    </label>
                  </Tooltip>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <Tooltip content="Generate downloadable PDF report with current findings">
                  <Button fullWidth onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                    Export Report
                  </Button>
                </Tooltip>
                <Tooltip content="Open print preview">
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Printer className="w-4 h-4" />}
                  >
                    Print Preview
                  </Button>
                </Tooltip>
                <Tooltip content="Generate shareable link">
                  <Button
                    variant="ghost"
                    fullWidth
                    leftIcon={<Share2 className="w-4 h-4" />}
                  >
                    Share Link
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  small?: boolean;
}

function MetricCard({ icon, label, value, subValue, small }: MetricCardProps) {
  return (
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn(
        'font-bold text-slate-900 dark:text-slate-100',
        small ? 'text-sm' : 'text-lg'
      )}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-red-500">{subValue}</p>
      )}
    </div>
  );
}

/**
 * Impact Card Component
 */
interface ImpactCardProps {
  dimension: string;
  level: string;
}

function ImpactCard({ dimension, level }: ImpactCardProps) {
  const levelColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <p className="text-xs text-slate-500 uppercase mb-1 capitalize">{dimension}</p>
      <span className={cn('px-3 py-1 rounded-full text-sm font-medium capitalize', levelColors[level as keyof typeof levelColors])}>
        {level}
      </span>
    </div>
  );
}
