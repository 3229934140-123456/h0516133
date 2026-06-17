import { useStore } from "@/store";
import { Project, ProjectType, ProjectStatus } from "@/types";
import ProgressRing from "@/components/ProgressRing";
import { useNavigate } from "react-router-dom";
import {
  Plus, Building2, FileQuestion, Clock, ArrowRight,
  TrendingUp, ClipboardCheck, AlertCircle,
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
  const { projects, questions, activities } = useStore();
  const navigate = useNavigate();

  const activeCount = projects.filter((p) => p.status === "active").length;
  const pendingReview = projects.reduce(
    (acc, p) => acc + p.sections.flatMap((s) => s.items).filter((i) => i.status === "in_review").length,
    0,
  );
  const openQuestions = questions.filter((q) => q.status === "open").length;
  const allItems = projects.flatMap((p) => p.sections.flatMap((s) => s.items));
  const completionRate = allItems.length
    ? Math.round((allItems.filter((i) => i.status === "approved").length / allItems.length) * 100)
    : 0;

  const stats = [
    { label: "活跃项目", value: String(activeCount), icon: Building2 },
    { label: "待审核项", value: String(pendingReview), icon: ClipboardCheck },
    { label: "待解决问题", value: String(openQuestions), icon: FileQuestion },
    { label: "完成率", value: `${completionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white p-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">项目概览</h1>
        <button className="flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-navy-950 px-4 py-2 rounded-lg font-semibold transition-colors">
          <Plus size={18} /> 新建项目
        </button>
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
            {projects.map((p) => {
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
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-4">最近动态</h2>
          <div className="bg-navy-900/80 border border-navy-700/50 rounded-xl p-5">
            {activities.map((a, idx) => (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${actionDotColor(a.action)}`} />
                  {idx < activities.length - 1 && <div className="w-px flex-1 bg-navy-700 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-white">{a.detail}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{a.userName} · {timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
