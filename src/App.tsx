/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Calendar,
  Mail,
  Bell,
  FileText,
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import {
  INITIAL_CONTACTS,
  INITIAL_WHATSAPP_MESSAGES,
  INITIAL_REELS,
  INITIAL_APPS,
  INITIAL_SCHEDULE,
  INITIAL_EMAILS,
  INITIAL_REMINDERS,
  INITIAL_NOTES,
} from './data/initialData';
import {
  Message,
  AssistantAction,
  Contact,
  WhatsAppMessage,
  ReelItem,
  AppItem,
  ScheduleEvent,
  EmailItem,
  ReminderItem,
  NoteItem,
  AgentExecutionStep,
} from './types/assistant';
import { AssistantConsole } from './components/chat/AssistantConsole';
import { DeviceSimulator } from './components/device/DeviceSimulator';
import { ScheduleView } from './components/workspaces/ScheduleView';
import { EmailView } from './components/workspaces/EmailView';
import { RemindersView } from './components/workspaces/RemindersView';
import { NotesView } from './components/workspaces/NotesView';
import { sounds, speakText } from './utils/audio';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'device' | 'schedule' | 'email' | 'reminders' | 'notes'>('device');
  const [mobilePane, setMobilePane] = useState<'chat' | 'workspace'>('workspace');

  // Device screen state (controlled so actions visually switch the phone screen!)
  const [deviceScreen, setDeviceScreen] = useState<'home' | 'whatsapp' | 'reels' | 'appstore' | 'running_app' | 'incoming_call' | 'active_call'>('whatsapp');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<{ app: string; title: string; message: string } | null>(null);

  // PhonePe & OTP State
  const [phonepeStage, setPhonepeStage] = useState<'login' | 'otp' | 'dashboard'>('login');
  const [phonepeOtp, setPhonepeOtp] = useState<string>('');
  const [isWaitingForOtp, setIsWaitingForOtp] = useState<boolean>(false);

  // Calling State
  const [callTarget, setCallTarget] = useState<{ name: string; phone: string; isOutgoing?: boolean; avatar?: string }>({
    name: 'Maharishi',
    phone: '+91 98210 74839',
    avatar: '/src/assets/images/avatar_maharishi_1794118487716.jpg',
    isOutgoing: false,
  });

  const handleEndCall = () => {
    setDeviceScreen('home');
    sounds.playSwipeSound();
    triggerNotification('Phone Call', 'Call Ended', 'Call finished');
  };

  const handleTriggerIncomingCall = () => {
    setCallTarget({
      name: 'Maharishi',
      phone: '+91 98210 74839',
      avatar: '/src/assets/images/avatar_maharishi_1794118487716.jpg',
      isOutgoing: false,
    });
    setActiveTab('device');
    setDeviceScreen('incoming_call');
    sounds.playRingtone();
    triggerNotification('Phone Call', 'Maharishi', 'Incoming audio call...');
  };

  const handlePhonePeOtpSubmit = (otp: string) => {
    setPhonepeOtp(otp);
    setPhonepeStage('dashboard');
    setIsWaitingForOtp(false);
    sounds.playUnlockSound();

    setApps((prev) =>
      prev.map((a) =>
        a.id === 'phonepe'
          ? { ...a, isInstalled: true, isLoggedIn: true, loginUser: 'tejpratap.official', status: 'ready' }
          : a
      )
    );
    const phonepeApp = apps.find((a) => a.id === 'phonepe');
    if (phonepeApp) {
      setSelectedApp({ ...phonepeApp, isInstalled: true, isLoggedIn: true });
    }
    setDeviceScreen('running_app');
    setActiveTab('device');
    triggerNotification('PhonePe', 'Login Successful', `UPI verified with OTP: ${otp}`);
    speakText('OTP verify ho gaya! PhonePe dashboard khul gaya hai.');
  };

  // Assistant State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: 'Namaste Tej Pratap! 🙏 Main hoon aapka autonomous personal AI assistant Mitra.\n\nAap mujhe jo bhi command denge (WhatsApp message bhejna, Reels scroll karna, Notes banana, App download karke auto-login karna, Schedule aur Reminders), main virtual phone par real-time execute karke dikhaunga!',
      timestamp: 'Just now',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Workspaces Data States
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [whatsappMessages, setWhatsappMessages] = useState<Record<string, WhatsAppMessage[]>>(
    INITIAL_WHATSAPP_MESSAGES
  );
  const [reels] = useState<ReelItem[]>(INITIAL_REELS);
  const [isReelsAutoScrolling, setIsReelsAutoScrolling] = useState(false);
  const [reelsSpeed, setReelsSpeed] = useState<'normal' | 'slow' | 'fast'>('normal');

  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [activeAppIdForInstall, setActiveAppIdForInstall] = useState<string | undefined>(undefined);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepText, setInstallStepText] = useState('');

  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE);
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);

  // Notification Banner Helper
  const triggerNotification = (app: string, title: string, message: string) => {
    setNotificationBanner({ app, title, message });
    sounds.playMessagePop();
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4000);
  };

  // Execute App Download & Auto-Login Simulation
  const handleInstallAndLoginApp = (appId: string) => {
    const targetApp = apps.find((a) => a.id === appId);
    if (!targetApp) return;

    setActiveAppIdForInstall(appId);
    setInstallProgress(15);
    setInstallStepText(`Fetching verified package for ${targetApp.name} from store...`);
    sounds.playMessagePop();

    // Step 2
    setTimeout(() => {
      setInstallProgress(50);
      setInstallStepText(`Extracting APK & allocating isolated sandbox container...`);
    }, 800);

    // Step 3
    setTimeout(() => {
      setInstallProgress(85);
      setInstallStepText(`Injecting user credentials & Biometric SSO token...`);
    }, 1600);

    // Step 4: Finished & Auto Launch App!
    setTimeout(() => {
      setInstallProgress(100);
      setInstallStepText(`Authentication verified! Launching ${targetApp.name}...`);
      sounds.playUnlockSound();

      const updatedApp: AppItem = {
        ...targetApp,
        isInstalled: true,
        isLoggedIn: true,
        loginUser: 'tejpratap.official',
        status: 'ready',
      };

      setApps((prev) => prev.map((a) => (a.id === appId ? updatedApp : a)));
      setSelectedApp(updatedApp);
      setDeviceScreen('running_app');
      setActiveTab('device');
      setMobilePane('workspace');

      triggerNotification(targetApp.name, 'Session Active', 'Auto-login successfully verified');

      setTimeout(() => {
        setActiveAppIdForInstall(undefined);
      }, 1000);
    }, 2400);
  };

  // WhatsApp Send message handler
  const handleSendWhatsApp = (contactId: string, text: string) => {
    // If it's an auto-reply from contact
    if (text.startsWith('__REPLY__:')) {
      const actualReply = text.replace('__REPLY__:', '');
      const replyMsg: WhatsAppMessage = {
        id: `wa-${Date.now()}`,
        contactId,
        sender: 'contact',
        text: actualReply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setWhatsappMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), replyMsg],
      }));
      triggerNotification('WhatsApp', 'Maharishi', actualReply);
      sounds.playMessagePop();
      return;
    }

    const newMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`,
      contactId,
      sender: 'me',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setWhatsappMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg],
    }));
    sounds.playMessagePop();
  };

  // Main Assistant Query Execution Handler
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentContext: {
            activeTab,
            pendingRemindersCount: reminders.filter((r) => !r.isCompleted).length,
            eventsCount: scheduleEvents.length,
            installedAppsCount: apps.filter((a) => a.isInstalled).length,
          },
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Maine aapki request process kar li hai.';
      const action: AssistantAction = data.action || { type: 'none' };

      // Dispatch tools according to action with real visual execution
      if (action.type === 'send_whatsapp') {
        const contactName = action.contact || 'Maharishi';
        const contactId = contactName.toLowerCase().includes('maharishi') ? 'maharishi' : 'maharishi';
        const msgText = action.message || 'Hello';

        // Switch to device and WhatsApp screen!
        setActiveTab('device');
        setDeviceScreen('whatsapp');
        setMobilePane('workspace');

        handleSendWhatsApp(contactId, msgText);
        triggerNotification('WhatsApp', 'Outgoing Message', `Sent to ${contactName}: "${msgText}"`);

        // Trigger Maharishi auto-reply after 1.8 seconds with realistic typing
        setTimeout(() => {
          handleSendWhatsApp(
            'maharishi',
            '__REPLY__:Arey hello Tej bhai! Kaisa chal raha hai? AI assistant se message mil gaya, bilkul mast kaam kar raha hai!'
          );
        }, 1800);
      } else if (action.type === 'scroll_reels') {
        // Switch to device and Reels screen with auto-scroll active!
        setActiveTab('device');
        setDeviceScreen('reels');
        setIsReelsAutoScrolling(true);
        setMobilePane('workspace');
        sounds.playSwipeSound();
        triggerNotification('Reels', 'Autopilot Activated', 'Reels are auto-scrolling on virtual phone');
      } else if (action.type === 'create_note') {
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title: action.title || 'New AI Note',
          content: action.content || text,
          date: 'Just now',
          tags: action.tags || ['assistant', 'voice'],
          color: 'border-indigo-500/30 bg-indigo-950/20',
        };
        setNotes((prev) => [newNote, ...prev]);
        setActiveTab('notes');
        setMobilePane('workspace');
        sounds.playChime();
        triggerNotification('Smart Notes', 'Note Saved', newNote.title);
      } else if (action.type === 'install_app') {
        const appName = action.appName || 'Spotify';
        const found =
          apps.find((a) => a.name.toLowerCase().includes(appName.toLowerCase())) || apps[0];
        setActiveTab('device');
        setDeviceScreen('appstore');
        setMobilePane('workspace');
        handleInstallAndLoginApp(found.id);
      } else if (action.type === 'schedule_event') {
        const newEv: ScheduleEvent = {
          id: `ev-${Date.now()}`,
          title: action.title || 'New Scheduled Event',
          time: action.time || '03:00 PM - 03:45 PM',
          date: action.date || 'Today',
          duration: '45m',
          category: 'work',
          location: action.location || 'Google Meet',
          isCompleted: false,
        };
        setScheduleEvents((prev) => [...prev, newEv]);
        setActiveTab('schedule');
        setMobilePane('workspace');
        sounds.playChime();
        triggerNotification('Calendar', 'Meeting Scheduled', newEv.title);
      } else if (action.type === 'send_email') {
        const newMail: EmailItem = {
          id: `em-${Date.now()}`,
          from: 'Tej Pratap <tejpratapsingh3535@gmail.com>',
          to: action.to || 'client@example.com',
          subject: action.subject || 'Project Update',
          snippet: (action.body || '').slice(0, 70),
          body: action.body || 'Email content',
          date: 'Just now',
          unread: false,
          starred: false,
          folder: 'sent',
        };
        setEmails((prev) => [newMail, ...prev]);
        setActiveTab('email');
        setMobilePane('workspace');
        sounds.playMessagePop();
        triggerNotification('Email Hub', 'Email Queued', newMail.subject);
      } else if (action.type === 'create_reminder') {
        const newRem: ReminderItem = {
          id: `rem-${Date.now()}`,
          title: action.title || 'Important Reminder',
          time: action.time || 'Today 05:00 PM',
          priority: action.priority || 'high',
          isCompleted: false,
          category: 'work',
        };
        setReminders((prev) => [newRem, ...prev]);
        setActiveTab('reminders');
        setMobilePane('workspace');
        sounds.playChime();
        triggerNotification('Reminders', 'Alert Set', newRem.title);
      } else if (action.type === 'login_phonepe') {
        const phonepeApp = apps.find((a) => a.id === 'phonepe') || apps[0];
        setSelectedApp(phonepeApp);
        setPhonepeStage('otp');
        setIsWaitingForOtp(true);
        setActiveTab('device');
        setDeviceScreen('running_app');
        setMobilePane('workspace');
        sounds.playUnlockSound();
        triggerNotification('PhonePe', 'OTP Requested', 'Awaiting your 6-digit confirmation code');
      } else if (action.type === 'submit_otp') {
        const code = action.otp || '482910';
        handlePhonePeOtpSubmit(code);
      } else if (action.type === 'make_call') {
        const contactName = action.contact || 'Maharishi';
        const contactPhone = action.phoneNumber || '+91 98210 74839';
        const matchedContact = contacts.find((c) => c.name.toLowerCase().includes(contactName.toLowerCase()));

        setCallTarget({
          name: contactName,
          phone: contactPhone,
          isOutgoing: true,
          avatar: matchedContact?.avatar,
        });
        setActiveTab('device');
        setDeviceScreen('active_call');
        setMobilePane('workspace');
        sounds.playDialTone();
        triggerNotification('Phone Call', `Dialing ${contactName}`, 'Connecting audio stream...');

        setTimeout(() => {
          speakText(`Arey Tej bhai! Call connect ho gaya hai, bataiye kya baat karni thi?`);
        }, 2200);
      }

      const executionSteps: AgentExecutionStep[] = [
        {
          id: '1',
          timestamp: '00:01',
          text: `Parsed user command: "${text}"`,
          status: 'success',
        },
        {
          id: '2',
          timestamp: '00:02',
          text: `Routed action: [${action.type.toUpperCase()}] to device simulator`,
          status: 'success',
        },
        {
          id: '3',
          timestamp: '00:03',
          text: `State synced and audio feedback rendered`,
          status: 'success',
        },
      ];

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action,
        steps: executionSteps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(replyText, voiceEnabled);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Samajh gaya! Maine aapki request ko local agent ke zariye execute kar diya hai.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: AssistantAction) => {
    if (action.type === 'send_whatsapp') {
      setActiveTab('device');
      setDeviceScreen('whatsapp');
      setMobilePane('workspace');
    } else if (action.type === 'scroll_reels') {
      setActiveTab('device');
      setDeviceScreen('reels');
      setIsReelsAutoScrolling(true);
      setMobilePane('workspace');
    } else if (action.type === 'install_app') {
      setActiveTab('device');
      setDeviceScreen('running_app');
      setMobilePane('workspace');
    } else if (action.type === 'login_phonepe') {
      const phonepeApp = apps.find((a) => a.id === 'phonepe') || apps[0];
      setSelectedApp(phonepeApp);
      setPhonepeStage('otp');
      setIsWaitingForOtp(true);
      setActiveTab('device');
      setDeviceScreen('running_app');
      setMobilePane('workspace');
    } else if (action.type === 'submit_otp') {
      const phonepeApp = apps.find((a) => a.id === 'phonepe') || apps[0];
      setSelectedApp(phonepeApp);
      setPhonepeStage('dashboard');
      setIsWaitingForOtp(false);
      setActiveTab('device');
      setDeviceScreen('running_app');
      setMobilePane('workspace');
    } else if (action.type === 'make_call') {
      setActiveTab('device');
      setDeviceScreen('active_call');
      setMobilePane('workspace');
    } else if (action.type === 'create_note') {
      setActiveTab('notes');
      setMobilePane('workspace');
    } else if (action.type === 'schedule_event') {
      setActiveTab('schedule');
      setMobilePane('workspace');
    } else if (action.type === 'send_email') {
      setActiveTab('email');
      setMobilePane('workspace');
    } else if (action.type === 'create_reminder') {
      setActiveTab('reminders');
      setMobilePane('workspace');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. Universal Top Bar Contract (Single-line wordmark, clean single-line nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            Mitra AI
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AUTONOMOUS AGENT ACTIVE
            </span>
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => {
              setActiveTab('device');
              setDeviceScreen('whatsapp');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'device' && deviceScreen === 'whatsapp' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button
            onClick={() => {
              setActiveTab('device');
              setDeviceScreen('reels');
              setIsReelsAutoScrolling(true);
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'device' && deviceScreen === 'reels' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" /> Reels Scroller
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'schedule' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'email' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Emails
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'reminders' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Reminders
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Smart Notes
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile view pane switch */}
          <div className="flex md:hidden items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setMobilePane('chat')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${
                mobilePane === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Assistant
            </button>
            <button
              onClick={() => setMobilePane('workspace')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${
                mobilePane === 'workspace' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Workspace
            </button>
          </div>

          <button
            onClick={() => {
              handleSendMessage('aaj ke sare tasks aur schedule summarize kar do');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            Daily Briefing
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Assistant Console (Always visible on desktop, tabbed on mobile) */}
        <div
          className={`w-full md:w-[440px] lg:w-[480px] h-full shrink-0 ${
            mobilePane === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <AssistantConsole
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onNavigateTab={setActiveTab}
            onActionClick={handleActionClick}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            onTriggerIncomingCall={handleTriggerIncomingCall}
            isWaitingForOtp={isWaitingForOtp}
            phonepeOtp={phonepeOtp}
            setPhonepeOtp={setPhonepeOtp}
          />
        </div>

        {/* Right Side: Active Workspace View */}
        <div
          className={`flex-1 h-full overflow-hidden flex flex-col bg-slate-950 ${
            mobilePane === 'workspace' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Workspace Tab Bar (For quick switching on desktop / tablet) */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/40 text-xs shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('device');
                  setDeviceScreen('whatsapp');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'device' && deviceScreen === 'whatsapp'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp (Maharishi)
              </button>

              <button
                onClick={() => {
                  const phonepeApp = apps.find((a) => a.id === 'phonepe') || apps[0];
                  setSelectedApp(phonepeApp);
                  setActiveTab('device');
                  setDeviceScreen('running_app');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'device' && deviceScreen === 'running_app' && selectedApp?.id === 'phonepe'
                    ? 'bg-purple-900/60 text-white border border-purple-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded bg-[#5f259f] flex items-center justify-center text-[9px] font-bold text-white">
                  पे
                </span>
                PhonePe UPI
              </button>

              <button
                onClick={() => {
                  setActiveTab('device');
                  setDeviceScreen('reels');
                  setIsReelsAutoScrolling(true);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'device' && deviceScreen === 'reels'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                Reels Auto-Scroller
              </button>

              <button
                onClick={() => {
                  setActiveTab('device');
                  setDeviceScreen('appstore');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'device' && deviceScreen === 'appstore'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                App Store &amp; Auto-Login
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Schedule ({scheduleEvents.length})
              </button>

              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Emails ({emails.filter((e) => e.unread).length})
              </button>

              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'reminders'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-violet-400" />
                Reminders ({reminders.filter((r) => !r.isCompleted).length})
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Notes ({notes.length})
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biometric Vault Active</span>
            </div>
          </div>

          {/* Active Workspace View Rendering */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'device' && (
              <DeviceSimulator
                deviceScreen={deviceScreen}
                setDeviceScreen={setDeviceScreen}
                selectedApp={selectedApp}
                setSelectedApp={setSelectedApp}
                contacts={contacts}
                whatsappMessages={whatsappMessages}
                onSendWhatsApp={handleSendWhatsApp}
                reels={reels}
                isReelsAutoScrolling={isReelsAutoScrolling}
                setIsReelsAutoScrolling={setIsReelsAutoScrolling}
                reelsSpeed={reelsSpeed}
                setReelsSpeed={setReelsSpeed}
                apps={apps}
                onInstallAndLoginApp={handleInstallAndLoginApp}
                activeAppIdForInstall={activeAppIdForInstall}
                installProgress={installProgress}
                installStepText={installStepText}
                notificationBanner={notificationBanner}
                phonepeStage={phonepeStage}
                setPhonepeStage={setPhonepeStage}
                phonepeOtp={phonepeOtp}
                setPhonepeOtp={setPhonepeOtp}
                onPhonePeOtpSubmit={handlePhonePeOtpSubmit}
                isWaitingForOtp={isWaitingForOtp}
                callTarget={callTarget}
                onEndCall={handleEndCall}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                events={scheduleEvents}
                onAddEvent={(newEvent) => {
                  setScheduleEvents((prev) => [
                    ...prev,
                    { ...newEvent, id: `ev-${Date.now()}` },
                  ]);
                }}
                onToggleComplete={(id) => {
                  setScheduleEvents((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
                  );
                }}
                onDeleteEvent={(id) => {
                  setScheduleEvents((prev) => prev.filter((e) => e.id !== id));
                }}
              />
            )}

            {activeTab === 'email' && (
              <EmailView
                emails={emails}
                onSendEmail={(to, subject, body) => {
                  const newMail: EmailItem = {
                    id: `em-${Date.now()}`,
                    from: 'Tej Pratap <tejpratapsingh3535@gmail.com>',
                    to,
                    subject,
                    snippet: body.slice(0, 70),
                    body,
                    date: 'Just now',
                    unread: false,
                    starred: false,
                    folder: 'sent',
                  };
                  setEmails((prev) => [newMail, ...prev]);
                }}
                onDeleteEmail={(id) => {
                  setEmails((prev) => prev.filter((e) => e.id !== id));
                }}
                onToggleStar={(id) => {
                  setEmails((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e))
                  );
                }}
              />
            )}

            {activeTab === 'reminders' && (
              <RemindersView
                reminders={reminders}
                onToggleComplete={(id) => {
                  setReminders((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
                  );
                }}
                onAddReminder={(newRem) => {
                  setReminders((prev) => [
                    ...prev,
                    { ...newRem, id: `rem-${Date.now()}` },
                  ]);
                }}
                onDeleteReminder={(id) => {
                  setReminders((prev) => prev.filter((r) => r.id !== id));
                }}
              />
            )}

            {activeTab === 'notes' && (
              <NotesView
                notes={notes}
                onAddNote={(newNote) => {
                  setNotes((prev) => [
                    { ...newNote, id: `note-${Date.now()}` },
                    ...prev,
                  ]);
                }}
                onDeleteNote={(id) => {
                  setNotes((prev) => prev.filter((n) => n.id !== id));
                }}
                onUpdateNote={(id, updated) => {
                  setNotes((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
