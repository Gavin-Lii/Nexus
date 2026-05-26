const steps = [
  {
    label: "STEP 1 OF 4",
    title: "Your Question<br />Is the Beginning",
    description:
      "Type your question to begin. We'll show how AI understands your intent, searches across sources, and builds the answer behind the screen.",
    button: "Start your journey",
    video: "assets/step1.mp4",
    loop: true
  },
  {
    label: "STEP 2 OF 4",
    title: "AI Understands<br />Your Question",
    description:
      "Your question is divided into key aspects to understand what to search, compare, and explain. Mapping the question…",
    button: "Explore meaning",
    video: "assets/step2.mp4",
    loop: false,
    stopAt: 5,
    bgLoop: "assets/step2.5.mp4"
  },
  {
    label: "STEP 3 OF 4",
    title: "Searching Across<br />the Universe of Knowledge",
    description:
      "AI explores relevant sources across the web and brings key information together for comparison.",
    button: "Build knowledge",
    video: "assets/step3.mp4",
    loop: false,
    stopAt: 5
  },
  {
    label: "STEP 4 OF 4",
    title: "Evidence Becomes<br />an Answer",
    description:
      "Relevant insights are synthesised into a clear response, supported by visible evidence.",
    button: "Restart",
    video: "assets/step4.mp4",
    loop: false,
    stopAt: 5
  }
];

let currentStep = 0;

const bgVideo = document.getElementById("bgVideo");

const stepLabel = document.getElementById("stepLabel");
const title = document.getElementById("title");
const description = document.getElementById("description");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");

const centralQuestion = document.getElementById("centralQuestion");

const leftPanel = document.querySelector(".left-panel");

const stepContents = document.querySelectorAll(".step-content");

let userQuestion = "Will AI replace human jobs in the future?";

const userEditedContent = {};
let hasEdits = false;

/* -----------------------------
   Hide UI
----------------------------- */

function hideUI() {
  leftPanel.classList.remove("show");
  nextBtn.classList.remove("show-next");
  prevBtn.classList.remove("show-prev");

  stepContents.forEach((content) => {
    content.classList.remove("show");
    content.classList.remove("active");
  });
}

/* -----------------------------
   Show UI
----------------------------- */

function showUI(index) {
  if (index === 3) {
    leftPanel.classList.remove("show");
  } else {
    leftPanel.classList.add("show");
  }

  stepContents.forEach((content, i) => {
    if (i === index) {
      content.classList.add("active");
      content.classList.add("show");
    } else {
      content.classList.remove("active");
      content.classList.remove("show");
    }
  });

  if (index === 0) {
    nextBtn.classList.remove("show-next");
  } else {
    nextBtn.classList.add("show-next");
  }

  if (index <= 0) {
    prevBtn.classList.remove("show-prev");
  } else {
    prevBtn.classList.add("show-prev");
  }
}

/* -----------------------------
   Update text
----------------------------- */

function updateText(index) {
  stepLabel.textContent = steps[index].label;
  title.innerHTML = steps[index].title;
  description.textContent = steps[index].description;

  if (index === steps.length - 1) {
    nextBtn.innerHTML = `<span>↺</span>`;
  } else {
    nextBtn.innerHTML = `<span>→</span>`;
  }
}

/* -----------------------------
   Video Logic
----------------------------- */

function playStepVideo(index) {
  bgVideo.pause();

  bgVideo.onloadedmetadata = null;
  bgVideo.onended = null;
  bgVideo.ontimeupdate = null;

  bgVideo.removeAttribute("src");
  bgVideo.load();

  bgVideo.src = steps[index].video;
  bgVideo.loop = steps[index].loop === true;

  bgVideo.load();

  bgVideo.onloadedmetadata = () => {
    bgVideo.currentTime = 0;

    bgVideo.play().catch(() => {
      showUI(index);
    });
  };

  bgVideo.ontimeupdate = () => {
    const step = steps[index];

    if (!step.loop && step.stopAt && bgVideo.currentTime >= step.stopAt) {
      bgVideo.ontimeupdate = null;
      bgVideo.onended = null;

      if (step.bgLoop) {
        bgVideo.src = step.bgLoop;
        bgVideo.loop = true;
        bgVideo.load();
        bgVideo.play().catch(() => {});
      } else {
        bgVideo.pause();
        bgVideo.currentTime = step.stopAt;
      }

      showUI(index);
    }
  };

  bgVideo.onended = () => {
    if (!steps[index].loop) {
      showUI(index);
    }
  };
}

