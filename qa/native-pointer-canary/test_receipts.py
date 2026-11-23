import copy,json,pathlib,sys,tempfile,unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from receipts import verify,InvalidEvidence
class Receipts(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.folder=pathlib.Path(self.temp.name)
        self.nonce='a'*32
        self.summary={'result':'Passed','totalTestCount':1,'passedTests':1,'failedTests':0,'skippedTests':0,'expectedFailures':0}
        self.case={'nodeType':'Test Case','name':'testTrustedOSPointer()','nodeIdentifier':'PointerTests/testTrustedOSPointer()','result':'Passed'}
        self.tests={'testNodes':[{'nodeType':'UI test bundle','name':'PointerTests','children':[{'nodeType':'Test Suite','name':'PointerTests','children':[self.case]}]}]}
        self.manifest=[{'testIdentifier':self.case['nodeIdentifier'],'attachments':[]}]
        for phase in ['setup','render','meeting','library','complete']:
            value={'schema':1,'suite':'PointerTests','test':'testTrustedOSPointer()','nonce':self.nonce,'bundle':'org.knapsack.qa.pointercanary','phase':phase,'foreground':True,'windowVisible':True}
            if phase in ['meeting','library']:
                value['nativeReceipt']=self.nonce+'|'+phase+'|trusted-down-up-click|foreground';value['destination']='Synthetic '+phase.capitalize()+' destination'
            if phase=='render':value['nativeRender']=self.nonce+'|render-ready'
            (self.folder/(phase+'.json')).write_text(json.dumps(value))
            self.manifest[0]['attachments'].append({'exportedFileName':phase+'.json','suggestedHumanReadableName':'knapsack-pointer-'+phase+'.json','isAssociatedWithFailure':False})
    def check(self,exit_code=0):return verify(self.summary,self.tests,self.manifest,self.folder,exit_code)
    def alter(self,phase,**kw):
        p=self.folder/(phase+'.json');value=json.loads(p.read_text());value.update(kw);p.write_text(json.dumps(value))
    def test_exact_native_receipts_pass(self):self.assertEqual(self.check()['status'],'native_automated_pass')
    def test_observed_xcresult_suffix_is_strictly_supported(self):
        for a in self.manifest[0]['attachments']:
            a['suggestedHumanReadableName']=a['suggestedHumanReadableName'].replace('.json','_0_998317B1-3E78-4B79-AD7D-2DBDDFAF3902.json')
        self.assertEqual(self.check()['status'],'native_automated_pass')
        for bad in ['knapsack-pointer-setup_other.json','knapsack-pointer-setup_0_not-a-uuid.json','knapsack-pointer-setup_../x.json','knapsack-pointer-unknown_0_998317B1-3E78-4B79-AD7D-2DBDDFAF3902.json']:
            old=self.manifest[0]['attachments'][0]['suggestedHumanReadableName'];self.manifest[0]['attachments'][0]['suggestedHumanReadableName']=bad
            with self.assertRaises(InvalidEvidence):self.check()
            self.manifest[0]['attachments'][0]['suggestedHumanReadableName']=old
    def test_render_failure_is_not_pointer_success(self):
        self.alter('render',nativeRender=self.nonce+'|provisional-failed')
        with self.assertRaisesRegex(InvalidEvidence,'render-ready'):self.check()
    def test_failed_setup_is_failure_not_environment_unavailable(self):
        self.summary.update(result='Failed',passedTests=0,failedTests=1);self.case['result']='Failed';self.manifest=[]
        with self.assertRaisesRegex(InvalidEvidence,'passing-test'):self.check(65)
    def test_no_native_test_is_unavailable(self):
        self.summary.update(totalTestCount=0,passedTests=0);self.tests={'testNodes':[]}
        self.assertEqual(self.check(65)['status'],'unavailable')
    def test_skip_extra_or_wrong_suite_refuses(self):
        for mode in ['skip','extra','suite','case','nonzero']:
            summary=copy.deepcopy(self.summary);tests=copy.deepcopy(self.tests)
            if mode=='skip':summary.update(passedTests=0,skippedTests=1)
            if mode=='extra':summary.update(totalTestCount=2,passedTests=2)
            if mode=='suite':tests['testNodes'][0]['name']='Other'
            if mode=='case':tests['testNodes'][0]['children'][0]['children'][0]['nodeIdentifier']='Other/testTrustedOSPointer()'
            with self.assertRaises(InvalidEvidence):verify(summary,tests,self.manifest,self.folder,1 if mode=='nonzero' else 0)
    def test_stale_or_untrusted_receipt_refuses(self):
        for change in [{'nonce':'b'*32},{'nativeReceipt':'programmatic'},{'foreground':False},{'destination':'wrong'}]:
            path=self.folder/'meeting.json';original=path.read_text();self.alter('meeting',**change)
            with self.assertRaises(InvalidEvidence):self.check()
            path.write_text(original)
    def test_missing_duplicate_cross_test_and_path_refuse(self):
        for mode in ['missing','duplicate','cross-test','path']:
            manifest=copy.deepcopy(self.manifest)
            if mode=='missing':manifest[0]['attachments'].pop()
            if mode=='duplicate':manifest[0]['attachments'].append(manifest[0]['attachments'][0])
            if mode=='cross-test':manifest[0]['testIdentifier']='Other/testTrustedOSPointer()'
            if mode=='path':manifest[0]['attachments'][0]['exportedFileName']='../outside.json'
            with self.assertRaises(InvalidEvidence):verify(self.summary,self.tests,manifest,self.folder,0)
if __name__=='__main__':unittest.main()
