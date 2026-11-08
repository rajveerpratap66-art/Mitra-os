import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReminderItem } from '../../types/assistant';
import { sounds } from '../../utils/audio';

interface RemindersViewProps {
  reminders: ReminderItem[];
  onToggleComplete: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onToggleComplete,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('Today 06:00 PM');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [category, setCategory] = useState<'personal' | 'work' | 'health' | 'urgent'>('work');

  const filtered = reminders.filter((r) => {
    if (filter === 'pending') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReminder({
      title: title.trim(),
      time,
      priority,
      category,
      isCompleted: false,
    });
    setTitle('');
    setIsAddModalOpen(false);
    sounds.playChime();
  };

  const handleCheck = (id: string, wasCompleted: boolean) => {
    onToggleComplete(id);
    if (!wasCompleted) {
      sounds.playChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Reminders &amp; High-Priority Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Timed chimes and proactive notifications managed by Mitra AI
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Set Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">No reminders in this view.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const priorityBadge =
              r.priority === 'high'
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : r.priority === 'medium'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-slate-400 bg-slate-800 border-slate-700';

            return (
              <div
                key={r.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  r.isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                    : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCheck(r.id, r.isCompleted)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      r.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-600 hover:border-indigo-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        r.isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {r.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {r.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[10px] uppercase">{r.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${priorityBadge}`}
                  >
                    {r.priority}
                  </span>
                  <button
                    onClick={() => onDeleteReminder(r.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Set New Reminder
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">What should I remind you about?</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maharishi ko WhatsApp updates send karna hai"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Time / Date</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Today 05:00 PM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