/* -----------------------------
   Render Step
----------------------------- */

function renderStep(index) {
  currentStep = index;

  hideUI();

  /* Update question text */
  if (index === 1) {
    centralQuestion.textContent = userQuestion;
    setTimeout(makeNodesEditable, 600);
  }

  updateText(index);

  playStepVideo(index);

  if (index === 0) {
    showUI(index);
  }
}

/* -----------------------------
   Next Step
----------------------------- */

function goNext() {
  if (currentStep === 1 && hasEdits) {
    const editedContext = collectEditedContext();
    showRethinkToast();

    fetchSourceContent(userQuestion, editedContext)
      .then(content => applyAIContentToSources(content))
      .catch(err => console.warn('Re-fetch sources failed:', err));

    fetchAnswerContent(userQuestion, editedContext)
      .then(content => applyAIContentToAnswer(content))
      .catch(err => console.warn('Re-fetch answer failed:', err));
  }

  if (currentStep < steps.length - 1) {
    renderStep(currentStep + 1);
  } else {
    renderStep(0);
  }
}

/* -----------------------------
   Button click
----------------------------- */

nextBtn.addEventListener("click", goNext);

prevBtn.innerHTML = `<span>←</span>`;
prevBtn.addEventListener("click", function () {
  if (currentStep > 0) {
    renderStep(currentStep - 1);
  }
});

/* -----------------------------
   Submit Question
----------------------------- */

questionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const typedQuestion = questionInput.value.trim();

  if (typedQuestion.length > 0) {
    userQuestion = typedQuestion;
  }

  // Reset edits for the new question
  Object.keys(userEditedContent).forEach(k => delete userEditedContent[k]);
  hasEdits = false;

  centralQuestion.textContent = userQuestion;

  // Fire API calls in background — video takes ~5s, plenty of time
  fetchNodeContent(userQuestion)
    .then(content => {
      applyAIContentToNodes(content);
    })
    .catch(err => console.warn("Step 2 AI content unavailable:", err));

  fetchSourceContent(userQuestion)
    .then(content => {
      applyAIContentToSources(content);
    })
    .catch(err => console.warn("Step 3 AI content unavailable:", err));

    fetchAnswerContent(userQuestion)
    .then(content => {
      applyAIContentToAnswer(content);
    })
    .catch(err => console.warn("Step 4 AI content unavailable:", err));

  renderStep(1);
});

/* -----------------------------
   Keyboard Controls
----------------------------- */

document.addEventListener("keydown", function (event) {
  const isTyping =
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA";

  if (isTyping) return;

  if (event.key === "ArrowRight") goNext();

  if (event.key === "ArrowLeft") {
    const previous = currentStep === 0 ? 0 : currentStep - 1;
    renderStep(previous);
  }
});

renderStep(0);

/* -----------------------------------------------
   Claude API Key
   ⚠️ 在下面这行替换你的 API Key
----------------------------------------------- */
const ANTHROPIC_KEY = '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';

/* -----------------------------------------------
   Step 2 — Fetch node content from Claude
----------------------------------------------- */

