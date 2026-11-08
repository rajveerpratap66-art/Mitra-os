import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Tag,
  Copy,
  Check,
  Mic
} from 'lucide-react';
import { NoteItem } from '../../types/assistant';
import { sounds } from '../../utils/audio';

interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id'>) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote: (id: string, updated: Partial<NoteItem>) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('work');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const filteredNotes = notes
    .filter((n) => (selectedTag === 'all' ? true : n.tags.includes(selectedTag)))
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onAddNote({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      date: 'Just now',
      tags: tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      color: 'border-indigo-500/30 bg-indigo-950/20',
    });
    setTitle('');
    setContent('');
    setIsAddOpen(false);
    sounds.playChime();
  };

  const handleCopy = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    sounds.playMessagePop();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiFormatNote = () => {
    if (!content) return;
    const bulletized = content
      .split('\n')
      .map((line) => (line.trim().startsWith('•') ? line : `• ${line.trim()}`))
      .join('\n');
    setContent(bulletized);
    sounds.playChime();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Smart Notes Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Voice-captured ideas, summaries, and action checklists
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="bg-slate-800 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
        </div>
      </div>

      {/* Tags Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
              selectedTag === 'all'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors capitalize ${
                selectedTag === tag
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">No notes found. Say &quot;mere notes bana do&quot; to create one!</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${note.color} bg-slate-800/40`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-white tracking-tight">{note.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(note)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy content"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{note.date}</span>
                <div className="flex items-center gap-1">
                  {note.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-slate-800/80 px-1.5 py-0.2 rounded text-[10px] text-indigo-300 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Note Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Create Smart Note
              </h3>
              <button
                type="button"
                onClick={handleAiFormatNote}
                className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" /> Bulletize
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title (e.g. Maharishi Project Notes)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note or dictation..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. work, ideas, meeting"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
