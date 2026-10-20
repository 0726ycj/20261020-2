// ===================================================
// PBL 專題：p5.js 多媒體測驗系統 - 學習二（一題一頁多媒體測驗）
// 檔案：sketch.js
// 特色：一題一頁、上方動態觀念動畫、點選作答、即時解析、Web Audio 音效
// ===================================================

// 全域變數宣告：測驗狀態與進度控制
let currentQuestionIndex = 0; // 目前題目的索引 (從 0 開始)
let score = 0;                // 累積答對題數
let selectedOption = -1;      // 使用者點選的選項編號 (-1 代表尚未點選)
let isAnswerChecked = false;  // 是否已經按下確認/作答完畢
let quizFinished = false;     // 測驗是否已全部結束

// 聲音相關物件 (Web Audio API 簡易音效合成)
let audioCtx = null;

// 測驗題庫資料庫 (以 p5.js 基礎程式設計為主題)
const multiQuizData = [
  {
    question: "1. 在 p5.js 中，哪一個函式只會執行「一次」，通常用來初始化設定變數與畫布？",
    options: ["draw()", "setup()", "preload()", "mouseMoved()"],
    correct: 1, // 正確答案是第 2 個選項 (索引 1)
    explanation: "setup() 函式在程式啟動時僅執行一次，適合用來設定 createCanvas() 與初始數值。",
    animType: "setupBox" // 對應上方要畫的動畫類型
  },
  {
    question: "2. 如果想要讓畫布上的圖形跟隨使用者的滑鼠座標移動，應該使用哪兩個內建系統變數？",
    options: ["width 與 height", "mouseX 與 mouseY", "pmouseX 與 pmouseY", "frameCount"],
    correct: 1,
    explanation: "mouseX 與 mouseY 會隨時記錄當前滑鼠在畫布上的 X 與 Y 座標位置。",
    animType: "mouseFollow"
  },
  {
    question: "3. 想要在畫布中繪製一個外框線條為紅色、內部填滿藍色的矩形，順序應該為何？",
    options: [
      "先寫 fill() 再寫 stroke()",
      "先寫 stroke() 再寫 fill()",
      "順序不影響結果",
      "必須寫在 draw 之外"
    ],
    correct: 0,
    explanation: "p5.js 的繪圖屬性具備狀態性，建議先設定填滿 fill() 與外框 stroke()，再繪製形狀。",
    animType: "colorRect"
  },
  {
    question: "4. 哪一個結構或指令可以讓程式碼重複執行（例如每秒跑 60 次的動畫迴圈）？",
    options: ["if 條件判斷式", "setup() 初始化", "draw() 繪圖循環", "background() 背景設定"],
    correct: 2,
    explanation: "draw() 函式預設會以每秒約 60 幀的頻率不斷循環執行，是用來做動畫的核心。",
    animType: "loopAnim"
  }
];

// UI 按鈕物件宣告
let optionButtons = [];
let nextButton = null;

function setup() {
  // 建立全螢幕響應式畫布
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  // 初始化音效系統 (當使用者第一次互動時啟用)
  initAudioContext();

  // 建立選項按鈕與下一題按鈕
  createQuizUI();
}

function draw() {
  // 繪製清爽的背景色
  background(248, 250, 252);

  if (!quizFinished) {
    // 1. 繪製頂部進度條與標題
    drawHeader();

    // 2. 繪製上方多媒體動畫展示區 (看動畫)
    drawMediaAnimation();

    // 3. 繪製當前題目與選項介面
    drawQuestionContent();
  } else {
    // 4. 繪製最終結算畫面
    drawResultScreen();
  }
}

// ===================================================
// 1. 頂部進度與標題繪製
// ===================================================
function drawHeader() {
  fill(30, 41, 59);
  noStroke();
  textSize(20);
  textStyle(BOLD);
  text("🎧 學習二：多媒體觀念測驗（一題一頁）", width / 2, 35);

  // 顯示進度計數 (例如：第 1 題 / 共 4 題)
  textSize(14);
  fill(100, 116, 139);
  textStyle(NORMAL);
  text(`目前進度：第 ${currentQuestionIndex + 1} 題 / 共 ${multiQuizData.length} 題`, width / 2, 65);

  // 進度條底色
  stroke(226, 232, 240);
  strokeWeight(6);
  line(width * 0.2, 85, width * 0.8, 85);

  // 進度條進度
  let progressWidth = (width * 0.6) * ((currentQuestionIndex + 1) / multiQuizData.length);
  stroke(79, 70, 229);
  line(width * 0.2, 85, width * 0.2 + progressWidth, 85);
  noStroke();
}

// ===================================================
// 2. 上方多媒體動畫展示區（看得到）
// ===================================================
let animAngle = 0; // 用於動畫旋轉的計數器

