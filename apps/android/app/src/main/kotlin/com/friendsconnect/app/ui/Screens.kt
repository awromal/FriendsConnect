package com.friendsconnect.app.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.friendsconnect.app.models.*
import com.friendsconnect.app.services.*

// 1. Radar & Matchmaking Screen
@Composable
fun DiscoverRadarScreen() {
    var matchIndex by remember { mutableIntStateOf(0) }
    var selectedRegion by remember { mutableStateOf("Global") }
    val regions = listOf("Global", "Europe", "Asia-Pacific", "North America", "Latin America", "Africa")

    val friendsPool = listOf(
        UserProfile(
            id = "usr-and-kenji",
            username = "kenji_tech",
            fullName = "Kenji Sato",
            avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            bio = "Android & AI engineer from Tokyo. Passionate about indie gaming and photography.",
            country = "Japan",
            city = "Tokyo",
            languages = listOf("Japanese", "English"),
            interests = listOf("Software", "AI", "Gaming"),
            isOnline = true,
            role = UserRole.USER,
            status = "active"
        ),
        UserProfile(
            id = "usr-and-amara",
            username = "amara_nomad",
            fullName = "Amara Okafor",
            avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            bio = "Community organizer uniting digital nomads and cultural creators.",
            country = "Nigeria",
            city = "Lagos",
            languages = listOf("English", "Yoruba"),
            interests = listOf("Music", "Travel", "Startups"),
            isOnline = true,
            role = UserRole.ORG_ADMIN,
            status = "active"
        )
    )

    val currentFriend = friendsPool[matchIndex % friendsPool.size]
    val currentUser by AuthService.currentUser.collectAsState()

    // Radar pulse animation
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "scale"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF020617))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Region bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Region: $selectedRegion", color = Color.Gray, fontSize = 12.sp)
            Button(
                onClick = { matchIndex++ },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
            ) {
                Icon(Icons.Default.Shuffle, contentDescription = "Shuffle", tint = Color(0xFF818CF8))
                Spacer(Modifier.width(4.dp))
                Text("Shuffle", color = Color(0xFF818CF8), fontSize = 12.sp)
            }
        }

        Spacer(Modifier.height(16.dp))

        // Profile Match Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            border = BorderStroke(1.dp, Color(0xFF1E293B))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Animated Radar Circle
                Box(contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(140.dp * pulseScale)
                            .clip(CircleShape)
                            .border(2.dp, Color(0xFF6366F1).copy(alpha = 0.3f), CircleShape)
                    )
                    AsyncImage(
                        model = currentFriend.avatarUrl,
                        contentDescription = currentFriend.fullName,
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color(0xFF4F46E5), CircleShape),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(Modifier.height(12.dp))

                Text(currentFriend.fullName, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("@${currentFriend.username} • ${currentFriend.country}", color = Color(0xFF818CF8), fontSize = 12.sp)

                Spacer(Modifier.height(8.dp))
                Text(
                    "\"${currentFriend.bio}\"",
                    color = Color(0xFFCBD5E1),
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(Modifier.height(12.dp))

                // Icebreaker Box
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF1E1B4B)
                ) {
                    Column(Modifier.padding(12.dp)) {
                        Text("ICEBREAKER QUESTION", color = Color(0xFF818CF8), fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text(
                            "\"If you could teleport to any city tonight for dinner, where would you go?\"",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontStyle = FontStyle.Italic
                        )
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Calling Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = {
                            currentUser?.let { user ->
                                CallService.startCall(user, currentFriend, CallType.VIDEO)
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.Videocam, contentDescription = "Video")
                        Spacer(Modifier.width(6.dp))
                        Text("Video Call", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            currentUser?.let { user ->
                                CallService.startCall(user, currentFriend, CallType.VOICE)
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.Call, contentDescription = "Voice", tint = Color.White)
                        Spacer(Modifier.width(6.dp))
                        Text("Voice Call", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// 2. Fullscreen Video Call Screen
@Composable
fun VideoCallScreen(call: CallSession) {
    val isMuted by CallService.isMuted.collectAsState()
    val isVideoOff by CallService.isVideoOff.collectAsState()
    val isSpeakerOn by CallService.isSpeakerOn.collectAsState()
    var showReportDialog by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Remote Partner Video
        AsyncImage(
            model = call.receiver.avatarUrl,
            contentDescription = "Remote",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.85f
        )

        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(call.receiver.fullName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text(
                    if (call.status == CallStatus.RINGING) "Ringing via WebRTC..." else "Connected • ${formatTime(call.durationSeconds)}",
                    color = Color.Green,
                    fontSize = 12.sp
                )
            }
            OutlinedButton(
                onClick = { showReportDialog = true },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFB7185))
            ) {
                Text("Report Misconduct", fontSize = 11.sp)
            }
        }

        // Local Camera PiP Box
        Surface(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 120.dp)
                .size(90.dp, 130.dp),
            shape = RoundedCornerShape(14.dp),
            color = Color(0xFF0F172A),
            border = BorderStroke(2.dp, Color(0xFF4F46E5))
        ) {
            if (isVideoOff) {
                Box(contentAlignment = Alignment.Center) {
                    Text("Camera Off", color = Color.Gray, fontSize = 10.sp)
                }
            } else {
                AsyncImage(
                    model = call.caller.avatarUrl,
                    contentDescription = "Local",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
        }

        // Bottom Controls
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { CallService.toggleMute() },
                modifier = Modifier
                    .size(54.dp)
                    .background(if (isMuted) Color.Red else Color.White.copy(alpha = 0.2f), CircleShape)
            ) {
                Icon(if (isMuted) Icons.Default.MicOff else Icons.Default.Mic, contentDescription = "Mic", tint = Color.White)
            }

            IconButton(
                onClick = { CallService.toggleVideo() },
                modifier = Modifier
                    .size(54.dp)
                    .background(if (isVideoOff) Color.Red else Color.White.copy(alpha = 0.2f), CircleShape)
            ) {
                Icon(if (isVideoOff) Icons.Default.VideocamOff else Icons.Default.Videocam, contentDescription = "Cam", tint = Color.White)
            }

            IconButton(
                onClick = { CallService.toggleSpeaker() },
                modifier = Modifier
                    .size(54.dp)
                    .background(if (isSpeakerOn) Color(0xFF312E81) else Color.White.copy(alpha = 0.2f), CircleShape)
            ) {
                Icon(Icons.Default.VolumeUp, contentDescription = "Speaker", tint = Color.White)
            }

            IconButton(
                onClick = { CallService.endCall() },
                modifier = Modifier
                    .size(60.dp)
                    .background(Color.Red, CircleShape)
            ) {
                Icon(Icons.Default.CallEnd, contentDescription = "End", tint = Color.White)
            }
        }

        if (showReportDialog) {
            AlertDialog(
                onDismissRequest = { showReportDialog = false },
                title = { Text("Report User to Admins") },
                text = { Text("Submit this session to the Admin Moderation Queue for review?") },
                confirmButton = {
                    TextButton(onClick = {
                        showReportDialog = false
                        CallService.endCall()
                    }) { Text("Submit & End Call", color = Color.Red) }
                },
                dismissButton = {
                    TextButton(onClick = { showReportDialog = false }) { Text("Cancel") }
                }
            )
        }
    }
}

private fun formatTime(sec: Int): String {
    val m = sec / 60
    val s = sec % 60
    return "%02d:%02d".format(m, s)
}

// 3. Events & Stripe Ticketing Screen
@Composable
fun EventsScreen(onCheckoutEvent: (EventItem) -> Unit) {
    val events = EventService.events

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF020617))
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Events & Organizations", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Join virtual rooms and in-person summits with promo discounts.", color = Color.Gray, fontSize = 12.sp)

        Spacer(Modifier.height(16.dp))

        events.forEach { event ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(Modifier.padding(16.dp)) {
                    AsyncImage(
                        model = event.bannerUrl,
                        contentDescription = event.title,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )

                    Spacer(Modifier.height(10.dp))

                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(event.format.name, color = Color(0xFF818CF8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(
                            if (event.ticketPrice == 0.0) "FREE" else "$${event.ticketPrice}",
                            color = Color(0xFF34D399),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(Modifier.height(4.dp))
                    Text(event.title, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text(event.locationName, color = Color.Gray, fontSize = 12.sp)

                    Spacer(Modifier.height(12.dp))

                    Button(
                        onClick = { onCheckoutEvent(event) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(if (event.ticketPrice == 0.0) "RSVP Free" else "Get Ticket (Use Promo)", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
