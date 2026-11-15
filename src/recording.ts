// 記録時点：班会議資料（表紙2026/10/28）PDF p.8,10–11。
// 記録用紙の項目：配布資料 KM081426 PDF p.2,3,9,10。
// 画面参照用。患者データを記録・送信する機能ではない。
export const recordingGroups=[
 {title:'日時・ECMO',items:'記録日時、ECMO回転数、流量、FdO₂、Sweep Gas、cSvO₂'},
 {title:'併用MCS',items:'Impella CP／5.5の有無・サポートレベル・流量、IABPの有無'},
 {title:'バイタル・循環',items:'血圧（MAP）、脈拍、呼吸数、SpO₂、体温、拍動性波形、VT／VFの有無'},
 {title:'スワンガンツ',items:'肺動脈圧、CVP、PAPi、CI、CO、PCWP、SvO₂'},
 {title:'心エコー',items:'TAPSE、LVEF、重度弁膜症の有無'},
 {title:'血液ガス',items:'pH、PaO₂、P/F比、PaCO₂、HCO₃、乳酸'},
 {title:'薬剤',items:'各薬剤の投与量とVIS。試験中のVIS変化も確認'},
 {title:'人工呼吸・その他',items:'人工呼吸器設定、FiO₂、最大吸気圧、PEEP、一回換気量、NO、左右の下肢組織酸素飽和度'}
];
export const flowRecords=[
 {id:'before',title:'開始前に記録',timing:'ECMO 2.0 L/minで、流量を下げる前の値を記録します。'},
 {id:'30min',title:'開始30分後に記録',timing:'Flow weaning trial開始を起算点として30分後。ECMO 1.0–1.5 L/minでの値を記録します。'},
 {id:'success',title:'成功と判断した時点に記録',timing:'開始後1–3時間の成功判断時に記録します。30分後の記録とは別に必要です。時間経過だけでは成功としません。'}
];
export const pcrtoRecords=[
 {id:'before',title:'PCRTO開始前に記録',timing:'ECMO 1.0–1.5 L/minでの値を記録します。'},
 {id:'15min',title:'PCRTO開始15分後に記録',timing:'PCRTO開始を起算点として15分後に記録します。'},
 {id:'success',title:'PCRTO成功と判断した時点に記録',timing:'PCRTO開始後0.5–1時間の成功判断時に記録します。時間経過だけでは成功としません。'}
];
export const failureRecord='失敗と判断した日時、満たせなかった指標（複数可）、ICU入室後のIn/Out balance、失敗後に行った対応を、印刷済み用紙の失敗時欄に記録してください。対応欄には補液・昇圧剤／強心薬／抗不整脈薬／利尿薬、MCS設定強化・新規導入、呼吸器設定変更、手術・手技（日時・詳細）、透析等があります。';
