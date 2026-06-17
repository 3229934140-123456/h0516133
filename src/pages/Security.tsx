import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "@/store";
import { Shield, Lock, Eye, Download, Printer, Share2, Save, Sliders } from "lucide-react";
import type { WatermarkConfig, SecurityRule } from "@/types";

export default function Security() {
  const { id } = useParams<{ id: string }>();
  const { projects, updateWatermarkConfig, updateSecurityRule } = useStore();
  const project = projects.find((p) => p.id === id);

  const [tab, setTab] = useState<"watermark" | "permissions">("watermark");
  const [config, setConfig] = useState<WatermarkConfig>(
    project?.watermarkConfig ?? { enabled: true, textTemplate: "{name} - {email} - {date}", fontSize: 14, opacity: 0.15, rotation: -30 }
  );
  const [rules, setRules] = useState<SecurityRule[]>(
    project?.securityRules ?? []
  );

  if (!project) return <div className="flex h-full items-center justify-center text-gray-400">项目不存在</div>;

  const sectionRules: SecurityRule[] = project.sections.map((s) => {
    const existing = rules.find((r) => r.targetId === s.id);
    return existing ?? { targetId: s.id, targetType: "section" as const, allowDownload: false, allowPrint: false, allowShare: false };
  });

  const handleSaveWatermark = () => {
    if (!id) return;
    updateWatermarkConfig(id, config);
  };

  const handleSaveRule = (rule: SecurityRule) => {
    if (!id) return;
    updateSecurityRule(id, rule);
    setRules((prev) => [...prev.filter((r) => r.targetId !== rule.targetId), rule]);
  };

  const previewText = config.textTemplate
    .replace("{name}", "张明远")
    .replace("{email}", "zhangmy@investcap.com")
    .replace("{date}", new Date().toLocaleDateString());

  return (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="border-b border-navy-800 px-6 py-3 flex items-center gap-4">
        <Shield className="h-5 w-5 text-gold-400" />
        <h1 className="font-display text-lg text-gold-400">安全设置</h1>
        <div className="ml-6 flex gap-1">
          <button
            onClick={() => setTab("watermark")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${tab === "watermark" ? "bg-gold-400 text-navy-950" : "text-gray-300 hover:bg-navy-800"}`}
          >
            <Sliders className="mr-1.5 inline h-3.5 w-3.5" /> 水印配置
          </button>
          <button
            onClick={() => setTab("permissions")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${tab === "permissions" ? "bg-gold-400 text-navy-950" : "text-gray-300 hover:bg-navy-800"}`}
          >
            <Lock className="mr-1.5 inline h-3.5 w-3.5" /> 权限规则
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "watermark" ? (
          <div className="flex gap-6">
            <div className="w-96 space-y-5">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="h-4 w-4 accent-gold-400"
                />
                <span className="text-sm text-gray-300">启用水印</span>
              </label>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">文本模板</label>
                <input
                  value={config.textTemplate}
                  onChange={(e) => setConfig({ ...config, textTemplate: e.target.value })}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">可用变量: {"{name}"}, {"{email}"}, {"{date}"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">字体大小: {config.fontSize}px</label>
                <input
                  type="range" min={8} max={32} value={config.fontSize}
                  onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                  className="w-full accent-gold-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">透明度: {config.opacity}</label>
                <input
                  type="range" min={0.05} max={0.5} step={0.05} value={config.opacity}
                  onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                  className="w-full accent-gold-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">旋转角度: {config.rotation}°</label>
                <input
                  type="range" min={-90} max={0} value={config.rotation}
                  onChange={(e) => setConfig({ ...config, rotation: Number(e.target.value) })}
                  className="w-full accent-gold-400"
                />
              </div>
              <button
                onClick={handleSaveWatermark}
                className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500"
              >
                <Save className="h-4 w-4" /> 保存配置
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-lg rounded-xl border border-navy-700 bg-white p-8 aspect-[3/4]">
                <div className="space-y-4 text-gray-800">
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-4/5 rounded bg-gray-100" />
                </div>
                {config.enabled && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span
                      className="whitespace-nowrap text-gray-500"
                      style={{ fontSize: config.fontSize, opacity: config.opacity, transform: `rotate(${config.rotation}deg)` }}
                    >
                      {previewText}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="h-3 w-3" /> 水印预览
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-800 text-gray-400">
                  <th className="py-3 text-left font-medium">章节</th>
                  <th className="py-3 text-center font-medium"><Download className="inline h-4 w-4" /> 下载</th>
                  <th className="py-3 text-center font-medium"><Printer className="inline h-4 w-4" /> 打印</th>
                  <th className="py-3 text-center font-medium"><Share2 className="inline h-4 w-4" /> 分享</th>
                  <th className="py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {sectionRules.map((rule) => {
                  const section = project.sections.find((s) => s.id === rule.targetId);
                  return (
                    <tr key={rule.targetId} className="border-b border-navy-800">
                      <td className="py-3 text-white">{section?.name ?? rule.targetId}</td>
                      <td className="py-3 text-center">
                        <input type="checkbox" checked={rule.allowDownload}
                          onChange={(e) => handleSaveRule({ ...rule, allowDownload: e.target.checked })}
                          className="h-4 w-4 accent-gold-400" />
                      </td>
                      <td className="py-3 text-center">
                        <input type="checkbox" checked={rule.allowPrint}
                          onChange={(e) => handleSaveRule({ ...rule, allowPrint: e.target.checked })}
                          className="h-4 w-4 accent-gold-400" />
                      </td>
                      <td className="py-3 text-center">
                        <input type="checkbox" checked={rule.allowShare}
                          onChange={(e) => handleSaveRule({ ...rule, allowShare: e.target.checked })}
                          className="h-4 w-4 accent-gold-400" />
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleSaveRule(rule)}
                          className="rounded-lg bg-gold-400 px-3 py-1 text-xs font-medium text-navy-950 hover:bg-gold-500"
                        >
                          <Save className="inline h-3 w-3 mr-1" /> 保存
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
