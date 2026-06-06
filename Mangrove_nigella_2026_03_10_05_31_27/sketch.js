let canvas;
let vid;
let overlay;

let b1, b2, b3, b4, b5, b6, b7, b8, b9, b10;
let sizeSlider, clearBtn, saveBtn, eraserBtn, eyedropBtn, modeBtn;

let brushColor = [0, 0, 0]; 
let brushSize = 6;
let isEraser = false;
let isEyedrop = false;
let bgMode = 'video'; 
let saved = []; // 스포이드 저장 배열
let lastX = null;
let lastY = null;
let saveCount = 0; 

function setup() {
  canvas = createCanvas(1024, 768);
  canvas.position(0, 60);

  if (vid === undefined) {
    vid = createCapture(VIDEO);
  }
  vid.size(width, height);
  vid.hide();

  overlay = createGraphics(width, height);
  overlay.clear();

  b1 = createButton(''); b1.style('background-color', 'rgb(0,0,0)'); b1.style('border', '1px solid #aaa'); b1.size(30,30); b1.position(10, 15);
  b1.mousePressed(function() { brushColor = [0,0,0]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b2 = createButton(''); b2.style('background-color', 'rgb(255,0,0)'); b2.style('border', '1px solid #aaa'); b2.size(30,30); b2.position(48, 15);
  b2.mousePressed(function() { brushColor = [255,0,0]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b3 = createButton(''); b3.style('background-color', 'rgb(255,165,0)'); b3.style('border', '1px solid #aaa'); b3.size(30,30); b3.position(86, 15);
  b3.mousePressed(function() { brushColor = [255,165,0]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b4 = createButton(''); b4.style('background-color', 'rgb(255,255,0)'); b4.style('border', '1px solid #aaa'); b4.size(30,30); b4.position(124, 15);
  b4.mousePressed(function() { brushColor = [255,255,0]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b5 = createButton(''); b5.style('background-color', 'rgb(0,255,0)'); b5.style('border', '1px solid #aaa'); b5.size(30,30); b5.position(162, 15);
  b5.mousePressed(function() { brushColor = [0,255,0]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b6 = createButton(''); b6.style('background-color', 'rgb(0,255,255)'); b6.style('border', '1px solid #aaa'); b6.size(30,30); b6.position(200, 15);
  b6.mousePressed(function() { brushColor = [0,255,255]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b7 = createButton(''); b7.style('background-color', 'rgb(0,0,255)'); b7.style('border', '1px solid #aaa'); b7.size(30,30); b7.position(238, 15);
  b7.mousePressed(function() { brushColor = [0,0,255]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b8 = createButton(''); b8.style('background-color', 'rgb(128,0,128)'); b8.style('border', '1px solid #aaa'); b8.size(30,30); b8.position(276, 15);
  b8.mousePressed(function() { brushColor = [128,0,128]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b9 = createButton(''); b9.style('background-color', 'rgb(255,192,203)'); b9.style('border', '1px solid #aaa'); b9.size(30,30); b9.position(314, 15);
  b9.mousePressed(function() { brushColor = [255,192,203]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  b10 = createButton(''); b10.style('background-color', 'rgb(128,128,128)'); b10.style('border', '1px solid #aaa'); b10.size(30,30); b10.position(352, 15);
  b10.mousePressed(function() { brushColor = [128,128,128]; isEraser = false; isEyedrop = false; eyedropBtn.html('Eyedrop'); eraserBtn.html('Eraser'); });

  // 기능 버튼들 위치 설정 
  sizeSlider = createSlider(1, 80, brushSize, 1);
  sizeSlider.position(410, 22);

  clearBtn = createButton('Clear');
  clearBtn.position(550, 18);
  clearBtn.mousePressed(function() {
    overlay.clear();
  });

  saveBtn = createButton('Save');
  saveBtn.position(610, 18);
  saveBtn.mousePressed(saveSketch);

  eraserBtn = createButton('Eraser');
  eraserBtn.position(670, 18);
  eraserBtn.mousePressed(function() {
    if (isEraser === false) {
      isEraser = true;
      eraserBtn.html('Eraser O'); 
      isEyedrop = false;
      eyedropBtn.html('Eyedrop');
    } else {
      isEraser = false;
      eraserBtn.html('Eraser');
    }
  });

  eyedropBtn = createButton('Eyedrop');
  eyedropBtn.position(730, 18);
  eyedropBtn.mousePressed(function() {
    if (isEyedrop === false) {
      isEyedrop = true;
      eyedropBtn.html('Eyedrop O');
      isEraser = false;
      eraserBtn.html('Eraser');
    } else {
      isEyedrop = false;
      eyedropBtn.html('Eyedrop');
    }
  });

  modeBtn = createButton('Mode: Video');
  modeBtn.position(810, 18);
  modeBtn.mousePressed(function() {
    if (bgMode === 'video') {
      bgMode = 'white';
      modeBtn.html('Mode: White');
    } else {
      bgMode = 'video';
      modeBtn.html('Mode: Video');
    }
  });

  let clearSaved = createButton('Clear Saved');
  clearSaved.position(910, 18);
  clearSaved.mousePressed(function() {
    saved = [];
  });

  textSize(12);
}

function draw() {
  brushSize = sizeSlider.value();

  if (bgMode === 'video') {
    image(vid, 0, 0, width, height);
  } else {
    background(255);
  }

  image(overlay, 0, 0);

  // 마우스 누르고 있을 때 그리기 로직
  if (mouseIsPressed === true) {
    if (mouseY > 30) { 
      overlay.strokeWeight(brushSize);
      overlay.strokeCap(ROUND);
      
      // 지우개 모드일 때 배경에 따라 다른 처리
      if (isEraser === true) {
        if (bgMode === 'white') {
          overlay.noErase();
          overlay.stroke(255);
        } else {
          overlay.erase();
        }
      } else {
        overlay.noErase();
        overlay.stroke(brushColor[0], brushColor[1], brushColor[2]);
      }
      
      if (lastX === null || lastY === null) {
        overlay.ellipse(mouseX, mouseY, brushSize, brushSize); // 오프셋 제거로 거리 단축
      } else {
        overlay.line(lastX, lastY, mouseX, mouseY);            // 오프셋 제거로 거리 단축
      }
      
      overlay.noErase();
      lastX = mouseX;
      lastY = mouseY;                                           // 오프셋 제거로 거리 단축
    }
  } else {
    lastX = null;
    lastY = null;
  }

  // 상단 바
  noStroke();
  fill(230);
  rect(0, 0, width, 60);
  fill(0);
  text('Palette', 10, 30);
  text('Size', 413, 30); 

  // 실시간 컬러피커
  if (mouseY > 30) {
    let p = get(mouseX, mouseY); // 오프셋 제거로 정확하게 일치
    let rgbText = "rgb(" + p[0] + "," + p[1] + "," + p[2] + ")";
    
    fill(p[0], p[1], p[2]); 
    stroke(0); 
    rect(width - 200, 10, 40, 36); 
    noStroke(); 
    fill(0); 
    text(rgbText, width - 150, 32);
  }

  // 임시저장 색상들 출력
  for (let i = 0; i < saved.length; i++) {
    fill(saved[i][0], saved[i][1], saved[i][2]);
    rect(20 + i * 34, 70, 30, 30);
  }
}

function mousePressed() {
  if (mouseY <= 30) {
    return;
  }

  // 스포이드 기능
  if (isEyedrop === true) {
    let px = get(mouseX, mouseY); // 오프셋 제거로 정확하게 일치
    brushColor = [px[0], px[1], px[2]];
    
    // 12개까지만 저장
    if (saved.length < 12) { 
      saved.push([px[0], px[1], px[2]]);
    }
    
    isEyedrop = false;
    eyedropBtn.html('Eyedrop');
  }

  // 임시 저장 박스 클릭 처리
  if (mouseY >= 70 && mouseY <= 100) {
    for (let i = 0; i < saved.length; i++) {
      let sx = 20 + i * 34;
      let ex = sx + 30;
      if (mouseX >= sx && mouseX <= ex) {
        brushColor = saved[i];
        isEraser = false;
        return; 
      }
    }
  }

  if (mouseY > 60) {
    overlay.strokeWeight(brushSize);
    overlay.strokeCap(ROUND);
    if (isEraser === true) {
      if (bgMode === 'white') {
        overlay.noErase();
        overlay.stroke(255);
      } else {
        overlay.erase();
      }
    } else {
      overlay.noErase();
      overlay.stroke(brushColor[0], brushColor[1], brushColor[2]);
    }
  }
  lastX = mouseX;
  lastY = mouseY; // draw 함수의 lastY와 완벽 결합
}

function saveSketch() {
  let g = createGraphics(width, height);
  if (bgMode === 'video') {
    g.image(vid, 0, 0, width, height);
  } else {
    g.background(255);
  }
  g.image(overlay, 0, 0);
  
  saveCanvas(g, 'my_drawing_' + saveCount, 'png');
  saveCount = saveCount + 1;
}
