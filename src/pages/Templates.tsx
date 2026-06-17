import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { Template, TemplateCategory } from "@/types";
import { getTemplateCategoryLabel, getTemplateCategoryColor } from "@/data/templates";
import { Search, Plus, Eye, ChevronDown, ChevronRight, FolderTree } from "lucide-react";

const categories: Array<"all" | TemplateCategory> = ["all", "equity", "merger", "financing", "custom"];
const categoryLabels: Record<string, string> = {
  all: "全部", equity: "股权投资", merger: "并购交易", financing: "融资", custom: "自定义",
};

function countItems(t: Template) {
  return t.sections.reduce((acc, s) => acc + s.items.length, 0);
}

export default function Templates() {
  const { templates } = useStore();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-navy-950 text-white p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">模板库</h1>
        <button className="flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-navy-950 px-4 py-2 rounded-lg font-semibold transition-colors">
          <Plus size={18} /> 创建自定义模板
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-900 border border-navy-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-navy-400 focus:outline-none focus:border-gold-400/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-1 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-4 py-2 text-sm rounded-full transition-colors ${
              activeCategory === cat
                ? "text-gold-400 bg-gold-400/10"
                : "text-navy-400 hover:text-navy-200"
            }`}
          >
            {categoryLabels[cat]}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filtered.map((t) => {
          const isExpanded = expandedId === t.id;
          const itemCount = countItems(t);
          return (
            <div
              key={t.id}
              className="bg-navy-900/80 border border-navy-700/50 rounded-xl overflow-hidden hover:border-gold-400/30 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white pr-2">{t.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${getTemplateCategoryColor(t.category)}`}>
                    {getTemplateCategoryLabel(t.category)}
                  </span>
                </div>
                <p className="text-sm text-navy-300 mb-3 line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-4 text-xs text-navy-400 mb-4">
                  <span className="flex items-center gap-1"><FolderTree size={12} />{t.sections.length} 章节</span>
                  <span>{itemCount} 条目</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/templates/${t.id}`)} className="flex-1 flex items-center justify-center gap-1 text-sm bg-gold-400/10 text-gold-400 px-3 py-2 rounded-lg hover:bg-gold-400/20 transition-colors">
                    使用模板
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    className="flex items-center gap-1 text-sm bg-navy-700/50 text-navy-200 px-3 py-2 rounded-lg hover:bg-navy-700 transition-colors"
                  >
                    <Eye size={14} />
                    预览
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-navy-700/50 bg-navy-950/50 p-5 max-h-72 overflow-y-auto">
                  {t.sections.map((s) => (
                    <div key={s.id} className="mb-3 last:mb-0">
                      <p className="text-sm font-semibold text-gold-400 mb-1.5">{s.name}</p>
                      <ul className="space-y-1 pl-1">
                        {s.items.map((item) => (
                          <li key={item.id} className="text-xs text-navy-300 flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                item.required ? "bg-gold-400" : "bg-navy-600"
                              }`}
                            />
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-navy-400">
          <FolderTree size={40} className="mx-auto mb-3 opacity-50" />
          <p>未找到匹配的模板</p>
        </div>
      )}
    </div>
  );
}
