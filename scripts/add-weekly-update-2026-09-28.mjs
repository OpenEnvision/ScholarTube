import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const date = '2026-09-28';
const manifestPath = new URL(`data/weekly_sources_${date}.json`, root);
const dataPath = new URL('data/scholar_tube_resources.json', root);
const interview = (videoId, speaker, focusArea, notes) => ({videoId, speaker, focusArea, notes, section:'Interview',format:'Technical Interview',seriesId:'latent-space-interviews',seriesTitle:'Latent Space Interviews',recommendation:'Core'});
const talk = (videoId,speaker,notes) => ({videoId,speaker,notes,focusArea:'Agent',section:'Talk',format:'Engineering Talk'});
const choices = [
  interview('fGRd5gYhztg','Anastasis Germanidis','World Model','Runway co-founder discusses video prediction, physical simulation, robotics and neural interfaces. This newly collected interview was uploaded September 24, not on the collection date.'),
  interview('dCX4PE2HxMs','Alex Atallah; Anjney Midha','Agent','OpenRouter discussion on multi-model routing, inference distribution and security risks around autonomous agents. Uploaded September 25.'),
  interview('cFx9Z3ZXca0','Diogo Almeida','Agent','TypeSafe founder discusses Jev, calibrated machine decisions and coding-agent architecture. Uploaded September 21; a newly collected backfill, not a new September 28 recording.'),
  talk('474j-n1Ltxc','Daksh Gupta','Greptile presentation comparing agent-written and human-written pull requests and approaches to automated code validation. Reported results are the presenter\'s claims.'),
  talk('buHC7bQE1X4','Kevin Hou','Google Antigravity engineering talk on agent teams, dynamic subagents, sidecars and generative interfaces.'),
  talk('tUPPVhBBcoM','Zach Lloyd','Warp founder discusses the shift from writing code to designing and operating agent-based software workflows.'),
  talk('9JFGohx4E7U','Zixuan Li','Z.ai presentation introducing GLM-5.2 and its long-horizon coding and agentic capabilities. Benchmark claims are not independently reproduced.'),
  talk('TRfzFJCJ7ZE','Charlie Holtz','Conductor founder discusses coordinating multiple coding agents and keeping humans involved in development decisions.'),
  talk('6MudaeKdBSk','Andrew Orobator','Reddit engineering talk on testing, review and quality gates for agent-generated software.'),
  talk('HvboD89DyQ8','Ryan Cooke','WorkOS presentation on the architecture and limitations of software-factory workflows.'),
  talk('vGCJ7diEtrw','Tereza Tizkova','Factory engineering presentation on the practical requirements of enterprise software factories.'),
  talk('YIVkERhy8xo','Ido Salomon','AgentCraft presentation on interactive interfaces for steering groups of coding agents.'),
  talk('TN3mj92oZ8I','Suraj Gupta','Warp harness-development talk on improving software-factory workflows over time.'),
  talk('oVsEddfhdxc','Elie Bakouch','Prime Intellect presentation on benchmarking research agents against human researchers.'),
  talk('OA-Mc60Rboo','Lakshya A. Agrawal','GEPA presentation on reflection-based optimization and comparisons with reinforcement learning. Performance claims are those of the presenter.'),
  talk('x4e5O9zN0TE','Erina Karati','Project Paradox case study on long-horizon game agents, provenance-aware memory, controlled experiments and rollback.'),
  talk('XyV6bSMyq-I','Zubin Aysola','Weights & Biases demonstration of improving ARIA using production traces and offline evaluations.'),
  talk('vrDvatGtIxs','Tejas Bhakta','Morph presentation on using verifiable GPU-kernel correctness and performance as research-agent feedback.'),
  talk('hd7TOvmyAxU','Tim Sweeney','Weights & Biases presentation and demonstration of ARIA running research experiments on GPUs.'),
  talk('7taOQBfjDyE','Roland Gavrilescu','Introspection presentation on feedback loops, verifiers, portable agent recipes and evaluation-driven improvement.'),
  {videoId:'BV1TMaB6PEcg',title:'EAI Aha: What Are the Real Robotics Problems after GPT-6?',speaker:'EAI Aha panelists (individual names not verified)',channel:'EAI Aha',section:'Interview',focusArea:'Robotics',format:'Research Panel',recommendation:'Recommended',notes:'Long-form robotics discussion of VLA models, world models, simulation and physical agents. Speaker names and the episode number could not be independently confirmed, so neither is inferred from a trailer.'},
  {videoId:'BV17Qau63EmB',title:'Dyna-1: From Robot Demos to Reliable Deployment',speaker:'Jason Ma',channel:'Quantum Pineapple',section:'Talk',focusArea:'Robotics',format:'Translated Talk / Community Mirror',mirror:true,notes:'Chinese community mirror of an AI Engineer talk about Dyna Robotics, reward monitoring, recovery data and deployment. September 28 is the mirror upload date; the original recording date is unverified.'},
  {videoId:'BV1ytaq6hEts',title:'MiniLoong Assembly 06: Connecting the Limbs and Torso',speaker:'MiniLoong project team',channel:'Humanoid Robotics Innovation Center',section:'Course',focusArea:'Robotics',format:'Hardware Tutorial',seriesId:'miniloong-hardware-assembly',seriesTitle:'MiniLoong Hardware Assembly',seriesOrder:6,notes:'Project-linked open-source humanoid assembly tutorial. Only part 6 is collected here, not the complete course. Project reference: https://github.com/loongOpen/MiniLoong'},
];
assert.equal(choices.length,23);
assert.equal(new Set(choices.map(r=>r.videoId)).size,23);

