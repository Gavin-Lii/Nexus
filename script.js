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

const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");

const centralQuestion = document.getElementById("centralQuestion");

const leftPanel = document.querySelector(".left-panel");

const stepContents = document.querySelectorAll(".step-content");

let userQuestion = "Will AI replace human jobs in the future?";

/* -----------------------------
   Hide UI
----------------------------- */

function hideUI() {
  leftPanel.classList.remove("show");
  nextBtn.classList.remove("show-next");

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
  }

  updateText(index);

  playStepVideo(index);

  /*
    Step 1:
    UI immediately visible
  */

  if (index === 0) {
    showUI(index);
  }

  /*
    Step 2/3/4:
    wait until video finishes
  */
}

/* -----------------------------
   Next Step
----------------------------- */

function goNext() {
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

/* -----------------------------
   Submit Question
----------------------------- */

questionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const typedQuestion = questionInput.value.trim();

  if (typedQuestion.length > 0) {
    userQuestion = typedQuestion;
  }

  centralQuestion.textContent = userQuestion;

  renderStep(1);
});

/* -----------------------------
   Keyboard Controls
----------------------------- */

document.addEventListener("keydown", function (event) {
  const isTyping =
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA";

  if (isTyping) {
    return;
  }

  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    const previous = currentStep === 0 ? 0 : currentStep - 1;
    renderStep(previous);
  }
});

renderStep(0);

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

  /* widths intentionally NOT updated here — animate only on confirm (✓) */
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
   Card reload: skeleton → new titles (3 s)
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

  /* 1 — show skeleton + thinking indicator */
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

  /* 2 — restore with new titles after 3 s, staggered */
  setTimeout(() => {
    const cardCount = cols[0] ? cols[0].querySelectorAll(".file-card").length : 5;
    const lastCardDelay = (cardCount - 1) * 90;   // e.g. 4 * 90 = 360 ms
    const fadeDuration  = 400;                     // matches CSS transition
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

  /* inject thinking content directly INTO h2 — no extra DOM node, no layout shift */
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
    h2El.textContent = "";     /* clear for streaming; min-height holds the space */
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

/* Init all chart nodes with default period */
document.querySelectorAll('.node').forEach(nodeEl => {
  const nodeClass = [...nodeEl.classList].find(c => /^node-\d+$/.test(c));
  if (nodeChartData[nodeClass]) renderNodeChart(nodeEl, '1Y');
});

/* Time-period button clicks */
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