import AppKit
import WebKit

// A separate synthetic application. No product code, servers or account storage.
@main final class Canary: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    var window: NSWindow!
    var web: WKWebView!
    let receipt = NSTextField(labelWithString: "waiting")
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
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 640,height: 440), styleMask: [.titled,.closable], backing: .buffered, defer: false)
        window.title = "Synthetic Pointer Canary \(nonce)"
        let content = NSView(frame: NSRect(x: 0,y: 0,width: 640,height: 440))
        web.frame = NSRect(x: 0,y: 60,width: 640,height: 380)
        web.autoresizingMask = [.width,.height]
        receipt.frame = NSRect(x: 12,y: 10,width: 616,height: 42)
        receipt.setAccessibilityIdentifier("native-receipt")
        content.addSubview(web); content.addSubview(receipt)
        window.contentView = content; window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        web.loadHTMLString("""
        <!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'">
        <style>body{font:20px system-ui;padding:24px}button{font:inherit;margin:10px;padding:20px}</style>
        <h1>Synthetic destinations</h1><button id="meeting">Synthetic Meeting</button><button id="library">Synthetic Library</button><p id="destination">No destination</p>
        <script>
        let down=null;
        for(const id of ['meeting','library']) {
          const b=document.getElementById(id);
          for(const kind of ['mousedown','mouseup','click']) b.addEventListener(kind,e=>{
            if(kind==='mousedown') down={id,x:e.clientX,y:e.clientY};
            const valid=e.isTrusted&&e.button===0&&down&&down.id===id&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<4;
            window.webkit.messageHandlers.pointer.postMessage({nonce:'\(nonce)',id,kind,trusted:!!valid,detail:e.detail});
            if(kind==='click') {if(valid)document.getElementById('destination').textContent=id==='meeting'?'Synthetic Meeting destination':'Synthetic Library destination';down=null;}
          });
        }
        </script>
        """, baseURL: nil)
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Only the initial in-memory document is allowed. No remote or file navigation.
        decisionHandler(navigationAction.request.url?.absoluteString == "about:blank" ? .allow : .cancel)
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard NSApp.isActive, window.isKeyWindow, window.isVisible, message.frameInfo.isMainFrame,
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
