/**
 * Central store exports for the Forensic Prototype application
 *
 * This file re-exports all Zustand stores for easy importing throughout the app.
 */

export { useThemeStore } from './themeStore';
export { useSessionStore } from './sessionStore';
export { useContextStore } from './contextStore';
export { useValidationStore } from './validationStore';

// Re-export types that are commonly used with stores
export type { Session, WorkflowStep, ScenarioType } from '@/types';
