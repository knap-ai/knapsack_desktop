#!/usr/bin/env python3
"""Hosted-only isolated canary. Never launches on a developer/production Mac."""
import json, os, pathlib, plistlib, platform, shutil, signal, subprocess, sys, tempfile
import xml.etree.ElementTree as ET

BUNDLE = 'org.knapsack.qa.pointercanary'
XCODE = '/Applications/Xcode_26.6.app/Contents/Developer'

def preflight(env, system, machine):
    if env.get('GITHUB_ACTIONS') != 'true' or env.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise ValueError('github-hosted-only')
    if system != 'Darwin' or machine != 'arm64' or env.get('RUNNER_OS') != 'macOS':
        raise ValueError('macos-arm64-only')
    if env.get('DEVELOPER_DIR') != XCODE:
        raise ValueError('pinned-xcode-required')
    temp = pathlib.Path(env.get('RUNNER_TEMP', '')).resolve()
    if not temp.is_absolute() or not env.get('RUNNER_TEMP') or temp == pathlib.Path('/') or not temp.is_dir():
        raise ValueError('runner-temp-required')
    return temp

def project(root, source):
    """Generate an ordinary app + UI-test Xcode project; no downloaded generators."""
    root=pathlib.Path(root); source=pathlib.Path(source)
    objects={}
    def obj(key, isa, **kw):
        objects[key]={'isa':isa,**kw}; return key
    appfile=obj('APPFILE','PBXFileReference',lastKnownFileType='sourcecode.swift',path=str(source/'Canary.swift'),sourceTree='<absolute>')
    testfile=obj('TESTFILE','PBXFileReference',lastKnownFileType='sourcecode.swift',path=str(source/'PointerTests.swift'),sourceTree='<absolute>')
    settings=root/'CanarySettings.swift'
    settings.write_text('enum CanarySettings { static let root = '+json.dumps(str(root))+'; static let app = '+json.dumps(str(root/'derived/Build/Products/Debug/PointerCanary.app'))+' }\n')
    settingfile=obj('SETTINGS','PBXFileReference',lastKnownFileType='sourcecode.swift',path=str(settings),sourceTree='<absolute>')
    appproduct=obj('APPPRODUCT','PBXFileReference',explicitFileType='wrapper.application',path='PointerCanary.app',sourceTree='BUILT_PRODUCTS_DIR')
    testproduct=obj('TESTPRODUCT','PBXFileReference',explicitFileType='wrapper.cfbundle',path='PointerTests.xctest',sourceTree='BUILT_PRODUCTS_DIR')
    group=obj('GROUP','PBXGroup',children=[appfile,testfile,settingfile,'PRODUCTS'],sourceTree='<group>')
    obj('PRODUCTS','PBXGroup',children=[appproduct,testproduct],name='Products',sourceTree='<group>')
    def sources(key, refs):
        files=[obj(key+str(i),'PBXBuildFile',fileRef=ref) for i,ref in enumerate(refs)]
        return obj(key,'PBXSourcesBuildPhase',buildActionMask=2147483647,files=files,runOnlyForDeploymentPostprocessing=0)
    common={'SDKROOT':'macosx','MACOSX_DEPLOYMENT_TARGET':'14.0','SWIFT_VERSION':'5.0','CODE_SIGN_STYLE':'Manual','CODE_SIGN_IDENTITY':'-','DEVELOPMENT_TEAM':'','GENERATE_INFOPLIST_FILE':'YES','ENABLE_HARDENED_RUNTIME':'NO','SWIFT_OPTIMIZATION_LEVEL':'-Onone','SUPPORTED_PLATFORMS':'macosx'}
    def config(key, extra):
        cfg=obj(key+'DEBUG','XCBuildConfiguration',name='Debug',buildSettings={**common,**extra})
        return obj(key,'XCConfigurationList',buildConfigurations=[cfg],defaultConfigurationIsVisible=0,defaultConfigurationName='Debug')
    proxy=obj('PROXY','PBXContainerItemProxy',containerPortal='PROJECT',proxyType=1,remoteGlobalIDString='APP',remoteInfo='PointerCanary')
    dep=obj('DEPENDENCY','PBXTargetDependency',target='APP',targetProxy=proxy)
    obj('APP','PBXNativeTarget',name='PointerCanary',productName='PointerCanary',productReference=appproduct,productType='com.apple.product-type.application',buildConfigurationList=config('APPCONFIG',{'PRODUCT_BUNDLE_IDENTIFIER':BUNDLE,'PRODUCT_NAME':'PointerCanary','ENABLE_APP_SANDBOX':'YES','INFOPLIST_KEY_NSPrincipalClass':'NSApplication','INFOPLIST_KEY_LSApplicationCategoryType':'public.app-category.developer-tools'}),buildPhases=[sources('APPSOURCES',[appfile])],buildRules=[],dependencies=[])
    obj('TEST','PBXNativeTarget',name='PointerTests',productName='PointerTests',productReference=testproduct,productType='com.apple.product-type.bundle.ui-testing',buildConfigurationList=config('TESTCONFIG',{'PRODUCT_BUNDLE_IDENTIFIER':BUNDLE+'.tests','PRODUCT_NAME':'PointerTests','TEST_TARGET_NAME':'PointerCanary','LD_RUNPATH_SEARCH_PATHS':'$(inherited) @executable_path/../Frameworks @loader_path/../Frameworks','ENABLE_APP_SANDBOX':'NO'}),buildPhases=[sources('TESTSOURCES',[testfile,settingfile])],buildRules=[],dependencies=[dep])
    obj('PROJECT','PBXProject',attributes={'LastUpgradeCheck':'2660','TargetAttributes':{'TEST':{'TestTargetID':'APP'}}},buildConfigurationList=config('PROJECTCONFIG',{}),compatibilityVersion='Xcode 14.0',developmentRegion='en',hasScannedForEncodings=0,knownRegions=['en','Base'],mainGroup=group,productRefGroup='PRODUCTS',projectDirPath='',projectRoot='',targets=['APP','TEST'])
    # Stable 24-digit IDs: ordinary Xcode object identities, not paths or credentials.
    ids={key:f'{i:024X}' for i,key in enumerate(objects,1)}
    def replace(value):
        if isinstance(value,str): return ids.get(value,value)
        if isinstance(value,list): return [replace(v) for v in value]
        if isinstance(value,dict): return {ids.get(k,k):replace(v) for k,v in value.items()}
        return value
    p=root/'PointerCanary.xcodeproj';p.mkdir()
    (p/'project.pbxproj').write_bytes(plistlib.dumps({'archiveVersion':'1','classes':{},'objectVersion':'56','objects':replace(objects),'rootObject':ids['PROJECT']},sort_keys=False))
    schemes=p/'xcshareddata/xcschemes';schemes.mkdir(parents=True)
    scheme=ET.Element('Scheme',LastUpgradeVersion='2660',version='1.3')
    def reference(parent,key,name):
        ET.SubElement(parent,'BuildableReference',BuildableIdentifier='primary',BlueprintIdentifier=ids[key],BuildableName=name,BlueprintName='PointerCanary' if key=='APP' else 'PointerTests',ReferencedContainer='container:PointerCanary.xcodeproj')
    build=ET.SubElement(ET.SubElement(scheme,'BuildAction',parallelizeBuildables='NO',buildImplicitDependencies='YES'),'BuildActionEntries')
    for key,name in [('APP','PointerCanary.app'),('TEST','PointerTests.xctest')]:
        reference(ET.SubElement(build,'BuildActionEntry',buildForTesting='YES',buildForRunning='NO',buildForProfiling='NO',buildForArchiving='NO',buildForAnalyzing='YES'),key,name)
    action=ET.SubElement(scheme,'TestAction',buildConfiguration='Debug',selectedDebuggerIdentifier='Xcode.DebuggerFoundation.Debugger.LLDB',selectedLauncherIdentifier='Xcode.IDEFoundation.Launcher.LLDB',shouldUseLaunchSchemeArgsEnv='YES')
    reference(ET.SubElement(ET.SubElement(action,'Testables'),'TestableReference',skipped='NO',parallelizable='NO'),'TEST','PointerTests.xctest')
    ET.ElementTree(scheme).write(schemes/'PointerCanary.xcscheme',encoding='utf-8',xml_declaration=True)
    return p

