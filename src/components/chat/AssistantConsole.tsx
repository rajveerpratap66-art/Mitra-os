import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Film,
  FileText,
  Download,
  Calendar,
  Bell,
  Mail,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  PhoneCall
} from 'lucide-react';
import { Message, AssistantAction } from '../../types/assistant';
import { sounds, voiceEngine, VoicePersona } from '../../utils/audio';

interface AssistantConsoleProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  onNavigateTab: (tab: 'device' | 'schedule' | 'email' | 'reminders' | 'notes') => void;
  onActionClick: (action: AssistantAction) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onTriggerIncomingCall: () => void;
  isWaitingForOtp?: boolean;
  phonepeOtp?: string;
  setPhonepeOtp?: (otp: string) => void;
}

export const AssistantConsole: React.FC<AssistantConsoleProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  onNavigateTab,
  onActionClick,
  voiceEnabled,
  setVoiceEnabled,
  onTriggerIncomingCall,
  isWaitingForOtp = false,
  phonepeOtp = '',
  setPhonepeOtp,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Voice Persona settings
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>('aura_female');
  const [speechSpeed, setSpeechSpeed] = useState(0.96);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Subscribe to voice speaking state for audio visualization
  useEffect(() => {
    const unsubscribe = voiceEngine.subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Web Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // defaults to Hindi / Hinglish

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            onSendMessage(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onSendMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use text input.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        sounds.playMessagePop();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handlePersonaChange = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    voiceEngine.setPersona(persona);
    sounds.playMessagePop();
    const sample =
      persona === 'aura_female'
        ? 'Namaste Tej Pratap! Main Aura hoon, aapki personal voice assistant.'
        : persona === 'kabir_male'
        ? 'Namaste Tej. Main Kabir hoon, aapka executive AI companion.'
        : 'Hello Tej! Mitra Assistant online and ready.';
    voiceEngine.speak(sample, true);
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechSpeed(speed);
    voiceEngine.setSpeed(speed);
  };

  const quickPrompts = [
    { label: '🟣 PhonePe Login (Ask OTP)', text: 'PhonePe par login kar lo lekin OTP mujhse puchh kar daalo' },
    { label: '🔑 Submit OTP: 482910', text: 'OTP hai 482910' },
    { label: '📞 Call Maharishi', text: 'Maharishi ko call laga do' },
    { label: '📞 Call Priya Sharma', text: 'Priya Sharma ko phone lagao' },
    { label: '🔢 Call 9876543210', text: '9876543210 par call laga do' },
    { label: '💬 WhatsApp Maharishi: Hello', text: 'WhatsApp khol kar maharishi ko message kar do hello' },
    { label: '🎬 Reel scroll kardo', text: 'reel scroll kardo' },
    { label: '📝 Mere notes bana do', text: 'mere notes bana do: Meeting agenda with Maharishi' },
    { label: '📲 Spotify download & login', text: 'Spotify app download karke login kardo' },
    { label: '📅 Aaj ka schedule', text: 'aaj ka mera kya schedule hai dikhao' },
    { label: '⏰ 5 baje reminder lagao', text: 'shaam ko 5 baje client review call ka reminder laga do' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 text-slate-100 backdrop-blur-md">
      {/* Console Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/avatar_assistant_mitra_1794118474568.jpg"
              alt="Mitra AI"
              referrerPolicy="no-referrer"
              className={`w-11 h-11 rounded-full object-cover transition-all ${
                isSpeaking
                  ? 'ring-4 ring-indigo-400 shadow-xl shadow-indigo-500/50 scale-105 animate-pulse'
                  : 'ring-2 ring-indigo-500/40 shadow-lg'
              }`}
            />
            {isSpeaking ? (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-400 rounded-full ring-2 ring-slate-900 animate-ping" />
            ) : (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                Mitra AI <span className="text-xs text-indigo-400 font-normal">मित्र</span>
              </h2>
              {isSpeaking && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono animate-pulse">
                  Speaking...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Autonomous Assistant · Voice Tuned</p>
          </div>
        </div>

        {/* Audio Speech Controls & Persona Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 ${
              showVoiceSettings
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Voice Persona & Speech Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline capitalize">
              {selectedPersona.split('_')[0]}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (next) voiceEngine.speak('Mitra voice enabled', true);
            }}
            title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
            className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1.5 ${
              voiceEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Voice Persona Tuning Drawer */}
      {showVoiceSettings && (
        <div className="p-3 bg-slate-950/95 border-b border-indigo-500/30 text-xs text-slate-200 space-y-2.5 animate-fade-in shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Choose Voice Persona
            </span>
            <button
              onClick={() => {
                const sample = 'Aapka AI Assistant Mitra taiyyar hai!';
                voiceEngine.speak(sample, true);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
            >
              <Play className="w-3 h-3" /> Test Voice
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handlePersonaChange('aura_female')}
              className={`p-2 rounded-lg border text-left transition-all ${
                selectedPersona === 'aura_female'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Aura 👩</div>
              <div className="text-[10px] text-slate-400">Warm &amp; Natural</div>
            </button>

            <button
              onClick={() => handlePersonaChange('kabir_male')}
              className={`p-2 rounded-lg border text-left transition-all ${
                selectedPersona === 'kabir_male'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Kabir 👨</div>
              <div className="text-[10px] text-slate-400">Deep Executive</div>
            </button>

            <button
              onClick={() => handlePersonaChange('natural_modern')}
              className={`p-2 rounded-lg border text-left transition-all ${
                selectedPersona === 'natural_modern'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Mitra ⚡</div>
              <div className="text-[10px] text-slate-400">Clear &amp; Modern</div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>Speech Rate: {speechSpeed}x</span>
            <div className="flex gap-1.5">
              {[0.85, 0.96, 1.1].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded border ${
                    speechSpeed === s
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Quick Actions Toolbar */}
      <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
        <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
          <Zap className="w-3 h-3 text-amber-400" /> Super Action:
        </span>
        <button
          onClick={() => {
            onSendMessage('subah ka autonomous morning routine start karo');
          }}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          🌅 Morning Routine
        </button>
        <button
          onClick={onTriggerIncomingCall}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <PhoneCall className="w-3 h-3" /> Call from Maharishi
        </button>
        <button
          onClick={() => {
            onSendMessage('Spotify app download karke login kardo aur gaana chalao');
          }}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0"
        >
          🎵 Auto Play Spotify
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/10'
                  : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

              {/* Step-by-Step Autonomous Execution Log */}
              {msg.steps && msg.steps.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/40 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Autonomous Execution Pipeline
                  </div>
                  {msg.steps.map((st) => (
                    <div key={st.id} className="text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{st.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Execution Action Card */}
              {msg.action && msg.action.type !== 'none' && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/50">
                  {msg.action.type === 'send_whatsapp' && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                            WhatsApp Sent
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </div>
                          <div className="text-[11px] text-slate-300">
                            To <span className="font-medium text-white">{msg.action.contact}</span>: &quot;{msg.action.message}&quot;
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-md border border-emerald-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        View Chat <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'scroll_reels' && (
                    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-rose-300">Reels Auto-Scroll Active</div>
                          <div className="text-[11px] text-slate-300">Scrolling on Virtual Phone</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-md border border-rose-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        Watch Reels <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'create_note' && (
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-amber-300">Note Created</div>
                          <div className="text-[11px] text-slate-300">{msg.action.title || 'New Note'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md border border-amber-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        Open Notes <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'install_app' && (
                    <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-cyan-300">
                            {msg.action.appName} Installed &amp; Logged In
                          </div>
                          <div className="text-[11px] text-slate-300">Automated sign-in verified</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-md border border-cyan-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        Launch App <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'schedule_event' && (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-indigo-300">Calendar Event Added</div>
                          <div className="text-[11px] text-slate-300">
                            {msg.action.title} ({msg.action.time || 'Today'})
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateTab('schedule')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-md border border-indigo-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        Calendar <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'create_reminder' && (
                    <div className="bg-violet-950/40 border border-violet-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-violet-300">Reminder Set</div>
                          <div className="text-[11px] text-slate-300">{msg.action.title}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateTab('reminders')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-md border border-violet-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'send_email' && (
                    <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-sky-300">Email Drafted &amp; Queued</div>
                          <div className="text-[11px] text-slate-300">{msg.action.subject}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateTab('email')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-md border border-sky-500/30 transition-colors shrink-0 flex items-center gap-1"
                      >
                        Email Hub <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'login_phonepe' && (
                    <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                          पे
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-purple-200">PhonePe Login Flow</div>
                          <div className="text-[11px] text-slate-300">Awaiting your 6-digit OTP verification</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        Enter OTP <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'submit_otp' && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-300">OTP Verified ({msg.action.otp || '482910'})</div>
                          <div className="text-[11px] text-slate-300">PhonePe UPI Dashboard Authenticated</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        Open PhonePe <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {msg.action.type === 'make_call' && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-300">Outgoing Call Connected</div>
                          <div className="text-[11px] text-slate-300">{msg.action.contact} · {msg.action.phoneNumber}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick(msg.action!)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        In-Call <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Mitra is executing your autonomous command...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Commands */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Quick Voice / Command Prompts
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(item.text);
                onSendMessage(item.text);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box & Voice Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        {isListening && (
          <div className="mb-2 py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening in Hindi / Hinglish... (Aap bol sakte hain)</span>
            </div>
            <button onClick={toggleListening} className="text-[10px] underline hover:text-white">
              Stop
            </button>
          </div>
        )}

        {/* Dynamic OTP Request Banner when PhonePe login is active */}
        {isWaitingForOtp && (
          <div className="mb-3 p-3 rounded-xl bg-purple-950/90 border border-purple-500/60 text-white shadow-xl animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-purple-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                PhonePe OTP Confirmation Required
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/40">
                User Approval Gate
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2">
              Mitra PhonePe me OTP tabhi submit karega jab aap bataenge. Kripya 6-digit OTP daalein:
            </p>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                maxLength={6}
                value={phonepeOtp || ''}
                onChange={(e) => setPhonepeOtp?.(e.target.value)}
                placeholder="482910"
                className="w-24 bg-[#1c0f2e] border border-purple-500/60 rounded-lg px-2 py-1 text-sm font-mono text-center tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => {
                  const otpToSubmit = phonepeOtp?.length === 6 ? phonepeOtp : '482910';
                  onSendMessage(`OTP hai ${otpToSubmit}`);
                }}
                className="px-3 py-1 rounded-lg bg-[#5f259f] hover:bg-[#6f2dbb] text-white text-xs font-semibold transition-colors shadow-md"
              >
                Submit OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhonepeOtp?.('482910');
                  onSendMessage('OTP hai 482910');
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-[10px] text-purple-200 border border-purple-500/40 transition-colors whitespace-nowrap"
              >
                Auto-fill 482910
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Start voice command in Hindi/Hinglish'}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak in Hindi/Hinglish..."
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
