import { create } from "zustand";
import {
  Project, Template, Question, ActivityLog, User,
  ProjectItem, UploadedFile, Review, ProjectSection,
  WatermarkConfig, SecurityRule, Reply, ProjectType, ExportRecord, ExportPreset,
} from "@/types";
import { defaultTemplates } from "@/data/templates";

const STORAGE_KEY = "duediligence-store-v1";

export const users: User[] = [
  { id: "u1", name: "张明远", email: "zhangmy@investcap.com", role: "investor" },
  { id: "u2", name: "李思涵", email: "lisihan@targetco.com", role: "target" },
  { id: "u3", name: "王建国", email: "wangjg@companyb.com", role: "target" },
  { id: "u4", name: "刘薇", email: "liuwei@investcap.com", role: "investor" },
];

function makeInitialProjects(): Project[] {
  const projects: Project[] = [];
  const tpls = defaultTemplates;

  for (let pi = 0; pi < 2; pi++) {
    const tpl = tpls[pi];
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
              id: `rev-${item.id}-${pi}-1`,
              reviewerId: "u1",
              reviewerName: "张明远",
              result: "approved",
              comment: "材料完整，审核通过",
              createdAt: `2025-06-10T14:3${ii}:00Z`,
            });
          } else if (status === "questioned") {
            reviews.push({
              id: `rev-${item.id}-${pi}-1`,
              reviewerId: "u1",
              reviewerName: "张明远",
              result: "questioned",
              comment: "文件内容不完整，请补充最新版本",
              createdAt: `2025-06-11T09:1${ii}:00Z`,
            });
          } else if (status === "supplement_needed") {
            reviews.push({
              id: `rev-${item.id}-${pi}-1`,
              reviewerId: "u1",
              reviewerName: "张明远",
              result: "supplement_needed",
              comment: "缺少关键页，请补充上传",
              createdAt: `2025-06-11T10:0${ii}:00Z`,
            });
          }
          files.push({
            id: `file-${item.id}-${pi}-1`,
            name: `${item.name}.pdf`,
            size: 1024 * (100 + ii * 50),
            type: "application/pdf",
            uploadedBy: "u2",
            uploadedAt: `2025-06-09T16:0${ii}:00Z`,
            reviews,
            allowDownload: true,
            allowPrint: true,
            hasWatermark: true,
          });
        }
        return {
          id: `${item.id}-p${pi}`,
          name: item.name,
          description: item.description,
          required: item.required,
          acceptedFormats: item.acceptedFormats,
          status,
          files,
        };
      }),
    }));
    projects.push({
      id: `proj-${pi + 1}`,
      name: pi === 0 ? "华创科技股权投资尽调" : "盛达集团并购尽调",
      type: pi === 0 ? "equity" : "merger",
      status: "active",
      templateId: tpl.id,
      sections,
      assignedTo: ["u2"],
      createdBy: "u1",
      createdAt: `2025-06-0${pi + 1}T08:00:00Z`,
      updatedAt: `2025-06-1${5 - pi}T17:30:00Z`,
      watermarkConfig: {
        enabled: true,
        textTemplate: "{name} - {email} - {date}",
        fontSize: 14,
        opacity: 0.15,
        rotation: -30,
      },
      securityRules: [],
      exportRecords: [],
      exportPresets: makeDefaultPresets(pi),
    });
  }
  return projects;
}

