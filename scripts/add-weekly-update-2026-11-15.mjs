import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const date = '2026-11-15';
const file = (name) => new URL('../data/' + name, import.meta.url);
const read = async (name) => JSON.parse(await fs.readFile(file(name), 'utf8'));
const write = (name, value) => fs.writeFile(file(name), JSON.stringify(value, null, 2) + '\n');
const name = 'scholar_tube_resources.json';
const rows = await read(name);
const sources = await read('weekly_sources_' + date + '.json');
const keys = new Set(rows.map(r => r.videoId));
const urls = new Set(rows.map(r => r.url.replace(/\/$/, '')));
const domains = {Agent:'AI Agents / Engineering', Vision:'Computer Vision', Robotics:'Robotics / Embodied AI', 'World Model':'World Models / Predictive Intelligence'};
const additions = [];
let nextId = Math.max(...rows.map(r => +r.id.slice(3)));
for (const s of sources) {
  assert(s.publishedAt >= '2026-11-09' && s.publishedAt <= date);
  assert(!/jepa|pangu|盘古/i.test(JSON.stringify(s)));
  if (keys.has(s.videoId)) continue;
  const yt = s.platform === 'YouTube';
  assert(yt ? /^[\w-]{11}$/.test(s.videoId) : /^BV[\w]{10}$/.test(s.videoId));
  const url = yt ? 'https://www.youtube.com/watch?v=' + s.videoId : 'https://www.bilibili.com/video/' + s.videoId + '/';
  assert(!urls.has(url.replace(/\/$/, '')), url);
  const cs329z = s.originalTitle.includes('CS329Z');
  const cme295 = s.originalTitle.includes('CME295');
  const latent = s.originalChannel === 'Latent Space';
  const seriesId = cs329z ? 'stanford-cs329z-autumn-2026' : cme295 ? 'stanford-cme295-autumn-2026' : latent ? 'latent-space-interviews' : '';
  const seriesTitle = cs329z ? 'Stanford CS329Z: Agentic AI (Autumn 2026)' : cme295 ? 'Stanford CME295: Transformers and LLMs (Autumn 2026)' : latent ? 'Latent Space Interviews' : '';
  const format = s.section === 'Course' ? 'University Lecture' : s.section === 'Interview' ? 'Technical Interview' : 'Technical Talk';
  const notes = s.notes + (yt ? ' Public YouTube watch-page metadata checked.' : ' Public Bilibili video-detail metadata checked.') + ' Playback and subtitles were not tested.';
  additions.push({
    id:'ST-' + ++nextId, section:s.section, domain:domains[s.focusArea], keywords:s.focusArea + '; ' + format,
    language:yt ? 'English' : 'Chinese', title:s.title || s.originalTitle, speaker:s.speaker,
    channel:s.channel || s.originalChannel, format, durationMinutes:Math.max(1,Math.round(s.durationSeconds/60)),
    url, platform:s.platform, viewCount:s.views, sourceTier:yt || s.videoId === 'BV1tVsH6gEbv' ? 'A | Official / Original Creator / Organizer' : 'C | Community Selection',
    recommendation:cs329z || ['ir0k2gX5jtE','vlfCjWuv4es'].includes(s.videoId) ? 'Core' : 'Recommended',
    status:'Verified', collectedOn:date, notes, videoId:s.videoId, focusArea:s.focusArea, publishedAt:s.publishedAt,
    subtitleLanguages:[], subtitleTracks:[], subtitlesVerified:false, subtitleVerificationScope:'Subtitle availability not checked',
    metadataVerifiedVia:s.source, metadataVerificationStatus:'Verified', lastVerifiedAt:date,
    lastVerificationAttemptAt:date, metadataVerificationError:'', publishedAtVerified:true,
    seriesId, seriesTitle, seriesOrder:s.seriesOrder || (latent ? Number(s.publishedAt.replaceAll('-', '')) : ''),
  });
  keys.add(s.videoId);
  urls.add(url.replace(/\/$/, ''));
}
const merged = [...rows,...additions];
const batch = merged.filter(r => r.collectedOn === date && sources.some(s => s.videoId === r.videoId));
assert.equal(batch.length,sources.length);
assert.deepEqual(batch.filter(r => r.seriesId === 'stanford-cs329z-autumn-2026').map(r => r.seriesOrder),[1,2,3,4,5,6]);
if (additions.length) {
  const csv = file('scholar_tube_resources.csv');
  const existing = await fs.readFile(csv,'utf8');
  const columns = existing.replace(/^\uFEFF/,'').split(/\r?\n/)[0].split(',');
  const esc = (v) => {
    const t = Array.isArray(v) ? v.join('; ') : String(v ?? '');
    return /[",\r\n]/.test(t) ? '"' + t.replaceAll('"','""') + '"' : t;
  };
  await write(name,merged);
  await fs.appendFile(csv,(existing.endsWith('\n') ? '' : '\n') + additions.map(r => columns.map(c => esc(r[c])).join(',')).join('\n') + '\n');
}
const counts = (k) => batch.reduce((m,r) => (m[r[k]] = (m[r[k]] || 0) + 1,m),{});
const summary = {updatedOn:date, uploadWindow:['2026-11-09',date], baseCount:merged.length-batch.length,
  addedCount:batch.length, newTotal:merged.length, removedCount:0, addedIds:batch.map(r=>r.id),
  addedPlatforms:counts('platform'), addedSections:counts('section'), addedFocusAreas:counts('focusArea'),
  verification:'YouTube watch-page and Bilibili video-detail metadata checked. Playback and subtitles not tested.',
  seriesPolicy:'Stanford CS329Z lectures 1–6 share one ordered series; CME295 Autumn 2026 remains separate from Autumn 2025.',
  highlights:batch.filter(r=>['ir0k2gX5jtE','vlfCjWuv4es','DGI4vucR71w'].includes(r.videoId)).map(({id,title,speaker,url})=>({id,title,speaker,url}))};
await write('weekly_update_' + date + '.json',summary);
console.log(JSON.stringify(summary,null,2));
