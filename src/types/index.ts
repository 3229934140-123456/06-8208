export type UserRole = 'ministry' | 'province' | 'school' | 'center' | 'liaison' | 'counselor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  province?: string;
  schoolId?: string;
}

export type SchoolType = '本科' | '专科' | '高职';

export interface School {
  id: string;
  name: string;
  province: string;
  type: SchoolType;
  studentCount: number;
  warningCount: number;
  avgResponseHours: number;
  resolutionRate: number;
}

export interface ProvinceData {
  name: string;
  value: number;
  studentCount: number;
  highRiskCount: number;
  warningCount: number;
}

export interface KPIData {
  totalStudents: number;
  totalStudentsYoY: number;
  riskStudents: number;
  riskStudentsYoY: number;
  resolutionRate: number;
  resolutionRateYoY: number;
  avgResponseHours: number;
  avgResponseHoursYoY: number;
}

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';

export type WarningLevel = 1 | 2;

export type TriggerType = 'emotion' | 'assessment' | 'behavior' | 'composite';

export type WarningStatus = 'pending' | 'processing' | 'approved' | 'resolved' | 'rejected';

export interface WarningRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  schoolName: string;
  college: string;
  major: string;
  grade: string;
  level: WarningLevel;
  riskLevel: RiskLevel;
  triggerType: TriggerType;
  triggerReason: string;
  emotionIndex: number;
  depressionScore: number;
  createdAt: string;
  updatedAt: string;
  escalatedAt?: string;
  status: WarningStatus;
  statusText: string;
  approvalStage?: 0 | 1 | 2 | 3;
  approvals: ApprovalRecord[];
  interventions: InterventionRecord[];
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRecord {
  id: string;
  warningId: string;
  stage: 1 | 2 | 3;
  stageName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  comment?: string;
  createdAt: string;
}

export type InterventionType = 'counsel' | 'referral' | 'contact_family' | 'follow_up' | 'other';

export interface InterventionRecord {
  id: string;
  warningId: string;
  type: InterventionType;
  typeName: string;
  operatorId: string;
  operatorName: string;
  description: string;
  createdAt: string;
  nextFollowUpAt?: string;
}

export type Gender = '男' | '女';

export interface StudentProfile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  studentNo: string;
  schoolId: string;
  schoolName: string;
  college: string;
  major: string;
  grade: string;
  className: string;
  phone?: string;
  counselor: string;
  currentEmotionIndex: number;
  riskLevel: RiskLevel;
  warningCount: number;
  assessmentHistory: AssessmentRecord[];
  emotionHistory: EmotionPoint[];
  warningHistory: WarningRecord[];
  medicalHistory?: string;
  familyHistory?: string;
  tags: string[];
}

export type AssessmentDimension = 'depression' | 'anxiety' | 'stress' | 'sleep' | 'social';

export type AssessmentLevel = '正常' | '轻度' | '中度' | '重度';

export interface DimensionResult {
  score: number;
  level: AssessmentLevel;
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  assessmentName: string;
  assessmentDate: string;
  overallScore: number;
  dimensions: Record<AssessmentDimension, DimensionResult>;
  conclusion: string;
  isRetest: boolean;
  improvedPercent?: number;
}

export type EmotionSource = 'social' | 'app_usage' | 'counsel' | 'assessment';

export interface EmotionPoint {
  date: string;
  value: number;
  source: EmotionSource;
}

export interface CollegeEmotionTrend {
  collegeName: string;
  data: EmotionPoint[];
}

export type CrisisEventType = 'warning' | 'approve' | 'intervene' | 'resolve' | 'followup';

export interface CrisisEvent {
  id: string;
  time: string;
  type: CrisisEventType;
  typeName: string;
  title: string;
  description: string;
  operator?: string;
}

export type ReportScope = 'national' | 'province' | 'school';

export interface TopRiskSchool {
  name: string;
  warningCount: number;
}

export interface ReportCharts {
  riskTrend: { date: string; safe: number; low: number; medium: number; high: number }[];
  dimensionDistribution: { dimension: string; normal: number; mild: number; moderate: number; severe: number }[];
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  scope: ReportScope;
  scopeName: string;
  riskDistribution: Record<RiskLevel, number>;
  avgResponseHours: number;
  avgResponseCompared: number;
  retestImprovementRate: number;
  retestImprovementCompared: number;
  totalWarnings: number;
  warningsCompared: number;
  resolvedWarnings: number;
  recommendations: string[];
  summary: string;
  topRiskSchools?: TopRiskSchool[];
  charts: ReportCharts;
}
