# FriendsConnect Multi-Platform Ecosystem

An enterprise-grade social networking, friendship matchmaking, and event hosting platform built with **separate native codebases** for:
- 🌐 **Web (`apps/web`)**: Dedicated responsive web application for your custom domain (React + Tailwind CSS).
- 🍎 **Native iOS (`apps/ios`)**: Dedicated native iOS application written in **Swift & SwiftUI** with AVFoundation camera/mic permissions, WebRTC video calling, and Apple Wallet pass integration.
- 🤖 **Native Android (`apps/android`)**: Dedicated native Android application written in **Kotlin & Jetpack Compose** with Material 3, CameraX, WebRTC Android streaming, and Google Play permissions.
- 🛡️ **Admin Portal (`apps/admin`)**: Dedicated administrative portal for user management, action restrictions (blocking, banning, muting), event verification, and financial analytics.
- 🗄️ **Backend & Database (`supabase/`)**: Unified PostgreSQL database with Row-Level Security (RLS), Realtime WebSockets for WebRTC signaling, and Stripe payment gateway.

---

## Codebase Repository Structure

```
friends_app/
├── apps/
│   ├── web/                          # Web Application (Custom Domain)
│   │   ├── src/
│   │   │   ├── components/           # DiscoverView, VideoCallOverlay, StripeCheckoutModal, TicketModal
│   │   │   ├── services/             # authService (OTP), callService (WebRTC), eventService (Stripe)
│   │   │   └── App.tsx               # Main web application shell
│   │   └── package.json
│   │
│   ├── ios/                          # Native iOS Application (Swift & SwiftUI)
│   │   ├── FriendsConnect/
│   │   │   ├── FriendsConnectApp.swift # SwiftUI App Entry & TabView
│   │   │   ├── Views/Views.swift     # DiscoverRadarView, VideoCallView, EventsListView, StripeCheckoutSheet
│   │   │   ├── Services/Services.swift# AuthService (OTP), CallService (WebRTC), EventService (Promos)
│   │   │   ├── Models/Models.swift   # Swift UserProfile, CallSession, EventItem, PromoCode
│   │   │   └── Info.plist            # Camera, Microphone, VoIP Background Modes
│   │   └── Package.swift             # Swift Package Manager Manifest
│   │
│   ├── android/                      # Native Android Application (Kotlin & Jetpack Compose)
│   │   ├── app/
│   │   │   ├── src/main/
│   │   │   │   ├── AndroidManifest.xml # Camera, Record Audio, Modify Audio, Internet permissions
│   │   │   │   └── kotlin/com/friendsconnect/app/
│   │   │   │       ├── MainActivity.kt # Jetpack Compose Entry & Bottom Navigation
│   │   │   │       ├── ui/Screens.kt   # DiscoverRadarScreen, VideoCallScreen, EventsScreen
│   │   │   │       ├── services/Services.kt # AuthService (OTP), CallService (WebRTC), EventService
│   │   │   │       └── models/Models.kt # Kotlin Data Classes
│   │   │   └── build.gradle.kts      # Android dependencies (Compose, CameraX, WebRTC, Stripe)
│   │   └── build.gradle.kts
│   │
│   └── admin/                        # Dedicated Admin Governance & Financials Portal
│       ├── src/
│       │   ├── App.tsx               # Role-restricted dashboard (DAU, Revenue, Calls)
│       │   └── components/           # User management, Action restriction modal, Promo manager
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared TypeScript types, payment models & promo engine
│       ├── src/types/                # Auth, User, Call, Event, Payment, Admin types
│       └── src/utils/                # Promo calculation utility (20% off, fixed discount)
│
└── supabase/                         # Production PostgreSQL schemas with Row-Level Security
    ├── migrations/                   # 01_core, 02_calling, 03_admin_restrictions, 04_payments_promos
    └── seed.sql                      # Demo seed data (users, events, promo codes)
```

---

## Key Features Implemented Across All 3 Native Platforms

### 1. Dual-Channel 6-Digit OTP Authentication
- **Email Magic Code & Mobile SMS OTP** with zero password vulnerabilities.
- Auto-advancing 6-box input with paste handling and 30-second resend cooldown timer.
- Rate limiting & lockout protection against brute force.
- One-click demo logins for Elena (Regular User) and Alex Vance (Super Admin).

### 2. High-Definition WebRTC Audio & Video Calling
- In-call controls: Microphone mute/unmute, Camera toggle, Live duration timer, Speaking indicator.
- Call signaling powered by Supabase Realtime WebSocket channels.
- In-call safety reporting overlay directly submitting to Admin moderation.

### 3. "Connect Anywhere" Random Matchmaking Radar
- Connects random people across the globe or by selected region (Europe, Asia-Pacific, North America, etc.).
- Built-in conversation icebreakers with instant Video Call or Voice Call triggers.

### 4. Organization Event Hub & Stripe Ticketing with Promo Codes
- Organizations create virtual or in-person events.
- **Promo Code Engine**: Test codes `FRIENDS2026` (20% off) and `EARLYBIRD10` ($10 off) recalculate totals dynamically in real time.
- Stripe Payment Element simulation issuing verified Tickets with QR passes (Apple Wallet & Google Wallet ready).

### 5. Dedicated Admin Panel & Moderation Controls
- **User Action Restriction Modal**: Restrict specific capabilities without full account termination:
  - Toggle `can_video_call`
  - Toggle `can_voice_call`
  - Toggle `can_random_match`
  - Toggle `can_send_messages`
- **Abuse Reports Queue**: Review misconduct reports with one-click suspension.
- **Promo Code Generator**: Create custom promo codes with discount types and usage caps.
- **Platform Analytics**: Gross ticket revenue, active calls, registered profiles.

---

## How to Build and Run Each Platform

### 1. Web Application (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Native iOS Application (`apps/ios`)
```bash
cd apps/ios
# Open in Xcode or build via Swift CLI:
swift build
# Open the project folder in Xcode, select an iOS Simulator or connected iPhone, and click Run (Cmd+R).
```

### 3. Native Android Application (`apps/android`)
```bash
cd apps/android
# Build via Gradle:
./gradlew assembleDebug
# Open in Android Studio, select an Android Emulator or connected device, and click Run (Shift+F10).
```

### 4. Dedicated Admin Portal (`apps/admin`)
```bash
cd apps/admin
npm install
npm run dev
# Running on http://localhost:3001
```
