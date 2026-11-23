import AppKit
import WebKit

// A separate synthetic application. No product code, servers or account storage.
final class CoordinateCanary:NSView {
    var completed:(()->Void)?
    private var down:NSPoint?
    override init(frame:NSRect) {
        super.init(frame:frame);setAccessibilityElement(true);setAccessibilityRole(.button)
        setAccessibilityLabel("Native coordinate canary");setAccessibilityIdentifier("native-coordinate-canary")
    }
    required init?(coder:NSCoder){fatalError("No archive")}
    override func draw(_ dirtyRect:NSRect){
        NSColor.controlBackgroundColor.setFill();NSBezierPath(roundedRect:bounds,xRadius:5,yRadius:5).fill()
        ("Native coordinate canary" as NSString).draw(at:NSPoint(x:8,y:6),withAttributes:[.font:NSFont.systemFont(ofSize:13)])
    }
    override func mouseDown(with event:NSEvent){
        down=nil
        if event.type == .leftMouseDown && event.buttonNumber==0 && NSApp.isActive && window?.isKeyWindow==true && window?.isVisible==true {down=event.locationInWindow}
    }
    override func mouseDragged(with event:NSEvent){down=nil}
    override func mouseUp(with event:NSEvent){
        defer{down=nil}
        guard let start=down,event.type == .leftMouseUp,event.buttonNumber==0,NSApp.isActive,window?.isKeyWindow==true,window?.isVisible==true,hypot(start.x-event.locationInWindow.x,start.y-event.locationInWindow.y)<4 else{return}
        completed?()
    }
}
@main final class Canary: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    static var retainedDelegate:Canary?
    var diagnostics:[String]=[]
    var observations:[NSKeyValueObservation]=[]
    let diagnosticState=NSTextField(labelWithString:"created")
    let appkitReceipt=NSTextField(labelWithString:"waiting")
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
        retainedDelegate=delegate
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
        web.frame = NSRect(x: 0,y: 140,width: 640,height: 300)
        web.autoresizingMask = [.width,.height]
        receipt.frame = NSRect(x: 12,y: 10,width: 616,height: 24)
        receipt.setAccessibilityIdentifier("native-receipt")
        renderState.frame = NSRect(x:12,y:40,width:616,height:24)
        renderState.setAccessibilityIdentifier("native-render-state")
        let coordinate=CoordinateCanary(frame:NSRect(x:12,y:105,width:230,height:28))
        coordinate.completed={ [weak self] in guard let self else{return};self.appkitReceipt.stringValue="\(self.nonce)|appkit|native-down-up|foreground" }
        appkitReceipt.frame=NSRect(x:250,y:105,width:378,height:24);appkitReceipt.setAccessibilityIdentifier("native-appkit-receipt")
        diagnosticState.frame=NSRect(x:12,y:72,width:616,height:24);diagnosticState.setAccessibilityIdentifier("native-webkit-diagnostic")
        content.addSubview(web); content.addSubview(receipt); content.addSubview(renderState)
        content.addSubview(coordinate);content.addSubview(appkitReceipt);content.addSubview(diagnosticState)
        window.contentView = content; window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        guard let resource=Bundle.main.url(forResource:"fixture",withExtension:"html") else {
            renderState.stringValue="\(nonce)|fixture-missing";return
        }
        fixture=resource.resolvingSymlinksInPath()
        renderState.stringValue="\(nonce)|loading"
        note("constructed-delegate-"+(web.navigationDelegate === self ? "retained" : "missing"))
        observations.append(web.observe(\.isLoading,options:[.new]) { [weak self] view,_ in self?.note(view.isLoading ? "loading-true" : "loading-false") })
        // Read only this self-contained bundled file, as Apple documents.
        let navigation=web.loadFileURL(fixture,allowingReadAccessTo:fixture)
        note(navigation == nil ? "load-returned-nil" : "load-returned-navigation")
        for delay in [2.0,5.0,8.0] {
            Timer.scheduledTimer(withTimeInterval:delay,repeats:false) { [weak self] _ in
                guard let self else{return}
                self.note("tick-\(Int(delay))-loading-\(self.web.isLoading)-progress-\(Int(self.web.estimatedProgress*100))")
            }
        }
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Only the exact bundled local document; no alternate files, queries, fragments or remote URLs.
        guard let url=navigationAction.request.url,url.isFileURL,url.query==nil,url.fragment==nil,
              url.resolvingSymlinksInPath()==fixture else {
            renderState.stringValue="\(nonce)|navigation-blocked";decisionHandler(.cancel);return
        }
        note("navigation-allowed");decisionHandler(.allow)
    }
    func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!) {
        note("did-finish");navigationFinished=true;updateRenderState()
    }
    func webView(_ webView:WKWebView,didFail navigation:WKNavigation!,withError error:Error) {
        note("did-fail");renderState.stringValue="\(nonce)|navigation-failed"
    }
    func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error) {
        note("provisional-failed");renderState.stringValue="\(nonce)|provisional-failed"
    }
    func webView(_ webView:WKWebView,didStartProvisionalNavigation navigation:WKNavigation!){note("did-start")}
    func webView(_ webView:WKWebView,didCommit navigation:WKNavigation!){note("did-commit")}
    func webViewWebContentProcessDidTerminate(_ webView:WKWebView){note("web-process-terminated");renderState.stringValue="\(nonce)|web-process-terminated"}
    private func note(_ value:String){
        if diagnostics.count<24 {diagnostics.append(value)}
        diagnosticState.stringValue="\(nonce)|"+diagnostics.joined(separator:",")
    }
    private func updateRenderState() {
        renderState.stringValue="\(nonce)|"+(documentReady&&navigationFinished ? "render-ready" : documentReady ? "document-ready" : "navigation-finished")
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name=="render" {
            guard message.frameInfo.isMainFrame,let value=message.body as? [String:Any],
                  value["nonce"] as? String==nonce,value["stage"] as? String=="document-ready" else {return}
            note("document-script-ready");documentReady=true;updateRenderState();return
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
