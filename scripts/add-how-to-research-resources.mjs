import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const collectedOn = '2026-08-17'

const sourceTiers = {
  official: 'A | Official / Original Creator / Organizer',
  institution: 'B | University / Conference / Institution',
  community: 'C | Community Selection',
}

const reclassifiedIds = ['ST-778', 'ST-783', 'ST-826']

const youtubeDefaults = {
  platform: 'YouTube',
  language: 'English',
  status: 'Verified',
  collectedOn,
  focusArea: 'How to Research',
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: false,
  subtitleVerificationScope: 'blocked by YouTube anti-bot verification on this network',
  metadataVerifiedVia: 'YouTube privacy-enhanced embed player metadata and an official or original-source page',
  metadataVerificationStatus: 'Partial',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: true,
  seriesId: '',
  seriesTitle: '',
  seriesOrder: null,
}

const bilibiliDefaults = {
  platform: 'Bilibili',
  language: 'Chinese',
  status: 'Verified',
  collectedOn,
  focusArea: 'How to Research',
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: true,
  subtitleVerificationScope: 'all 1 part; no public subtitle track was listed',
  metadataVerifiedVia: 'Bilibili public view/player APIs',
  metadataVerificationStatus: 'Verified',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: true,
  seriesId: '',
  seriesTitle: '',
  seriesOrder: null,
}

const officialDefaults = {
  platform: 'Official Site',
  language: 'English',
  status: 'Verified',
  collectedOn,
  focusArea: 'How to Research',
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: false,
  subtitleVerificationScope: 'The official page exposes the video but does not publish subtitle-track metadata.',
  metadataVerifiedVia: 'Official publisher or university video page',
  metadataVerificationStatus: 'Partial',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: false,
  seriesId: '',
  seriesTitle: '',
  seriesOrder: null,
}