async function fetchNodeContent(question) {
  const prompt = `You output ONLY valid JSON. No markdown, no explanation, no code blocks.

For the question: "${question}"

Return exactly this JSON structure:
{"intent":"...","intent_sub":"...","goal":"...","goal_sub":"...","context":"...","context_sub":"...","implication_chart":"...","implication_sub":"...","temporal_chart":"...","temporal_sub":"...","audience":[{"l":"...","p":75},{"l":"...","p":60},{"l":"...","p":45},{"l":"...","p":30}],"audience_sub":"...","focus":[{"l":"...","p":82},{"l":"...","p":68},{"l":"...","p":51},{"l":"...","p":39}],"focus_sub":"..."}

Rules:
- intent/goal/context: 25-35 words each, specific to the question topic
- intent_sub/goal_sub/context_sub/implication_sub/temporal_sub/audience_sub/focus_sub: 8-12 words, a concise phrase describing what this dimension means for the question
- implication_chart: 3-6 word chart axis label (e.g. "Risk Level (%)")
- temporal_chart: 3-6 word chart axis label (e.g. "Adoption Rate (%)")
- audience: 4 most relevant groups for this question, p = percentage 20-90
- focus: 4 key approaches or solutions relevant to this question, p = percentage 20-90`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const data = await resp.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function applyAIContentToNodes(content) {
  if (!content) return;

  // Subtitle <p> tags under each node heading
  [
    ['.node-1 > p', content.intent_sub],
    ['.node-2 > p', content.audience_sub],
    ['.node-3 > p', content.goal_sub],
    ['.node-4 > p', content.context_sub],
    ['.node-5 > p', content.implication_sub],
    ['.node-6 > p', content.focus_sub],
    ['.node-7 > p', content.temporal_sub],
  ].forEach(([sel, text]) => {
    const el = document.querySelector(sel);
    if (el && text) { el.textContent = text; el.dataset.defaultText = text; }
  });

  // Text cards: Intent (node-1), Goal (node-3), Context (node-4)
  [
    ['.node-1 .node-card-text', content.intent],
    ['.node-3 .node-card-text', content.goal],
    ['.node-4 .node-card-text', content.context],
  ].forEach(([sel, text]) => {
    const el = document.querySelector(sel);
    if (el && text) { el.textContent = text; el.dataset.defaultText = text; }
  });

  // Chart axis labels
  const n5label = document.querySelector('.node-5 .nchart-label');
  if (n5label && content.implication_chart) n5label.textContent = content.implication_chart;

  const n7label = document.querySelector('.node-7 .nchart-label');
  if (n7label && content.temporal_chart) n7label.textContent = content.temporal_chart;

  // Bar charts: Audience (node-2), Focus (node-6)
  function updateBars(nodeSelector, bars) {
    if (!bars) return;
    document.querySelector(nodeSelector)?.querySelectorAll('.nbr').forEach((row, i) => {
      if (!bars[i]) return;
      const lbl  = row.querySelector('.nbr-label');
      const val  = row.querySelector('.nbr-val');
      const fill = row.querySelector('.nbr-fill');
      if (lbl)  lbl.textContent = bars[i].l;
      if (val)  val.textContent = bars[i].p + '%';
      if (fill) fill.style.setProperty('--pct', bars[i].p + '%');
    });
  }

  updateBars('.node-2', content.audience);
  updateBars('.node-6', content.focus);

  makeNodesEditable();
}

/* -----------------------------------------------
   Step 3 — Fetch source content from Claude
----------------------------------------------- */

async function fetchSourceContent(question, editedContext = '') {
  const contextNote = editedContext
    ? `\n\nThe user has refined the analysis dimensions as follows:\n${editedContext}\nLet these refinements guide the relevance and angle of each source.`
    : '';
  const prompt = `You output ONLY valid JSON. No markdown, no explanation, no code blocks.

For the question: "${question}"${contextNote}

Return exactly this JSON structure with 6 sources relevant to the question:
{"sources":[
  {"title":"...","summary":"..."},
  {"title":"...","summary":"..."},
  {"title":"...","summary":"..."},
  {"title":"...","summary":"..."},
  {"title":"...","summary":"..."},
  {"title":"...","summary":"..."}
]}

Rules:
- title: 3-6 words, a relevant study strategy or topic related to the question
- summary: 30-40 words explaining how this topic relates to answering the question
- All 6 sources must be directly relevant to: "${question}"`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const data = await resp.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function applyAIContentToSources(content) {
  if (!content || !content.sources) return;

  const sourceEls = document.querySelectorAll('.step-content[data-step="2"] .source');
  content.sources.forEach((src, i) => {
    const el = sourceEls[i];
    if (!el) return;
    const h3 = el.querySelector('h3');
    const summary = el.querySelector('.source-summary');
    if (h3 && src.title) h3.textContent = src.title;
    if (summary && src.summary) summary.textContent = src.summary;
  });
}

/* -----------------------------------------------
   Stats editor
----------------------------------------------- */

const editStatsBtn = document.getElementById("editStatsBtn");
const statItems = document.querySelectorAll(".stat-item");

let isEditingStats = false;

if (editStatsBtn) {
  editStatsBtn.classList.add("pencil-mode");
  editStatsBtn.addEventListener("click", () => {
    if (!isEditingStats) {
      enableStatsEditing();
    } else {
      saveStatsEditing();
    }
  });
}

function enableStatsEditing() {
  isEditingStats = true;
  editStatsBtn.textContent = "✓";
  editStatsBtn.classList.remove("pencil-mode");

  statItems.forEach((item, index) => {
    const valueSpan = item.querySelector(".stat-value");
    const currentValue = Number(valueSpan.textContent);

    if (index < 2) {
      valueSpan.innerHTML = `
        <input class="stat-input" type="number" min="0" max="100" value="${currentValue}" />
      `;
    }
  });

  const inputs = document.querySelectorAll(".stat-input");
  inputs.forEach((input) => {
    input.addEventListener("input", updateThirdValue);
  });

  updateThirdValue();
}

function updateThirdValue() {
  const inputs = document.querySelectorAll(".stat-input");

  let first = Number(inputs[0]?.value || 0);
  let second = Number(inputs[1]?.value || 0);

  if (first > 100) first = 100;
  if (first < 0) first = 0;

  const maxSecond = 100 - first;
  if (second > maxSecond) second = maxSecond;
  if (second < 0) second = 0;

  inputs[0].value = first;
  inputs[1].value = second;

  const third = 100 - first - second;

  statItems[0].querySelector(".stat-value input").value = first;
  statItems[1].querySelector(".stat-value input").value = second;
  statItems[2].querySelector(".stat-value").textContent = third;
}

function saveStatsEditing() {
  const inputs = document.querySelectorAll(".stat-input");

  const first = Number(inputs[0]?.value || 0);
  const second = Number(inputs[1]?.value || 0);
  const third = 100 - first - second;

  statItems[0].querySelector(".stat-value").textContent = first;
  statItems[1].querySelector(".stat-value").textContent = second;
  statItems[2].querySelector(".stat-value").textContent = third;

  statItems[0].style.setProperty("--w", `${first}%`);
  statItems[1].style.setProperty("--w", `${second}%`);
  statItems[2].style.setProperty("--w", `${third}%`);

  isEditingStats = false;
  editStatsBtn.textContent = "✎";
  editStatsBtn.classList.add("pencil-mode");

  triggerCardsReload();
}

/* -----------------------------------------------
   Card reload after stats edit
----------------------------------------------- */

const newCardData = [
  [
    { title: "National Learning Standards 2024",  pub: "Ministry of Education",    rel: 97 },
    { title: "Digital Pedagogy Policy Brief",      pub: "OECD Publications",        rel: 94 },
    { title: "Student Achievement Framework",      pub: "World Bank Group",         rel: 91 },
    { title: "EdTech Integration Guidelines",      pub: "UNESCO",                   rel: 88 },
    { title: "21st Century Skills Report",         pub: "EU Commission",            rel: 84 },
  ],
  [
    { title: "Study Habits That Actually Work",    pub: "@educationlab",            rel: 96 },
    { title: "Active Recall Explained Simply",     pub: "@learnsci",                rel: 93 },
    { title: "Time Management for Students",       pub: "@studytips",               rel: 90 },
    { title: "Focus Techniques Before Exams",      pub: "@mindfullearner",          rel: 87 },
    { title: "Top Learning Apps This Year",        pub: "@edtech_daily",            rel: 83 },
  ],
  [
    { title: "Metacognition & Learning Outcomes",  pub: "J. Educational Psychology",rel: 98 },
    { title: "Spaced Repetition Effectiveness",    pub: "Cognitive Science Review", rel: 95 },
    { title: "Student Motivation Analysis",        pub: "Learning & Instruction",   rel: 92 },
    { title: "Digital Tools in Education",         pub: "British J. of Edu Tech",   rel: 89 },
    { title: "Memory Consolidation in Study",      pub: "Neuroscience & Education", rel: 85 },
  ],
];

function buildCardBodyHTML({ title, pub, rel }) {
  const filled = Math.round(rel / 11.11);
  const dim    = 9 - filled;
  const dots   = "<i></i>".repeat(filled) + '<i class="dim"></i>'.repeat(dim);
  return `
    <p class="file-title">${title}</p>
    <p class="file-pub">${pub}</p>
    <div class="file-rel">
      <span class="rel-text">Relevance</span>
      <span class="rel-dots">${dots}</span>
      <span class="rel-num">${rel}%</span>
      <span class="rel-check">✓</span>
    </div>`;
}

function triggerCardsReload() {
  const cols = document.querySelectorAll(".evidence-col");

  showThinking();
  cols.forEach((col) => {
    col.querySelectorAll(".file-card").forEach((card) => {
      card.classList.add("loading");
      card.querySelector(".file-body").innerHTML = `
        <span class="skel" style="width:85%;height:10px;margin-bottom:6px;"></span>
        <span class="skel" style="width:58%;height:8px;margin-bottom:7px;"></span>
        <span class="skel" style="width:72%;height:8px;"></span>`;
    });
  });

  setTimeout(() => {
    const cardCount = cols[0] ? cols[0].querySelectorAll(".file-card").length : 5;
    const lastCardDelay = (cardCount - 1) * 90;
    const fadeDuration  = 400;
    const answerDelay   = lastCardDelay + fadeDuration + 60;

    cols.forEach((col, colIdx) => {
      const data = newCardData[colIdx];
      col.querySelectorAll(".file-card").forEach((card, i) => {
        if (!data[i]) return;
        card.classList.remove("loading");
        card.querySelector(".file-body").innerHTML = buildCardBodyHTML(data[i]);
        card.style.opacity = "0";
        card.style.transform = "translateY(8px)";
        setTimeout(() => {
          card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, i * 90);
      });
    });

    setTimeout(streamAnswerUpdate, answerDelay);
  }, 3000);
}

/* -----------------------------------------------
   Stream updated answer text after stats confirm
----------------------------------------------- */

const answerTexts = [
  {
    h2: "By combining structured review cycles with digital tools and reflective practice, students can significantly improve both retention and academic performance.",
    reasoning: "The updated source weighting reveals stronger evidence from official bodies and academic research. Cross-source analysis confirms that consistent, goal-oriented study habits—supported by teacher feedback and spaced repetition—produce the most reliable learning gains.",
  },
  {
    h2: "Students thrive when learning is active, personalised, and supported by timely feedback. Integrating evidence-based strategies produces measurable gains across all subjects.",
    reasoning: "Revised analysis shows institutional guidance and cognitive science research as the dominant sources. Data consistently links metacognitive awareness and deliberate practice with higher academic achievement and long-term knowledge retention.",
  },
];

let answerCycle = 0;

function streamText(el, text, speed, onDone) {
  el.textContent = "";
  let i = 0;
  function tick() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else if (onDone) {
      onDone();
    }
  }
  tick();
}

function showThinking() {
  const h2El = document.querySelector(".answer-block h2");
  const pEl  = document.querySelector(".answer-block p:not(.tag)");
  if (!h2El || !pEl) return;

  h2El.classList.add("thinking-mode");
  h2El.innerHTML = `
    <span class="thinking-word">Thinking</span>
    <span class="thinking-dots">
      <span class="thinking-dot"></span>
      <span class="thinking-dot"></span>
      <span class="thinking-dot"></span>
    </span>`;

  pEl.style.transition = "opacity 0.3s ease";
  pEl.style.opacity    = "0";
}

function hideThinking(onDone) {
  const h2El = document.querySelector(".answer-block h2");
  if (h2El) {
    h2El.classList.remove("thinking-mode");
    h2El.textContent = "";
  }
  if (onDone) setTimeout(onDone, 40);
}

function streamAnswerUpdate() {
  const h2El = document.querySelector(".answer-block h2");
  const pEl  = document.querySelector(".answer-block p:not(.tag)");
  if (!h2El || !pEl) return;

  answerCycle = (answerCycle + 1) % answerTexts.length;
  const { h2, reasoning } = answerTexts[answerCycle];

  hideThinking(() => {
    streamText(h2El, h2, 14, () => {
      pEl.style.opacity = "1";
      setTimeout(() => streamText(pEl, reasoning, 12), 200);
    });
  });
}

/* -----------------------------------------------
   Node chart data & rendering
----------------------------------------------- */

const nodeChartData = {
  'node-5': {
    '1Y':  [5,  8,  10, 12, 10, 11, 13, 15, 14, 16, 18, 20],
    '3Y':  [5,  10, 15, 18, 16, 20, 25, 28, 26, 30, 33, 35],
    '5Y':  [5,  12, 20, 25, 22, 28, 35, 40, 38, 44, 48, 52],
    '10Y': [5,  15, 28, 38, 35, 42, 50, 58, 55, 62, 68, 72],
  },
  'node-7': {
    '1Y':  [12, 18, 22, 28, 32, 35, 38, 40, 38, 42, 45, 48],
    '3Y':  [12, 20, 30, 40, 48, 54, 58, 62, 65, 68, 70, 72],
    '5Y':  [12, 22, 35, 48, 58, 65, 70, 74, 76, 78, 80, 82],
    '10Y': [12, 25, 40, 55, 65, 73, 78, 82, 84, 86, 87, 88],
  },
};

function buildChartPts(values, W, H, PAD) {
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const rng = (mx - mn) || 1;
  return values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - mn) / rng) * (H - PAD * 2);
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
}

