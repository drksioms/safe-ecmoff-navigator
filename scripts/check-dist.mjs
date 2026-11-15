import {readdirSync,readFileSync} from 'node:fs';
const contactPattern=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b0\d{1,4}-\d{1,4}-\d{3,4}\b/i;
function check(p){
 for(const f of readdirSync(p,{withFileTypes:true})){
  const path=p+'/'+f.name;
  if(f.isDirectory()){check(path);continue;}
  if(!/\.(html|css|js)$/.test(path))throw Error('配信対象外ファイルの混入');
  const content=readFileSync(path,'utf8');
  if(content.startsWith('%PDF-'))throw Error('原資料の混入');
  if(contactPattern.test(content))throw Error('連絡先形式の文字列を検出。配信物を確認してください。');
 }
}
check('dist');
