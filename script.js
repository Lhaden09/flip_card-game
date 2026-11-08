// ============================================================
//  MOOC Match
//  Data: each pair = [left card, right card, icon, note shown after a match]
// ============================================================
const ROUNDS = [
  { title: "MOOC Platform ↔ Defining Feature", tip: "Match each MOOC platform with what it is known for.", pairs: [
    ["Coursera",    "Offers Specialisations and Professional Certificates",             "🎓", "Coursera works with universities and companies such as Yale and Google."],
    ["edX",         "Focuses on high-quality academic subjects and degree programs",    "🏛️", "edX is a non-profit founded by Harvard and MIT."],
    ["FutureLearn", "Emphasis on social learning and interaction",                      "💬", "FutureLearn works with UK and international universities."],
    ["Swayam",      "Offers courses from school level (Class 9-12) to Post-Graduation", "🇮🇳", "Swayam is an Indian Government initiative (AICTE, NCERT, IGNOU)."]
  ]},
  { title: "Key Words ↔ Meaning", tip: "Match each online-learning term with its meaning.", pairs: [
    ["Online Course",       "A structured learning program delivered through the internet",               "💻", "An online course is often called e-learning."],
    ["Self-Paced Learning", "Learners study at their own speed, choosing when and how fast",              "🐢", "Self-paced learners decide their own speed."],
    ["Digital Literacy",    "Using digital devices and online tools safely, effectively and responsibly", "🛡️", "Online platforms help improve digital literacy."],
    ["Synchronous",         "Happens in real time with live sessions, e.g. a Zoom class",                 "🎥", "Synchronous: everyone joins at the same time."]
  ]},
  { title: "Types of Online Classes ↔ Example", tip: "Match each type of online class with its description or example.", pairs: [
    ["Asynchronous",     "Watching pre-recorded videos and joining discussion forums", "📼", "Asynchronous learning lets you access materials anytime."],
    ["Hybrid / Blended", "Google Meet used along with regular school classes",         "🔀", "Hybrid mixes online flexibility with face-to-face sessions."],
    ["Instructor-Led",   "A course run through Google Classroom with fixed dates",     "👩‍🏫", "In instructor-led courses the teacher sets the pace and tasks."],
    ["Micro Learning",   "A 5-minute video on PowerPoint basics",                      "⚡", "Micro learning means short, targeted lessons."]
  ]},
  { title: "Benefits of Online Courses", tip: "Match each benefit with what it means for learners.", pairs: [
    ["Flexibility",    "Learn anywhere on a computer, tablet or phone; pause, rewind or repeat lessons", "🕐", "Flexibility needs motivation and discipline too."],
    ["Cost-Effective", "Many courses are free or cheaper, and some give certificates",                   "💰", "Cheaper than traditional classes or tuition."],
    ["Global Access",  "Learn from teachers and experts around the world without leaving home",          "🌍", "Online education offers diverse topics and global opportunities."],
    ["Collaboration",  "Group discussions and online teamwork build communication skills",               "🤝", "Collaboration builds communication skills."]
  ]},
  { title: "Challenges of Online Learning", tip: "Match each challenge with its description.", pairs: [
    ["Self-Discipline",     "Hard to stay organised without fixed class times",                     "⏰", "Good time management is essential."],
    ["Technology Barriers", "Limited digital skills, unreliable devices or poor internet",          "📶", "A good internet connection is needed."],
    ["Screen Time",         "Poor posture, eye strain and fatigue; take regular breaks",            "👀", "Regular breaks protect your health."],
    ["Self-Isolation",      "Less face-to-face contact with peers and teachers affects well-being", "😔", "Join forums and discussions to stay connected."]
  ]},
  { title: "MOOC: Massive Open Online Course", tip: "Match each word in MOOC with its meaning.", pairs: [
    ["Massive", "Can enroll thousands of learners globally", "👥", "Massive: thousands of learners can join at once."],
    ["Open",    "Mostly free and open to everyone",          "🔓", "Open: usually no age limit and no entrance exam."],
    ["Online",  "Delivered via internet platforms",          "🌐", "Online: learn from home, school or anywhere."],
    ["Course",  "A structured way to learn a subject",       "📚", "Course: video lectures, quizzes and assignments."]
  ]}
];

