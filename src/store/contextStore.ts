import { create } from 'zustand';
import type {
  OrganizationContext,
  UploadedDocument,
  ConnectedRepository,
  ExtractedEntities,
  ExtractedSystem,
  ExtractedNetwork,
  BusinessProcess,
  ComplianceRequirement,
} from '@/types';

interface ContextState {
  // Organization context data
  documents: UploadedDocument[];
  repositories: ConnectedRepository[];
  extractedEntities: ExtractedEntities;

  // Loading states
  isParsingDocument: boolean;
  isSyncingRepo: boolean;

  // Actions - Documents
  addDocument: (file: File) => Promise<void>;
  removeDocument: (documentId: string) => void;
  updateDocumentStatus: (documentId: string, status: UploadedDocument['status'], errorMessage?: string) => void;

  // Actions - Repositories
  connectRepository: (type: ConnectedRepository['type'], url: string, name: string) => Promise<void>;
  disconnectRepository: (repoId: string) => void;
  syncRepository: (repoId: string) => Promise<void>;

  // Actions - Entities
  addExtractedSystem: (system: ExtractedSystem) => void;
  addExtractedNetwork: (network: ExtractedNetwork) => void;
  addBusinessProcess: (process: BusinessProcess) => void;
  addComplianceRequirement: (requirement: ComplianceRequirement) => void;

  // Load scenario context
  loadScenarioContext: (context: OrganizationContext) => void;

  // Reset
  resetContext: () => void;
}

const emptyEntities: ExtractedEntities = {
  systems: [],
  networks: [],
  processes: [],
  compliance: [],
  recoveryObjectives: [],
};

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate document parsing (mock)
 */
async function simulateDocumentParsing(document: UploadedDocument): Promise<ExtractedEntities> {
  // Simulate parsing delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Return mock extracted data based on document type
  const mockSystems: ExtractedSystem[] = [
    {
      id: generateId(),
      hostname: 'DC-MAIN-01',
      ip: '10.0.1.10',
      role: 'Domain Controller',
      criticality: 'critical',
      sourceDocument: document.filename,
      os: 'Windows Server 2022',
    },
    {
      id: generateId(),
      hostname: 'FS-FINANCE-01',
      ip: '10.0.2.20',
      role: 'File Server',
      criticality: 'high',
      sourceDocument: document.filename,
      os: 'Windows Server 2019',
    },
    {
      id: generateId(),
      hostname: 'WEB-APP-01',
      ip: '10.0.3.30',
      role: 'Web Application Server',
      criticality: 'high',
      sourceDocument: document.filename,
      os: 'Ubuntu 22.04',
    },
  ];

  const mockNetworks: ExtractedNetwork[] = [
    {
      id: generateId(),
      name: 'Corporate LAN',
      cidr: '10.0.0.0/16',
      vlan: 10,
      description: 'Main corporate network',
      sourceDocument: document.filename,
    },
    {
      id: generateId(),
      name: 'DMZ',
      cidr: '192.168.1.0/24',
      vlan: 50,
      description: 'Demilitarized zone for public services',
      sourceDocument: document.filename,
    },
  ];

  const mockProcesses: BusinessProcess[] = [
    {
      id: generateId(),
      name: 'Financial Reporting',
      description: 'Monthly financial reporting and compliance',
      criticality: 'critical',
      rto: 4,
      rpo: 1,
      dependentSystems: ['FS-FINANCE-01', 'DC-MAIN-01'],
      sourceDocument: document.filename,
    },
  ];

  const mockCompliance: ComplianceRequirement[] = [
    {
      id: generateId(),
      framework: 'SOC2',
      requirement: 'CC6.1',
      description: 'Logical and physical access controls',
      applicableSystems: ['DC-MAIN-01'],
      sourceDocument: document.filename,
    },
  ];

  return {
    systems: mockSystems,
    networks: mockNetworks,
    processes: mockProcesses,
    compliance: mockCompliance,
    recoveryObjectives: mockProcesses.map((p) => ({
      processId: p.id,
      processName: p.name,
      rto: p.rto,
      rpo: p.rpo,
      tier: p.criticality === 'critical' ? 1 : p.criticality === 'high' ? 2 : 3,
    })),
  };
}

