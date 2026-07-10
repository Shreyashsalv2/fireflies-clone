"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import {
  useAddActionItem,
  useDeleteActionItem,
  useUpdateActionItem,
} from "@/lib/hooks";
import type { ActionItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ActionItems({
  meetingId,
  items,
}: {
  meetingId: number;
  items: ActionItem[];
}) {
  const add = useAddActionItem(meetingId);
  const update = useUpdateActionItem(meetingId);
  const del = useDeleteActionItem(meetingId);

  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  function toggle(item: ActionItem) {
    update.mutate({ id: item.id, body: { completed: !item.completed } });
  }

  function startEdit(item: ActionItem) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function saveEdit(id: number) {
    const text = editText.trim();
    if (text) update.mutate({ id, body: { text } });
    setEditingId(null);
  }

  function addNew() {
    const text = newText.trim();
    if (!text) return;
    add.mutate({ text });
    setNewText("");
  }

  return (
    <div className="space-y-1.5">
      {items.length === 0 && (
        <p className="px-1 py-2 text-sm text-muted">No action items yet.</p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-start gap-2.5 rounded-lg px-1.5 py-1.5 transition hover:bg-panel"
        >
          <button
            onClick={() => toggle(item)}
            aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
              item.completed
                ? "border-brand bg-brand text-brand-ink"
                : "border-line hover:border-brand",
            )}
          >
            {item.completed && <Check size={13} />}
          </button>

          {editingId === item.id ? (
            <div className="flex flex-1 items-center gap-1.5">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 rounded-md border border-line bg-canvas px-2 py-1 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                onClick={() => saveEdit(item.id)}
                className="text-brand hover:text-brand-strong"
                aria-label="Save"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-muted hover:text-ink"
                aria-label="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  item.completed ? "text-muted line-through" : "text-ink",
                )}
              >
                {item.text}
              </p>
              {item.assignee && (
                <span className="mt-0.5 inline-block rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-muted">
                  @{item.assignee}
                </span>
              )}
            </div>
          )}

          {editingId !== item.id && (
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => startEdit(item)}
                aria-label="Edit"
                className="text-muted hover:text-ink"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => del.mutate(item.id)}
                aria-label="Delete"
                className="text-muted hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="mt-2 flex items-center gap-2 border-t border-line pt-3">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNew()}
          placeholder="Add an action item…"
          className="flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          onClick={addNew}
          disabled={!newText.trim()}
          aria-label="Add action item"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-brand-ink transition hover:bg-brand-strong disabled:opacity-50"
        >
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}
