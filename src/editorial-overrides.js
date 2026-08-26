// Hand-written editorial copy for the highest-impact entries in the index.
// Keyed by resource id from data/scholar_tube_resources.json; getResourceDetail
// prefers these over generated copy. Every key is validated against the
// catalog by scripts/test-resource-detail.mjs, so a renamed or removed id
// fails loudly instead of silently dropping an override.

export const editorialOverrides = {
  // --- Interviews & podcasts -------------------------------------------------

  // Andrej Karpathy on Lex Fridman #333
  'ST-001': {
    whyWatch:
      'Recorded three months after Karpathy left Tesla, this is him speaking with unusual freedom about what actually happened inside Autopilot and Optimus: why he bet on vision-only driving, how the data engine was organized, and what large models change for robotics. Lex Fridman lets the conversation run past three hours, so the reasoning arrives with its context — including the doubts — instead of as polished conclusions.',
    audience:
      'Best for engineers and researchers who want a first-person account of shipping neural networks on real vehicles, and for anyone weighing a move between research and production ML. At 3h 29m, treat it like a long drive companion and lean on the chapter markers: the Tesla, Optimus, and AGI segments each stand alone.',
  },

  // Andrej Karpathy on Dwarkesh Patel, 2025
  'ST-009': {
    whyWatch:
      'The title carries the actual thesis: Karpathy argues we are summoning ghosts — imitations distilled from human data — rather than raising animal-like minds, and traces what that implies for agents, reinforcement learning, and the pace of the coming decade. Dwarkesh Patel pushes back hard enough that the timelines get stress-tested instead of admired. It is one of the clearest statements of the sober-but-still-bullish position anywhere in this index.',
    audience:
      'Watch it when you need to calibrate: researchers deciding what to work on next, and engineers who want an honest read on where LLM-based agents genuinely stand. It runs 2h 26m and assumes fluency with the current LLM stack — newcomers should take Karpathy’s “Intro to Large Language Models” first and return.',
  },

  // Ilya Sutskever on Dwarkesh Patel, 2025
  'ST-008': {
    whyWatch:
      'Sutskever gives long interviews rarely enough that this 2025 conversation is a data point in itself. His central claim — that the field is leaving the age of scaling and entering an age of research, where taste in problems matters more than compute — cuts against most of the industry’s public posture, and he defends it in detail. You also get his current thinking on superintelligence and why he structured his own lab the way he did.',
    audience:
      'For researchers and research-adjacent engineers deciding where conviction should replace consensus. The 1h 36m runtime rewards full attention rather than background listening. Pair it with his 2023 Dwarkesh appearance to see which of his positions moved — the delta between the two is half the lesson.',
  },

  // Ilya Sutskever on Dwarkesh Patel, 2023
  'ST-013': {
    whyWatch:
      'This 2023 conversation catches Sutskever mid-scaling-era, making the strongest public version of the case that next-token prediction — pushed far enough — could surpass human intelligence: to predict the next token well, a model must compress the world that produced it. The argument has been quoted, compressed, and distorted endlessly since; here it is in its original form, with the caveats attached.',
    audience:
      'Essential context for anyone working on or arguing about LLM capabilities. At 48 minutes it fits a single sitting, and it doubles as a historical benchmark: watch it alongside his 2025 “age of research” interview and score his predictions yourself. No prerequisites beyond knowing roughly how language models are trained.',
  },

  // Richard Sutton on Dwarkesh Patel, 2025
  'ST-011': {
    whyWatch:
      'The author of “The Bitter Lesson” — the essay the LLM era claims as scripture — explains why he thinks LLMs are a dead end, and the collision is the content: Sutton argues that real intelligence must learn from its own experience, not from imitating human text, and Dwarkesh Patel keeps disagreeing on the record. Whichever side you take, this is the sharpest version of the RL-versus-imitation argument available in one recording.',
    audience:
      'For researchers who want their assumptions pressed by the person with the longest track record of being uncomfortably right. It runs 1h 7m and assumes you know what RL and LLM training loops are; it pairs naturally with David Silver’s “Is human data enough?” talk elsewhere in this index.',
  },

  // Demis Hassabis on Lex Fridman #475
  'ST-006': {
    whyWatch:
      'Hassabis is running the lab that treats AI as an instrument for science, and this 2025 conversation shows how that worldview fits together: simulating reality, why games were the right training ground, what AlphaFold-style wins imply about what models can know, and where he thinks AGI actually lands. Lex Fridman gives it two and a half hours, so the systems thinking unfolds rather than getting compressed into soundbites.',
    audience:
      'Best for researchers who care about AI as a tool for discovery rather than only as a product, and for anyone comparing DeepMind’s trajectory against the scaling-first labs. At 2h 28m, split it at the physics-and-simulation midpoint if needed — both halves stand on their own.',
  },

  // Geoffrey Hinton on The Robot Brains Podcast
  'ST-035': {
    whyWatch:
      'Days after quitting Google in May 2023, Hinton explains the reversal to Pieter Abbeel — a fellow researcher, which changes everything about the conversation. Instead of a journalist asking whether AI is scary, you get a technical exchange about why backpropagation running on digital hardware may be a better learning algorithm than whatever brains do, and why that conclusion made Hinton change his mind about risk.',
    audience:
      'For researchers who found the news coverage of Hinton’s exit thin and want the actual argument. The 1h 2m runtime fits one focused session. You should know what backpropagation is; you do not need any background in AI-safety debates — this is the technical route into them.',
  },

  // Fei-Fei Li at Bloomberg on World Labs
  'ST-981': {
    whyWatch:
      'Eighteen minutes of Fei-Fei Li making the concentrated pitch for spatial intelligence: why language-first models miss the 3D structure of the world, and why World Labs is betting that large world models are the next substrate. Because it is compressed for a business audience, the claims arrive stripped of hedging — which makes it unusually easy to see the thesis and decide what you think of it.',
    audience:
      'A high-density primer for anyone tracking the world-model race — researchers triaging whether spatial intelligence deserves a place on their reading list, and builders watching where frontier funding is pointed. At 18 minutes it is the fastest credible entry to this shelf; go to her long-form interviews afterwards if the argument lands.',
  },

  // Eliezer Yudkowsky on Lex Fridman #368
  'ST-004': {
    whyWatch:
      'This is the strongest form of the AI-doom argument, delivered by its most committed advocate for over three hours, with Lex Fridman probing rather than deferring. Yudkowsky argues that alignment is unsolved, that current trajectories end badly, and that most optimism is wishful — and hearing the case whole, rather than through screenshots and paraphrase, is the only fair way to evaluate it.',
    audience:
      'For researchers and builders who want to steelman the pessimistic position instead of dismissing a caricature of it. At 3h 18m it demands scheduling; the sections on alignment difficulty stand alone if you cannot commit to the whole. No technical prerequisites — the argument is conceptual, not mathematical.',
  },

  // --- Courses & follow-along builds ------------------------------------------

  // Karpathy: Let's build GPT from scratch
  'ST-136': {
    whyWatch:
      'This is the recording that turned “I sort of understand transformers” into “I have built one” for an unusually large fraction of the field. Karpathy writes a GPT from an empty file: tokenization, self-attention assembled tensor by tensor, and a training loop that ends with generated text — every claim about attention backed by code on screen. Two hours of video that replace months of circling the architecture from the outside.',
    audience:
      'For anyone who can read Python and knows what a gradient is — from students to senior engineers who have only ever called transformer APIs. Type along; do not just watch. Budget the 1h 56m of video plus at least that again for your own implementation, and take the micrograd and makemore sessions first if backpropagation is still hazy.',
  },

  // Karpathy: Deep Dive into LLMs like ChatGPT
  'ST-144': {
    whyWatch:
      'Karpathy’s 2025 end-to-end tour of what a production LLM actually is: pretraining data and tokenization, the shape of post-training and RLHF, why models hallucinate, and how to think about what tools like ChatGPT do and do not know. It is the rare resource that is simultaneously honest about mechanics and watchable without writing code — the connective tissue between his one-hour intro and the from-scratch builds.',
    audience:
      'The right second step for almost everyone: engineers about to build on LLM APIs, researchers from adjacent fields, and technical leaders who need their mental model to be correct rather than vibes. At 3h 31m, watch it in two or three sittings — the chapter structure is clean — with no prerequisites beyond his shorter intro talk or equivalent.',
  },

  // Karpathy: 1hr Intro to Large Language Models
  'ST-147': {
    whyWatch:
      'The busy person’s introduction to LLMs, from the person best qualified to compress the subject honestly. In one hour Karpathy covers what a model’s weights are, why scaling works, the LLM-as-operating-system framing, and a sober tour of jailbreaks and security — memorable without being misleading, which almost no other one-hour treatment manages.',
    audience:
      'The single best first watch in this index for anyone new to modern AI, and a vocabulary-alignment tool worth sending to colleagues before a project kicks off. Exactly 1h, no prerequisites at all. If it leaves you wanting mechanism rather than framing, “Deep Dive into LLMs” is the natural next step.',
  },

  // Karpathy: micrograd
  'ST-106': {
    whyWatch:
      'Backpropagation is the one algorithm everything else in deep learning stands on, and this is the best explanation of it ever recorded: Karpathy builds micrograd, a complete autograd engine, in roughly a hundred lines of Python, deriving the chain rule on camera as running code rather than as notation. If backprop has always been a formula you trust but do not feel, these two and a half hours fix that permanently.',
    audience:
      'For students meeting neural networks properly for the first time, and for practitioners who suspect their foundations are load-bearing guesses. Requires only basic Python and high-school calculus. Type every line — the 2h 26m runtime doubles when done right, and that is the point. It is the intended first step of the entire Karpathy sequence.',
  },

  // Karpathy: makemore
  'ST-149': {
    whyWatch:
      'The bridge between understanding gradients and understanding GPT. Karpathy builds makemore, a character-level language model, starting from a bigram lookup table and climbing to a neural network — introducing embeddings, sampling, and the loss curves of language modeling with everything visible in code. Watched in sequence after micrograd, it makes the eventual transformer feel inevitable rather than magical.',
    audience:
      'For learners working through the Karpathy sequence in order — micrograd first, this second, “Let’s build GPT” after. Comfortable Python required, nothing more. Budget the 1h 58m plus your own follow-along time, and resist skipping ahead: the bigram-to-neural progression is where the intuition actually forms.',
  },

  // Stanford CS229 Lecture 1, Andrew Ng
  'ST-076': {
    whyWatch:
      'The opening lecture of the most-cited machine learning course in the world, taught by Andrew Ng in its canonical Autumn 2018 form. What it offers that newer material does not is the classical frame: supervised versus unsupervised learning, why generalization is the whole game, and the mathematical posture the deep-learning era quietly assumes. Thousands of researchers trace their foundations to exactly this room.',
    audience:
      'For students and self-taught practitioners who intend to learn ML properly — math first, frameworks later — and are choosing a course to commit to. The 1h 15m lecture itself is easy; the decision it forces (whether to follow the full CS229 sequence, problem sets included) is the real commitment. Linear algebra and probability are assumed from lecture two onward.',
  },

  // Stanford CS229: Building LLMs
  'ST-077': {
    whyWatch:
      'A single Stanford CS229 session that compresses the entire LLM production stack into under two hours: pretraining data and scaling laws, tokenization, post-training, and evaluation, delivered at the level of rigor a graduate ML course demands rather than conference-keynote altitude. It answers, in one sitting, the question “what would I actually need to get right to train one of these?”',
    audience:
      'Ideal for people who already know classical ML and want the LLM stack mapped onto that foundation — graduate students, and engineers moving from traditional ML into language models. Budget the full 1h 45m with notes; the scaling-laws section repays a second pass. It pairs well with Stanford’s CS336 for those who then want to build the components themselves.',
  },

  // MIT 6.S191 2025 opener
  'ST-107': {
    whyWatch:
      'MIT’s deep learning bootcamp re-records its opening lecture every year, which makes this 2025 edition something rare: a foundations lecture that is also current. Alexander Amini covers perceptrons through training dynamics at a genuinely fast clip, with the polish of a lecture that has been iterated annually for nearly a decade. It is the strongest single-hour classroom introduction to deep learning available anywhere.',
    audience:
      'For newcomers who want a university-grade on-ramp without committing to a full semester, and for practitioners after a fast structured refresh. The 1h 9m opener assumes calculus and some programming, nothing more. If it clicks, the rest of the 6.S191 series in this index continues directly; if you want slower and deeper, CS229 is the alternative path.',
  },

  // Stanford CS224N 2021 Lecture 1
  'ST-079': {
    whyWatch:
      'Christopher Manning — one of the people who built modern NLP — opens Stanford’s flagship language course with the question everything else depends on: what does it mean for a machine to represent meaning? The word-vectors lecture that follows is the conceptual ancestor of every embedding in every LLM now running. The 2021 edition catches the course fully aware of transformers while still teaching the foundations they rest on.',
    audience:
      'For anyone serious about NLP rather than just LLM APIs: students starting the field, and engineers who want to understand why embeddings behave the way they do. The 1h 24m lecture assumes linear algebra and basic ML. Treat it as the gateway to the full CS224N sequence — it is designed to be lecture one of twenty, and it shows.',
  },

  // Stanford CS231N 2025 Lecture 1
  'ST-083': {
    whyWatch:
      'CS231N is the course that trained a generation of vision researchers, and this Spring 2025 opener shows what its famous arc — from image classification fundamentals to the frontier — looks like after the multimodal turn. The introduction maps how computer vision became the proving ground of deep learning and where the field sits now that vision and language models are converging, with the course’s trademark discipline intact.',
    audience:
      'For students committing to vision as a specialty and engineers who need more than “fine-tune a pretrained backbone.” The 1h 3m introduction is watchable by anyone, but the sequence it opens assumes linear algebra, probability, and real programming. Decide here whether to follow the full Spring 2025 series, which continues in this index.',
  },

  // Stanford CS234 2019 Lecture 1
  'ST-080': {
    whyWatch:
      'Emma Brunskill opens Stanford’s reinforcement learning course with the formal core the entire field shares: sequential decision-making, Markov decision processes, and the exploration-exploitation trade-off, stated precisely instead of by analogy. As RLHF and agentic training push RL back to the center of AI, this disciplined 2019 foundation has aged into prerequisite reading rather than history.',
    audience:
      'For anyone who keeps meeting RL concepts — policies, value functions, reward hacking — and wants the real definitions under them. Requires probability and comfort with mathematical notation; no prior RL. The 1h 6m opener commits you to nothing, but it is built as the first step of the full CS234 sequence available in this index.',
  },

  // Stanford CS336 2025 Lecture 1
  'ST-571': {
    whyWatch:
      'CS336 is Stanford’s answer to a real gap: everyone uses language models, almost no one has built one end to end. This opening lecture lays out the course’s premise — that you understand the stack by implementing all of it — and dives straight into tokenization, the unglamorous layer where more practical LLM problems originate than most practitioners suspect. It is the closest thing to a syllabus for the “can actually train one” tier of the field.',
    audience:
      'For engineers and graduate students who want to cross from using LLMs to building them, with the systems appetite that implies. Solid Python, PyTorch, and ML fundamentals are assumed from minute one. The 1h 19m opener tells you honestly whether the full sequence — which continues in this index — is worth your next quarter.',
  },

  // Stanford CS25 with Karpathy
  'ST-082': {
    whyWatch:
      'Karpathy guest-opens Stanford’s transformers course with the history most explanations skip: where attention actually came from, how a translation trick became the architecture that ate the field, and why the transformer won over its competitors. It is the origin-story lecture — shorter and more conceptual than his from-scratch builds, and the ideal frame to hold before or after them.',
    audience:
      'For anyone who can follow ML at the whiteboard level and wants the transformer explained as a designed artifact with a lineage, not a given. The 1h 12m session assumes you know what a neural network is but does not require implementation experience. Watch it before “Let’s build GPT” for context, or after it for consolidation — both orderings work.',
  },

  // Stanford Introduction to Robotics, 2008
  'ST-344': {
    whyWatch:
      'Stanford’s classical robotics course, recorded in 2008 — and that date is the point. Kinematics, dynamics, and control: the physics-grounded core that learning-based robotics still stands on and still fails without. When a learned policy jitters on real hardware, the explanation is usually in this material. It survives in the index precisely because no amount of deep learning has made it optional.',
    audience:
      'For robotics students who keep being told to “just learn the classical foundations” and want the canonical version of them, and for embodied-AI researchers whose pipelines touch real actuators. Requires linear algebra and basic mechanics; expect chalkboard mathematics, not demos. The 58-minute opener sets up a full lecture sequence — commit accordingly.',
  },

  // AI Agents, Clearly Explained (Jeff Su)
  'ST-336': {
    whyWatch:
      'Ten minutes that fix the vocabulary problem. “Agent” is the most abused word in current AI, and this explainer draws the lines that keep getting blurred — chatbot versus automated workflow versus agent that plans and acts — with concrete examples instead of hype. It contains no research depth by design; it exists so that the deeper material on this shelf lands on solid definitions.',
    audience:
      'For newcomers to the agents literature, and for anyone about to sit in a meeting where “agentic” will be said unchallenged. At 10 minutes it is the cheapest possible entry point — watch it, then move directly to the research talks and courses in the Agents section, which assume exactly the clarity this provides.',
  },

  // Tsinghua NLP big-model open course
  'ST-538': {
    whyWatch:
      'Zhiyuan Liu’s Tsinghua NLP group open-sourced what is effectively a full graduate curriculum on large models: from foundations through training, tool use, and hands-on practice, in Chinese, from one of the strongest NLP labs in China. At over seventeen hours it is not a video — it is a course that happens to be free, taught by researchers who build these systems rather than commentate on them.',
    audience:
      'The strongest Chinese-first systematic path through large models in this index: ideal for students and engineers who learn fastest in Chinese and want lab-grade material rather than translated summaries. ML basics are assumed. At 17h 37m, schedule it across weeks like a real course — and expect the hands-on segments to demand a working Python setup.',
  },

  // Autolabor ROS course
  'ST-278': {
    whyWatch:
      'The most complete Chinese-language ROS course in the index — nearly fifty hours that walk from environment setup through ROS communication, simulation, and navigation, in the tool-by-tool detail that robotics work actually requires. World-model talks are inspiring; this is the layer where a robot either builds or does not. Its enormous view count reflects a simple fact: it is the path of record for Chinese-speaking ROS beginners.',
    audience:
      'For students and engineers who intend to make a real robot move, especially Chinese speakers starting ROS from zero; basic C++ or Python is enough to begin. At 49h 15m this is a curriculum, not a watch: work alongside it with ROS installed, section by section, over weeks. Skip it entirely if your interest in robotics is conceptual rather than practical.',
  },

  // 李沐: how to read papers
  'ST-875': {
    whyWatch:
      'Seven minutes in which Mu Li — researcher and author of “Dive into Deep Learning” — lays out the multi-pass method for reading papers: what to extract on a first skim, when a paper earns a careful second pass, and when it deserves none. It opens his paper-reading series on Bilibili, where the method is then demonstrated on landmark papers. Pound for pound, one of the highest-leverage recordings in the entire index.',
    audience:
      'For every graduate student drowning in their reading list, ideally watched before the drowning starts. Delivered in Chinese, seven minutes, no prerequisites. The real assignment is what follows: apply the method to the next three papers you read, then use his full 论文精读 series to watch it executed on classics.',
  },

  // --- Talks & keynotes ---------------------------------------------------------

  // Larry McEnerney: The Craft of Writing Effectively
  'ST-864': {
    whyWatch:
      'McEnerney’s argument is genuinely subversive: your writing fails not because it is unclear but because it gives readers no reason to care — writing is not for conveying your ideas, it is for changing what readers think, and academia trains you to do the opposite. He is blunt to the point of discomfort with the Chicago students in the room, and that is precisely why the lecture rewires people. Nine million views for a writing seminar is not an accident.',
    audience:
      'For graduate students and researchers whose papers keep coming back with “unclear motivation,” and for anyone who writes for expert readers. The 1h 22m session will make you defensive in the first twenty minutes; watch to the end anyway, then rewrite the introduction of whatever you are currently working on. No prerequisites except having something to write.',
  },

  // Hamming: You and Your Research
  'ST-866': {
    whyWatch:
      'Hamming spent decades at Bell Labs watching brilliant colleagues do unimportant work, and this 1995 talk is his unsparing account of the difference: working on problems that matter, keeping courage, working with the door open, and why luck favors the prepared mind. It is the single most recommended talk on research careers in existence, and it has aged into something close to scripture because every claim comes from watching real careers succeed and stall.',
    audience:
      'Mandatory viewing for PhD students — ideally in year one, then again in year four when it reads completely differently. Researchers at any stage who feel busy but not consequential are the other audience. At 44 minutes there is no scheduling excuse; watch it with a notebook and answer his question honestly: why are you not working on the most important problem in your field?',
  },

  // Susan McConnell: scientific presentations
  'ST-865': {
    whyWatch:
      'The rare presentations talk that is itself a flawless presentation. McConnell, a Stanford neurobiologist, dismantles the slide habits scientists inherit — walls of text, unreadable figures, structureless talks — and rebuilds them around storytelling and visual design, demonstrating every principle live as she teaches it. Watching the form match the content is half the instruction.',
    audience:
      'For any researcher with a talk on the calendar: conference speakers, students facing a qualifying exam or defense, and PIs whose group meetings sprawl. At 42 minutes it fits the week before your talk, which is exactly when to watch it — with your current slide deck open, cutting text as she tells you to.',
  },

  // Jensen Huang GTC 2024 keynote
  'ST-151': {
    whyWatch:
      'The keynote where Blackwell was announced — and, more usefully, two hours of the person setting the price and pace of AI compute explaining his own roadmap: the chips, the systems economics, and the robotics and simulation stack NVIDIA is assembling around them. As a primary source on the industrial machine underneath the model era, nothing else in the index matches it. The theater is part of the data.',
    audience:
      'For researchers and engineers who want to understand the hardware constraints shaping what gets trained, and for anyone reading the industry’s direction from its supply side. At 2h 3m, watch the Blackwell and simulation segments closely and skim the partner showcase. No prerequisites — but the more you know about training costs, the more the numbers mean.',
  },

  // Demis Hassabis: The future of intelligence
  'ST-175': {
    whyWatch:
      'DeepMind’s own channel, Hassabis in conversation with Hannah Fry, and a title — “The future of intelligence” — that the lab clearly intends as a statement of direction. Fry is a genuinely skilled interlocutor, so the hour covers where models are headed, what AI means for science, and how DeepMind thinks about the road to AGI at a level between press release and technical talk: candid enough to be informative, official enough to be load-bearing.',
    audience:
      'For researchers tracking where DeepMind is actually pointed, and for anyone building a considered view on AGI timelines who prefers primary sources over commentary about them. The 56-minute runtime fits one sitting. It pairs directly with Shane Legg’s companion conversation from the same channel — watch both and note where the two accounts differ.',
  },

  // Shane Legg: The arrival of AGI
  'ST-190': {
    whyWatch:
      'Shane Legg helped put the term “AGI” into circulation two decades ago and co-founded DeepMind to pursue it, which makes “The arrival of AGI” a title he has earned the right to use. In conversation with Hannah Fry he does what almost no one discussing AGI does: define the term carefully, explain what evidence would count, and put his reasoning about timelines on the record. A rare case of definitional rigor from inside a frontier lab.',
    audience:
      'For anyone who uses the word AGI in arguments and wants to hold a defensible definition of it, and for researchers calibrating their own timelines against someone with a twenty-year track record on the question. At 53 minutes it is one focused sitting; watch it before the Hassabis companion piece for the sharper conceptual framing of the pair.',
  },

  // David Silver: Is human data enough?
  'ST-166': {
    whyWatch:
      'David Silver led AlphaGo and AlphaZero — the systems that proved machines could exceed human play without human examples — and here he aims that lesson at the LLM era, arguing the field must move beyond imitating human data into an era of learning from experience. It is the research-grounded version of the position Richard Sutton argues polemically, delivered by the person with the strongest empirical claim to it.',
    audience:
      'For researchers weighing where post-LLM capabilities will come from, and for anyone who found the Sutton interview provocative but wanted the constructive half of the argument. The 50-minute talk assumes basic RL literacy — knowing what AlphaZero did and roughly how. Watch it alongside the Sutton conversation; agreement and difference between the two are equally instructive.',
  },

  // Sam Altman at TED2025
  'ST-354': {
    whyWatch:
      'Not a keynote but an on-stage interrogation: TED’s Chris Anderson pushes Altman on agents acting in the world, safety, and superintelligence, live in April 2025, and the value is watching which questions get direct answers and which get deflected. For an index built on primary sources, this is the reference recording of what OpenAI’s chief executive was willing to commit to publicly at the moment agents became a mainstream promise.',
    audience:
      'For researchers and builders tracking the gap between frontier-lab public positioning and technical reality, and for anyone whose work depends on what OpenAI does next. At 48 minutes it fits one sitting, and it needs no technical background — just enough context on agents to notice what goes unsaid. Read skeptically; that is the exercise.',
  },
}
