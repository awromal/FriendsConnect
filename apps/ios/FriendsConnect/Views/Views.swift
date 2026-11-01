import SwiftUI

// 1. Radar & Matchmaking View
public struct DiscoverRadarView: View {
    @ObservedObject var authService = AuthService.shared
    @ObservedObject var callService = CallService.shared
    @State private var radarPulse = false
    @State private var matchIndex = 0
    @State private var selectedRegion = "Global"

    let regions = ["Global", "Europe", "Asia-Pacific", "North America", "Latin America", "Africa"]

    let candidatePool: [UserProfile] = [
        UserProfile(
            id: "usr-ios-kenji",
            username: "kenji_tech",
            fullName: "Kenji Sato",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            bio: "iOS & AI engineer from Tokyo. Passionate about indie gaming and photography.",
            country: "Japan",
            city: "Tokyo",
            languages: ["Japanese", "English"],
            interests: ["Software", "AI", "Gaming"],
            isOnline: true,
            role: .user,
            status: "active"
        ),
        UserProfile(
            id: "usr-ios-amara",
            username: "amara_nomad",
            fullName: "Amara Okafor",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            bio: "Community organizer uniting digital nomads and cultural music creators.",
            country: "Nigeria",
            city: "Lagos",
            languages: ["English", "Yoruba"],
            interests: ["Music", "Travel", "Startups"],
            isOnline: true,
            role: .orgAdmin,
            status: "active"
        )
    ]

    var currentFriend: UserProfile {
        candidatePool[matchIndex % candidatePool.count]
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.01, green: 0.02, blue: 0.09).ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Region Selector
                        HStack {
                            Text("Region Filter:")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Picker("Region", selection: $selectedRegion) {
                                ForEach(regions, id: \.self) { r in
                                    Text(r).tag(r)
                                }
                            }
                            .pickerStyle(.menu)
                            .tint(.indigo)

                            Spacer()

                            Button(action: {
                                withAnimation {
                                    matchIndex += 1
                                }
                            }) {
                                Label("Shuffle", systemImage: "shuffle")
                                    .font(.caption.bold())
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.indigo.opacity(0.2))
                                    .foregroundColor(.indigo)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal)

                        // Radar Avatar Card
                        VStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .stroke(Color.indigo.opacity(0.3), lineWidth: 2)
                                    .frame(width: 150, height: 150)
                                    .scaleEffect(radarPulse ? 1.25 : 0.95)
                                    .opacity(radarPulse ? 0.0 : 0.8)
                                    .animation(.easeOut(duration: 2.0).repeatForever(autoreverses: false), value: radarPulse)

                                AsyncImage(url: URL(string: currentFriend.avatarUrl)) { img in
                                    img.resizable().scaledToFill()
                                } placeholder: {
                                    Color.gray
                                }
                                .frame(width: 110, height: 110)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.indigo, lineWidth: 3))

                                // Online badge
                                Circle()
                                    .fill(Color.green)
                                    .frame(width: 14, height: 14)
                                    .offset(x: 38, y: 38)
                            }
                            .onAppear { radarPulse = true }

                            Text(currentFriend.fullName)
                                .font(.title2.bold())
                                .foregroundColor(.white)

                            Text("@\(currentFriend.username) • \(currentFriend.country)")
                                .font(.caption)
                                .foregroundColor(.indigo)

                            Text("\"\(currentFriend.bio)\"")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.8))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)

                            // Tags
                            HStack(spacing: 6) {
                                ForEach(currentFriend.languages, id: \.self) { l in
                                    Text(l)
                                        .font(.caption2)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.white.opacity(0.1))
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                }
                            }

                            // Icebreaker Card
                            VStack(alignment: .leading, spacing: 4) {
                                Text("ICEBREAKER QUESTION")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.indigo)
                                Text("\"If you could teleport to any city tonight for dinner, where would you go?\"")
                                    .font(.caption.italic())
                                    .foregroundColor(.white)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.indigo.opacity(0.15))
                            .cornerRadius(12)

                            // Call Buttons
                            HStack(spacing: 12) {
                                Button(action: {
                                    guard let user = authService.currentUser else { return }
                                    callService.startCall(caller: user, receiver: currentFriend, type: .video)
                                }) {
                                    Label("Video Call", systemImage: "video.fill")
                                        .font(.subheadline.bold())
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(Color.indigo)
                                        .foregroundColor(.white)
                                        .cornerRadius(14)
                                }

                                Button(action: {
                                    guard let user = authService.currentUser else { return }
                                    callService.startCall(caller: user, receiver: currentFriend, type: .voice)
                                }) {
                                    Label("Voice Call", systemImage: "phone.fill")
                                        .font(.subheadline.bold())
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(Color.white.opacity(0.1))
                                        .foregroundColor(.white)
                                        .cornerRadius(14)
                                }
                            }
                            .padding(.top, 6)
                        }
                        .padding(20)
                        .background(Color(red: 0.06, green: 0.09, blue: 0.16))
                        .cornerRadius(24)
                        .overlay(RoundedRectangle(cornerRadius: 24).stroke(Color.white.opacity(0.1), lineWidth: 1))
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Global Friends Radar")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// 2. Fullscreen Video Call View
public struct VideoCallView: View {
    @ObservedObject var callService = CallService.shared
    @State private var showReportAlert = false

