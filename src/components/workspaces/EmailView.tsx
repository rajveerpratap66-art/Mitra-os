import React, { useState } from 'react';
import {
  Mail,
  Send,
  Star,
  Trash2,
  Sparkles,
  Search,
  Check,
  CornerDownLeft,
  Paperclip
} from 'lucide-react';
import { EmailItem } from '../../types/assistant';
import { sounds } from '../../utils/audio';

interface EmailViewProps {
  emails: EmailItem[];
  onSendEmail: (to: string, subject: string, body: string) => void;
  onDeleteEmail: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export const EmailView: React.FC<EmailViewProps> = ({
  emails,
  onSendEmail,
  onDeleteEmail,
  onToggleStar,
}) => {
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [isAiPolishing, setIsAiPolishing] = useState(false);

  const filteredEmails = emails
    .filter((e) => e.folder === folder)
    .filter(
      (e) =>
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || filteredEmails[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toInput || !subjectInput) return;
    onSendEmail(toInput, subjectInput, bodyInput);
    setToInput('');
    setSubjectInput('');
    setBodyInput('');
    setIsComposeOpen(false);
    sounds.playMessagePop();
  };

  const handleAiPolish = () => {
    setIsAiPolishing(true);
    setTimeout(() => {
      setIsAiPolishing(false);
      setSubjectInput(subjectInput || 'Project Milestone & Collaboration Update');
      setBodyInput(
        `Dear Team,\n\nI hope this email finds you well. I am writing to provide a structured update regarding our recent sprints, deliverables, and upcoming roadmap milestones.\n\nPlease review the attached items and let me know your availability for a brief sync.\n\nBest regards,\nTej Pratap`
      );
      sounds.playChime();
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 overflow-hidden">
      {/* Email Top Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Email Hub</h2>
          </div>
          {/* Folder tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            {(['inbox', 'sent', 'drafts'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  folder === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" /> Compose Email
        </button>
      </div>

      {/* Two Column Split: Email List & Email Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Email List */}
        <div className="w-full md:w-80 border-r border-slate-800 flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail..."
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredEmails.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No emails found.</div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`p-3 cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold truncate ${email.unread ? 'text-white' : 'text-slate-300'}`}>
                        {email.from.split('<')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {email.date}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 truncate font-medium">{email.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{email.snippet}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Body Reader */}
        <div className="hidden md:flex flex-1 flex-col overflow-y-auto p-6 bg-slate-900/30">
          {selectedEmail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedEmail.subject}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    From: <span className="text-slate-200 font-medium">{selectedEmail.from}</span> · To:{' '}
                    <span className="text-slate-200">{selectedEmail.to}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStar(selectedEmail.id)}
                    className={`p-1.5 rounded-lg border border-slate-800 transition-colors ${
                      selectedEmail.starred ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onDeleteEmail(selectedEmail.id)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed py-2">
                {selectedEmail.body}
              </div>

              {/* Quick Reply Box */}
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => {
                    setToInput(selectedEmail.from);
                    setSubjectInput(`Re: ${selectedEmail.subject}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" /> Reply to this email
                </button>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center text-slate-500 text-sm">Select an email to view details</div>
          )}
        </div>
      </div>

      {/* Compose Email Modal with AI Assistant Polish */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Compose Email
              </h3>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isAiPolishing}
                className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
                {isAiPolishing ? 'Drafting with Gemini...' : 'AI Smart Polish'}
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="Recipient (e.g., client@example.com, maharishi@gmail.com)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="Subject"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <textarea
                  rows={6}
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  placeholder="Write your email or rough notes, then click 'AI Smart Polish'..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Discard
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