// ============================================================
//  Round layout: pairs per round (4 cards, 4 cards, 6 cards, 8 cards ... up to 10 cards)
//  Must add up to the total number of pairs (20). Change freely.
// ============================================================
const SIZES = [2, 2, 3, 4, 4, 5];   // each round gets harder: 2, 2, 3, 4, 4, 5 pairs

const ALL = [];   // every pair, remembering its topic
ROUNDS.forEach(r => r.pairs.forEach(p => ALL.push({ topic: r.title, tip: r.tip, pair: p })));

const STAGES = [];
(function buildStages(){
  let pos = 0;
  SIZES.forEach(n => {
    const chunk = ALL.slice(pos, pos + n); pos += n;
    const topics = [...new Set(chunk.map(c => c.topic))];
    STAGES.push({
      title: topics.join(" + "),
      tip: topics.length > 1 ? "Match each term with its meaning or description." : chunk[0].tip,
      pairs: chunk.map(c => c.pair)
    });
  });
})();

// ============================================================
//  Sound (Web Audio API: no audio files needed)
// ============================================================
let audioCtx = null;
let soundOn = true;
try { soundOn = localStorage.getItem("moocSound") !== "off"; } catch(e){}

function ac(){
  if(!audioCtx){
    const C = window.AudioContext || window.webkitAudioContext;
    if(C) audioCtx = new C();
  }
  if(audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Play one note: frequency, delay (s), duration (s), wave type, volume, optional glide-to frequency
function tone(freq, delay, dur, type = "sine", vol = 0.18, glideTo = null){
  if(!soundOn) return;
  const ctx = ac(); if(!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc.stop(t + dur + 0.02);
}

const SFX = {
  start:    () => { tone(392, 0, .12, "triangle"); tone(523, .1, .12, "triangle"); tone(659, .2, .2, "triangle"); },
  flip:     () => tone(620, 0, .08, "triangle", .15, 880),
  match:    () => { tone(660, 0, .14, "sine", .2); tone(880, .1, .14, "sine", .2); tone(1320, .2, .25, "sine", .18); },
  wrong:    () => { tone(240, 0, .22, "sawtooth", .12, 140); },
  complete: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .22, "triangle", .2)); },
  win:      () => {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * .14, .3, "triangle", .22));
    tone(1568, 1.0, .6, "sine", .18);
  }
};

function updateSoundBtn(){
  const b = $("soundBtn");
  b.textContent = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
  b.classList.toggle("off", !soundOn);
}

function toggleSound(){
  soundOn = !soundOn;
  try { localStorage.setItem("moocSound", soundOn ? "on" : "off"); } catch(e){}
  updateSoundBtn();
  if(soundOn){ ac(); tone(660, 0, .1, "sine"); }   // little confirmation beep
}

// ============================================================
//  Game
// ============================================================
function $(id){ return document.getElementById(id); }

let totalSecs = 0, round = 0, started = false, score = 0, totalMoves = 0;
let first = null, lock = false, matched = 0, timer = null, secs = 0;

function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Start / restart the whole game from Round 1
function start(){
  ac();                       // unlock audio (needs a user click)
  round = 0; score = 0; totalMoves = 0; totalSecs = 0; started = true;
  $("startBtn").textContent = "Restart";
  SFX.start();
  loadRound();
}

