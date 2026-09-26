import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// --capture records primary-platform metadata from the research cache once.
// Normal runs replay the committed source manifest and are idempotent.
const date = '2026-09-26';
const root = new URL('../', import.meta.url);
const sourcePath = new URL(`data/weekly_sources_${date}.json`, root);
const dataPath = new URL('data/scholar_tube_resources.json', root);
const series = {
  multiarm: ['collaborative-teleoperation-paper-reading', 'Learning Multi-Arm Manipulation: Paper Reading'],
  agent: ['lidong-build-agent-from-scratch', 'Build an Agent from Scratch with Go'],
  slam: ['daily-slam-paper-explainers', 'Daily SLAM Paper Explainers'],
  carla: ['yanwzguo-carla-simulation', 'CARLA Simulation Tutorials'],
};
// Editorial text describes the video, not independently validated paper claims.
const yt = (videoId, section, focusArea, domain, speaker, notes, format = '', recommendation = 'Recommended') => ({videoId, section, focusArea, domain, speaker, notes, format, recommendation});
const bi = (videoId, title, focusArea, notes, extra = {}) => ({videoId, title, section:'Course', focusArea, domain:`${focusArea} / Paper Walkthroughs`, speaker:'Community presenter (not the paper authors)', notes, format:'Community Paper Tutorial', recommendation:'Recommended', ...extra});
const choices = [
  yt('WZNHg9mpfco','Interview','Agent','AI Agents / Safety','Yoshua Bengio; Beatrice Nolan','Organizer-published conversation on technical and societal safeguards for advanced AI. Recorded at the AI for Good Global Summit 2026; the date is the video upload date.','Research Interview','Core'),
  yt('2xBSGluFkG0','Interview','Agent','AI Agents / Scientific Discovery','John Platt','Long-form conversation on empirical research agents, tree search, experimental scoring and reward hacking.','Research Interview','Core'),
  yt('L6tLBApQN-g','Interview','World Model','World Models / Physical AI','Ming-Yu Liu','Discusses Cosmos 3, language/video/action learning and neural simulation for policy evaluation. The publisher discloses a paid partnership with NVIDIA.','Research Interview','Core'),
  yt('yB6_iFGTq9k','Interview','Agent','AI Agents / Harness Optimization','Zhengyao Jiang','Discussion of Weco and agents that rewrite their own harness, prompts and tools while keeping the base model fixed.','Research Interview','Core'),
  yt('L6bSqc5ccCw','Talk','Robotics','Robotics / Physical AI','Daniela Rus; Russ Tedrake; John Leonard; Pras Velagapudi; Deepak Pathak','MIT CSAIL explainer featuring researchers and industry practitioners discussing physical AI.','Research Explainer','Core'),
  yt('aUD_HMgsyTo','Talk','Agent','AI Agents / Security and Interoperability','Bilel Jamoussi; panelists from Smart Africa, Cloudflare, Microsoft, Meta and the UAE Government','Organizer-published panel on agent identity, authentication, cybersecurity and secure interoperability. Upload date is not the event date.','Panel Discussion'),
  yt('n0KN9F9pT3Q','Talk','Robotics','Robotics / Autonomous Drones','Mengqiu (MQ) Wang','Zero Zero Robotics founder discusses AI flying cameras and human-centred drone design. Organizer upload of an AI for Good Global Summit session.','Founder Talk'),
  yt('pb-AAvvQZ-U','Course','Agent','AI Agents / Fine-Tuning','LangChain team','Hands-on workflow from agent traces to model fine-tuning using LangSmith and smithtune.','Technical Tutorial'),
  yt('-mWWsvv19jE','Course','Agent','AI Agents / Scheduling','Nathan Drezner','Configure recurring tasks, prompts and Slack delivery for Managed Deep Agents.','Technical Tutorial'),
  yt('HHUsHkYhkcM','Interview','Agent','AI Agents / Harness Design','Sydney Runkle; Allie Laabs; Hunter Lovell','Full technical conversation and Q&A about Jev, model routing and safety classification. Distinct from the shorter build tutorial.','Technical Conversation'),
  yt('KPcEhLoh-Wc','Course','Agent','AI Agents / Observability','LangChain team','Introduction to LangSmith and its role in developing and observing agent systems.','Technical Tutorial'),
  yt('4-oA1BJeyr4','Course','Agent','AI Agents / Coding Workflows','LangChain team','Demonstrates a Slack-to-GitHub pull-request workflow with Managed Deep Agents.','Technical Tutorial'),
  yt('VE5dsWll06M','Course','Agent','AI Agents / Harness Design','LangChain team','Build tutorial covering Jev in an agent loop, model routing, risky tool calls and online evaluation.','Technical Tutorial'),
  yt('d6aNbE-3dxo','Course','Agent','AI Agents / Middleware','Nathan Drezner','Walkthrough of middleware for Managed Deep Agents.','Technical Tutorial'),
  yt('M9BMTC8o9-w','Talk','Agent','AI Agents / Production Evaluation','Akshay Sharma','Lyft case study on agent resolution and evaluation with LangSmith and LangGraph. Performance claims are those of the presenter.','Engineering Case Study'),
  yt('a5Yie-Bgx7A','Course','Agent','AI Agents / Team Workflows','Nathan Drezner','Shows how to share a Managed Deep Agent with a team through Slack.','Technical Tutorial'),
  yt('1jq7sC6IjMk','Course','World Model','World Models / Weather Dynamics','Emma Scharfmann; Aritra Roy Gosthipaty','Code walkthrough of open-source neural weather forecasting and the surrounding Hugging Face tooling.','Technical Tutorial'),
  yt('InnVG6pOPpM','Course','Agent','AI Agents / Structured Outputs','Hugging Face team','Browser-side constrained decoding with JSON Schema and regular expressions in Transformers.js 4.3.','Technical Tutorial'),
  yt('hXQZ6lyRCsI','Course','Vision','Vision / Flow Matching','Aritra Roy Gosthipaty','Visual introduction to noise-to-image generation, velocity prediction and flow-matching training.','Technical Tutorial','Core'),
  yt('hy8UstR2NEg','Course','Agent','AI Agents / Spec-Driven Development','Paul Everitt','Full DeepLearning.AI and JetBrains course on specifications, planning, implementation, validation and reusable agent skills.','Full Course','Core'),
  yt('uRGHx-1CqBQ','Course','Agent','AI Agents / On-Device Memory','Dylan Couzon','Course preview only, not the full course. Introduces local text/image memory and offline assistant development with Qdrant.','Course Preview'),
  yt('__p8I5CgaCA','Talk','Agent','AI Agents / Model Foundations','Debjyoti Paul','Mathematical background for LLM-based agents: positional encoding, RoPE, attention and inference approximations. This is a foundations talk, not an agent build tutorial.','Research Talk'),
  bi('BV1kMev6WEgU','ReGen: World Action Models for Continual Imitation Learning','World Model','Community walkthrough of recurrent generative replay. The upload includes horizontal and vertical versions; counted once.'),
  bi('BV1BLev6UE2W','Guava: A Universal Harness for Embodied Manipulation','Agent','Community walkthrough of a tool-using embodied-agent harness. Alternate aspect-ratio parts are counted once.'),
  bi('BV1ghev6BEaR','Continual VLA: Learning from Real-World Data without Forgetting','Robotics','Community paper walkthrough on continual VLA learning and replay. Alternate aspect-ratio parts are counted once.'),
  bi('BV1Tqev6eE1y','Mobile UMI: Cross-View Diffusion Policies for Mobile Manipulation','Robotics','Community explanation of robot-free demonstrations and decoupled kinematics. Alternate aspect-ratio parts are counted once.'),
  bi('BV19Kei6CEMN','SOLE-R1: Video-Language Reasoning as a Reward for Robot RL','Robotics','Community walkthrough of video-language reasoning as a robot reinforcement-learning reward. Alternate aspect-ratio parts are counted once.'),
  bi('BV1eKei6yEc8','CaP-X: Benchmarking and Improving Coding Agents for Robot Manipulation','Agent','Community explanation of code-based robot control and coding-agent evaluation. Alternate aspect-ratio parts are counted once.'),
  bi('BV1EAhH6zEEf','Unifying Robot Data: Managing ROS Messages at the Edge with Apache TsFile','Robotics','Presentation of an open-source bridge between ROS messages and Apache TsFile.',{section:'Talk', domain:'Robotics / Data Infrastructure',speaker:'Ansi Zhang',format:'Engineering Talk',official:true}),
  bi('BV12Wh965EUk','Pi0: A Vision-Language-Action Flow Model for General Robot Control','Robotics','Community close reading of the pi0 paper. This is a new tutorial upload, not a new release or an author presentation.'),
  bi('BV1PShX6BEAj','Pi0.5: A Vision-Language-Action Model with Open-World Generalization','Robotics','Community close reading of the pi0.5 paper. Upload date does not indicate the original paper date.'),
  bi('BV1jShd6KEeB','Learning Multi-Arm Manipulation through Collaborative Teleoperation: Part 1','Robotics','Community paper reading, not a Fei-Fei Li talk.',{series:'multiarm',seriesOrder:1}),
  bi('BV1qShd6NEA3','Learning Multi-Arm Manipulation through Collaborative Teleoperation: Part 2','Robotics','Second part of the same community paper reading, grouped with Part 1.',{series:'multiarm',seriesOrder:2}),
  bi('BV1VLhd6bEud','SynFlow: Scaling Up LiDAR Scene Flow Estimation','Vision','Research presentation linked by the uploader to the SynFlow project and OpenSceneFlow benchmark.',{section:'Talk',domain:'Vision / Scene Flow',speaker:'SynFlow project team (Here_Kin)',format:'Research Presentation',official:true}),
  bi('BV1odh26uEJq','Phi-RIE: From Photorealistic Reconstruction to Interactive Environments','World Model','Community walkthrough of converting captured Gaussian scenes into interactive environments.'),
  bi('BV1xXhC6yEFH','VDGS: Visibility-Driven Large-Scale Gaussian Splatting for Aerial Scenes','Vision','Community walkthrough of visibility-guided scene partitioning and reconstruction.'),
  bi('BV1CZhC63Eny','GrapeSplat: Geometry-Grounded Reconstruction with Pose-Free Encoding','Vision','Community walkthrough of feed-forward 3D Gaussian reconstruction from multi-view geometric features.'),
  bi('BV1G7hy6bELh','SplatLabel: Pseudo-Labelling through 4D Gaussian Splatting','Vision','Community explanation of 4D Gaussian representations for semantic pseudo-label generation.'),
  bi('BV1MAet6yEE5','ParticleSplat: Self-Supervised Object-Centric Latent Particle Splatting','Vision','Community walkthrough of object-centric particles for novel-view synthesis and scene editing.'),
  bi('BV1ckeM6jEDJ','Bi-FlowGS: Generative View Completion and Gaussian Geometry','Vision','Community walkthrough of bidirectional flow co-refinement for view completion and Gaussian reconstruction.'),
  bi('BV1zDey61EQm','Daily SLAM 03: PanoGS-SLAM for Panoramic Gaussian Mapping','Vision','Episode 3 of the uploader-labelled Daily SLAM paper-explainer series.',{series:'slam',seriesOrder:3}),
  bi('BV1Vyhf6KEiY','Daily SLAM 09: GaussianFlow-Guided Monocular Gaussian SLAM','Vision','Episode 9 of Daily SLAM. This tutorial upload is newer than the underlying paper.',{series:'slam',seriesOrder:9}),
  bi('BV1tgho6DEPu','Daily SLAM 11: RawSLAM and Online HDR Gaussian Mapping','Vision','Episode 11 of Daily SLAM, discussing Gaussian mapping from linear RAW radiance.',{series:'slam',seriesOrder:11}),
  bi('BV1rsho63Ert','Daily SLAM 12: Cube-Splat and Consistent Panoramic Mapping','Vision','Episode 12 of Daily SLAM, discussing cubemap factorization and consistency optimization.',{series:'slam',seriesOrder:12}),
  bi('BV1kcaT6qEF2','Build an Agent from Scratch 01: What Is an Agent?','Agent','First lesson of a Go-based introductory agent series.',{domain:'AI Agents / Development',speaker:'Lidong_cc',format:'Technical Tutorial',series:'agent',seriesOrder:1}),
  bi('BV1pCh26EECT','Build an Agent from Scratch 02: ReAct and the Architecture Blueprint','Agent','Second lesson in the same Go-based agent series.',{domain:'AI Agents / Development',speaker:'Lidong_cc',format:'Technical Tutorial',series:'agent',seriesOrder:2}),
  bi('BV1pGhn6yEUK','4DGS-Fixer: Sparse-View Gaussian Splatting with Video Diffusion Priors','Vision','Community walkthrough of iterative refinement for sparse-view dynamic reconstruction.'),
  bi('BV1tZh76LEDm','VoxelTTO: Voxel-Aligned Gaussian Splatting with Test-Time Optimization','Vision','Community walkthrough of voxel-aligned reconstruction and test-time pose/rendering optimization.'),
  bi('BV17ohq6mEeY','From SLAM Data Collection to 3D Gaussian Reconstruction','Vision','Practical workflow using FAST-LIVO2-RTK, Global-LVBA and 3DGS for reconstruction.',{domain:'Vision / Reconstruction Workflows',speaker:'GundaSmart',format:'Technical Tutorial'}),
  bi('BV1FZYY6EE1Z','CARLA Tutorial 17: Reconstructing a Simulated Scene with 3DGS','World Model','CARLA and ROS data collection, COLMAP processing and LiteGS training. Only lesson 17 is collected in this batch; the series is not complete.',{domain:'World Models / Simulation Tooling',speaker:'yanwzguo158',format:'Technical Tutorial',series:'carla',seriesOrder:17}),
];
assert.equal(choices.length,50);
assert.equal(new Set(choices.map(r=>r.videoId)).size,50);

