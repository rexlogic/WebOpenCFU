let videoWidth, videoHeight;

let qvga = {width: {exact: 320}, height: {exact: 240}};

let vga = {width: {exact: 640}, height: {exact: 480}};

let resolution = window.innerWidth < 640 ? qvga : vga;

// whether streaming video from the camera.
let streaming = false;

let video = document.getElementById('video');
let canvasOutput = document.getElementById('canvasOutput');
let canvasOutputCtx = canvasOutput.getContext('2d');
let stream = null;

let detectCFU = document.getElementById('cfu');
//let detectCFUPS = document.getElementById('cfups');

function startCamera() {
  if (streaming) return;
  navigator.mediaDevices.getUserMedia({video: resolution, audio: false})
    .then(function(s) {
    stream = s;
    video.srcObject = s;
    video.play();
  })
    .catch(function(err) {
    console.log("An error occured! " + err);
  });

  video.addEventListener("canplay", function(ev){
    if (!streaming) {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.setAttribute("width", videoWidth);
      video.setAttribute("height", videoHeight);
      canvasOutput.width = videoWidth;
      canvasOutput.height = videoHeight;
      streaming = true;
    }
    startVideoProcessing();
  }, false);
}

let Classifier = null;
let ClassifierPS = null;

let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

let canvasInput = null;
let canvasInputCtx = null;

let canvasBuffer = null;
let canvasBufferCtx = null;

function startVideoProcessing() {
  if (!streaming) { console.warn("Please startup your webcam"); return; }
  stopVideoProcessing();
  canvasInput = document.createElement('canvas');
  canvasInput.width = videoWidth;
  canvasInput.height = videoHeight;
  canvasInputCtx = canvasInput.getContext('2d');
  
  canvasBuffer = document.createElement('canvas');
  canvasBuffer.width = videoWidth;
  canvasBuffer.height = videoHeight;
  canvasBufferCtx = canvasBuffer.getContext('2d');
  
  srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

// load classifiers

//  Classifier = new cv.CascadeClassifier();
//  Classifier.load('trainedClassifier.xml');

//  ClassifierPS = new cv.CascadeClassifier();
//  ClassifierPS.load('trainedClassifierPS.xml');

  requestAnimationFrame(processVideo);
}

function processVideo() {
  canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
  let imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
  srcMat.data.set(imageData.data);
  cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

// process frame

  canvasOutputCtx.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
//  drawResults(canvasOutputCtx, dots, ' #33d4ff', size);
//  drawResults(canvasOutputCtx, dotsps, 'yellow', size);
  requestAnimationFrame(processVideo);
}

function drawResults(ctx, results, color, size) {
  for (let i = 0; i < results.length; ++i) {
    let rect = results[i];
    let xRatio = videoWidth/size.width;
    let yRatio = videoHeight/size.height;
    ctx.lineWidth = 7;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x*xRatio, rect.y*yRatio, rect.width*xRatio, rect.height*yRatio);
  }
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject=null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}

function opencvIsReady() {
  console.log('OpenCV.js is ready');
  startCamera();
}
