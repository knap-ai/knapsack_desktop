"""Strict xcresult/attachment verification. No log scraping or receipt fabrication."""
import json,pathlib,re
SUITE='PointerTests';TEST='testTrustedOSPointer()';BUNDLE='org.knapsack.qa.pointercanary'
class InvalidEvidence(ValueError):pass

def verify(summary,tests,manifest,folder,exit_code):
    def reject(reason):raise InvalidEvidence(reason)
    counts={k:summary.get(k) for k in ['totalTestCount','passedTests','failedTests','skippedTests','expectedFailures']}
    if any(type(v) is not int for v in counts.values()):reject('missing-test-counts')
    nodes=[]
    def walk(rows,ancestors=()):
        if not isinstance(rows,list):reject('invalid-test-tree')
        for row in rows:
            if not isinstance(row,dict):reject('invalid-test-node')
            if row.get('nodeType')=='Test Case':nodes.append((row,ancestors))
            walk(row.get('children',[]),ancestors+((row.get('nodeType'),row.get('name')),))
    walk(tests.get('testNodes'))
    if counts['totalTestCount']==0 and not nodes:
        return {'status':'unavailable','reason':'no-native-test-executed'}
    if len(nodes)!=1 or counts!={'totalTestCount':1,'passedTests':1,'failedTests':0,'skippedTests':0,'expectedFailures':0}:
        reject('exactly-one-unskipped-passing-test-required')
    case,ancestry=nodes[0]
    if case.get('name')!=TEST or ('Test Suite',SUITE) not in ancestry or ('UI test bundle',SUITE) not in ancestry:
        reject('wrong-native-test-suite')
    identifier=case.get('nodeIdentifier','')
    if identifier not in [SUITE+'/'+TEST,SUITE+'.'+SUITE+'/'+TEST]:reject('wrong-native-test-identifier')
    if case.get('result')!='Passed' or summary.get('result')!='Passed' or exit_code!=0:reject('native-test-did-not-pass')
    if not isinstance(manifest,list) or len(manifest)!=1:reject('wrong-attachment-test-count')
    entry=manifest[0]
    if entry.get('testIdentifier')!=identifier:reject('attachment-test-mismatch')
    if not isinstance(entry.get('attachments'),list):reject('missing-attachments')
    receipts={};folder=pathlib.Path(folder).resolve()
    for item in entry['attachments']:
        name=item.get('suggestedHumanReadableName','')
        if not name.startswith('knapsack-pointer-'):continue # XCTest's own synthetic diagnostics
        match=re.fullmatch(r'knapsack-pointer-(setup|meeting|library|complete)(?:\.json)?',name)
        if not match:reject('unknown-receipt-name')
        phase=match.group(1)
        if phase in receipts or item.get('isAssociatedWithFailure') is not False:reject('duplicate-or-failure-receipt')
        file=item.get('exportedFileName','')
        if not file or pathlib.Path(file).name!=file:reject('invalid-attachment-path')
        path=folder/file
        if path.is_symlink() or not path.is_file() or path.stat().st_size>16384:reject('invalid-attachment-file')
        try:payload=json.loads(path.read_text())
        except (ValueError,OSError):reject('invalid-attachment-json')
        if payload.get('schema')!=1 or payload.get('suite')!=SUITE or payload.get('test')!=TEST or payload.get('bundle')!=BUNDLE or payload.get('phase')!=phase or payload.get('foreground') is not True or payload.get('windowVisible') is not True:reject('invalid-receipt-binding')
        nonce=payload.get('nonce','')
        if not isinstance(nonce,str) or not re.fullmatch('[a-f0-9]{32}',nonce):reject('invalid-nonce')
        if phase in ['meeting','library'] and payload.get('nativeReceipt')!=nonce+'|'+phase+'|trusted-down-up-click|foreground':reject('untrusted-or-mismatched-pointer-receipt')
        if phase in ['meeting','library'] and payload.get('destination')!='Synthetic '+phase.capitalize()+' destination':reject('missing-destination-proof')
        receipts[phase]=payload
    if set(receipts)!={'setup','meeting','library','complete'}:reject('missing-native-receipt')
    if len({v['nonce'] for v in receipts.values()})!=1:reject('stale-nonce')
    return {'status':'native_automated_pass','reason':'one-passing-xctest-and-two-bound-trusted-pointer-receipts'}
