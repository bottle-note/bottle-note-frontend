import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),repo=process.cwd(),out=path.join(repo,'design/editorial-redesign');
const esbuild=require(path.join(repo,'node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild'));
const compat=path.join(out,'src/next-compat.jsx');
fs.mkdirSync(path.join(out,'assets/public'),{recursive:true});
const copied=new Set();
function copyPublic(rel){const src=path.join(repo,'public',rel),dest=path.join(out,'assets/public',rel);if(!fs.existsSync(src))throw Error('Missing asset '+rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);copied.add(rel);return 'assets/public/'+rel;}
const result=await esbuild.build({entryPoints:[path.join(out,'src/real-ui.jsx')],outfile:path.join(out,'real-ui.js'),bundle:true,format:'iife',globalName:'RealUI',platform:'browser',jsx:'automatic',minify:true,metafile:true,define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'static-next-boundary',setup(build){
 build.onResolve({filter:/^next\/(image|link|navigation)$/},args=>({path:args.path,namespace:'next-export'}));
 build.onLoad({filter:/.*/,namespace:'next-export'},args=>({contents:args.path==='next/image'?`export {Image as default} from ${JSON.stringify(compat)}`:args.path==='next/link'?`export {Link as default} from ${JSON.stringify(compat)}`:`export * from ${JSON.stringify(compat)}`,resolveDir:out,loader:'js'}));
 build.onResolve({filter:/^public\//},args=>({path:args.path.slice(7),namespace:'public-export'}));
 build.onLoad({filter:/.*/,namespace:'public-export'},args=>({contents:`export default {src:${JSON.stringify(copyPublic(args.path))}}`,loader:'js'}));
 build.onLoad({filter:/\.[jt]sx?$/},args=>{
  if(args.path.includes('node_modules'))return;
  let text=fs.readFileSync(args.path,'utf8');
  // Preserve original icon geometry while making CSS masks work offline as well.
  text=text.replace(/(['"])(\/[^'"\n]+\.(?:svg|webp|png|jpg))\1/g,(whole,quote,asset)=>{
   if(!fs.existsSync(path.join(repo,'public',asset)))return whole;
   copyPublic(asset.slice(1));
   if(asset.endsWith('.svg'))return JSON.stringify('data:image/svg+xml;base64,'+fs.readFileSync(path.join(repo,'public',asset)).toString('base64'));
   return whole;
  });
  return {contents:text,loader:args.path.endsWith('tsx')?'tsx':args.path.endsWith('ts')?'ts':'jsx'};
 });
}}]});
fs.writeFileSync(path.join(out,'component-manifest.json'),JSON.stringify({note:'Direct imports of repository components. Only Next browser/image/link boundary is adapted; auth and API modules are not mocked.',components:Object.keys(result.metafile.inputs).filter(p=>p.startsWith('src/components/')),assets:[...copied].sort()},null,2));
const loadConfig=require('tailwindcss/loadConfig'),postcss=require('postcss'),tailwind=require('tailwindcss');
const config=loadConfig(path.join(repo,'tailwind.config.ts'));
config.content=[...Object.keys(result.metafile.inputs).filter(p=>!p.includes('node_modules')&&!p.includes(':')).map(p=>path.resolve(repo,p)),path.join(out,'src/pages.js')];
const css=await postcss([tailwind(config)]).process('@tailwind base;\n@tailwind components;\n@tailwind utilities;', {from:undefined});
fs.writeFileSync(path.join(out,'product-ui.css'),css.css);
console.log('Built actual components:',Object.keys(result.metafile.inputs).filter(p=>p.startsWith('src/components/')).length);
