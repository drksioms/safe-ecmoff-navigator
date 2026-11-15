import ts from 'typescript';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const dir='node_modules/.cache/safe-tests';mkdirSync(dir,{recursive:true});
for(const [input,output] of [['src/protocol.ts','protocol.mjs'],['tests/protocol.test.ts','test.mjs']]){
 let s=readFileSync(input,'utf8').replace("'../src/protocol'","'./protocol.mjs'");
 writeFileSync(dir+'/'+output,ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
}
await import(pathToFileURL(process.cwd()+'/'+dir+'/test.mjs').href);