function renderNodeChart(nodeEl, period) {
  const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
  const data = nodeChartData[nodeClass];
  if (!data || !data[period]) return;

  const W = 220, H = 58, PAD = 6;
  const pts = buildChartPts(data[period], W, H, PAD);
  const lineStr = pts.join(' ');
  const firstX = pts[0].split(',')[0];
  const lastX  = pts[pts.length - 1].split(',')[0];
  const areaStr = lineStr + ' ' + lastX + ',' + (H + 1) + ' ' + firstX + ',' + (H + 1);

  const svg = nodeEl.querySelector('.node-svg');
  if (!svg) return;
  svg.querySelector('.chart-line').setAttribute('points', lineStr);
  svg.querySelector('.chart-area').setAttribute('points', areaStr);
}

document.querySelectorAll('.node').forEach(nodeEl => {
  const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
  if (nodeChartData[nodeClass]) renderNodeChart(nodeEl, '1Y');
});

document.querySelectorAll('.ncb').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const nodeEl = this.closest('.node');
    const period = this.dataset.period;
    nodeEl.querySelectorAll('.ncb').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderNodeChart(nodeEl, period);
  });
});

/* -----------------------------------------------
   File card hover tooltip
----------------------------------------------- */

const cardSummaries = {
  "The Future of Jobs Report 2023": "Analyses how automation and AI will reshape over 1 billion jobs globally by 2027, highlighting the fastest-growing and most at-risk roles across industries and regions.",
  "AI and the Future of Work": "Models 400 automation use cases, concluding that up to 15% of the global workforce may need to transition occupations by 2030 as AI adoption accelerates.",
  "Automation and Its Impact": "Examines how automation widens wage inequality and argues that targeted upskilling programmes and active labour policy are critical to protecting middle-skill employment.",
  "OECD Employment Outlook 2023": "Cross-country data shows automation risk varies significantly by nation — routine cognitive and manual roles face the highest displacement, while social and analytical skills provide lasting protection.",
  "Global Education Monitor": "Tracks education policy and outcomes across 210 countries, identifying digital literacy, teacher training, and lifelong learning infrastructure as the top priorities in the AI era.",
  "National Learning Standards 2024": "Sets national benchmarks for digital and critical thinking competencies, offering curriculum guidance for schools adapting to AI-assisted and hybrid learning environments.",
  "Digital Pedagogy Policy Brief": "Evidence-based recommendations for integrating digital tools into classroom teaching, with emphasis on equity of access and measurable improvements in learning outcomes.",
  "Student Achievement Framework": "A cross-country study linking structured learning objectives to measurable academic gains, with strongest results in STEM, literacy, and metacognitive skill development.",
  "EdTech Integration Guidelines": "Practical guidance for educators on selecting and implementing educational technology while maintaining student engagement, well-being, and inclusive access.",
  "21st Century Skills Report": "Identifies the core competencies — adaptability, collaboration, digital fluency, and critical thinking — that students need to remain competitive in a rapidly changing economy.",
  "Study Habits That Actually Work": "Curated insights from education researchers showing that spaced practice, retrieval testing, and interleaving consistently outperform passive re-reading and highlighting methods.",
  "Active Recall Explained Simply": "Breaks down the cognitive science of retrieval practice and demonstrates how regular self-quizzing can more than double long-term knowledge retention compared to passive review.",
  "Time Management for Students": "Practical strategies for prioritising study tasks, reducing procrastination, and building consistent daily routines — each shown to independently improve academic performance.",
  "Focus Techniques Before Exams": "Evidence-backed techniques including mindfulness, structured breaks, and distraction-free environments shown to sharpen concentration and reduce anxiety during high-stakes study periods.",
  "Top Learning Apps This Year": "Reviews the most effective digital study tools as rated by students and educators, comparing engagement features, evidence base, and measurable impact on exam results.",
  "Metacognition & Learning Outcomes": "Demonstrates that students who actively monitor and regulate their own thinking achieve significantly higher scores and retain knowledge longer than peers who do not.",
  "Spaced Repetition Effectiveness": "A meta-analysis of 50 controlled studies confirming that spaced repetition outperforms massed practice across all subjects, age groups, and learning contexts.",
  "Student Motivation Analysis": "Identifies intrinsic motivation, clear goal-setting, and consistent teacher support as the three strongest independent predictors of sustained academic engagement and achievement.",
  "Digital Tools in Education": "Evaluates how tablets, AI tutors, and learning management systems affect student outcomes across secondary schools in 12 countries, with mixed but overall positive results.",
  "Memory Consolidation in Study": "Explains the neuroscience of memory formation and shows how sleep, physical exercise, and spaced retrieval practice strengthen consolidation of studied material.",
};

