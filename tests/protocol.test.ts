import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
function expect(value:unknown){return {toEqual:(other:unknown)=>assert.deepEqual(value,other),toBe:(other:unknown)=>assert.equal(value,other),toBeGreaterThan:(other:number)=>assert.ok(Number(value)>other),toHaveLength:(n:number)=>assert.equal((value as unknown[]).length,n),toBeUndefined:()=>assert.equal(value,undefined),toContain:(part:unknown)=>assert.ok((value as string).includes(part as string))};}
import {criteria,evaluateEligibility,enrollmentAction,trialWindow,indicatorGroups,groupCheck,visDrugs,calculateVis,check,evaluate,update,type Answers} from '../src/protocol';
function complete(){const a:Answers={start:'2026-01-01T10:00',end:'2026-01-01T11:00'};for(const c of criteria)a[c.id]=c.kind==='number'?String(c.id==='flow'?2:c.id==='lac'?1:c.id==='cvp'?10:c.id==='vis'?10:c.id==='pf'?250:(c.min??0)+1):c.kind==='exclusion'?'no':c.kind==='consent'?'self':'yes';return a;}
describe('資料に基づく判定',()=>{
it('全項目入力でも資料未確定なら候補を出さない',()=>{const r=evaluate(complete(),['テスト用の未確認条件']);expect(r.statuses).toEqual(['情報不足または原資料の確認が必要']);});
it('候補表示は原資料の未確定事項ゼロの場合のみ（テスト用）',()=>expect(evaluate(complete(),[]).statuses).toEqual(['組入れ候補：担当医の最終確認へ']));
for(const c of criteria.filter(c=>c.stage===1))it(c.id+'の選択未達／除外該当',()=>{expect(evaluate({...complete(),[c.id]:c.kind==='exclusion'?'yes':'no'}).excluded.length).toBeGreaterThan(0);});
for(const value of ['', 'unknown'])it('未回答／不明 '+value,()=>expect(evaluate({...complete(),adult:value}).missing.length).toBeGreaterThan(0));
for(const c of criteria.filter(c=>c.kind==='number'&&c.id!=='flow'))for(const bound of ['min','max'] as const){const b=c[bound];if(b!==undefined)it(c.id+' '+bound+' 境界前後',()=>{const strict=bound==='min'?c.strictMin:c.strictMax;expect(check(c,String(b))).toBe(strict?'fail':'pass');expect(check(c,String(b+(bound==='min'?-.001:.001)))).toBe('fail');expect(check(c,String(b+(bound==='min'?.001:-.001)))).toBe('pass');});}
it('欠測・非数値',()=>{const c=criteria.find(c=>c.id==='map')!;for(const v of [undefined,'','unknown','NaN'])expect(check(c,v)).toBe('unknown');});
for(const v of ['unexplained','review','unknown',''])it('未取得は恒久除外にしない '+v,()=>{const r=evaluate({...complete(),consent:v});expect(r.excluded).toHaveLength(0);expect(r.pending.length).toBeGreaterThan(0);});
it('参加拒否',()=>expect(evaluate({...complete(),consent:'refused'}).excluded).toContain('本人または代諾者の参加拒否'));
it('上流変更で後続取消',()=>{const a=update(complete(),'adult','no');expect(a.map).toBeUndefined();expect(a.consent).toBeUndefined();expect(a.start).toBeUndefined();});
it('現在値変更で継続・同意確認取消',()=>{const a=update(complete(),'map','70');expect(a.sustained).toBeUndefined();expect(a.consent).toBeUndefined();});
it('時刻変更で継続確認取消',()=>expect(update(complete(),'start','2026-01-01T10:01').sustained).toBeUndefined());
it('複数の問題を保持',()=>{const r=evaluate({...complete(),adult:'no',map:'59',consent:'review',pf:''});expect(r.statuses).toHaveLength(4);});
it('現値良好でも1時間確認なしなら未達',()=>expect(evaluate({...complete(),sustained:'no'}).unmet.length).toBeGreaterThan(0));
});