const additions = [
  {
    ...youtubeDefaults,
    id: 'ST-861', section: 'Talk', domain: 'Research Practice / Scientific Writing',
    keywords: 'Research Paper; Scientific Writing; Argument; Structure; Peer Review',
    title: 'How to Write a Great Research Paper', speaker: 'Simon Peyton Jones', channel: 'Microsoft Research',
    format: 'Research Skills Lecture', durationMinutes: 58, url: 'https://www.youtube.com/watch?v=VK51E3gHENc',
    viewCount: 136310, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'VK51E3gHENc', publishedAt: '2016-07-26',
    notes: 'Canonical Microsoft Research upload linked from Simon Peyton Jones’s official research-writing page; title, runtime, channel, date, and public view snapshot cross-checked.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-862', section: 'Talk', domain: 'Research Practice / Presentation',
    keywords: 'Research Talk; Scientific Presentation; Storytelling; Slides; Communication',
    title: 'How to Give a Great Research Talk', speaker: 'Simon Peyton Jones', channel: 'Microsoft Research',
    format: 'Research Skills Lecture', durationMinutes: 59, url: 'https://www.youtube.com/watch?v=sT_-owjKIbA',
    viewCount: 95152, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'sT_-owjKIbA', publishedAt: '2016-07-26',
    notes: 'Canonical Microsoft Research upload linked from Simon Peyton Jones’s official research-talk page; emphasizes audience value, narrative, and slide craft.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-863', section: 'Talk', domain: 'Research Practice / Funding',
    keywords: 'Grant Proposal; Research Funding; Proposal Writing; Research Question; Impact',
    title: 'Professor Simon - How to write a grant proposal talk', speaker: 'Simon Peyton Jones', channel: 'ECSnews',
    format: 'Research Skills Lecture', durationMinutes: 58, url: 'https://www.youtube.com/watch?v=nEuK54bo6RE',
    viewCount: 1394, sourceTier: sourceTiers.institution, recommendation: 'Recommended', videoId: 'nEuK54bo6RE', publishedAt: '2023-06-16',
    notes: 'University channel recording linked from the speaker’s official grant-writing page; useful for problem framing, reviewer expectations, and proposal structure.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-864', section: 'Talk', domain: 'Research Practice / Writing',
    keywords: 'Academic Writing; Argument; Clarity; Reader Expectations; Revision',
    title: 'LEADERSHIP LAB: The Craft of Writing Effectively', speaker: 'Larry McEnerney', channel: 'UChicago Social Sciences',
    format: 'University Lecture', durationMinutes: 82, url: 'https://www.youtube.com/watch?v=vtIzMaLkCaM',
    viewCount: 9145514, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'vtIzMaLkCaM', publishedAt: '2014-06-26',
    notes: 'Official University of Chicago upload; a widely used framework for writing around reader value rather than merely reporting what the author knows.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-865', section: 'Talk', domain: 'Research Practice / Presentation',
    keywords: 'Scientific Presentation; Slide Design; Data Storytelling; Audience; Communication',
    title: 'Susan McConnell (Stanford): Designing effective scientific presentations', speaker: 'Susan McConnell', channel: 'Science Communication Lab',
    format: 'Scientific Communication Lecture', durationMinutes: 42, url: 'https://www.youtube.com/watch?v=Hp7Id3Yb9XQ',
    viewCount: 596550, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'Hp7Id3Yb9XQ', publishedAt: '2011-01-13',
    notes: 'Original Science Communication Lab upload cross-checked against its official iBiology lesson page, including the 42-minute runtime and transcript.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-866', section: 'Talk', domain: 'Research Practice / Career',
    keywords: 'Research Career; Problem Selection; Scientific Taste; Impact; Long-Term Thinking',
    title: 'Hamming, "You and Your Research" (June 6, 1995)', speaker: 'Richard W. Hamming', channel: 'securitylectures',
    format: 'Archival Research Lecture', durationMinutes: 44, url: 'https://www.youtube.com/watch?v=a1zDuOPkMSw',
    viewCount: 357203, sourceTier: sourceTiers.community, recommendation: 'Core', videoId: 'a1zDuOPkMSw', publishedAt: '2012-08-25',
    notes: 'Community archival upload of Hamming’s 1995 Naval Postgraduate School lecture; retained because the complete talk is a durable classic on choosing consequential problems.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-867', section: 'Talk', domain: 'Research Practice / Career',
    keywords: 'Research Career; Collaboration; Problem Selection; Publishing; Computer Science',
    title: 'How to Have a Bad Career | David Patterson | Talks at Google', speaker: 'David Patterson', channel: 'Talks at Google',
    format: 'Research Career Talk', durationMinutes: 59, url: 'https://www.youtube.com/watch?v=Rn1w4MRHIhc',
    viewCount: 68793, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: 'Rn1w4MRHIhc', publishedAt: '2016-01-27',
    notes: 'Official Talks at Google upload, also referenced from Patterson’s university materials; an inverse checklist of common research-career mistakes.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-868', section: 'Course', domain: 'AI Research / Research Process',
    keywords: 'AI Research; Research Questions; Literature Review; Experiments; Research Workflow',
    title: 'Lecture 1.2 – Introduction to AI Research (MIT How to AI Almost Anything, Spring 2025)', speaker: 'Paul Pu Liang', channel: 'Paul Liang',
    format: 'Graduate Course Lecture', durationMinutes: 28, url: 'https://www.youtube.com/watch?v=104FX8MYKAM',
    viewCount: 13564, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: '104FX8MYKAM', publishedAt: '2025-08-27',
    notes: 'Original course-instructor upload cross-checked against the MIT How to AI (Almost) Anything course page; directly introduces the AI research loop.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-869', section: 'Course', domain: 'Research Practice / Peer Review',
    keywords: 'Peer Review; Paper Reviewing; Rebuttal; Program Committee; Computer Vision',
    title: 'How to write a good review? - CVPR 2020 Tutorial', speaker: 'Bill Freeman, Rick Szeliski, Jordi Pont-Tuset, Fatma Güney, Konrad Schindler, Michael Goesele, Andrew Fitzgibbon, Vittorio Ferrari, and Greg Mori', channel: 'Dynamic Vision and Learning Group',
    format: 'Conference Tutorial', durationMinutes: 304, url: 'https://www.youtube.com/watch?v=W1zPtTt43LI',
    viewCount: 25460, sourceTier: sourceTiers.institution, recommendation: 'Core', videoId: 'W1zPtTt43LI', publishedAt: '2020-06-15',
    notes: 'Complete CVPR tutorial covering the paper, review, rebuttal, decision process, and panel discussion; long-form format retained as a coherent course.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-870', section: 'Course', domain: 'Research Practice / Research Community',
    focusArea: 'Other',
    keywords: 'Research Community; Peer Review; Scientific Communication; Computer Vision; Mentorship',
    title: 'CVPR18: Workshop: Part 1: Panel: How to be a Good Citizen of the CVPR Community', speaker: 'Bill Freeman, Katsushi Ikeuchi, Timnit Gebru, and Sven Dickinson', channel: 'ComputerVisionFoundation Videos',
    format: 'Conference Workshop', durationMinutes: 86, url: 'https://www.youtube.com/watch?v=MKUCz_3Ee0A',
    viewCount: 7654, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: 'MKUCz_3Ee0A', publishedAt: '2018-06-30',
    notes: 'Official Computer Vision Foundation recording cross-checked against the workshop program.',
    seriesId: '', seriesTitle: '', seriesOrder: null,
  },
  {
    ...youtubeDefaults,
    id: 'ST-871', section: 'Course', domain: 'Research Practice / Research Community',
    keywords: 'Research Practice; Research Talks; Literature Context; Scientific Communication; Computer Vision',
    title: 'CVPR18: Workshop: Part 2: Panel: How to be a Good Citizen of the CVPR Community', speaker: 'Kristen Grauman, Vladlen Koltun, and Adriana Kovashka', channel: 'ComputerVisionFoundation Videos',
    format: 'Conference Workshop', durationMinutes: 79, url: 'https://www.youtube.com/watch?v=4LEZED1YXm0',
    viewCount: 7049, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: '4LEZED1YXm0', publishedAt: '2018-06-30',
    notes: 'Official Computer Vision Foundation recording; covers clear talks, doing good research, and situating research in context.',
    seriesId: 'good-citizen-cvpr-2018-research-practice', seriesTitle: 'Good Citizen of CVPR 2018 — Research Practice Sessions', seriesOrder: 1,
  },
  {
    ...youtubeDefaults,
    id: 'ST-872', section: 'Course', domain: 'Research Practice / Research Community',
    keywords: 'Research Writing; Research Evaluation; Open Science; Mentorship; Computer Vision',
    title: 'CVPR18: Workshop: Part 3: Panel: How to be a Good Citizen of the CVPR Community', speaker: 'Jitendra Malik, Cordelia Schmid, Derek Hoiem, Devi Parikh, Georgia Gkioxari, Michael Brown, and David Forsyth', channel: 'ComputerVisionFoundation Videos',
    format: 'Conference Workshop', durationMinutes: 140, url: 'https://www.youtube.com/watch?v=imEtTnQKt4M',
    viewCount: 8033, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: 'imEtTnQKt4M', publishedAt: '2018-06-30',
    notes: 'Official Computer Vision Foundation recording; covers writing, evaluation, openness, research community norms, and mentorship.',
    seriesId: 'good-citizen-cvpr-2018-research-practice', seriesTitle: 'Good Citizen of CVPR 2018 — Research Practice Sessions', seriesOrder: 2,
  },
  {
    ...youtubeDefaults,
    id: 'ST-873', section: 'Course', domain: 'Research Practice / Presentation',
    keywords: 'Research Poster; Poster Design; Scientific Communication; Visual Hierarchy; Conference',
    title: 'How to create a better research poster in less time (#betterposter Generation 1)', speaker: 'Mike Morrison', channel: 'Mike Morrison',
    format: 'Practical Tutorial', durationMinutes: 20, url: 'https://www.youtube.com/watch?v=1RwJbhkCA58',
    viewCount: 1377332, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: '1RwJbhkCA58', publishedAt: '2019-03-25',
    notes: 'Original creator tutorial introducing the better-poster layout; included as a practical complement for conference communication.',
  },
  {
    ...youtubeDefaults,
    id: 'ST-874', section: 'Course', domain: 'AI Research / Research Practice',
    keywords: 'Reading Papers; Research Career; Deep Learning; Literature Review; Research Advice',
    title: 'Stanford CS230: Deep Learning | Autumn 2018 | Lecture 8 - Career Advice / Reading Research Papers', speaker: 'Andrew Ng and Kian Katanforoosh', channel: 'Stanford Online',
    format: 'University Course Lecture', durationMinutes: 65, url: 'https://www.youtube.com/watch?v=733m6qBH-jI',
    viewCount: 280894, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: '733m6qBH-jI', publishedAt: '2019-04-03',
    notes: 'Official Stanford Online course recording; combines paper-reading workflow with concrete early-career research advice.',
  },

  {
    ...bilibiliDefaults,
    id: 'ST-875', section: 'Course', domain: 'Research Practice / Reading Papers', keywords: '论文阅读; 文献阅读; Research Paper; Critical Reading; 论文精读',
    title: '如何读论文【论文精读·1】', speaker: '李沐', channel: '跟李沐学AI', format: 'Research Skills Tutorial', durationMinutes: 7,
    url: 'https://www.bilibili.com/video/BV1H44y1t75x', viewCount: 654309, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV1H44y1t75x', publishedAt: '2021-10-06',
    notes: 'Bilibili original upload; title, owner, runtime, date, and view snapshot verified through the public API.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-876', section: 'Course', domain: 'Research Practice / Problem Selection', keywords: '研究想法; Problem Finding; Research Ideas; Literature Gap; 选题',
    title: '如何找研究想法 1【论文精读】', speaker: '李沐', channel: '跟李沐学AI', format: 'Research Skills Tutorial', durationMinutes: 6,
    url: 'https://www.bilibili.com/video/BV1qq4y1z7F2', viewCount: 143933, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV1qq4y1z7F2', publishedAt: '2021-12-10',
    notes: 'Bilibili original upload; concise guidance on generating research ideas, verified through the public view/player APIs.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-877', section: 'Course', domain: 'Research Practice / Evaluation', keywords: '研究价值; Research Impact; Problem Selection; Evaluation; Research Taste',
    title: '如何判断（你自己的）研究工作的价值【论文精读】', speaker: '李沐', channel: '跟李沐学AI', format: 'Research Skills Tutorial', durationMinutes: 9,
    url: 'https://www.bilibili.com/video/BV1oL411c7Us', viewCount: 125655, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV1oL411c7Us', publishedAt: '2022-01-19',
    notes: 'Bilibili original upload; focuses on judging the value and contribution of one’s own research work.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-878', section: 'Course', domain: 'Research Practice / Novelty', keywords: 'Novelty; Research Contribution; 论文创新; Research Evaluation; Problem Framing',
    title: '你（被）吐槽过论文不够 novel 吗？【论文精读】', speaker: '李沐', channel: '跟李沐学AI', format: 'Research Skills Tutorial', durationMinutes: 14,
    url: 'https://www.bilibili.com/video/BV1ea41127Bq', viewCount: 110000, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: 'BV1ea41127Bq', publishedAt: '2022-02-07',
    notes: 'Bilibili original upload; discusses what reviewers mean by novelty and how to articulate a contribution.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-879', section: 'Course', domain: 'Research Practice / Scientific Writing', keywords: '科研论文; Scientific Writing; 逻辑结构; Argument; Paper Structure',
    title: '如何写好一篇科研论文-从逻辑结构谈起', speaker: 'Awake', channel: '小博士Awake', format: 'Research Skills Lecture', durationMinutes: 19,
    url: 'https://www.bilibili.com/video/BV1q34y1E7QW', viewCount: 281944, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV1q34y1E7QW', publishedAt: '2022-05-23',
    notes: 'Bilibili original upload; uses logical structure to explain how a research paper should build and support its central claim.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-880', section: 'Course', domain: 'Research Practice / Literature Management', keywords: '文献阅读; 笔记整理; Literature Review; Note Taking; Knowledge Management',
    title: '如何做好文献阅读及笔记整理', speaker: 'Awake', channel: '小博士Awake', format: 'Research Skills Lecture', durationMinutes: 21,
    url: 'https://www.bilibili.com/video/BV17W4y167SM', viewCount: 1518718, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV17W4y167SM', publishedAt: '2022-06-16',
    notes: 'Bilibili original upload; popular, practical workflow for reading, annotating, and organizing research literature.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-881', section: 'Course', domain: 'Research Practice / Literature Review', keywords: '文献综述; Literature Review; Synthesis; Scientific Writing; Research Gap',
    title: '如何去写一篇文献综述', speaker: 'Awake', channel: '小博士Awake', format: 'Research Skills Lecture', durationMinutes: 13,
    url: 'https://www.bilibili.com/video/BV1SB4y197kG', viewCount: 755456, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'BV1SB4y197kG', publishedAt: '2022-05-21',
    notes: 'Bilibili original upload; a compact introduction to literature-review structure and synthesis.',
  },
  {
    ...bilibiliDefaults,
    id: 'ST-882', section: 'Course', domain: 'Research Practice / Wellbeing', keywords: '科研压力; Research Wellbeing; Burnout; Mental Health; Research Career',
    focusArea: 'Other',
    title: '如何应对科研压力及精神内耗', speaker: 'Awake', channel: '小博士Awake', format: 'Research Career Lecture', durationMinutes: 13,
    url: 'https://www.bilibili.com/video/BV1tt4y1c7qc', viewCount: 131730, sourceTier: sourceTiers.official, recommendation: 'Recommended', videoId: 'BV1tt4y1c7qc', publishedAt: '2022-10-08',
    notes: 'Bilibili original upload; included to cover sustainable research practice, stress, and unproductive self-comparison.',
  },

  {
    ...officialDefaults,
    id: 'ST-883', section: 'Course', domain: 'Research Practice / Peer Review', keywords: 'Peer Review; Manuscript Review; Reviewer Report; Research Integrity; Publishing',
    title: 'Focus on Peer Review', speaker: 'Nature Masterclasses editors and contributors', channel: 'Nature Masterclasses', format: 'Modular Online Course', durationMinutes: 210,
    url: 'https://www.nature.com/masterclasses/focus-peer-review/52042152', viewCount: 0, sourceTier: sourceTiers.official, recommendation: 'Core', videoId: 'nature-focus-peer-review', publishedAt: '',
    notes: 'Official Nature Masterclasses course page verifies 3.5 hours across four modules and short lessons; free registration is required to access the course.',
  },
  {
    ...officialDefaults,
    id: 'ST-884', section: 'Course', domain: 'Research Practice / Scientific Writing', keywords: 'Computer Science Research; Scientific Writing; Research Design; Literature Review; Presentation',
    title: 'Scientific Research and Writing for Computer Scientists', speaker: 'Faculty contributors from TU Wien', channel: 'TU Wien', format: 'University Video Course', durationMinutes: 160,
    url: 'https://media.tuwien.ac.at/scientific-research-and-writing-for-computer-scientists/', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Core', videoId: 'tuwien-scientific-research-writing', publishedAt: '',
    notes: 'Official TU Wien course page; 16 approximately ten-minute videos organized into four thematic blocks and released under CC BY-SA 4.0.',
  },
  {
    ...officialDefaults,
    id: 'ST-885', section: 'Course', domain: 'Research Practice / Problem Selection', keywords: 'Research Topic; Exploratory Research; Search Strategy; Iteration; Research Process',
    title: 'Picking Your Topic Is Research!', speaker: 'Mara Mathews and NC State Libraries contributors', channel: 'NC State University Libraries', format: 'Library Research Tutorial', durationMinutes: 3,
    url: 'https://www.lib.ncsu.edu/videos/picking-your-topic-is-research', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Recommended', videoId: 'ncsu-picking-topic', publishedAt: '2013-08-01', publishedAtVerified: true,
    subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English transcript', automatic: false }], subtitlesVerified: true,
    subtitleVerificationScope: 'The official page provides a complete English transcript.', metadataVerificationStatus: 'Verified',
    notes: 'Official NC State Libraries page with a complete transcript, exact 3:10 runtime, publication date, credits, and Creative Commons license.',
    seriesId: 'ncsu-research-tips', seriesTitle: 'NC State Libraries Research Tips', seriesOrder: 1,
  },
  {
    ...officialDefaults,
    id: 'ST-886', section: 'Course', domain: 'Research Practice / Literature Search', keywords: 'Google Scholar; Literature Search; Citation Chaining; Search Strategy; Academic Sources',
    title: 'Searching in Google Scholar', speaker: 'NC State Libraries contributors', channel: 'NC State University Libraries', format: 'Library Research Tutorial', durationMinutes: 4,
    url: 'https://www.lib.ncsu.edu/videos/searching-google-scholar', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Recommended', videoId: 'ncsu-google-scholar', publishedAt: '',
    subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English transcript', automatic: false }], subtitlesVerified: true,
    subtitleVerificationScope: 'The official page provides a complete English transcript.',
    notes: 'Official NC State Libraries page; exact 4:23 runtime and a complete transcript are publicly listed.',
    seriesId: 'ncsu-research-tips', seriesTitle: 'NC State Libraries Research Tips', seriesOrder: 2,
  },
  {
    ...officialDefaults,
    id: 'ST-887', section: 'Course', domain: 'Research Practice / Reading Papers', keywords: 'Scholarly Article; Critical Reading; Abstract; Methods; Results',
    title: 'How to Read a Scholarly Article', speaker: 'Erin McKenney, Chelsea Krieg, and Meagan Kittle Autry', channel: 'NC State University Libraries', format: 'Library Research Tutorial', durationMinutes: 7,
    url: 'https://www.lib.ncsu.edu/videos/how-read-scholarly-article', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Core', videoId: 'ncsu-read-scholarly-article', publishedAt: '2022-06-08', publishedAtVerified: true,
    subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English transcript', automatic: false }], subtitlesVerified: true,
    subtitleVerificationScope: 'The official page provides a complete English transcript.', metadataVerificationStatus: 'Verified',
    notes: 'Official NC State Libraries page with a full transcript, faculty contributors, exact 7:02 runtime, publication date, and Creative Commons license.',
    seriesId: 'ncsu-research-tips', seriesTitle: 'NC State Libraries Research Tips', seriesOrder: 3,
  },
  {
    ...officialDefaults,
    id: 'ST-888', section: 'Course', domain: 'Research Practice / Literature Review', keywords: 'Literature Review; Synthesis; Research Gap; Scholarly Literature; Scientific Writing',
    title: 'Literature Reviews: An Overview for Graduate Students', speaker: 'John Classen and NC State Libraries contributors', channel: 'NC State University Libraries', format: 'Library Research Tutorial', durationMinutes: 10,
    url: 'https://www.lib.ncsu.edu/videos/literature-reviews-overview-graduate-students', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Core', videoId: 'ncsu-literature-review-overview', publishedAt: '2020-01-15', publishedAtVerified: true,
    subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English transcript', automatic: false }], subtitlesVerified: true,
    subtitleVerificationScope: 'The official page provides a complete English transcript.', metadataVerificationStatus: 'Verified',
    notes: 'Official NC State Libraries page with a complete transcript, exact 9:38 runtime, publication date, credits, and Creative Commons license.',
    seriesId: 'ncsu-research-tips', seriesTitle: 'NC State Libraries Research Tips', seriesOrder: 4,
  },
  {
    ...officialDefaults,
    id: 'ST-889', section: 'Course', domain: 'Research Methods / Experimental Design', keywords: 'Experimental Design; Causal Inference; Randomized Experiments; Statistics; Reproducibility',
    title: 'Lecture 22: Experimental Design', speaker: 'Esther Duflo', channel: 'MIT OpenCourseWare', format: 'Graduate Course Lecture', durationMinutes: 71,
    url: 'https://ocw.mit.edu/courses/14-310x-data-analysis-for-social-scientists-spring-2023/resources/14310x-lecture-22_mp4/', viewCount: 0, sourceTier: sourceTiers.institution, recommendation: 'Core', videoId: 'Y7GyEUj88PI', publishedAt: '',
    subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English transcript', automatic: false }], subtitlesVerified: true,
    subtitleVerificationScope: 'The official MIT OpenCourseWare page provides an English transcript.',
    notes: 'Official MIT OpenCourseWare graduate lecture; course term, instructor, video, downloadable file, transcript, and 4,238-second runtime were cross-checked.',
  },
]

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (resources.length !== 860) throw new Error(`Expected the 860-resource baseline; found ${resources.length}.`)