export const useContextStore = create<ContextState>((set, get) => ({
  documents: [],
  repositories: [],
  extractedEntities: emptyEntities,
  isParsingDocument: false,
  isSyncingRepo: false,

  addDocument: async (file: File) => {
    const documentId = generateId();
    const documentType = file.name.split('.').pop()?.toLowerCase() as UploadedDocument['type'];

    const newDocument: UploadedDocument = {
      id: documentId,
      filename: file.name,
      type: documentType || 'pdf',
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    // Add document to state
    set((state) => ({
      documents: [...state.documents, newDocument],
    }));

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update status to parsing
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId ? { ...d, status: 'parsing' as const } : d
      ),
      isParsingDocument: true,
    }));

    try {
      // Simulate parsing
      const extractedData = await simulateDocumentParsing(newDocument);

      // Update document and add extracted entities
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === documentId ? { ...d, status: 'parsed' as const, extractedData } : d
        ),
        extractedEntities: {
          systems: [...state.extractedEntities.systems, ...extractedData.systems],
          networks: [...state.extractedEntities.networks, ...extractedData.networks],
          processes: [...state.extractedEntities.processes, ...extractedData.processes],
          compliance: [...state.extractedEntities.compliance, ...extractedData.compliance],
          recoveryObjectives: [
            ...state.extractedEntities.recoveryObjectives,
            ...extractedData.recoveryObjectives,
          ],
        },
        isParsingDocument: false,
      }));
    } catch {
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === documentId
            ? { ...d, status: 'error' as const, errorMessage: 'Failed to parse document' }
            : d
        ),
        isParsingDocument: false,
      }));
    }
  },

  removeDocument: (documentId: string) => {
    const doc = get().documents.find((d) => d.id === documentId);
    if (!doc) return;

    set((state) => ({
      documents: state.documents.filter((d) => d.id !== documentId),
      extractedEntities: {
        systems: state.extractedEntities.systems.filter(
          (s) => s.sourceDocument !== doc.filename
        ),
        networks: state.extractedEntities.networks.filter(
          (n) => n.sourceDocument !== doc.filename
        ),
        processes: state.extractedEntities.processes.filter(
          (p) => p.sourceDocument !== doc.filename
        ),
        compliance: state.extractedEntities.compliance.filter(
          (c) => c.sourceDocument !== doc.filename
        ),
        recoveryObjectives: state.extractedEntities.recoveryObjectives.filter((r) => {
          const process = state.extractedEntities.processes.find((p) => p.id === r.processId);
          return process?.sourceDocument !== doc.filename;
        }),
      },
    }));
  },

  updateDocumentStatus: (documentId: string, status: UploadedDocument['status'], errorMessage?: string) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId ? { ...d, status, errorMessage } : d
      ),
    }));
  },

  connectRepository: async (type: ConnectedRepository['type'], url: string, name: string) => {
    const repoId = generateId();

    const newRepo: ConnectedRepository = {
      id: repoId,
      type,
      name,
      url,
      status: 'syncing',
    };

    set((state) => ({
      repositories: [...state.repositories, newRepo],
      isSyncingRepo: true,
    }));

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    set((state) => ({
      repositories: state.repositories.map((r) =>
        r.id === repoId
          ? { ...r, status: 'connected' as const, lastSync: new Date(), filesCount: Math.floor(Math.random() * 50) + 10 }
          : r
      ),
      isSyncingRepo: false,
    }));
  },

  disconnectRepository: (repoId: string) => {
    set((state) => ({
      repositories: state.repositories.filter((r) => r.id !== repoId),
    }));
  },

  syncRepository: async (repoId: string) => {
    set((state) => ({
      repositories: state.repositories.map((r) =>
        r.id === repoId ? { ...r, status: 'syncing' as const } : r
      ),
      isSyncingRepo: true,
    }));

    await new Promise((resolve) => setTimeout(resolve, 1500));

    set((state) => ({
      repositories: state.repositories.map((r) =>
        r.id === repoId
          ? { ...r, status: 'connected' as const, lastSync: new Date() }
          : r
      ),
      isSyncingRepo: false,
    }));
  },

  addExtractedSystem: (system: ExtractedSystem) => {
    set((state) => ({
      extractedEntities: {
        ...state.extractedEntities,
        systems: [...state.extractedEntities.systems, system],
      },
    }));
  },

  addExtractedNetwork: (network: ExtractedNetwork) => {
    set((state) => ({
      extractedEntities: {
        ...state.extractedEntities,
        networks: [...state.extractedEntities.networks, network],
      },
    }));
  },

  addBusinessProcess: (process: BusinessProcess) => {
    set((state) => ({
      extractedEntities: {
        ...state.extractedEntities,
        processes: [...state.extractedEntities.processes, process],
      },
    }));
  },

  addComplianceRequirement: (requirement: ComplianceRequirement) => {
    set((state) => ({
      extractedEntities: {
        ...state.extractedEntities,
        compliance: [...state.extractedEntities.compliance, requirement],
      },
    }));
  },

  loadScenarioContext: (context: OrganizationContext) => {
    set({
      documents: context.documents,
      repositories: context.repositories,
      extractedEntities: context.extractedEntities,
    });
  },

  resetContext: () => {
    set({
      documents: [],
      repositories: [],
      extractedEntities: emptyEntities,
      isParsingDocument: false,
      isSyncingRepo: false,
    });
  },
}));
