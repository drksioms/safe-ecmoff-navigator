import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {criteria,evaluateEligibility,enrollmentAction,trialWindow,indicatorGroups,groupCheck,visDrugs,calculateVis,version,check,evaluate,update,type Answers,type Criterion} from './protocol';
import {recordingGroups,flowRecords,pcrtoRecords,failureRecord} from './recording';
import './style.css';
import {ProtocolOverview,ProtocolStepSummary} from './ProtocolOverview';
const steps=[{title:'組入れ',short:'適格性・組入れ'},{title:'離脱試験',short:'離脱試験・記録'},{title:'ランダム割付',short:'割付・PCRTO'},{title:'ECMO離脱',short:'離脱後の記録'}];
function App(){
 const [step,setStep]=useState(0),[a,setA]=useState<Answers>({}),[doses,setDoses]=useState<Answers>({}),[message,setMessage]=useState('');
 const answers:Answers={...a,vis:a.vis??String(calculateVis(doses)??'unknown')};
 const eligibility=evaluateEligibility(answers),result=evaluate(answers);
 const change=(id:string,v:string)=>{setA(old=>update(old,id,v));setMessage('入力を反映しました。適格性を再判定しています。');};
 const go=(n:number)=>{setStep(n);setMessage('');window.scrollTo(0,0);};
 const resetState=()=>{setA(old=>Object.fromEntries(Object.entries(old).filter(([id])=>criteria.find(c=>c.id===id)?.stage===1)));setDoses({});setMessage('状態と同意の確認を取り消しました。Step 1で再評価してください。');};
function field(c:Criterion){const v=answers[c.id],status=check(c,v);return <section className="card" key={c.id}><div className="row"><span className="tag">{c.kind==='exclusion'?(c.stage===1?'除外条件':'現時点の状態条件'):c.required?'必須確認':'同じ行でいずれか必要'}</span><span className={'state '+status}>{!v?'○ 未回答':v==='unknown'?'? 不明':c.unresolved?'△ 資料確認が必要':status==='pass'?'✓ 条件一致':status==='fail'?'! 条件未達':'… 確認中'}</span></div><h3><label htmlFor={c.id}>{c.question}</label></h3>{['cause','heparin'].includes(c.id)&&<p>{c.note}</p>}<p className="rule">基準：{c.rule}{c.unit&&' '+c.unit}</p>{c.id==='vis'&&<div className="vis-calculator"><h3>薬剤の投与量から自動計算</h3><p>空欄は0として計算します。体重換算後の投与量を入力してください。</p>{visDrugs.map(d=><label className="date" key={d.id}>{d.label}<div className="number"><input aria-label={d.label+'投与量'} placeholder="0" type="number" min="0" step="any" inputMode="decimal" value={doses[d.id]??''} onChange={e=>{const next={...doses,[d.id]:e.target.value};setDoses(next);change('vis',String(calculateVis(next)??'unknown'));}}/><span>{d.unit}</span></div>{doses[d.id]&&Number(doses[d.id])<0&&<p className="error">0以上の投与量を入力してください。</p>}</label>)}<p><strong>VIS：{v==='unknown'?'不明／投与量を確認':v+' 点'}</strong> ／基準 &lt;30</p><p>試験中のVISの変化は、組入前のVISとは別に確認します。</p><button aria-pressed={v==='unknown'} onClick={()=>change('vis','unknown')}>投与量が不明</button></div>}{c.id==='vis'?null:c.kind==='number'?<div className="number"><input id={c.id} type="number" step="any" inputMode="decimal" value={v==='unknown'?'':v??''} onChange={e=>change(c.id,e.target.value)}/><span>{c.unit}</span><button aria-pressed={v==='unknown'} onClick={()=>change(c.id,'unknown')}>不明</button></div>:<fieldset><legend className="sr-only">{c.question}</legend>{(c.kind==='consent'?[['unexplained','未説明'],['review','確認中'],['self','本人同意取得済み'],['proxy','代諾者同意取得済み'],['refused','参加拒否'],['unknown','不明']]:[['yes',c.stage===2&&c.kind==='exclusion'?'あり':c.kind==='exclusion'?'該当する':'はい'],['no',c.stage===2&&c.kind==='exclusion'?'なし':c.kind==='exclusion'?'該当しない':'いいえ'],['unknown','不明']]).map(([value,label])=><label className={'choice '+(v===value?'selected':'')} key={value}><input type="radio" name={c.id} checked={v===value} onChange={()=>change(c.id,value)}/>{label}</label>)}</fieldset>}{v&&status==='fail'&&<p className="error">! {c.stage===1?'選択・除外基準上の対象外に該当します。':c.stage===2?(indicatorGroups.some(g=>g.members.includes(c.id))?'この指標は未達です。同じ行のもう一方で満たせるか確認してください。':'現時点で条件未達です。'):'同意・登録準備を確認してください。'}</p>}<details><summary>補足{c.unresolved?' · 未確定事項あり':''}</summary><p>{c.note||'原資料と現在の患者の状態を確認してください。'}</p></details></section>}
async function copy(){const text=['研究組入れ確認用・正式登録未実施',version,...result.statuses,enrollmentAction,`組入日時（JST）：${a.enrolled??'未入力'}／試験開始予定・実績（JST）：${a.trialStart??'未入力'}`,trialWindow(a).message,trialWindow(a).deadline??'',...result.excluded,...result.unmet,...result.pending,...result.missing,...result.issues,...criteria.map(c=>`${c.question}：${answers[c.id]??'未回答'} ${c.unit}／基準 ${c.rule}／${c.source}`),'継続条件は医療者が確認'].join('\n');try{await navigator.clipboard.writeText(text);setMessage('確認内容をコピーしました。外部への自動送信は行っていません。');}catch{setMessage('コピーできませんでした。ブラウザのクリップボード権限を確認してください。');}}

return <><header><button className="brand brand-button" onClick={()=>go(0)}><span className="brand-lockup"><span className="brand-kicker">S A F E <svg aria-hidden="true" viewBox="0 0 108 22" fill="none"><path d="M1 12h23l5-5 5 10 6-15 5 18 5-8h57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span><strong className="brand-wordmark">ECM<span>OFF</span></strong><small>NAVIGATOR</small></span></button><span className="header-caption">研究組入れ支援</span></header>
<main>{step===0?<><div className="hero"><p className="eyebrow">SAFE-ECMOFF NAVIGATOR</p><h1>研究のStepに沿って、<br/>組入れから記録まで。</h1><p>まず、離脱試験可能な状態と適格性を確認します。適格となったら大政へ連絡し、同意・組入れへ進みます。</p><button className="primary" onClick={()=>go(1)}>Step 1：適格性を確認する →</button><p className="muted">患者氏名・患者IDは入力しないでください。入力は保存されず、再読み込みで消えます。</p></div><ProtocolOverview/><button className="primary overview-start" onClick={()=>go(1)}>Step 1：適格性を確認する →</button></>:<>
<nav className="progress" aria-label="プロトコールのStep">{steps.map((s,i)=><button key={s.title} aria-current={step===i+1?'step':undefined} className={step===i+1?'active':''} onClick={()=>go(i+1)}><b>{i+1}</b><span>{s.short}</span></button>)}</nav>
<div className="step-heading"><p className="eyebrow">PROTOCOL <span>STEP {step} / 4</span></p><h1>{steps[step-1].title}</h1></div>
<ProtocolStepSummary step={step}/>
{step===1&&<>
<p>離脱試験可能な状態と適格性を確認 → <strong>適格となったら大政へ連絡</strong> → 説明・同意 → EDCで組入れ。</p>
<h2 className="section-heading">基本適格性</h2>{criteria.filter(c=>c.stage===1).map(field)}
<h2 className="section-heading">離脱試験可能な状態</h2><p>ECMO 2.0 L/minで全共通指標を1時間以上満たしたことを確認します。</p>
<section className="card"><h3>心機能は左右それぞれ確認</h3><p>各行で一方を満たせば、その行のもう一方は未測定でもかまいません。左右の両方が必要です。</p>{indicatorGroups.map(g=><p key={g.id}><b>{g.question}：</b>{g.rule}<br/>{groupCheck(answers,g)==='pass'?'✓ 条件を満たす':groupCheck(answers,g)==='fail'?'! 両指標とも未達':'? 条件を満たす指標が未確認'}</p>)}</section>
{criteria.filter(c=>c.stage===2).map(field)}
<section className={'result '+(eligibility.eligible?'result-eligible':eligibility.unmet.length||eligibility.excluded.length?'result-unmet':'result-pending')} aria-live="polite"><p className="eyebrow">STEP 1 · 適格性判定</p><h2>{eligibility.label}</h2>{[...eligibility.excluded,...eligibility.unmet,...eligibility.missing,...eligibility.issues].length>0&&<ul>{[...eligibility.excluded,...eligibility.unmet,...eligibility.missing,...eligibility.issues].map(t=><li key={t}>{t}</li>)}</ul>}<p>入力に基づく組入れ候補の判定です。正式な組入れや離脱の判断を代行しません。</p></section>
{eligibility.eligible&&<section className="notice"><h2>次は、大政へ連絡</h2><p><strong>{enrollmentAction}</strong></p><p>このタイミングで連絡し、その後に説明・同意、正式なEDC組入れへ進んでください。</p></section>}
<h2 className="section-heading">連絡後：説明・同意と組入れ</h2><p>大政への連絡より後の手順です。正式な同意書・同意記録の代わりにはなりません。</p>{criteria.filter(c=>c.stage===3).map(field)}
<section className="card"><h3>組入れの準備状況</h3>{result.pending.map(t=><p key={t}>△ {t}</p>)}{a.consent==='refused'&&<p className="error">参加拒否：組入れの対象外です。</p>}{['self','proxy'].includes(a.consent)&&eligibility.eligible&&<p>✓ 適格性と同意状況を確認しました。正式な組入れはEDCで行ってください。</p>}<p>組入時（ECMO 2.0 L/min）の実測値を印刷済み用紙へ記録し、EDCに入力します。</p></section>
<details className="card"><summary>入力内容を確認</summary>{criteria.map(c=><div className="audit" key={c.id}><b>{c.question}</b><p>{answers[c.id]??'未回答'} {c.unit} ／基準 {c.rule}</p></div>)}</details><button onClick={copy}>確認内容をテキストコピー</button> <button onClick={resetState}>状態悪化・再評価</button>
</>}
{step===2&&<>
<p>同意・正式な組入れの後に行うFlow weaning trialです。印刷済み用紙を手元に準備してください。</p>
<section className="notice"><h2>開始前・30分後・成功判断時に記録</h2><p>試験開始は<strong>組入後24時間以内</strong>。開始30分後の記録と、成功判断時の記録は別々に必要です。</p></section>
<section className="card"><h3>記録するタイミング</h3><ol className="record-timeline">{flowRecords.map(r=><li key={r.id}><strong>{r.title}</strong><p>{r.timing}</p></li>)}</ol></section>
{recordingFields()}
<section className="card"><h3>失敗した場合</h3><p>{failureRecord}</p><p>理由と対応を記録して再評価します。成功するまで過去の達成を引き継ぎません。</p></section>
<section className="card"><h3>開始期限の確認（任意）</h3>{['enrolled','trialStart'].map((id,i)=><label className="date" key={id}>{i?'試験開始予定・実績':'実際の組入日時'} · 日本時間<input type="datetime-local" value={a[id]??''} onInput={e=>change(id,e.currentTarget.value)} onChange={e=>change(id,e.target.value)}/></label>)}<p>{trialWindow(a).message}</p>{trialWindow(a).deadline&&<p>期限：{trialWindow(a).deadline}</p>}</section>
<p>成功判断時の記録を済ませ、成功直後にStep 3の割付へ進みます。</p>
</>}
{step===3&&<>
<section className="notice"><h2>Flow weaning成功直後にEDCで割付</h2><p>成功判断時の実測値を入力して割付を行います。このアプリでは割付しません。</p></section>
<div className="arrow">EDCの割付結果に従って分岐 ↓</div>
<div className="branches recording-branches"><section className="flow-node"><h2>Conventional群</h2><p>従来の離脱試験で終了。Step 4のECMO離脱に向けた評価へ進みます。</p></section><section className="flow-node"><h2>PCRTO追加群</h2><p>PCRTO用の印刷済み用紙で追加評価を記録します。</p><ol className="record-timeline">{pcrtoRecords.map(r=><li key={r.id}><strong>{r.title}</strong><p>{r.timing}</p></li>)}</ol><p>PCRTO失敗時は、PCRTO用紙の失敗日時・理由・対応を記録します。成功判断後にStep 4へ進みます。</p></section></div>
{recordingFields()}
<details className="card"><summary>割付後の再評価・試験省略</summary><p>割付後の試験合計3回失敗、7日間以上経過、Hybrid／Central ECMO移行、医学的に危険と判断する場合には試験を省略できる場合があります。情報収集は継続します。実施・再試行は担当医が判断します。</p></details>
</>}
{step===4&&<>
<section className="card"><h2>離脱可能な状態の評価</h2><p>割付された群の離脱試験をクリアしたら、2日以内にECMOを抜去します。抜去前に状態が悪化した場合は再評価します。</p><p>試験成功・抜去の判断は担当医が行ってください。</p></section>
<section className="notice"><h2>ECMO抜去24時間後にも記録</h2><p>印刷済みの用紙を使い、抜去後24時間のデータを記録してください。</p></section><button onClick={()=>go(1)}>Step 1の入力内容へ戻る</button>
</>}
<div role="status">{message}</div><div className="bottom"><button onClick={()=>go(step-1)}>← {step===1?'ホーム':'Step '+(step-1)}</button>{step<4&&<button className="primary" onClick={()=>go(step+1)}>Step {step+1}の手順へ →</button>}</div>
</>}
<footer><button onClick={()=>{if(window.confirm('入力内容をすべて消去しますか？')){setA({});setDoses({});go(0);}}}>入力をリセット</button><p>Created by Kosei Omasa</p></footer></main></>;
}
function recordingFields(){return <section className="card"><h3>用紙に記録する項目</h3><p>各時点の日時と実測値を印刷済み用紙へ記入します。記録欄の案内であり、すべてを独立した適格条件とするものではありません。</p><ul>{recordingGroups.map(g=><li key={g.title}><strong>{g.title}</strong><p>{g.items}</p></li>)}</ul></section>;}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
