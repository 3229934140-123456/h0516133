import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
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
} from "lucide-react";
import { getTemplateCategoryLabel, getTemplateCategoryColor } from "@/data/templates";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const templates = useStore((s) => s.templates);
  const addProject = useStore((s) => s.addProject);
  const template = templates.find((t) => t.id === id);

  const [editing, setEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(template?.sections.map((s) => s.id) || []));

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

  const handleUseTemplate = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: `新建尽调项目 - ${template.name}`,
      type: template.category as "equity" | "merger" | "financing",
      status: "active" as const,
      templateId: template.id,
      sections: template.sections.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        items: s.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          required: item.required,
          acceptedFormats: item.acceptedFormats,
          status: "pending" as const,
          files: [],
        })),
      })),
      assignedTo: [],
      createdBy: "u1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      watermarkConfig: {
        enabled: true,
        textTemplate: "{name} - {email} - {date}",
        fontSize: 14,
        opacity: 0.15,
        rotation: -30,
      },
      securityRules: [],
    };
    addProject(newProject);
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
          <button onClick={handleUseTemplate} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold-400 text-navy-950 font-medium hover:bg-gold-300 transition-colors">
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
    </div>
  );
}
