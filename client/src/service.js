import '@tensorflow/tfjs-backend-webgl';
import * as mpHands from '@mediapipe/hands';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as params from './shared/params';
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

import * as handdetection from '@tensorflow-models/hand-pose-detection';

import { Camera } from './camera';
import { STATE } from './shared/params';
import { setupStats } from './shared/stats_panel';
import { setBackendAndEnvFlags } from './shared/util';
let SENSITIVITY = 10
let detector, camera, stats;
let startInferenceTime, numInferences = 0;
let sum = 0, lastPanelUpdate = 0;
let rafId;
let preHand = null
let preTime = null
let traveled = 0
let canvas = document.getElementById("monitor")

async function createDetector() {
  const runtime = STATE.backend.split('-')[0];
  return handdetection.createDetector(STATE.model, {
    runtime,
    modelType: STATE.modelConfig.type,
    maxHands: STATE.modelConfig.maxNumHands
  });
}
function beginEstimateHandsStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimateHandsStats(dist) {
  const endInferenceTime = (performance || Date).now();
  sum += dist;
  ++numInferences;

  const panelUpdateMilliseconds = 100;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    let speed = Math.floor((sum / numInferences));
    sum = 0;
    numInferences = 0;

    stats.customFpsPanel.update(speed, 100/* maxValue */);
    if (speed > 0) {

      const event = new CustomEvent('move', { detail: { time: endInferenceTime, traveled, dist, speed } });
      canvas.dispatchEvent(event)
    }
    lastPanelUpdate = endInferenceTime;
  }
}
function calDist(p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}
function calHands(hand1, hand2) {
  let result = (calDist(hand1.keypoints[0], hand2.keypoints[0]) +
    calDist(hand1.keypoints[4], hand2.keypoints[4]) +
    calDist(hand1.keypoints[8], hand2.keypoints[8]) +
    calDist(hand1.keypoints[12], hand2.keypoints[12]) +
    calDist(hand1.keypoints[16], hand2.keypoints[16]) +
    calDist(hand1.keypoints[20], hand2.keypoints[20])) / 6
  if (result > SENSITIVITY) {
    return result
  } else {
    return 0
  }
}
async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let hands = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // Speed only counts the time it takes to finish estimateHands.
    beginEstimateHandsStats();

    let dist = 0
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      hands = await detector.estimateHands(
        camera.video,
        { flipHorizontal: false });
      if (hands && hands.length > 0) {
        let hand = hands[0]
        if (preHand && preTime) {
          dist = calHands(hand, preHand)
          //let pre = calHand(preHand)
          //dist =Math.abs(current - pre)*100 / (pre+1)
          traveled += dist
        }
        preHand = hand;
        preTime = (performance || Date).now()
      }

    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }

    endEstimateHandsStats(dist);
  } else {
    preHand = hand;
    preTime = (performance || Date).now()
  }

  camera.drawCtx();

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (hands && hands.length > 0 && !STATE.isModelChanged) {
    camera.drawResults(hands);
  }
}

async function renderPrediction() {
  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
};

export async function run() {
  // Gui content will change depending on which model is in the query string.
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('model')) {
    urlParams.set("model", "mediapipe_hands");
  }
  urlParams.set("type", "lite");
  //await setupDatGui(urlParams);
  params.STATE.model = handdetection.SupportedModels.MediaPipeHands;
  params.STATE.backend = "tfjs-webgl";
  params.STATE.modelConfig = { ...params.MEDIAPIPE_HANDS_CONFIG };
  params.STATE.modelConfig.type = "lite";
  params.STATE.modelConfig.maxNumHands = 1;
  stats = setupStats();

  camera = await Camera.setupCamera(STATE.camera);

  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  detector = await createDetector();
  renderPrediction();
};

