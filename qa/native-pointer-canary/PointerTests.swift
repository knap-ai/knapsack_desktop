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
        let coordinate=app.buttons["native-coordinate-canary"]
        XCTAssertTrue(coordinate.waitForExistence(timeout:5));XCTAssertTrue(coordinate.isHittable)
        coordinate.coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5)).click()
        let appkitReceipt=app.staticTexts["native-appkit-receipt"]
        let appkitExpected=nonce+"|appkit|native-down-up|foreground"
        let appkitMatched=XCTNSPredicateExpectation(predicate:NSPredicate(format:"value == %@ OR label == %@",appkitExpected,appkitExpected),object:appkitReceipt)
        XCTAssertEqual(XCTWaiter.wait(for:[appkitMatched],timeout:5),.completed)
        try record(nonce,phase:"appkit",nativeReceipt:(appkitReceipt.value as? String) ?? appkitReceipt.label)
        let render=app.staticTexts["native-render-state"]
        let renderExpectation=XCTNSPredicateExpectation(predicate:NSPredicate(format:"value == %@ OR label == %@",nonce+"|render-ready",nonce+"|render-ready"),object:render)
        let rendered=XCTWaiter.wait(for:[renderExpectation],timeout:10)
        try record(nonce,phase:"render",nativeReceipt:nil,nativeRender:(render.value as? String) ?? render.label,nativeDiagnostic:(app.staticTexts["native-webkit-diagnostic"].value as? String) ?? app.staticTexts["native-webkit-diagnostic"].label)
        XCTAssertEqual(rendered,.completed,"Bundled document must load before testing accessibility")
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
    private func record(_ nonce:String,phase:String,nativeReceipt:String?,nativeRender:String?=nil,nativeDiagnostic:String?=nil) throws {
        var payload:[String:Any] = ["schema":1,"suite":"PointerTests","test":"testTrustedOSPointer()","nonce":nonce,"bundle":"org.knapsack.qa.pointercanary","phase":phase,"foreground":true,"windowVisible":true]
        if let nativeDiagnostic {payload["nativeDiagnostic"]=nativeDiagnostic}
        if let nativeRender {payload["nativeRender"]=nativeRender}
        if let nativeReceipt {
            payload["nativeReceipt"]=nativeReceipt
            if phase=="meeting" || phase=="library" {payload["destination"] = phase == "meeting" ? "Synthetic Meeting destination" : "Synthetic Library destination"}
        }
        let attachment=XCTAttachment(data:try JSONSerialization.data(withJSONObject:payload,options:[.sortedKeys]),uniformTypeIdentifier:"public.json")
        attachment.name="knapsack-pointer-\(phase).json"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    enum XCTIssueError:Error { case unavailable }
}
