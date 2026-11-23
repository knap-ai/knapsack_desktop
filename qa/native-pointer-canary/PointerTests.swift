import XCTest
import AppKit

@MainActor final class PointerTests: XCTestCase {
    func testTrustedOSPointer() throws {
        continueAfterFailure = false
        let root = URL(fileURLWithPath: CanarySettings.root, isDirectory: true).resolvingSymlinksInPath()
        let url = URL(fileURLWithPath: CanarySettings.app).resolvingSymlinksInPath()
        XCTAssertTrue(url.path.hasPrefix(root.path + "/"))
        XCTAssertEqual(url.lastPathComponent, "PointerCanary.app")
        XCTAssertEqual(Bundle(url:url)?.bundleIdentifier, "org.knapsack.qa.pointercanary")
        let nonce = UUID().uuidString.replacingOccurrences(of: "-",with: "").lowercased()
        let app = XCUIApplication(url: url)
        app.launchArguments = ["--synthetic-nonce",nonce]
        app.launch()
        defer { app.terminate() } // exact URL-owned app only; never process-name cleanup
        guard app.wait(for: .runningForeground, timeout: 15) else {
            throw XCTIssueError.unavailable
        }
        let window = app.windows["Synthetic Pointer Canary \(nonce)"]
        XCTAssertTrue(window.waitForExistence(timeout:10))
        XCTAssertTrue(window.isHittable)
        try record(nonce, phase:"setup", nativeReceipt:nil)
        for (id,title,destination) in [("meeting","Synthetic Meeting","Synthetic Meeting destination"),("library","Synthetic Library","Synthetic Library destination")] {
            let button = app.webViews.buttons[title]
            XCTAssertTrue(button.waitForExistence(timeout:10))
            XCTAssertTrue(button.isHittable)
            XCTAssertEqual(app.state,.runningForeground)
            // XCTest sends OS pointer input; do not replace with DOM dispatch/evaluateJavaScript.
            button.coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5)).click()
            let expected = "\(nonce)|\(id)|trusted-down-up-click|foreground"
            let receipt = app.staticTexts["native-receipt"]
            let matched = NSPredicate(format:"value == %@ OR label == %@",expected,expected)
            expectation(for:matched,evaluatedWith:receipt)
            waitForExpectations(timeout:10)
            XCTAssertTrue(app.webViews.staticTexts[destination].waitForExistence(timeout:5))
            XCTAssertEqual(app.state,.runningForeground)
            try record(nonce,phase:id,nativeReceipt:(receipt.value as? String) ?? receipt.label)
        }
        try record(nonce,phase:"complete",nativeReceipt:nil)
    }
    private func record(_ nonce:String,phase:String,nativeReceipt:String?) throws {
        var payload:[String:Any] = ["schema":1,"suite":"PointerTests","test":"testTrustedOSPointer()","nonce":nonce,"bundle":"org.knapsack.qa.pointercanary","phase":phase,"foreground":true,"windowVisible":true]
        if let nativeReceipt {
            payload["nativeReceipt"]=nativeReceipt
            payload["destination"] = phase == "meeting" ? "Synthetic Meeting destination" : "Synthetic Library destination"
        }
        let attachment=XCTAttachment(data:try JSONSerialization.data(withJSONObject:payload,options:[.sortedKeys]),uniformTypeIdentifier:"public.json")
        attachment.name="knapsack-pointer-\(phase).json"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    enum XCTIssueError:Error { case unavailable }
}
