import { create } from "zustand";
import {
  Project, Template, Question, ActivityLog, User,
  ProjectItem, UploadedFile, Review, ProjectSection,
  WatermarkConfig, SecurityRule, Reply,
} from "@/types";
import { defaultTemplates } from "@/data/templates";

const currentUser: User = {
  id: "u1",
  name: "张明远",
  email: "zhangmy@investcap.com",
  role: "investor",
};

const targetUser: User = {
  id: "u2",
  name: "李思涵",
  email: "lisihan@targetco.com",
  role: "target",
};

function createSampleProject1(): Project {
  const tpl = defaultTemplates[0];
  const sections: ProjectSection[] = tpl.sections.map((s, si) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    items: s.items.map((item, ii) => {
      const statuses: ProjectItem["status"][] = ["approved", "uploaded", "in_review", "questioned", "supplement_needed", "pending"];
      const statusIndex = (si * 7 + ii) % 6;
      const status = statuses[statusIndex];
      const files: UploadedFile[] = [];
      if (status !== "pending") {
        const reviews: Review[] = [];
        if (status === "approved") {
          reviews.push({
            id: `rev-${item.id}-1`,
            reviewerId: "u1",
            reviewerName: "张明远",
            result: "approved",
            comment: "材料完整，审核通过",
            createdAt: "2025-06-10T14:30:00Z",
          });
        } else if (status === "questioned") {
          reviews.push({
            id: `rev-${item.id}-1`,
            reviewerId: "u1",
            reviewerName: "张明远",
            result: "questioned",
            comment: "文件内容不完整，请补充最新版本",
            createdAt: "2025-06-11T09:15:00Z",
          });
        } else if (status === "supplement_needed") {
          reviews.push({
            id: `rev-${item.id}-1`,
            reviewerId: "u1",
            reviewerName: "张明远",
            result: "supplement_needed",
            comment: "缺少关键页，请补充上传",
            createdAt: "2025-06-11T10:00:00Z",
          });
        } else if (status === "in_review") {
          // no reviews yet
        }
        files.push({
          id: `file-${item.id}-1`,
          name: `${item.name}.pdf`,
          size: 1024 * (100 + ii * 50),
          type: "application/pdf",
          uploadedBy: "u2",
          uploadedAt: "2025-06-09T16:00:00Z",
          reviews,
          allowDownload: true,
          allowPrint: true,
          hasWatermark: true,
        });
      }
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        required: item.required,
        acceptedFormats: item.acceptedFormats,
        status,
        files,
      };
    }),
  }));

  return {
    id: "proj-1",
    name: "华创科技股权投资尽调",
    type: "equity",
    status: "active",
    templateId: tpl.id,
    sections,
    assignedTo: ["u2"],
    createdBy: "u1",
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-06-15T17:30:00Z",
    watermarkConfig: {
      enabled: true,
      textTemplate: "{name} - {email} - {date}",
      fontSize: 14,
      opacity: 0.15,
      rotation: -30,
    },
    securityRules: [
      { targetId: "proj-1", targetType: "project", allowDownload: false, allowPrint: false, allowShare: false },
    ],
  };
}

