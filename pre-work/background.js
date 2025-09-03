const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();

let waveParams = [];
function generateWaveParams() {
  waveParams = [];
  let blockSize = 8;
  let totalBlocks = Math.ceil(window.innerWidth / blockSize);

  let x = 0;
  let lastAmp = 12 + Math.random() * 18;
  let lastFreq = 0.005 + Math.random() * 0.015;
  let lastPhase = 0; // 从 0 开始

  while (x < totalBlocks) {
    let segmentLength = 30 + Math.floor(Math.random() * 40); // 每段 30~70 个点
    let nextAmp = 12 + Math.random() * 18;
    let nextFreq = 0.005 + Math.random() * 0.015;

    for (let i = 0; i < segmentLength && x < totalBlocks; i++, x++) {
      let t = i / segmentLength; // 0~1

      // 在片段中插值
      let amp = lastAmp * (1 - t) + nextAmp * t;
      let freq = lastFreq * (1 - t) + nextFreq * t;

      // 相位连续
      let phase = lastPhase + i * freq;

      waveParams.push({
        amp,
        freq,
        phase,
        offset: (Math.random() - 0.5) * 5
      });
    }

    // 结束点成为下一段的起点
    lastAmp = nextAmp;
    lastFreq = nextFreq;
    lastPhase += segmentLength * lastFreq;
  }
}




generateWaveParams();
window.onresize = () => {
  resize();
  generateWaveParams();
};


window.onresize = resize;

let t = 0;

// 云数据（中间饱满，上下稀疏）
let clouds = Array.from({ length: 5 }, () => {
  let s = 14 + Math.floor(Math.random() * 4);  // 像素块大小 (20~25)
  let baseWidth = 6 + Math.floor(Math.random() * 3); // 中间层宽度 (6~8 块)
  let heightBlocks = 4 + Math.floor(Math.random() * 2); // 总高度 (4~5 层)

  let shape = [];
  for (let row = 0; row < heightBlocks; row++) {
    // 计算当前层的宽度：中间最大，上下逐渐变窄
    let distanceFromCenter = Math.abs(row - Math.floor(heightBlocks / 2));
    let rowWidth = baseWidth - distanceFromCenter + Math.floor(Math.random() * 2); 

    let rowData = [];
    for (let col = 0; col < rowWidth; col++) {
      // 边缘概率低一点，中间几乎必然有
      let chance = (distanceFromCenter === 0) ? 0.9 : 0.7;
      rowData.push(Math.random() < chance);
    }
    shape.push(rowData);
  }

  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * (canvas.height / 3),
    speed: 0.1 + Math.random() * 0.2,
    s,
    shape
  };
});



// 更随机的像素云
function drawCloud(cloud) {
  ctx.fillStyle = "#fff";
  cloud.shape.forEach((rowData, row) => {
    rowData.forEach((block, col) => {
      if (block) {
        ctx.fillRect(
          cloud.x + col * cloud.s,
          cloud.y + row * cloud.s - row * (cloud.s / 2),
          cloud.s,
          cloud.s
        );
      }
    });
  });
}

// 气泡数据（数量少一些，比如 10 个）
let bubbles = Array.from({ length: 10 }, () => createBubble());

function createBubble() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height / 2 + Math.random() * (canvas.height / 2),
    radius: 2 + Math.random() * 4,
    speed: 0.4 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.3 // 左右漂移更轻微
  };
}

function drawBubbles() {
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  bubbles.forEach(bubble => {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fill();

    // 上升
    bubble.y -= bubble.speed;
    bubble.x += bubble.drift;

    // 出水面就重生
    if (bubble.y < canvas.height / 2) {
      bubble.x = Math.random() * canvas.width;
      bubble.y = canvas.height / 2 + Math.random() * (canvas.height / 2);
      bubble.radius = 2 + Math.random() * 4;
      bubble.speed = 0.4 + Math.random() * 0.6;
      bubble.drift = (Math.random() - 0.5) * 0.3;
    }
  });
}



// 绘制
function draw() {
  // 天空
  ctx.fillStyle = "#6ec6ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 云
    clouds.forEach(cloud => {
    drawCloud(cloud);
    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + 50) {
        cloud.x = -60;
        cloud.y = Math.random() * (canvas.height / 3);
    }
    });


    
    
    let blockSize = 8;
    
    // 后层（深蓝波浪）
    ctx.fillStyle = "#003366";
    for (let i = 0; i < waveParams.length; i++) {
      let x = i * blockSize;
      let p = waveParams[i];
      let y =
      Math.sin(x * p.freq + t * 0.5 + p.phase) * p.amp +
      canvas.height / 2 + 12 + p.offset;
      
      ctx.fillRect(x, y, blockSize, blockSize);
      ctx.fillRect(x, y + blockSize, blockSize, canvas.height / 2);
    }
    
    // 前层（浅蓝波浪）
    ctx.fillStyle = "#1e90ff";
    for (let i = 0; i < waveParams.length; i++) {
      let x = i * blockSize;
      let p = waveParams[i];
      let y =
      Math.sin(x * (p.freq * 1.2) + t + p.phase * 0.8) * (p.amp * 0.7) +
      canvas.height / 2 + p.offset * 0.5;
      
      ctx.fillRect(x, y, blockSize, blockSize);
      ctx.fillRect(x, y + blockSize, blockSize, canvas.height / 2);

      // 绘制底部遮罩矩形
      ctx.fillStyle = "#1e90ff"; // 你想要的底色，可以和湖水颜色一致
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
}

  t += .06;
  requestAnimationFrame(draw);

  drawBubbles();
}
draw();