import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Session,
  ScenarioType,
  WorkflowStep,
  IncidentDescription,
  ConnectorConfig,
  TriageState,
  TimelineEvent,
  Finding,
  VerificationDecision,
} from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

interface SessionState {
  // Current session
  currentSession: Session | null;

  // Recent sessions for dashboard
  recentSessions: Session[];

  // Current workflow step
  currentStep: WorkflowStep;

  // Actions
  createSession: (scenarioType?: ScenarioType) => void;
  loadSession: (sessionId: string) => void;
  updateSession: (updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  clearRecentSessions: () => void;

  // Navigation
  setCurrentStep: (step: WorkflowStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Session data updates
  updateIncidentDescription: (description: Partial<IncidentDescription>) => void;
  updateConnectors: (connectors: ConnectorConfig[]) => void;
  updateTriageState: (state: Partial<TriageState>) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  addFinding: (finding: Finding) => void;
  addVerificationDecision: (decision: VerificationDecision) => void;
}

const STEP_ORDER: WorkflowStep[] = [
  'dashboard',
  'organization_context',
  'incident_description',
  'connector_config',
  'infrastructure_validation',
  'triage',
  'timeline',
  'verification',
  'report',
];

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptySession(scenarioType?: ScenarioType): Session {
  const now = new Date();
  return {
    id: generateSessionId(),
    createdAt: now,
    lastModified: now,
    scenarioType: scenarioType || 'custom',
    currentStep: 1,
    isComplete: false,
    connectors: [],
    timelineEvents: [],
    findings: [],
    verificationDecisions: [],
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      recentSessions: [],
      currentStep: 'dashboard',

      createSession: (scenarioType?: ScenarioType) => {
        const session = createEmptySession(scenarioType);
        set((state) => ({
          currentSession: session,
          currentStep: 'organization_context',
          recentSessions: [session, ...state.recentSessions.slice(0, 9)],
        }));
      },

      loadSession: (sessionId: string) => {
        const { recentSessions } = get();
        const session = recentSessions.find((s) => s.id === sessionId);
        if (session) {
          const stepIndex = session.currentStep;
          const step = STEP_ORDER[stepIndex] || 'dashboard';
          set({
            currentSession: { ...session, lastModified: new Date() },
            currentStep: step,
          });
        }
      },

      updateSession: (updates: Partial<Session>) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            ...updates,
            lastModified: new Date(),
          };

          return {
            currentSession: updatedSession,
            recentSessions: state.recentSessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      deleteSession: (sessionId: string) => {
        set((state) => ({
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
          recentSessions: state.recentSessions.filter((s) => s.id !== sessionId),
        }));
      },

      clearRecentSessions: () => {
        set({ recentSessions: [], currentSession: null });
      },

      setCurrentStep: (step: WorkflowStep) => {
        const stepIndex = STEP_ORDER.indexOf(step);
        set((state) => ({
          currentStep: step,
          currentSession: state.currentSession
            ? { ...state.currentSession, currentStep: stepIndex, lastModified: new Date() }
            : null,
        }));
      },

      goToNextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          const nextStep = STEP_ORDER[currentIndex + 1];
          set((state) => ({
            currentStep: nextStep,
            currentSession: state.currentSession
              ? { ...state.currentSession, currentStep: currentIndex + 1, lastModified: new Date() }
              : null,
          }));
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
          const prevStep = STEP_ORDER[currentIndex - 1];
          set((state) => ({
            currentStep: prevStep,
            currentSession: state.currentSession
              ? { ...state.currentSession, currentStep: currentIndex - 1, lastModified: new Date() }
              : null,
          }));
        }
      },

      updateIncidentDescription: (description: Partial<IncidentDescription>) => {
        set((state) => {
          if (!state.currentSession) return state;

          const existingDescription = state.currentSession.incidentDescription || {
            naturalLanguage: '',
            startDate: new Date(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            patientZero: { hostname: '', type: 'workstation' as const },
            iocs: [],
            criticalSystems: [],
            compromisedCredentials: [],
          };

          return {
            currentSession: {
              ...state.currentSession,
              incidentDescription: { ...existingDescription, ...description },
              lastModified: new Date(),
            },
          };
        });
      },

      updateConnectors: (connectors: ConnectorConfig[]) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              connectors,
              lastModified: new Date(),
            },
          };
        });
      },

      updateTriageState: (triageState: Partial<TriageState>) => {
        set((state) => {
          if (!state.currentSession) return state;

          const existingTriageState = state.currentSession.triageState || {
            status: 'idle',
            overallProgress: 0,
            phases: [],
            activityLog: [],
            findings: [],
            errors: [],
          };

          return {
            currentSession: {
              ...state.currentSession,
              triageState: { ...existingTriageState, ...triageState },
              lastModified: new Date(),
            },
          };
        });
      },

      addTimelineEvent: (event: TimelineEvent) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              timelineEvents: [...state.currentSession.timelineEvents, event],
              lastModified: new Date(),
            },
          };
        });
      },

      addFinding: (finding: Finding) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              findings: [...state.currentSession.findings, finding],
              lastModified: new Date(),
            },
          };
        });
      },

      addVerificationDecision: (decision: VerificationDecision) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              verificationDecisions: [...state.currentSession.verificationDecisions, decision],
              lastModified: new Date(),
            },
          };
        });
      },
    }),
    {
      name: STORAGE_KEYS.SESSION,
      partialize: (state) => ({
        currentSession: state.currentSession,
        recentSessions: state.recentSessions,
      }),
    }
  )
);
