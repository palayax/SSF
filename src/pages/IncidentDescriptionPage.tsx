import { useNavigate } from 'react-router-dom';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Input, Textarea, Button, Tooltip, Badge } from '@/components/common';
import { Calendar, MapPin, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Incident Description Page
 *
 * Collect incident details:
 * - Natural language description
 * - Start date and time
 * - Patient zero identification
 * - IOCs (Indicators of Compromise)
 * - Critical systems
 * - Compromised credentials
 */
export default function IncidentDescriptionPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep, updateIncidentDescription, currentSession } =
    useSessionStore();

  const [naturalLanguage, setNaturalLanguage] = useState(
    currentSession?.incidentDescription?.naturalLanguage || ''
  );
  const [startDate, setStartDate] = useState('');
  const [patientZero, setPatientZero] = useState('');
  const [iocs, setIocs] = useState<{ type: string; value: string }[]>([]);
  const [newIocType, setNewIocType] = useState('hash');
  const [newIocValue, setNewIocValue] = useState('');

  const handleBack = () => {
    goToPreviousStep();
    navigate('/context');
  };

  const handleContinue = () => {
    // Save to store
    updateIncidentDescription({
      naturalLanguage,
      startDate: startDate ? new Date(startDate) : new Date(),
      patientZero: { hostname: patientZero, type: 'workstation' },
      iocs: iocs.map((ioc, idx) => ({
        id: `ioc-${idx}`,
        type: ioc.type as any,
        value: ioc.value,
        confidence: 'medium',
      })),
    });

    goToNextStep();
    navigate('/connectors');
  };

  const addIoc = () => {
    if (newIocValue.trim()) {
      setIocs([...iocs, { type: newIocType, value: newIocValue }]);
      setNewIocValue('');
    }
  };

  const removeIoc = (index: number) => {
    setIocs(iocs.filter((_, i) => i !== index));
  };

  const suggestionChips = [
    'Ransomware detected',
    'Unauthorized access',
    'Data exfiltration suspected',
    'Malicious email received',
    'System compromise',
  ];

  return (
    <PageContainer
      title="Incident Description"
      subtitle="Describe the security incident in detail"
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Context"
          onContinue={handleContinue}
          continueLabel="Continue"
        />
      }
    >
      <div className="space-y-6">
        {/* Natural Language Input */}
        <Card>
          <CardHeader
            title="Describe the Incident"
            description="Provide a detailed description of what happened"
          />
          <div className="mt-4">
            <Textarea
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              placeholder="Our finance department reported that multiple file servers became inaccessible around 2:30 AM on Tuesday. Users discovered ransom notes demanding Bitcoin payment..."
              minRows={5}
              tooltip="Describe the incident in your own words. Include what happened, when it was discovered, and any initial observations."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestionChips.map((chip) => (
                <Tooltip key={chip} content="Click to add this common phrase">
                  <button
                    onClick={() =>
                      setNaturalLanguage((prev) =>
                        prev ? `${prev} ${chip}.` : chip
                      )
                    }
                    className={cn(
                      'px-3 py-1 text-sm rounded-full',
                      'bg-slate-100 dark:bg-slate-700',
                      'text-slate-600 dark:text-slate-300',
                      'hover:bg-forensic-100 dark:hover:bg-forensic-900/30',
                      'hover:text-forensic-700 dark:hover:text-forensic-300',
                      'transition-colors duration-200'
                    )}
                  >
                    {chip}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </Card>

        {/* Key Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <Card>
            <CardHeader
              title="Incident Start Date"
              description="When was the incident first discovered?"
            />
            <div className="mt-4">
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftAddon={<Calendar className="w-4 h-4" />}
                tooltip="When did the first indicator of the incident appear?"
              />
            </div>
          </Card>

          {/* Patient Zero */}
          <Card>
            <CardHeader
              title="Patient Zero"
              description="First affected system identified"
            />
            <div className="mt-4">
              <Input
                value={patientZero}
                onChange={(e) => setPatientZero(e.target.value)}
                placeholder="e.g., ACCT-WS-042 or 10.20.30.42"
                leftAddon={<MapPin className="w-4 h-4" />}
                tooltip="Enter the hostname or IP of the first affected system"
              />
            </div>
          </Card>
        </div>

        {/* IOCs Section */}
        <Card>
          <CardHeader
            title="Indicators of Compromise (IOCs)"
            description="Add known IOCs associated with this incident"
          />
          <div className="mt-4 space-y-3">
            {/* IOC Input */}
            <div className="flex gap-2">
              <Tooltip content="Type of Indicator of Compromise">
                <select
                  value={newIocType}
                  onChange={(e) => setNewIocType(e.target.value)}
                  className="input w-32"
                >
                  <option value="hash">Hash</option>
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="file_path">File Path</option>
                </select>
              </Tooltip>
              <Input
                value={newIocValue}
                onChange={(e) => setNewIocValue(e.target.value)}
                placeholder="Enter IOC value..."
                className="flex-1"
                tooltip="Enter the IOC value"
              />
              <Tooltip content="Add another Indicator of Compromise to the list">
                <Button onClick={addIoc} leftIcon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </Tooltip>
            </div>

            {/* IOC List */}
            {iocs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {iocs.map((ioc, index) => (
                  <Badge key={index} variant="secondary">
                    <span className="font-medium capitalize">{ioc.type}:</span>{' '}
                    <span className="font-mono text-xs">{ioc.value}</span>
                    <button
                      onClick={() => removeIoc(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
