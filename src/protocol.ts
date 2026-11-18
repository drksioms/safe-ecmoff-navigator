export const version='参照資料：第1回班会議 2026/10/28（優先）／配布資料 KM081426。説明同意文書ver 2.0';
export const blockers:string[]=[];
// ユーザーによる実務上の指定（2026-11-15）。研究の医学的適格基準とは別。
export const enrollmentAction='Step 1で適格となったら、同意取得前に大政へ必ず連絡してください。';
export type Answers=Record<string,string>;
export type Criterion={id:string;question:string;protocolStep:1;stage:1|2|3;kind:'inclusion'|'exclusion'|'number'|'confirmation'|'consent';unit:string;rule:string;required:boolean;source:string;note:string;unresolved:boolean;min?:number;max?:number;strictMin?:boolean;strictMax?:boolean};
const meeting='SAFE_ECMOFF_班会議①_KM102626.pdf（表紙 2026/10/28、版・承認情報なし）';
const a=(id:string,question:string,stage:1|2|3,kind:Criterion['kind'],rule:string,page:number,note='',unresolved=false):Criterion=>({id,question,protocolStep:1,stage,kind,rule,source:`${meeting} PDF p.${page}`,unit:'',required:true,note,unresolved});
// Step 1の流量条件。表示と判定の共通定義。2026-11-18ユーザー確認。
export const readinessFlow={min:1.8,max:2.2,label:'2.0±0.2',unit:'L/min'} as const;
export const criteria:Criterion[]=[
a('adult','同意取得時の年齢が18歳以上である',1,'inclusion','18歳以上',5),
a('peripheral','Peripheral V-A ECMOからの離脱を検討している',1,'inclusion','Peripheral V-A ECMO',5),
...[
['newMcs','ECMO抜去時に新規MCS導入を予定している','既存のImpella・IABP等の併用と混同しない。'],
['hybrid','Hybrid ECMOが導入されている',''],
['cause','指定された原因でECMOが導入された','低体温、外傷、薬物中毒、大動脈解離、大動脈瘤、頭蓋内疾患、溺水、窒息。'],
['heparin','未分画ヘパリンが禁忌である','禁忌となる患者が除外対象。現在投与していないだけでは除外しません。カテーテル治療後にAPTTが延長し、未投与の場合も、それだけで除外しません。'],
['pregnancy','妊娠中または妊娠の可能性がある','資料の対象：女性。該当の有無を医療者が確認。'],
['withdrawal','治療撤退のためにECMOを抜去する','脳予後不良のみで自動除外しない。'],
['previous','一度、本研究に組み入れられている',''],
['inappropriate','担当医が研究参加を不適切と判断している','']
].map(([id,q,n])=>a(id,q,1,'exclusion','該当で対象外',5,n)),
...[
['flow','観察時のECMO流量',readinessFlow.unit,readinessFlow.min,readinessFlow.max,false,false,readinessFlow.label,false],
['map','MAP','mmHg',60,undefined,true,false,'> 60',false],
['lac','乳酸','mmol/L',undefined,2,false,true,'< 2.0',false],
['cvp','CVP','mmHg',undefined,18,false,true,'< 18',false],
['vis','VIS','点',undefined,30,false,true,'< 30',false],
['pf','P/F ratio（右腕のAline）','比',200,undefined,true,false,'> 200',false],
['lvef','LVEF','%',20,undefined,false,false,'≧20',false],
['ci','CI','L/min/m²',2.2,undefined,false,false,'≧2.2',false],
['tapse','TAPSE','mm',10,undefined,false,false,'≧10',false],
['papi','PAPi','比',0.9,undefined,false,false,'≧0.9',false]
].map(([id,q,unit,min,max,sm,sx,rule,u])=>({...a(String(id),String(q),2,'number',String(rule),8,'現在値だけで継続達成としません。左心機能はLVEFまたはCI、右心機能はTAPSEまたはPAPi。両行が必要です。',Boolean(u)),...(String(id)==='flow'?{source:'SAFE-ECMOFF Trial _配布資料_KM081426.pdf（正式版記載なし）PDF p.1／2026-11-18ユーザー確認'}:{}),unit:String(unit),min:min as number|undefined,max:max as number|undefined,strictMin:Boolean(sm),strictMax:Boolean(sx),required:!['lvef','ci','tapse','papi'].includes(String(id))})),
a('pulse','拍動性波形を認める',2,'confirmation','認める',8,'原文：Pulsatile atrial waveform'),
a('vt','VT/VFの有無',2,'exclusion','なし',8),
a('valve','重度の弁膜症の有無',2,'exclusion','なし',8),
a('sustained','指定流量下で全共通指標を1時間以上、継続して満たしたことを医療者が確認した',2,'confirmation','全指標 AND 1時間以上',8,'時刻や現在値だけでは達成としない。未確定条件の確認は別途必要。'),
a('consent','説明・同意の状況',3,'consent','本人または代諾者から同意',9,'未説明や確認中は手続き未完了。本人または代諾者の同意取得を確認します。',false),
];
export function check(c:Criterion,v:string|undefined):'pass'|'fail'|'unknown'{
 if(!v||v==='unknown')return 'unknown';
 if(c.kind==='number'){const n=Number(v);if(!Number.isFinite(n))return 'unknown';if((c.min!==undefined&&(c.strictMin?n<=c.min:n<c.min))||(c.max!==undefined&&(c.strictMax?n>=c.max:n>c.max)))return 'fail';return 'pass';}
 if(c.kind==='consent')return ['self','proxy'].includes(v)?'pass':v==='refused'?'fail':'unknown';
 return v===(c.kind==='exclusion'?'no':'yes')?'pass':'fail';
}
export function update(a:Answers,id:string,v:string):Answers{const stage=['enrolled','trialStart'].includes(id)?3:criteria.find(c=>c.id===id)?.stage??2;const next={...a,[id]:v};for(const c of criteria)if(c.stage>stage||((stage===2)&&c.id==='sustained'&&id!=='sustained'))delete next[c.id];if(stage===1){delete next.start;delete next.end;}if(stage<3){delete next.enrolled;delete next.trialStart;}return next;}
export const indicatorGroups=[
 {id:'left',question:'左心機能',members:['lvef','ci'],rule:'LVEF ≧20% または CI ≧2.2 L/min/m²'},
 {id:'right',question:'右心機能',members:['tapse','papi'],rule:'TAPSE ≧10 mm または PAPi ≧0.9'}
];
export function groupCheck(a:Answers,g:typeof indicatorGroups[number]):'pass'|'fail'|'unknown'{
 const states=g.members.map(id=>check(criteria.find(c=>c.id===id)!,a[id]));
 return states.includes('pass')?'pass':states.every(s=>s==='fail')?'fail':'unknown';
}
export function evaluate(a:Answers,issues=blockers,scope:'full'|'eligibility'='full'){const excluded:string[]=[],unmet:string[]=[],missing:string[]=[],pending:string[]=[];
 for(const c of criteria){if(scope==='eligibility'&&c.stage===3)continue;if(indicatorGroups.some(g=>g.members.includes(c.id)))continue;const s=check(c,a[c.id]);if(s==='unknown'){if(c.required)(c.stage===3?pending:missing).push(c.question+'：'+(!a[c.id]?'未回答':'不明／確認中'));}else if(s==='fail'){(c.stage===1?excluded:c.stage===2?unmet:pending).push(c.question+(c.stage===1&&c.kind==='exclusion'?'：除外条件に該当':'：条件未達'));}}
 for(const g of indicatorGroups){const s=groupCheck(a,g);if(s==='fail')unmet.push(g.question+'：同じ行の両指標が条件未達（'+g.rule+'）');if(s==='unknown')missing.push(g.question+'：条件を満たす指標が未確認（'+g.rule+'）');}
 if(scope==='full'){const window=trialWindow(a);if(window.status==='invalid'||window.status==='missing')missing.push(window.message);if(window.status==='overdue')pending.push(window.message);}
 if(scope==='full'&&a.consent==='refused')excluded.push('本人または代諾者の参加拒否');
 const statuses=[...(excluded.length?['選択・除外基準上の対象外']:[]),...(unmet.length?['現時点で離脱試験可能な状態の条件未達']:[]),...(pending.length?['同意・登録準備が未完了']:[]),...(missing.length||issues.length?['情報不足または原資料の確認が必要']:[])];if(!statuses.length)statuses.push('組入れ候補：担当医の最終確認へ');return {statuses,excluded,unmet,missing,pending,issues};}

