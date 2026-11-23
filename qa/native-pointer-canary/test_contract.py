import importlib.util, pathlib, plistlib, tempfile, unittest
P=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('canary',P/'run.py');canary=importlib.util.module_from_spec(spec);spec.loader.exec_module(canary)
class Contract(unittest.TestCase):
    def test_local_and_self_hosted_refuse(self):
        for env in [{},{'GITHUB_ACTIONS':'true','RUNNER_ENVIRONMENT':'self-hosted'}]:
            with self.assertRaisesRegex(ValueError,'github-hosted-only'):canary.preflight(env,'Darwin','arm64')
    def test_wrong_platform_xcode_temp_refuse(self):
        env={'GITHUB_ACTIONS':'true','RUNNER_ENVIRONMENT':'github-hosted','RUNNER_OS':'macOS','DEVELOPER_DIR':canary.XCODE,'RUNNER_TEMP':tempfile.gettempdir()}
        for system,machine in [('Linux','arm64'),('Darwin','x86_64')]:
            with self.assertRaises(ValueError):canary.preflight(env,system,machine)
        with self.assertRaisesRegex(ValueError,'pinned-xcode'):canary.preflight({**env,'DEVELOPER_DIR':'/bad'},'Darwin','arm64')
        with self.assertRaisesRegex(ValueError,'runner-temp'):canary.preflight({**env,'RUNNER_TEMP':'/'},'Darwin','arm64')
        self.assertEqual(canary.preflight(env,'Darwin','arm64'),pathlib.Path(tempfile.gettempdir()).resolve())
    def test_generated_project_uses_only_canary_sources_and_ad_hoc_targets(self):
        with tempfile.TemporaryDirectory() as d:
            p=canary.project(d,P);project=plistlib.loads((p/'project.pbxproj').read_bytes())
            objects=project['objects'];targets=[v for v in objects.values() if v['isa']=='PBXNativeTarget']
            self.assertEqual(len(targets),2)
            self.assertEqual({t['productType'] for t in targets},{'com.apple.product-type.application','com.apple.product-type.bundle.ui-testing'})
            for obj in objects.values():
                if obj['isa']=='XCBuildConfiguration':
                    self.assertEqual(obj['buildSettings']['CODE_SIGN_IDENTITY'],'-')
                    self.assertEqual(obj['buildSettings']['DEVELOPMENT_TEAM'],'')
            files=[o['path'] for o in objects.values() if o['isa']=='PBXFileReference' and o.get('lastKnownFileType')=='sourcecode.swift']
            self.assertEqual(len(files),3)
            self.assertEqual(sum(o['isa']=='PBXResourcesBuildPhase' for o in objects.values()),1)
            self.assertTrue(any(o.get('path')==str(P/'fixture.html') for o in objects.values()))
            self.assertTrue(all('Canary' in f or 'PointerTests.swift' in f for f in files))
    def test_workflow_has_no_privileged_trigger_or_secret(self):
        s=(P.parents[1]/'.github/workflows/native-pointer-canary.yml').read_text()
        for forbidden in ['pull_request_target','workflow_dispatch','secrets.','write-all','contents: write','sudo','self-hosted']:
            self.assertNotIn(forbidden,s)
        self.assertIn('contents: read',s);self.assertIn('persist-credentials: false',s);self.assertIn('pull_request.head.sha',s)
    def test_pointer_gate_is_native_and_no_human_gate_reuse(self):
        s=(P/'PointerTests.swift').read_text();app=(P/'Canary.swift').read_text();fixture=(P/'fixture.html').read_text()
        for required in ['XCUIApplication(url: url)','coordinate(withNormalizedOffset:','.click()','.runningForeground','window.isHittable','trusted-down-up-click','Synthetic Meeting destination','Synthetic Library destination']:
            self.assertIn(required,s)
        for forbidden in ['evaluateJavaScript(', 'dispatchEvent(', 'Start checks','resetAuthorizationStatus','CGEvent','AXIsProcessTrustedWithOptions']:
            self.assertNotIn(forbidden,s+app)
        for required in ['e.isTrusted','e.button===0','NSApp.isActive','window.isKeyWindow','window.isVisible','.nonPersistent()','connect-src \'none\'']:
            self.assertIn(required,app+fixture)
        self.assertIn('web.loadFileURL(fixture',app);self.assertNotIn('loadHTMLString',app)
        self.assertIn('url.isFileURL,url.query==nil,url.fragment==nil',app)
        self.assertIn('allowingReadAccessTo:fixture)',app)
        self.assertIn('static var retainedDelegate:Canary?',app)
        self.assertIn('webViewWebContentProcessDidTerminate',app)
        self.assertIn('web.observe(\\.isLoading',app)
        self.assertIn('mouseDown(with event:NSEvent)',app);self.assertIn('mouseUp(with event:NSEvent)',app)
        self.assertIn('mouseDragged(with event:NSEvent){down=nil}',app)
        self.assertIn('url.resolvingSymlinksInPath()==fixture',app)
        self.assertIn('didFailProvisionalNavigation',app);self.assertIn('documentReady&&navigationFinished',app)
        self.assertIn('timeInterval: 100',app.replace('withTimeInterval','timeInterval'))
        self.assertIn('XCTAttachment(data:',s);self.assertIn('.keepAlways',s)
        self.assertNotIn('.write(to:',s);self.assertNotIn('pointer-stage.txt',s)
if __name__=='__main__':unittest.main()
