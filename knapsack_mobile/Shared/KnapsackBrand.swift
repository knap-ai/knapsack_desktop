import SwiftUI

enum KnapsackBrand {
  static let ink = Color(red: 0.01, green: 0.23, blue: 0.33)
  static let inkMuted = Color(red: 0.00, green: 0.27, blue: 0.38)
  static let amber = Color(red: 1.00, green: 0.70, blue: 0.28)
  static let coral = Color(red: 1.00, green: 0.36, blue: 0.22)
  static let paper = Color(red: 0.98, green: 0.98, blue: 0.97)
  static let mist = Color(red: 0.93, green: 0.95, blue: 0.96)
  static let slate = Color(red: 0.42, green: 0.46, blue: 0.51)
  static let line = Color.black.opacity(0.07)

  static let heroGradient = LinearGradient(
    colors: [amber.opacity(0.95), coral.opacity(0.92)],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
  )

  static let shellGradient = LinearGradient(
    colors: [Color.white, paper],
    startPoint: .top,
    endPoint: .bottom
  )

  static func inter(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
    .custom("InterVariable", size: size).weight(weight)
  }

  static func spectral(_ size: CGFloat) -> Font {
    .custom("Spectral-Medium", size: size)
  }

  static func spectralItalic(_ size: CGFloat) -> Font {
    .custom("Spectral-Italic", size: size)
  }
}