for (const id of reclassifiedIds) {
  const resource = resources.find((item) => item.id === id)
  if (!resource) throw new Error(`Cannot reclassify missing resource ${id}.`)
  resource.focusArea = 'How to Research'
}

const knownIds = new Set(resources.map((resource) => resource.id))
const knownUrls = new Set(resources.map((resource) => resource.url))
for (const resource of additions) {
  if (knownIds.has(resource.id)) throw new Error(`Duplicate resource id: ${resource.id}`)
  if (knownUrls.has(resource.url)) throw new Error(`Duplicate resource URL: ${resource.url}`)
  knownIds.add(resource.id)
  knownUrls.add(resource.url)
  resources.push(resource)
}

const headers = Object.keys(resources[0])
for (const resource of resources) {
  const missing = headers.filter((header) => !(header in resource))
  if (missing.length) throw new Error(`${resource.id} is missing fields: ${missing.join(', ')}`)
}

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`)
const csv = [headers.join(','), ...resources.map((resource) => headers.map((header) => csvCell(resource[header])).join(','))].join('\n')
await writeFile(csvPath, `${csv}\n`)

const focusCounts = Object.fromEntries([...new Set(resources.map((resource) => resource.focusArea))].map((focusArea) => [
  focusArea,
  resources.filter((resource) => resource.focusArea === focusArea).length,
]))
console.log(JSON.stringify({ total: resources.length, added: additions.length, reclassified: reclassifiedIds.length, focusCounts }, null, 2))
