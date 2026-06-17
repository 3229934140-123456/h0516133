import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, buildWatermarkText, users } from "@/store";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle, HelpCircle, PlusCircle, Send, Clock, Eye, FileText, MessageSquare, Download, Printer } from "lucide-react";
import type { ProjectItem, ProjectSection, UploadedFile, Review } from "@/types";

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addReview, addActivity, currentUserId, canDownloadFile, canPrintFile, getQuestionsForItem } = useStore();
  const project = projects.find((p) => p.id === id);
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const [selectedSection, setSelectedSection] = useState<ProjectSection | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [reviewResult, setReviewResult] = useState<Review["result"]>("approved");
  const [comment, setComment] = useState("");

  if (!project) return <div className="flex h-full items-center justify-center text-gray-400">项目不存在</div>;

  const watermarkText = buildWatermarkText(project.watermarkConfig.textTemplate, { name: currentUser.name, email: currentUser.email });

  const watermarkSvgDataUrl = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
      <defs>
        <style>
          .wm { fill: rgba(148, 163, 184, ${project.watermarkConfig.opacity * 6}); font-family: sans-serif; font-size: ${project.watermarkConfig.fontSize}px; }
        </style>
      </defs>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="wm" transform="rotate(${project.watermarkConfig.rotation}, 150, 100)">${watermarkText}</text>
    </svg>`;
    return `url("data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}")`;
  }, [watermarkText, project.watermarkConfig]);

  const allReviews = selectedItem
    ? selectedItem.files.flatMap((f) => f.reviews)
    : [];

  const handleSubmit = () => {
    if (!selectedItem || !selectedFile || !comment.trim() || !id) return;
    const review: Review = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      result: reviewResult,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    addReview(id, selectedItem.id, selectedFile.id, review);
    addActivity({
      id: `a-${Date.now()}`,
      projectId: id,
      projectName: project.name,
      action: reviewResult === "approved" ? "审核通过" : reviewResult === "questioned" ? "标记疑问" : "要求补充",
      detail: `${reviewResult === "approved" ? "审核通过" : reviewResult === "questioned" ? "对" : "要求补充"}「${selectedItem.name}」${selectedFile.name}：${comment.trim()}`,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
    setComment("");
  };

  const canDownload = selectedFile && id ? canDownloadFile(id, selectedFile.id) : true;
  const canPrint = selectedFile && id ? canPrintFile(id, selectedFile.id) : true;

  return (
    <div className="flex h-full bg-navy-950 text-white">
      <div className="w-72 flex-shrink-0 border-r border-navy-800 overflow-y-auto">
        <div className="p-4 border-b border-navy-800">
          <h2 className="font-display text-lg text-gold-400">材料清单</h2>
        </div>
        {project.sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => { setSelectedSection(section); setSelectedItem(null); setSelectedFile(null); }}
              className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-navy-900 ${selectedSection?.id === section.id ? "bg-navy-900 text-gold-400" : "text-gray-300"}`}
            >
              {section.name}
            </button>
            {selectedSection?.id === section.id && section.items.map((item) => {
              const itemQuestions = id ? getQuestionsForItem(id, item.id) : [];
              return (
                <div key={item.id} className="flex items-stretch">
                  <button
                    onClick={() => { setSelectedItem(item); setSelectedFile(item.files[0] ?? null); }}
                    className={`flex flex-1 items-center gap-2 px-6 py-2 text-left text-sm hover:bg-navy-900 ${selectedItem?.id === item.id ? "bg-navy-900/60 text-white" : "text-gray-400"}`}
                  >
                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.files.length}</span>
                    <StatusBadge status={item.status} />
                  </button>
                  {itemQuestions.length > 0 && (
                    <button
                      onClick={() => navigate(`/project/${id}/questions`)}
                      className="flex items-center gap-1 px-2 mr-1 my-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                      title={`${itemQuestions.length} 个问题`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs font-medium">{itemQuestions.length}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col border-r border-navy-800">
        <div className="flex items-center gap-2 border-b border-navy-800 px-6 py-3">
          <Eye className="h-4 w-4 text-gold-400" />
          <span className="text-sm text-gray-300">文件预览</span>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          {selectedFile ? (
            <div className="relative flex flex-col items-center gap-4 w-full h-full">
              {project.watermarkConfig.enabled && (
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    backgroundImage: watermarkSvgDataUrl,
                    backgroundRepeat: "repeat",
                    opacity: 1,
                  }}
                />
              )}
              {(!canDownload || !canPrint) && (
                <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {!canDownload && (
                    <div className="flex items-center gap-1 rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                      <Download className="h-3.5 w-3.5" />
                      下载已禁用
                    </div>
                  )}
                  {!canPrint && (
                    <div className="flex items-center gap-1 rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                      <Printer className="h-3.5 w-3.5" />
                      打印已禁用
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col items-center gap-4 z-0 my-auto">
                <FileText className="h-20 w-20 text-gray-500" />
                <p className="text-lg text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">{selectedFile.type}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">请从左侧选择文件进行预览</p>
          )}
        </div>
      </div>

      <div className="w-80 flex-shrink-0 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
          <MessageSquare className="h-4 w-4 text-gold-400" />
          <span className="text-sm text-gray-300">审核操作</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setReviewResult("approved")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${reviewResult === "approved" ? "bg-emerald-600 text-white" : "bg-navy-800 text-gray-300 hover:bg-navy-700"}`}
            >
              <CheckCircle className="h-4 w-4" /> 通过
            </button>
            <button
              onClick={() => setReviewResult("questioned")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${reviewResult === "questioned" ? "bg-amber-600 text-white" : "bg-navy-800 text-gray-300 hover:bg-navy-700"}`}
            >
              <HelpCircle className="h-4 w-4" /> 疑问
            </button>
            <button
              onClick={() => setReviewResult("supplement_needed")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${reviewResult === "supplement_needed" ? "bg-blue-600 text-white" : "bg-navy-800 text-gray-300 hover:bg-navy-700"}`}
            >
              <PlusCircle className="h-4 w-4" /> 补充
            </button>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="输入审核意见..."
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none"
            rows={4}
          />
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !comment.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500 disabled:opacity-40 disabled:hover:bg-gold-400"
          >
            <Send className="h-4 w-4" /> 提交审核
          </button>
        </div>

        <div className="border-t border-navy-800 px-4 py-3">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
            <Clock className="h-4 w-4 text-gold-400" /> 审核历史
          </h3>
          <div className="space-y-3">
            {allReviews.length === 0 && <p className="text-xs text-gray-500">暂无审核记录</p>}
            {allReviews.map((r) => (
              <div key={r.id} className="border-l-2 border-navy-700 pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-300">{r.reviewerName}</span>
                  <StatusBadge status={r.result === "approved" ? "approved" : r.result === "questioned" ? "questioned" : "supplement_needed"} />
                  <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
