// Desktop-only: prevent WEBGL workload on small screens.
// Interface note:
// - This script depends on p5.js global lifecycle hooks (preload/setup/draw).
// - It expects a container element with id="desktop-cover".
// - Main external input is IMG_URL (source image for color sampling).
const isDesktop = window.innerWidth >= 1200;

// Input: replace this path to generate a different color/style baseline.
const IMG_URL = "/assets/ai_pics/crayonThumbnail23@2x.png";

if (isDesktop) {
  let img;
  let rotationX = 0;
  let rotationY = 0;
  const rotationLimit = 10;
  const density = 14;
  const cubeSizeMultiplier = 1.75;
  const neighborhoodRadius = 1;
  const maxVariance = 2000;
  const waveFrequency = 0.5;
  const waveSpeed = 1.7;
  const maxRotation = 90;

  let cubeData = [];

  window.preload = function () {
    img = loadImage(IMG_URL);
  };

  window.setup = function () {
    const container = document.getElementById("desktop-cover");
    const containerWidth = container.offsetWidth || 900;
    const containerHeight = (containerWidth / 3) * 4;
    const cnv = createCanvas(containerWidth, containerHeight, WEBGL);
    cnv.parent("desktop-cover");

    img.resize(containerWidth, containerHeight);
    img.loadPixels();
    precomputeCubeData();

    noStroke();
    angleMode(DEGREES);
    frameRate(24);
  };

  function precomputeCubeData() {
    cubeData = [];
    for (let x = 0; x < img.width; x += density) {
      for (let y = 0; y < img.height; y += density) {
        const variance = calculateBrightnessVariance(x, y, neighborhoodRadius);
        const normalizedVariance = constrain(variance / maxVariance, 0, 1);
        const sizeFactor = 1 - normalizedVariance;
        const easedSizeFactor = pow(sizeFactor, 2);
        const subdivisionThreshold = 0.6;

        if (easedSizeFactor > subdivisionThreshold) {
          const cubeSize = map(easedSizeFactor, 0, 1, 0, density * cubeSizeMultiplier);
          const sampleX = constrain(x + density / 2, 0, img.width - 1);
          const sampleY = constrain(y + density / 2, 0, img.height - 1);
          const pixelColor = getColorFromPixels(sampleX, sampleY);

          cubeData.push({
            x: x + density / 2,
            y: y + density / 2,
            size: cubeSize,
            color: pixelColor,
          });
        } else {
          const subDensity = density / 2;
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              const subX = x + i * subDensity;
              const subY = y + j * subDensity;
              const centerX = subX + subDensity / 2;
              const centerY = subY + subDensity / 2;
              const cubeSize = subDensity * cubeSizeMultiplier;
              const sampleX = constrain(centerX, 0, img.width - 1);
              const sampleY = constrain(centerY, 0, img.height - 1);
              const pixelColor = getColorFromPixels(sampleX, sampleY);

              cubeData.push({
                x: centerX,
                y: centerY,
                size: cubeSize,
                color: pixelColor,
              });
            }
          }
        }
      }
    }
  }

  window.draw = function () {
    clear();
    scale(0.92);
    rotateX(rotationX);
    rotateY(rotationY);
    lights();
    translate(-img.width / 2, -img.height / 2);

    for (const cube of cubeData) {
      const angle = sin(cube.x * waveFrequency + cube.y * waveFrequency + frameCount * waveSpeed) * maxRotation;
      push();
      translate(cube.x, cube.y, 0);
      rotateX(angle);
      rotateY(angle * 0.5);
      fill(cube.color);
      box(cube.size);
      pop();
    }
  };

  window.windowResized = function () {
    const container = document.getElementById("desktop-cover");
    if (!container) return;
    const containerWidth = container.offsetWidth || width;
    const containerHeight = (containerWidth / 3) * 4;
    resizeCanvas(containerWidth, containerHeight);
    img.resize(containerWidth, containerHeight);
    img.loadPixels();
    precomputeCubeData();
  };

  window.mouseDragged = function () {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      rotationY += (mouseX - pmouseX) * 0.5;
      rotationX -= (mouseY - pmouseY) * 0.5;
      rotationX = constrain(rotationX, -rotationLimit, rotationLimit);
      rotationY = constrain(rotationY, -rotationLimit, rotationLimit);
      return false;
    }
  };

  function getColorFromPixels(x, y) {
    const intX = floor(x);
    const intY = floor(y);
    const i = (intY * img.width + intX) * 4;
    return color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]);
  }

  function calculateBrightnessVariance(centerX, centerY, radius) {
    if (radius === 0) return 0;
    let brightnesses = [];
    let sumBrightness = 0;
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        if (x >= 0 && x < img.width && y >= 0 && y < img.height) {
          const index = (y * img.width + x) * 4;
          const r = img.pixels[index];
          const g = img.pixels[index + 1];
          const b = img.pixels[index + 2];
          const bright = (r + g + b) / 3;
          brightnesses.push(bright);
          sumBrightness += bright;
        }
      }
    }
    if (brightnesses.length === 0) return 0;
    const mean = sumBrightness / brightnesses.length;
    let sumSquaredDiff = 0;
    for (const b of brightnesses) {
      sumSquaredDiff += (b - mean) * (b - mean);
    }
    return sumSquaredDiff / brightnesses.length;
  }
}

