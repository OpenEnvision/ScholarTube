import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const dir=`outputs/research-${process.env.SCHOLARTUBE_RESEARCH_DATE || '2026-09-26'}`;
await fs.mkdir(`${dir}/verified`,{recursive:true});
function extract(html,key){const i=html.indexOf(key);if(i<0)return null;let start=html.indexOf('{',i+key.length),n=0,inString=false,escape=false;for(let j=start;j<html.length;j++){const c=html[j];if(inString){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')inString=false;}else{if(c==='"')inString=true;else if(c==='{')n++;else if(c==='}'&&--n===0)return JSON.parse(html.slice(start,j+1));}}return null;}
const args=process.argv.slice(2);
let ids=[];for(const a of args){if(a.endsWith('.json'))ids.push(...JSON.parse(await fs.readFile(a,'utf8')).map(r=>r.videoId));else ids.push(a);}
for(const id of [...new Set(ids)]){
 try{
  let r;const file=`${dir}/verified/${id}.json`;
  try{r=JSON.parse(await fs.readFile(file,'utf8'));}catch{
   const url=id.startsWith('BV')?`https://api.bilibili.com/x/web-interface/view?bvid=${id}`:`https://www.youtube.com/watch?v=${id}`;
   const raw=execFileSync('curl.exe',['-s','-L','--max-time','20','-A','Mozilla/5.0',url],{encoding:'utf8',maxBuffer:20e6});
   if(id.startsWith('BV')){const j=JSON.parse(raw);if(j.code!==0)throw new Error(JSON.stringify(j));const d=j.data;r={videoId:id,title:d.title,channel:d.owner.name,publishedAt:new Date(d.pubdate*1000).toISOString().slice(0,10),durationSeconds:d.duration,views:d.stat.view,description:d.desc,pages:d.pages,collection:d.ugc_season?.title,platform:'Bilibili',source:url};}
   else{const d=extract(raw,'"videoDetails":'),m=extract(raw,'"playerMicroformatRenderer":');if(!d||!m)throw new Error('No public video metadata');r={videoId:id,title:d.title,channel:d.author,publishedAt:m.publishDate?.slice(0,10),durationSeconds:+d.lengthSeconds,views:+d.viewCount,description:d.shortDescription,platform:'YouTube',source:url};}
   await fs.writeFile(file,JSON.stringify(r,null,2));
  }
  console.log(JSON.stringify({id:r.videoId,date:r.publishedAt,title:r.title,channel:r.channel,seconds:r.durationSeconds,description:r.description?.slice(0,180)}));
 }catch(e){console.log(id,'FAILED',e.message.slice(0,140));}
}
