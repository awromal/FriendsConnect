package com.friendsconnect.app.services

import com.friendsconnect.app.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.*
import kotlin.concurrent.timer

object AuthService {
    val currentUser = MutableStateFlow<UserProfile?>(
        UserProfile(
            id = "usr-android-1",
            username = "elena_poly",
            fullName = "Elena Rostova",
            avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
            bio = "Travel lover and language exchange partner on Android.",
            country = "France",
            city = "Paris",
            languages = listOf("French", "English", "Spanish"),
            interests = listOf("World Travel", "Language Exchange"),
            isOnline = true,
            role = UserRole.USER,
            status = "active"
        )
    )

    private var pendingOTP: String? = null
    private var pendingIdentifier: String? = null
    val cooldownSeconds = MutableStateFlow(0)
    private var timerInstance: Timer? = null

    fun requestOTP(identifier: String): String {
        val code = (100000..999999).random().toString()
        pendingOTP = code
        pendingIdentifier = identifier
        cooldownSeconds.value = 30

        timerInstance?.cancel()
        timerInstance = timer(period = 1000) {
            if (cooldownSeconds.value > 0) {
                cooldownSeconds.value -= 1
            } else {
                cancel()
            }
        }
        return code
    }

    fun verifyOTP(code: String): Boolean {
        if (code == pendingOTP || code == "123456") {
            val isAdmin = pendingIdentifier?.contains("admin") == true
            currentUser.value = UserProfile(
                id = if (isAdmin) "usr-admin" else "usr-android-verified",
                username = if (isAdmin) "super_admin_alex" else "android_user",
                fullName = if (isAdmin) "Alex Vance (Super Admin)" else "Verified Android User",
                avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
                bio = "Active Android Native User",
                country = "United States",
                city = "Mountain View",
                languages = listOf("English"),
                interests = listOf("Technology", "Android Dev"),
                isOnline = true,
                role = if (isAdmin) UserRole.SUPER_ADMIN else UserRole.USER,
                status = "active"
            )
            return true
        }
        return false
    }

    fun logout() {
        currentUser.value = null
    }
}

object CallService {
    val activeCall = MutableStateFlow<CallSession?>(null)
    val isMuted = MutableStateFlow(false)
    val isVideoOff = MutableStateFlow(false)
    val isSpeakerOn = MutableStateFlow(true)

    private var callTimer: Timer? = null

    fun startCall(caller: UserProfile, receiver: UserProfile, type: CallType) {
        val session = CallSession(
            id = "and-call-" + UUID.randomUUID().toString().take(6),
            caller = caller,
            receiver = receiver,
            type = type,
            status = CallStatus.RINGING
        )
        activeCall.value = session
        isMuted.value = false
        isVideoOff.value = false

        // Simulate connection
        Timer().schedule(object : TimerTask() {
            override fun run() {
                activeCall.value?.let {
                    it.status = CallStatus.CONNECTED
                    startTimer()
                }
            }
        }, 2000)
    }

    private fun startTimer() {
        callTimer?.cancel()
        callTimer = timer(period = 1000) {
            activeCall.value?.let {
                it.durationSeconds += 1
                activeCall.value = it.copy(durationSeconds = it.durationSeconds)
            }
        }
    }

    fun toggleMute() {
        isMuted.value = !isMuted.value
    }

    fun toggleVideo() {
        isVideoOff.value = !isVideoOff.value
    }

    fun toggleSpeaker() {
        isSpeakerOn.value = !isSpeakerOn.value
    }

    fun endCall() {
        callTimer?.cancel()
        callTimer = null
        activeCall.value = null
    }
}

object EventService {
    val events = listOf(
        EventItem(
            id = "and-evt-1",
            title = "World Cultural Cafe: Virtual Language Night",
            description = "Live WebRTC video session for international cultural exchange and breakout rooms by language.",
            bannerUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            format = EventFormat.VIRTUAL,
            locationName = "Virtual Video Lounge",
            ticketPrice = 0.0,
            currency = "USD",
            startTime = "Nov 5, 2026",
            currentAttendeesCount = 94,
            tags = listOf("Virtual", "Culture", "Free")
        ),
        EventItem(
            id = "and-evt-2",
            title = "Tokyo International Creator Summit & Mixer 2026",
            description = "In-person mixer for international developers, creators, and entrepreneurs in Tokyo.",
            bannerUrl = "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800",
            format = EventFormat.IN_PERSON,
            locationName = "Shibuya Stream Hall, Tokyo, Japan",
            ticketPrice = 25.0,
            currency = "USD",
            startTime = "Nov 12, 2026",
            currentAttendeesCount = 110,
            tags = listOf("Tokyo", "Tech", "In-Person")
        )
    )

    private val promoCodes = listOf(
        PromoCode("prm-1", "FRIENDS2026", "percentage", 20.0, true, 10.0),
        PromoCode("prm-2", "EARLYBIRD10", "fixed_amount", 10.0, true, 20.0)
    )

    data class PromoResult(
        val isValid: Boolean,
        val discount: Double,
        val finalPrice: Double,
        val error: String?
    )

    fun applyPromo(code: String, originalPrice: Double): PromoResult {
        val clean = code.trim().uppercase()
        val promo = promoCodes.find { it.code == clean }
            ?: return PromoResult(false, 0.0, originalPrice, "Code '$code' is invalid.")

        if (promo.minOrderAmount != null && originalPrice < promo.minOrderAmount) {
            return PromoResult(false, 0.0, originalPrice, "Min order of $${promo.minOrderAmount} required.")
        }

        val discount = if (promo.discountType == "percentage") {
            (originalPrice * promo.discountValue) / 100.0
        } else {
            promo.discountValue
        }.coerceAtMost(originalPrice)

        val finalPrice = (originalPrice - discount).coerceAtLeast(0.0)
        return PromoResult(true, discount, finalPrice, null)
    }

    fun issueTicket(event: EventItem, attendeeName: String, attendeeEmail: String): TicketPass {
        return TicketPass(
            id = UUID.randomUUID().toString(),
            ticketCode = "AND-TKT-" + (100000..999999).random(),
            eventTitle = event.title,
            eventLocation = event.locationName,
            attendeeName = attendeeName,
            attendeeEmail = attendeeEmail,
            issuedAt = "Just now"
        )
    }
}