    public var body: some View {
        if let call = callService.activeCall {
            ZStack {
                Color.black.ignoresSafeArea()

                // Remote Partner View
                AsyncImage(url: URL(string: call.receiver.avatarUrl)) { img in
                    img.resizable().scaledToFill()
                } placeholder: {
                    Color.gray
                }
                .ignoresSafeArea()
                .opacity(0.85)

                // Top Floating Bar
                VStack {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(call.receiver.fullName)
                                .font(.headline.bold())
                                .foregroundColor(.white)
                            Text(call.status == .ringing ? "Ringing via WebRTC..." : "Active Call • \(formatTime(call.durationSeconds))")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                        Spacer()

                        Button(action: { showReportAlert = true }) {
                            Text("Report User")
                                .font(.caption2.bold())
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.red.opacity(0.2))
                                .foregroundColor(.red)
                                .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.5))

                    Spacer()

                    // Local Camera Picture-in-Picture
                    HStack {
                        Spacer()
                        ZStack {
                            if callService.isVideoOff {
                                Color.gray
                                Text("Camera Off").font(.caption2).foregroundColor(.white)
                            } else {
                                AsyncImage(url: URL(string: call.caller.avatarUrl)) { i in
                                    i.resizable().scaledToFill()
                                } placeholder: { Color.gray }
                            }
                        }
                        .frame(width: 90, height: 130)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.indigo, lineWidth: 2))
                        .padding(.trailing, 20)
                        .padding(.bottom, 20)
                    }

                    // Bottom Control Row
                    HStack(spacing: 24) {
                        Button(action: { callService.toggleMute() }) {
                            Image(systemName: callService.isMuted ? "mic.slash.fill" : "mic.fill")
                                .font(.title3)
                                .frame(width: 54, height: 54)
                                .background(callService.isMuted ? Color.red : Color.white.opacity(0.2))
                                .foregroundColor(.white)
                                .clipShape(Circle())
                        }

                        Button(action: { callService.toggleVideo() }) {
                            Image(systemName: callService.isVideoOff ? "video.slash.fill" : "video.fill")
                                .font(.title3)
                                .frame(width: 54, height: 54)
                                .background(callService.isVideoOff ? Color.red : Color.white.opacity(0.2))
                                .foregroundColor(.white)
                                .clipShape(Circle())
                        }

                        Button(action: { callService.toggleSpeaker() }) {
                            Image(systemName: callService.isSpeakerOn ? "speaker.wave.3.fill" : "speaker.wave.1.fill")
                                .font(.title3)
                                .frame(width: 54, height: 54)
                                .background(Color.white.opacity(0.2))
                                .foregroundColor(.white)
                                .clipShape(Circle())
                        }

                        Button(action: { callService.endCall() }) {
                            Image(systemName: "phone.down.fill")
                                .font(.title3)
                                .frame(width: 60, height: 60)
                                .background(Color.red)
                                .foregroundColor(.white)
                                .clipShape(Circle())
                        }
                    }
                    .padding(.bottom, 36)
                }
            }
            .alert("Report Misconduct", isPresented: $showReportAlert) {
                Button("Harassment", role: .destructive) { callService.endCall() }
                Button("Inappropriate Video", role: .destructive) { callService.endCall() }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("This call session will be submitted to Admin Moderation for policy enforcement.")
            }
        }
    }

    private func formatTime(_ sec: Int) -> String {
        let m = sec / 60
        let s = sec % 60
        return String(format: "%02d:%02d", m, s)
    }
}

