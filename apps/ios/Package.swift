// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FriendsConnectIOS",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "FriendsConnectCore",
            targets: ["FriendsConnectCore"]
        ),
    ],
    dependencies: [
        // Official Supabase Swift SDK (PostgreSQL, Auth, Realtime)
        .package(url: "https://github.com/supabase-community/supabase-swift.git", from: "2.0.0"),
        // Official WebRTC SDK for iOS video & voice streaming
        .package(url: "https://github.com/stasel/WebRTC.git", from: "120.0.0"),
        // Official Stripe iOS SDK for Event Ticketing
        .package(url: "https://github.com/stripe/stripe-ios.git", from: "23.0.0")
    ],
    targets: [
        .target(
            name: "FriendsConnectCore",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "WebRTC", package: "WebRTC"),
                .product(name: "StripePaymentSheet", package: "stripe-ios")
            ],
            path: "FriendsConnect"
        )
    ]
)
