"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/feedback";
import { useUpdateMeeting } from "@/lib/hooks";
import type { MeetingDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20";

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EditMeetingModal({
  open,
  onClose,
  meeting,
}: {
  open: boolean;
  onClose: () => void;
  meeting: MeetingDetail;
}) {
  const update = useUpdateMeeting(meeting.id);
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description ?? "");
  const [participants, setParticipants] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setDescription(meeting.description ?? "");
      setParticipants(meeting.participants.map((p) => p.name).join(", "));
      setTags(meeting.tags.map((t) => t.name).join(", "));
    }
  }, [open, meeting]);

  async function submit() {
    if (!title.trim()) return toast.error("Title can't be empty");
    try {
      await update.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        participants: parseList(participants).map((name) => ({ name })),
        tags: parseList(tags),
      });
      onClose();
    } catch {
      /* handled in hook */
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit meeting"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending && <Spinner />}
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Description</label>
          <textarea
            className={cn(inputClass, "min-h-20")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Participants <span className="font-normal text-muted">(comma-separated)</span>
          </label>
          <input
            className={inputClass}
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Tags <span className="font-normal text-muted">(comma-separated)</span>
          </label>
          <input
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
