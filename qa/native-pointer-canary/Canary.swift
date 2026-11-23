import AppKit
import WebKit

// A separate synthetic application. No product code, servers or account storage.
@main final class Canary: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    var window: NSWindow!
    var web: WKWebView!
    let receipt = NSTextField(labelWithString: "waiting")
    let renderState = NSTextField(labelWithString: "created")
    var fixture: URL!
    var documentReady = false
    var navigationFinished = false
    var nonce = ""
    var pending = ""
    var phase = 0
    static func main() {
        let app = NSApplication.shared
        let delegate = Canary()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }
    func applicationDidFinishLaunching(_ notification: Notification) {
        let args = ProcessInfo.processInfo.arguments
        guard args.count == 3, args[1] == "--synthetic-nonce", args[2].count == 32,
              args[2].allSatisfy({ $0.isHexDigit }),
              Bundle.main.bundleIdentifier == "org.knapsack.qa.pointercanary" else { NSApp.terminate(nil); return }
        nonce = args[2]
        // Independent bounded lifetime even if XCTest loses its connection.
        Timer.scheduledTimer(withTimeInterval: 100, repeats: false) { _ in NSApp.terminate(nil) }
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.userContentController.add(self, name: "pointer")
        config.userContentController.add(self, name: "render")
        config.userContentController.addUserScript(WKUserScript(source:"window.__canaryNonce='\(nonce)';",injectionTime:.atDocumentStart,forMainFrameOnly:true))
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 640,height: 440), styleMask: [.titled,.closable], backing: .buffered, defer: false)
        window.title = "Synthetic Pointer Canary \(nonce)"
        let content = NSView(frame: NSRect(x: 0,y: 0,width: 640,height: 440))
        web.frame = NSRect(x: 0,y: 80,width: 640,height: 360)
        web.autoresizingMask = [.width,.height]
        receipt.frame = NSRect(x: 12,y: 10,width: 616,height: 24)
        receipt.setAccessibilityIdentifier("native-receipt")
        renderState.frame = NSRect(x:12,y:40,width:616,height:24)
        renderState.setAccessibilityIdentifier("native-render-state")
        content.addSubview(web); content.addSubview(receipt); content.addSubview(renderState)
        window.contentView = content; window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        guard let resource=Bundle.main.url(forResource:"fixture",withExtension:"html") else {
            renderState.stringValue="\(nonce)|fixture-missing";return
        }
        fixture=resource.resolvingSymlinksInPath()
        renderState.stringValue="\(nonce)|loading"
        web.loadFileURL(fixture,allowingReadAccessTo:fixture.deletingLastPathComponent())
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Only the exact bundled local document; no alternate files, queries, fragments or remote URLs.
        guard let url=navigationAction.request.url,url.isFileURL,url.query==nil,url.fragment==nil,
              url.resolvingSymlinksInPath()==fixture else {
            renderState.stringValue="\(nonce)|navigation-blocked";decisionHandler(.cancel);return
        }
        decisionHandler(.allow)
    }
    func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!) {
        navigationFinished=true;updateRenderState()
    }
    func webView(_ webView:WKWebView,didFail navigation:WKNavigation!,withError error:Error) {
        renderState.stringValue="\(nonce)|navigation-failed"
    }
    func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error) {
        renderState.stringValue="\(nonce)|provisional-failed"
    }
    private func updateRenderState() {
        renderState.stringValue="\(nonce)|"+(documentReady&&navigationFinished ? "render-ready" : documentReady ? "document-ready" : "navigation-finished")
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name=="render" {
            guard message.frameInfo.isMainFrame,let value=message.body as? [String:Any],
                  value["nonce"] as? String==nonce,value["stage"] as? String=="document-ready" else {return}
            documentReady=true;updateRenderState();return
        }
        guard message.name=="pointer",NSApp.isActive, window.isKeyWindow, window.isVisible, message.frameInfo.isMainFrame,
              let value = message.body as? [String:Any], value["nonce"] as? String == nonce,
              value["trusted"] as? Bool == true, value["detail"] as? Int == 1,
              let id = value["id"] as? String, ["meeting","library"].contains(id),
              let kind = value["kind"] as? String else { phase = 0; return }
        if kind == "mousedown" { pending = id; phase = 1 }
        else if kind == "mouseup", pending == id, phase == 1 { phase = 2 }
        else if kind == "click", pending == id, phase == 2 {
            receipt.stringValue = "\(nonce)|\(id)|trusted-down-up-click|foreground"
            phase = 0
        } else { phase = 0 }
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}
