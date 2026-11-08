import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),date='2026-11-08';
const seriesNoteOld='Only lessons 3–5 are collected; not a complete course.';
const seriesNoteNew='Collection expanded on November 8 to lessons 1–7; no complete-course claim.';
const interview=(videoId,speaker,notes,recommendation='Recommended',focusArea='Agent')=>({videoId,speaker,notes,recommendation,focusArea,section:'Interview',format:'Technical Interview',seriesId:'latent-space-interviews',seriesTitle:'Latent Space Interviews'});
const talk=(videoId,speaker,notes)=>({videoId,speaker,notes,section:'Talk',focusArea:'Agent',format:'Engineering Talk'});
const pybullet=(videoId,title,seriesOrder)=>({videoId,title,speaker:'zidea2015',channel:'zidea2015',section:'Course',focusArea:'Robotics',format:'Code Tutorial',seriesId:'zidea-pybullet-code-examples',seriesTitle:'PyBullet Code Examples by zidea2015',seriesOrder,notes:'Short creator tutorial in the existing PyBullet code-examples series. Collected lessons 1–7 share one ordered series; no complete-course claim.'});
const choices=[
interview('rSWiNE92xqM','Jay Parikh','Microsoft CoreAI discussion of agent workloads, GitHub infrastructure and developer workflows. Platform scale figures are speaker claims.'),
interview('KgqWyVVH4Oc','Adit Abraham','Reducto founder discussion of document layout, tables and visual parsing for AI applications.','Recommended','Vision'),
interview('QmDLDy3ZSNE','Galen Gao; swyx','Interview on AI engineering practice, agent-built software and the Latent Space community.'),
interview('LL0YmIyBKSU','Zach Lloyd','Warp software-factory infrastructure: task-to-PR workflows, agent evaluation and iterative improvement.','Core'),
interview('bJBEFzlKPoQ','Jacob Lauritzen','Legora engineering interview on evaluating legal agents while customer traces remain private.','Core'),
talk('21tuT-e4NVo','Martin Harrysson; Prakhar Dixit','McKinsey presentation on engineering processes and adoption patterns around coding agents.'),
talk('WJTQBENv0KI','Ryan Stevens','Ramp case study of end-to-end evaluation for a bookkeeping agent.'),
talk('u7fsyrXsPBE','Natalia Connolly; Kevin Madura','AlixPartners case study of checking a coding-agent procurement analysis against underlying contracts. Monetary claims belong to the speakers.'),
talk('BT1Mo-fD-g0','Tanmay Sah; Dolly Sah','UndoBench and EvoUndo research on reversing actions and recovering from coding-agent mistakes.'),
talk('jDwc0aXTAFg','Joao Wenzel','Citadel Securities talk on representing organizational context for agents.'),
talk('_0SQh8a1Osk','Akshat Bubna','Modal engineering talk on infrastructure requirements, isolation and execution environments for agents.'),
{...talk('ZJjRgvjhq3M','Stefano Fabbri; Oliver Steffmann','OpenAI hands-on workshop on analyst workflows using ChatGPT and coding agents.'),section:'Course',format:'Hands-on Workshop'},
talk('gdzsJZJ6DDs','Anirudh Veeraragavan','Fieldguide talk on evidence, traces and explaining an agent-produced result.'),
talk('maitMe9HCvw','Nouha Dziri','Cohere research presentation on coordinating coding-agent teams and evaluating cost versus performance. Performance claims have not been independently reproduced.'),
talk('RdQCY_-SXbA','Vinoo Ganesh','Kepler discussion of grounding numerical outputs in verifiable source lookups.'),
talk('kIlVNGZZr8o','Amol Kapoor; Clifford Ressel','Nori Agentic case study of cloud agents for checking and cleaning reference data.'),
talk('pz74r-4dGfQ','Ben Holmes','Warp presentation on reviewing agent conversations and tool traces to improve the harness.'),
{...talk('ys6YQ2yfBpM','Lance Martin','Anthropic workshop on updating prompting, context and workflows for current coding agents.'),section:'Course',format:'Technical Workshop',recommendation:'Core'},
talk('EtZwTYahfek','Philipp Schmid','Google DeepMind presentation on practical capabilities needed by an AI coworker.'),
talk('oWqsBuhRRZ4','Stephen Chin; Neeraj Deshmukh','Neo4j and Blitzy case study of mapping a large legacy codebase with agents. Scale and timing are presenter claims.'),
talk('SUqQlvyI3N8','Sparsh Jain','CentralAgent AI presentation on repeated agent failures, feedback and improvement.'),
{...talk('r1iJzoxFBtg','LangChain team','Walkthrough of browser tools for Managed Deep Agents on sites without APIs.'),section:'Course',format:'Technical Tutorial'},
{...talk('ty8i2zl9q2c','LangChain team','Short explanation of the distinct roles of LangGraph, LangChain and Deep Agents.'),section:'Course',format:'Technical Tutorial'},
{videoId:'0Wsk-VZum_I',speaker:'Kensuke Nakamura',section:'Talk',focusArea:'World Model',format:'Research Seminar',recommendation:'Core',notes:'CMU research seminar on latent safety filtering, model errors, offline coverage and observation limits for robot safety. Organizer reference: https://montrealrobotics.ca/robotlearningseries/'},
pybullet('BV1m8xp63EP1','PyBullet Code Examples 1: Tracking an Anchor with a Block',1),
pybullet('BV1T8xp6GEY7','PyBullet Code Examples 2: Reading Contact Forces',2),
pybullet('BV1zZxb6jEp9','PyBullet Code Examples 6: Controlling Four Wheel Velocities',6),
pybullet('BV1CXxh6tEaY','PyBullet Code Examples 7: Computing Forces with Inverse Dynamics',7),
];
assert.equal(choices.length,28);
const cache=new URL(`outputs/research-${date}/`,root), manifestPath=new URL(`data/weekly_sources_${date}.json`,root);
if(process.argv.includes('--capture')){
  const bili=new Map();for(const f of await fs.readdir(cache))if(f.endsWith('.json'))for(const r of JSON.parse(await fs.readFile(new URL(encodeURIComponent(f),cache),'utf8')))if(r.platform==='Bilibili')bili.set(r.videoId,r);
  const sources=[];for(const c of choices){const r=c.videoId.startsWith('BV')?bili.get(c.videoId):JSON.parse(await fs.readFile(new URL(`verified/${c.videoId}.json`,cache),'utf8'));assert(r,`Missing source ${c.videoId}`);sources.push({videoId:r.videoId,platform:r.platform,originalTitle:r.title,channel:r.channel,publishedAt:r.publishedAt,durationSeconds:r.durationSeconds??r.duration.split(':').reduce((s,n)=>s*60+Number(n),0),views:Number(r.views),source:r.source,checkedOn:date});}
  await fs.writeFile(manifestPath,JSON.stringify(sources,null,2)+'\n');
}
const sources=JSON.parse(await fs.readFile(manifestPath,'utf8')),sm=new Map(sources.map(r=>[r.videoId,r]));
const dataPath=new URL('data/scholar_tube_resources.json',root),old=JSON.parse(await fs.readFile(dataPath,'utf8'));let nextId=Math.max(...old.map(r=>+r.id.slice(3)));
for(const r of old)if(r.seriesId==='zidea-pybullet-code-examples')r.notes=r.notes.replace(seriesNoteOld,seriesNoteNew);
const keys=new Set(old.map(r=>r.videoId)),additions=[];
for(const c of choices){const s=sm.get(c.videoId);assert(s&&s.publishedAt>='2026-11-01'&&s.publishedAt<=date);assert(!/jepa|pangu|盘古/i.test(JSON.stringify(c)+s.originalTitle));if(keys.has(c.videoId))continue;const yt=s.platform==='YouTube';
  const row={id:`ST-${++nextId}`,section:c.section,domain:({'Agent':'AI Agents / Engineering','World Model':'World Models / Predictive Intelligence','Vision':'Computer Vision','Robotics':'Robotics / Embodied AI'})[c.focusArea],keywords:`${c.focusArea}; ${c.speaker}; ${c.format}`,language:yt?'English':'Chinese',title:c.title||s.originalTitle,speaker:c.speaker,channel:c.channel||s.channel,format:c.format,durationMinutes:Math.round(s.durationSeconds/60),url:yt?`https://www.youtube.com/watch?v=${s.videoId}`:`https://www.bilibili.com/video/${s.videoId}/`,platform:s.platform,viewCount:s.views,sourceTier:c.mirror?'B | Community / Curated Mirror':c.community?'C | Community Selection':'A | Official / Original Creator / Organizer',recommendation:c.recommendation||'Recommended',status:yt?'Verified':'Pending Verification',collectedOn:date,notes:c.notes+(yt?' Primary watch-page metadata checked; playback and subtitle availability were not tested.':' Primary Bilibili search metadata checked; watch-page access, playback and subtitles remain unverified.'),videoId:s.videoId,focusArea:c.focusArea,publishedAt:s.publishedAt,subtitleLanguages:[],subtitleTracks:[],subtitlesVerified:false,subtitleVerificationScope:'Subtitle availability not checked',metadataVerifiedVia:s.source,metadataVerificationStatus:yt?'Verified':'Partial',lastVerifiedAt:yt?date:'',lastVerificationAttemptAt:date,metadataVerificationError:yt?'':'Watch-page and detail API access unavailable; primary search metadata available',publishedAtVerified:true,seriesId:c.seriesId||'',seriesTitle:c.seriesTitle||'',seriesOrder:c.seriesOrder||(c.seriesId?Number(s.publishedAt.replaceAll('-','')):'')};
  assert(!/[\u4e00-\u9fff]/.test(row.title+row.notes+row.speaker+row.channel));additions.push(row);keys.add(c.videoId);
}
const rows=[...old,...additions],csvPath=new URL('data/scholar_tube_resources.csv',root),previousCsv=(await fs.readFile(csvPath,'utf8')).replaceAll(seriesNoteOld,seriesNoteNew),columns=previousCsv.replace(/^\uFEFF/,'').split(/\r?\n/)[0].split(',');
const esc=v=>{const t=Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join('; '):String(v??'');return /[",\n\r]/.test(t)?`"${t.replaceAll('"','""')}"`:t;};
await fs.writeFile(dataPath,JSON.stringify(rows,null,2)+'\n');
if(additions.length||previousCsv!==await fs.readFile(csvPath,'utf8'))await fs.writeFile(csvPath,previousCsv+(previousCsv.endsWith('\n')?'':'\n')+(additions.length?additions.map(r=>columns.map(c=>esc(r[c])).join(',')).join('\n')+'\n':''));
const batch=rows.filter(r=>r.collectedOn===date&&sm.has(r.videoId)),countBy=k=>batch.reduce((m,r)=>(m[r[k]]=(m[r[k]]||0)+1,m),{});
const summary={updatedOn:date,uploadWindow:['2026-11-02',date],baseCount:rows.length-batch.length,addedCount:batch.length,newTotal:rows.length,removedCount:0,addedIds:batch.map(r=>r.id),addedPlatforms:countBy('platform'),addedSections:countBy('section'),addedFocusAreas:countBy('focusArea'),updatedExistingIds:rows.filter(r=>r.collectedOn!==date&&r.seriesId==='zidea-pybullet-code-examples'&&r.notes.includes(seriesNoteNew)).map(r=>r.id),datePolicy:'Platform upload dates preserved. PyBullet lessons 1, 2 and 6 are newly collected backfills uploaded November 1.',verification:'YouTube public watch metadata checked; four Bilibili additions remain Pending Verification. Playback and subtitle availability not tested.',seriesPolicy:'PyBullet lessons 1–7 now share the existing series in explicit lesson order. Updated three existing lesson notes to reflect the expanded collection; no complete-course claim.',highlights:batch.filter(r=>r.recommendation==='Core').map(({id,title,speaker,url})=>({id,title,speaker,url}))};
await fs.writeFile(new URL(`data/weekly_update_${date}.json`,root),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({...summary,appendedThisRun:additions.length},null,2));
