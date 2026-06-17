import { useState } from "react";
import { useStore, users, createProjectFromTemplate } from "@/store";
import { Project, ProjectType, ProjectStatus, User } from "@/types";
import ProgressRing from "@/components/ProgressRing";
import { useNavigate } from "react-router-dom";
import {
  Plus, Building2, FileQuestion, Clock, ArrowRight,
  TrendingUp, ClipboardCheck, AlertCircle, X, RotateCcw,
} from "lucide-react";

const typeLabel: Record<ProjectType, string> = { equity: "股权投资", merger: "并购交易", financing: "融资" };
const typeColor: Record<ProjectType, string> = { equity: "bg-blue-100 text-blue-700", merger: "bg-purple-100 text-purple-700", financing: "bg-emerald-100 text-emerald-700" };
const statusLabel: Record<ProjectStatus, string> = { active: "进行中", completed: "已完成", archived: "已归档" };

function calcProgress(p: Project) {
  const items = p.sections.flatMap((s) => s.items);
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.status === "approved").length / items.length) * 100);
}

function timeAgo(ts: string) {
  const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
  if (h < 1) return "刚刚";
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

function actionDotColor(a: string) {
  if (a.includes("审核")) return "bg-green-500";
  if (a.includes("上传")) return "bg-blue-500";
  if (a.includes("提问")) return "bg-amber-500";
  if (a.includes("回复")) return "bg-teal-500";
  if (a.includes("疑问") || a.includes("标记")) return "bg-red-500";
  if (a.includes("创建")) return "bg-gold-400";
  return "bg-navy-500";
}

export default function Dashboard() {
  const { projects, questions, activities, currentViewRole, currentUserId, templates, addProject, addActivity, resetStore } = useStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<ProjectType>("equity");
  const [formTemplate, setFormTemplate] = useState("");
  const [formAssigned, setFormAssigned] = useState<string[]>([]);

  const targetUsers = users.filter((u) => u.role === "target");
  const filteredProjects =
    currentViewRole === "investor"
      ? projects
      : projects.filter((p) => p.assignedTo.includes(currentUserId));
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id));
  const filteredQuestions = questions.filter((q) => filteredProjectIds.has(q.projectId));

  const activeCount = filteredProjects.filter((p) => p.status === "active").length;
  const pendingReview = filteredProjects.reduce(
    (acc, p) => acc + p.sections.flatMap((s) => s.items).filter((i) => i.status === "in_review").length,
    0,
  );
  const openQuestions = filteredQuestions.filter((q) => q.status === "open").length;
  const allItems = filteredProjects.flatMap((p) => p.sections.flatMap((s) => s.items));
  const completionRate = allItems.length
    ? Math.round((allItems.filter((i) => i.status === "approved").length / allItems.length) * 100)
    : 0;

  const stats = [
    { label: "活跃项目", value: String(activeCount), icon: Building2 },
    { label: "待审核项", value: String(pendingReview), icon: ClipboardCheck },
    { label: "待解决问题", value: String(openQuestions), icon: FileQuestion },
    { label: "完成率", value: `${completionRate}%`, icon: TrendingUp },
  ];

  const toggleAssigned = (uid: string) => {
    setFormAssigned((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateProject = () => {
    if (!formName.trim() || !formTemplate || formAssigned.length === 0) return;
    const newProj = createProjectFromTemplate(
      formTemplate,
      formName.trim(),
      formType,
      formAssigned,
      templates
    );
    addProject(newProj);
    const currentUser = users.find((u) => u.id === currentUserId);
    addActivity({
      id: `a-${Date.now()}`,
      projectId: newProj.id,
      projectName: newProj.name,
      action: "创建项目",
      detail: `创建了尽调项目「${newProj.name}」`,
      userName: currentUser?.name || "系统",
      timestamp: new Date().toISOString(),
    });
    setShowModal(false);
    setFormName("");
    setFormType("equity");
    setFormTemplate("");
    setFormAssigned([]);
    navigate(`/project/${newProj.id}`);
  };

  const handleReset = () => {
    resetStore();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white p-6 font-sans relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">项目概览</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 bg-navy-800/70 hover:bg-navy-700 border border-navy-700/50 text-navy-300 hover:text-navy-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} /> 重置演示数据
          </button>
          <button
            onClick={() => currentViewRole === "investor" && setShowModal(true)}
            disabled={currentViewRole !== "investor"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              currentViewRole === "investor"
                ? "bg-gold-400 hover:bg-gold-500 text-navy-950"
                : "bg-navy-800 text-navy-600 cursor-not-allowed"
            }`}
          >
            <Plus size={18} /> 新建项目
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-5 border border-navy-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-300 text-sm mb-1">{s.label}</p>
                <p className="text-3xl font-display font-bold text-white">{s.value}</p>
              </div>
              <s.icon className="text-gold-400" size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-lg font-display font-semibold mb-4">项目列表</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProjects.map((p) => {
              const progress = calcProgress(p);
              return (
                <div key={p.id} className="bg-navy-900/80 border border-navy-700/50 rounded-xl p-5 hover:border-gold-400/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1.5">{p.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[p.type]}`}>
                        {typeLabel[p.type]}
                      </span>
                    </div>
                    <ProgressRing percentage={progress} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy-300 mb-4">
                    <span className="flex items-center gap-1"><AlertCircle size={12} />{statusLabel[p.status]}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(p.updatedAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/project/${p.id}`)} className="flex items-center gap-1 text-xs bg-gold-400/10 text-gold-400 px-3 py-1.5 rounded-lg hover:bg-gold-400/20 transition-colors">
                      <ArrowRight size={12} />查看详情
                    </button>
                    <button onClick={() => navigate(`/project/${p.id}/upload`)} className="flex items-center gap-1 text-xs bg-navy-700/50 text-navy-200 px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors">
                      上传
                    </button>
                    <button onClick={() => navigate(`/project/${p.id}/review`)} className="flex items-center gap-1 text-xs bg-navy-700/50 text-navy-200 px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors">
                      审核
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <div className="col-span-2 text-center py-12 text-navy-500">
                <Building2 size={40} className="mx-auto mb-3 opacity-50" />
                <p>暂无分配项目</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-4">最近动态</h2>
          <div className="bg-navy-900/80 border border-navy-700/50 rounded-xl p-5">
            {activities
              .filter((a) => filteredProjectIds.has(a.projectId))
              .map((a, idx, arr) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${actionDotColor(a.action)}`} />
                    {idx < arr.length - 1 && <div className="w-px flex-1 bg-navy-700 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-white">{a.detail}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{a.userName} · {timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            {activities.filter((a) => filteredProjectIds.has(a.projectId)).length === 0 && (
              <p className="text-sm text-navy-500 text-center py-4">暂无动态</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
              <h2 className="text-xl font-display font-bold text-white">创建尽调项目</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy-200 mb-2">项目名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="请输入项目名称"
                  className="w-full bg-navy-800/70 border border-navy-700 rounded-lg px-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:border-gold-400/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-200 mb-2">尽调类型</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ProjectType)}
                  className="w-full bg-navy-800/70 border border-navy-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400/60 transition-colors"
                >
                  <option value="equity">股权投资</option>
                  <option value="merger">并购交易</option>
                  <option value="financing">融资</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-200 mb-2">选择清单模板</label>
                <select
                  value={formTemplate}
                  onChange={(e) => setFormTemplate(e.target.value)}
                  className="w-full bg-navy-800/70 border border-navy-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400/60 transition-colors"
                >
                  <option value="">请选择模板</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-200 mb-2">分配被调查方</label>
                <div className="bg-navy-800/40 border border-navy-700 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {targetUsers.length === 0 ? (
                    <p className="text-sm text-navy-500 text-center py-2">暂无被调查方用户</p>
                  ) : (
                    targetUsers.map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-navy-800/80 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formAssigned.includes(u.id)}
                          onChange={() => toggleAssigned(u.id)}
                          className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-gold-400 focus:ring-gold-400/50 focus:ring-offset-navy-900"
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gold-400/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gold-400">{u.name.slice(0, 1)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{u.name}</p>
                            <p className="text-xs text-navy-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-navy-800 bg-navy-900/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg text-navy-300 hover:text-white hover:bg-navy-800 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!formName.trim() || !formTemplate || formAssigned.length === 0}
                className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                  formName.trim() && formTemplate && formAssigned.length > 0
                    ? "bg-gold-400 hover:bg-gold-500 text-navy-950"
                    : "bg-navy-700 text-navy-500 cursor-not-allowed"
                }`}
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white">确认重置演示数据？</h3>
              </div>
              <p className="text-sm text-navy-400 leading-relaxed">
                此操作将清空所有项目、问题、活动记录并恢复到初始演示状态，已上传的文件内容也将被清除。此操作不可撤销。
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-navy-800 bg-navy-900/50">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 rounded-lg text-navy-300 hover:text-white hover:bg-navy-800 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-lg font-semibold bg-red-500/90 hover:bg-red-500 text-white transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
