import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const date = '2026-10-04';
const interview = (videoId, speaker, focusArea, notes, seriesId='latent-space-interviews', seriesTitle='Latent Space Interviews') => ({videoId,speaker,focusArea,notes,section:'Interview',format:'Technical Interview',seriesId,seriesTitle,recommendation:'Core'});
const talk = (videoId,speaker,notes) => ({videoId,speaker,notes,focusArea:'Agent',section:'Talk',format:'Engineering Talk'});
const choices = [
  interview('kog7mwsDqnk','Alex Zhang','Agent','Recursive language models, context offloading, programmatic subagents and agent harness design.'),
  interview('z9OkBD2-MDU','Ari Weinstein; Nikunj Handa','Agent','Computer-use agents and developer infrastructure, including asynchronous tools, memory and session management. Product claims are those of the speakers.'),
  interview('IZAlq-V19U8','Thariq Shihipar','Agent','Claude Code workflows, mutable agent harnesses, collaboration and agent security.'),
  interview('VoAPg8Fj6-c','Tsung-Hsien (Shawn) Wen','Agent','PolyAI discussion of timing, turn-taking and adaptation in conversational voice agents.','machine-learning-street-talk-interviews','Machine Learning Street Talk Interviews'),
  interview('ZpQFebTK75A','Leonardo de Moura','Agent','Lean, proof-producing agents and the limitations of specifications and verification.','machine-learning-street-talk-interviews','Machine Learning Street Talk Interviews'),
  interview('HIUzrxQxTtw','Pushmeet Kohli; Jeremy Ratcliffe; Hannah Fry','Vision','SynthID and provenance of generated images and video, with additional discussion of biological watermarking.','google-deepmind-podcast','Google DeepMind: The Podcast'),
  {videoId:'HU03WDFB_tQ',speaker:'Alejandro AO',focusArea:'Agent',section:'Course',format:'Hands-on Tutorial',notes:'Always-on agents with Pi, Telegram gateways, skills and persistent session routing. Standalone tutorial, not a complete course.'},
  {videoId:'6v0Fmsi4Ldk',speaker:'Nathan Drezner',focusArea:'Agent',section:'Course',format:'Hands-on Tutorial',notes:'Building an HTTP channel for a Managed Deep Agent. Standalone technical walkthrough.'},
  talk('Bdrs3uAX0_M','Dan Adler','Sourcegraph talk about applying coding agents across large multi-repository codebases.'),
  talk('YXb2Wx1r_Pk','Nixon Dinh','PayPal talk on product-catalog retrieval and agentic commerce.'),
  talk('jc3kbZkuHTo','Melanie Warrick','Temporal talk on durable human-in-the-loop workflows and asynchronous human responses.'),
  talk('pyvRID_CZZU','Matt Lawler','AssemblyAI case study on a support agent. Resolution-rate claims are not independently reproduced.'),
  talk('YiFqcu9YA38','Sarah Simionescu','Composio discussion of agent interfaces and integrations for operational workflows.'),
  talk('qflLT3SoVbw','Anant Srivastava','Retrieval architecture and where knowledge should live in production AI applications.'),
  talk('8aVbXXvJUY4','Ivan Leo','Google DeepMind engineering talk on the Gemini Interactions API and agent-oriented interfaces.'),
  talk('oUZEt4EiPbk','Jeremy Adams','Neo4j demonstration of a personal agent running on Raspberry Pi hardware.'),
  talk('I2LL_wd89-A','Harald Kirschner','VS Code case study on adapting release workflows to AI-assisted development.'),
  talk('rTojoVotlD8','Marina Petzel','Datadog talk on evaluating semantic correctness beyond availability and latency.'),
  talk('OE_lLNCNfQo','Rowan Christmas','Docker talk on microVM sandboxing for coding agents and isolation boundaries.'),
  talk('y-OVWZD4j6U','Eric Schwartz','Traversal talk on production debugging and increasing levels of operational autonomy.'),
  talk('HLTa7Vcs4X0','Gabriel Spencer-Harper','Meticulous talk on verification bottlenecks in AI-assisted software delivery.'),
  talk('5xi_S1f9sDU','Derek Meegan','Browserbase talk on compounding errors and reliability in long browser-agent tasks.'),
  talk('48YUYDjwfYY','Laurent Gil; Zilvinas Urbonas','Cast AI demonstration of model routing and cost-per-task optimization in an agent harness.'),
  talk('cKhpeEBnT1o','Jakub Hojsan','Exa talk on supplying current external information to coding agents.'),
  talk('pAnLpiAG6Es','Jan Curn','Apify talk on distinguishing MCP protocol limitations from agent harness failures.'),
  {videoId:'BV1BSYP6cEZg',title:'World Model Fundamentals: Plucker Coordinates, Flow Matching and VAEs',speaker:'Marvin Gao',channel:'Marvin Gao',focusArea:'World Model',section:'Course',format:'Technical Tutorial',notes:'Whiteboard explanation with a TinyAtlas demonstration covering camera geometry, generation and visual compression. Project link supplied by the creator: https://github.com/mrvgao/tiny-atlas'},
  {videoId:'BV1tRad6REYq',title:'Understanding World Action Models: From Video Prediction to Robot Actions',speaker:'Kelip',channel:'Kelip',focusArea:'World Model',section:'Course',format:'Technical Tutorial',notes:'Explanation of video-action learning and its relationship to world models and VLA, including DreamZero, LingBot-VA and VA 2.0. Standalone tutorial; no course sequence is inferred.'},
  {videoId:'BV1UqHL6UEQr',title:'How Close Are VLA Models to Practical General-Purpose Robots?',speaker:'Guoliang Tang (Tommy)',channel:'Guoliang Tang (Tommy)',focusArea:'Robotics',section:'Talk',format:'Technical Explainer',notes:'VLA explanation covering generalization, control latency and deployment reliability, with examples from pi models, Helix and SmolVLA.'},
  {videoId:'BV1Q8a16wEMz',title:'Imagine3D-LLM: Imagining 3D Scenes Before Answering',speaker:'Xiong Er Deng Bing',channel:'Xiong Er Deng Bing',focusArea:'Vision',section:'Talk',format:'Community Paper Explanation',community:true,notes:'Community explanation of Imagine3D-LLM, not a presentation by the paper authors. Paper reference supplied by the uploader: https://arxiv.org/abs/2609.38177. Research results were not independently reproduced.'},
  {videoId:'BV1TFHB6VEhH',title:'LeHome Challenge Part 2: Reward Engineering and Test-Time Optimization',speaker:'Ilia (as credited by uploader)',channel:'ubilier',focusArea:'Robotics',section:'Course',format:'Translated Tutorial / Community Mirror',mirror:true,seriesId:'ilia-lehome-challenge-tutorials',seriesTitle:'Ilia LeHome Challenge Tutorials',seriesOrder:2,notes:'New Chinese mirror of an older tutorial. Uploader credits https://www.youtube.com/watch?v=BYyHScYDL38 and an original upload of August 6, 2026; the original could not be independently verified. Contains English and Chinese-dubbed parts, so total upload duration exceeds a single lesson. Part 1 is not collected.'},
  {videoId:'BV1DvHB6EEPf',title:'LeHome Challenge Part 3: Sim-to-Real, Human-in-the-Loop DAgger and Real-World Finals',speaker:'Ilia (as credited by uploader)',channel:'ubilier',focusArea:'Robotics',section:'Course',format:'Translated Tutorial / Community Mirror',mirror:true,seriesId:'ilia-lehome-challenge-tutorials',seriesTitle:'Ilia LeHome Challenge Tutorials',seriesOrder:3,notes:'New Chinese mirror of an older tutorial. Uploader credits https://www.youtube.com/watch?v=0j2B2cXoiu4 and an original upload of August 22, 2026; the original could not be independently verified. Contains English and Chinese-dubbed parts, so total upload duration exceeds a single lesson. Part 1 is not collected.'},
];
assert.equal(choices.length,31);
const manifestPath=new URL(`data/weekly_sources_${date}.json`,root);
if(process.argv.includes('--capture')) {
  const cache=new URL(`outputs/research-${date}/`,root), bili=new Map();
  for(const f of await fs.readdir(cache)) if(f.endsWith('.json')) for(const r of JSON.parse(await fs.readFile(new URL(encodeURIComponent(f),cache),'utf8'))) if(r.platform==='Bilibili') bili.set(r.videoId,r);
  const sources=[];
  for(const c of choices) {
    const r=c.videoId.startsWith('BV')?bili.get(c.videoId):JSON.parse(await fs.readFile(new URL(`verified/${c.videoId}.json`,cache),'utf8'));
    assert(r,`Missing source ${c.videoId}`);
    sources.push({videoId:r.videoId,platform:r.platform,originalTitle:r.title,channel:r.channel,publishedAt:r.publishedAt,durationSeconds:r.durationSeconds??r.duration.split(':').reduce((s,n)=>s*60+Number(n),0),views:Number(r.views),source:r.source,checkedOn:date});
  }
  await fs.writeFile(manifestPath,JSON.stringify(sources,null,2)+'\n');
}
const sources=JSON.parse(await fs.readFile(manifestPath,'utf8')), sm=new Map(sources.map(r=>[r.videoId,r]));
const dataPath=new URL('data/scholar_tube_resources.json',root), old=JSON.parse(await fs.readFile(dataPath,'utf8'));
let nextId=Math.max(...old.map(r=>Number(r.id.slice(3))));
const keys=new Set(old.map(r=>r.videoId)), additions=[];
for(const c of choices) {
  const s=sm.get(c.videoId); assert(s&&s.publishedAt>='2026-09-28'&&s.publishedAt<=date);
  assert(!/jepa|pangu|盘古/i.test(JSON.stringify(c)+s.originalTitle));
  if(keys.has(c.videoId))continue;
  const yt=s.platform==='YouTube';
  const row={id:`ST-${++nextId}`,section:c.section,domain:({'Agent':'AI Agents / Engineering','World Model':'World Models / Predictive Intelligence','Vision':'Computer Vision','Robotics':'Robotics / Embodied AI'})[c.focusArea],keywords:`${c.focusArea}; ${c.speaker}; ${c.format}`,language:yt?'English':'Chinese',title:c.title||s.originalTitle,speaker:c.speaker,channel:c.channel||s.channel,format:c.format,durationMinutes:Math.round(s.durationSeconds/60),url:yt?`https://www.youtube.com/watch?v=${s.videoId}`:`https://www.bilibili.com/video/${s.videoId}/`,platform:s.platform,viewCount:s.views,sourceTier:c.mirror?'B | Community / Curated Mirror':c.community?'C | Community Selection':'A | Official / Original Creator / Organizer',recommendation:c.recommendation||'Recommended',status:yt?'Verified':'Pending Verification',collectedOn:date,notes:c.notes+(yt?' Primary watch-page metadata checked; playback and subtitle availability were not tested.':' Primary Bilibili search metadata checked; watch-page access, playback and subtitles remain unverified.'),videoId:s.videoId,focusArea:c.focusArea,publishedAt:s.publishedAt,subtitleLanguages:[],subtitleTracks:[],subtitlesVerified:false,subtitleVerificationScope:'Subtitle availability not checked',metadataVerifiedVia:s.source,metadataVerificationStatus:yt?'Verified':'Partial',lastVerifiedAt:yt?date:'',lastVerificationAttemptAt:date,metadataVerificationError:yt?'':'Watch-page and detail API access unavailable; primary search metadata available',publishedAtVerified:true,seriesId:c.seriesId||'',seriesTitle:c.seriesTitle||'',seriesOrder:c.seriesOrder||(c.seriesId?Number(s.publishedAt.replaceAll('-','')):'')};
  assert(!/[\u4e00-\u9fff]/.test(row.title+row.notes+row.speaker+row.channel));
  additions.push(row);keys.add(c.videoId);
}
const rows=[...old,...additions];
const columns=(await fs.readFile(new URL('data/scholar_tube_resources.csv',root),'utf8')).replace(/^\uFEFF/,'').split(/\r?\n/)[0].split(',');
const esc=v=>{const t=Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join('; '):String(v??'');return /[",\n\r]/.test(t)?`"${t.replaceAll('"','""')}"`:t;};
await fs.writeFile(dataPath,JSON.stringify(rows,null,2)+'\n');
await fs.writeFile(new URL('data/scholar_tube_resources.csv',root),'\uFEFF'+[columns.join(','),...rows.map(r=>columns.map(c=>esc(r[c])).join(','))].join('\n')+'\n');
const batch=rows.filter(r=>r.collectedOn===date&&sm.has(r.videoId));
const countBy=k=>batch.reduce((m,r)=>(m[r[k]]=(m[r[k]]||0)+1,m),{});
const summary={updatedOn:date,uploadWindow:['2026-09-28',date],baseCount:rows.length-batch.length,addedCount:batch.length,newTotal:rows.length,removedCount:0,addedIds:batch.map(r=>r.id),addedPlatforms:countBy('platform'),addedSections:countBy('section'),addedFocusAreas:countBy('focusArea'),datePolicy:'Platform upload dates, not recording dates. Two Bilibili LeHome lessons are new mirrors of August tutorials; their uploader-supplied original dates are explicitly unverified.',verification:'YouTube public watch metadata checked. Six Bilibili entries remain Pending Verification. No playback tests performed.',seriesPolicy:'Preserved existing interview series. LeHome parts 2 and 3 share one course series; not labelled complete. Standalone tutorials are not assigned invented series.',highlights:batch.filter(r=>r.recommendation==='Core').map(({id,title,speaker,url})=>({id,title,speaker,url}))};
await fs.writeFile(new URL(`data/weekly_update_${date}.json`,root),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,appendedThisRun:additions.length},null,2));
