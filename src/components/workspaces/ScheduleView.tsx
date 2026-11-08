import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { ScheduleEvent } from '../../types/assistant';
import { sounds } from '../../utils/audio';

interface ScheduleViewProps {
  events: ScheduleEvent[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}) => {
  const [filter, setFilter] = useState<'all' | 'work' | 'meeting' | 'health'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('03:00 PM - 03:45 PM');
  const [newCategory, setNewCategory] = useState<'work' | 'meeting' | 'health' | 'personal'>('work');
  const [newLocation, setNewLocation] = useState('Google Meet');

  const filteredEvents = events.filter((e) => (filter === 'all' ? true : e.category === filter));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddEvent({
      title: newTitle.trim(),
      time: newTime,
      date: 'Today',
      duration: '45m',
      category: newCategory,
      location: newLocation,
      isCompleted: false,
    });
    setNewTitle('');
    setIsAddModalOpen(false);
    sounds.playChime();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 p-4 sm:p-6 overflow-y-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              Schedule &amp; Calendar Management
            </h2>
            <span className="text-xs text-indigo-300 font-mono">Today, 2026</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized with your daily agenda and meetings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700/60">
            {(['all', 'work', 'meeting', 'health'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="mt-6 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">No scheduled events in this filter.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                event.isCompleted
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => {
                    onToggleComplete(event.id);
                    sounds.playChime();
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    event.isCompleted
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-600 hover:border-indigo-400 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div>
                  <h4
                    className={`text-sm font-semibold text-white ${
                      event.isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {event.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {event.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {event.location}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] text-indigo-300">
                      {event.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {event.location.includes('Meet') && (
                  <a
                    href="https://meet.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Video className="w-3 h-3" /> Join Meet
                  </a>
                )}
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Schedule New Task / Meeting
            </h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Title / Agenda</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Maharishi Project Review"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Time Slot</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="work">Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="health">Health / Gym</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
