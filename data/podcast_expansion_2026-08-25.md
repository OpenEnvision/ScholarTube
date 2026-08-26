# Research Podcast Expansion — 2026-08-25

This note documents the 2026-08-25 expansion of the Interview section with
research-dense podcast episodes, the series-metadata backfill that accompanied
it, and the speaker-name cleanup on existing rows.

Applied by `scripts/add-quality-podcasts-2026-08-25.mjs` (also exposed as
`npm run podcasts:apply`), followed by `npm run series:apply`.

## Summary

- **71 new episodes** (ST-1027 … ST-1097) across **22 shows**: 59 English + 12
  Chinese; 65 YouTube + 6 Bilibili.
- Focus areas: Other 38, Robotics 13, Agent 8, World Model 7, How to Research 3,
  Vision 2.
- Recommendations: Core 32, Recommended 37, Reserve 2.
- Formats: Podcast Interview 55, Video Podcast 11 (Chinese video-podcast shows),
  Marathon Research Interview 5 (3 h+ episodes only).
- Catalog grew from 1,025 to 1,096 resources; the Interview section grew from
  189 to 260.

## Shows and episode counts

| Show (channel) | Added | Highlights |
| --- | ---: | --- |
| Dwarkesh Podcast (Dwarkesh Patel) | 10 | Hassabis, Schulman, Jeff Dean & Noam Shazeer, Leopold Aschenbrenner, Chollet, Christiano, Shane Legg, Sholto & Trenton ×2, frontier training/serving systems |
| Machine Learning Street Talk | 5 | John Jumper, Yi Ma, Genie world-model leads, Sepp Hochreiter, Schmidhuber |
| The TWIML AI Podcast | 5 | Stefano Ermon, Yejin Choi, Nikita Rudin, Genie 3, Anthropic circuit tracing |
| Latent Space | 4 | Mark Chen, Joon Sung Park, Moonlake world models (Manning), xAI videogen |
| No Priors | 4 | Noam Brown, Sunday Robotics (Tony Zhao & Cheng Chi), Eric Zelikman, Misha Laskin |
| The Robot Brains Podcast | 4 | Noam Brown, John Schulman, Geoffrey Hinton, Chelsea Finn |
| Training Data (Sequoia Capital) | 4 | Rich Sutton & Khurram Javed, Jerry Tworek & Rohan Anil, Thomas Wolf, Karpathy at AI Ascent |
| 张小珺 Podcast (YouTube) | 4 | 谭捷 (Gemini Robotics), 姚顺雨, 刘子鸣, 杨松琳 |
| WhynotTV (Bilibili) | 4 | 杨硕, 胡渊鸣, 陈天奇, 翁家翌 |
| a16z | 3 | Fei-Fei Li (World Labs), Mark Chen & Jakub Pachocki, Genie 3 leads |
| The Cognitive Revolution | 3 | Nathan Lambert (post-training), Gemini Robotics, Goodfire interpretability |
| Google DeepMind: The Podcast | 3 | John Jumper, Oriol Vinyals, Carolina Parada |
| The Gradient Podcast | 3 | Yann LeCun, Jacob Andreas, Soumith Chintala |
| The 80,000 Hours Podcast | 3 | Neel Nanda ×2, Yoshua Bengio |
| Lex Fridman Podcast | 2 | Yann LeCun (#416), Noam Brown (#344) — missing research-dense episodes only |
| Y Combinator | 2 | François Chollet, Demis Hassabis |
| Hugging Face | 2 | Sara Hooker, Merve Noyan |
| 卫诗婕｜漫谈 (Light the Star) | 2 | 王兴兴 (Unitree), 姚卯青 (智元) |
| NVIDIA AI Podcast | 1 | Deepak Pathak & Abhinav Gupta (Skild AI) |
| The MAD Podcast with Matt Turck | 1 | Thomas Wolf |
| 十字路口 (Bilibili) | 1 | 黄一 (萝博派对) — Reserve |
| 硅基聊天室 (Bilibili) | 1 | EP04 with 蒋昌建 / 黄执中 — Reserve |

## Verification method

Every entry was verified live on 2026-08-25 before inclusion:

- **YouTube** — the public oEmbed endpoint
  (`https://www.youtube.com/oembed?url=…&format=json`) had to succeed and
  confirm the canonical channel; the public watch page supplied the exact
  publish date and view-count snapshot; the canonical channel listing or search
  result supplied the runtime. These rows carry
  `metadataVerificationStatus: "Partial"` in line with the catalog convention
  for YouTube rows whose player API is blocked on this network.
- **Bilibili** — the public view API supplied title, owner, runtime, publish
  date, and view count; the player API confirmed subtitle metadata. These rows
  carry `metadataVerificationStatus: "Verified"`.
- No video id was guessed. Ids were taken only from canonical channel listings
  or oEmbed-confirmed watch URLs.

### Verification failures (omitted)

Two candidate Lex Fridman episodes returned HTTP 401 from the oEmbed endpoint
during verification and were omitted rather than guessed:
`13CZPWmke6A`, `uPUEq8d73JI`.

## Series grouping

New series definitions were added to `scripts/apply-course-series.mjs`
(Interview section): `sequoia-training-data`, `a16z-ai-interviews`,
`cognitive-revolution-podcast`, `google-deepmind-podcast`,
`the-gradient-podcast`, `eighty-thousand-hours-podcast`,
`y-combinator-ai-interviews`, `hugging-face-podcast`, `nvidia-ai-podcast`,
`mad-podcast`, `silicon-based-chatroom`, `whynottv-podcast`.

Backfills / merges on existing rows:

- `zhang-xiaojun-business-interviews` now also matches the show's YouTube
  channel `张小珺 Podcast` (backfills ST-942, the Saining Xie marathon).
- `wei-shijie-mantan-podcast` now also matches the renamed channel
  `卫诗婕_漫谈Light the Star` (backfills ST-073).
- Existing ungrouped rows joined their shows' series: 硅基聊天室 ST-250,
  WhynotTV ST-251, the MAD Podcast ST-050, Google DeepMind podcast
  conversations ST-654 / ST-769, and NVIDIA official interviews ST-016 /
  ST-384.

`seriesOrder` uses YYYYMMDD derived from `publishedAt` throughout.

## Speaker cleanup

66 existing Interview rows that carried `To be added` or a title fragment in
the `speaker` field were fixed with guest names taken from the episode title or
the canonical episode description (e.g. ST-038 → Ilya Sutskever, ST-226 →
谢赛宁, ST-321 → Jitendra Malik). Six rows keep the placeholder because no
guest is named anywhere verifiable (ST-029, ST-057, ST-070, ST-074, ST-240,
ST-323).

## Exclusions

Beyond the two verification failures, candidates were dropped for: sub-25-minute
clips and teaser cuts, product-marketing AMAs, generic AI-news recap episodes,
duplicate re-uploads of episodes already indexed (including cross-platform
duplicates of 张小珺 episodes already present via Bilibili), and industrial
automation filler on robotics shows.

## Remaining gaps

- No verified canonical uploads were found for dedicated 机器之心 / 智源社区
  long-form researcher podcasts meeting the editorial bar.
- Lex Fridman coverage intentionally stays selective; several research-dense
  episodes (including the two 401 failures above) remain unindexed.
- NVIDIA AI Podcast has only one episode that met the researcher-guest bar;
  most of its recent catalog is product-oriented.
- The Cognitive Revolution, The Gradient, and 80,000 Hours have deep back
  catalogs that could support a second pass.