function makeDefaultPresets(projectIndex: number): ExportPreset[] {
  const pid = `proj-${projectIndex + 1}`;
  const now = new Date().toISOString();
  return [
    {
      id: `preset-${pid}-ic`,
      projectId: pid,
      name: "投委会版",
      description: "面向投委会决策使用，仅导出已审核通过材料，启用水印",
      icon: "🏛️",
      scope: "approved",
      sectionIds: [],
      watermarkEnabled: true,
      includePendingItems: false,
      statusFilter: "approved",
      createdBy: "u1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `preset-${pid}-legal`,
      projectId: pid,
      name: "法务版",
      description: "法务尽调专版，包含法律合规、诉讼仲裁等章节",
      icon: "⚖️",
      scope: "all",
      sectionIds: [],
      watermarkEnabled: true,
      includePendingItems: true,
      statusFilter: "all",
      createdBy: "u1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `preset-${pid}-fin`,
      projectId: pid,
      name: "财务版",
      description: "财务审计专版，仅财务相关章节，包含未上传项清单",
      icon: "💰",
      scope: "all",
      sectionIds: [],
      watermarkEnabled: true,
      includePendingItems: true,
      statusFilter: "all",
      createdBy: "u1",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function makeInitialQuestions(): Question[] {
  return [
    {
      id: "q1",
      projectId: "proj-1",
      itemId: `eq-2-3-p0`,
      itemName: "银行对账单",
      fileId: `file-eq-2-3-p0-1`,
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
      itemId: `eq-3-1-p0`,
      itemName: "诉讼仲裁情况",
      title: "诉讼案件详情缺失",
      content: "诉讼清单中仅列明了案件名称，请补充各案件的起诉状、答辩状及最新进展。",
      createdBy: "u1",
      createdByName: "张明远",
      status: "open",
      replies: [],
      createdAt: "2025-06-14T15:00:00Z",
    },
  ];
}

function makeInitialActivities(): ActivityLog[] {
  return [
    { id: "a1", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "审核通过", detail: "审核通过「公司营业执照」", userName: "张明远", timestamp: "2025-06-15T17:30:00Z" },
    { id: "a2", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "文件上传", detail: "上传了「公司章程」", userName: "李思涵", timestamp: "2025-06-15T15:20:00Z" },
    { id: "a3", projectId: "proj-2", projectName: "盛达集团并购尽调", action: "发起提问", detail: "对「战略规划文件」发起提问", userName: "张明远", timestamp: "2025-06-14T16:00:00Z" },
    { id: "a4", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "回复问题", detail: "回复了「银行对账单不完整」的问题", userName: "李思涵", timestamp: "2025-06-14T10:30:00Z" },
    { id: "a5", projectId: "proj-1", projectName: "华创科技股权投资尽调", action: "标记疑问", detail: "对「诉讼仲裁情况」标记有疑问", userName: "张明远", timestamp: "2025-06-14T09:15:00Z" },
  ];
}

interface PersistState {
  projects: Project[];
  templates: Template[];
  questions: Question[];
  activities: ActivityLog[];
  fileContents: Record<string, string>; // fileId -> base64 data url
  currentViewRole: "investor" | "target";
  currentUserId: string;
}

function buildInitialState(): PersistState {
  return {
    projects: makeInitialProjects(),
    templates: [...defaultTemplates],
    questions: makeInitialQuestions(),
    activities: makeInitialActivities(),
    fileContents: {},
    currentViewRole: "investor",
    currentUserId: "u1",
  };
}

function loadState(): PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistState;
      if (parsed && parsed.projects && parsed.templates) {
        return parsed;
      }
    }
  } catch (_) {}
  return buildInitialState();
}

