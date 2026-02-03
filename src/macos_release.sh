codesign --force --options runtime --deep --sign "Developer ID Application: Cooper Lindsey (D4RJNXVA38)" /Users/cooper/dev/knap/target/release/bundle/macos/Knapsack.app
xcrun notarytool submit /Users/cooper/Desktop/Knapsack_v0.1.0.dmg --keychain-profile "Developer-altool" --wait