function drawMediaAnimation() {
  let boxW = min(width * 0.6, 400);
  let boxH = 120;
  let boxX = width / 2 - boxW / 2;
  let boxY = 105;

  // 繪製動畫外框面板
  fill(255);
  stroke(226, 232, 240);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 12);

  // 根據當前題目的 animType 繪製不同的觀念動態視覺
  let q = multiQuizData[currentQuestionIndex];
  
  push();
  translate(width / 2, boxY + boxH / 2);
  animAngle += 0.03;

  if (q.animType === "setupBox") {
    // 動畫 1：單次執行的穩定方塊
    noFill();
    stroke(79, 70, 229);
    strokeWeight(3);
    rect(-30, -30, 60, 60, 8);
    fill(79, 70, 229);
    noStroke();
    textSize(11);
    text("setup() [僅跑一次]", 0, 45);

  } else if (q.animType === "mouseFollow") {
    // 動畫 2：跟隨座標移動的圓點
    let targetX = sin(animAngle) * 60;
    fill(244, 63, 94);
    noStroke();
    ellipse(targetX, 0, 30, 30);
    fill(100, 116, 139);
    textSize(11);
    text("mouseX / mouseY 互動座標", 0, 45);

  } else if (q.animType === "colorRect") {
    // 動畫 3：顏色屬性切換
    let colVal = map(sin(animAngle), -1, 1, 50, 255);
    fill(colVal, 50, 150);
    noStroke();
    rect(-40, -25, 80, 50, 6);
    fill(50);
    textSize(11);
    text("fill() 填色與外框屬性", 0, 45);

  } else if (q.animType === "loopAnim") {
    // 動畫 4：不斷循環的旋轉圖形
    rotate(animAngle);
    noFill();
    stroke(16, 185, 129);
    strokeWeight(3);
    rect(-25, -25, 50, 50, 4);
    pop();
    push();
    translate(width / 2, boxY + boxH / 2 + 45);
    fill(16, 185, 129);
    noStroke();
    textSize(11);
    text("draw() 60fps 迴圈動畫", 0, 0);
  }
  pop();
}

// ===================================================
// 3. 題目與選項介面繪製
// ===================================================
function drawQuestionContent() {
  let q = multiQuizData[currentQuestionIndex];

  // 繪製題目文字
  fill(30, 41, 59);
  textSize(16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  
  // 為了防止題目文字過長超出螢幕，限制寬度繪製
  let qBoxW = min(width * 0.8, 650);
  text(q.question, width / 2, 260);

  // 檢查是否已作答，若已作答則顯示詳解與「下一題」按鈕
  if (isAnswerChecked) {
    drawExplanationBox(q);
  }
}

// 繪製答題後的詳解提示框
function drawExplanationBox(q) {
  let isCorrect = (selectedOption === q.correct);
  let boxW = min(width * 0.8, 600);
  let boxH = 90;
  let boxX = width / 2 - boxW / 2;
  let boxY = height - 160;

  // 根據對錯顯示不同的提示背景色
  if (isCorrect) {
    fill(220, 252, 231);
    stroke(34, 197, 94);
  } else {
    fill(254, 226, 226);
    stroke(239, 68, 68);
  }

  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 10);

  // 顯示評語與詳解
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  fill(isCorrect ? rgbColor(21, 128, 61) : rgbColor(185, 28, 28));
  text(isCorrect ? "🎉 答對了！" : "❌ 答錯囉！正確答案是選項 " + (q.correct + 1), boxX + 15, boxY + 12);

  textSize(12);
  textStyle(NORMAL);
  fill(51, 65, 85);
  text("💡 解析：" + q.explanation, boxX + 15, boxY + 38, boxW - 30);
}

// 輔助顏色轉換
function rgbColor(r, g, b) {
  return color(r, g, b);
}

// ===================================================
// 4. 動態建立選項按鈕與下一題按鈕 (HTML DOM)
// ===================================================
function createQuizUI() {
  updateQuestionUI();
}

