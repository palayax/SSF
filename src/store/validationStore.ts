import { create } from 'zustand';
import type {
  ValidationState,
  SystemValidation,
  ValidationMethod,
  ValidationResult,
  Discrepancy,
  ExtractedSystem,
} from '@/types';

interface ValidationStoreState extends ValidationState {
  // Actions
  initializeFromSystems: (systems: ExtractedSystem[]) => void;
  setAutoValidate: (enabled: boolean) => void;
  validateSystem: (systemId: string, methods?: ValidationMethod[]) => Promise<void>;
  validateAllSystems: () => Promise<void>;
  revalidateFailed: () => Promise<void>;
  clearValidation: (systemId: string) => void;
  resetValidation: () => void;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate validation result (mock)
 */
async function simulateValidation(
  system: SystemValidation,
  method: ValidationMethod
): Promise<{ result: ValidationResult; discrepancy?: Discrepancy }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  // Random success/failure with weighted probability (80% success)
  const isSuccess = Math.random() > 0.2;

  const result: ValidationResult = {
    method,
    status: isSuccess ? 'success' : 'failed',
    timestamp: new Date(),
    message: isSuccess
      ? getSuccessMessage(method, system)
      : getFailureMessage(method, system),
    details: isSuccess ? getSuccessDetails(method, system) : getFailureDetails(method, system),
  };

  let discrepancy: Discrepancy | undefined;

  if (!isSuccess) {
    discrepancy = {
      id: generateId(),
      systemId: system.systemId,
      hostname: system.hostname,
      type: getDiscrepancyType(method),
      severity: method === 'ad_lookup' || method === 'cert_check' ? 'critical' : 'warning',
      description: result.message || 'Validation failed',
      documented: system.documentedIP,
      actual: getActualValue(method, system),
    };
  }

  return { result, discrepancy };
}

function getSuccessMessage(method: ValidationMethod, system: SystemValidation): string {
  const messages: Record<ValidationMethod, string> = {
    ping: `Host ${system.hostname} (${system.documentedIP}) is reachable`,
    dns: `Hostname ${system.hostname} resolves to ${system.documentedIP}`,
    spn: `SPN registered for ${system.hostname} in Active Directory`,
    ad_lookup: `Computer object ${system.hostname} found in Active Directory`,
    port_scan: `Expected services responding on ${system.hostname}`,
    cert_check: `SSL/TLS certificate valid for ${system.hostname}`,
  };
  return messages[method];
}

function getFailureMessage(method: ValidationMethod, system: SystemValidation): string {
  const messages: Record<ValidationMethod, string> = {
    ping: `Host ${system.hostname} (${system.documentedIP}) is not responding`,
    dns: `Hostname ${system.hostname} does not resolve to documented IP`,
    spn: `No SPN found for ${system.hostname} in Active Directory`,
    ad_lookup: `Computer object ${system.hostname} not found in Active Directory`,
    port_scan: `Expected services not responding on ${system.hostname}`,
    cert_check: `SSL/TLS certificate expired or invalid for ${system.hostname}`,
  };
  return messages[method];
}

function getSuccessDetails(method: ValidationMethod, system: SystemValidation): Record<string, unknown> {
  const details: Record<ValidationMethod, Record<string, unknown>> = {
    ping: { latency: `${Math.floor(Math.random() * 50) + 1}ms`, packetLoss: '0%' },
    dns: { resolvedIP: system.documentedIP, ttl: 3600 },
    spn: { spn: `HOST/${system.hostname}`, realm: 'CORP.LOCAL' },
    ad_lookup: { ou: 'OU=Servers,DC=corp,DC=local', enabled: true },
    port_scan: { openPorts: [22, 80, 443], closedPorts: [] },
    cert_check: { issuer: 'Corp Internal CA', expiresIn: '180 days' },
  };
  return details[method];
}

function getFailureDetails(method: ValidationMethod, system: SystemValidation): Record<string, unknown> {
  const details: Record<ValidationMethod, Record<string, unknown>> = {
    ping: { packetLoss: '100%', timeout: '3000ms' },
    dns: { resolvedIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, expected: system.documentedIP },
    spn: { searched: `HOST/${system.hostname}`, found: null },
    ad_lookup: { searched: system.hostname, found: false },
    port_scan: { openPorts: [], expectedPorts: [22, 80, 443] },
    cert_check: { error: 'Certificate expired', expiredDays: Math.floor(Math.random() * 30) + 1 },
  };
  return details[method];
}

function getDiscrepancyType(method: ValidationMethod): Discrepancy['type'] {
  const types: Record<ValidationMethod, Discrepancy['type']> = {
    ping: 'ip_mismatch',
    dns: 'dns_mismatch',
    spn: 'missing_spn',
    ad_lookup: 'not_in_ad',
    port_scan: 'missing_service',
    cert_check: 'cert_expired',
  };
  return types[method];
}