if(process.argv.includes('--capture')) {
  const cache = new URL(`outputs/research-${date}/`,root);
  const bili = new Map();
  for(const file of await fs.readdir(cache)) if(file.endsWith('.json')) {
    for(const r of JSON.parse(await fs.readFile(new URL(encodeURIComponent(file),cache),'utf8'))) if(r.platform==='Bilibili') bili.set(r.videoId,r);
  }
  const sources=[];
  for(const c of choices) {
    const r=c.videoId.startsWith('BV')?bili.get(c.videoId):JSON.parse(await fs.readFile(new URL(`verified/${c.videoId}.json`,cache),'utf8'));
    assert(r,`Missing source ${c.videoId}`);
    sources.push({videoId:r.videoId,platform:r.platform,originalTitle:r.title,channel:r.channel,publishedAt:r.publishedAt,
      durationSeconds:r.durationSeconds??r.duration.split(':').reduce((s,n)=>s*60+Number(n),0),views:Number(r.views),source:r.source,checkedOn:date});
  }
  await fs.writeFile(manifestPath,JSON.stringify(sources,null,2)+'\n');
}
const sources=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const sourceMap=new Map(sources.map(r=>[r.videoId,r]));
const old=JSON.parse(await fs.readFile(dataPath,'utf8'));
let nextId=Math.max(...old.map(r=>Number(r.id.replace('ST-',''))));
const keys=new Set(old.map(r=>`${r.platform}:${r.videoId||r.url}`));
const additions=[];
for(const c of choices) {
  const s=sourceMap.get(c.videoId);
  assert(s&&s.publishedAt>='2026-09-21'&&s.publishedAt<=date,`Invalid date for ${c.videoId}`);
  assert(!/jepa|pangu|盘古/i.test(JSON.stringify(c)+s.originalTitle));
  if(keys.has(`${s.platform}:${s.videoId}`)) continue;
  const isYT=s.platform==='YouTube';
  const domain=c.focusArea==='World Model'?'World Models / Interactive Simulation':c.focusArea==='Agent'?'AI Agents / Engineering':c.section==='Course'?'Robotics / Hardware Tutorials':'Robotics / Embodied AI';
  const row={id:`ST-${++nextId}`,section:c.section,domain,keywords:`${c.focusArea}; ${c.speaker}; ${c.format}`,language:isYT?'English':'Chinese',title:c.title||s.originalTitle,speaker:c.speaker,channel:c.channel||s.channel,
    format:c.format,durationMinutes:Math.round(s.durationSeconds/60),url:isYT?`https://www.youtube.com/watch?v=${s.videoId}`:`https://www.bilibili.com/video/${s.videoId}/`,platform:s.platform,viewCount:s.views,
    sourceTier:c.mirror?'B | Community / Curated Mirror':'A | Official / Original Creator / Organizer',recommendation:c.recommendation||'Recommended',status:isYT?'Verified':'Pending Verification',collectedOn:date,
    notes:c.notes+(isYT?' Primary watch-page metadata checked; playback and subtitle availability were not tested.':' Primary Bilibili search metadata checked; watch-page access and playback remain unverified. Duration is the total upload duration.'),videoId:s.videoId,focusArea:c.focusArea,publishedAt:s.publishedAt,
    subtitleLanguages:[],subtitleTracks:[],subtitlesVerified:false,subtitleVerificationScope:'Subtitle availability not checked',metadataVerifiedVia:s.source,metadataVerificationStatus:isYT?'Verified':'Partial',lastVerifiedAt:isYT?date:'',lastVerificationAttemptAt:date,metadataVerificationError:isYT?'':'Watch-page and detail API access unavailable; primary search metadata available',publishedAtVerified:true,
    seriesId:c.seriesId||'',seriesTitle:c.seriesTitle||'',seriesOrder:c.seriesOrder||(c.seriesId?Number(s.publishedAt.replaceAll('-','')):'')};
  assert(!/[\u4e00-\u9fff]/.test(row.title+row.notes+row.speaker+row.channel));
  additions.push(row);
}
const rows=[...old,...additions];
const columns=(await fs.readFile(new URL('data/scholar_tube_resources.csv',root),'utf8')).replace(/^\uFEFF/,'').split(/\r?\n/)[0].split(',');
const esc=v=>{const t=Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join('; '):String(v??'');return /[",\n\r]/.test(t)?`"${t.replaceAll('"','""')}"`:t;};
await fs.writeFile(dataPath,JSON.stringify(rows,null,2)+'\n');
await fs.writeFile(new URL('data/scholar_tube_resources.csv',root),'\uFEFF'+[columns.join(','),...rows.map(r=>columns.map(c=>esc(r[c])).join(','))].join('\n')+'\n');
const batch=rows.filter(r=>r.collectedOn===date&&sourceMap.has(r.videoId));
const countBy=k=>batch.reduce((m,r)=>(m[r[k]]=(m[r[k]]||0)+1,m),{});
const summary={updatedOn:date,uploadWindow:['2026-09-21',date],baseCount:rows.length-batch.length,addedCount:batch.length,newTotal:rows.length,removedCount:0,addedIds:batch.map(r=>r.id),addedPlatforms:countBy('platform'),addedSections:countBy('section'),addedFocusAreas:countBy('focusArea'),
  datePolicy:'Incremental follow-up to the September 26 release. Upload dates are preserved, including three newly collected interviews uploaded September 21-25. No claim that collection dates are recording dates.',
  verification:'YouTube public watch metadata checked. Three Bilibili entries remain Pending Verification because watch-page access and playback were not verified. No video playback tests were performed.',
  seriesPolicy:'Latent Space interviews join the existing show. MiniLoong lesson 6 has one course series entry and is not labelled a complete course.',
  highlights:batch.filter(r=>r.recommendation==='Core').map(({id,title,speaker,url})=>({id,title,speaker,url}))};
await fs.writeFile(new URL(`data/weekly_update_${date}.json`,root),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,appendedThisRun:additions.length},null,2));
