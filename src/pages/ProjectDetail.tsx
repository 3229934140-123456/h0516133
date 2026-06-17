import { useState, useMemo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, FileText, CheckCircle, Clock,
  Upload, MessageSquare, Archive, Shield, TrendingUp, Users, Info,
} from "lucide-react";
import { useStore, users } from "@/store";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import { ProgressRing } from "@/components/ProgressRing";
import type { ProjectSection, ProjectItem } from "@/types";

const tabs = [
  { key: "checklist", label: "清单", icon: FileText, path: "" },
  { key: "upload", label: "上传", icon: Upload, path: "/upload" },
  { key: "review", label: "审核", icon: CheckCircle, path: "/review" },
  { key: "qa", label: "Q&A", icon: MessageSquare, path: "/questions" },
  { key: "archive", label: "归档", icon: Archive, path: "/archive" },
  { key: "security", label: "安全", icon: Shield, path: "/security" },
];

const typeLabels: Record<string, string> = { equity: "股权投资", merger: "并购", financing: "融资" };
const statusLabels: Record<string, string> = { active: "进行中", completed: "已完成", archived: "已归档" };

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  const project = store.projects.find((p) => p.id === id);
  const { currentViewRole, currentUserId, getQuestionsForItem, questions } = store;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isAssigned = project ? project.assignedTo.includes(currentUserId) : false;
  const canAccess = currentViewRole === "investor" || isAssigned;

  const stats = useMemo(() => {
    if (!project) return { total: 0, done: 0, pct: 0, sections: [] as { name: string; done: number; total: number; pct: number }[] };
    const allItems = project.sections.flatMap((s) => s.items);
    const done = allItems.filter((i) => i.status === "approved").length;
    const total = allItems.length;
    const sections = project.sections.map((s: ProjectSection) => {
      const sDone = s.items.filter((i) => i.status === "approved").length;
      return { name: s.name, done: sDone, total: s.items.length, pct: s.items.length ? (sDone / s.items.length) * 100 : 0 };
    });
    return { total, done, pct: total ? (done / total) * 100 : 0, sections };
  }, [project]);

  const pendingItems = useMemo(() => {
    if (!project || !id) return [] as { item: ProjectItem; questionCount: number }[];
    const result: { item: ProjectItem; questionCount: number }[] = [];
    const seen = new Set<string>();
    for (const section of project.sections) {
      for (const item of section.items) {
        const questionCount = getQuestionsForItem(id, item.id).length;
        const hasOpenQuestions = questions.some(
          (q) => q.projectId === id && q.itemId === item.id && q.status === "open"
        );
        if ((item.status === "questioned" || item.status === "supplement_needed" || hasOpenQuestions) && !seen.has(item.id)) {
          seen.add(item.id);
          result.push({ item, questionCount });
        }
      }
    }
    return result;
  }, [project, id, getQuestionsForItem, questions]);

  if (!project) return <div className="flex h-full items-center justify-center text-navy-400">项目不存在</div>;
  if (!canAccess) return <div className="flex h-full items-center justify-center text-navy-400">无权限访问此项目</div>;

  const basePath = `/project/${id}`;
  const currentTab = tabs.findIndex((t) => location.pathname === `${basePath}${t.path}` || (t.path === "" && location.pathname === basePath));

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl border border-navy-700/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{project.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-400">{typeLabels[project.type]}</span>
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", project.status === "active" ? "bg-emerald-900/40 text-emerald-300" : "bg-navy-700 text-navy-300")}>{statusLabels[project.status]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-navy-400" />
            <div className="flex -space-x-2">
              {project.assignedTo.map((uid) => (
                <div key={uid} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy-900 bg-navy-700 text-xs font-medium text-gold-400">{uid === "u2" ? "李" : "张"}</div>
              ))}
            </div>
          </div>
        </div>
        <nav className="mt-5 flex gap-1">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const active = i === currentTab;
            return (
              <Link key={tab.key} to={`${basePath}${tab.path}`} className={cn("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors", active ? "bg-gold-400/20 text-gold-400" : "text-navy-400 hover:bg-navy-800 hover:text-navy-200")}>
                <Icon className="h-4 w-4" />{tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {project.sections.map((section) => {
            const isOpen = expanded[section.id] !== false;
            return (
              <div key={section.id} className="overflow-hidden rounded-xl border border-navy-700/50 bg-navy-900/80">
                <button onClick={() => setExpanded((p) => ({ ...p, [section.id]: !isOpen }))} className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-navy-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-navy-400" /> : <ChevronRight className="h-4 w-4 text-navy-400" />}
                    <span className="font-medium text-white">{section.name}</span>
                    <span className="text-xs text-navy-500">({section.items.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-navy-400">{section.items.filter((i) => i.status === "approved").length}/{section.items.length}</span>
                    <TrendingUp className="h-4 w-4 text-gold-400" />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-navy-800">
                    {section.items.map((item) => {
                      const itemQuestions = id ? getQuestionsForItem(id, item.id) : [];
                      return (
                        <div key={item.id} className="flex items-center justify-between px-5 py-3 pl-12 hover:bg-navy-800/40 transition-colors border-b border-navy-800/50 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-navy-500" />
                            <span className="text-sm text-navy-200">{item.name}</span>
                            {item.required && <span className="text-[10px] font-semibold text-red-400">必填</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            {item.files.length > 0 && <span className="text-xs text-navy-500">{item.files.length} 文件</span>}
                            {itemQuestions.length > 0 && (
                              <button
                                onClick={() => navigate(`${basePath}/questions`)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-medium transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                                {itemQuestions.length}
                              </button>
                            )}
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {currentViewRole === "investor" ? (
            <>
              <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 p-6">
                <h3 className="mb-5 font-display text-lg font-semibold text-white">整体进度</h3>
                <div className="flex justify-center">
                  <div className="relative">
                    <ProgressRing percentage={Math.round(stats.pct)} size={120} strokeWidth={10} />
                  </div>
                </div>
                <div className="mt-5 flex justify-center gap-8 text-center">
                  <div><div className="text-xl font-bold text-emerald-400">{stats.done}</div><div className="text-xs text-navy-400">已通过</div></div>
                  <div><div className="text-xl font-bold text-white">{stats.total}</div><div className="text-xs text-navy-400">总项目</div></div>
                  <div><div className="text-xl font-bold text-amber-400">{stats.total - stats.done}</div><div className="text-xs text-navy-400">待完成</div></div>
                </div>
              </div>

              <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-white">分项进度</h3>
                <div className="space-y-4">
                  {stats.sections.map((s) => (
                    <div key={s.name}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-navy-200">{s.name}</span>
                        <span className="text-navy-500">{s.done}/{s.total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy-800">
                        <div className="h-full rounded-full bg-gold-400 transition-all duration-500" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-amber-300">作为被调查方，您的进度仅供参考</h3>
                </div>
                <p className="text-xs text-navy-400 leading-relaxed">
                  整体进度数据由投资方最终确认，如有疑问请通过问答中心沟通。
                </p>
              </div>

              <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 p-6 opacity-80">
                <h3 className="mb-4 font-display text-lg font-semibold text-white">分项进度（参考）</h3>
                <div className="space-y-4">
                  {stats.sections.map((s) => (
                    <div key={s.name}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-navy-200">{s.name}</span>
                        <span className="text-navy-500">{s.done}/{s.total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy-800">
                        <div className="h-full rounded-full bg-gold-400/60 transition-all duration-500" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-white">待处理</h3>
            <div className="space-y-2">
              {pendingItems.slice(0, 4).map(({ item, questionCount }) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-red-900/20 px-3 py-2 gap-2">
                  <span className="text-sm text-navy-200 truncate flex-1 min-w-0">{item.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {questionCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium">
                        <MessageSquare className="w-3 h-3" />
                        {questionCount}
                      </span>
                    )}
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
              {pendingItems.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-navy-400"><CheckCircle className="h-4 w-4 text-emerald-400" />暂无待处理项</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
