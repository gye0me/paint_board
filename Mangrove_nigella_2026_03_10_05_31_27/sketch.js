// Drawing app with camera + color extraction (merged student-style)
let canvas;
let vid;
let overlay;
const TOOLBAR_H = 60;

let paletteButtons = [];
let paletteColors = ['#000000','#FF0000','#FFA500','#FFFF00','#00FF00','#00FFFF','#0000FF','#800080','#FFC0CB','#808080'];

let sizeSlider, clearBtn, saveBtn, eraserBtn, eyedropBtn, modeBtn;
let brushColor = '#000000';
let brushSize = 6;
let isEraser = false;
let isEyedrop = false;
let bgMode = 'video'; // 'video' or 'white'
let saved = [];
let copiedMsg = '';
let copiedAt = 0;
let lastX = null;
let lastY = null;

function preload() {
  // try to use camera if available; fallback to test.mp4 if provided
  try {
    // nothing in preload for camera; but user may have test.mp4 — try to load if exists
    vid = createCapture(VIDEO);
  } catch (e) {
    // ignore
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight - TOOLBAR_H);
  canvas.position(0, TOOLBAR_H);

  // video capture
  if (!vid) vid = createCapture(VIDEO);
  vid.size(width, height);
  vid.hide();

  overlay = createGraphics(width, height);
  overlay.clear();

  // palette buttons
  const sw = 30, gap = 8;
  let x = 10;
  for (let i = 0; i < paletteColors.length; i++) {
    let c = paletteColors[i];
    let b = createButton('');
    b.style('background-color', c);
    b.style('border', i === 0 ? '3px solid #333' : '1px solid #aaa');
    b.style('width', sw + 'px');
    b.style('height', sw + 'px');
    b.position(x, 15);
    b.mousePressed(((col, idx)=>{
      return ()=>{
        brushColor = col;
        isEraser = false;
        isEyedrop = false;
        paletteButtons.forEach((pb,j)=> pb.style('border', j===idx ? '3px solid #333' : '1px solid #aaa'));
        eyedropBtn.html('Eyedrop');
        eraserBtn.html('Eraser');
      }
    })(c, i));
    paletteButtons.push(b);
    x += sw + gap;
  }

  sizeSlider = createSlider(1, 80, brushSize, 1);
  sizeSlider.position(x + 20, 22);

  clearBtn = createButton('Clear');
  clearBtn.position(x + 160, 18);
  clearBtn.mousePressed(()=> { overlay.clear(); });

  saveBtn = createButton('Save');
  saveBtn.position(x + 220, 18);
  saveBtn.mousePressed(saveSketch);

  eraserBtn = createButton('Eraser');
  eraserBtn.position(x + 280, 18);
  eraserBtn.mousePressed(()=> { isEraser = !isEraser; eraserBtn.html(isEraser ? 'Eraser ✓' : 'Eraser'); if(isEraser) { isEyedrop = false; eyedropBtn.html('Eyedrop'); }});

  eyedropBtn = createButton('Eyedrop');
  eyedropBtn.position(x + 340, 18);
  eyedropBtn.mousePressed(()=> { isEyedrop = !isEyedrop; eyedropBtn.html(isEyedrop ? 'Eyedrop ✓' : 'Eyedrop'); if(isEyedrop) { isEraser = false; eraserBtn.html('Eraser'); }});

  modeBtn = createButton('Mode: Video');
  modeBtn.position(x + 420, 18);
  modeBtn.mousePressed(()=>{ bgMode = (bgMode === 'video') ? 'white' : 'video'; modeBtn.html(bgMode === 'video' ? 'Mode: Video' : 'Mode: White'); });

  let clearSaved = createButton('Clear Saved');
  clearSaved.position(x + 520, 18);
  clearSaved.mousePressed(()=> saved = []);

  textSize(12);
}

