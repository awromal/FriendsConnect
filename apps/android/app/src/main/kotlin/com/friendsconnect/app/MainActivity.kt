package com.friendsconnect.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.friendsconnect.app.models.EventItem
import com.friendsconnect.app.models.TicketPass
import com.friendsconnect.app.services.AuthService
import com.friendsconnect.app.services.CallService
import com.friendsconnect.app.ui.DiscoverRadarScreen
import com.friendsconnect.app.ui.EventsScreen
import com.friendsconnect.app.ui.VideoCallScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF020617),
                    surface = Color(0xFF0F172A),
                    primary = Color(0xFF4F46E5)
                )
            ) {
                MainAppScreen()
            }
        }
    }
}

@Composable
fun MainAppScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    val activeCall by CallService.activeCall.collectAsState()
    var checkoutEvent by remember { mutableStateOf<EventItem?>(null) }
    var issuedTicket by remember { mutableStateOf<TicketPass?>(null) }

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0F172A)) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Radar, contentDescription = "Radar") },
                    label = { Text("Radar") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Event, contentDescription = "Events") },
                    label = { Text("Events") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Chat, contentDescription = "Chat") },
                    label = { Text("Chat") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFF020617))
        ) {
            when (selectedTab) {
                0 -> DiscoverRadarScreen()
                1 -> EventsScreen(onCheckoutEvent = { checkoutEvent = it })
                2 -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                    ) {
                        Text("Direct Messaging", color = Color.White, style = MaterialTheme.typography.headlineMedium)
                        Text("Real-time presence and chat with international friends.", color = Color.Gray)
                    }
                }
                3 -> {
                    val user by AuthService.currentUser.collectAsState()
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                    ) {
                        Text(user?.fullName ?: "Guest", color = Color.White, style = MaterialTheme.typography.headlineMedium)
                        Text("Role: " + (user?.role?.name ?: "USER"), color = Color(0xFF818CF8))
                    }
                }
            }

            // WebRTC Video Call Fullscreen Overlay
            activeCall?.let { call ->
                VideoCallScreen(call)
            }
        }
    }
}
