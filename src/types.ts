// --- TYPES ---

export type PipelineType = "discovery" | "application" | "networking";

export const STAGES_DISCOVERY = [
  "OPPORTUNITY_FOUND",
  "OPPORTUNITY_QUALIFIED",
  "ARCHIVED",
];

export const STAGES_APPLICATION = [
  "ACCEPTED",
  "CV_TAILORED",
  "SUBMITTED",
  "FOLLOWED_UP",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
];

export const STAGES_NETWORKING = [
  "PERSON_IDENTIFIED",
  "CONTACTED",
  "CONVERSATION_STARTED",
  "REFERRAL_OR_LEAD",
  "CONVERTED_TO_OPP",
  "CLOSED",
];

export interface Profile {
  full_name: string;
  role_focus: string[];
  deadline_date: string;
  weekly_targets: {
    applications: number;
    outreaches: number;
    new_companies: number;
  };
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
  industry?: string;
  notes?: string;
  created_at: string;
}

export interface Opportunity {
  id: string;
  company_name: string;
  title: string;
  status: string;
  pipeline: PipelineType;
  priority: "low" | "medium" | "high";
  updated_at: string;
  description?: string;
  url?: string;
}

export interface Contact {
  id: string;
  name: string;
  role_title: string;
  company_name: string;
  status: string;
  notes?: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  related_entity_id?: string;
  related_entity_name?: string;
  comments?: string;
}

export interface LogEntry {
  id: string;
  action_type: string;
  created_at: string;
  details?: string;
}

// --- DEFAULTS ---
export const DEFAULT_PROFILE: Profile = {
  full_name: "Engineer",
  role_focus: ["Embedded Systems", "Firmware"],
  deadline_date: new Date(new Date().getFullYear(), 7, 15)
    .toISOString()
    .split("T")[0], // Mid-August
  weekly_targets: { applications: 5, outreaches: 10, new_companies: 10 },
};
