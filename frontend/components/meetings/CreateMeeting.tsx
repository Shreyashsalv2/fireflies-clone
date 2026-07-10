"use client";

import { FileText, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/feedback";
import { useCreateMeeting, useUploadMeeting } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20";

const SAMPLE = `Alice [00:00]: Welcome everyone to the sprint retro. Let's start with what went well this sprint.
Bob [00:09]: The new deploy pipeline is a huge win — build times dropped from twelve minutes to five.
Carol [00:19]: Agreed. On the flip side, we had two production hotfixes that could have been caught in review.
Alice [00:31]: Good point. Let's make code review checklists mandatory going forward. Bob, can you draft one?
Bob [00:40]: Sure, I'll have a draft checklist ready by Thursday.
Carol [00:47]: I'll also set up a staging smoke test so we catch regressions before release.`;

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CreateMeetingButton({
  variant = "primary",
  size = "md",
  label = "New meeting",
}: {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Plus size={size === "sm" ? 15 : 17} />
        {label}
      </Button>
      <CreateMeetingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function CreateMeetingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const create = useCreateMeeting();
  const upload = useUploadMeeting();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [participants, setParticipants] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState("");
  const [generate, setGenerate] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const pending = create.isPending || upload.isPending;

  function reset() {
    setMode("paste");
    setTitle("");
    setTranscript("");
    setParticipants("");
    setTags("");
    setDate("");
    setGenerate(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function close() {
    reset();
    onClose();
  }

  async function submit() {
    if (!title.trim()) return toast.error("Please add a title");

    try {
      if (mode === "upload") {
        if (!file) return toast.error("Please choose a transcript file");
        const form = new FormData();
        form.append("file", file);
        form.append("title", title.trim());
        if (participants.trim()) form.append("participants", participants.trim());
        form.append("generate_summary", String(generate));
        const created = await upload.mutateAsync(form);
        close();
        router.push(`/meetings/${created.id}`);
      } else {
        if (!transcript.trim()) return toast.error("Please paste a transcript");
        const created = await create.mutateAsync({
          title: title.trim(),
          transcript_text: transcript,
          participants: parseList(participants).map((name) => ({ name })),
          tags: parseList(tags),
          meeting_date: date ? new Date(date).toISOString() : undefined,
          generate_summary: generate,
        });
        close();
        router.push(`/meetings/${created.id}`);
      }
    } catch {
      /* error toast handled in hook */
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New meeting"
      wide
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Spinner />}
            {generate ? "Create & summarize" : "Create meeting"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Mode switch */}
        <div className="inline-flex rounded-lg border border-line bg-canvas p-1">
          {(["paste", "upload"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition",
                mode === m ? "bg-brand text-brand-ink" : "text-muted hover:text-ink",
              )}
            >
              {m === "paste" ? <FileText size={15} /> : <Upload size={15} />}
              {m === "paste" ? "Paste transcript" : "Upload file"}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Title</label>
          <input
            className={inputClass}
            placeholder="e.g. Q3 Planning Sync"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {mode === "paste" ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-ink">Transcript</label>
              <button
                type="button"
                onClick={() => setTranscript(SAMPLE)}
                className="text-xs font-medium text-brand hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              className={cn(inputClass, "min-h-40 font-mono text-[13px] leading-relaxed")}
              placeholder={"Speaker [00:00]: text...\nAnother [00:12]: text..."}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Supports plain text with speaker labels, WebVTT, or JSON. Timestamps are
              optional — we synthesize them when absent.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Transcript file
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.vtt,.json"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand-soft/70"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Participants{" "}
              <span className="font-normal text-muted">(comma-separated)</span>
            </label>
            <input
              className={inputClass}
              placeholder="Alice, Bob, Carol"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </div>
          {mode === "paste" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Tags <span className="font-normal text-muted">(comma-separated)</span>
              </label>
              <input
                className={inputClass}
                placeholder="Product, Planning"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          )}
        </div>

        {mode === "paste" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Date <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={generate}
            onChange={(e) => setGenerate(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Generate AI summary, action items & topics from the transcript
        </label>
      </div>
    </Modal>
  );
}
