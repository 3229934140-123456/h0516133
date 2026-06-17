import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, users, createProjectFromTemplate } from "@/store";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  FileText,
  GripVertical,
  X,
  Users,
} from "lucide-react";
import { getTemplateCategoryLabel, getTemplateCategoryColor } from "@/data/templates";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const templates = useStore((s) => s.templates);
  const addProject = useStore((s) => s.addProject);
  const addActivity = useStore((s) => s.addActivity);
  const template = templates.find((t) => t.id === id);
  const targetUsers = users.filter((u) => u.role === "target");

  const [editing, setEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(template?.sections.map((s) => s.id) || []));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-navy-400 text-lg">模板不存在</p>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0);

  const openCreateModal = () => {
    setNewProjectName(`${template.name.replace(/清单$/, "")}尽调项目`);
    setSelectedAssignees([]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewProjectName("");
    setSelectedAssignees([]);
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim() || selectedAssignees.length === 0 || !id) return;
    const type = (template.category === "custom" ? "equity" : template.category) as "equity" | "merger" | "financing";
    const newProject = createProjectFromTemplate(id, newProjectName.trim(), type, selectedAssignees, templates);
    addProject(newProject);
    addActivity({
      id: `a-${Date.now()}`,
      projectId: newProject.id,
      projectName: newProject.name,
      action: "创建项目",
      detail: `从模板「${template.name}」创建了尽调项目，分配给 ${selectedAssignees.map((uid) => users.find(u => u.id === uid)?.name).filter(Boolean).join("、")}`,
      userName: useStore.getState().currentUserId === "u1" ? "张明远" : "当前用户",
      timestamp: new Date().toISOString(),
    });
    closeCreateModal();
    navigate(`/project/${newProject.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/templates")} className="p-2 rounded-lg hover:bg-navy-800 transition-colors text-navy-400 hover:text-gold-400">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-white">{template.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTemplateCategoryColor(template.category)}`}>
              {getTemplateCategoryLabel(template.category)}
            </span>
            <span className="text-navy-400 text-sm">{template.sections.length} 个分类</span>
            <span className="text-navy-400 text-sm">{totalItems} 个清单项</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-navy-700 text-navy-300 hover:border-gold-400 hover:text-gold-400 transition-colors">
            <Edit3 size={16} />
            {editing ? "完成编辑" : "编辑模板"}
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold-400 text-navy-950 font-medium hover:bg-gold-300 transition-colors">
            <Plus size={16} />
            使用此模板创建项目
          </button>
        </div>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-xl p-6">
        <p className="text-navy-300 leading-relaxed">{template.description}</p>
        <div className="mt-3 text-xs text-navy-500">
          创建于 {new Date(template.createdAt).toLocaleDateString("zh-CN")} · 最后更新 {new Date(template.updatedAt).toLocaleDateString("zh-CN")}
        </div>
      </div>

      <div className="space-y-3">
        {template.sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <div key={section.id} className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-navy-800/50 transition-colors">
                {editing && <GripVertical size={16} className="text-navy-600" />}
                {isExpanded ? <ChevronDown size={18} className="text-gold-400" /> : <ChevronRight size={18} className="text-navy-500" />}
                <FolderOpen size={18} className="text-gold-400" />
                <span className="font-medium text-white flex-1 text-left">{section.name}</span>
                <span className="text-sm text-navy-400">{section.items.length} 项</span>
                {editing && (
                  <Trash2 size={16} className="text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); }} />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-navy-800 divide-y divide-navy-800/50">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-6 py-3 hover:bg-navy-800/30 transition-colors">
                      {editing && <GripVertical size={14} className="text-navy-600" />}
                      <FileText size={16} className="text-navy-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-navy-200">{item.name}</span>
                          {item.required && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                        </div>
                        <p className="text-xs text-navy-500 mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-xs text-navy-600">{item.acceptedFormats.join(", ")}</span>
                      {editing && (
                        <Trash2 size={14} className="text-red-400/60 hover:text-red-300" />
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button className="w-full flex items-center gap-2 px-6 py-3 text-gold-400 hover:bg-navy-800/30 transition-colors">
                      <Plus size={16} />
                      <span className="text-sm">添加清单项</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {editing && (
          <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed border-navy-700 text-navy-400 hover:border-gold-400 hover:text-gold-400 transition-colors">
            <Plus size={18} />
            <span>添加分类</span>
          </button>
        )}
      </div>

      {editing && (
        <div className="flex justify-end gap-3">
          <button onClick={() => setEditing(false)} className="px-6 py-2 rounded-lg border border-navy-700 text-navy-300 hover:border-navy-600 transition-colors">
            取消
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold-400 text-navy-950 font-medium hover:bg-gold-300 transition-colors">
            <Save size={16} />
            保存模板
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 px-6 py-4">
              <h3 className="font-display text-xl text-gold-400">创建尽调项目</h3>
              <button onClick={closeCreateModal} className="p-1 rounded hover:bg-navy-800 text-navy-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <label className="text-sm font-medium text-navy-200 mb-1.5 block">项目名称</label>
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="请输入项目名称"
                  className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder-navy-500 focus:border-gold-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-200 mb-1.5 block">
                  尽调类型 <span className="text-navy-500">（根据模板自动确定）</span>
                </label>
                <div className="rounded-lg border border-navy-700 bg-navy-800/50 px-3.5 py-2.5 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTemplateCategoryColor(template.category)}`}>
                    {getTemplateCategoryLabel(template.category)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-navy-200 mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-gold-400" />
                  分配被调查方 <span className="text-amber-400">*</span>
                  <span className="text-navy-500 font-normal ml-1">（被调查方登录后将看到这些材料）</span>
                </label>
                <div className="space-y-1.5 rounded-lg border border-navy-700 bg-navy-800/30 p-2 max-h-48 overflow-y-auto">
                  {targetUsers.length === 0 && (
                    <p className="text-sm text-navy-500 px-2 py-3 text-center">暂无被调查方账号</p>
                  )}
                  {targetUsers.map((u) => (
                    <label key={u.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${selectedAssignees.includes(u.id) ? "bg-gold-400/10" : "hover:bg-navy-800"}`}>
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(u.id)}
                        onChange={() => toggleAssignee(u.id)}
                        className="accent-gold-400 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{u.name}</p>
                        <p className="text-xs text-navy-500 truncate">{u.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-400">被调查方</span>
                    </label>
                  ))}
                </div>
                {selectedAssignees.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedAssignees.map((uid) => {
                      const u = users.find(x => x.id === uid);
                      return (
                        <span key={uid} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-400 text-xs">
                          {u?.name}
                          <button onClick={() => toggleAssignee(uid)} className="hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-navy-700/50 bg-navy-950/40 px-3.5 py-3">
                <p className="text-xs text-navy-400">
                  <span className="font-medium text-navy-300">清单信息：</span>
                  共 {template.sections.length} 个分类 · {totalItems} 项材料
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-navy-800 px-6 py-4">
              <button onClick={closeCreateModal} className="flex-1 rounded-lg border border-navy-700 py-2.5 text-sm text-navy-300 hover:bg-navy-800 transition-colors">
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || selectedAssignees.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gold-400 py-2.5 text-sm font-medium text-navy-950 hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
