import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),date='2026-11-01';
const interview=(videoId,speaker,notes,recommendation='Recommended')=>({videoId,speaker,notes,recommendation,section:'Interview',focusArea:'Agent',format:'Technical Interview',seriesId:'latent-space-interviews',seriesTitle:'Latent Space Interviews'});
const talk=(videoId,speaker,notes)=>({videoId,speaker,notes,section:'Talk',focusArea:'Agent',format:'Engineering Talk'});
const pybullet=(videoId,title,seriesOrder)=>({videoId,title,speaker:'zidea2015',channel:'zidea2015',section:'Course',focusArea:'Robotics',format:'Code Tutorial',seriesId:'zidea-pybullet-code-examples',seriesTitle:'PyBullet Code Examples by zidea2015',seriesOrder,notes:'Short creator tutorial in the PyBullet code-examples series. Only lessons 3–5 are collected; not a complete course.'});
const choices=[
interview('MRQTlwcW-aQ','Katelyn Lesse; Angela Jiang','Anthropic engineering and product discussion of agent harnesses, persistent sessions, execution sandboxes, credentials and evaluations. Promotional model-ranking claims in the original title are not independently endorsed.','Core'),
interview('zHG6sAss_kE','Paul Copplestone; Ant Wilson','Supabase founders discuss agent-facing databases, schemas, compute and application infrastructure. The episode discloses the host\'s investment and Supabase sponsorship.','Core'),
interview('KM3VQZKjpiY','Aman Singh','Separate interview about Arca agent architecture, long-running workflows and operational supervision; distinct from the earlier conference talk.'),
interview('v-d1WTqIULs','Joseph Kim','Separate interview on domain-specific agent tools, context and workflows for analysts; distinct from the earlier conference presentation.'),
talk('vhPCo-8K78U','Ian Quigley','Leash Bio follow-up on evaluating scientific agent rollouts and distinguishing benchmark performance from useful experimental work.'),
talk('geMAe-PLJF4','Nick Nisi','WorkOS talk on code-review bottlenecks and automated review experiments.'),
talk('v0UkV5qS9E4','Yijia Liang','Compound AI discussion of agent-oriented document and spreadsheet workflows.'),
talk('YX4Z4XqZ9Vo','Hahnbee Lee; Lincoln Murr','Mintlify and Coinbase discussion of documentation used by agents and machine-readable developer interfaces.'),
talk('7WUzHIF32vA','Ramakrishnan Lokanathan','Talk on evaluation design, adversarial examples and interpreting saturated agent benchmarks.'),
talk('LnQce-eHm8k','Jeff Smith','Oracle talk on controlled database access, natural-language queries and agent permissions.'),
talk('1_lX0m64-aI','Richmond Alake','Oracle talk on memory, knowledge and differentiated agent behavior.'),
talk('3osCbSufv8g','Shiv Indap; Brooke Hopkins','Upstart and Coval case study on voice-agent evaluation and failure handling in constrained workflows.'),
talk('qq2Hm4XNRgI','Wojciech Pluta','Oracle discussion of deciding what agents should store and retrieve from persistent memory.'),
talk('8vDzncmzxyg','Killian Carlsen-Phelan','Sonar presentation on providing repository conventions and architecture context to coding agents.'),
talk('YU1uD_YkpjU','Ishween Kaur','SoFi presentation of agent-payment protocol failure modes and validation boundaries.'),
talk('rWtbOgl5FTU','Rayan Krishnan','Vals AI talk on task-level model evaluation and reliability versus cost.'),
{...talk('wP3P89YB9fA','Killian Carlsen-Phelan; Taylor Luttrell-Williams','Hands-on Sonar session using Gitar to verify changes across sample pull requests.'),section:'Course',format:'Hands-on Workshop'},
talk('LQW_Wvqhp04','Tariq Shaukat','Sonar presentation on verification and delivery bottlenecks in agent-generated code. Reported productivity figures are presenter claims.'),
talk('Ok6QdZHCcI8','David Abitbol','Revolut case study of self-hosted open models for coding agents. Reported cost reductions are not independently reproduced.'),
talk('mJ7q8CuVmbw','Shy Ruparel','Temporal talk on durable execution and operational trust for agents that encounter failures.'),
talk('YqxpPI7YUjE','Cole Gannaway','Qodo discussion of cross-file consequences and verification of small code changes.'),
{...talk('XOUSuxY074U','Harrison Chase','Interrupt London keynote on specialization across agent models, harnesses and context.'),format:'Keynote'},
talk('Wb3hQaG_xf0','Victor Moreira','LangChain presentation on managed agent deployment, context storage and evaluations.'),
{videoId:'AKU6QQ_MtWg',speaker:'Boris Ivanovic',section:'Talk',focusArea:'Robotics',format:'Research Seminar',recommendation:'Core',notes:'NVIDIA Physical AI talk covering reasoning models, data labeling, closed-loop simulation and generalization. Newly collected backfill uploaded October 22. Organizer reference: https://montrealrobotics.ca/robotlearningseries/'},
{videoId:'tuEzO1mBAgM',speaker:'Eric Dexheimer',section:'Talk',focusArea:'Vision',format:'Research Seminar',notes:'Research seminar on geometric priors and dense monocular SLAM. Newly collected backfill uploaded October 15. Organizer reference: https://montrealrobotics.ca/robotlearningseries/'},
pybullet('BV1ksxx6GEER','PyBullet Code Examples 3: Creating Ten Thousand Blocks',3),
pybullet('BV1Fbxx66EXL','PyBullet Code Examples 4: Building a Robot Programmatically',4),
pybullet('BV1Cpxx6CETT','PyBullet Code Examples 5: A Deformable Ball and Finite Elements',5),
{videoId:'BV1ngx46rEAB',title:'Why World Models Still Struggle with Robot Training — Cewu Lu',speaker:'Cewu Lu',channel:'Future Laboratory',section:'Interview',focusArea:'World Model',format:'Interview Excerpt',notes:'Approximately three-minute interview excerpt about object structure, interaction and scalable physical data. Original recording date and full-interview link are unverified; not labelled as a complete interview.'},
];
assert.equal(choices.length,29);
const cache=new URL(`outputs/research-${date}/`,root), manifestPath=new URL(`data/weekly_sources_${date}.json`,root);
if(process.argv.includes('--capture')){
  const bili=new Map();for(const f of await fs.readdir(cache))if(f.endsWith('.json'))for(const r of JSON.parse(await fs.readFile(new URL(encodeURIComponent(f),cache),'utf8')))if(r.platform==='Bilibili')bili.set(r.videoId,r);
  const sources=[];for(const c of choices){const r=c.videoId.startsWith('BV')?bili.get(c.videoId):JSON.parse(await fs.readFile(new URL(`verified/${c.videoId}.json`,cache),'utf8'));assert(r,`Missing source ${c.videoId}`);sources.push({videoId:r.videoId,platform:r.platform,originalTitle:r.title,channel:r.channel,publishedAt:r.publishedAt,durationSeconds:r.durationSeconds??r.duration.split(':').reduce((s,n)=>s*60+Number(n),0),views:Number(r.views),source:r.source,checkedOn:date});}
  await fs.writeFile(manifestPath,JSON.stringify(sources,null,2)+'\n');
}
const sources=JSON.parse(await fs.readFile(manifestPath,'utf8')),sm=new Map(sources.map(r=>[r.videoId,r]));
const dataPath=new URL('data/scholar_tube_resources.json',root),old=JSON.parse(await fs.readFile(dataPath,'utf8'));let nextId=Math.max(...old.map(r=>+r.id.slice(3)));
const keys=new Set(old.map(r=>r.videoId)),additions=[];
for(const c of choices){const s=sm.get(c.videoId);assert(s&&s.publishedAt>='2026-10-15'&&s.publishedAt<=date);assert(!/jepa|pangu|盘古/i.test(JSON.stringify(c)+s.originalTitle));if(keys.has(c.videoId))continue;const yt=s.platform==='YouTube';
  const row={id:`ST-${++nextId}`,section:c.section,domain:({'Agent':'AI Agents / Engineering','World Model':'World Models / Predictive Intelligence','Vision':'Computer Vision','Robotics':'Robotics / Embodied AI'})[c.focusArea],keywords:`${c.focusArea}; ${c.speaker}; ${c.format}`,language:yt?'English':'Chinese',title:c.title||s.originalTitle,speaker:c.speaker,channel:c.channel||s.channel,format:c.format,durationMinutes:Math.round(s.durationSeconds/60),url:yt?`https://www.youtube.com/watch?v=${s.videoId}`:`https://www.bilibili.com/video/${s.videoId}/`,platform:s.platform,viewCount:s.views,sourceTier:c.mirror?'B | Community / Curated Mirror':c.community?'C | Community Selection':'A | Official / Original Creator / Organizer',recommendation:c.recommendation||'Recommended',status:yt?'Verified':'Pending Verification',collectedOn:date,notes:c.notes+(yt?' Primary watch-page metadata checked; playback and subtitle availability were not tested.':' Primary Bilibili search metadata checked; watch-page access, playback and subtitles remain unverified.'),videoId:s.videoId,focusArea:c.focusArea,publishedAt:s.publishedAt,subtitleLanguages:[],subtitleTracks:[],subtitlesVerified:false,subtitleVerificationScope:'Subtitle availability not checked',metadataVerifiedVia:s.source,metadataVerificationStatus:yt?'Verified':'Partial',lastVerifiedAt:yt?date:'',lastVerificationAttemptAt:date,metadataVerificationError:yt?'':'Watch-page and detail API access unavailable; primary search metadata available',publishedAtVerified:true,seriesId:c.seriesId||'',seriesTitle:c.seriesTitle||'',seriesOrder:c.seriesOrder||(c.seriesId?Number(s.publishedAt.replaceAll('-','')):'')};
  assert(!/[\u4e00-\u9fff]/.test(row.title+row.notes+row.speaker+row.channel));additions.push(row);keys.add(c.videoId);
}
const rows=[...old,...additions],csvPath=new URL('data/scholar_tube_resources.csv',root),previousCsv=await fs.readFile(csvPath,'utf8'),columns=previousCsv.replace(/^\uFEFF/,'').split(/\r?\n/)[0].split(',');
const esc=v=>{const t=Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join('; '):String(v??'');return /[",\n\r]/.test(t)?`"${t.replaceAll('"','""')}"`:t;};
await fs.writeFile(dataPath,JSON.stringify(rows,null,2)+'\n');
if(additions.length)await fs.writeFile(csvPath,previousCsv+(previousCsv.endsWith('\n')?'':'\n')+additions.map(r=>columns.map(c=>esc(r[c])).join(',')).join('\n')+'\n');
const batch=rows.filter(r=>r.collectedOn===date&&sm.has(r.videoId)),countBy=k=>batch.reduce((m,r)=>(m[r[k]]=(m[r[k]]||0)+1,m),{});
const summary={updatedOn:date,uploadWindow:['2026-10-26',date],baseCount:rows.length-batch.length,addedCount:batch.length,newTotal:rows.length,removedCount:0,addedIds:batch.map(r=>r.id),addedPlatforms:countBy('platform'),addedSections:countBy('section'),addedFocusAreas:countBy('focusArea'),datePolicy:'Platform upload dates preserved. Includes two research-seminar backfills uploaded October 15 and 22. The Cewu Lu clip recording date is unverified.',verification:'YouTube public watch metadata checked; four Bilibili entries remain Pending Verification. Playback and subtitle availability not tested.',seriesPolicy:'Existing Latent Space interview series preserved. PyBullet lessons 3–5 share one course series with explicit order; parts 1–2 are not claimed to be collected.',highlights:batch.filter(r=>r.recommendation==='Core').map(({id,title,speaker,url})=>({id,title,speaker,url}))};
await fs.writeFile(new URL(`data/weekly_update_${date}.json`,root),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({...summary,appendedThisRun:additions.length},null,2));
