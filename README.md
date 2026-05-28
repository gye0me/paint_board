# paint_board

let  a = 0;
let vid;
let pic;
let x = 0;
let b = false;
let r = 0;
let g = [];

function setup() {
  createCanvas(1024, 768);
  background(1024, 768);  
  vid = createCapture(VIDEO);
  vid.hide();
  Red = (255, 0, 0);
  Blue = (0, 0, 255);
  Green = (0, 255, 255);
  Yellow = (255, 255, 0);
  Purple = (255, 0, 255);
  Pink = (255, 192, 203);
  White = (255, 255, 255);
  Gray = (128, 128, 128);
  Navy = (0, 0, 128);
  Black = (0, 0, 0);
}

function draw() {
  stroke(r);
  if (mouseIsPressed === true) {
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

  fill(get())

  image(vid, 0, 0, 1024, 768);

  if (b === false) {
    image(vid, 0, 0, 640, 360);
  }
  if(b === true){
    if(mouseIsPressed === true){
      line(mouseX, mouseY, pmouseX, pmouseY);
    }
  }


function keyPressed() {
  strokeWeight(5);
  g = get(mouseX-1, mouseY-1);
  r = g;
  console.log(r);
  vid.play();
}
function mouseClicked() {
  vid.pause();
  image(get(0, 100, 400, 300), 0, 0);
  save(get(0, 100, 400, 300), "paint"+a+".jpg");
  a++;
}

