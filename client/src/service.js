/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import '@tensorflow/tfjs-backend-webgl';
import * as mpHands from '@mediapipe/hands';

import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as params from './shared/params';
tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        tfjsWasm.version_wasm}/dist/`);

import * as handdetection from '@tensorflow-models/hand-pose-detection';

import {Camera} from './camera';
import {STATE} from './shared/params';
import {setupStats} from './shared/stats_panel';
import {setBackendAndEnvFlags} from './shared/util';

let detector, camera, stats;
let startInferenceTime, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;
let rafId;
let preHand = null
let preTime = null
let traveled = 0
//let preTime = null

async function createDetector() {
      const runtime = STATE.backend.split('-')[0];
      return handdetection.createDetector(STATE.model, {
        runtime,
        modelType: STATE.modelConfig.type,
        maxHands: STATE.modelConfig.maxNumHands
      });
}

async function checkGuiUpdate() {
  if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
    camera = await Camera.setupCamera(STATE.camera);
    STATE.isTargetFPSChanged = false;
    STATE.isSizeOptionChanged = false;
  }

  if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
    STATE.isModelChanged = true;

    window.cancelAnimationFrame(rafId);

    if (detector != null) {
      detector.dispose();
    }

    if (STATE.isFlagChanged || STATE.isBackendChanged) {
      await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    }

    try {
      detector = await createDetector(STATE.model);
    } catch (error) {
      detector = null;
      alert(error);
    }

    STATE.isFlagChanged = false;
    STATE.isBackendChanged = false;
    STATE.isModelChanged = false;
  }
}

function beginEstimateHandsStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimateHandsStats(dist) {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += dist;
  ++numInferences;

  const panelUpdateMilliseconds = 100;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    let speed = (inferenceTimeSum / numInferences) /500;
    if (dist >10) {
      speed = Math.max(speed, 1)
    }
    inferenceTimeSum = 0;
    numInferences = 0;
    stats.customFpsPanel.update(speed, 100/* maxValue */);
    //stats.customSpeedPanel.update(speed, 3000)
    lastPanelUpdate = endInferenceTime;
  }
}
function calDist(p1, p2) {
  return Math.pow((p1.x - p2.x),2) + Math.pow((p1.y-p2.y),2)
}
function calHand(hand) {
  return calDist(hand.keypoints[0], hand.keypoints[4]) +
    calDist(hand.keypoints[0], hand.keypoints[8]) +
    calDist(hand.keypoints[0], hand.keypoints[12]) +
    calDist(hand.keypoints[0], hand.keypoints[16]) +
    calDist(hand.keypoints[0], hand.keypoints[20])

}
function calHands(hand1, hand2) {
  return calDist(hand1.keypoints[0], hand2.keypoints[0]) +
    calDist(hand1.keypoints[4], hand2.keypoints[4]) +
    calDist(hand1.keypoints[8], hand2.keypoints[8]) +
    calDist(hand1.keypoints[12], hand2.keypoints[12]) +
    calDist(hand1.keypoints[16], hand2.keypoints[16]) +
    calDist(hand1.keypoints[20], hand2.keypoints[20])
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
    // FPS only counts the time it takes to finish estimateHands.
    beginEstimateHandsStats();

    let dist =0
    //let speed =0
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      hands = await detector.estimateHands(
          camera.video,
          {flipHorizontal: false});
      if (hands && hands.length > 0) {
        let hand = hands[0]
        if (preHand && preTime ) {
          dist = calHands(hand, preHand)
          //let pre = calHand(preHand)
          //dist =Math.abs(current - pre)*100 / (pre+1)
          traveled +=dist
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
  }

  camera.drawCtx();

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (hands && hands.length > 0 && !STATE.isModelChanged) {
    camera.drawResults(hands);
    preTime= Date.now()
    preHand = hands[0]
  } else {
    preHand =null
    preTime=null
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
  params.STATE.modelConfig = {...params.MEDIAPIPE_HANDS_CONFIG};
  params.STATE.modelConfig.type = "lite";
  params.STATE.modelConfig.maxNumHands = 1;
  stats = setupStats();

  camera = await Camera.setupCamera(STATE.camera);

  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  detector = await createDetector();
  renderPrediction();
};

