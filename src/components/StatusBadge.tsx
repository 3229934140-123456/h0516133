import type { ItemStatus, QuestionStatus } from "@/types";

type BadgeStatus = ItemStatus | QuestionStatus;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<BadgeStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "待提交", bg: "bg-navy-700/50", text: "text-navy-300", dot: "bg-navy-400" },
  uploaded: { label: "已上传", bg: "bg-blue-900/40", text: "text-blue-300", dot: "bg-blue-400" },
  in_review: { label: "审核中", bg: "bg-yellow-900/40", text: "text-yellow-300", dot: "bg-yellow-400" },
  approved: { label: "已通过", bg: "bg-emerald-900/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  questioned: { label: "有疑问", bg: "bg-amber-900/40", text: "text-amber-300", dot: "bg-amber-400" },
  supplement_needed: { label: "需补充", bg: "bg-orange-900/40", text: "text-orange-300", dot: "bg-orange-400" },
  open: { label: "待回复", bg: "bg-amber-900/40", text: "text-amber-300", dot: "bg-amber-400" },
  replied: { label: "已回复", bg: "bg-blue-900/40", text: "text-blue-300", dot: "bg-blue-400" },
  closed: { label: "已关闭", bg: "bg-navy-700/50", text: "text-navy-300", dot: "bg-navy-400" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