describe('VIS計算（配布資料p.2）',()=>{
 const zero=Object.fromEntries(visDrugs.map(d=>[d.id,'0']));
 it('明示的な全ゼロ',()=>expect(calculateVis(zero)).toBe(0));
 it('5剤の係数・単位',()=>expect(calculateVis({norad:'0.1',dobutamine:'3',vasopressin:'0.00002',dopamine:'2',milrinone:'0.25'})).toBe(17.7));
 for(const d of visDrugs)it(d.id+'の空欄は0',()=>{const a={...zero};delete a[d.id];expect(calculateVis(a)).toBe(0);});
 it('不正・負値を拒否',()=>{for(const v of ['-1','NaN','Infinity'])expect(calculateVis({...zero,norad:v})).toBe(null);});
 for(const [dose,expected] of [['0.29999','pass'],['0.3','fail'],['0.30001','fail']])it('VIS30境界 '+dose,()=>{const v=calculateVis({...zero,norad:dose});expect(check(criteria.find(c=>c.id==='vis')!,String(v))).toBe(expected);});
});

describe("確認済み流量条件",()=>{for(const [v,expected] of [[1.8,"fail"],[1.999,"fail"],[2,"pass"],[2.001,"fail"],[2.2,"fail"]] as const)it(String(v)+" L/min",()=>expect(check(criteria.find(c=>c.id==="flow")!,String(v))).toBe(expected));});

describe("確認済みエコー／SG境界",()=>{for(const [id,value] of [["lvef",20],["ci",2.2],["tapse",10],["papi",0.9]] as const)it(id+"は境界値を含む",()=>{const c=criteria.find(c=>c.id===id)!;expect(check(c,String(value))).toBe("pass");expect(check(c,String(value-0.001))).toBe("fail");expect(check(c,String(value+0.001))).toBe("pass");expect(c.unresolved).toBe(false);});});

describe('エコー／SG：行内OR・行間AND',()=>{
 const states={pass:'100',fail:'0',missing:'',unknown:'unknown'};
 for(const g of indicatorGroups)for(const [s1,v1] of Object.entries(states))for(const [s2,v2] of Object.entries(states))it(g.id+' '+s1+'/'+s2,()=>{
  const a={...complete(),[g.members[0]]:v1,[g.members[1]]:v2};
  const expected=s1==='pass'||s2==='pass'?'pass':s1==='fail'&&s2==='fail'?'fail':'unknown';
  expect(groupCheck(a,g)).toBe(expected);
  const r=evaluate(a,[]);
  expect(r.unmet.some(t=>t.startsWith(g.question))).toBe(expected==='fail');
  expect(r.missing.some(t=>t.startsWith(g.question))).toBe(expected==='unknown');
 });
 it('両行で一方達成なら他方欠測可',()=>expect(evaluate({...complete(),lvef:'20',ci:'',tapse:'',papi:'0.9'},[]).statuses).toEqual(['組入れ候補：担当医の最終確認へ']));
 it('左行達成でも右行未達なら未達',()=>expect(evaluate({...complete(),lvef:'20',ci:'',tapse:'9',papi:'0.8'},[]).statuses).toEqual(['現時点で離脱試験可能な状態の条件未達']));
 it('全指標欠測は不足',()=>expect(evaluate({...complete(),lvef:'',ci:'',tapse:'',papi:''},[]).missing).toHaveLength(2));
 it('代替指標変更で継続確認・同意確認取消',()=>{const a=update({...complete(),lvef:'20',ci:''},'lvef','19');expect(a.sustained).toBeUndefined();expect(a.consent).toBeUndefined();expect(groupCheck(a,indicatorGroups[0])).toBe('unknown');});
});

describe('離脱試験の開始期限：組入後24時間',()=>{
 const enrolled='2026-01-01T10:00';
 for(const [trialStart,status] of [['2026-01-02T09:59','within'],['2026-01-02T10:00','within'],['2026-01-02T10:01','overdue'],['2026-01-01T09:59','invalid']])it(trialStart,()=>expect(trialWindow({enrolled,trialStart}).status).toBe(status));
 it('組入前の未入力を不足にしない',()=>{expect(trialWindow({}).status).toBe('not-entered');expect(evaluate(complete(),[]).statuses).toEqual(['組入れ候補：担当医の最終確認へ']);});
 it('組入だけでJST期限表示',()=>expect(trialWindow({enrolled}).deadline).toBe('2026/01/02 10:00 JST'));
 it('起算点欠測',()=>expect(trialWindow({trialStart:'2026-01-02T10:00'}).status).toBe('missing'));
 it('未来・不正な組入日時',()=>{for(const v of ['2099-01-01T10:00','invalid'])expect(trialWindow({enrolled:v}).status).toBe('invalid');});
 it('超過は基本適格性の恒久除外にしない',()=>{const r=evaluate({...complete(),enrolled,trialStart:'2026-01-02T10:01'},[]);expect(r.excluded).toHaveLength(0);expect(r.pending).toHaveLength(1);});
 it('起算点変更でも状態と同意確認は保持',()=>{const a=update(complete(),'enrolled',enrolled);expect(a.consent).toBe('self');expect(a.sustained).toBe('yes');});
 it('上流変更で期限の入力を取消',()=>{const a=update({...complete(),enrolled,trialStart:'2026-01-02T10:00'},'flow','2');expect(a.enrolled).toBeUndefined();expect(a.trialStart).toBeUndefined();});
});