// 配布資料 KM081426 PDF p.2 薬剤欄。掲載されない薬剤・係数は追加しない。
export const visDrugs=[
 {id:'norad',label:'ノルアドレナリン',unit:'μg/kg/min',factor:100},
 {id:'dobutamine',label:'ドブタミン',unit:'μg/kg/min',factor:1},
 {id:'vasopressin',label:'バソプレシン',unit:'U/kg/min',factor:10000},
 {id:'dopamine',label:'ドパミン',unit:'μg/kg/min',factor:1},
 {id:'milrinone',label:'ミルリノン',unit:'μg/kg/min',factor:10}
];
export function calculateVis(doses:Answers):number|null{
 let total=0;
 for(const d of visDrugs){const raw=doses[d.id];const n=!raw?.trim()?0:Number(raw);if(!Number.isFinite(n)||n<0)return null;total+=n*d.factor;}
 return Number.isFinite(total)?Math.round(total*1e8)/1e8:null;
}

export function trialWindow(a:Answers):{status:'not-entered'|'missing'|'invalid'|'within'|'overdue'|'deadline';message:string;deadline?:string}{
 if(!a.enrolled&&!a.trialStart)return {status:'not-entered',message:'組入前の準備段階では日時入力は不要です。正式な組入後に確認してください。'};
 if(!a.enrolled)return {status:'missing',message:'期限確認には組入日時が必要です。'};
 const start=Date.parse(a.enrolled+'+09:00');
 if(!Number.isFinite(start))return {status:'invalid',message:'組入日時を確認してください。'};
 if(start>Date.now())return {status:'invalid',message:'実際の組入日時が未来になっています。'};
 const end=start+24*60*60*1000;
 const deadline=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(end)+' JST';
 if(!a.trialStart)return {status:'deadline',message:'離脱試験の開始期限：'+deadline,deadline};
 const trial=Date.parse(a.trialStart+'+09:00');
 if(!Number.isFinite(trial)||trial<start)return {status:'invalid',message:'試験開始時刻が組入日時より前、または不正です。',deadline};
 return {status:trial<=end?'within':'overdue',message:trial<=end?'入力した試験開始時刻は組入後24時間以内です。':'入力した試験開始時刻は組入後24時間を超えています。原資料と研究担当者に対応を確認してください。',deadline};
}

// 同意・登録準備とは分けて、STEP 1–2の適格性を判定する。
export function evaluateEligibility(a:Answers){
 const r=evaluate(a,blockers,'eligibility');
 const eligible=!r.excluded.length&&!r.unmet.length&&!r.missing.length&&!r.issues.length;
 const label=r.excluded.length?'不適格：選択・除外基準上の対象外':r.unmet.length?'現時点では不適格：離脱試験可能な状態の条件未達':!eligible?'判定保留：情報不足':'適格：組入れ候補';
 return {...r,eligible,label};
}
