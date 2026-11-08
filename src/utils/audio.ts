// Web Audio API sound generator and advanced speech synthesis engine

export type VoicePersona = 'aura_female' | 'kabir_male' | 'natural_modern';

class VoiceEngine {
  private currentPersona: VoicePersona = 'aura_female';
  private rate: number = 0.98;
  private pitch: number = 1.02;
  private isSpeaking: boolean = false;
  private listeners: Array<(speaking: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Warm up voices
      };
    }
  }

  setPersona(persona: VoicePersona) {
    this.currentPersona = persona;
  }

  getPersona(): VoicePersona {
    return this.currentPersona;
  }

  setSpeed(rate: number) {
    this.rate = Math.max(0.7, Math.min(1.5, rate));
  }

  setPitch(pitch: number) {
    this.pitch = Math.max(0.7, Math.min(1.4, pitch));
  }

  getSettings() {
    return {
      persona: this.currentPersona,
      rate: this.rate,
      pitch: this.pitch,
    };
  }

  subscribeSpeaking(fn: (speaking: boolean) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private setSpeakingState(state: boolean) {
    this.isSpeaking = state;
    this.listeners.forEach((fn) => fn(state));
  }

  // Get available voices prioritized by Indian English / Hindi / Natural accents
  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  speak(text: string, voiceEnabled = true): void {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean text for natural speech pronunciation in Hinglish/Hindi
      const cleanText = text
        .replace(/[•\*\#\_\[\]\(\)\{\}\>\~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const allVoices = this.getVoices();

      // Find the best suited voice based on persona
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (this.currentPersona === 'aura_female') {
        utterance.pitch = 1.08;
        utterance.rate = 0.96;
        selectedVoice =
          allVoices.find((v) => (v.lang === 'hi-IN' || v.lang === 'en-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('lekha') || v.name.toLowerCase().includes('priya') || v.name.toLowerCase().includes('neerja'))) ||
          allVoices.find((v) => v.lang === 'hi-IN') ||
          allVoices.find((v) => v.lang === 'en-IN') ||
          allVoices.find((v) => v.name.toLowerCase().includes('natural') && (v.lang.startsWith('en') || v.lang.startsWith('hi'))) ||
          allVoices.find((v) => v.lang.startsWith('en'));
      } else if (this.currentPersona === 'kabir_male') {
        utterance.pitch = 0.88;
        utterance.rate = 0.98;
        selectedVoice =
          allVoices.find((v) => (v.lang === 'hi-IN' || v.lang === 'en-IN') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('rishi'))) ||
          allVoices.find((v) => v.lang === 'hi-IN') ||
          allVoices.find((v) => v.lang === 'en-IN') ||
          allVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
          allVoices.find((v) => v.lang.startsWith('en'));
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        selectedVoice =
          allVoices.find((v) => v.lang === 'en-IN' || v.lang === 'hi-IN') ||
          allVoices.find((v) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en')) ||
          allVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        this.setSpeakingState(true);
      };

      utterance.onend = () => {
        this.setSpeakingState(false);
      };

      utterance.onerror = () => {
        this.setSpeakingState(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      this.setSpeakingState(false);
    }
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeakingState(false);
    }
  }
}

export const voiceEngine = new VoiceEngine();
export const speakText = (text: string, voiceEnabled = true) => voiceEngine.speak(text, voiceEnabled);

// Audio FX synthesizer for high-tech alerts and UI
class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Melodic chime for completed events / tasks
  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Ignore
    }
  }

  // Crisp notification pop
  playMessagePop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // Ignore
    }
  }

  // Biometric / high-tech unlock tone
  playUnlockSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Ignore
    }
  }

  // Smooth swipe sound for reels
  playSwipeSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      // Ignore
    }
  }

  // Phone Ringtone Sound for incoming call simulation
  playRingtone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.setValueAtTime(950, now + 0.15);
      osc.frequency.setValueAtTime(750, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      // Ignore
    }
  }

  // Dial tone for outgoing calls
  playDialTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(350, now);
      osc2.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (e) {
      // Ignore
    }
  }
}

export const sounds = new SoundEffects();