// 3. Events List & Stripe Checkout Sheet
public struct EventsListView: View {
    @ObservedObject var eventService = EventService.shared
    @State private var selectedEvent: EventItem?
    @State private var issuedTicket: TicketPass?

    public var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.01, green: 0.02, blue: 0.09).ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(eventService.events) { event in
                            VStack(alignment: .leading, spacing: 10) {
                                AsyncImage(url: URL(string: event.bannerUrl)) { img in
                                    img.resizable().scaledToFill()
                                } placeholder: { Color.gray }
                                .frame(height: 160)
                                .clipped()
                                .cornerRadius(16)

                                HStack {
                                    Text(event.format == .virtual ? "VIRTUAL WEBRTC" : "IN-PERSON")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Color.indigo)
                                        .foregroundColor(.white)
                                        .cornerRadius(6)

                                    Spacer()

                                    Text(event.ticketPrice == 0 ? "FREE" : "$\(String(format: "%.2f", event.ticketPrice))")
                                        .font(.subheadline.bold())
                                        .foregroundColor(.green)
                                }

                                Text(event.title)
                                    .font(.headline.bold())
                                    .foregroundColor(.white)

                                Text(event.locationName)
                                    .font(.caption)
                                    .foregroundColor(.gray)

                                Button(action: { selectedEvent = event }) {
                                    Text(event.ticketPrice == 0 ? "RSVP Free" : "Get Ticket (Promo Supported)")
                                        .font(.subheadline.bold())
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(Color.indigo)
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                }
                            }
                            .padding()
                            .background(Color(red: 0.06, green: 0.09, blue: 0.16))
                            .cornerRadius(20)
                            .padding(.horizontal)
                        }
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Events & Tickets")
            .sheet(item: $selectedEvent) { evt in
                StripeCheckoutSheet(event: evt) { ticket in
                    self.issuedTicket = ticket
                }
            }
            .sheet(item: $issuedTicket) { tkt in
                TicketPassSheet(ticket: tkt)
            }
        }
    }
}

// 4. Stripe Checkout & Promo Sheet
public struct StripeCheckoutSheet: View {
    public let event: EventItem
    public let onComplete: (TicketPass) -> Void

    @ObservedObject var eventService = EventService.shared
    @Environment(\.dismiss) var dismiss
    @State private var promoInput = ""
    @State private var discountAmount = 0.0
    @State private var finalPrice = 0.0
    @State private var promoMessage: String?
    @State private var isSuccess = false