if(process.argv.includes('--capture')) {
  const cache = new URL(`outputs/research-${date}/`,root);
  const found = new Map();
  for(const file of await fs.readdir(cache)) {
    if(!file.endsWith('.json')) continue;
    const rows = JSON.parse(await fs.readFile(new URL(encodeURIComponent(file),cache),'utf8'));
    for(const r of rows) if(r.platform==='Bilibili') found.set(r.videoId,r);
  }
  const captured=[];
  for(const c of choices) {
    const r=c.videoId.startsWith('BV')?found.get(c.videoId):JSON.parse(await fs.readFile(new URL(`verified/${c.videoId}.json`,cache),'utf8'));
    assert(r,`Missing source metadata: ${c.videoId}`);
    captured.push({videoId:r.videoId,platform:r.platform,originalTitle:r.title,channel:r.channel,publishedAt:r.publishedAt,
      durationSeconds:r.durationSeconds??r.duration.split(':').reduce((s,n)=>s*60+Number(n),0),views:Number(r.views),
      source:r.source,checkedOn:date,durationScope:r.platform==='Bilibili'?'upload total; may include alternative-format parts':'single video'});
  }
  await fs.writeFile(sourcePath,JSON.stringify(captured,null,2)+'\n');
}
const sources=JSON.parse(await fs.readFile(sourcePath,'utf8'));
const sourceMap=new Map(sources.map(r=>[r.videoId,r]));
const old=JSON.parse(await fs.readFile(dataPath,'utf8'));
const keys=new Set(old.map(r=>`${r.platform}:${r.videoId||r.url}`));
let maxId=Math.max(...old.map(r=>Number(r.id.replace('ST-',''))));
const additions=[];
for(const c of choices) {
  const s=sourceMap.get(c.videoId);
  assert(s&&s.publishedAt>='2026-09-14'&&s.publishedAt<=date,`Out-of-window source: ${c.videoId}`);
  assert(!/jepa|pangu|盘古/i.test(JSON.stringify(c)+s.originalTitle));
  if(keys.has(`${s.platform}:${s.videoId}`)) continue;
  const isYT=s.platform==='YouTube';
  const [seriesId,seriesTitle]=c.series?series[c.series]:['',''];
  const channelAliases={'白拾的物理AI组会':'Baishi Physical AI Reading Group','烟花流绪微梦':'Yanhua Liuxu Weimeng','取名诗经忘离骚':'Quming Shijing Wang Lisao','立冬_cc':'Lidong_cc'};
  additions.push({id:`ST-${++maxId}`,section:c.section,domain:c.domain,keywords:`${c.focusArea}; ${c.domain.split(' / ').at(-1)}`,
    language:isYT?'English':'Chinese',title:c.title||s.originalTitle.replace(/^🔬\s*/,''),speaker:c.speaker,
    channel:channelAliases[s.channel]||s.channel,format:c.format||`${c.section} Video`,durationMinutes:Math.round(s.durationSeconds/60),
    url:isYT?`https://www.youtube.com/watch?v=${s.videoId}`:`https://www.bilibili.com/video/${s.videoId}/`,
    platform:s.platform,viewCount:s.views,sourceTier:isYT||c.official?'A | Official / Original Creator / Organizer':'B | Independent Technical Creator',
    recommendation:c.recommendation,status:isYT?'Verified':'Pending Verification',collectedOn:date,
    notes:c.notes+(isYT?' Public watch-page metadata checked; playback and subtitles were not tested.':' Bilibili search API confirms the upload metadata; watch-page access and playback remain unverified. Duration is the upload total and may include alternative-format parts.'),
    videoId:s.videoId,focusArea:c.focusArea,publishedAt:s.publishedAt,subtitleLanguages:[],subtitleTracks:[],subtitlesVerified:false,
    subtitleVerificationScope:'Subtitle availability not checked',metadataVerifiedVia:s.source,metadataVerificationStatus:isYT?'Verified':'Partial',
    lastVerifiedAt:isYT?date:'',lastVerificationAttemptAt:date,metadataVerificationError:isYT?'':'Watch-page and video-detail access blocked; primary search metadata available',
    publishedAtVerified:true,seriesId,seriesTitle,seriesOrder:c.seriesOrder||''});
}
const result=[...old,...additions];
const columns=['id','section','domain','keywords','language','title','speaker','channel','format','durationMinutes','url','platform','viewCount','sourceTier','recommendation','status','collectedOn','notes','videoId','focusArea','publishedAt','subtitleLanguages','subtitleTracks','subtitlesVerified','subtitleVerificationScope','metadataVerifiedVia','metadataVerificationStatus','lastVerifiedAt','lastVerificationAttemptAt','metadataVerificationError','publishedAtVerified','seriesId','seriesTitle','seriesOrder'];
const esc=v=>{const t=Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join('; '):String(v??'');return /[",\n\r]/.test(t)?`"${t.replaceAll('"','""')}"`:t;};
await fs.writeFile(dataPath,JSON.stringify(result,null,2)+'\n');
await fs.writeFile(new URL('data/scholar_tube_resources.csv',root),'\uFEFF'+[columns.join(','),...result.map(r=>columns.map(c=>esc(r[c])).join(','))].join('\n')+'\n');
const batch=result.filter(r=>r.collectedOn===date&&sourceMap.has(r.videoId));
const countBy=k=>batch.reduce((o,r)=>(o[r[k]]=(o[r[k]]||0)+1,o),{});
const summary={updatedOn:date,uploadWindow:['2026-09-14',date],baseCount:result.length-batch.length,removedCount:0,addedCount:batch.length,
  addedIds:batch.map(r=>r.id),addedPlatforms:countBy('platform'),addedSections:countBy('section'),addedFocusAreas:countBy('focusArea'),
  newTotal:result.length,verification:{youtube:'Primary watch-page title, channel, upload date and duration checked; no playback test.',bilibili:'Primary public search API metadata checked; all 28 rows remain Pending Verification for playback/page access.'},
  datePolicy:'Dates are platform upload dates, not recording dates or paper publication dates.',
  seriesPolicy:'Only explicitly numbered series are grouped. Alternative aspect-ratio parts within a Bilibili upload count once.',
  highlights:batch.filter(r=>r.recommendation==='Core').map(({id,title,url,speaker})=>({id,title,url,speaker}))};
await fs.writeFile(new URL(`data/weekly_update_${date}.json`,root),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,appendedThisRun:additions.length},null,2));
