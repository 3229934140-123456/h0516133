import { useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Upload as UploadIcon, File, Check, ChevronLeft, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import type { ProjectItem, UploadedFile } from "@/types";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getItemStatus(item: ProjectItem) {
  if (item.status === "approved") return "done" as const;
  if (item.files.length > 0) return "uploaded" as const;
  return "pending" as const;
}

export default function Upload() {
  const { id } = useParams<{ id: string }>();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const addItemFile = useStore((s) => s.addItemFile);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = project?.sections.flatMap((s) => s.items) ?? [];
  const currentItem = allItems[currentIdx];

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !currentItem || !id) return;
      Array.from(files).forEach((f, i) => {
        const uf: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: f.name,
          size: f.size,
          type: f.type,
          uploadedBy: "u2",
          uploadedAt: new Date().toISOString(),
          reviews: [],
          allowDownload: true,
          allowPrint: true,
          hasWatermark: true,
        };
        addItemFile(id, currentItem.id, uf);
      });
    },
    [currentItem, id, addItemFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  if (!project) return <div className="flex h-full items-center justify-center text-navy-400">项目不存在</div>;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl border border-navy-700/50 p-6">
        <Link to={`/project/${id}`} className="text-sm text-navy-400 hover:text-gold-400 transition-colors">← 返回项目</Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">资料上传</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-navy-700/50 bg-navy-900/80 p-4">
        <div className="flex gap-1">
          {allItems.map((item, idx) => {
            const st = getItemStatus(item);
            return (
              <button key={item.id} onClick={() => setCurrentIdx(idx)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", idx === currentIdx ? "bg-gold-400 text-navy-950" : st === "done" ? "bg-emerald-900/40 text-emerald-300" : st === "uploaded" ? "bg-blue-900/40 text-blue-300" : "bg-navy-800 text-navy-400")}>
                {st === "done" ? <Check className="h-3 w-3" /> : st === "uploaded" ? <FileText className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />}
                <span className="max-w-[80px] truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentItem && (
        <div className="space-y-6">
          <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">{currentItem.name}</h2>
                <p className="mt-1 text-sm text-navy-400">{currentItem.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentItem.required ? (
                  <span className="rounded-full bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-300">必填</span>
                ) : (
                  <span className="rounded-full bg-navy-800 px-2.5 py-0.5 text-xs font-semibold text-navy-400">可选</span>
                )}
                <StatusBadge status={currentItem.status} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-navy-500">
              <AlertCircle className="h-4 w-4" />
              <span>接受格式: {currentItem.acceptedFormats.join(", ")}</span>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn("flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors", isDragging ? "border-gold-400 bg-gold-400/5" : "border-navy-700 bg-navy-900/40 hover:border-gold-400/60 hover:bg-gold-400/5")}
          >
            <UploadIcon className={cn("h-12 w-12", isDragging ? "text-gold-400" : "text-navy-500")} />
            <p className={cn("mt-4 text-lg font-medium", isDragging ? "text-gold-400" : "text-navy-300")}>
              {isDragging ? "释放文件以上传" : "拖拽文件到此处上传"}
            </p>
            <p className="mt-1 text-sm text-navy-500">或点击选择文件</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {currentItem.files.length > 0 && (
            <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 overflow-hidden">
              <div className="border-b border-navy-800 px-5 py-3">
                <h3 className="font-medium text-white">已上传文件 ({currentItem.files.length})</h3>
              </div>
              <div className="divide-y divide-navy-800/50">
                {currentItem.files.map((f) => {
                  const lastReview = f.reviews[f.reviews.length - 1];
                  return (
                    <div key={f.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-navy-500" />
                        <div>
                          <p className="text-sm font-medium text-navy-200">{f.name}</p>
                          <p className="text-xs text-navy-500">{formatSize(f.size)} · {formatDate(f.uploadedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lastReview ? <StatusBadge status={lastReview.result === "approved" ? "approved" : lastReview.result === "questioned" ? "questioned" : "supplement_needed"} /> : <StatusBadge status="uploaded" />}
                        {f.reviews.length > 0 && lastReview && (
                          <span className="max-w-[200px] truncate text-xs text-navy-500" title={lastReview.comment}>{lastReview.comment}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0} className={cn("flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors", currentIdx === 0 ? "cursor-not-allowed bg-navy-800 text-navy-600" : "bg-navy-800 text-navy-200 hover:bg-navy-700")}>
              <ChevronLeft className="h-4 w-4" />上一项
            </button>
            <span className="text-sm text-navy-500">{currentIdx + 1} / {allItems.length}</span>
            <button onClick={() => setCurrentIdx((i) => Math.min(allItems.length - 1, i + 1))} disabled={currentIdx === allItems.length - 1} className={cn("flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors", currentIdx === allItems.length - 1 ? "cursor-not-allowed bg-navy-800 text-navy-600" : "bg-gold-400 text-navy-950 hover:bg-gold-500")}>
              下一项<ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