function persist(state: AppState) {
  try {
    const saveData: PersistState = {
      projects: state.projects,
      templates: state.templates,
      questions: state.questions,
      activities: state.activities,
      fileContents: state.fileContents,
      currentViewRole: state.currentViewRole,
      currentUserId: state.currentUserId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn("存储失败，可能文件内容过大:", e);
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function applyWatermarkToDataUrl(
  dataUrl: string,
  watermarkText: string,
  config: { fontSize: number; opacity: number; rotation: number }
): Promise<string> {
  const [meta, b64] = dataUrl.split(",");
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  if (mime.startsWith("image/")) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        ctx.save();
        ctx.font = `${config.fontSize}px sans-serif`;
        ctx.fillStyle = `rgba(148, 163, 184, ${config.opacity})`;
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width + 80;
        const textHeight = config.fontSize + 40;
        const rad = (config.rotation * Math.PI) / 180;

        const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);

        for (let x = -diag; x < diag; x += textWidth) {
          for (let y = -diag; y < diag; y += textHeight) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();
        resolve(canvas.toDataURL(mime === "image/jpeg" ? "image/jpeg" : "image/png"));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  if (mime.startsWith("text/")) {
    try {
      const binary = atob(b64);
      const decoder = new TextDecoder("utf-8");
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      const text = decoder.decode(arr);
      const header = `\n\n===== 水印 =====\n${watermarkText}\n${watermarkText}\n${watermarkText}\n=================\n\n`;
      const newText = header + text + header;
      const encoder = new TextEncoder();
      const newArr = encoder.encode(newText);
      let b = "";
      for (let i = 0; i < newArr.length; i++) b += String.fromCharCode(newArr[i]);
      return `data:${mime};base64,` + btoa(b);
    } catch {
      return dataUrl;
    }
  }

  return dataUrl;
}

export function buildWatermarkedHtmlWrapper(
  fileName: string,
  fileMime: string,
  fileDataUrl: string | null,
  watermarkText: string,
  config: { fontSize: number; opacity: number; rotation: number },
  meta: { itemName?: string; uploadedAt?: string; viewerName: string; viewerEmail: string; projectName: string }
): string {
  const escapedWm = watermarkText.replace(/'/g, "\\'").replace(/"/g, "&quot;");
  const escapedFile = fileName.replace(/'/g, "\\'").replace(/"/g, "&quot;");
  const escapedProj = (meta.projectName || "").replace(/"/g, "&quot;");
  const escapedItem = (meta.itemName || "").replace(/"/g, "&quot;");
  const escapedViewer = (meta.viewerName || "").replace(/"/g, "&quot;");
  const escapedEmail = (meta.viewerEmail || "").replace(/"/g, "&quot;");

  const svgWm = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='240'>
      <text x='50%' y='50%'
            fill='rgba(148,163,184,${config.opacity * 6})'
            font-family='sans-serif'
            font-size='${config.fontSize}'
            transform='rotate(${config.rotation} 180 120)'
            text-anchor='middle'
            font-weight='500'>${escapedWm}</text>
    </svg>`
  );

  const wmStyle = `
    position: fixed; inset: 0; pointer-events: none; z-index: 999999;
    background-image: url("data:image/svg+xml;utf8,${svgWm}");
    background-repeat: repeat;
    mix-blend-mode: multiply;
  `;

  const headerStyle = `
    padding: 12px 20px;
    background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%);
    color: #e2e8f0;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    border-bottom: 2px solid #D4A843;
  `;

  let contentHtml = "";
  if (fileMime.startsWith("image/") && fileDataUrl) {
    contentHtml = `<div style="padding:24px;text-align:center;background:#0b1120;min-height:calc(100vh - 60px)">
      <img src="${fileDataUrl}" style="max-width:100%;max-height:calc(100vh - 100px);box-shadow:0 8px 40px rgba(0,0,0,0.5);border-radius:8px" />
    </div>`;
  } else if (fileMime === "application/pdf" && fileDataUrl) {
    contentHtml = `<iframe src="${fileDataUrl}" style="width:100%;height:calc(100vh - 60px);border:0;background:white"></iframe>`;
  } else if (fileMime.startsWith("text/") && fileDataUrl) {
    try {
      const [, b64] = fileDataUrl.split(",");
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const txt = new TextDecoder("utf-8").decode(arr).replace(/</g, "&lt;").replace(/>/g, "&gt;");
      contentHtml = `<pre style="margin:0;padding:24px;background:#0b1120;color:#e2e8f0;min-height:calc(100vh - 60px);white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:13px;line-height:1.6">${txt}</pre>`;
    } catch {
      contentHtml = buildFallbackContent(escapedFile, fileMime, meta);
    }
  } else {
    contentHtml = buildFallbackContent(escapedFile, fileMime, meta);
  }

  const headerHtml = `<div style="${headerStyle}">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
      <div>
        <div style="font-size:15px;font-weight:600;color:#D4A843">📄 ${escapedFile}</div>
        <div style="margin-top:4px;opacity:0.75;font-size:12px">项目: ${escapedProj} | 材料: ${escapedItem || "—"} | 查看人: ${escapedViewer} &lt;${escapedEmail}&gt;</div>
      </div>
      <div style="display:flex;gap:12px;font-size:11px;opacity:0.85">
        <span>🕒 ${meta.uploadedAt ? new Date(meta.uploadedAt).toLocaleString("zh-CN") : "—"}</span>
        <span style="color:#D4A843;font-weight:600">🔒 已加密水印</span>
      </div>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>🔒 ${escapedFile} - 水印视图</title>
<style>
html,body{margin:0;padding:0;background:#0b1120;}
@media print {
  body::after{content:'${escapedWm}';position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:80px;color:rgba(148,163,184,0.08);transform:rotate(-30deg);white-space:nowrap;z-index:99999;pointer-events:none;}
}
</style>
</head>
<body>
  ${headerHtml}
  <div style="position:relative">
    ${contentHtml}
    <div style="${wmStyle}"></div>
  </div>
</body>
</html>`;
}

function buildFallbackContent(escapedFile: string, fileMime: string, meta: { itemName?: string; viewerName: string; viewerEmail: string; projectName: string }): string {
  return `<div style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);min-height:calc(100vh - 160px);font-family:system-ui,sans-serif;color:#e2e8f0">
    <div style="font-size:96px;margin-bottom:24px">📎</div>
    <div style="font-size:28px;font-weight:600;color:#D4A843;margin-bottom:12px">${escapedFile}</div>
    <div style="font-size:14px;color:#94a3b8;margin-bottom:32px">文件类型: ${fileMime}</div>
    <div style="max-width:560px;margin:0 auto;padding:28px 36px;background:rgba(30,41,59,0.7);border:1px solid rgba(212,168,67,0.3);border-radius:12px;text-align:left;font-size:13px;line-height:1.9">
      <div style="color:#D4A843;font-weight:600;margin-bottom:16px;font-size:15px">⚠️ 水印安全视图说明</div>
      <div>此文件类型（${fileMime}）不支持在浏览器中直接叠加水印渲染。</div>
      <div>为确保水印控制, 提供如下措施:</div>
      <ul style="margin:12px 0;padding-left:20px">
        <li>本 HTML 文件已通过 CSS 平铺水印覆盖全页 <span style="color:#D4A843">(全屏可见)</span></li>
        <li>浏览器打印时将自动叠加超大水印文字 <span style="color:#D4A843">(防打印)</span></li>
        <li>文件元信息与查看人信息已嵌入文件头 <span style="color:#D4A843">(可追溯)</span></li>
      </ul>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(212,168,67,0.2);color:#94a3b8;font-size:12px">
        所属项目: ${meta.projectName}<br/>
        关联材料: ${meta.itemName || "—"}<br/>
        查看人: ${meta.viewerName} (${meta.viewerEmail})<br/>
        导出时间: ${new Date().toLocaleString("zh-CN")}
      </div>
    </div>
  </div>`;
}

interface AppState extends PersistState {
  addFileContent: (fileId: string, dataUrl: string) => void;
  getFileContent: (fileId: string) => string | undefined;

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addItemFile: (projectId: string, itemId: string, file: UploadedFile, contentDataUrl?: string) => void;
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

  setFilePermissions: (projectId: string, fileId: string, perms: Partial<Pick<UploadedFile, "allowDownload" | "allowPrint" | "hasWatermark">>) => void;

  switchViewRole: (role: "investor" | "target") => void;
  setCurrentUser: (userId: string) => void;

  canDownloadFile: (projectId: string, fileId: string) => boolean;
  canPrintFile: (projectId: string, fileId: string) => boolean;
  getQuestionsForItem: (projectId: string, itemId: string) => Question[];
  getAssignedProjects: (userId: string) => Project[];
  addExportRecord: (projectId: string, record: ExportRecord) => void;

  addExportPreset: (projectId: string, preset: Omit<ExportPreset, "id" | "projectId" | "createdAt" | "updatedAt">) => ExportPreset;
  updateExportPreset: (projectId: string, presetId: string, updates: Partial<ExportPreset>) => void;
  deleteExportPreset: (projectId: string, presetId: string) => void;

  resetStore: () => void;
}

const initial = loadState();

export const useStore = create<AppState>((set, get) => {
  const getInitials = () => buildInitialState();

  return {
    projects: initial.projects,
    templates: initial.templates,
    questions: initial.questions,
    activities: initial.activities,
    fileContents: initial.fileContents,
    currentViewRole: initial.currentViewRole,
    currentUserId: initial.currentUserId,

    addFileContent: (fileId, dataUrl) => {
      set((s) => {
        const next = { ...s, fileContents: { ...s.fileContents, [fileId]: dataUrl } };
        persist(next);
        return next;
      });
    },

    getFileContent: (fileId) => get().fileContents[fileId],

    addProject: (project) => {
      set((s) => {
        const next = { ...s, projects: [...s.projects, project] };
        persist(next);
        return next;
      });
    },

    updateProject: (id, updates) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        };
        persist(next);
        return next;
      });
    },

    deleteProject: (id) => {
      set((s) => {
        const next = { ...s, projects: s.projects.filter((p) => p.id !== id) };
        persist(next);
        return next;
      });
    },

    addExportRecord: (projectId, record) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  exportRecords: [record, ...p.exportRecords].slice(0, 50),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    addExportPreset: (projectId, preset) => {
      const full: ExportPreset = {
        ...preset,
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, exportPresets: [...p.exportPresets, full], updatedAt: new Date().toISOString() }
              : p
          ),
        };
        persist(next);
        return next;
      });
      return full;
    },

    updateExportPreset: (projectId, presetId, updates) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  exportPresets: p.exportPresets.map((pr) =>
                    pr.id === presetId ? { ...pr, ...updates, updatedAt: new Date().toISOString() } : pr
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    deleteExportPreset: (projectId, presetId) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, exportPresets: p.exportPresets.filter((pr) => pr.id !== presetId), updatedAt: new Date().toISOString() }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    addItemFile: (projectId, itemId, file, contentDataUrl) => {
      set((s) => {
        const nextContents = contentDataUrl
          ? { ...s.fileContents, [file.id]: contentDataUrl }
          : s.fileContents;
        const next = {
          ...s,
          fileContents: nextContents,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  sections: p.sections.map((sec) => ({
                    ...sec,
                    items: sec.items.map((item) =>
                      item.id === itemId
                        ? { ...item, files: [...item.files, file], status: "uploaded" as const }
                        : item
                    ),
                  })),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    updateItemStatus: (projectId, itemId, status) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  sections: p.sections.map((sec) => ({
                    ...sec,
                    items: sec.items.map((item) =>
                      item.id === itemId ? { ...item, status } : item
                    ),
                  })),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    addReview: (projectId, itemId, fileId, review) => {
      set((s) => {
        const newStatus: ProjectItem["status"] =
          review.result === "approved" ? "approved" :
          review.result === "questioned" ? "questioned" : "supplement_needed";
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  sections: p.sections.map((sec) => ({
                    ...sec,
                    items: sec.items.map((item) =>
                      item.id === itemId
                        ? {
                            ...item,
                            status: newStatus,
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
        };
        persist(next);
        return next;
      });
    },

    addQuestion: (question) => {
      set((s) => {
        const next = { ...s, questions: [...s.questions, question] };
        persist(next);
        return next;
      });
    },

    addReply: (questionId, reply) => {
      set((s) => {
        const next = {
          ...s,
          questions: s.questions.map((q) =>
            q.id === questionId
              ? { ...q, replies: [...q.replies, reply], status: "replied" as const }
              : q
          ),
        };
        persist(next);
        return next;
      });
    },

    updateQuestionStatus: (questionId, status) => {
      set((s) => {
        const next = {
          ...s,
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, status } : q
          ),
        };
        persist(next);
        return next;
      });
    },

    addActivity: (activity) => {
      set((s) => {
        const next = { ...s, activities: [activity, ...s.activities].slice(0, 200) };
        persist(next);
        return next;
      });
    },

    addTemplate: (template) => {
      set((s) => {
        const next = { ...s, templates: [...s.templates, template] };
        persist(next);
        return next;
      });
    },

    updateTemplate: (id, updates) => {
      set((s) => {
        const next = {
          ...s,
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        };
        persist(next);
        return next;
      });
    },

    updateWatermarkConfig: (projectId, config) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, watermarkConfig: config } : p
          ),
        };
        persist(next);
        return next;
      });
    },

    updateSecurityRule: (projectId, rule) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
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
        };
        persist(next);
        return next;
      });
    },

    setFilePermissions: (projectId, fileId, perms) => {
      set((s) => {
        const next = {
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  sections: p.sections.map((sec) => ({
                    ...sec,
                    items: sec.items.map((item) => ({
                      ...item,
                      files: item.files.map((f) =>
                        f.id === fileId ? { ...f, ...perms } : f
                      ),
                    })),
                  })),
                }
              : p
          ),
        };
        persist(next);
        return next;
      });
    },

    switchViewRole: (role) => {
      set((s) => {
        const userId = role === "investor" ? "u1" : "u2";
        const next = { ...s, currentViewRole: role, currentUserId: userId };
        persist(next);
        return next;
      });
    },

    setCurrentUser: (userId) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      set((s) => {
        const viewRole = user.role === "admin" ? "investor" : user.role as "investor" | "target";
        const next = { ...s, currentUserId: userId, currentViewRole: viewRole };
        persist(next);
        return next;
      });
    },

    canDownloadFile: (projectId, fileId) => {
      const state = get();
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return false;
      let allowed = true;
      for (const rule of project.securityRules) {
        if (rule.targetType === "project") allowed = allowed && rule.allowDownload;
      }
      for (const section of project.sections) {
        for (const rule of project.securityRules) {
          if (rule.targetType === "section" && rule.targetId === section.id) {
            allowed = allowed && rule.allowDownload;
          }
        }
        for (const item of section.items) {
          for (const rule of project.securityRules) {
            if (rule.targetType === "item" && rule.targetId === item.id) {
              allowed = allowed && rule.allowDownload;
            }
          }
          for (const f of item.files) {
            if (f.id === fileId) {
              allowed = allowed && f.allowDownload;
            }
          }
        }
      }
      return allowed;
    },

    canPrintFile: (projectId, fileId) => {
      const state = get();
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return false;
      let allowed = true;
      for (const rule of project.securityRules) {
        if (rule.targetType === "project") allowed = allowed && rule.allowPrint;
      }
      for (const section of project.sections) {
        for (const rule of project.securityRules) {
          if (rule.targetType === "section" && rule.targetId === section.id) {
            allowed = allowed && rule.allowPrint;
          }
        }
        for (const item of section.items) {
          for (const rule of project.securityRules) {
            if (rule.targetType === "item" && rule.targetId === item.id) {
              allowed = allowed && rule.allowPrint;
            }
          }
          for (const f of item.files) {
            if (f.id === fileId) {
              allowed = allowed && f.allowPrint;
            }
          }
        }
      }
      return allowed;
    },

    getQuestionsForItem: (projectId, itemId) => {
      return get().questions.filter((q) => q.projectId === projectId && q.itemId === itemId);
    },

    getAssignedProjects: (userId) => {
      return get().projects.filter((p) => p.assignedTo.includes(userId));
    },

    resetStore: () => {
      const fresh = getInitials();
      localStorage.removeItem(STORAGE_KEY);
      set({
        ...fresh,
      });
    },
  };
});

export function buildWatermarkText(
  template: string,
  user: { name: string; email: string },
  date = new Date()
): string {
  return template
    .replace(/\{name\}/g, user.name)
    .replace(/\{email\}/g, user.email)
    .replace(/\{date\}/g, date.toLocaleDateString("zh-CN"));
}

export function createProjectFromTemplate(
  templateId: string,
  name: string,
  type: ProjectType,
  assignedTo: string[],
  templates: Template[]
): Project {
  const tpl = templates.find((t) => t.id === templateId) || templates[0];
  const id = `proj-${Date.now()}`;
  const now = new Date().toISOString();
  const sections: ProjectSection[] = tpl.sections.map((s) => ({
    id: `${s.id}-${Date.now()}`,
    name: s.name,
    order: s.order,
    items: s.items.map((item) => ({
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      description: item.description,
      required: item.required,
      acceptedFormats: item.acceptedFormats,
      status: "pending" as const,
      files: [],
    })),
  }));
  return {
    id,
    name,
    type,
    status: "active",
    templateId: tpl.id,
    sections,
    assignedTo,
    createdBy: "u1",
    createdAt: now,
    updatedAt: now,
    watermarkConfig: {
      enabled: true,
      textTemplate: "{name} - {email} - {date}",
      fontSize: 14,
      opacity: 0.15,
      rotation: -30,
    },
    securityRules: [
      { targetId: "", targetType: "project", allowDownload: false, allowPrint: false, allowShare: false },
    ],
    exportRecords: [],
    exportPresets: [
      {
        id: `preset-${id}-ic`,
        projectId: id,
        name: "投委会版",
        description: "面向投委会决策使用，仅导出已审核通过材料，启用水印",
        icon: "🏛️",
        scope: "approved",
        sectionIds: [],
        watermarkEnabled: true,
        includePendingItems: false,
        statusFilter: "approved",
        createdBy: "u1",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `preset-${id}-legal`,
        projectId: id,
        name: "法务版",
        description: "法务尽调专版，包含未上传项清单，启用水印",
        icon: "⚖️",
        scope: "all",
        sectionIds: [],
        watermarkEnabled: true,
        includePendingItems: true,
        statusFilter: "all",
        createdBy: "u1",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `preset-${id}-fin`,
        projectId: id,
        name: "财务版",
        description: "财务审计专版，包含未上传项清单，启用水印",
        icon: "💰",
        scope: "all",
        sectionIds: [],
        watermarkEnabled: true,
        includePendingItems: true,
        statusFilter: "all",
        createdBy: "u1",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