def bounded(cmd, log, timeout):
    # This group is freshly created for our own xcodebuild, never selected by name.
    child=subprocess.Popen(cmd,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
    try:
        return child.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(child.pid,signal.SIGTERM)
        try: child.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(child.pid,signal.SIGKILL)
            child.wait(timeout=5)
        raise

def run():
    report={'status':'unavailable','reason':'preflight-not-complete'}
    reportpath=pathlib.Path('pointer-result.json')
    root=None
    try:
        temp=preflight(os.environ,platform.system(),platform.machine())
        if not pathlib.Path(XCODE).is_dir(): raise ValueError('pinned-xcode-unavailable')
        version=subprocess.run(['/usr/bin/xcodebuild','-version'],capture_output=True,text=True,timeout=10)
        if version.returncode or not version.stdout.startswith('Xcode 26.6\n'): raise ValueError('pinned-xcode-version-mismatch')
        root=pathlib.Path(tempfile.mkdtemp(prefix='knap-pointer-',dir=temp));root.chmod(0o700)
        p=project(root,pathlib.Path(__file__).resolve().parent)
        base=['/usr/bin/xcodebuild','-project',str(p),'-scheme','PointerCanary','-configuration','Debug','-destination','platform=macOS,arch=arm64','-derivedDataPath',str(root/'derived'),'-parallel-testing-enabled','NO','-maximum-concurrent-test-device-destinations','1','-test-timeouts-enabled','YES','-default-test-execution-time-allowance','60','-maximum-test-execution-time-allowance','90','CODE_SIGN_IDENTITY=-','CODE_SIGNING_ALLOWED=YES']
        report={'status':'test_failure','reason':'build-failed'}
        with (root/'build.log').open('w') as log:
            result=bounded(base+['build-for-testing'],log,300)
        if result != 0: raise RuntimeError('build-failed')
        app=root/'derived/Build/Products/Debug/PointerCanary.app'
        with (app/'Contents/Info.plist').open('rb') as f:
            if plistlib.load(f).get('CFBundleIdentifier') != BUNDLE: raise RuntimeError('bundle-mismatch')
        subprocess.run(['/usr/bin/codesign','--verify','--strict',str(app)],check=True,capture_output=True,timeout=10)
        signature=subprocess.run(['/usr/bin/codesign','-dv',str(app)],capture_output=True,text=True,timeout=10)
        if 'Signature=adhoc' not in signature.stderr: raise RuntimeError('not-ad-hoc')
        entitlements=subprocess.run(['/usr/bin/codesign','-d','--entitlements',':-',str(app)],capture_output=True,timeout=10)
        try: rights=plistlib.loads(entitlements.stdout)
        except Exception: raise RuntimeError('sandbox-entitlements-unreadable')
        if rights.get('com.apple.security.app-sandbox') is not True or any(rights.get(k) for k in ['com.apple.security.network.client','com.apple.security.network.server']): raise RuntimeError('sandbox-contract-mismatch')
        report={'status':'unavailable','reason':'automation-not-ready'}
        with (root/'test.log').open('w') as log:
            result=bounded(base+['-resultBundlePath',str(root/'result.xcresult'),'test-without-building'],log,150)
        # XCTest owns attachment persistence; the sandboxed UI runner never writes RUNNER_TEMP.
        from receipts import verify,InvalidEvidence
        result_path=root/'result.xcresult'
        def xcjson(kind):
            value=subprocess.run(['/usr/bin/xcrun','xcresulttool','get','test-results',kind,'--path',str(result_path),'--compact'],capture_output=True,text=True,timeout=20)
            if value.returncode: raise InvalidEvidence('xcresult-unreadable')
            parsed=json.loads(value.stdout)
            (root/(kind+'.json')).write_text(json.dumps(parsed))
            return parsed
        try:
            summary=xcjson('summary');tests=xcjson('tests')
            exports=root/'attachments'
            exported=subprocess.run(['/usr/bin/xcrun','xcresulttool','export','attachments','--path',str(result_path),'--output-path',str(exports)],capture_output=True,timeout=20)
            if exported.returncode: raise InvalidEvidence('xcresult-attachments-unreadable')
            manifest=json.loads((exports/'manifest.json').read_text())
            report=verify(summary,tests,manifest,exports,result)
        except (InvalidEvidence,ValueError,OSError):
            # A test/assertion, including setup persistence failure, is not environment unavailability.
            report={'status':'test_failure','reason':'xcresult-or-native-evidence-rejected'}
        print('Sanitized result:',json.dumps(report))
    except (ValueError,FileNotFoundError) as e:
        report={'status':'unavailable','reason':str(e) if isinstance(e,ValueError) else 'required-tool-unavailable'}
    except (RuntimeError,subprocess.CalledProcessError):
        report={'status':'test_failure','reason':'build-or-signature-failed'}
    except subprocess.TimeoutExpired:
        report={'status':'test_failure','reason':'bounded-run-timeout'}
    finally:
        reportpath.write_text(json.dumps(report)+'\n')
        evidence=pathlib.Path('canary-evidence');evidence.mkdir(exist_ok=True)
        shutil.copyfile(reportpath,evidence/'pointer-result.json')
        if root:
            for name in ['build.log','test.log','summary.json','tests.json']:
                if (root/name).is_file(): shutil.copyfile(root/name,evidence/name)
            if (root/'attachments').is_dir(): shutil.copytree(root/'attachments',evidence/'attachments',dirs_exist_ok=True)
    return 0 if report['status']=='native_automated_pass' else 1

if __name__=='__main__': sys.exit(run())