function draw() {
  brushSize = sizeSlider.value();

  // background
  if (bgMode === 'video') {
    image(vid, 0, 0, width, height);
  } else {
    background(255);
  }

  // draw overlay
  image(overlay, 0, 0);

  // drawing
  if (mouseIsPressed && mouseY > TOOLBAR_H) {
    overlay.strokeWeight(brushSize);
    overlay.strokeCap(ROUND);
    let x = mouseX;
    let y = mouseY - TOOLBAR_H;
    if (isEraser) {
      if (bgMode === 'white') {
        overlay.noErase();
        overlay.stroke(255);
      } else {
        overlay.erase();
      }
    } else {
      overlay.noErase();
      overlay.stroke(brushColor);
    }
    if (lastX !== null && lastY !== null) {
      overlay.line(lastX, lastY, x, y);
    } else {
      overlay.ellipse(x, y, brushSize, brushSize);
    }
    overlay.noErase();
    // update last pos continuously
    lastX = x;
    lastY = y;
  } else {
    // when not drawing, reset last positions so next press starts fresh
    lastX = null;
    lastY = null;
  }

  // toolbar overlay visuals
  noStroke();
  fill(230);
  rect(0, 0, width, TOOLBAR_H);
  fill(0);
  text('Palette', 10, 12 + 18);
  text('Size', 200 + 20, 30);

  // hover color preview
  if (mouseX >=0 && mouseX < width && mouseY >= TOOLBAR_H && mouseY < height + TOOLBAR_H) {
    let p = get(mouseX, mouseY - TOOLBAR_H);
    if (p && p.length >= 3) {
      let h = rgbToHex(p[0], p[1], p[2]);
      fill(h); stroke(0); rect(width - 160, 10, 40, 36); noStroke(); fill(0); text(h, width - 110, 32);
    }
  }

  // draw saved palette
  for (let i = 0; i < saved.length; i++) {
    fill(saved[i]);
    rect(20 + i*34, TOOLBAR_H + 10, 30, 30);
  }

  // show copy feedback briefly
  if (copiedMsg && (Date.now() - copiedAt) < 1500) {
    fill(0);
    rect(width - 220, TOOLBAR_H + 6, 210, 28);
    fill(255);
    textSize(14);
    text(copiedMsg, width - 210, TOOLBAR_H + 26);
    textSize(12);
  }
}

function mousePressed() {
  // ignore toolbar clicks
  if (mouseY <= TOOLBAR_H) return;

  // eyedrop pick: if eyedrop mode active, sample color under cursor and apply immediately
  if (isEyedrop) {
    let px = get(mouseX, mouseY - TOOLBAR_H);
    if (px && px.length >= 3) {
      let hex = rgbToHex(px[0], px[1], px[2]);
      brushColor = hex;
      // highlight if in palette
      let idx = paletteColors.findIndex(c => c.toUpperCase() === hex);
      paletteButtons.forEach((pb,j)=> pb.style('border', j===idx ? '3px solid #333' : '1px solid #aaa'));
      // add to saved list
      saved.unshift(hex);
      if (saved.length > 12) saved.pop();
    }
    isEyedrop = false;
    if (eyedropBtn) eyedropBtn.html('Eyedrop');
    // continue so draw() will paint with new color in the same press
  }

  // check saved palette clicks (saved swatches drawn at y = TOOLBAR_H + 10)
  let swY1 = TOOLBAR_H + 10;
  let swY2 = swY1 + 30;
  if (mouseY >= swY1 && mouseY <= swY2) {
    for (let i = 0; i < saved.length; i++) {
      let sx = 20 + i*34;
      let ex = sx + 30;
      if (mouseX >= sx && mouseX <= ex) {
        // apply color to brush and copy to clipboard
        let hex = saved[i];
        brushColor = hex;
        isEraser = false;
        // de-highlight main palette
        paletteButtons.forEach((pb,j)=> pb.style('border', j===0 ? '3px solid #333' : '1px solid #aaa'));
        // copy to clipboard
        copyToClipboard(hex);
        copiedMsg = hex + ' copied';
        copiedAt = Date.now();
        return; // don't start drawing when clicking saved swatch
      }
    }
  }

  // ensure first dot appears exactly at cursor so there's no gap when dragging
  if (mouseY > TOOLBAR_H) {
    // don't draw a dot here to avoid visible single-point marks; just set up lastX/lastY
    overlay.strokeWeight(brushSize);
    overlay.strokeCap(ROUND);
    if (isEraser) {
      if (bgMode === 'white') {
        overlay.noErase();
        overlay.stroke(255);
      } else {
        overlay.erase();
      }
    } else {
      overlay.noErase();
      overlay.stroke(brushColor);
    }
  }
  // set last pos for continuous drawing
  lastX = mouseX;
  lastY = mouseY - TOOLBAR_H;
}

function copyToClipboard(text) {
  // try modern clipboard API first
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(()=>{
      // fallback
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  // create temporary textarea
  let ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

function saveSketch() {
  // combine current background and overlay into an image and save
  let g = createGraphics(width, height);
  if (bgMode === 'video') {
    g.image(vid, 0, 0, width, height);
  } else {
    g.background(255);
  }
  g.image(overlay, 0, 0);
  saveCanvas(g, 'my_paint_' + Date.now(), 'png');
}

function windowResized() {
  let img = get();
  resizeCanvas(windowWidth, windowHeight - TOOLBAR_H);
  canvas.position(0, TOOLBAR_H);
  vid.size(width, height);
  let newOverlay = createGraphics(width, height);
  newOverlay.clear();
  newOverlay.image(img, 0, 0, width, height);
  overlay = newOverlay;
}

function rgbToHex(r,g,b) {
  const toHex = v => ('0' + Math.max(0, Math.min(255, floor(v))).toString(16)).slice(-2).toUpperCase();
  return '#' + toHex(r) + toHex(g) + toHex(b);
}