function createSampleProject2(): Project {
  const tpl = defaultTemplates[1];
  const sections: ProjectSection[] = tpl.sections.map((s, si) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    items: s.items.slice(0, 5).map((item, ii) => {
      const statuses: ProjectItem["status"][] = ["approved", "uploaded", "pending", "pending", "pending"];
      const status = statuses[ii % 5];
      const files: UploadedFile[] = [];
      if (status !== "pending") {
        const reviews: Review[] = [];
        if (status === "approved") {
          reviews.push({
            id: `rev-${item.id}-1`,
            reviewerId: "u1",
            reviewerName: "张明远",
            result: "approved",
            comment: "资料齐全",
            createdAt: "2025-06-12T11:00:00Z",
          });
        }
        files.push({
          id: `file-${item.id}-1`,
          name: `${item.name}.pdf`,
          size: 1024 * (200 + ii * 80),
          type: "application/pdf",
          uploadedBy: "u2",
          uploadedAt: "2025-06-10T14:00:00Z",
          reviews,
          allowDownload: true,
          allowPrint: false,
          hasWatermark: true,
        });
      }
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        required: item.required,
        acceptedFormats: item.acceptedFormats,
        status,
        files,
      };
    }),
  }));

  return {
    id: "proj-2",
    name: "盛达集团并购尽调",
    type: "merger",
    status: "active",
    templateId: tpl.id,
    sections,
    assignedTo: ["u2"],
    createdBy: "u1",
    createdAt: "2025-06-05T09:00:00Z",
    updatedAt: "2025-06-14T15:00:00Z",
    watermarkConfig: {
      enabled: true,
      textTemplate: "机密 - {name} - {date}",
      fontSize: 16,
      opacity: 0.2,
      rotation: -25,
    },
    securityRules: [
      { targetId: "proj-2", targetType: "project", allowDownload: false, allowPrint: false, allowShare: false },
    ],
  };
}

const sampleQuestions: Question[] = [
  {
    id: "q1",
    projectId: "proj-1",
    itemId: "eq-2-3",
    itemName: "银行对账单",
    fileId: "file-eq-2-3-1",
    title: "银行对账单不完整",
    content: "提供的中国银行对账单仅包含6个月数据，请补充完整12个月的对账单。",
    createdBy: "u1",
    createdByName: "张明远",
    status: "replied",
    replies: [
      {
        id: "r1",
        content: "已补充完整年度对账单，请查看新上传的文件。",
        createdBy: "u2",
        createdByName: "李思涵",
        attachments: [],
        createdAt: "2025-06-14T10:30:00Z",
      },
    ],
    createdAt: "2025-06-13T09:00:00Z",
  },
  {
    id: "q2",
    projectId: "proj-1",
    itemId: "eq-3-1",
    itemName: "诉讼仲裁情况",
    title: "诉讼案件详情缺失",
    content: "诉讼清单中仅列明了案件名称，请补充各案件的起诉状、答辩状及最新进展。",
    createdBy: "u1",
    createdByName: "张明远",
    status: "open",
    replies: [],
    createdAt: "2025-06-14T15:00:00Z",
  },
  {
    id: "q3",
    projectId: "proj-1",
    itemId: "eq-4-2",
    itemName: "主要客户清单",
    title: "客户集中度风险",
    content: "前两大客户合计占比超过60%，请说明客户集中度风险及应对措施。",
    createdBy: "u1",
    createdByName: "张明远",
    status: "closed",
    replies: [
      {
        id: "r2",
        content: "我们正在积极拓展新客户，已与3家潜在客户进入商务洽谈阶段，详见附件的客户拓展计划。",
        createdBy: "u2",
        createdByName: "李思涵",
        attachments: [],
        createdAt: "2025-06-12T11:00:00Z",
      },
      {
        id: "r3",
        content: "收到，请持续关注新客户拓展进展。",
        createdBy: "u1",
        createdByName: "张明远",
        attachments: [],
        createdAt: "2025-06-12T14:00:00Z",
      },
    ],
    createdAt: "2025-06-11T16:00:00Z",
  },
];

