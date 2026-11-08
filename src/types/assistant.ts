export interface AgentExecutionStep {
  id: string;
  timestamp: string;
  text: string;
  status: 'pending' | 'running' | 'success';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: AssistantAction;
  steps?: AgentExecutionStep[];
}

export type AssistantActionType =
  | 'send_whatsapp'
  | 'scroll_reels'
  | 'create_note'
  | 'install_app'
  | 'schedule_event'
  | 'send_email'
  | 'create_reminder'
  | 'login_phonepe'
  | 'submit_otp'
  | 'make_call'
  | 'navigate'
  | 'none';

export interface AssistantAction {
  type: AssistantActionType;
  contact?: string;
  phoneNumber?: string;
  message?: string;
  otp?: string;
  speed?: 'normal' | 'slow' | 'fast';
  active?: boolean;
  title?: string;
  content?: string;
  tags?: string[];
  appName?: string;
  autoLogin?: boolean;
  date?: string;
  time?: string;
  location?: string;
  to?: string;
  subject?: string;
  body?: string;
  priority?: 'low' | 'medium' | 'high';
  tab?: 'device' | 'schedule' | 'email' | 'reminders' | 'notes';
}

export interface CallTarget {
  name: string;
  phone: string;
  isOutgoing?: boolean;
  avatar?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  lastSeen: string;
  isOnline: boolean;
  unreadCount?: number;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  sender: 'me' | 'contact';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ReelItem {
  id: string;
  author: string;
  handle: string;
  caption: string;
  audioTrack: string;
  likes: number;
  comments: number;
  shares: number;
  category: 'tech' | 'travel' | 'food' | 'fitness' | 'comedy';
  bgGradient: string;
  videoTitle: string;
  isLiked?: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  size: string;
  iconBg: string;
  iconName: string;
  isInstalled: boolean;
  isLoggedIn: boolean;
  loginUser?: string;
  status: 'idle' | 'downloading' | 'installing' | 'authenticating' | 'ready';
  description: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: string;
  category: 'work' | 'personal' | 'health' | 'meeting';
  location: string;
  isCompleted?: boolean;
}

export interface EmailItem {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts';
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  category: 'personal' | 'work' | 'health' | 'urgent';
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  color: string;
}
