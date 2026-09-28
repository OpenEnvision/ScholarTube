import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const out=`outputs/research-${process.env.SCHOLARTUBE_RESEARCH_DATE || '2026-09-26'}`;
await fs.mkdir(out,{recursive:true});
const get=u=>execFileSync('curl.exe',['-s','-L','--max-time','25','-A','Mozilla/5.0',u],{encoding:'utf8',maxBuffer:25e6});
const plain=x=>x?.simpleText||x?.runs?.map(r=>r.text).join('')||'';
const walk=(x,cb)=>{if(!x||typeof x!=='object')return; cb(x); for(const v of Object.values(x))if(typeof v==='object')walk(v,cb)};
const old=JSON.parse(await fs.readFile('data/scholar_tube_resources.json','utf8'));
const keys=new Set(old.map(r=>r.videoId));
let all=[];
for(const h of process.argv.slice(2)){
  try {
    if(h.startsWith('@')){
      const url=`https://www.youtube.com/${h}/videos`, html=get(url);
      const raw=html.match(/var ytInitialData = (.*?);<\/script>/s)?.[1];
      if(!raw){console.log(h,'no initial data');continue;}
      const data=JSON.parse(raw), rows=[];
      walk(data,o=>{if(o.videoRenderer){const v=o.videoRenderer;if(!keys.has(v.videoId))rows.push({videoId:v.videoId,title:plain(v.title),age:plain(v.publishedTimeText),duration:plain(v.lengthText),views:plain(v.viewCountText),channel:h,source:url,platform:'YouTube'});}});
      if(!rows.length){const ids=[...new Set([...raw.matchAll(/"watchEndpoint":\{"videoId":"([^"]+)"/g)].map(m=>m[1]))]; for(const videoId of ids.slice(0,20))if(!keys.has(videoId))rows.push({videoId,channel:h,source:url,platform:'YouTube'});}
      await fs.writeFile(`${out}/${h.slice(1)}.json`,JSON.stringify(rows,null,2));all.push(...rows);console.log(h,JSON.stringify(rows.slice(0,20)));
    }else{
      const [term,page='1']=h.split(':');
      const url=`https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(term)}&order=pubdate&page=${page}&ps=20`;
      const data=JSON.parse(get(url));
      const rows=(data.data?.result||[]).filter(r=>!keys.has(r.bvid)).map(r=>({videoId:r.bvid,title:r.title.replace(/<[^>]+>/g,''),publishedAt:new Date(r.pubdate*1000).toISOString().slice(0,10),duration:r.duration,views:r.play,channel:r.author,description:r.description,source:url,platform:'Bilibili'}));
      await fs.writeFile(`${out}/${encodeURIComponent(h)}.json`,JSON.stringify(rows,null,2));all.push(...rows);console.log(h,JSON.stringify(rows.map(({description,source,...r})=>r)));
    }
  }catch(e){console.log(h,e.message.slice(0,200));}
}
await fs.writeFile(`${out}/last-batch.json`,JSON.stringify(all,null,2));
