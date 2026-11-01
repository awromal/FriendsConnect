package com.friendsconnect.app.models

enum class UserRole {
    USER, ORG_ADMIN, SUPER_ADMIN
}

data class UserProfile(
    val id: String,
    val username: String,
    val fullName: String,
    val avatarUrl: String,
    val bio: String,
    val country: String,
    val city: String? = null,
    val languages: List<String>,
    val interests: List<String>,
    val isOnline: Boolean,
    val role: UserRole,
    val status: String
)

enum class CallType {
    VOICE, VIDEO
}

enum class CallStatus {
    RINGING, CONNECTED, ENDED
}

data class CallSession(
    val id: String,
    val caller: UserProfile,
    val receiver: UserProfile,
    val type: CallType,
    var status: CallStatus,
    var durationSeconds: Int = 0
)

enum class EventFormat {
    VIRTUAL, IN_PERSON
}

data class EventItem(
    val id: String,
    val title: String,
    val description: String,
    val bannerUrl: String,
    val format: EventFormat,
    val locationName: String,
    val ticketPrice: Double,
    val currency: String,
    val startTime: String,
    val currentAttendeesCount: Int,
    val tags: List<String>
)

data class PromoCode(
    val id: String,
    val code: String,
    val discountType: String, // "percentage" or "fixed_amount"
    val discountValue: Double,
    val isActive: Boolean,
    val minOrderAmount: Double? = null
)

data class TicketPass(
    val id: String,
    val ticketCode: String,
    val eventTitle: String,
    val eventLocation: String,
    val attendeeName: String,
    val attendeeEmail: String,
    val issuedAt: String
)
