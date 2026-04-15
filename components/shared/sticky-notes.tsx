"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type StickyNote = {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  roleScope: string;
};

const COLORS = ["bg-amber-50", "bg-blue-50", "bg-emerald-50", "bg-rose-50"];

interface StickyNotesProps {
  roleSlug: string;
  showAll?: boolean;
}

function parseNotes(raw: string | null): StickyNote[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StickyNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StickyNotes({ roleSlug, showAll = false }: StickyNotesProps) {
  const [notes, setNotes] = useState<StickyNote[]>(() =>
    typeof window === "undefined" ? [] : parseNotes(localStorage.getItem(`sticky_notes_${roleSlug}`)),
  );
  const [newNote, setNewNote] = useState("");
  const [showAllRoles, setShowAllRoles] = useState(false);

  const visibleNotes = useMemo(() => {
    if (showAll && showAllRoles) {
      if (typeof window === "undefined") return [];
      const all = Object.keys(localStorage)
        .filter((k) => k.startsWith("sticky_notes_"))
        .flatMap((k) => parseNotes(localStorage.getItem(k)));
      return all.slice(0, 8);
    }
    return notes.filter((n) => n.roleScope === roleSlug).slice(0, 8);
  }, [notes, roleSlug, showAll, showAllRoles]);

  const persist = (next: StickyNote[]) => {
    localStorage.setItem(`sticky_notes_${roleSlug}`, JSON.stringify(next));
    setNotes(next);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const now = new Date().toISOString();
    const next: StickyNote[] = [
      {
        id: `${Date.now()}`,
        content: newNote.trim(),
        color: COLORS[notes.length % COLORS.length],
        createdAt: now,
        updatedAt: now,
        roleScope: roleSlug,
      },
      ...notes,
    ];
    persist(next);
    setNewNote("");
  };

  const updateNote = (id: string, content: string) => {
    persist(notes.map((n) => (n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n)));
  };

  const deleteNote = (id: string) => {
    persist(notes.filter((n) => n.id !== id));
  };

  const setColor = (id: string, color: string) => {
    persist(notes.map((n) => (n.id === id ? { ...n, color, updatedAt: new Date().toISOString() } : n)));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sticky Notes</CardTitle>
          {showAll ? (
            <Button size="sm" variant="outline" onClick={() => setShowAllRoles((s) => !s)}>
              {showAllRoles ? "My role" : "All roles"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} placeholder="Add a note..." />
          <Button onClick={addNote}>+</Button>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {visibleNotes.map((note) => (
            <div key={note.id} className={`rounded-md border p-3 ${note.color}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="outline">{note.roleScope}</Badge>
                <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>x</Button>
              </div>
              <Textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, e.target.value)}
                rows={2}
                readOnly={showAll && showAllRoles && note.roleScope !== roleSlug}
              />
              <div className="mt-2 flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={`${note.id}-${color}`}
                    type="button"
                    className={`h-5 w-5 rounded border ${color}`}
                    onClick={() => setColor(note.id, color)}
                    aria-label={`Set ${color}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
