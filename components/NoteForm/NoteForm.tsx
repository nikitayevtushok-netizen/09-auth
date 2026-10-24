"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/clientApi";
import type { CreateNotePayload } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";
import { NOTE_TAGS } from "@/lib/noteTags";
import { useNoteDraftStore } from "@/lib/store/noteStore";
import css from "./NoteForm.module.css";

const isNoteTag = (value: string): value is NoteTag =>
  NOTE_TAGS.includes(value as NoteTag);

const parseCreateNotePayload = (formData: FormData): CreateNotePayload => {
  const title = formData.get("title");
  const content = formData.get("content");
  const tag = formData.get("tag");

  if (typeof title !== "string" || typeof content !== "string" || typeof tag !== "string") {
    throw new Error("Invalid form data");
  }

  if (!isNoteTag(tag)) {
    throw new Error("Invalid tag");
  }

  return { title, content, tag };
};

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteDraftStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useNoteDraftStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    const unsubscribe = useNoteDraftStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();
      router.push("/notes/filter/all");
    },
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setDraft({
      ...draft,
      [name]: value,
    });
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <form
      className={css.form}
      action={(formData) => {
        const values = parseCreateNotePayload(formData);
        createNoteMutation.mutate(values);
      }}
    >
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          value={draft.title}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag}
          onChange={handleChange}
        >
          {NOTE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={createNoteMutation.isPending}
        >
          Create note
        </button>
      </div>
    </form>
  );
}
