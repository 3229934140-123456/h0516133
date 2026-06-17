import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import JSZip from "jszip";
import {
  useStore, dataUrlToBlob, buildWatermarkText, users,
  applyWatermarkToDataUrl, buildWatermarkedHtmlWrapper
} from "@/store";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import {
  Download, Search, Filter, FolderOpen, File, ChevronDown, ChevronRight,
  Package, Eye, ShieldAlert, History, ListChecks, Sparkles, ChevronRight as ChevronRightIcon,
  DownloadCloud, Lock, X, Plus, Save, Trash2, Settings2, RotateCcw,
  FileText, FileQuestion, CheckCircle2, Ban, Layers
} from "lucide-react";
import type { ExportPreset, ExportRecord, ExportFileRef, ItemStatus } from "@/types";

export default function Archive() {
  const { id } = useParams<{ id: string }>();
  const projects = useStore((s) => s.projects);
  const project = projects.find((p) => p.id === id);
  const currentUserId = useStore((s) => s.currentUserId);
  const canDownloadFileFn = useStore((s) => s.canDownloadFile);
  const addExportRecord = useStore((s) => s.addExportRecord);
  const getFileContent = useStore((s) => s.getFileContent);
  const addExportPreset = useStore((s) => s.addExportPreset);
  const updateExportPreset = useStore((s) => s.updateExportPreset);
  const deleteExportPreset = useStore((s) => s.deleteExportPreset);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ItemStatus>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [packScope, setPackScope] = useState<"all" | "approved" | "sections" | "filtered">("all");
  const [packWatermark, setPackWatermark] = useState(true);
  const [includePending, setIncludePending] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);
  const [presetForm, setPresetForm] = useState<{ name: string; description: string; icon: string; isNew: boolean; id: string | null }>({
    name: "", description: "", icon: "📦", isNew: true, id: null
  });

  const hasRestrictiveRules = project?.securityRules.some(r => !r.allowDownload) ?? false;

  if (!project) return <div className="flex h-full items-center justify-center text-gray-400">项目不存在</div>;

  const currentUser = users.find(u => u.id === currentUserId) || { name: "未知用户", email: "unknown@example.com", role: "investor" as const };

  // 搜索逻辑：同时搜索材料名、文件名
  const filteredSections = useMemo(() => project.sections.map((s) => ({
    ...s,
    items: s.items.filter((item) => {
      const matchSearch = !search
        || item.name.toLowerCase().includes(search.toLowerCase())
        || item.description?.toLowerCase().includes(search.toLowerCase())
        || item.files.some(f => f.name.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchPending = includePending || item.status !== "pending" || item.files.length > 0;
      return matchSearch && matchStatus && matchPending;
    }),
  })).filter((s) => s.items.length > 0), [project.sections, search, statusFilter, includePending]);

  const filteredFileCount = useMemo(() =>
    filteredSections.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.files.length, 0), 0),
    [filteredSections]
  );

  const exportRecords = project.exportRecords || [];
  const lastExport = exportRecords[0];
  const presets = project.exportPresets || [];
  const selectedHistory = exportRecords.find(r => r.id === selectedHistoryId) || null;

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSingleDownload = async (file: { id: string; name: string }) => {
    const canDownload = canDownloadFileFn(project.id, file.id);
    if (!canDownload) return;
    const fileContent = getFileContent(file.id);
    let outDataUrl: string | null = null;

    if (fileContent) {
      if (project.watermarkConfig.enabled) {
        const wmText = buildWatermarkText(project.watermarkConfig.textTemplate, currentUser);
        outDataUrl = await applyWatermarkToDataUrl(fileContent, wmText, {
          fontSize: project.watermarkConfig.fontSize,
          opacity: project.watermarkConfig.opacity + 0.05,
          rotation: project.watermarkConfig.rotation,
        });
      } else {
        outDataUrl = fileContent;
      }
      triggerDownload(dataUrlToBlob(outDataUrl), file.name);
    } else {
      const fallbackMeta = `[文件元数据 - 原内容未存储]\n\n文件: ${file.name}\n所属项目: ${project.name}\n下载时间: ${new Date().toLocaleString("zh-CN")}\n下载人: ${currentUser.name} (${currentUser.email})`;
      let finalMeta = fallbackMeta;
      if (project.watermarkConfig.enabled) {
        const wmText = buildWatermarkText(project.watermarkConfig.textTemplate, currentUser);
        finalMeta = `[水印] ${wmText}\n[水印] ${wmText}\n[水印] ${wmText}\n\n${fallbackMeta}`;
      }
      triggerDownload(new Blob([finalMeta], { type: "text/plain" }), `${file.name}-说明.txt`);
    }
  };

  const handlePreview = (file: { id: string; name: string }) => {
    const fileContent = getFileContent(file.id);
    if (fileContent) {
      const blob = dataUrlToBlob(fileContent);
      const url = URL.createObjectURL(blob);
      const win = window.open("", "_blank");
      if (win) {
        const isImage = blob.type.startsWith("image/");
        const isText = blob.type.startsWith("text/");
        const isPdf = blob.type === "application/pdf";
        const wmText = buildWatermarkText(project.watermarkConfig.textTemplate, currentUser);
        const wmStyle = project.watermarkConfig.enabled ? `
          position:fixed;inset:0;pointer-events:none;z-index:9999;
          background-image:url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><text x='50%' y='50%' fill='rgba(148,163,184,${project.watermarkConfig.opacity * 6})' font-family='sans-serif' font-size='${project.watermarkConfig.fontSize}' transform='rotate(${project.watermarkConfig.rotation} 150 100)' text-anchor='middle'>${wmText}</text></svg>`)}");
          background-repeat: repeat;
        ` : "";
        if (isImage) {
          win.document.write(`<html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${url}" style="max-width:100vw;max-height:100vh"/><div style="${wmStyle}"></div></body></html>`);
        } else if (isText) {
          win.document.write(`<html><body style="margin:0;padding:20px;font-family:sans-serif"><pre style="white-space:pre-wrap"></pre><div style="${wmStyle}"></div></body></html>`);
          win.document.querySelector("pre")!.textContent = "";
          blob.text().then(t => { if (win.document.querySelector("pre")) win.document.querySelector("pre")!.textContent = t; });
        } else if (isPdf) {
          win.document.write(`<html><body style="margin:0"><iframe src="${url}" style="width:100vw;height:100vh;border:0"></iframe><div style="${wmStyle}"></div></body></html>`);
        } else {
          win.document.write(`<html><body style="margin:0;padding:40px;font-family:sans-serif;background:#f8fafc;color:#0f172a"><h2>${file.name}</h2><p>无法在线预览此文件类型，请下载后查看。</p><div style="${wmStyle}"></div></body></html>`);
        }
      }
    } else {
      alert("该文件没有存储预览内容");
    }
  };

  const toggleSection = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const getScopeDescription = (scope: typeof packScope, sIds: string[], kw?: string, sf?: "all" | ItemStatus): string => {
    if (scope === "all") return includePending ? "全部文件（含未上传项清单）" : "全部文件";
    if (scope === "approved") return "仅已审核通过的文件";
    if (scope === "filtered") return `筛选结果：${kw ? `关键词"${kw}" ` : ""}状态:${sf === "all" ? "全部" : sf}，共${filteredFileCount}个文件`;
    if (scope === "sections") {
      const names = project.sections.filter(s => sIds.includes(s.id)).map(s => s.name).slice(0, 3).join("、");
      const more = project.sections.filter(s => sIds.includes(s.id)).length > 3 ? `等${project.sections.filter(s => sIds.includes(s.id)).length}个章节` : "";
      return `指定章节：${names}${more}${includePending ? "（含未上传项）" : ""}`;
    }
    return "";
  };

  const applyPreset = (preset: ExportPreset) => {
    setPackScope(preset.scope);
    setPackWatermark(preset.watermarkEnabled);
    setIncludePending(preset.includePendingItems);
    if (preset.statusFilter) setStatusFilter(preset.statusFilter);
    if (preset.searchKeyword) setSearch(preset.searchKeyword);
    const newSel: Record<string, boolean> = {};
    (preset.sectionIds || []).forEach(sid => { newSel[sid] = true; });
    setSelectedSections(newSel);
    setAppliedPresetId(preset.id);
  };

  const startSavePreset = () => {
    setPresetForm({ name: "", description: "", icon: "📦", isNew: true, id: null });
    setShowPresetManager(true);
  };

  const startEditPreset = (preset: ExportPreset) => {
    setPresetForm({ name: preset.name, description: preset.description, icon: preset.icon, isNew: false, id: preset.id });
    setShowPresetManager(true);
  };

  const handleSavePreset = () => {
    if (!presetForm.name.trim()) return;
    const payload = {
      name: presetForm.name.trim(),
      description: presetForm.description.trim(),
      icon: presetForm.icon || "📦",
      scope: packScope,
      sectionIds: Object.keys(selectedSections).filter(k => selectedSections[k]),
      watermarkEnabled: packWatermark,
      includePendingItems: includePending,
      searchKeyword: search || undefined,
      statusFilter: statusFilter,
      createdBy: currentUserId,
    };
    if (presetForm.isNew) {
      addExportPreset(project.id, payload);
    } else if (presetForm.id) {
      updateExportPreset(project.id, presetForm.id, payload);
    }
    setShowPresetManager(false);
  };

  const handleDeletePreset = (presetId: string) => {
    if (!confirm("确定要删除此导出预设吗？")) return;
    deleteExportPreset(project.id, presetId);
  };

  const reexportFromHistory = (rec: ExportRecord) => {
    setPackScope(rec.scope);
    setPackWatermark(rec.watermarkEnabled);
    setIncludePending(rec.includePendingItems);
    if (rec.statusFilter) setStatusFilter(rec.statusFilter);
    if (rec.searchKeyword) setSearch(rec.searchKeyword);
    if (rec.sectionIds) {
      const newSel: Record<string, boolean> = {};
      rec.sectionIds.forEach(sid => { newSel[sid] = true; });
      setSelectedSections(newSel);
    }
    setAppliedPresetId(rec.presetId || null);
    setShowHistory(false);
    setSelectedHistoryId(null);
    setShowModal(true);
  };

  const handlePackageDownload = async (opts?: { presetId?: string; presetName?: string }) => {
    if (packScope === "sections" && Object.keys(selectedSections).filter(k => selectedSections[k]).length === 0) {
      alert("请至少选择一个章节");
      return;
    }
    setIsDownloading(true);
    const zip = new JSZip();
    const state = useStore.getState();

    let sectionsToInclude: typeof project.sections = [];
    let scopeSectionIds: string[] = [];

    if (packScope === "all") {
      sectionsToInclude = project.sections.map(s => ({
        ...s,
        items: includePending ? s.items : s.items.filter(i => i.status !== "pending" || i.files.length > 0)
      }));
      scopeSectionIds = project.sections.map(s => s.id);
    } else if (packScope === "approved") {
      sectionsToInclude = project.sections.map((s) => ({
        ...s, items: s.items.filter((i) => i.status === "approved")
      })).filter(s => s.items.length > 0);
      scopeSectionIds = sectionsToInclude.map(s => s.id);
    } else if (packScope === "sections") {
      scopeSectionIds = Object.keys(selectedSections).filter(k => selectedSections[k]);
      sectionsToInclude = project.sections.filter((s) => selectedSections[s.id]).map(s => ({
        ...s,
        items: includePending ? s.items : s.items.filter(i => i.status !== "pending" || i.files.length > 0)
      }));
    } else {
      sectionsToInclude = filteredSections;
      scopeSectionIds = filteredSections.map(s => s.id);
    }

    const watermarkEnabled = project.watermarkConfig.enabled && packWatermark;
    const watermarkText = watermarkEnabled
      ? buildWatermarkText(project.watermarkConfig.textTemplate, currentUser)
      : "";
    const wmConf = {
      fontSize: project.watermarkConfig.fontSize,
      opacity: project.watermarkConfig.opacity,
      rotation: project.watermarkConfig.rotation,
    };

    const manifest: string[] = [];
    manifest.push("═".repeat(70));
    manifest.push("                    尽职调查归档清单");
    manifest.push("═".repeat(70));
    manifest.push("");
    manifest.push(`项目名称: ${project.name}`);
    manifest.push(`项目编号: ${project.id}`);
    manifest.push(`导出时间: ${new Date().toLocaleString("zh-CN")}`);
    manifest.push(`导 出  人: ${currentUser.name} (${currentUser.email})`);
    manifest.push(`下载范围: ${packScope === "all" ? "全部文件" : packScope === "approved" ? "仅已通过" : packScope === "filtered" ? "当前筛选结果" : "指定章节"}`);
    manifest.push(`详细范围: ${getScopeDescription(packScope, scopeSectionIds, search, statusFilter)}`);
    manifest.push(`包含未上传项: ${includePending ? "是" : "否"}`);
    if (opts?.presetName) manifest.push(`导出预设: ${opts.presetName}`);
    manifest.push(`水印配置: ${watermarkEnabled ? "✅ 已启用 - 图片/文字真实叠加，PDF/Office文件HTML包装视图带全屏平铺水印" : "❌ 未启用"}`);
    manifest.push("");

    const exportedFiles: ExportFileRef[] = [];
    const blockedFiles: ExportFileRef[] = [];
    let totalFileCount = 0;
    let totalSizeBytes = 0;

    manifest.push("─".repeat(70));
    manifest.push("                           目录结构");
    manifest.push("─".repeat(70));

    for (const section of sectionsToInclude) {
      const sectionFolder = zip.folder(sanitizeFolderName(section.name));
      manifest.push(`\n📁 ${section.name}`);
      for (const item of section.items) {
        const itemFolder = sectionFolder?.folder(sanitizeFolderName(item.name));
        const processLog: string[] = [];
        processLog.push(`═══════════════════════════════════════════════`);
        processLog.push(`材料名称: ${item.name}`);
        processLog.push(`材料状态: ${item.status}`);
        processLog.push(`所属章节: ${section.name}`);
        processLog.push(`导 出 人 : ${currentUser.name} (${currentUser.email})`);
        processLog.push(`导出时间: ${new Date().toLocaleString("zh-CN")}`);
        processLog.push(`水印启用: ${watermarkEnabled ? "是" : "否"}`);
        processLog.push(``);

        manifest.push(`   📋 ${item.name} [${item.status}]`);

        if (item.files.length > 0) {
          for (const file of item.files) {
            const canDownload = state.canDownloadFile(project.id, file.id);
            const fileContent = state.fileContents[file.id];
            const mimeMatch = fileContent?.match(/data:(.*?);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : file.type || "application/octet-stream";
            const needsWrap = watermarkEnabled && shouldWrapInHtml(file, fileContent);

            const fileRef: ExportFileRef = {
              fileId: file.id,
              fileName: file.name,
              itemId: item.id,
              itemName: item.name,
              sectionId: section.id,
              sectionName: section.name,
              size: file.size,
              watermarked: watermarkEnabled,
              wrappedInHtml: needsWrap,
              blocked: !canDownload,
              blockReason: !canDownload ? "管理员已禁用下载权限" : undefined,
            };

            if (!canDownload) {
              blockedFiles.push(fileRef);
              processLog.push(`❌ [${file.name}] 权限受限 - 已替换为权限说明文件`);
              itemFolder?.file(`${sanitizeFileName(file.name)}-权限说明.txt`,
                `═══════════════════════════════════\n` +
                `          下载受限说明\n` +
                `═══════════════════════════════════\n\n` +
                `文件: ${file.name}\n材料: ${item.name}\n章节: ${section.name}\n\n` +
                `⚠️ 管理员已禁用此文件的下载权限。\n` +
                `如需获取原文件，请联系项目管理员。\n\n` +
                `查看人: ${currentUser.name} (${currentUser.email})\n` +
                `时间: ${new Date().toLocaleString("zh-CN")}`
              );
              manifest.push(`      🚫 ${file.name} [下载受限]`);
              continue;
            }

            exportedFiles.push(fileRef);
            totalFileCount++;
            totalSizeBytes += file.size;

            if (fileContent) {
              if (needsWrap) {
                const html = buildWatermarkedHtmlWrapper(file.name, mime, fileContent, watermarkText, wmConf, {
                  itemName: item.name,
                  uploadedAt: file.uploadedAt,
                  viewerName: currentUser.name,
                  viewerEmail: currentUser.email,
                  projectName: project.name,
                });
                const readmeHtml = buildFileReadme(file, mime, watermarkText, currentUser, project.name, item.name);
                itemFolder?.file(`00-安全视图-${sanitizeFileName(file.name)}.html`, html);
                itemFolder?.file(`00-${sanitizeFileName(file.name)}-使用说明.html`, readmeHtml);

                const wrapperInfo =
                  `原始文件: ${file.name}\n` +
                  `文件类型: ${mime}\n` +
                  `文件大小: ${(file.size / 1024).toFixed(1)} KB\n\n` +
                  `由于该类型不支持在文件内直接叠加水印，\n` +
                  `系统采用以下安全方案：\n` +
                  `  • 00-安全视图-*.html — 浏览器打开即可查看带全屏平铺水印的文件\n` +
                  `  • 00-*-使用说明.html — 使用指引和申请原文件流程\n` +
                  `  • original-${sanitizeFileName(file.name)} — 原文件安全副本（如启用）\n\n` +
                  `如需使用原文件进行编辑，请在系统内走「申请原件」审批流程。\n` +
                  `导出时间: ${new Date().toLocaleString("zh-CN")}\n` +
                  `导出人: ${currentUser.name} (${currentUser.email})`;
                itemFolder?.file(`00-${sanitizeFileName(file.name)}-安全说明.txt`, wrapperInfo);

                const originalBlob = dataUrlToBlob(fileContent);
                itemFolder?.file(`original-${sanitizeFileName(file.name)}`, originalBlob);

                processLog.push(`🌐 [${file.name}] 已生成安全副本 + 水印HTML视图 + 使用说明`);
                manifest.push(`      🌐 ${file.name} [带水印HTML视图 + 原文件安全副本]`);
              } else {
                let finalDataUrl = fileContent;
                if (watermarkEnabled) {
                  finalDataUrl = await applyWatermarkToDataUrl(fileContent, watermarkText, {
                    fontSize: project.watermarkConfig.fontSize,
                    opacity: project.watermarkConfig.opacity + 0.05,
                    rotation: project.watermarkConfig.rotation,
                  });
                  processLog.push(`💧 [${file.name}] 已叠加真实水印`);
                  manifest.push(`      💧 ${file.name} [已叠加真实水印]`);
                } else {
                  processLog.push(`✅ [${file.name}] 原文件导出（无水印）`);
                  manifest.push(`      ✅ ${file.name}`);
                }
                const blob = dataUrlToBlob(finalDataUrl);
                itemFolder?.file(sanitizeFileName(file.name), blob);
              }
            } else {
              let metaContent =
                `═══════════════════════════════════\n` +
                `          文件元数据\n` +
                `═══════════════════════════════════\n\n` +
                `文件: ${file.name}\n大小: ${(file.size / 1024).toFixed(1)}KB\n` +
                `类型: ${file.type}\n上传时间: ${new Date(file.uploadedAt).toLocaleString("zh-CN")}\n` +
                `所属材料: ${item.name}\n所属章节: ${section.name}\n材料状态: ${item.status}\n` +
                `材料描述: ${item.description}\n` +
                `查看人: ${currentUser.name} (${currentUser.email})\n` +
                `下载时间: ${new Date().toLocaleString("zh-CN")}\n\n` +
                `⚠️ 提示: 此文件原始二进制内容未在系统中存储。\n上述为文件元数据信息。`;
              if (watermarkText) {
                metaContent =
                  `═══════════════════════════════════\n` +
                  `[水印] ${watermarkText}\n[水印] ${watermarkText}\n[水印] ${watermarkText}\n` +
                  `═══════════════════════════════════\n\n` + metaContent;
              }
              itemFolder?.file(`${sanitizeFileName(file.name)}-metadata.txt`, metaContent);
              processLog.push(`ℹ️ [${file.name}] 原内容未存储，已生成元数据文件`);
              manifest.push(`      ℹ️ ${file.name} [元数据说明]`);
            }
          }
        } else {
          let infoContent =
            `═══════════════════════════════════\n` +
            `          材料信息\n` +
            `═══════════════════════════════════\n\n` +
            `材料名称: ${item.name}\n材料状态: ${item.status}\n` +
            `材料描述: ${item.description}\n所属章节: ${section.name}\n\n` +
            `ℹ️ 此材料尚未上传文件。\n查看人: ${currentUser.name}\n` +
            `导出时间: ${new Date().toLocaleString("zh-CN")}`;
          if (watermarkText) {
            infoContent =
              `═══════════════════════════════════\n` +
              `[水印] ${watermarkText}\n[水印] ${watermarkText}\n` +
              `═══════════════════════════════════\n\n` + infoContent;
          }
          itemFolder?.file(`材料信息.txt`, infoContent);
          processLog.push(`ℹ️ 此材料尚未上传文件，已生成材料信息说明`);
          manifest.push(`      ℹ️ (尚未上传文件)`);
        }

        processLog.push(``);
        processLog.push(`═══════════════════════════════════════════════`);
        processLog.push(`处理结束`);
        itemFolder?.file(`_处理记录.txt`, processLog.join("\n"));
      }
    }

    manifest.push("\n" + "═".repeat(70));
    manifest.push(`总计: ${totalFileCount} 个文件，总大小: ${formatSize(totalSizeBytes)}`);
    if (blockedFiles.length > 0) manifest.push(`拦截: ${blockedFiles.length} 个文件（权限受限）`);
    manifest.push("═".repeat(70));

    if (watermarkEnabled) {
      manifest.push("\n\n═════════════════ 水印说明 ═════════════════");
      manifest.push(`水印模板: ${project.watermarkConfig.textTemplate}`);
      manifest.push(`水印文字: ${watermarkText}`);
      manifest.push(`字号: ${project.watermarkConfig.fontSize}px  透明度: ${project.watermarkConfig.opacity}  旋转: ${project.watermarkConfig.rotation}°`);
      manifest.push("处理方式:");
      manifest.push("  • 图片文件: Canvas逐像素旋转平铺真实叠加水印");
      manifest.push("  • 文本文件: 头部/尾部插入水印行");
      manifest.push("  • PDF/Office等: 生成HTML水印视图 + 原文件安全副本 + 使用说明");
      manifest.push("  • 每个材料独立目录包含: 原文件(如可)/水印视图/使用说明/处理记录");
      manifest.push("═══════════════════════════════════════════\n");
    }

    if (blockedFiles.length > 0) {
      manifest.push("\n\n═════════════════ 权限受限文件清单 ═════════════════");
      for (const bf of blockedFiles) {
        manifest.push(`  • [${bf.sectionName}] ${bf.itemName} / ${bf.fileName} — ${bf.blockReason}`);
      }
      manifest.push("══════════════════════════════════════════════════\n");
    }

    zip.file("000-归档清单.txt", manifest.join("\n"));

    const readmeContent = buildPackageReadme(project.name, currentUser, watermarkEnabled, watermarkText, totalFileCount, totalSizeBytes, packScope, scopeSectionIds, includePending, blockedFiles, opts?.presetName);
    zip.file("000-使用说明.html", readmeContent);

    const blob = await zip.generateAsync({ type: "blob" });
    const timestamp = new Date().toISOString().slice(0, 10);
    const scopeTag = packScope === "all" ? "全部" : packScope === "approved" ? "已通过" : packScope === "filtered" ? "筛选结果" : "指定章节";
    const presetTag = opts?.presetName ? `-${opts.presetName}` : "";
    const wmTag = watermarkEnabled ? "-水印" : "";
    triggerDownload(blob, `${sanitizeFileName(project.name)}${presetTag}-${scopeTag}${wmTag}-${timestamp}.zip`);

    try {
      const record: ExportRecord = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId: project.id,
        exportedBy: currentUserId,
        exportedByName: currentUser.name,
        exportedAt: new Date().toISOString(),
        scope: packScope,
        scopeDescription: getScopeDescription(packScope, scopeSectionIds, search, statusFilter),
        sectionIds: scopeSectionIds,
        watermarkEnabled,
        includePendingItems: includePending,
        fileCount: totalFileCount,
        packageSizeBytes: blob.size,
        presetId: opts?.presetId,
        presetName: opts?.presetName,
        searchKeyword: search || undefined,
        statusFilter,
        files: exportedFiles,
        blockedFiles,
      };
      addExportRecord(project.id, record);
    } catch (e) {
      console.warn("写入导出记录失败", e);
    }

    setShowModal(false);
    setIsDownloading(false);
  };

  const formatSize = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      {hasRestrictiveRules && (
        <div className="flex items-center gap-3 border-b border-amber-700/50 bg-amber-900/20 px-6 py-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">安全提示: 当前项目存在下载限制，部分文件可能无法下载。受限文件将自动替换为权限说明。</p>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-navy-800 px-6 py-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索材料名、描述或文件名..."
            className="w-full rounded-lg border border-navy-700 bg-navy-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none"
          />
          {search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gold-400/80 font-mono">
              已同步筛选文件名
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ItemStatus)}
            className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">全部状态</option>
            <option value="approved">✅ 已通过</option>
            <option value="uploaded">📤 已上传</option>
            <option value="in_review">🔍 审核中</option>
            <option value="questioned">❓ 有疑问</option>
            <option value="supplement_needed">📝 需补充</option>
            <option value="pending">⏳ 待上传</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includePending}
            onChange={(e) => setIncludePending(e.target.checked)}
            className="accent-gold-400 rounded"
          />
          含未上传项
        </label>

        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-gray-300 hover:bg-navy-800"
          title="查看导出历史"
        >
          <History className="h-4 w-4 text-gold-400" />
          {lastExport ? (
            <span className="hidden sm:inline truncate max-w-[200px]">上次: {new Date(lastExport.exportedAt).toLocaleDateString()} · {lastExport.presetName || lastExport.scopeDescription.slice(0, 6)}</span>
          ) : (
            <span className="hidden sm:inline">暂无导出</span>
          )}
          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setPackScope("filtered");
              setPackWatermark(project.watermarkConfig.enabled);
              setShowModal(true);
            }}
            disabled={filteredFileCount === 0}
            className="flex items-center gap-2 rounded-lg border border-gold-400/60 bg-navy-900 px-4 py-2 text-sm text-gold-400 hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed"
            title="按当前搜索/筛选结果导出"
          >
            <ListChecks className="h-4 w-4" />
            <span className="hidden md:inline">导出筛选结果</span>
            <span className="md:hidden">筛选导出</span>
            {filteredFileCount > 0 && <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-xs font-semibold text-navy-950">{filteredFileCount}</span>}
          </button>

          <button
            onClick={() => {
              setPackScope("all");
              setPackWatermark(project.watermarkConfig.enabled);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500"
          >
            <Package className="h-4 w-4" /> 打包下载
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">没有找到匹配的材料</p>
            <p className="text-xs mt-1">尝试调整搜索关键词或状态筛选条件（搜索支持材料名和文件名）</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section.id} className="mb-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-navy-900 transition-colors"
              >
                {expanded[section.id] === false || expanded[section.id] === undefined
                  ? <ChevronRight className="h-4 w-4 text-gray-400" />
                  : <ChevronDown className="h-4 w-4 text-gold-400" />}
                <FolderOpen className="h-4 w-4 text-gold-400" />
                <span className="text-sm font-medium text-white">{section.name}</span>
                <span className="text-xs text-gray-500">({section.items.length} 项材料)</span>
                <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                  <span>{section.items.reduce((a, i) => a + i.files.length, 0)} 个文件</span>
                </div>
              </button>
              {(expanded[section.id] === undefined || expanded[section.id] === true) && (
                <div className="ml-6 space-y-1">
                  {section.items.map((item) => {
                    const matchedByFilename = search && item.files.some(f => f.name.toLowerCase().includes(search.toLowerCase())) &&
                      !item.name.toLowerCase().includes(search.toLowerCase());
                    return (
                      <div key={item.id} className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-navy-900 transition-colors",
                        matchedByFilename && "ring-1 ring-gold-400/30 bg-gold-400/5"
                      )}>
                        <File className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate flex items-center gap-2">
                            {item.name}
                            {matchedByFilename && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] text-gold-400 font-medium">
                                <Search className="h-2.5 w-2.5" />
                                文件名匹配
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            {item.files.length > 0 ? (
                              <>
                                <span>{item.files.length} 个文件</span>
                                <span>·</span>
                                <span>总 {formatSize(item.files.reduce((a, f) => a + f.size, 0))}</span>
                                {search && (
                                  <>
                                    <span>·</span>
                                    <span className="text-blue-300/80">
                                      {item.files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => f.name).slice(0, 2).join("、")}
                                      {item.files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).length > 2 && ` 等${item.files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).length}个`}
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-amber-500/80">尚未上传文件</span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                        <div className="flex items-center gap-1">
                          {item.files.map((f) => {
                            const canDownload = canDownloadFileFn(project.id, f.id);
                            const matchedByFilename = search && f.name.toLowerCase().includes(search.toLowerCase());
                            return (
                              <span key={f.id} className="flex gap-1">
                                <button
                                  onClick={() => handlePreview(f)}
                                  className={cn(
                                    "rounded p-1.5 hover:bg-navy-800 transition-colors",
                                    matchedByFilename && "bg-gold-400/10"
                                  )}
                                  title={project.watermarkConfig.enabled ? "预览 (全屏平铺水印)" : "预览"}
                                >
                                  <Eye className={cn("h-3.5 w-3.5", project.watermarkConfig.enabled ? "text-blue-400" : "text-gray-400")} />
                                </button>
                                <button
                                  onClick={() => handleSingleDownload(f)}
                                  className={cn(
                                    "rounded p-1.5 transition-colors",
                                    canDownload
                                      ? "hover:bg-navy-800 cursor-pointer text-gray-400 hover:text-gold-400"
                                      : "cursor-not-allowed opacity-40 text-gray-500",
                                    matchedByFilename && "bg-gold-400/10"
                                  )}
                                  disabled={!canDownload}
                                  title={canDownload
                                    ? (project.watermarkConfig.enabled ? "下载 (已叠加水印)" : "下载")
                                    : "管理员已禁用下载权限"}
                                >
                                  {canDownload ? (
                                    <Download className="h-3.5 w-3.5" />
                                  ) : (
                                    <Lock className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-navy-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                  <DownloadCloud className="h-5 w-5 text-navy-950" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-gold-400">打包下载归档</h3>
                  <p className="text-xs text-gray-500 mt-0.5">按选定范围生成完整归档包 · 每个材料独立目录</p>
                </div>
              </div>
              <button onClick={() => !isDownloading && setShowModal(false)} className="rounded-lg p-2 hover:bg-navy-800 transition-colors disabled:opacity-50" disabled={isDownloading}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {presets.length > 0 && (
              <div className="border-b border-navy-800 px-6 py-4 bg-navy-950/40">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    快速套用预设
                  </p>
                  <button
                    onClick={startSavePreset}
                    className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> 保存当前配置为预设
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {presets.map((p) => (
                    <div key={p.id} className="group relative">
                      <button
                        onClick={() => applyPreset(p)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all",
                          appliedPresetId === p.id
                            ? "border-gold-400 bg-gold-400/10 shadow-lg shadow-gold-400/5"
                            : "border-navy-800 bg-navy-950/60 hover:border-navy-700 hover:bg-navy-900"
                        )}
                        title={p.description}
                      >
                        <span className="text-base">{p.icon}</span>
                        <span className={cn(appliedPresetId === p.id ? "text-gold-400 font-medium" : "text-gray-300")}>{p.name}</span>
                      </button>
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditPreset(p); }}
                          className="rounded-md bg-navy-800 p-1 hover:bg-navy-700"
                          title="编辑预设"
                        >
                          <Settings2 className="h-3 w-3 text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePreset(p.id); }}
                          className="rounded-md bg-navy-800 p-1 hover:bg-red-500/30"
                          title="删除预设"
                        >
                          <Trash2 className="h-3 w-3 text-gray-300 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-5 space-y-5 overflow-y-auto">
              <div>
                <label className="text-sm text-gray-300 mb-2 block font-medium">📦 下载范围</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <ScopeCard
                    active={packScope === "all"}
                    onClick={() => { setPackScope("all"); setAppliedPresetId(null); }}
                    icon={<Package className="h-4 w-4" />}
                    title="全部文件"
                    desc={project.sections.length + " 章节"}
                  />
                  <ScopeCard
                    active={packScope === "approved"}
                    onClick={() => { setPackScope("approved"); setAppliedPresetId(null); }}
                    icon={<ListChecks className="h-4 w-4" />}
                    title="仅已通过"
                    desc={project.sections.reduce((a, s) => a + s.items.filter(i => i.status === "approved").length, 0) + " 项"}
                  />
                  <ScopeCard
                    active={packScope === "filtered"}
                    onClick={() => { setPackScope("filtered"); setAppliedPresetId(null); }}
                    icon={<Filter className="h-4 w-4" />}
                    title="当前筛选"
                    desc={filteredFileCount + " 个文件"}
                  />
                  <ScopeCard
                    active={packScope === "sections"}
                    onClick={() => { setPackScope("sections"); setAppliedPresetId(null); }}
                    icon={<FolderOpen className="h-4 w-4" />}
                    title="指定章节"
                    desc="自由选择"
                  />
                </div>
              </div>

              {packScope === "sections" && (
                <div>
                  <label className="text-sm text-gray-300 mb-2 block font-medium">📂 选择要导出的章节</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-navy-800 bg-navy-950/50 p-2">
                    {project.sections.map((s) => (
                      <label key={s.id} className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors",
                        selectedSections[s.id] ? "bg-gold-400/10 hover:bg-gold-400/15" : "hover:bg-navy-800/50"
                      )}>
                        <input
                          type="checkbox"
                          checked={!!selectedSections[s.id]}
                          onChange={(e) => setSelectedSections((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                          className="h-4 w-4 accent-gold-400 rounded"
                        />
                        <FolderOpen className={cn("h-4 w-4 shrink-0", selectedSections[s.id] ? "text-gold-400" : "text-gray-500")} />
                        <span className="flex-1 text-sm text-gray-200">{s.name}</span>
                        <span className="text-xs text-gray-500">{s.items.length} 项 · {s.items.reduce((a, i) => a + i.files.length, 0)} 文件</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {packScope === "filtered" && (
                <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
                  <p className="text-xs text-blue-300 font-medium mb-2 flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" /> 当前筛选条件
                  </p>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>🔍 关键词: <span className="text-gold-400 font-medium">{search || "(未设置)"}</span></div>
                    <div>🏷️ 状态: <span className="text-gold-400 font-medium">{statusFilter === "all" ? "全部" : statusFilter}</span></div>
                    <div>📁 匹配章节: <span className="text-gold-400 font-medium">{filteredSections.length} 个</span></div>
                    <div>📄 匹配文件: <span className="text-gold-400 font-medium">{filteredFileCount} 个</span></div>
                    <div>📋 含未上传项: <span className="text-gold-400 font-medium">{includePending ? "是" : "否"}</span></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-navy-800 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={packWatermark}
                      onChange={(e) => setPackWatermark(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-gold-400 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200 font-medium">启用安全水印</span>
                        {!project.watermarkConfig.enabled && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">⚠️ 项目水印未激活</span>
                        )}
                        {project.watermarkConfig.enabled && packWatermark && (
                          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        图片 Canvas 叠加、文本头尾插入、PDF/Office 生成水印 HTML 视图 + 原文件安全副本
                      </p>
                    </div>
                  </label>
                </div>
                <div className="rounded-xl border border-navy-800 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePending}
                      onChange={(e) => setIncludePending(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-gold-400 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200 font-medium">包含未上传材料</span>
                        <FileQuestion className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        对于待上传/缺失的材料，也在压缩包内生成对应目录和说明文件，便于核对清单
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {project.watermarkConfig.enabled && (
                <div className="rounded-lg bg-navy-950/70 border border-navy-800 px-4 py-3">
                  <p className="text-xs text-gray-500">当前水印模板: <span className="text-gold-400 font-mono">{project.watermarkConfig.textTemplate}</span></p>
                  <p className="text-xs text-gray-500 mt-1">实际渲染: <span className="text-blue-300">{buildWatermarkText(project.watermarkConfig.textTemplate, currentUser)}</span></p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-navy-800 bg-navy-950/50 px-6 py-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                导出后自动生成导出记录，可在「历史」中复查
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isDownloading}
                  className="px-5 py-2 rounded-xl border border-navy-700 text-sm text-gray-300 hover:bg-navy-800 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handlePackageDownload(appliedPresetId ? { presetId: appliedPresetId, presetName: presets.find(p => p.id === appliedPresetId)?.name } : undefined)}
                  disabled={isDownloading || (packScope === "sections" && Object.keys(selectedSections).filter(k => selectedSections[k]).length === 0)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-sm font-semibold text-navy-950 hover:from-gold-500 hover:to-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-gold-400/10"
                >
                  {isDownloading ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-navy-950 border-t-transparent" />
                      打包生成中...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      开始导出
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPresetManager && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-800 px-6 py-4">
              <h3 className="font-display text-lg text-gold-400">
                {presetForm.isNew ? "保存导出预设" : "编辑导出预设"}
              </h3>
              <button onClick={() => setShowPresetManager(false)} className="rounded-lg p-2 hover:bg-navy-800">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-1">
                  <label className="text-xs text-gray-400 mb-1 block">图标</label>
                  <input
                    value={presetForm.icon}
                    onChange={(e) => setPresetForm(f => ({ ...f, icon: e.target.value || "📦" }))}
                    className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-2xl text-white"
                    maxLength={4}
                  />
                </div>
                <div className="col-span-5">
                  <label className="text-xs text-gray-400 mb-1 block">预设名称</label>
                  <input
                    value={presetForm.name}
                    onChange={(e) => setPresetForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="如：投委会版、法务版..."
                    className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">描述</label>
                <textarea
                  value={presetForm.description}
                  onChange={(e) => setPresetForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="简要描述此预设的使用场景..."
                  rows={3}
                  className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none resize-none"
                />
              </div>
              <div className="rounded-xl border border-navy-800 bg-navy-950/40 p-4 space-y-2 text-xs text-gray-400">
                <p className="text-gray-300 font-medium mb-1">将保存以下配置：</p>
                <p>📦 范围: {packScope === "all" ? "全部文件" : packScope === "approved" ? "仅已通过" : packScope === "filtered" ? "当前筛选" : "指定章节"}</p>
                {packScope === "sections" && <p>📂 章节: {project.sections.filter(s => selectedSections[s.id]).map(s => s.name).slice(0, 3).join("、") || "(未选)"}</p>}
                {packScope === "filtered" && <p>🔍 关键词: "{search || "(无)"}" · 状态: {statusFilter}</p>}
                <p>💧 水印: {packWatermark ? "启用" : "不启用"}</p>
                <p>📋 未上传项: {includePending ? "包含" : "不包含"}</p>
              </div>
            </div>
            <div className="border-t border-navy-800 bg-navy-950/50 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowPresetManager(false)} className="px-5 py-2 rounded-xl border border-navy-700 text-sm text-gray-300 hover:bg-navy-800">取消</button>
              <button
                onClick={handleSavePreset}
                disabled={!presetForm.name.trim()}
                className="px-6 py-2 rounded-xl bg-gold-400 text-sm font-semibold text-navy-950 hover:bg-gold-500 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> 保存预设
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-navy-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 border border-navy-600">
                  <History className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-gold-400">导出历史记录</h3>
                  <p className="text-xs text-gray-500 mt-0.5">项目内共 {exportRecords.length} 次导出（保留最近50条）</p>
                </div>
              </div>
              <button onClick={() => { setShowHistory(false); setSelectedHistoryId(null); }} className="rounded-lg p-2 hover:bg-navy-800 transition-colors">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="w-[42%] border-r border-navy-800 overflow-y-auto p-3 space-y-2">
                {exportRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <History className="h-12 w-12 mb-3 opacity-40" />
                    <p className="text-sm">还没有导出记录</p>
                  </div>
                ) : (
                  exportRecords.map((rec, idx) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedHistoryId(rec.id)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3 transition-all",
                        selectedHistoryId === rec.id
                          ? "border-gold-400/50 bg-gold-400/10"
                          : idx === 0
                            ? "border-navy-700 bg-gradient-to-br from-gold-400/5 to-transparent hover:border-navy-600"
                            : "border-navy-800 bg-navy-950/30 hover:border-navy-700"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-400">
                            <Sparkles className="h-2.5 w-2.5" /> 最近
                          </span>
                        )}
                        {rec.presetName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-400/10 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                            <Layers className="h-2.5 w-2.5" /> {rec.presetName}
                          </span>
                        )}
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          rec.scope === "all" ? "bg-green-400/10 text-green-400" :
                          rec.scope === "approved" ? "bg-blue-400/10 text-blue-400" :
                          rec.scope === "filtered" ? "bg-purple-400/10 text-purple-400" :
                          "bg-amber-400/10 text-amber-400"
                        )}>
                          {rec.scope === "all" ? "全部" : rec.scope === "approved" ? "已通过" : rec.scope === "filtered" ? "筛选" : "章节"}
                        </span>
                        {rec.watermarkEnabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">💧 水印</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-400/10 px-2 py-0.5 text-[10px] font-medium text-gray-400">无水印</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-200 mb-1.5 line-clamp-2">{rec.scopeDescription}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>👤 {rec.exportedByName}</span>
                        <span>🕒 {new Date(rec.exportedAt).toLocaleString("zh-CN").slice(5)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {selectedHistory ? (
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {selectedHistory.presetName && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-400/15 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                              <Layers className="h-3 w-3" /> 使用预设: {selectedHistory.presetName}
                            </span>
                          )}
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            selectedHistory.watermarkEnabled ? "bg-blue-400/15 text-blue-300" : "bg-gray-400/10 text-gray-400"
                          )}>
                            <Lock className="h-3 w-3" /> {selectedHistory.watermarkEnabled ? "已启用水印" : "未启用水印"}
                          </span>
                        </div>
                        <h4 className="font-display text-base text-gold-400 mb-1">{selectedHistory.scopeDescription}</h4>
                        <p className="text-xs text-gray-400">
                          导出人: {selectedHistory.exportedByName} · {new Date(selectedHistory.exportedAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                      <button
                        onClick={() => reexportFromHistory(selectedHistory)}
                        className="flex items-center gap-1.5 rounded-xl bg-gold-400/15 px-3 py-2 text-xs font-medium text-gold-400 hover:bg-gold-400/25 transition-colors shrink-0"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> 按同条件再导出
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-5">
                      <StatMini label="章节数" value={(selectedHistory.sectionIds || []).length} />
                      <StatMini label="导出文件" value={selectedHistory.fileCount} />
                      <StatMini label="被拦截" value={selectedHistory.blockedFiles?.length || 0} danger={!!selectedHistory.blockedFiles?.length} />
                      <StatMini label="压缩包" value={formatSize(selectedHistory.packageSizeBytes)} />
                    </div>

                    <div className="space-y-4">
                      {(selectedHistory.sectionIds || []).map(sid => {
                        const sectionName = project.sections.find(s => s.id === sid)?.name || sid;
                        const secFiles = (selectedHistory.files || []).filter(f => f.sectionId === sid);
                        const secBlocked = (selectedHistory.blockedFiles || []).filter(f => f.sectionId === sid);
                        if (secFiles.length === 0 && secBlocked.length === 0) return null;
                        return (
                          <div key={sid} className="rounded-xl border border-navy-800 overflow-hidden">
                            <div className="flex items-center gap-2 bg-navy-950/60 px-4 py-2.5 border-b border-navy-800">
                              <FolderOpen className="h-3.5 w-3.5 text-gold-400" />
                              <span className="text-sm font-medium text-white">{sectionName}</span>
                              <span className="text-[11px] text-gray-500 ml-auto">{secFiles.length + secBlocked.length} 个文件</span>
                            </div>
                            <div className="divide-y divide-navy-800/70">
                              {secFiles.map(f => (
                                <div key={f.fileId} className="flex items-center gap-3 px-4 py-2 hover:bg-navy-900/50">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white truncate">{f.itemName} · {f.fileName}</p>
                                    <p className="text-[10px] text-gray-500">
                                      {formatSize(f.size)}
                                      {f.watermarked && " · 💧含水印"}
                                      {f.wrappedInHtml && " · 🌐HTML包装"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {secBlocked.map(f => (
                                <div key={`b-${f.fileId}`} className="flex items-center gap-3 px-4 py-2 bg-red-500/5 hover:bg-red-500/10">
                                  <Ban className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-red-200/90 truncate">{f.itemName} · {f.fileName}</p>
                                    <p className="text-[10px] text-red-400/70">🚫 {f.blockReason || "权限受限"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-500 h-full">
                    <FileText className="h-12 w-12 mb-3 opacity-40" />
                    <p className="text-sm">选择左侧记录查看详情</p>
                    <p className="text-xs mt-1">可查看导出范围、文件清单、拦截记录</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-navy-800 bg-navy-950/50 px-6 py-3 flex justify-end">
              <button
                onClick={() => { setShowHistory(false); setSelectedHistoryId(null); }}
                className="px-5 py-2 rounded-xl border border-navy-700 text-sm text-gray-300 hover:bg-navy-800 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScopeCard({ active, onClick, icon, title, desc }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-xl border-2 p-3 text-left transition-all duration-200",
        active
          ? "border-gold-400 bg-gold-400/10 shadow-lg shadow-gold-400/5"
          : "border-navy-800 bg-navy-950/40 hover:border-navy-700 hover:bg-navy-900"
      )}
    >
      <div className={cn("flex items-center gap-2 mb-1", active ? "text-gold-400" : "text-gray-400 group-hover:text-gray-300")}>
        {icon}
        <span className="text-sm font-medium text-inherit">{title}</span>
      </div>
      <p className={cn("text-xs", active ? "text-gold-400/80" : "text-gray-500")}>{desc}</p>
    </button>
  );
}

function StatMini({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-950/40 p-3 text-center">
      <div className={cn("text-lg font-bold", danger ? "text-red-400" : "text-gold-400")}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function sanitizeFolderName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

function shouldWrapInHtml(file: { type: string; name: string }, content: string | undefined): boolean {
  if (!content) return false;
  const mimeMatch = content.match(/data:(.*?);base64,/);
  const mime = mimeMatch ? mimeMatch[1] : file.type || "";
  const officeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.oasis.opendocument",
    "application/rtf",
  ];
  if (officeTypes.some(t => mime.startsWith(t))) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf"].includes(ext)) return true;
  return false;
}

function buildFileReadme(
  file: { name: string; type: string; size: number; uploadedAt: string },
  mime: string,
  watermarkText: string,
  viewer: { name: string; email: string },
  projectName: string,
  itemName: string
): string {
  const escapedWm = watermarkText.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>水印视图使用说明 - ${file.name}</title>
<style>
  body{margin:0;padding:60px 40px;font-family:system-ui,"Segoe UI",sans-serif;background:linear-gradient(135deg,#0f172a,#1e293b);color:#e2e8f0;min-height:100vh;}
  .card{max-width:680px;margin:0 auto;background:rgba(15,23,42,0.85);border:1px solid rgba(212,168,67,0.3);border-radius:20px;padding:40px;backdrop-filter:blur(10px);box-shadow:0 20px 60px rgba(0,0,0,0.4);}
  h1{color:#D4A843;font-size:22px;margin:0 0 8px;}
  .subtitle{color:#94a3b8;font-size:13px;margin-bottom:24px;}
  .wm-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.3);padding:10px 16px;border-radius:12px;color:#93c5fd;font-size:13px;margin-bottom:24px;font-family:ui-monospace,Consolas,monospace;word-break:break-all;}
  .file-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:24px;}
  .file-item{background:rgba(30,41,59,0.5);border-radius:10px;padding:12px 14px;}
  .file-label{color:#64748b;font-size:11px;margin-bottom:4px;}
  .file-val{color:#cbd5e1;font-size:12.5px;word-break:break-all;}
  .step{background:rgba(30,41,59,0.6);border-radius:12px;padding:16px 20px;margin-bottom:12px;border-left:3px solid #D4A843;}
  .step-title{color:#D4A843;font-weight:600;font-size:14px;margin-bottom:6px;}
  .step-body{color:#94a3b8;font-size:12.5px;line-height:1.7;}
  code{background:rgba(15,23,42,0.8);padding:2px 8px;border-radius:6px;color:#fbbf24;font-size:12px;}
  .file-list{display:flex;flex-direction:column;gap:8px;margin:12px 0;}
  .file-row{display:flex;align-items:center;gap:10px;background:rgba(30,41,59,0.4);border-radius:10px;padding:10px 14px;}
  .file-row .fname{flex:1;color:#e2e8f0;font-size:13px;word-break:break-all;}
  .file-row .ftag{font-size:11px;padding:2px 8px;border-radius:999px;}
  @media print{body::after{content:'${escapedWm}';position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:80px;color:rgba(148,163,184,0.08);transform:rotate(-30deg);white-space:nowrap;z-index:99999;pointer-events:none;}}
</style>
</head>
<body>
  <div class="card">
    <h1>🔒 水印视图使用说明</h1>
    <div class="subtitle">为防止敏感文件泄露，本文件已通过多层安全方案交付</div>

    <div class="wm-tag">🔐 ${escapedWm}</div>

    <div class="file-grid">
      <div class="file-item"><div class="file-label">文件名</div><div class="file-val">${file.name}</div></div>
      <div class="file-item"><div class="file-label">MIME类型</div><div class="file-val">${mime}</div></div>
      <div class="file-item"><div class="file-label">文件大小</div><div class="file-val">${(file.size / 1024).toFixed(1)} KB</div></div>
      <div class="file-item"><div class="file-label">上传时间</div><div class="file-val">${new Date(file.uploadedAt).toLocaleString("zh-CN")}</div></div>
      <div class="file-item"><div class="file-label">所属项目</div><div class="file-val">${projectName}</div></div>
      <div class="file-item"><div class="file-label">关联材料</div><div class="file-val">${itemName}</div></div>
    </div>

    <div class="step">
      <div class="step-title">📦 本目录已交付的文件</div>
      <div class="file-list">
        <div class="file-row">
          <span class="fname">00-安全视图-${sanitizeFileName(file.name)}.html</span>
          <span class="ftag" style="background:rgba(59,130,246,0.2);color:#93c5fd">🌐 水印视图</span>
        </div>
        <div class="file-row">
          <span class="fname">original-${sanitizeFileName(file.name)}</span>
          <span class="ftag" style="background:rgba(34,197,94,0.2);color:#86efac">📎 原文件安全副本</span>
        </div>
        <div class="file-row">
          <span class="fname">00-${sanitizeFileName(file.name)}-安全说明.txt</span>
          <span class="ftag" style="background:rgba(212,168,67,0.2);color:#fcd34d">📋 文字说明</span>
        </div>
        <div class="file-row">
          <span class="fname">_处理记录.txt</span>
          <span class="ftag" style="background:rgba(100,116,139,0.2);color:#cbd5e1">🛠️ 处理日志</span>
        </div>
      </div>
    </div>

    <div class="step">
      <div class="step-title">📖 推荐查看方式</div>
      <div class="step-body">
        打开同目录下的 <code>00-安全视图-${sanitizeFileName(file.name)}.html</code>：<br/>
        浏览器中直接查看文件内容，全屏平铺水印覆盖层，打印时自动叠加超大防打印水印，同时可追溯查看人身份。
      </div>
    </div>

    <div class="step">
      <div class="step-title">📥 需要使用原文件？</div>
      <div class="step-body">
        目录中已提供 <code>original-${sanitizeFileName(file.name)}</code> 作为安全副本，便于您离线归档或内部流转。<br/>
        如果需要用于编辑或对外提供，请在尽调系统中使用「审核流程 - 申请原件」功能走审批流程。
      </div>
    </div>

    <div class="step">
      <div class="step-title">⚖️ 法律提示</div>
      <div class="step-body">
        本文件包含项目敏感信息，受保密协议（NDA）约束。水印永久关联您的账号身份，任何形式的泄露（拍照、录屏、截图、打印、转发）均可追溯到责任人。
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildPackageReadme(
  projectName: string,
  viewer: { name: string; email: string },
  watermarkEnabled: boolean,
  watermarkText: string,
  fileCount: number,
  totalSize: number,
  scope: string,
  sectionIds: string[],
  includePending: boolean,
  blockedFiles: ExportFileRef[],
  presetName?: string
): string {
  const escapedWm = watermarkText.replace(/"/g, "&quot;");
  const scopeDesc = scope === "all" ? "全部文件" : scope === "approved" ? "仅已审核通过" : scope === "filtered" ? "当前筛选结果" : "指定章节";
  const sizeStr = totalSize >= 1048576 ? `${(totalSize / 1048576).toFixed(2)} MB` : `${(totalSize / 1024).toFixed(0)} KB`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>尽职调查归档包 - ${projectName}</title>
<style>
  body{margin:0;padding:60px 40px;font-family:system-ui,"Segoe UI",sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);color:#e2e8f0;min-height:100vh;}
  .wrap{max-width:820px;margin:0 auto;}
  .header{text-align:center;padding:32px;margin-bottom:28px;background:linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.02));border:1px solid rgba(212,168,67,0.25);border-radius:20px;}
  .logo{font-size:48px;margin-bottom:12px;}
  h1{color:#D4A843;font-size:26px;margin:0 0 8px;letter-spacing:1px;}
  .sub{color:#94a3b8;font-size:14px;}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:24px 0;}
  .stat{background:rgba(30,41,59,0.7);border:1px solid rgba(51,65,85,0.5);border-radius:14px;padding:18px 12px;text-align:center;}
  .stat-num{font-size:20px;font-weight:700;color:#D4A843;}
  .stat-label{font-size:11px;color:#64748b;margin-top:4px;}
  .card{background:rgba(15,23,42,0.7);border:1px solid rgba(51,65,85,0.4);border-radius:16px;padding:22px 26px;margin-bottom:16px;backdrop-filter:blur(6px);}
  .card h2{color:#D4A843;font-size:15px;margin:0 0 14px;display:flex;align-items:center;gap:10px;}
  .row{display:flex;padding:7px 0;border-bottom:1px dashed rgba(51,65,85,0.3);font-size:13px;}
  .row:last-child{border-bottom:0;}
  .row .k{width:130px;color:#64748b;flex-shrink:0;}
  .row .v{color:#cbd5e1;word-break:break-all;flex:1;}
  .tag{display:inline-block;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:500;}
  .tag-gold{background:rgba(212,168,67,0.15);color:#D4A843;}
  .tag-blue{background:rgba(59,130,246,0.15);color:#93c5fd;}
  .tag-purple{background:rgba(168,85,247,0.15);color:#c4b5fd;}
  .tag-gray{background:rgba(100,116,139,0.15);color:#94a3b8;}
  ol.tip{padding-left:20px;margin:0;}
  ol.tip li{color:#94a3b8;font-size:12.5px;line-height:1.9;padding:3px 0;}
  ol.tip li b{color:#e2e8f0;}
  .wm-banner{margin-top:20px;padding:14px 20px;background:linear-gradient(90deg,rgba(59,130,246,0.1),rgba(212,168,67,0.08));border:1px dashed rgba(59,130,246,0.4);border-radius:12px;font-family:ui-monospace,Consolas,monospace;font-size:12px;color:#93c5fd;word-break:break-all;}
  .tree{background:rgba(15,23,42,0.6);border-radius:12px;padding:16px 20px;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:1.8;color:#94a3b8;border:1px solid rgba(51,65,85,0.3);}
  .blocked-list{background:rgba(127,29,29,0.2);border:1px solid rgba(248,113,113,0.3);border-radius:12px;padding:14px 18px;}
  .blocked-item{font-size:12px;color:#fecaca;padding:4px 0;border-bottom:1px dashed rgba(248,113,113,0.2);}
  .blocked-item:last-child{border-bottom:0;}
  @media print{body::after{content:'${escapedWm}';position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:80px;color:rgba(148,163,184,0.08);transform:rotate(-30deg);white-space:nowrap;z-index:99999;pointer-events:none;}}
  @media(max-width:640px){.stats{grid-template-columns:repeat(3,1fr);}.row .k{width:90px;}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">📦</div>
      <h1>尽职调查归档包</h1>
      <div class="sub">${projectName} · ${new Date().toLocaleDateString("zh-CN")}${presetName ? ` · 使用预设「${presetName}」` : ""}</div>
    </div>

    <div class="stats">
      <div class="stat"><div class="stat-num">${fileCount}</div><div class="stat-label">导出文件</div></div>
      <div class="stat"><div class="stat-num">${sectionIds.length}</div><div class="stat-label">章节数</div></div>
      <div class="stat"><div class="stat-num">${sizeStr}</div><div class="stat-label">总大小</div></div>
      <div class="stat">
        <div class="stat-num" style="color:${watermarkEnabled ? '#60a5fa' : '#64748b'}">${watermarkEnabled ? '已启用' : '未启用'}</div>
        <div class="stat-label">安全水印</div>
      </div>
      <div class="stat">
        <div class="stat-num" style="color:${blockedFiles.length ? '#f87171' : '#64748b'}">${blockedFiles.length}</div>
        <div class="stat-label">被拦截</div>
      </div>
    </div>

    <div class="card">
      <h2>📋 归档信息</h2>
      <div class="row"><div class="k">项目名称</div><div class="v">${projectName}</div></div>
      ${presetName ? `<div class="row"><div class="k">导出预设</div><div class="v"><span class="tag tag-purple">${presetName}</span></div></div>` : ""}
      <div class="row"><div class="k">导出范围</div><div class="v"><span class="tag tag-gold">${scopeDesc}</span></div></div>
      <div class="row"><div class="k">导 出 人</div><div class="v">${viewer.name} &lt;${viewer.email}&gt;</div></div>
      <div class="row"><div class="k">导出时间</div><div class="v">${new Date().toLocaleString("zh-CN")}</div></div>
      <div class="row"><div class="k">水印状态</div><div class="v">${watermarkEnabled ? '<span class="tag tag-blue">💧 已启用</span>' : '<span class="tag tag-gray">⚪ 未启用</span>'}</div></div>
      <div class="row"><div class="k">未上传项</div><div class="v">${includePending ? '包含（已生成说明文件）' : '不包含'}</div></div>
    </div>

    ${blockedFiles.length > 0 ? `
    <div class="card">
      <h2>🚫 权限受限文件清单（${blockedFiles.length}）</h2>
      <div class="blocked-list">
        ${blockedFiles.map(f => `<div class="blocked-item">• [${f.sectionName}] ${f.itemName} / <b>${f.fileName}</b> — ${f.blockReason || "管理员已禁用下载"}</div>`).join("")}
      </div>
    </div>` : ""}

    <div class="card">
      <h2>📂 目录结构</h2>
      <div class="tree">
项目根/<br/>
├── 000-归档清单.txt　<span style="color:#64748b">← 完整文件清单与处理日志</span><br/>
├── 000-使用说明.html　<span style="color:#64748b">← 本文件</span><br/>
├── <b>章节名/</b>　<span style="color:#64748b">← 每个章节一个目录</span><br/>
│　　├── <b>材料名/</b>　<span style="color:#64748b">← 每个材料独立目录</span><br/>
│　　│　　├── 文件名（图片/文本：已真实叠加水印）<br/>
│　　│　　├── original-文件名（Office/PDF：原文件安全副本）<br/>
│　　│　　├── 00-安全视图-文件名.html（Office/PDF：带水印的浏览器视图）<br/>
│　　│　　├── 00-文件名-使用说明.html（使用与安全说明）<br/>
│　　│　　├── 00-文件名-安全说明.txt（文字说明）<br/>
│　　│　　├── 材料信息.txt（如未上传）<br/>
│　　│　　├── 文件名-metadata.txt（如原内容未存储）<br/>
│　　│　　└── <b>_处理记录.txt</b>　<span style="color:#64748b">← 每个材料的处理日志</span><br/>
      </div>
    </div>

    ${watermarkEnabled ? `
    <div class="card">
      <h2>💧 水印处理说明</h2>
      <ol class="tip">
        <li><b>图片类文件（PNG/JPG/GIF 等）</b>：Canvas 逐像素旋转平铺叠加水印，放大可看到半透明斜向水印文字。</li>
        <li><b>文本类文件（TXT/CSV/MD 等）</b>：文件头与文件尾均插入多行水印，便于截图/传播时识别。</li>
        <li><b>PDF / Office 文件（DOC/XLS/PPT 等）</b>：同时交付原文件安全副本 + HTML 水印视图，浏览器打开 HTML 即可全屏查看 SVG 平铺水印并带打印防泄露控制。</li>
        <li><b>每个材料独立目录</b>：包含原文件（如可）/水印视图 / 使用说明 / 处理记录，便于按材料逐一核对。</li>
      </ol>
      <div class="wm-banner">🔐 ${escapedWm}</div>
    </div>
    ` : ""}

    <div class="card">
      <h2>⚖️ 法律声明</h2>
      <ol class="tip">
        <li>本归档包所有文件均包含唯一标识信息，任何形式的泄露均可追溯到 <b>${viewer.name} (${viewer.email})</b>。</li>
        <li>文件内容受双方签署的《保密协议（NDA）》约束，不得向第三方转发、披露或用于非尽调用途。</li>
        <li>如需对外披露部分内容，请使用系统内「脱敏导出」功能或联系项目负责人审批。</li>
      </ol>
    </div>
  </div>
</body>
</html>`;
}
