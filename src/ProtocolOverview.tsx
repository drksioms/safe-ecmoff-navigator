import {criteria,indicatorGroups,readinessFlow} from './protocol';
const referenceValue=(id:string)=>{const c=criteria.find(c=>c.id===id)!;return `${c.question} ${c.rule} ${c.unit}`;};

/** 閾値は判定と同じ定義を参照。手順の根拠は内部のprotocol-map.mdに保持。 */
export function ProtocolOverview(){return <section className="protocol-overview" aria-label="組入れを考えるタイミングと研究の早見表">
<div className="overview-intro"><p className="eyebrow">WHEN TO CONSIDER ENROLLMENT</p><h2>いつ、組入れを考える？</h2><p><strong>Peripheral V-A ECMOからの離脱を検討し、離脱試験可能な状態（Readiness-to wean）になったとき。</strong></p><p>ECMO <strong>{readinessFlow.label} {readinessFlow.unit}</strong>で、下の共通指標を<strong>1時間以上すべて満たす</strong>ことを確認します。同意取得時18歳以上・除外条件なしも含め、Step 1で適格性を確認してください。</p></div>
<ol className="protocol-roadmap">{[1,2,3,4].map(step=><ProtocolStepSummary key={step} step={step} asListItem/>)}</ol><p className="muted">各Stepは研究の手順です。組入れ・試験成功・ECMO抜去は担当医が判断します。</p>
</section>;}

/** ホームと各Stepで、同じ条件・記録時点・次の手順を表示する。 */
export function ProtocolStepSummary({step,asListItem=false}:{step:number;asListItem?:boolean}){
const Tag=asListItem?'li':'section';
return <Tag className="roadmap-step step-summary" aria-label={'Step '+step+'のまとめ'}>
{step===1&&<><div className="roadmap-heading"><span className="step-number">01</span><div><span className="roadmap-english">Readiness-to wean</span><h3>離脱試験可能な状態 → 組入れ</h3></div></div>
<div className="threshold-panel"><p className="threshold-title">ECMO {readinessFlow.label} {readinessFlow.unit}で、1時間以上</p><ul className="thresholds">{['map','lac','cvp','vis','pf'].map(id=><li key={id}>{referenceValue(id)}</li>)}<li>拍動性波形あり／VT・VFなし</li><li>重度弁膜症なし</li></ul><div className="heart-thresholds">{indicatorGroups.map(g=><p key={g.id}><strong>{g.question}</strong><br/>{g.rule}</p>)}</div><p>左右の両方が必要。各行ではどちらか一方を満たせば可。</p></div>
<p className="roadmap-action"><strong>Step 1で適格 → 同意取得前に大政へ必ず連絡</strong><br/>その後に説明・同意 → EDC組入れ。組入時の値を印刷済み用紙に記録。</p></>}
{step===2&&<><div className="roadmap-heading"><span className="step-number">02</span><div><span className="roadmap-english">Flow weaning trial</span><h3>離脱試験・記録</h3></div></div><p><strong>組入後24時間以内に開始</strong>。ECMO 1.0–1.5 L/minで共通指標を評価します。試験中にVISが10以上上昇していないことも確認します。</p><div className="record-chips"><span>開始前</span><span>30分後</span><span>成功判断時<br/>1–3時間</span></div><p>印刷済み用紙へ各時点の実測値を記録。成功は時間経過だけで決めません。失敗時は理由・対応を記録して再評価。</p></>}
{step===3&&<><div className="roadmap-heading"><span className="step-number">03</span><div><span className="roadmap-english">Randomization → PCRTO</span><h3>成功直後に割付・RCT分岐</h3></div></div><p>Flow weaning成功時の実測値をEDCに入力し、ランダム割付。</p><div className="mini-branches"><div><b>Conventional群</b><p>従来の離脱試験で終了<br/>→ Step 4へ</p></div><div><b>PCRTO追加群</b><p>PCRTOで追加評価<br/>開始前・15分後・成功判断時（0.5–1時間）に記録<br/>→ 成功判断後、Step 4へ</p></div></div></>}
{step===4&&<><div className="roadmap-heading"><span className="step-number">04</span><div><span className="roadmap-english">Readiness-to explant</span><h3>離脱可能な状態 → ECMO抜去</h3></div></div><p>割付群の離脱試験をクリアしたら、<strong>2日以内に抜去</strong>。抜去前に状態悪化があれば再評価します。</p><p><strong>抜去24時間後のデータも記録</strong>してください。</p></>}
</Tag>;}
