// ─── Auth ──────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'coordinator' | 'supervisor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber?: string; // students only
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: Omit<AuthUser, 'token'>;
}

// ─── Student ───────────────────────────────────────────────────────────────

export type AttachmentStatus = 'active' | 'pending' | 'completed';

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  school: string;
  yearOfStudy: number;
  placementId?: string;
  status: AttachmentStatus;
}

// ─── Placement ─────────────────────────────────────────────────────────────

export interface Placement {
  id: string;
  studentId: string;
  companyId: string;
  companyName: string;
  department: string;
  location: string;
  startDate: string; // ISO date string
  endDate: string;
  stationSupervisorId?: string;
  universitySupervisorId?: string;
  status: AttachmentStatus;
}

export interface PlacementProgress {
  placement: Placement;
  daysTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  completionPercent: number;
}

// ─── Weekly Log ────────────────────────────────────────────────────────────

export type LogStatus = 'submitted' | 'pending' | 'reviewed' | 'missing';

export interface WeeklyLog {
  id: string;
  studentId: string;
  placementId: string;
  weekNumber: number;
  weekStart: string; // ISO date
  weekEnd: string;
  activityDescription: string;
  fileUrl?: string;
  status: LogStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerComment?: string;
}

export interface LogSubmitPayload {
  weekNumber: number;
  activityDescription: string;
  file?: File;
}

// ─── Supervisor ────────────────────────────────────────────────────────────

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'station' | 'university';
  maxStudents?: number;
  assignedStudents?: number;
}

// ─── Company ───────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  placementHistory: number; // years
  activeStudents: number;
}

// ─── Analytics / KPI ───────────────────────────────────────────────────────

export interface CoordinatorKPIs {
  totalStudents: number;
  placedPercent: number;
  visitedPercent: number;
  missingLogsCount: number;
  onTrackPercent: number;
}

// ─── Notification ──────────────────────────────────────────────────────────

export type NotifType = 'warning' | 'info' | 'danger';

export interface AppNotification {
  id: string;
  type: NotifType;
  message: string;
  createdAt: string;
  read: boolean;
}

// ─── API wrappers ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
