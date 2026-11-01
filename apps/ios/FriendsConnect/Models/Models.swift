import Foundation

public enum UserRole: String, Codable {
    case user
    case orgAdmin = "org_admin"
    case superAdmin = "super_admin"
}

public struct UserProfile: Identifiable, Codable {
    public let id: String
    public let username: String
    public let fullName: String
    public let avatarUrl: String
    public let bio: String
    public let country: String
    public let city: String?
    public let languages: [String]
    public let interests: [String]
    public let isOnline: Bool
    public let role: UserRole
    public let status: String

    public init(id: String, username: String, fullName: String, avatarUrl: String, bio: String, country: String, city: String? = nil, languages: [String], interests: [String], isOnline: Bool, role: UserRole, status: String) {
        self.id = id
        self.username = username
        self.fullName = fullName
        self.avatarUrl = avatarUrl
        self.bio = bio
        self.country = country
        self.city = city
        self.languages = languages
        self.interests = interests
        self.isOnline = isOnline
        self.role = role
        self.status = status
    }
}

public enum CallType: String, Codable {
    case voice
    case video
}

public enum CallStatus: String, Codable {
    case ringing
    case connected
    case ended
}

public struct CallSession: Identifiable {
    public let id: String
    public let caller: UserProfile
    public let receiver: UserProfile
    public let type: CallType
    public var status: CallStatus
    public var durationSeconds: Int
}

public enum EventFormat: String, Codable {
    case virtual
    case inPerson = "in_person"
}

public struct EventItem: Identifiable, Codable {
    public let id: String
    public let title: String
    public let description: String
    public let bannerUrl: String
    public let format: EventFormat
    public let locationName: String
    public let ticketPrice: Double
    public let currency: String
    public let startTime: Date
    public let currentAttendeesCount: Int
    public let tags: [String]
}

public struct PromoCode: Identifiable, Codable {
    public let id: String
    public let code: String
    public let discountType: String // "percentage" or "fixed_amount"
    public let discountValue: Double
    public let isActive: Bool
    public let minOrderAmount: Double?
}

public struct TicketPass: Identifiable, Codable {
    public let id: String
    public let ticketCode: String
    public let eventTitle: String
    public let eventLocation: String
    public let attendeeName: String
    public let attendeeEmail: String
    public let issuedAt: Date
}
