export type OkrHealth = "on_track" | "at_risk" | "off_track";
export type OkrInitiativeStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";
export type OkrObjectiveStatus = "active" | "completed" | "cancelled";
export type OkrMetricType = "auto" | "manual";

export interface OkrOwner {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  role?: string;
  role_name?: string;
}

export interface OkrCheckIn {
  id: number;
  key_result_id: number;
  value: number;
  note?: string;
  is_automated: boolean;
  recorded_by?: number;
  recorder?: OkrOwner;
  recorded_at: string;
}

export interface OkrInitiative {
  id: number;
  key_result_id: number;
  title: string;
  description?: string;
  status: OkrInitiativeStatus;
  owner_id: number;
  owner?: OkrOwner;
  due_date?: string;
}

export interface OkrKeyResult {
  id: number;
  objective_id: number;
  title: string;
  description?: string;
  metric_key?: string;
  metric_type: OkrMetricType;
  unit: string;
  start_value: number;
  current_value: number;
  target_value: number;
  owner_id: number;
  owner?: OkrOwner;
  due_date: string;
  health_status: OkrHealth;
  last_refreshed_at?: string;
  progress: number;
  pace?: number;
  can_check_in?: boolean;
  initiatives?: OkrInitiative[];
  check_ins?: OkrCheckIn[];
}

export interface OkrObjective {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  owner?: OkrOwner;
  quarter: string;
  status: OkrObjectiveStatus;
  parent_id?: number;
  department?: string;
  health: OkrHealth;
  progress: number;
  krs_summary: {
    total: number;
    on_track: number;
    at_risk: number;
    off_track: number;
  };
  key_results: OkrKeyResult[];
  children: OkrObjective[];
}

export interface OkrObjectivesResponse {
  quarter: string;
  health_score: number;
  objectives: OkrObjective[];
  user_role: string;
  can_manage: boolean;
}

export interface OkrCompanyHealthResponse {
  health_score: number;
  quarter: string;
  breakdown: {
    on_track: number;
    at_risk: number;
    off_track: number;
    total: number;
  };
  attention_needed: Array<{
    id: number;
    title: string;
    health: OkrHealth;
    progress: number;
    objective?: string;
    owner?: string;
  }>;
}

export interface BindableMetrics {
  [group: string]: {
    [metricKey: string]: string;
  };
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  quarter: string;
  department?: string;
  parent_id?: number;
  owner_id?: number;
}

export interface CreateKeyResultInput {
  objective_id: number;
  title: string;
  description?: string;
  metric_key?: string;
  metric_type: OkrMetricType;
  unit?: string;
  start_value: number;
  target_value: number;
  due_date: string;
  owner_id?: number;
}

export interface CreateInitiativeInput {
  key_result_id: number;
  title: string;
  description?: string;
  due_date?: string;
  owner_id?: number;
}

export interface CheckInInput {
  value: number;
  note?: string;
}
