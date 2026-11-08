# PhonePe Secure OTP Login, Universal Voice Dialing & Omni-Task Assistant

Implement PhonePe automated login with voice and chat OTP prompts, universal phone call dialing for contacts (Maharishi, Priya, etc.) or custom numbers, and expanded omni-task autonomous execution across communications, UPI transactions, schedule, and device tasks.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed based on your preferences:
> - **PhonePe Login Flow**: Mitra initiates PhonePe login, navigates to the OTP screen, halts, and requests the 6-digit OTP from you via both voice speech and chat input. Once provided, it auto-fills the OTP, completes biometric PIN setup, and unlocks the PhonePe wallet/UPI dashboard.
> - **Voice Calling Scope**: You can command Mitra to call any contact by name (*"Maharishi ko call lagao"*, *"Priya ko phone karo"*) or dial any custom phone number (*"98765 43210 par call lagao"*). The virtual phone dialer displays outgoing rings, live duration timers, audio visualizer waves, and realistic two-way simulated voice responses.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades Mitra AI into an omni-capable autonomous device agent. It handles PhonePe financial app authentication by intelligently querying the user for one-time passwords (OTP) before proceeding, places voice-activated outgoing phone calls with simulated audio, and executes everyday tasks (WhatsApp, Reels, Notes, Emails, Calendar, Reminders, and App Installs).
- **Target Audience**: Users seeking a hands-free, hyper-capable Hindi/Hinglish personal assistant that operates an interactive virtual smartphone ecosystem with security-conscious verification.
- **Key Value**: Bridges the gap between fully autonomous agent actions and user-in-the-loop security (asking for OTPs on sensitive financial platforms like PhonePe), while enabling seamless voice dialing.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER VOICE / TEXT COMMAND                       │
│        "PhonePe download karke login kardo" OR "Maharishi ko call lagao"│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS INTENT PARSER & DISPATCHER                  │
│       • Identifies action: PHONEPE_AUTH or OUTGOING_CALL               │
│       • Switches virtual phone to active target screen                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     PHONEPE LOGIN FLOW        │       │      VOICE CALLING FLOW       │
│ 1. Download PhonePe App       │       │ 1. Dial contact or number     │
│ 2. Enter user phone number    │       │ 2. Ringing audio & UI tone    │
│ 3. PAUSE & ASK USER FOR OTP   │       │ 3. Call Connected Screen      │
│    "OTP batayein ya type karein"│       │ 4. Live duration timer        │
│ 4. User submits OTP           │       │ 5. Simulated voice reply      │
│ 5. Wallet & UPI Dashboard open│       │ 6. End call button            │
└───────────────────────────────┘       └───────────────────────────────┘
```

### Visual Identity & Theme
- **Dominant Colors**: Deep Obsidian Slate canvas (`#020617`), Indigo & Violet accents for AI execution (`#6366F1`), Emerald Green for WhatsApp & PhonePe UPI (`#10B981`), and Rose Red for End Call & Reels.
- **PhonePe Visual Fidelity**: Authentic PhonePe purple palette (`#5f259f`), 6-digit OTP input boxes with auto-focus, UPI QR scanner button, account balance card (₹24,850.00), and recent transaction list (Swiggy, Electricity Bill, Maharishi transfer).
- **Phone Calling Screen**: Outgoing call screen with contact avatar, pulsing caller waveform, Mute, Keypad, Speaker, and End Call red button.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Explicit OTP Interception Flow**:
  - *Chosen Approach*: When PhonePe triggers OTP verification, the agent enters a `waiting_for_otp` state, speaks in natural voice asking for the 6-digit code, and renders an interactive OTP prompt card in the chat.
  - *Why*: Balances real-world financial security with autonomous execution.
  - *Alternatives Considered*: Auto-generating mock OTP silently (rejected because it bypasses the user's explicit requirement: *"OTP mujhse puchh kar daale"*).

- **Decision 2: Universal Voice Calling (Contacts + Numbers)**:
  - *Chosen Approach*: Regex and NLP parsing extract either contact names (Maharishi, Priya, Rahul) or arbitrary 10-digit phone numbers from the voice command, routing immediately to the phone dialer and call audio simulator.
  - *Why*: Allows calling anyone without rigid pre-configuration.

---

## 4. Technical Architecture & Component Mapping

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYOUT                                │
│                                                                          │
│  ┌─────────────────────────┐          ┌───────────────────────────────┐  │
│  │    ASSISTANT CONSOLE    │          │    VIRTUAL PHONE SIMULATOR    │  │
│  │  • Voice Persona Engine │          │  • Dynamic Island Bar         │  │
│  │  • Live Speech Waveform │◄────────►│  • PhonePe with OTP Form      │  │
│  │  • OTP Input Prompt Card│          │  • Outgoing Call Screen       │  │
│  │  • Step Execution HUD   │          │  • WhatsApp & Reels           │  │
│  └─────────────────────────┘          │  • Spotify & Notion           │  │
│                                       └───────────────────────────────┘  │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS + GEMINI 3.8 FLASH BACKEND                     │
│  • /api/assistant/chat: Parses Hinglish/Hindi intents for PhonePe, OTP,  │
│    Call dialing, WhatsApp, Reels, Notes, Reminders, and Apps.            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Planned Sub-Tasks:
1. **PhonePe Screen & State Integration**:
   - Add PhonePe to App list and build dedicated PhonePe UI with phone number entry, interactive 6-digit OTP entry, UPI PIN verification, and Dashboard view (Balance, Scan QR, Send Money).
2. **OTP Awaiting Agent Pipeline**:
   - Add `waiting_for_otp` state in `App.tsx` and Assistant Console. When user provides OTP (via chat or voice), agent injects it into PhonePe and unlocks session.
3. **Universal Outgoing Voice Call Screen**:
   - Build dialer & outgoing call screen supporting any contact or keyed phone number with ringtone, connect chime, timer, and simulated voice conversation.
4. **Backend Intent Expansion (`server.ts`)**:
   - Train pattern parser to recognize `"PhonePe download karke login karo"`, `"OTP hai 482910"`, and `"9876543210 par call lagao"`.
5. **Compilation & Verification**:
   - Verify build and linting pass with zero errors.
