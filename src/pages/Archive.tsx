import { useState } from "react";
import { useParams } from "react-router-dom";
import JSZip from "jszip";
import { useStore } from "@/store";
import StatusBadge from "@/components/StatusBadge";
import { Download, Search, Filter, FolderOpen, File, ChevronDown, ChevronRight, Package, Eye } from "lucide-react";
import type { ItemStatus } from "@/types";

export default function Archive() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useStore();
  const project = projects.find((p) => p.id === id);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ItemStatus>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [packScope, setPackScope] = useState<"all" | "approved" | "sections">("all");
  const [packWatermark, setPackWatermark] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});

  if (!project) return <div className="flex h-full items-center justify-center text-gray-400">项目不存在</div>;

  const toggleSection = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredSections = project.sections.map((s) => ({
    ...s,
    items: s.items.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    }),
  })).filter((s) => s.items.length > 0);

  const handlePackageDownload = async () => {
    const zip = new JSZip();
    const sectionsToInclude = packScope === "all"
      ? project.sections
      : packScope === "approved"
        ? project.sections.map((s) => ({ ...s, items: s.items.filter((i) => i.status === "approved") }))
        : project.sections.filter((s) => selectedSections[s.id]);

    for (const section of sectionsToInclude) {
      const folder = zip.folder(section.name);
      for (const item of section.items) {
        if (item.files.length > 0) {
          for (const file of item.files) {
            folder?.file(file.name, `文件: ${file.name}\n大小: ${(file.size / 1024).toFixed(1)}KB\n类型: ${file.type}\n水印: ${packWatermark ? "已启用" : "未启用"}`);
          }
        } else {
          folder?.file(`${item.name}.txt`, `材料: ${item.name}\n状态: ${item.status}\n描述: ${item.description}`);
        }
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name ?? "archive"}-归档.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setShowModal(false);
  };

  const formatSize = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex items-center gap-3 border-b border-navy-800 px-6 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文件..."
            className="w-full rounded-lg border border-navy-700 bg-navy-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ItemStatus)}
            className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">全部状态</option>
            <option value="approved">已通过</option>
            <option value="uploaded">已上传</option>
            <option value="in_review">审核中</option>
            <option value="questioned">有疑问</option>
            <option value="supplement_needed">需补充</option>
            <option value="pending">待上传</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500"
        >
          <Package className="h-4 w-4" /> 打包下载
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredSections.map((section) => (
          <div key={section.id} className="mb-4">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-navy-900"
            >
              {expanded[section.id] ? <ChevronDown className="h-4 w-4 text-gold-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
              <FolderOpen className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium text-white">{section.name}</span>
              <span className="text-xs text-gray-500">({section.items.length})</span>
            </button>
            {expanded[section.id] && (
              <div className="ml-6 space-y-1">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-navy-900">
                    <File className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {item.files.map((f) => (
                          <span key={f.id}>{formatSize(f.size)}</span>
                        ))}
                        {item.files[0] && <span>{new Date(item.files[0].uploadedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                    <div className="flex items-center gap-1">
                      {item.files.map((f) => (
                        <span key={f.id} className="flex gap-1">
                          <button className="rounded p-1 hover:bg-navy-800"><Eye className="h-3.5 w-3.5 text-gray-400" /></button>
                          <button className="rounded p-1 hover:bg-navy-800"><Download className="h-3.5 w-3.5 text-gray-400" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-navy-700 bg-navy-900 p-6">
            <h3 className="font-display text-lg text-gold-400 mb-4">打包下载</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">下载范围</label>
                <select value={packScope} onChange={(e) => setPackScope(e.target.value as typeof packScope)} className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white">
                  <option value="all">全部文件</option>
                  <option value="approved">仅已通过</option>
                  <option value="sections">指定章节</option>
                </select>
              </div>
              {packScope === "sections" && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {project.sections.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={!!selectedSections[s.id]} onChange={(e) => setSelectedSections((prev) => ({ ...prev, [s.id]: e.target.checked }))} className="accent-gold-400" />
                      {s.name}
                    </label>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={packWatermark} onChange={(e) => setPackWatermark(e.target.checked)} className="accent-gold-400" />
                启用水印
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-navy-700 py-2 text-sm text-gray-300 hover:bg-navy-800">取消</button>
              <button onClick={handlePackageDownload} className="flex-1 rounded-lg bg-gold-400 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500">下载</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