const tooltipEl = document.createElement('div');
tooltipEl.className = 'file-card-tooltip';
tooltipEl.innerHTML = '<p class="file-card-tooltip-type"></p><p class="file-card-tooltip-text"></p>';
document.body.appendChild(tooltipEl);

function getTooltipType(card) {
  const header = card.closest('.evidence-col')?.querySelector('.evidence-col-header')?.textContent?.toLowerCase() || '';
  if (header.includes('social')) return 'Post Summary';
  if (header.includes('academic')) return 'Article Summary';
  return 'Website Summary';
}

document.addEventListener('mouseover', function (e) {
  const card = e.target.closest('.file-card');
  if (!card) return;
  const titleText = card.querySelector('.file-title')?.textContent?.trim();
  const summary = cardSummaries[titleText];
  if (!summary) return;

  tooltipEl.querySelector('.file-card-tooltip-type').textContent = getTooltipType(card);
  tooltipEl.querySelector('.file-card-tooltip-text').textContent = summary;

  const rect = card.getBoundingClientRect();
  const tipW = 230;
  const gap = 10;
  let left = rect.left - tipW - gap;
  if (left < 8) left = rect.right + gap;
  let top = rect.top;
  const tipH = tooltipEl.offsetHeight || 120;
  if (top + tipH > window.innerHeight - 8) top = window.innerHeight - tipH - 8;

  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top  = top  + 'px';
  tooltipEl.classList.add('visible');
});

