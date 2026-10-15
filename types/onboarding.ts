// Onboarding Tutorial Types

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for tooltip positioning
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'scroll' | 'input' | 'navigate';
  route?: string; // For navigation steps
  completed: boolean;
  optional?: boolean;
};

export type OnboardingFlow = {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  currentStep: number;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
};

export type OnboardingProgress = {
  userId: string;
  flows: Record<string, OnboardingFlow>;
  currentFlowId?: string;
  dismissed: boolean;
};

// Predefined onboarding flows
export const ONBOARDING_FLOWS = {
  INITIAL_SETUP: 'initial-setup',
  TENDER_DISCOVERY: 'tender-discovery',
  BID_INTELLIGENCE: 'bid-intelligence',
  PROFILE_OPTIMIZATION: 'profile-optimization',
} as const;

export type OnboardingFlowId = typeof ONBOARDING_FLOWS[keyof typeof ONBOARDING_FLOWS];