it('削除指定の確認を要求しない',()=>{
 expect(criteria.some(c=>[c.question,c.rule,c.note].some(t=>t.includes('施設使用許可')||t.includes('施設の使用許可')||t.includes('研究計画書Ver2')))).toBe(false);
 expect(evaluate(complete()).issues.some(t=>t.includes('施設')||t.includes('研究計画書'))).toBe(false);
});

describe('組入基準と次の実務',()=>{
 it('必要な入力を満たせば候補表示',()=>expect(evaluate(complete()).statuses).toEqual(['組入れ候補：担当医の最終確認へ']));
 it('代諾後手続きの項目を要求しない',()=>expect(criteria.some(c=>c.id==='additional')).toBe(false));
 it('代諾者同意でも追加確認を一律要求しない',()=>expect(evaluate({...complete(),consent:'proxy'}).statuses).toEqual(['組入れ候補：担当医の最終確認へ']));
 it('組入時の連絡先を明記',()=>expect(enrollmentAction).toBe('Step 1で適格となったら、同意取得前に大政へ必ず連絡してください。'));
});

describe('画面コメントの反映',()=>{
 it('ヘパリンは禁忌のみを問う',()=>{const c=criteria.find(c=>c.id==='heparin')!;expect(c.question).toBe('未分画ヘパリンが禁忌である');expect(c.note).toContain('現在投与していないだけでは除外しません');expect(c.note).toContain('APTT');});
 it('禁忌に該当した場合のみ対象外',()=>{expect(evaluate({...complete(),heparin:'yes'}).excluded).toHaveLength(1);expect(evaluate({...complete(),heparin:'no'}).excluded).toHaveLength(0);});
 it('不要な3項目を判定に要求しない',()=>{expect(criteria.some(c=>['document','edc','final'].includes(c.id))).toBe(false);const r=evaluate({...complete(),document:'no',edc:'no',final:'no'});expect(r.statuses).toEqual(['組入れ候補：担当医の最終確認へ']);});
 it('組入確認内の同意区分は同意状況のみ',()=>expect(criteria.filter(c=>c.stage===3).map(c=>c.id)).toEqual(['consent']));
});

describe('プロトコールStep 1の適格性と連絡順序',()=>{
 it('組入確認の全項目はプロトコールStep 1',()=>expect(criteria.every(c=>c.protocolStep===1)).toBe(true));
 for(const consent of ['', 'unexplained','review','self','proxy'])it('同意前でも臨床適格性を判定 '+consent,()=>{const r=evaluateEligibility({...complete(),consent});expect(r.eligible).toBe(true);expect(r.label).toBe('適格：組入れ候補');});
 it('同意済みでも臨床条件未達は適格にしない',()=>expect(evaluateEligibility({...complete(),map:'60'}).eligible).toBe(false));
 it('継続確認なしは保留、日時入力は不要',()=>{const a=complete();delete a.start;delete a.end;expect(evaluateEligibility(a).eligible).toBe(true);delete a.sustained;expect(evaluateEligibility(a).eligible).toBe(false);});
 it('空欄の薬剤だけを0とし他の欠測を正常にしない',()=>{expect(calculateVis({})).toBe(0);expect(calculateVis({norad:'0.06',dobutamine:'1'})).toBe(7);expect(evaluateEligibility({...complete(),map:''}).eligible).toBe(false);});
 it('不明投与量を達成にしない',()=>expect(calculateVis({norad:'unknown'})).toBe(null));
 it('空欄を0にするのは薬剤欄のみ',()=>expect(check(criteria.find(c=>c.id==='vis')!,'')).toBe('unknown'));
});