function getActualValue(method: ValidationMethod, _system: SystemValidation): string {
  const values: Record<ValidationMethod, string> = {
    ping: 'No response',
    dns: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    spn: 'Not found',
    ad_lookup: 'Not found',
    port_scan: 'No services responding',
    cert_check: 'Expired',
  };
  return values[method];
}

function getDefaultMethods(criticality: ExtractedSystem['criticality']): ValidationMethod[] {
  if (criticality === 'critical') {
    return ['ping', 'dns', 'ad_lookup', 'spn', 'port_scan', 'cert_check'];
  } else if (criticality === 'high') {
    return ['ping', 'dns', 'ad_lookup', 'port_scan'];
  }
  return ['ping', 'dns'];
}

function calculateOverallStatus(results: ValidationResult[]): SystemValidation['overallStatus'] {
  if (results.length === 0) return 'pending';
  if (results.some((r) => r.status === 'pending')) return 'pending';
  if (results.every((r) => r.status === 'success')) return 'verified';
  if (results.some((r) => r.status === 'failed')) return 'failed';
  return 'unknown';
}

export const useValidationStore = create<ValidationStoreState>((set, get) => ({
  systems: [],
  autoValidateEnabled: false,
  discrepancies: [],
  isValidating: false,

  initializeFromSystems: (systems: ExtractedSystem[]) => {
    const validationSystems: SystemValidation[] = systems.map((sys) => ({
      systemId: sys.id,
      hostname: sys.hostname,
      documentedIP: sys.ip || 'N/A',
      role: sys.role,
      criticality: sys.criticality,
      validationMethods: getDefaultMethods(sys.criticality),
      results: [],
      overallStatus: 'pending',
    }));

    set({ systems: validationSystems, discrepancies: [] });
  },

  setAutoValidate: (enabled: boolean) => {
    set({ autoValidateEnabled: enabled });

    // If enabling, run validation
    if (enabled) {
      get().validateAllSystems();
    }
  },

  validateSystem: async (systemId: string, methods?: ValidationMethod[]) => {
    const system = get().systems.find((s) => s.systemId === systemId);
    if (!system) return;

    const methodsToRun = methods || system.validationMethods;

    set({ isValidating: true });

    // Clear previous results for these methods
    set((state) => ({
      systems: state.systems.map((s) =>
        s.systemId === systemId
          ? {
              ...s,
              results: s.results.filter((r) => !methodsToRun.includes(r.method)),
              overallStatus: 'pending' as const,
            }
          : s
      ),
      discrepancies: state.discrepancies.filter(
        (d) => d.systemId !== systemId
      ),
    }));

    // Run validations sequentially
    for (const method of methodsToRun) {
      const { result, discrepancy } = await simulateValidation(system, method);

      set((state) => {
        const updatedSystems = state.systems.map((s) => {
          if (s.systemId !== systemId) return s;

          const newResults = [...s.results, result];
          return {
            ...s,
            results: newResults,
            overallStatus: calculateOverallStatus(newResults),
            lastChecked: new Date(),
          };
        });

        const updatedDiscrepancies = discrepancy
          ? [...state.discrepancies, discrepancy]
          : state.discrepancies;

        return {
          systems: updatedSystems,
          discrepancies: updatedDiscrepancies,
        };
      });
    }

    set({ isValidating: false, lastFullValidation: new Date() });
  },

  validateAllSystems: async () => {
    const { systems } = get();

    set({ isValidating: true });

    for (const system of systems) {
      await get().validateSystem(system.systemId);
    }

    set({ isValidating: false, lastFullValidation: new Date() });
  },

  revalidateFailed: async () => {
    const { systems } = get();
    const failedSystems = systems.filter((s) => s.overallStatus === 'failed');

    set({ isValidating: true });

    for (const system of failedSystems) {
      const failedMethods = system.results
        .filter((r) => r.status === 'failed')
        .map((r) => r.method);

      await get().validateSystem(system.systemId, failedMethods);
    }

    set({ isValidating: false });
  },

  clearValidation: (systemId: string) => {
    set((state) => ({
      systems: state.systems.map((s) =>
        s.systemId === systemId
          ? { ...s, results: [], overallStatus: 'pending' as const, lastChecked: undefined }
          : s
      ),
      discrepancies: state.discrepancies.filter((d) => d.systemId !== systemId),
    }));
  },

  resetValidation: () => {
    set({
      systems: [],
      autoValidateEnabled: false,
      discrepancies: [],
      isValidating: false,
      lastFullValidation: undefined,
    });
  },
}));
