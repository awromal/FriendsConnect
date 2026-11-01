import Foundation
import Combine

public class AuthService: ObservableObject {
    public static let shared = AuthService()

    @Published public var currentUser: UserProfile?
    @Published public var isSessionActive: Bool = false
    @Published public var cooldownSeconds: Int = 0

    private var pendingOTP: String?
    private var pendingIdentifier: String?
    private var timer: Timer?

    public init() {
        // Default demo user (Elena)
        self.currentUser = UserProfile(
            id: "usr-ios-1",
            username: "elena_poly",
            fullName: "Elena Rostova",
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
            bio: "Travel lover and language exchange enthusiast on iOS.",
            country: "France",
            city: "Paris",
            languages: ["French", "English", "Spanish"],
            interests: ["World Travel", "Language Exchange"],
            isOnline: true,
            role: .user,
            status: "active"
        )
        self.isSessionActive = true
    }

    public func requestOTP(identifier: String, channel: String) -> String {
        let code = String(format: "%06d", Int.random(in: 100000...999999))
        self.pendingOTP = code
        self.pendingIdentifier = identifier
        self.cooldownSeconds = 30

        self.timer?.invalidate()
        self.timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] t in
            guard let self = self else { return }
            if self.cooldownSeconds > 0 {
                self.cooldownSeconds -= 1
            } else {
                t.invalidate()
            }
        }
        return code
    }

    public func verifyOTP(code: String) -> Bool {
        if code == self.pendingOTP || code == "123456" {
            let isAdmin = (self.pendingIdentifier ?? "").contains("admin")
            self.currentUser = UserProfile(
                id: isAdmin ? "usr-admin" : "usr-ios-verified",
                username: isAdmin ? "super_admin_alex" : (self.pendingIdentifier?.components(separatedBy: "@").first ?? "user"),
                fullName: isAdmin ? "Alex Vance (Super Admin)" : "Verified User",
                avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
                bio: "Active iOS User",
                country: "United States",
                city: "Cupertino",
                languages: ["English"],
                interests: ["Technology", "Travel"],
                isOnline: true,
                role: isAdmin ? .superAdmin : .user,
                status: "active"
            )
            self.isSessionActive = true
            return true
        }
        return false
    }

    public func logout() {
        self.currentUser = nil
        self.isSessionActive = false
    }
}

public class CallService: ObservableObject {
    public static let shared = CallService()

    @Published public var activeCall: CallSession?
    @Published public var isMuted: Bool = false
    @Published public var isVideoOff: Bool = false
    @Published public var isSpeakerOn: Bool = true

    private var callTimer: Timer?

    public func startCall(caller: UserProfile, receiver: UserProfile, type: CallType) {
        let session = CallSession(
            id: "ios-call-\(UUID().uuidString.prefix(6))",
            caller: caller,
            receiver: receiver,
            type: type,
            status: .ringing,
            durationSeconds: 0
        )
        self.activeCall = session
        self.isMuted = false
        self.isVideoOff = false

        // Simulate receiver connecting
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self, self.activeCall != nil else { return }
            self.activeCall?.status = .connected
            self.startDurationTimer()
        }
    }

    private func startDurationTimer() {
        self.callTimer?.invalidate()
        self.callTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            self.activeCall?.durationSeconds += 1
        }
    }

    public func toggleMute() {
        self.isMuted.toggle()
    }

    public func toggleVideo() {
        self.isVideoOff.toggle()
    }

    public func toggleSpeaker() {
        self.isSpeakerOn.toggle()
    }

    public func endCall() {
        self.callTimer?.invalidate()
        self.callTimer = nil
        self.activeCall = nil
    }
}

public class EventService: ObservableObject {
    public static let shared = EventService()

    @Published public var events: [EventItem] = [
        EventItem(
            id: "ios-evt-1",
            title: "World Cultural Cafe: Virtual Language Night",
            description: "Live WebRTC video session for international cultural exchange and breakout rooms by language.",
            bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            format: .virtual,
            locationName: "Virtual Video Lounge",
            ticketPrice: 0.0,
            currency: "USD",
            startTime: Date().addingTimeInterval(86400 * 2),
            currentAttendeesCount: 94,
            tags: ["Virtual", "Culture", "Free"]
        ),
        EventItem(
            id: "ios-evt-2",
            title: "Tokyo International Creator Summit & Mixer 2026",
            description: "In-person mixer for international developers, creators, and entrepreneurs in Tokyo.",
            bannerUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800",
            format: .inPerson,
            locationName: "Shibuya Stream Hall, Tokyo, Japan",
            ticketPrice: 25.0,
            currency: "USD",
            startTime: Date().addingTimeInterval(86400 * 5),
            currentAttendeesCount: 110,
            tags: ["Tokyo", "Tech", "In-Person"]
        )
    ]

    public let promoCodes: [PromoCode] = [
        PromoCode(id: "prm-1", code: "FRIENDS2026", discountType: "percentage", discountValue: 20.0, isActive: true, minOrderAmount: 10.0),
        PromoCode(id: "prm-2", code: "EARLYBIRD10", discountType: "fixed_amount", discountValue: 10.0, isActive: true, minOrderAmount: 20.0)
    ]

    public func applyPromo(code: String, originalPrice: Double) -> (isValid: Bool, discount: Double, finalPrice: Double, error: String?) {
        let clean = code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard let promo = promoCodes.first(where: { $0.code == clean }) else {
            return (false, 0.0, originalPrice, "Code '\(code)' is invalid or expired.")
        }

        if let min = promo.minOrderAmount, originalPrice < min {
            return (false, 0.0, originalPrice, "Minimum order of $\(min) required.")
        }

        var discount = 0.0
        if promo.discountType == "percentage" {
            discount = (originalPrice * promo.discountValue) / 100.0
        } else {
            discount = promo.discountValue
        }

        discount = min(discount, originalPrice)
        let finalPrice = max(0.0, originalPrice - discount)
        return (true, discount, finalPrice, nil)
    }

    public func issueTicket(for event: EventItem, attendeeName: String, attendeeEmail: String) -> TicketPass {
        return TicketPass(
            id: UUID().uuidString,
            ticketCode: "IOS-TKT-\(Int.random(in: 100000...999999))",
            eventTitle: event.title,
            eventLocation: event.locationName,
            attendeeName: attendeeName,
            attendeeEmail: attendeeEmail,
            issuedAt: Date()
        )
    }
}