document.addEventListener('mouseout', function (e) {
  if (e.target.closest('.file-card')) {
    tooltipEl.classList.remove('visible');
  }
});

async function fetchAnswerContent(question, editedContext = '') {
  const contextNote = editedContext
    ? `\n\nThe user has refined the analysis dimensions as follows:\n${editedContext}\nLet these refinements shape the focus and framing of your answer.`
    : '';
  const prompt = `You output ONLY valid JSON. No markdown, no explanation, no code blocks.

For the question: "${question}"${contextNote}

Return exactly this JSON:
{"answer":"...","reasoning":"..."}

Rules:
- answer: 30-40 words, a direct clear answer to the question
- reasoning: 40-50 words, explaining the evidence and logic behind the answer`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const data = await resp.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function applyAIContentToAnswer(content) {
  if (!content) return;
  const h2El = document.querySelector('.answer-block h2');
  const pEl  = document.querySelector('.answer-block p:not(.tag)');
  if (h2El && content.answer) streamText(h2El, content.answer, 14);
  if (pEl && content.reasoning) {
    setTimeout(() => streamText(pEl, content.reasoning, 12), content.answer.length * 14 + 200);
  }
}

/* -----------------------------------------------
   Editable node fields
----------------------------------------------- */

const rethinkToast = document.createElement('div');
rethinkToast.className = 'rethink-toast';
rethinkToast.textContent = 'Re-thinking based on your edits…';
document.body.appendChild(rethinkToast);

function showRethinkToast() {
  rethinkToast.classList.add('show');
  setTimeout(() => rethinkToast.classList.remove('show'), 3000);
}

function collectEditedContext() {
  const labelMap = {
    'node-1_sub':  'Intent description',
    'node-1_card': 'Intent detail',
    'node-2_sub':  'Audience description',
    'node-3_sub':  'Goal description',
    'node-3_card': 'Goal detail',
    'node-4_sub':  'Context description',
    'node-4_card': 'Context detail',
    'node-5_sub':  'Implication description',
    'node-6_sub':  'Focus description',
    'node-7_sub':  'Temporal description',
  };
  return Object.entries(userEditedContent)
    .map(([k, v]) => `${labelMap[k] || k}: ${v}`)
    .join('\n');
}

function makeNodesEditable() {
  // Subtitle <p> tags — visible without hovering
  document.querySelectorAll('.node > p').forEach(p => {
    const nodeEl = p.closest('.node');
    const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
    if (nodeClass) attachEditable(p, nodeClass + '_sub');
  });

  // Card body text — visible inside expanded card (nodes 1, 3, 4)
  document.querySelectorAll('.node-card-text').forEach(el => {
    const nodeEl = el.closest('.node');
    const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
    if (nodeClass) attachEditable(el, nodeClass + '_card');
  });
}

function attachEditable(el, key) {
  if (el.dataset.editableReady) return;
  el.dataset.editableReady = 'true';
  el.dataset.defaultText = el.textContent.trim();
  el.classList.add('node-editable');

  el.addEventListener('click', function (e) {
    e.stopPropagation();
    this.contentEditable = 'true';
    this.focus();

    // Move caret to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(this);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    // Keep card open while editing
    const nodeEl = this.closest('.node');
    if (nodeEl) nodeEl.classList.add('is-editing');
  });

  el.addEventListener('blur', function () {
    this.contentEditable = 'false';
    const val = this.textContent.trim();
    const nodeEl = this.closest('.node');

    if (val === '') {
      // User deleted everything — restore default
      this.textContent = this.dataset.defaultText;
      delete userEditedContent[key];
      unmarkIfClean(nodeEl, key);
    } else {
      userEditedContent[key] = val;
      hasEdits = true;
      markAsEdited(this);
    }

    hasEdits = Object.keys(userEditedContent).length > 0;
    if (nodeEl) nodeEl.classList.remove('is-editing');
  });

  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.blur();
    }
    if (e.key === 'Escape') {
      this.contentEditable = 'false';
      this.blur();
    }
  });
}

