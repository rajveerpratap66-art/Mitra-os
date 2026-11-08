import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Film,
  Download,
  Wifi,
  Battery,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Check,
  CheckCheck,
  Phone,
  PhoneCall,
  PhoneOff,
  Video,
  ExternalLink,
  Sparkles,
  Music,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  SkipForward,
  SkipBack,
  Volume2,
  ListTodo,
  ShoppingBag,
  Bell,
  Clock,
  Mic,
  Users,
  Radio,
  CreditCard,
  QrCode,
  Building2,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Lock,
  Copy,
  RotateCcw,
  Smartphone as SmartphoneIcon
} from 'lucide-react';
import { Contact, WhatsAppMessage, ReelItem, AppItem } from '../../types/assistant';
import { sounds, speakText } from '../../utils/audio';

interface DeviceSimulatorProps {
  deviceScreen: 'home' | 'whatsapp' | 'reels' | 'appstore' | 'running_app' | 'incoming_call' | 'active_call';
  setDeviceScreen: (screen: 'home' | 'whatsapp' | 'reels' | 'appstore' | 'running_app' | 'incoming_call' | 'active_call') => void;
  selectedApp: AppItem | null;
  setSelectedApp: (app: AppItem | null) => void;
  contacts: Contact[];
  whatsappMessages: Record<string, WhatsAppMessage[]>;
  onSendWhatsApp: (contactId: string, text: string) => void;
  reels: ReelItem[];
  isReelsAutoScrolling: boolean;
  setIsReelsAutoScrolling: (active: boolean) => void;
  reelsSpeed: 'normal' | 'slow' | 'fast';
  setReelsSpeed: (speed: 'normal' | 'slow' | 'fast') => void;
  apps: AppItem[];
  onInstallAndLoginApp: (appId: string) => void;
  activeAppIdForInstall?: string;
  installProgress?: number;
  installStepText?: string;
  notificationBanner?: { app: string; title: string; message: string } | null;
  triggerIncomingCall?: () => void;
  phonepeStage: 'login' | 'otp' | 'dashboard';
  setPhonepeStage: (stage: 'login' | 'otp' | 'dashboard') => void;
  phonepeOtp: string;
  setPhonepeOtp: (otp: string) => void;
  onPhonePeOtpSubmit: (otp: string) => void;
  isWaitingForOtp: boolean;
  callTarget: { name: string; phone: string; isOutgoing?: boolean; avatar?: string };
  onEndCall: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  deviceScreen,
  setDeviceScreen,
  selectedApp,
  setSelectedApp,
  contacts,
  whatsappMessages,
  onSendWhatsApp,
  reels,
  isReelsAutoScrolling,
  setIsReelsAutoScrolling,
  reelsSpeed,
  setReelsSpeed,
  apps,
  onInstallAndLoginApp,
  activeAppIdForInstall,
  installProgress = 0,
  installStepText = '',
  notificationBanner,
  phonepeStage,
  setPhonepeStage,
  phonepeOtp,
  setPhonepeOtp,
  onPhonePeOtpSubmit,
  isWaitingForOtp,
  callTarget,
  onEndCall,
}) => {
  // WhatsApp state
  const [activeContactId, setActiveContactId] = useState('maharishi');
  const [chatInput, setChatInput] = useState('');
  const [isMaharishiTyping, setIsMaharishiTyping] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Call duration state
  const [callDuration, setCallDuration] = useState(0);

  // Reels state
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reelLikes, setReelLikes] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [reelProgress, setReelProgress] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);

  // Spotify Player mock state
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(true);
  const [spotifyTrackTime, setSpotifyTrackTime] = useState(74);

  // Notion tasks mock state
  const [notionTasks, setNotionTasks] = useState([
    { id: '1', text: 'Review AI Assistant Architecture', done: true },
    { id: '2', text: 'Send WhatsApp sync to Maharishi', done: true },
    { id: '3', text: 'Reel Auto-Scroller verification', done: true },
    { id: '4', text: 'Prepare Product Demo for Team', done: false },
  ]);

  // PhonePe In-App state
  const [showPhonePeBalance, setShowPhonePeBalance] = useState(true);
  const [phonepeBalance, setPhonepeBalance] = useState(24850);
  const [phonepePaymentAlert, setPhonepePaymentAlert] = useState<string | null>(null);
  const [phonepeTransactions, setPhonepeTransactions] = useState([
    { id: 'tx-1', name: 'Maharishi', note: 'Paid via UPI', amount: 500, type: 'debit', time: 'Today, 10:40 AM' },
    { id: 'tx-2', name: 'Swiggy Food', note: 'Online Order', amount: 480, type: 'debit', time: 'Yesterday, 8:15 PM' },
    { id: 'tx-3', name: 'Bengaluru Metro', note: 'Card Recharge', amount: 200, type: 'debit', time: '06 Nov, 9:20 AM' },
    { id: 'tx-4', name: 'Priya Sharma', note: 'Received to HDFC Bank', amount: 1200, type: 'credit', time: '05 Nov, 4:10 PM' },
  ]);

  const handlePayMaharishi = () => {
    sounds.playMessagePop();
    const newTx = {
      id: `tx-${Date.now()}`,
      name: 'Maharishi',
      note: 'UPI Payment · Instant',
      amount: 500,
      type: 'debit' as const,
      time: 'Just now',
    };
    setPhonepeBalance((b) => Math.max(0, b - 500));
    setPhonepeTransactions((prev) => [newTx, ...prev]);
    sounds.playChime();
    setPhonepePaymentAlert('₹500 successfully paid to Maharishi! UPI Ref: 412093849102');
    speakText('PhonePe se Maharishi ko ₹500 safalta-purvak bhej diye gaye hain!');
    setTimeout(() => {
      setPhonepePaymentAlert(null);
    }, 4000);
  };

  // Status bar time
  const [currentTime, setCurrentTime] = useState('10:42');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // WhatsApp auto scroll
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [whatsappMessages, activeContactId, isMaharishiTyping, deviceScreen]);

  // Reels auto-scroll timer
  useEffect(() => {
    if (deviceScreen !== 'reels' || !isReelsAutoScrolling) {
      setReelProgress(0);
      return;
    }

    const durationSeconds = reelsSpeed === 'fast' ? 3.5 : reelsSpeed === 'slow' ? 8 : 5.5;
    const intervalMs = 100;
    const step = 100 / ((durationSeconds * 1000) / intervalMs);

    const timer = setInterval(() => {
      setReelProgress((prev) => {
        if (prev >= 100) {
          setCurrentReelIndex((curr) => (curr + 1) % reels.length);
          sounds.playSwipeSound();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [deviceScreen, isReelsAutoScrolling, reelsSpeed, reels.length]);

  // Active call duration counter
  useEffect(() => {
    if (deviceScreen === 'active_call') {
      const interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [deviceScreen]);

  // Spotify timer simulation
  useEffect(() => {
    if (deviceScreen === 'running_app' && selectedApp?.id === 'spotify' && isSpotifyPlaying) {
      const interval = setInterval(() => {
        setSpotifyTrackTime((t) => (t >= 210 ? 0 : t + 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deviceScreen, selectedApp, isSpotifyPlaying]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const messagesList = whatsappMessages[activeContactId] || [];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    onSendWhatsApp(activeContactId, text);

    // Auto reply simulation
    if (activeContactId === 'maharishi') {
      setIsMaharishiTyping(true);
      setTimeout(() => {
        setIsMaharishiTyping(false);
        const autoReplies = [
          'Arey hello Tej bhai! Kaisa chal raha hai? Assistant ekdum smooth perform kar raha hai!',
          'Bhai bilkul! 4 baje milte hain cafe pe, updates discuss kar lenge.',
          'Super! Notes aur calendar schedule check kar liya maine, all clear!',
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        onSendWhatsApp(activeContactId, `__REPLY__:${randomReply}`);
      }, 1800);
    }
  };

  const handleLikeReel = (reelId: string) => {
    const isCurrentlyLiked = likedMap[reelId];
    setLikedMap((prev) => ({ ...prev, [reelId]: !isCurrentlyLiked }));
    setReelLikes((prev) => ({
      ...prev,
      [reelId]: (prev[reelId] || reels[currentReelIndex].likes) + (isCurrentlyLiked ? -1 : 1),
    }));
    setFloatingHearts((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.slice(1));
    }, 1200);
    sounds.playMessagePop();
  };

  const currentReel = reels[currentReelIndex] || reels[0];

  return (
    <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4">
      {/* Device Outer Frame */}
      <div className="relative w-full max-w-[380px] h-[680px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-3 h-6 w-32 bg-black rounded-full ring-1 ring-slate-800/80 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-mono tracking-wider">MITRA OS</span>
          </div>
        </div>

        {/* Realistic Dropdown Push Notification Banner */}
        {notificationBanner && (
          <div className="absolute top-12 left-5 right-5 z-40 bg-slate-900/95 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-3 shadow-2xl text-white animate-bounce">
            <div className="flex items-center justify-between text-[10px] text-indigo-300 font-medium mb-0.5">
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-indigo-400" />
                {notificationBanner.app}
              </span>
              <span className="text-slate-400 font-mono">Just now</span>
            </div>
            <div className="text-xs font-semibold text-white truncate">{notificationBanner.title}</div>
            <div className="text-[11px] text-slate-300 truncate">{notificationBanner.message}</div>
          </div>
        )}

        {/* Screen Bezel Content */}
        <div className="relative flex-1 bg-slate-900 rounded-[38px] overflow-hidden flex flex-col text-white">
          {/* Top Status Bar */}
          <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-medium text-slate-300 z-30 shrink-0">
            <span className="font-mono tabular-nums">{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] font-mono">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Screen Content Views */}
          <div className="flex-1 overflow-hidden relative">
            {/* 0. INCOMING PHONE CALL SCREEN */}
            {deviceScreen === 'incoming_call' && (
              <div className="flex flex-col h-full justify-between items-center p-8 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white select-none animate-fade-in">
                <div className="text-center pt-8">
                  <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest">
                    Incoming Call...
                  </span>
                  <div className="relative my-4 inline-block">
                    {callTarget.avatar ? (
                      <img
                        src={callTarget.avatar}
                        alt={callTarget.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/50 shadow-2xl mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-3xl font-bold ring-4 ring-emerald-500/50 shadow-2xl mx-auto">
                        {callTarget.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute inset-0 rounded-full ring-4 ring-emerald-400 animate-ping opacity-40 pointer-events-none" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{callTarget.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{callTarget.phone}</p>
                </div>

                {/* Call Action Buttons */}
                <div className="w-full pb-8 flex items-center justify-around">
                  {/* Decline */}
                  <button
                    onClick={() => {
                      onEndCall();
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 group-hover:scale-105 transition-transform">
                      <PhoneOff className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-rose-300">Decline</span>
                  </button>

                  {/* Accept */}
                  <button
                    onClick={() => {
                      setDeviceScreen('active_call');
                      sounds.playUnlockSound();
                      speakText(`Arey Tej bhai! Kaisa hai? Call connect ho gaya hai!`);
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 group-hover:scale-105 transition-transform animate-bounce">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-emerald-300">Accept</span>
                  </button>
                </div>
              </div>
            )}

            {/* 0.1 ACTIVE / OUTGOING CALL SCREEN */}
            {deviceScreen === 'active_call' && (
              <div className="flex flex-col h-full justify-between items-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white select-none">
                <div className="text-center pt-6 w-full">
                  <div className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase mb-2">
                    {callTarget.isOutgoing ? (callDuration < 2 ? 'Calling...' : 'Call Connected (HD)') : 'In Call · Encrypted'}
                  </div>
                  <div className="relative inline-block my-2">
                    {callTarget.avatar ? (
                      <img
                        src={callTarget.avatar}
                        alt={callTarget.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-400 shadow-xl mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-2xl font-bold shadow-xl mx-auto">
                        {callTarget.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {callDuration >= 2 && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{callTarget.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{callTarget.phone}</p>
                  <div className="text-xs font-mono text-emerald-400 mt-2 font-medium">
                    {Math.floor(callDuration / 60)}:
                    {(callDuration % 60).toString().padStart(2, '0')}
                  </div>

                  {/* Audio Wave Visualizer */}
                  <div className="flex items-center justify-center gap-1.5 mt-4 h-8">
                    <span className="w-1 bg-emerald-400 h-3 rounded-full animate-bounce" />
                    <span className="w-1 bg-emerald-400 h-6 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 bg-emerald-400 h-8 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 bg-emerald-400 h-5 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="w-1 bg-emerald-400 h-4 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>

                {/* In-Call Controls */}
                <div className="w-full space-y-4 pb-4">
                  <div className="grid grid-cols-3 gap-2 px-2">
                    <button
                      onClick={() => sounds.playMessagePop()}
                      className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex flex-col items-center gap-1 text-[10px]"
                    >
                      <Mic className="w-4 h-4" />
                      Mute
                    </button>
                    <button
                      onClick={() => sounds.playDialTone()}
                      className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex flex-col items-center gap-1 text-[10px]"
                    >
                      <KeyRound className="w-4 h-4" />
                      Keypad
                    </button>
                    <button
                      onClick={() => sounds.playMessagePop()}
                      className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 flex flex-col items-center gap-1 text-[10px]"
                    >
                      <Volume2 className="w-4 h-4" />
                      Speaker
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        onEndCall();
                      }}
                      className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 hover:scale-105 transition-transform"
                      title="End Call"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. WHATSAPP VIEW */}
            {deviceScreen === 'whatsapp' && (
              <div className="flex flex-col h-full bg-[#0b141a]">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between border-b border-[#2a3942] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setDeviceScreen('home')}
                      className="text-slate-300 hover:text-white"
                      title="Back to Phone Home"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div
                      onClick={() => setShowContactPicker(!showContactPicker)}
                      className="relative cursor-pointer"
                      title="Switch Contact"
                    >
                      <img
                        src={activeContact.avatar}
                        alt={activeContact.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/40"
                      />
                      {activeContact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#1f2c34]" />
                      )}
                    </div>
                    <div
                      onClick={() => setShowContactPicker(!showContactPicker)}
                      className="cursor-pointer"
                    >
                      <div className="font-medium text-xs text-slate-100 flex items-center gap-1">
                        {activeContact.name}
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-normal">
                        {isMaharishiTyping ? 'typing...' : activeContact.lastSeen}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        setDeviceScreen('incoming_call');
                        sounds.playRingtone();
                      }}
                      title="Simulate Call from Maharishi"
                      className="p-1.5 hover:bg-[#2a3942] rounded-full text-emerald-400"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href="https://web.whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Real WhatsApp Web"
                      className="p-1.5 hover:bg-[#2a3942] text-slate-300 hover:text-white rounded-full"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Contact Switcher Dropdown */}
                {showContactPicker && (
                  <div className="bg-[#1f2c34] border-b border-[#2a3942] p-2 space-y-1 z-30">
                    <span className="text-[10px] text-slate-400 px-2 uppercase font-mono">
                      Select Contact
                    </span>
                    {contacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveContactId(c.id);
                          setShowContactPicker(false);
                          sounds.playMessagePop();
                        }}
                        className={`w-full p-1.5 rounded-lg flex items-center gap-2 text-left text-xs ${
                          activeContactId === c.id ? 'bg-[#2a3942] text-white' : 'text-slate-300 hover:bg-[#2a3942]/60'
                        }`}
                      >
                        <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* WhatsApp Messages Feed */}
                <div
                  className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 50%, rgba(17, 27, 33, 0.95), rgba(11, 20, 26, 0.98))',
                  }}
                >
                  <div className="text-center my-1">
                    <span className="text-[9px] bg-[#182229] text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                      Messages and calls are end-to-end encrypted.
                    </span>
                  </div>

                  {messagesList.map((m) => {
                    const isMe = m.sender === 'me';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs shadow-sm ${
                            isMe
                              ? 'bg-[#005c4b] text-white rounded-tr-none'
                              : 'bg-[#202c33] text-slate-100 rounded-tl-none'
                          }`}
                        >
                          <p className="leading-snug">{m.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-slate-300">
                            <span>{m.timestamp}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isMaharishiTyping && (
                    <div className="flex items-center gap-1.5 bg-[#202c33] rounded-lg px-3 py-1.5 w-16">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}

                  <div ref={chatMessagesEndRef} />
                </div>

                {/* WhatsApp Chat Input Bar */}
                <form
                  onSubmit={handleSendChat}
                  className="bg-[#1f2c34] p-2 flex items-center gap-1.5 border-t border-[#2a3942] shrink-0"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-[#2a3942] text-white text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-8 h-8 rounded-full bg-[#00a884] disabled:opacity-50 text-white flex items-center justify-center shrink-0 hover:bg-[#008f6f] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* 2. REELS PLAYER VIEW */}
            {deviceScreen === 'reels' && (
              <div
                className={`relative flex flex-col justify-between h-full bg-gradient-to-b ${currentReel.bgGradient} p-4 text-white overflow-hidden select-none`}
              >
                {/* Floating Heart Particles */}
                {floatingHearts.map((id) => (
                  <div
                    key={id}
                    className="absolute bottom-24 right-5 text-rose-500 animate-ping z-30 pointer-events-none"
                  >
                    <Heart className="w-8 h-8 fill-current" />
                  </div>
                ))}

                {/* Auto Scroll Top Indicator */}
                <div className="absolute top-2 left-4 right-4 z-20 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-white/80">
                    <button
                      onClick={() => setDeviceScreen('home')}
                      className="flex items-center gap-1 font-medium hover:text-white"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] flex items-center gap-1 text-rose-300">
                      <Sparkles className="w-2.5 h-2.5 animate-spin" />
                      {isReelsAutoScrolling ? 'AI Autopilot Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Auto-Scroll Countdown Progress Bar */}
                  {isReelsAutoScrolling && (
                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full transition-all duration-100 ease-linear shadow-xs shadow-rose-500"
                        style={{ width: `${reelProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Middle Video Visual Representation with Equalizer waves */}
                <div className="my-auto text-center py-6 px-2">
                  <div className="inline-block p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-4 relative">
                    <Film className="w-14 h-14 text-rose-300 mx-auto animate-pulse" />
                    {/* Equalizer animation */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 h-4">
                      <span className="w-1 bg-rose-400 h-2 animate-bounce" />
                      <span className="w-1 bg-rose-400 h-4 animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1 bg-rose-400 h-3 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 bg-rose-400 h-4 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight drop-shadow-md">
                    {currentReel.videoTitle}
                  </h3>
                  <p className="text-xs text-rose-200/90 font-medium mt-1">
                    #{currentReel.category.toUpperCase()} REEL · {currentReel.handle}
                  </p>
                </div>

                {/* Right Side Engagement Action Strip */}
                <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-3.5">
                  <button
                    onClick={() => handleLikeReel(currentReel.id)}
                    className="flex flex-col items-center gap-0.5 text-white group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                        likedMap[currentReel.id]
                          ? 'bg-rose-600 text-white scale-110 shadow-lg shadow-rose-600/50'
                          : 'bg-black/40 text-white/90 hover:bg-black/60'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedMap[currentReel.id] ? 'fill-current' : ''}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums">
                      {(reelLikes[currentReel.id] || currentReel.likes).toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playMessagePop();
                      alert('Comments: "Awesome reel!", "Love the visuals!", "Very helpful tips!"');
                    }}
                    className="flex flex-col items-center gap-0.5 text-white"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums">
                      {currentReel.comments.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playMessagePop();
                      alert('Reel link copied to clipboard!');
                    }}
                    className="flex flex-col items-center gap-0.5 text-white"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums">Share</span>
                  </button>
                </div>

                {/* Bottom Caption & Audio Bar */}
                <div className="z-20 space-y-1.5 max-w-[78%]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {currentReel.author}
                    </span>
                    <span className="text-[10px] bg-rose-500/80 px-1.5 py-0.5 rounded text-white font-medium">
                      Follow
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 leading-tight line-clamp-2">
                    {currentReel.caption}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-1">
                    <Music className="w-3 h-3 text-rose-300 animate-spin" />
                    <span className="truncate">{currentReel.audioTrack}</span>
                  </div>
                </div>

                {/* Reels Controls Overlay Bar */}
                <div className="pt-2 z-20 flex items-center justify-between border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsReelsAutoScrolling(!isReelsAutoScrolling)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 backdrop-blur-md ${
                        isReelsAutoScrolling ? 'bg-rose-600 text-white' : 'bg-black/40 text-slate-300'
                      }`}
                    >
                      {isReelsAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {isReelsAutoScrolling ? 'Auto ON' : 'Resume'}
                    </button>

                    <button
                      onClick={() => {
                        const speeds: Array<'normal' | 'slow' | 'fast'> = ['slow', 'normal', 'fast'];
                        const next = speeds[(speeds.indexOf(reelsSpeed) + 1) % speeds.length];
                        setReelsSpeed(next);
                      }}
                      className="px-2 py-1 rounded-md text-[10px] bg-black/40 text-slate-300 hover:text-white"
                    >
                      {reelsSpeed.toUpperCase()}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCurrentReelIndex((curr) => (curr - 1 + reels.length) % reels.length);
                        setReelProgress(0);
                        sounds.playSwipeSound();
                      }}
                      className="p-1 rounded bg-black/40 hover:bg-black/60 text-white"
                      title="Previous Reel"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentReelIndex((curr) => (curr + 1) % reels.length);
                        setReelProgress(0);
                        sounds.playSwipeSound();
                      }}
                      className="p-1 rounded bg-black/40 hover:bg-black/60 text-white"
                      title="Next Reel"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. APP STORE & AUTO-LOGIN VIEW */}
            {deviceScreen === 'appstore' && (
              <div className="flex flex-col h-full bg-slate-900 p-3 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeviceScreen('home')}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-xs font-semibold text-white">App Store &amp; Auto-Login</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    Mitra Vault
                  </span>
                </div>

                {/* Interactive Install & Login Progress Animation Banner */}
                {activeAppIdForInstall && (
                  <div className="mb-3 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-white shadow-lg animate-fade-in shrink-0">
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        AI Agent Downloading &amp; Logging In
                      </span>
                      <span className="font-mono tabular-nums text-indigo-200">
                        {Math.round(installProgress)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-200 ease-out"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-indigo-400" />
                      {installStepText || 'Negotiating OAuth Session & Token...'}
                    </p>
                  </div>
                )}

                {/* Apps List */}
                <div className="space-y-2 flex-1">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl ${app.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0`}
                        >
                          {app.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1">
                            {app.name}
                            {app.isLoggedIn && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded">
                                Logged In
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {app.category} · {app.size}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {app.isInstalled && app.isLoggedIn ? (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setDeviceScreen('running_app');
                              sounds.playUnlockSound();
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            onClick={() => onInstallAndLoginApp(app.id)}
                            disabled={activeAppIdForInstall === app.id}
                            className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download &amp; Login
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. RUNNING INSTALLED APP VIEW */}
            {deviceScreen === 'running_app' && selectedApp && (
              <div className="flex flex-col h-full bg-slate-900 text-white">
                {/* Top Nav in App */}
                <div className="flex items-center justify-between p-3 border-b border-slate-800 shrink-0">
                  <button
                    onClick={() => setDeviceScreen('home')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Home
                  </button>
                  <span className="text-xs font-semibold flex items-center gap-1">
                    {selectedApp.name}
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Logged In</span>
                </div>

                {/* SPOTIFY IN-APP UI */}
                {selectedApp.id === 'spotify' && (
                  <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-emerald-950/80 to-slate-950">
                    <div className="text-center pt-2">
                      <div className="w-40 h-40 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-700 shadow-2xl flex items-center justify-center p-4 mb-4 border border-white/10">
                        <Music className="w-16 h-16 text-white drop-shadow-md" />
                      </div>
                      <h3 className="text-base font-bold text-white">Kesariya (From &quot;Brahmastra&quot;)</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Arijit Singh · Pritam · Amitabh B</p>
                    </div>

                    {/* Scrubber & Player Controls */}
                    <div className="space-y-3 pb-4">
                      <div className="space-y-1">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${(spotifyTrackTime / 210) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>
                            {Math.floor(spotifyTrackTime / 60)}:
                            {(spotifyTrackTime % 60).toString().padStart(2, '0')}
                          </span>
                          <span>3:30</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => setSpotifyTrackTime((t) => Math.max(0, t - 15))}
                          className="text-slate-400 hover:text-white"
                        >
                          <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsSpotifyPlaying(!isSpotifyPlaying);
                            sounds.playMessagePop();
                          }}
                          className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                          {isSpotifyPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setSpotifyTrackTime((t) => Math.min(210, t + 15))}
                          className="text-slate-400 hover:text-white"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTION IN-APP UI */}
                {selectedApp.id === 'notion' && (
                  <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-y-auto">
                    <h3 className="text-base font-bold text-white mb-1">Tej&apos;s Notion Workspace</h3>
                    <p className="text-xs text-slate-400 mb-4">Autonomous Sync Active · 4 Pages</p>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-indigo-400" /> Action Items
                      </div>
                      {notionTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setNotionTasks((prev) =>
                              prev.map((item) =>
                                item.id === t.id ? { ...item, done: !item.done } : item
                              )
                            );
                            sounds.playChime();
                          }}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={t.done}
                            readOnly
                            className="rounded text-indigo-500"
                          />
                          <span className={`text-xs ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {t.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INSTAGRAM IN-APP UI */}
                {selectedApp.id === 'instagram' && (
                  <div className="flex-1 flex flex-col bg-black overflow-y-auto">
                    {/* Story Tray */}
                    <div className="p-3 border-b border-neutral-900 flex items-center gap-3 overflow-x-auto shrink-0">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600">
                          <img
                            src="/src/assets/images/avatar_maharishi_1794118487716.jpg"
                            alt="Maharishi"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-300">maharishi</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600">
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                            AI
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-300">tech.pulse</span>
                      </div>
                    </div>

                    {/* Feed Post */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src="/src/assets/images/avatar_maharishi_1794118487716.jpg"
                          alt="Maharishi"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold">maharishi.tech</span>
                      </div>
                      <div className="w-full h-44 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 text-center">
                        <div>
                          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                          <p className="text-xs font-semibold">Mitra AI Personal Assistant Live!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHONEPE IN-APP UI */}
                {selectedApp.id === 'phonepe' && (
                  <div className="flex-1 flex flex-col bg-[#120524] text-white overflow-y-auto">
                    {/* Top PhonePe Purple Header */}
                    <div className="bg-[#5f259f] px-3.5 py-2.5 flex items-center justify-between border-b border-purple-800 shadow-md shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-black text-[#5f259f] text-sm shadow-xs">
                          पे
                        </div>
                        <div>
                          <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                            PhonePe
                            <span className="text-[9px] bg-purple-900/60 text-purple-200 px-1 py-0.2 rounded font-mono">UPI</span>
                          </div>
                          <div className="text-[9px] text-purple-200">
                            {phonepeStage === 'dashboard' ? 'Indiranagar, Bengaluru' : 'Secure Payment Gateway'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {phonepeStage === 'dashboard' && (
                          <>
                            <button
                              onClick={() => {
                                sounds.playMessagePop();
                                alert('QR Code Scanner Activated: Camera ready to scan any UPI QR');
                              }}
                              className="p-1.5 rounded-lg bg-purple-700/80 hover:bg-purple-600 text-white transition-colors"
                              title="Scan QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => sounds.playMessagePop()}
                              className="p-1.5 rounded-lg bg-purple-700/80 hover:bg-purple-600 text-white transition-colors"
                              title="Notifications"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <span className="text-[10px] font-mono bg-purple-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-purple-600/50 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> 256-bit
                        </span>
                      </div>
                    </div>

                    {/* Quick Payment Banner Alert */}
                    {phonepePaymentAlert && (
                      <div className="m-3 p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-bounce">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">{phonepePaymentAlert}</span>
                      </div>
                    )}

                    {/* STAGE 1: LOGIN (ENTER MOBILE NUMBER) */}
                    {phonepeStage === 'login' && (
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div className="space-y-4 pt-4 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-[#5f259f] mx-auto flex items-center justify-center shadow-xl shadow-purple-900/40 border border-purple-400/30">
                            <span className="text-3xl font-black text-white">पे</span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Enter Your Mobile Number</h3>
                            <p className="text-xs text-purple-300/80 mt-1">To verify your PhonePe UPI linked bank account</p>
                          </div>

                          <div className="bg-[#1c0f2e] border border-purple-500/40 rounded-xl p-3 flex items-center gap-2 text-left">
                            <span className="text-xs font-semibold text-slate-300 border-r border-slate-700 pr-2">🇮🇳 +91</span>
                            <input
                              type="text"
                              defaultValue="98210 74839"
                              className="bg-transparent text-sm font-mono text-white focus:outline-none flex-1"
                              placeholder="10-digit number"
                            />
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </div>

                          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-200/90 text-left space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-purple-200">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Mitra Autonomous Login
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Mitra will trigger OTP dispatch and prompt you for the 6-digit confirmation code.
                            </p>
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            onClick={() => {
                              setPhonepeStage('otp');
                              sounds.playUnlockSound();
                              speakText('PhonePe login ke liye aapke number par OTP bheja gaya hai. Kripya 6-digit OTP batayein ya type karein!');
                            }}
                            className="w-full py-3 rounded-xl bg-[#5f259f] hover:bg-[#6f2dbb] text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-950 flex items-center justify-center gap-2"
                          >
                            Proceed to Get OTP <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 2: OTP VERIFICATION (ASKING USER FOR OTP) */}
                    {phonepeStage === 'otp' && (
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div className="space-y-4 pt-2">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-[#5f259f]/40 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-300 mb-2">
                              <KeyRound className="w-6 h-6 animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-white">Enter 6-Digit OTP</h3>
                            <p className="text-xs text-purple-200/80 mt-0.5">
                              Sent via SMS to <span className="font-mono text-white">+91 98210 74839</span>
                            </p>
                          </div>

                          {/* 6 Digit OTP input boxes */}
                          <div className="flex items-center justify-center gap-2 pt-2">
                            {[0, 1, 2, 3, 4, 5].map((idx) => {
                              const digit = phonepeOtp[idx] || '';
                              const isActive = phonepeOtp.length === idx;
                              return (
                                <div
                                  key={idx}
                                  className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-mono font-bold transition-all ${
                                    digit
                                      ? 'bg-purple-900/60 border-purple-400 text-white shadow-md shadow-purple-500/20'
                                      : isActive
                                      ? 'bg-purple-950/80 border-indigo-400 ring-2 ring-indigo-400/30 text-indigo-300 animate-pulse'
                                      : 'bg-[#1c0f2e] border-slate-700 text-slate-500'
                                  }`}
                                >
                                  {digit || (isActive ? '·' : '')}
                                </div>
                              );
                            })}
                          </div>

                          {/* Helper Alert: Waiting for User voice/chat prompt */}
                          <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 space-y-1.5 text-xs text-indigo-200">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1.5 text-white">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                Voice &amp; Chat OTP Prompt
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400">Security Gate</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug">
                              Aap bol sakte hain: <span className="text-white font-medium">&quot;OTP hai 482910&quot;</span> ya chat me type kar sakte hain. Mitra bina aapki ijazat ke OTP enter nahi karega.
                            </p>
                            <div className="pt-1 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setPhonepeOtp('482910');
                                  sounds.playMessagePop();
                                }}
                                className="px-2.5 py-1 rounded-md bg-purple-700/60 hover:bg-purple-600 text-[10px] text-white border border-purple-400/40 flex items-center gap-1"
                              >
                                Auto-fill Test OTP: 482910
                              </button>
                            </div>
                          </div>

                          {/* Numeric Keypad Simulation */}
                          <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                              <button
                                key={n}
                                onClick={() => {
                                  if (phonepeOtp.length < 6) {
                                    setPhonepeOtp(phonepeOtp + n.toString());
                                    sounds.playMessagePop();
                                  }
                                }}
                                className="h-9 rounded-lg bg-[#1c0f2e] hover:bg-purple-900/60 border border-purple-900/40 font-mono text-sm font-semibold text-white transition-colors"
                              >
                                {n}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setPhonepeOtp('');
                                sounds.playMessagePop();
                              }}
                              className="h-9 rounded-lg bg-[#1c0f2e] hover:bg-rose-900/40 border border-purple-900/40 text-[10px] font-medium text-rose-300"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => {
                                if (phonepeOtp.length < 6) {
                                  setPhonepeOtp(phonepeOtp + '0');
                                  sounds.playMessagePop();
                                }
                              }}
                              className="h-9 rounded-lg bg-[#1c0f2e] hover:bg-purple-900/60 border border-purple-900/40 font-mono text-sm font-semibold text-white transition-colors"
                            >
                              0
                            </button>
                            <button
                              onClick={() => {
                                if (phonepeOtp.length > 0) {
                                  setPhonepeOtp(phonepeOtp.slice(0, -1));
                                  sounds.playMessagePop();
                                }
                              }}
                              className="h-9 rounded-lg bg-[#1c0f2e] hover:bg-purple-900/60 border border-purple-900/40 text-xs font-semibold text-slate-300"
                            >
                              ⌫
                            </button>
                          </div>
                        </div>

                        <div className="pt-4 space-y-2">
                          <button
                            onClick={() => {
                              const code = phonepeOtp.length === 6 ? phonepeOtp : '482910';
                              onPhonePeOtpSubmit(code);
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#5f259f] hover:bg-[#6f2dbb] text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-950 flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                            Verify OTP &amp; Open PhonePe
                          </button>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400">Resend OTP in 00:24</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STAGE 3: DASHBOARD */}
                    {phonepeStage === 'dashboard' && (
                      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                        {/* Account Balance Card */}
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#5f259f] via-purple-900 to-[#1c0f2e] border border-purple-500/40 shadow-xl">
                          <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-purple-300" />
                              HDFC Bank · **** 4920
                            </span>
                            <span className="text-[9px] font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30 text-emerald-300">
                              Primary A/c
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mt-2">
                            <div>
                              <div className="text-[10px] text-purple-300 uppercase tracking-wider font-medium">
                                Total Available Balance
                              </div>
                              <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                                {showPhonePeBalance ? `₹${phonepeBalance.toLocaleString('en-IN')}.00` : '₹ ••••••'}
                                <button
                                  onClick={() => setShowPhonePeBalance(!showPhonePeBalance)}
                                  className="text-purple-300 hover:text-white"
                                >
                                  {showPhonePeBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                sounds.playUnlockSound();
                                alert(`Refreshed Balance: ₹${phonepeBalance.toLocaleString('en-IN')}.00 (Synced with NPCI)`);
                              }}
                              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-purple-200 border border-white/10 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Refresh
                            </button>
                          </div>

                          <div className="mt-3 pt-2 border-t border-purple-400/20 flex items-center justify-between text-[10px] text-purple-200">
                            <span className="font-mono">UPI ID: tejpratap@ybl</span>
                            <button
                              onClick={() => {
                                sounds.playMessagePop();
                                alert('Copied UPI ID: tejpratap@ybl');
                              }}
                              className="flex items-center gap-1 hover:text-white"
                            >
                              <Copy className="w-2.5 h-2.5" /> Copy
                            </button>
                          </div>
                        </div>

                        {/* Transfer Money 4-Grid Action Buttons */}
                        <div>
                          <div className="text-[11px] font-semibold text-slate-300 mb-1.5 px-1">
                            Transfer Money
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <button
                              onClick={() => {
                                sounds.playMessagePop();
                                alert('Transfer to Mobile: Enter 10-digit mobile number to send money via UPI');
                              }}
                              className="p-2 rounded-xl bg-[#1c0f2e] hover:bg-purple-900/50 border border-purple-900/40 flex flex-col items-center gap-1 group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                <Phone className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] text-slate-300 leading-tight">To Mobile</span>
                            </button>

                            <button
                              onClick={() => {
                                sounds.playMessagePop();
                                alert('Transfer to Bank/UPI: Enter Account & IFSC or UPI ID');
                              }}
                              className="p-2 rounded-xl bg-[#1c0f2e] hover:bg-purple-900/50 border border-purple-900/40 flex flex-col items-center gap-1 group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] text-slate-300 leading-tight">To Bank/UPI</span>
                            </button>

                            <button
                              onClick={() => {
                                sounds.playMessagePop();
                                alert('Self Transfer: Move money between your linked accounts');
                              }}
                              className="p-2 rounded-xl bg-[#1c0f2e] hover:bg-purple-900/50 border border-purple-900/40 flex flex-col items-center gap-1 group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                <ArrowLeftRight className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] text-slate-300 leading-tight">To Self</span>
                            </button>

                            <button
                              onClick={() => {
                                sounds.playChime();
                                alert(`Bank Balance for HDFC **** 4920: ₹${phonepeBalance.toLocaleString('en-IN')}.00`);
                              }}
                              className="p-2 rounded-xl bg-[#1c0f2e] hover:bg-purple-900/50 border border-purple-900/40 flex flex-col items-center gap-1 group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] text-slate-300 leading-tight">Check Bal</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Payment Action for Maharishi */}
                        <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={contacts[0].avatar}
                              alt="Maharishi"
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-400"
                            />
                            <div>
                              <div className="text-xs font-semibold text-white">Maharishi</div>
                              <div className="text-[10px] text-purple-300">+91 98210 74839</div>
                            </div>
                          </div>

                          <button
                            onClick={handlePayMaharishi}
                            className="px-3 py-1.5 rounded-lg bg-[#5f259f] hover:bg-[#6f2dbb] text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
                          >
                            Pay ₹500
                          </button>
                        </div>

                        {/* Recent Transactions List */}
                        <div>
                          <div className="text-[11px] font-semibold text-slate-300 mb-1.5 px-1">
                            Recent Transactions
                          </div>
                          <div className="space-y-1.5">
                            {phonepeTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="p-2 rounded-xl bg-[#1c0f2e] border border-purple-950 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                      tx.type === 'debit' ? 'bg-purple-900/80 text-purple-200' : 'bg-emerald-900/80 text-emerald-200'
                                    }`}
                                  >
                                    {tx.type === 'debit' ? '↑' : '↓'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white text-[11px]">{tx.name}</div>
                                    <div className="text-[9px] text-slate-400">{tx.note} · {tx.time}</div>
                                  </div>
                                </div>
                                <div
                                  className={`font-mono font-bold text-xs ${
                                    tx.type === 'debit' ? 'text-white' : 'text-emerald-400'
                                  }`}
                                >
                                  {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Generic App Screen fallback */}
                {selectedApp.id !== 'spotify' && selectedApp.id !== 'notion' && selectedApp.id !== 'instagram' && selectedApp.id !== 'phonepe' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${selectedApp.iconBg} flex items-center justify-center text-2xl font-bold shadow-xl mb-3`}
                    >
                      {selectedApp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <h4 className="text-sm font-semibold">{selectedApp.name} Active Session</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Logged in automatically as{' '}
                      <span className="text-emerald-400 font-mono">
                        {selectedApp.loginUser || 'tejpratap.official'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 5. PHONE HOME SCREEN VIEW */}
            {deviceScreen === 'home' && (
              <div className="flex flex-col h-full p-4 justify-between bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
                {/* Clock & Date Widget */}
                <div className="pt-4 text-center">
                  <h1 className="text-4xl font-light tracking-tight font-mono tabular-nums">
                    {currentTime}
                  </h1>
                  <p className="text-xs text-indigo-300 mt-1">Wednesday, November 8</p>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-4 gap-4 px-2 my-auto">
                  <button
                    onClick={() => {
                      setDeviceScreen('whatsapp');
                      sounds.playUnlockSound();
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] text-slate-300">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeviceScreen('reels');
                      setIsReelsAutoScrolling(true);
                      sounds.playUnlockSound();
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Film className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] text-slate-300">Reels</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeviceScreen('appstore');
                      sounds.playUnlockSound();
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Download className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] text-slate-300">App Store</span>
                  </button>

                  {apps
                    .filter((a) => a.isInstalled && a.id !== 'whatsapp')
                    .map((installed) => (
                      <button
                        key={installed.id}
                        onClick={() => {
                          setSelectedApp(installed);
                          setDeviceScreen('running_app');
                          sounds.playUnlockSound();
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl ${installed.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform text-sm font-bold`}
                        >
                          {installed.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-slate-300 truncate max-w-[50px]">
                          {installed.name}
                        </span>
                      </button>
                    ))}
                </div>

                {/* Bottom Dock */}
                <div className="p-2 rounded-3xl bg-white/10 backdrop-blur-lg flex items-center justify-around">
                  <button
                    onClick={() => {
                      setDeviceScreen('whatsapp');
                      sounds.playUnlockSound();
                    }}
                    className="p-2 text-emerald-400 hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeviceScreen('reels');
                      setIsReelsAutoScrolling(true);
                      sounds.playUnlockSound();
                    }}
                    className="p-2 text-rose-400 hover:scale-110 transition-transform"
                    title="Reels"
                  >
                    <Film className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeviceScreen('appstore');
                      sounds.playUnlockSound();
                    }}
                    className="p-2 text-indigo-400 hover:scale-110 transition-transform"
                    title="App Store"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Virtual Home Indicator Bar */}
          <div className="h-6 flex items-center justify-center shrink-0 z-30">
            <button
              onClick={() => {
                setDeviceScreen('home');
                sounds.playSwipeSound();
              }}
              title="Home Screen"
              className="w-28 h-1 bg-slate-500/50 hover:bg-white rounded-full transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