    public init(event: EventItem, onComplete: @escaping (TicketPass) -> Void) {
        self.event = event
        self.onComplete = onComplete
        self._finalPrice = State(initialValue: event.ticketPrice)
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text(event.title)
                    .font(.headline.bold())
                    .multilineTextAlignment(.center)
                    .padding(.top)

                // Promo code section
                if event.ticketPrice > 0 {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Promo Code (Try 'FRIENDS2026')")
                            .font(.caption)
                            .foregroundColor(.gray)

                        HStack {
                            TextField("PROMO CODE", text: $promoInput)
                                .textFieldStyle(.roundedBorder)
                                .textInputAutocapitalization(.characters)

                            Button("Apply") {
                                let res = eventService.applyPromo(code: promoInput, originalPrice: event.ticketPrice)
                                if res.isValid {
                                    self.discountAmount = res.discount
                                    self.finalPrice = res.finalPrice
                                    self.promoMessage = "Applied! Saved $\(String(format: "%.2f", res.discount))"
                                } else {
                                    self.promoMessage = res.error
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.indigo)
                        }

                        if let msg = promoMessage {
                            Text(msg)
                                .font(.caption2)
                                .foregroundColor(discountAmount > 0 ? .green : .red)
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)
                }

                // Total Box
                HStack {
                    Text("Total Due:")
                        .font(.headline)
                    Spacer()
                    Text("$\(String(format: "%.2f", finalPrice))")
                        .font(.title2.bold())
                        .foregroundColor(.indigo)
                }
                .padding()

                Spacer()

                Button(action: {
                    let ticket = eventService.issueTicket(for: event, attendeeName: "iOS User", attendeeEmail: "user@friendsconnect.com")
                    onComplete(ticket)
                    dismiss()
                }) {
                    Text(finalPrice == 0 ? "Confirm RSVP" : "Pay with Apple Pay / Stripe")
                        .font(.headline.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.indigo)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                .padding(.horizontal)
            }
            .padding()
            .navigationTitle("Checkout")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// 5. Digital Ticket Pass Sheet
public struct TicketPassSheet: View {
    public let ticket: TicketPass
    @Environment(\.dismiss) var dismiss

    public var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("OFFICIAL EVENT PASS")
                    .font(.caption.bold())
                    .foregroundColor(.indigo)
                    .padding(.top)

                Text(ticket.eventTitle)
                    .font(.title3.bold())
                    .multilineTextAlignment(.center)

                Text(ticket.eventLocation)
                    .font(.caption)
                    .foregroundColor(.gray)

                // Mock QR Code
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white)
                        .frame(width: 180, height: 180)

                    VStack {
                        Image(systemName: "qrcode")
                            .resizable()
                            .frame(width: 120, height: 120)
                            .foregroundColor(.black)
                        Text(ticket.ticketCode)
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(.black)
                    }
                }
                .padding()

                Text("Attendee: \(ticket.attendeeName)")
                    .font(.subheadline.bold())

                Spacer()

                Button("Done") {
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.indigo)
                .padding(.bottom)
            }
            .padding()
            .navigationTitle("Your Ticket Pass")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// 6. Native OTP Login Sheet
public struct OTPLoginSheet: View {
    @ObservedObject var authService = AuthService.shared
    @Environment(\.dismiss) var dismiss
    @State private var identifier = ""
    @State private var otpCode = ""
    @State private var step = 0
    @State private var previewCode: String?

    public var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("6-Digit OTP Sign In")
                    .font(.title2.bold())
                    .padding(.top)

                Text(step == 0 ? "Enter mobile phone or email to receive code." : "Enter 6-digit code sent to \(identifier)")
                    .font(.caption)
                    .foregroundColor(.gray)

                if step == 0 {
                    TextField("you@example.com or +1 (555) 000-0000", text: $identifier)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)

                    Button("Send 6-Digit Code") {
                        let code = authService.requestOTP(identifier: identifier, channel: "sms")
                        self.previewCode = code
                        self.step = 1
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.indigo)
                } else {
                    if let c = previewCode {
                        Text("Simulated Code: \(c)")
                            .font(.caption.bold())
                            .foregroundColor(.green)
                            .onTapGesture {
                                self.otpCode = c
                            }
                    }

                    TextField("••••••", text: $otpCode)
                        .font(.title.bold())
                        .multilineTextAlignment(.center)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.numberPad)

                    Button("Verify & Sign In") {
                        if authService.verifyOTP(code: otpCode) {
                            dismiss()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.indigo)
                }

                Spacer()
            }
            .padding()
            .navigationTitle("Authentication")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