// Load the pairs for this round, shuffle, place face down
function loadRound(){
  clearInterval(timer); timer = null;
  first = null; lock = false; matched = 0; secs = 0;
  const r = STAGES[round];
  const cardCount = r.pairs.length * 2;

  $("score").textContent = score;
  $("matched").textContent = 0;
  $("total").textContent = r.pairs.length;
  $("time").textContent = 0;
  $("round").textContent = (round + 1) + "/" + STAGES.length;
  $("roundTitle").textContent = "Round " + (round + 1) + ": " + r.title;
  $("roundTip").textContent = r.tip;
  $("msg").textContent = "";
  $("nextBtn").style.display = "none";

  // 4 cards -> 2 columns, 6 -> 3, 8 -> 4, 10 -> 5
  $("grid").className = "grid cols" + (cardCount <= 4 ? 2 : cardCount === 6 ? 3 : cardCount === 8 ? 4 : 5);

  const cards = [];
  r.pairs.forEach(([left, right, icon], id) => {
    cards.push({ id, text: left,  type: "name", icon });
    cards.push({ id, text: right, type: "clue", icon: "" });
  });
  shuffle(cards);

  const grid = $("grid");
  grid.innerHTML = "";
  cards.forEach(c => {
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.id = c.id;
    el.innerHTML = `<div class="inner">
        <div class="face front"><span>?</span></div>
        <div class="face back ${c.type}">${c.icon ? `<div class="ico">${c.icon}</div>` : ""}<div>${c.text}</div></div>
      </div>`;
    el.onclick = () => flip(el);
    grid.appendChild(el);
  });
}

function flip(el){
  if(!started || lock || el.classList.contains("flip") || el.classList.contains("done")) return;
  if(!timer) timer = setInterval(() => { $("time").textContent = ++secs; }, 1000);

  SFX.flip();
  el.classList.add("flip");
  if(!first){ first = el; return; }

  totalMoves++;
  if(first.dataset.id === el.dataset.id){            // correct pair
    first.classList.replace("flip", "done");
    el.classList.replace("flip", "done");
    $("msg").innerHTML = "✅ " + STAGES[round].pairs[el.dataset.id][3];
    first = null; matched++; score += 10;
    $("score").textContent = score;
    $("matched").textContent = matched;
    if(matched === STAGES[round].pairs.length){
      roundComplete();
    } else {
      setTimeout(SFX.match, 250);
    }
  } else {                                           // wrong pair
    lock = true;
    const a = first; first = null;
    setTimeout(() => {
      SFX.wrong();
      a.classList.add("shake"); el.classList.add("shake");
    }, 350);
    setTimeout(() => {
      a.classList.remove("flip", "shake");
      el.classList.remove("flip", "shake");
      lock = false;
    }, 900);
  }
}

function roundComplete(){
  clearInterval(timer); timer = null;
  totalSecs += secs;
  if(round < STAGES.length - 1){
    setTimeout(SFX.complete, 300);
    $("msg").innerHTML = `🎉 Round ${round + 1} complete! Well done.<br>Ready for the next challenge?`;
    $("nextBtn").style.display = "inline-block";
  } else {
    setTimeout(showWin, 600);
  }
}

function showWin(){
  // Stars depend on accuracy: perfect play = one try per pair
  const accuracy = ALL.length / Math.max(totalMoves, ALL.length);
  const stars = accuracy >= 0.75 ? 3 : accuracy >= 0.5 ? 2 : 1;
  const mins = Math.floor(totalSecs / 60), sec = totalSecs % 60;

  $("winStars").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  $("winScore").textContent = score;
  $("winMoves").textContent = totalMoves;
  $("winTime").textContent = (mins ? mins + "m " : "") + sec + "s";
  $("winTitle").textContent = stars === 3 ? "Outstanding!" : stars === 2 ? "Great Job!" : "Well Done!";

  const box = $("confetti"); box.innerHTML = "";
  const colors = ["#ffb703", "#ff5d8f", "#2ecc71", "#4cc9f0", "#b388ff"];
  for(let i = 0; i < 70; i++){
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 2 + "s";
    p.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    box.appendChild(p);
  }
  $("win").classList.add("show");
  SFX.win();
}

function closeWin(){ $("win").classList.remove("show"); }
function playAgain(){ closeWin(); start(); }
function nextRound(){ ac(); SFX.flip(); round++; loadRound(); }

// Initial screen (cards visible but locked until Start is pressed)
loadRound();
started = false;
$("startBtn").textContent = "Start Game";
$("msg").textContent = "Press Start Game to begin.";
updateSoundBtn();