const sampleActivities: ActivityLog[] = [
  { id: "a1", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "审核通过", detail: "审核通过「公司营业执照」", userName: "张明远", timestamp: "2025-06-15T17:30:00Z" },
  { id: "a2", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "文件上传", detail: "上传了「公司章程」", userName: "李思涵", timestamp: "2025-06-15T15:20:00Z" },
  { id: "a3", projectId: "proj-2", projectName: "盛达集团并购尽调", action: "发起提问", detail: "对「战略规划文件」发起提问", userName: "张明远", timestamp: "2025-06-14T16:00:00Z" },
  { id: "a4", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "回复问题", detail: "回复了「银行对账单不完整」的问题", userName: "李思涵", timestamp: "2025-06-14T10:30:00Z" },
  { id: "a5", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "标记疑问", detail: "对「诉讼仲裁情况」标记有疑问", userName: "张明远", timestamp: "2025-06-14T09:15:00Z" },
  { id: "a6", projectId: "proj-2", projectName: "盛达集团并购尽调", action: "文件上传", detail: "上传了「管理账明细」", userName: "李思涵", timestamp: "2025-06-13T14:00:00Z" },
  { id: "a7", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "创建项目", detail: "创建了尽调项目", userName: "张明远", timestamp: "2025-06-01T08:00:00Z" },
  { id: "a8", projectId: "proj-2", projectName: "盛达集团并购尽调", action: "创建项目", detail: "创建了尽调项目", userName: "张明远", timestamp: "2025-06-05T09:00:00Z" },
];

interface AppState {
  currentUser: User;
  targetUser: User;
  projects: Project[];
  templates: Template[];
  questions: Question[];
  activities: ActivityLog[];
  currentViewRole: "investor" | "target";

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addItemFile: (projectId: string, itemId: string, file: UploadedFile) => void;
  updateItemStatus: (projectId: string, itemId: string, status: ProjectItem["status"]) => void;
  addReview: (projectId: string, itemId: string, fileId: string, review: Review) => void;

  addQuestion: (question: Question) => void;
  addReply: (questionId: string, reply: Reply) => void;
  updateQuestionStatus: (questionId: string, status: Question["status"]) => void;

  addActivity: (activity: ActivityLog) => void;

  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;

  updateWatermarkConfig: (projectId: string, config: WatermarkConfig) => void;
  updateSecurityRule: (projectId: string, rule: SecurityRule) => void;

  switchViewRole: (role: "investor" | "target") => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser,
  targetUser,
  projects: [createSampleProject1(), createSampleProject2()],
  templates: [...defaultTemplates],
  questions: [...sampleQuestions],
  activities: [...sampleActivities],
  currentViewRole: "investor",

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  addItemFile: (projectId, itemId, file) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              sections: p.sections.map((s) => ({
                ...s,
                items: s.items.map((item) =>
                  item.id === itemId
                    ? { ...item, files: [...item.files, file], status: "uploaded" as const }
                    : item
                ),
              })),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  updateItemStatus: (projectId, itemId, status) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              sections: p.sections.map((s) => ({
                ...s,
                items: s.items.map((item) =>
                  item.id === itemId ? { ...item, status } : item
                ),
              })),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addReview: (projectId, itemId, fileId, review) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              sections: p.sections.map((s) => ({
                ...s,
                items: s.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        status: review.result === "approved" ? "approved" as const : review.result === "questioned" ? "questioned" as const : "supplement_needed" as const,
                        files: item.files.map((f) =>
                          f.id === fileId ? { ...f, reviews: [...f.reviews, review] } : f
                        ),
                      }
                    : item
                ),
              })),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addQuestion: (question) =>
    set((state) => ({ questions: [...state.questions, question] })),

  addReply: (questionId, reply) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? { ...q, replies: [...q.replies, reply], status: "replied" as const }
          : q
      ),
    })),

  updateQuestionStatus: (questionId, status) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, status } : q
      ),
    })),

  addActivity: (activity) =>
    set((state) => ({ activities: [activity, ...state.activities] })),

  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),

  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),

  updateWatermarkConfig: (projectId, config) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, watermarkConfig: config } : p
      ),
    })),

  updateSecurityRule: (projectId, rule) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              securityRules: [
                ...p.securityRules.filter((r) => r.targetId !== rule.targetId),
                rule,
              ],
            }
          : p
      ),
    })),

  switchViewRole: (role) => set({ currentViewRole: role }),
}));
