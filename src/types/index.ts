export type UserRole = "investor" | "target" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TemplateCategory = "equity" | "merger" | "financing" | "custom";

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  items: TemplateItem[];
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  sections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = "equity" | "merger" | "financing";
export type ProjectStatus = "active" | "completed" | "archived";
export type ItemStatus = "pending" | "uploaded" | "in_review" | "approved" | "questioned" | "supplement_needed";

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  result: "approved" | "questioned" | "supplement_needed";
  comment: string;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  reviews: Review[];
  allowDownload: boolean;
  allowPrint: boolean;
  hasWatermark: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  status: ItemStatus;
  files: UploadedFile[];
}

export interface ProjectSection {
  id: string;
  name: string;
  order: number;
  items: ProjectItem[];
}

export interface WatermarkConfig {
  enabled: boolean;
  textTemplate: string;
  fontSize: number;
  opacity: number;
  rotation: number;
}

export interface SecurityRule {
  targetId: string;
  targetType: "item" | "section" | "project";
  allowDownload: boolean;
  allowPrint: boolean;
  allowShare: boolean;
}

export interface ExportPreset {
  id: string;
  projectId: string;
  name: string;
  description: string;
  icon: string;
  scope: "all" | "approved" | "sections" | "filtered";
  sectionIds: string[];
  watermarkEnabled: boolean;
  includePendingItems: boolean;
  searchKeyword?: string;
  statusFilter?: "all" | ItemStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportFileRef {
  fileId: string;
  fileName: string;
  itemId: string;
  itemName: string;
  sectionId: string;
  sectionName: string;
  size: number;
  watermarked: boolean;
  wrappedInHtml: boolean;
  blocked: boolean;
  blockReason?: string;
}

export interface ExportRecord {
  id: string;
  projectId: string;
  exportedBy: string;
  exportedByName: string;
  exportedAt: string;
  scope: "all" | "approved" | "sections" | "filtered";
  scopeDescription: string;
  sectionIds?: string[];
  watermarkEnabled: boolean;
  includePendingItems: boolean;
  fileCount: number;
  packageSizeBytes: number;
  presetId?: string;
  presetName?: string;
  searchKeyword?: string;
  statusFilter?: "all" | ItemStatus;
  files: ExportFileRef[];
  blockedFiles: ExportFileRef[];
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  templateId: string;
  sections: ProjectSection[];
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  watermarkConfig: WatermarkConfig;
  securityRules: SecurityRule[];
  exportRecords: ExportRecord[];
  exportPresets: ExportPreset[];
}

export type QuestionStatus = "open" | "replied" | "closed";

export interface Reply {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  attachments: string[];
  createdAt: string;
}

export interface Question {
  id: string;
  projectId: string;
  itemId: string;
  itemName: string;
  fileId?: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  status: QuestionStatus;
  replies: Reply[];
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  projectName: string;
  action: string;
  detail: string;
  userName: string;
  timestamp: string;
}