// 更新每題的選項按鈕位置與狀態
function updateQuestionUI() {
  // 清除舊的按鈕
  removeElements();

  let q = multiQuizData[currentQuestionIndex];
  let btnW = min(width * 0.75, 500);
  let btnH = 45;
  let startY = 310;

  // 建立 4 個選項按鈕
  for (let i = 0; i < q.options.length; i++) {
    let btn = createButton(`(${i + 1}) ${q.options[i]}`);
    let posY = startY + i * (btnH + 12);
    
    btn.position(width / 2 - btnW / 2, posY);
    btn.size(btnW, btnH);
    
    // 按鈕基礎樣式
    styleDefaultButton(btn);

    // 點擊選項事件
    let optionIndex = i;
    btn.mousePressed(() => {
      if (!isAnswerChecked) {
        handleAnswer(optionIndex);
      }
    });

    optionButtons.push(btn);
  }

  // 如果已經作答，額外建立「下一題」按鈕
  if (isAnswerChecked) {
    nextButton = createButton(currentQuestionIndex < multiQuizData.length - 1 ? "下一題 ➔" : "查看最終成績 🏆");
    let nextW = 180;
    let nextH = 45;
    nextButton.position(width / 2 - nextW / 2, height - 60);
    nextButton.size(nextW, nextH);
    
    // 下一步按鈕樣式
    nextButton.style("background-color", "#4F46E5");
    nextButton.style("color", "#FFFFFF");
    nextButton.style("font-size", "#FFFFFF");
    nextButton.style("font-weight", "bold");
    nextButton.style("border", "none");
    nextButton.style("border-radius", "25px");
    nextButton.style("cursor", "pointer");
    nextButton.style("box-shadow", "0 4px 10px rgba(79, 70, 229, 0.3)");

    nextButton.mousePressed(() => {
      goToNextQuestion();
    });
  }
}

// 按鈕預設樣式設定
function styleDefaultButton(btn) {
  btn.style("background-color", "#FFFFFF");
  btn.style("color", "#334155");
  btn.style("font-size", "14px");
  btn.style("font-weight", "600");
  btn.style("border", "2px solid #E2E8F0");
  btn.style("border-radius", "8px");
  btn.style("cursor", "pointer");
  btn.style("text-align", "left");
  btn.style("padding-left", "20px");
  btn.style("box-shadow", "0 2px 5px rgba(0,0,0,0.03)");
}

// 處理使用者作答邏輯
function handleAnswer(selectedIndex) {
  selectedOption = selectedIndex;
  isAnswerChecked = true;

  let q = multiQuizData[currentQuestionIndex];
  
  // 播放音效 (答對或答錯)
  if (selectedOption === q.correct) {
    score++;
    playTone(587.33, 0.15); // 高音叮咚 (答對)
    setTimeout(() => playTone(880, 0.2), 150);
  } else {
    playTone(220, 0.25); // 低音嗡 (答錯)
  }

  // 重新整理介面以顯示詳設與下一題按鈕
  updateQuestionUI();
}

// 切換至下一題或結算
function goToNextQuestion() {
  playTone(440, 0.1);
  if (currentQuestionIndex < multiQuizData.length - 1) {
    currentQuestionIndex++;
    selectedOption = -1;
    isAnswerChecked = false;
    updateQuestionUI();
  } else {
    quizFinished = true;
    removeElements(); // 移除所有 HTML 按鈕
  }
}

// ===================================================
// 5. 結算畫面繪製
// ===================================================
function drawResultScreen() {
  let cardW = min(width * 0.8, 420);
  let cardH = 280;
  let cardX = width / 2 - cardW / 2;
  let cardY = height / 2 - cardH / 2;

  // 繪製結算卡片背景
  fill(255);
  stroke(226, 232, 240);
  strokeWeight(2);
  rect(cardX, cardY, cardW, cardH, 16);

  // 結算文字標題
  textAlign(CENTER, CENTER);
  fill(30, 41, 59);
  textSize(22);
  textStyle(BOLD);
  text("🏆 學習二測驗圓滿完成！", width / 2, cardY + 45);

  // 顯示得分比例
  let percentage = Math.round((score / multiQuizData.length) * 100);
  textSize(46);
  fill(percentage >= 60 ? rgbColor(34, 197, 94) : rgbColor(239, 68, 68));
  text(`${score} / ${multiQuizData.length} 題`, width / 2, cardY + 115);

  textSize(14);
  fill(100, 116, 139);
  textStyle(NORMAL);
  text(`正確率：${percentage}%`, width / 2, cardY + 160);

  // 重新挑戰提示
  textSize(12);
  fill(148, 163, 184);
  text("（點擊畫布任意處即可重新測驗）", width / 2, cardY + 225);
}

// 點擊畫布重新開始
function mousePressed() {
  if (quizFinished) {
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = -1;
    isAnswerChecked = false;
    quizFinished = false;
    updateQuestionUI();
  }
}

// ===================================================
// 6. 視窗響應式調整 (Responsive Window Resized)
// ===================================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateQuestionUI();
}

// ===================================================
// 7. 簡易 Web Audio API 互動音效合成器
// ===================================================
function initAudioContext() {
  // 瀏覽器點擊時初始化音效環境
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
  } catch (e) {
    console.log("Web Audio API not supported.");
  }
}

function playTone(frequency, duration) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    let osc = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // 略過音效錯誤 (瀏覽器自動播放限制防護)
  }
}