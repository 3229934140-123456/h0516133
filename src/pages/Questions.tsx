import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useStore, users as allUsers } from "@/store";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Send, MessageSquare, ChevronDown, Tag, Clock, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import type { Question, Reply } from "@/types";

export default function Questions() {
  const { id } = useParams<{ id: string }>();
  const { projects, questions, addQuestion, addReply, currentUserId, currentViewRole, addActivity } = useStore();
  const project = projects.find((p) => p.id === id);
  const currentUser = allUsers.find((u) => u.id === currentUserId) || allUsers[0];

  const projectQuestions = questions.filter((q) => q.projectId === id);
  const [selectedQ, setSelectedQ] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newItemId, setNewItemId] = useState("");

  const allItems = project?.sections.flatMap((s) => s.items) ?? [];

  useEffect(() => {
    if (!selectedQ) return;
    const fresh = projectQuestions.find((q) => q.id === selectedQ.id);
    if (fresh && fresh !== selectedQ) {
      setSelectedQ(fresh);
    }
  }, [projectQuestions, selectedQ]);

  const counts = useMemo(() => {
    const open = projectQuestions.filter((q) => q.status === "open").length;
    const replied = projectQuestions.filter((q) => q.status === "replied").length;
    const closed = projectQuestions.filter((q) => q.status === "closed").length;
    return { open, replied, closed };
  }, [projectQuestions]);

  const handleReply = () => {
    if (!selectedQ || !replyText.trim()) return;
    const reply: Reply = {
      id: `r-${Date.now()}`,
      content: replyText.trim(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    addReply(selectedQ.id, reply);
    addActivity({
      id: `a-${Date.now()}`,
      projectId: id!,
      projectName: project?.name ?? "",
      action: "回复问题",
      detail: `回复了「${selectedQ.title}」：${replyText.trim()}`,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
    setReplyText("");
  };

  const handleNewQuestion = () => {
    if (!id || !newTitle.trim() || !newContent.trim()) return;
    const item = allItems.find((i) => i.id === newItemId);
    const newQ: Question = {
      id: `q-${Date.now()}`,
      projectId: id,
      itemId: newItemId || "unknown",
      itemName: item?.name ?? "通用",
      title: newTitle.trim(),
      content: newContent.trim(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      status: "open",
      replies: [],
      createdAt: new Date().toISOString(),
    };
    addQuestion(newQ);
    addActivity({
      id: `a-${Date.now() + 1}`,
      projectId: id,
      projectName: project?.name ?? "",
      action: "发起提问",
      detail: `对「${newQ.itemName}」发起提问：${newQ.title}`,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
    setNewTitle("");
    setNewContent("");
    setNewItemId("");
    setShowNewForm(false);
    setSelectedQ(newQ);
  };

  return (
    <div className="flex h-full bg-navy-950 text-white">
      <div className="w-96 flex-shrink-0 border-r border-navy-800 flex flex-col">
        <div className="flex items-center justify-between border-b border-navy-800 px-4 py-3">
          <h2 className="font-display text-lg text-gold-400">问答中心</h2>
          {currentViewRole === "investor" && (
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-1 rounded-lg bg-gold-400 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-gold-500"
            >
              <Plus className="h-3.5 w-3.5" /> 新提问
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-2.5">
          <div className="flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1">
            <AlertCircle className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">待回复 {counts.open}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1">
            <MessageCircle className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">已回复 {counts.replied}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">已关闭 {counts.closed}</span>
          </div>
        </div>

        {showNewForm && (
          <div className="border-b border-navy-800 p-4 space-y-3 bg-navy-900">
            <select
              value={newItemId}
              onChange={(e) => setNewItemId(e.target.value)}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white"
            >
              <option value="">选择关联材料</option>
              {allItems.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="问题标题"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white placeholder-gray-500"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="问题描述..."
              rows={3}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white placeholder-gray-500"
            />
            <button
              onClick={handleNewQuestion}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="w-full rounded-lg bg-gold-400 py-2 text-sm font-medium text-navy-950 hover:bg-gold-500 disabled:opacity-40"
            >
              提交问题
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {projectQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQ(q)}
              className={`w-full text-left px-4 py-3 border-b border-navy-800 hover:bg-navy-900 ${selectedQ?.id === q.id ? "bg-navy-900" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-3 w-3 text-gold-400" />
                <span className="rounded bg-navy-800 px-1.5 py-0.5 text-xs text-gray-400">{q.itemName}</span>
                <StatusBadge status={q.status} />
              </div>
              <p className="text-sm font-medium text-white">{q.title}</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(q.createdAt).toLocaleDateString()}
                </div>
                {q.replies.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-navy-400">
                    <MessageSquare className="h-3 w-3" />
                    {q.replies.length} 回复
                  </div>
                )}
              </div>
            </button>
          ))}
          {projectQuestions.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">暂无问题</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedQ ? (
          <>
            <div className="border-b border-navy-800 px-6 py-3">
              <h2 className="text-lg font-medium text-white">{selectedQ.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded bg-navy-800 px-2 py-0.5 text-xs text-gray-400">{selectedQ.itemName}</span>
                <StatusBadge status={selectedQ.status} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-end">
                <div className="max-w-md rounded-xl rounded-tr-sm bg-gold-400/20 px-4 py-3">
                  <p className="text-sm text-white">{selectedQ.content}</p>
                  <p className="mt-1 text-xs text-gray-400">{selectedQ.createdByName} · {new Date(selectedQ.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedQ.replies.map((r) => {
                const isInvestor = r.createdBy === currentUser.id;
                return (
                  <div key={r.id} className={`flex ${isInvestor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md rounded-xl px-4 py-3 ${isInvestor ? "rounded-tr-sm bg-gold-400/20" : "rounded-tl-sm bg-navy-800"}`}>
                      <p className="text-sm text-white">{r.content}</p>
                      <p className="mt-1 text-xs text-gray-400">{r.createdByName} · {new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-navy-800 p-4">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="输入回复..."
                  rows={2}
                  className="flex-1 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="self-end rounded-lg bg-gold-400 p-2.5 text-navy-950 hover:bg-gold-500 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            <MessageSquare className="mr-2 h-5 w-5" /> 请选择问题查看对话
          </div>
        )}
      </div>
    </div>
  );
}