function markAsEdited(el) {
  const nodeEl = el.closest('.node');
  const h3 = nodeEl?.querySelector('h3');
  if (h3 && !h3.querySelector('.node-edited-badge')) {
    const badge = document.createElement('span');
    badge.className = 'node-edited-badge';
    badge.title = 'Edited — will influence subsequent results';
    h3.appendChild(badge);
  }
}

/* -----------------------------------------------
   Node overflow guard — keeps expanded cards inside viewport
----------------------------------------------- */

function initNodeOverflowGuard() {
  // Hover transform shifts the node visually by (-14px, -12px)
  const HOVER_DX   = -14;
  const HOVER_DY   = -12;
  // Expanded node dimensions (250px content + 28px padding; max card height + heading)
  const EXPANDED_W = 278;
  const EXPANDED_H = 380;
  const EDGE_GAP   = 12; // minimum gap from viewport edge

  document.querySelectorAll('.node').forEach(nodeEl => {
    nodeEl.addEventListener('mouseenter', () => {
      const rect = nodeEl.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Visual bounds after CSS hover transform
      const vLeft = rect.left + HOVER_DX;
      const vTop  = rect.top  + HOVER_DY;

      let dx = 0, dy = 0;

      // Right edge overflow
      if (vLeft + EXPANDED_W > W - EDGE_GAP) {
        dx = (W - EDGE_GAP) - (vLeft + EXPANDED_W);
      }
      // Left edge (safety)
      if (vLeft + dx < EDGE_GAP) {
        dx = EDGE_GAP - vLeft;
      }
      // Bottom edge overflow
      if (vTop + EXPANDED_H > H - EDGE_GAP) {
        dy = (H - EDGE_GAP) - (vTop + EXPANDED_H);
      }
      // Top edge (safety)
      if (vTop + dy < EDGE_GAP) {
        dy = EDGE_GAP - vTop;
      }

      if (dx !== 0 || dy !== 0) {
        nodeEl.style.left = (rect.left + dx) + 'px';
        nodeEl.style.top  = (rect.top  + dy) + 'px';
      }
    });

    nodeEl.addEventListener('mouseleave', () => {
      nodeEl.style.left = '';
      nodeEl.style.top  = '';
    });
  });
}

initNodeOverflowGuard();

function unmarkIfClean(nodeEl, clearedKey) {
  if (!nodeEl) return;
  const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
  if (!nodeClass) return;
  // Check if any other field for this node still has a user edit
  const stillEdited = Object.keys(userEditedContent).some(k => k.startsWith(nodeClass));
  if (!stillEdited) {
    const badge = nodeEl.querySelector('h3 .node-edited-badge');
    if (badge) badge.remove();
  }
}