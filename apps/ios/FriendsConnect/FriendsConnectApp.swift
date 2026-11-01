import SwiftUI

@main
public struct FriendsConnectApp: App {
    @StateObject private var authService = AuthService.shared
    @StateObject private var callService = CallService.shared
    @State private var showLoginSheet = false

    public init() {}

    public var body: some Scene {
        WindowGroup {
            ZStack {
                TabView {
                    DiscoverRadarView()
                        .tabItem {
                            Label("Radar", systemImage: "antenna.radiowaves.left.and.right")
                        }

                    EventsListView()
                        .tabItem {
                            Label("Events", systemImage: "calendar")
                        }

                    // Direct Chat Tab
                    NavigationStack {
                        ZStack {
                            Color(red: 0.01, green: 0.02, blue: 0.09).ignoresSafeArea()
                            VStack(spacing: 12) {
                                Image(systemName: "message.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.indigo)
                                Text("Direct Messaging")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Text("Online presence and chat with international friends.")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                        .navigationTitle("Messages")
                    }
                    .tabItem {
                        Label("Chat", systemImage: "bubble.left.and.bubble.right.fill")
                    }

                    // Profile Tab
                    NavigationStack {
                        ZStack {
                            Color(red: 0.01, green: 0.02, blue: 0.09).ignoresSafeArea()
                            VStack(spacing: 16) {
                                if let user = authService.currentUser {
                                    AsyncImage(url: URL(string: user.avatarUrl)) { i in
                                        i.resizable().scaledToFill()
                                    } placeholder: { Color.gray }
                                    .frame(width: 80, height: 80)
                                    .clipShape(Circle())

                                    Text(user.fullName)
                                        .font(.title3.bold())
                                        .foregroundColor(.white)

                                    Text(user.role == .superAdmin ? "Super Admin Role" : "Regular User")
                                        .font(.caption.bold())
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 4)
                                        .background(user.role == .superAdmin ? Color.orange.opacity(0.2) : Color.indigo.opacity(0.2))
                                        .foregroundColor(user.role == .superAdmin ? .orange : .indigo)
                                        .cornerRadius(8)

                                    Button("Sign Out") {
                                        authService.logout()
                                        showLoginSheet = true
                                    }
                                    .foregroundColor(.red)
                                } else {
                                    Button("Sign In with 6-Digit OTP") {
                                        showLoginSheet = true
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .tint(.indigo)
                                }
                            }
                        }
                        .navigationTitle("Profile")
                    }
                    .tabItem {
                        Label("Profile", systemImage: "person.crop.circle")
                    }
                }
                .tint(.indigo)

                // WebRTC Fullscreen Video Call Overlay
                if callService.activeCall != nil {
                    VideoCallView()
                        .transition(.opacity)
                        .zIndex(999)
                }
            }
            .sheet(isPresented: $showLoginSheet) {
                OTPLoginSheet()
            }
        }
    }
}
