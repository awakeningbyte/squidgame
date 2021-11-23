import * as signalR from '@microsoft/signalr'
import { init } from '@tensorflow/tfjs-backend-wasm/dist/backend_wasm'
import { conv2dTranspose } from '@tensorflow/tfjs-core'
import * as service from './service'
const GAME_TIME=60
let started = false
let intv = null;
let traveled = 0
let infoBar = document.getElementById("info")
let progressPanel = document.getElementById("progress-panel")
let progress = document.getElementById("progress")
let canvas = document.getElementById("monitor")
let output = document.getElementById("output")
let player = document.getElementById("player")
let video = document.getElementById("video")
let total_length = progress.width;
canvas.addEventListener('move', function(e) {
    if (intv) {
        if (red ) {
            clearInterval(intv)
            output.style.visibility="hidden" 
            started = false;
        } else if (started) {
            traveled +=(e.detail.dist +window.innerWidth + window.innerWidth) /  (output.width + output.height) / 8
            
            player.style.transform=`translateX(${traveled}px)`;
        }
    }

})
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7091/gamehub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start() {
    try {
        await connection.start();
        //console.log("SignalR Connected.");
        //infoBar.textContent = "game room connected."
        //await service()
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.onclose(async () => {
    infoBar.textContent = "game room disconnected."
    await start();

});

// Start the connection.
//start();
service.run();

let startBtn= document.getElementById("startBtn")

const audio = new Audio("DollSing.wav");
let red = true

audio.volume = 0.2;
audio.load();

audio.onplay = function() {
    red = false;
}
audio.ontimeupdate = function() {
    //console.log(audio.currentTime)
    if (audio.currentTime >5.25) {
        red = true
        
    }
}
startBtn.addEventListener('click', () => {
    startBtn.style.visibility = "hidden"
    progressPanel.style.visibility ="visible"
    countDown(3,"" )
    //initializeClock('clockdiv', deadline);
}, false)

function countDown(n,str) {
    let t= 0
    play()
    audio.pause()
    //setInterval(play, 8000);
    intv = setInterval(()=> {            
        var ctx = canvas.getContext("2d");
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 25;
        //ctx.font = "25px Arial";
        ctx.clearRect(0,0, canvas.width, canvas.height)

        let countdown =(GAME_TIME - t+n);
        if (t < n) {

            ctx.font = '28px serif';
            ctx.fillStyle = "white";
            ctx.fillText("READY " + ( n-t), 20, 50);
        } else if (t == n) {
            ctx.fillText( "GO ! ", 20, 50);
            started = true;
            play()
        } else if (countdown == 0) {
            clearInterval(intv);
            startBtn.style.visibility="visible"
            progressPanel.style.visibility  = "hidden"
            started = false
        
        }
        else {
            ctx.font = '18px serif';
            if (countdown < 10) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "white";

            }
            ctx.fillText("Time: " + countdown, 10, 50);
            if (audio.ended) {
                audio.play()
                red =false
            }
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                if (red) {
                    ctx.fillStyle = 'red';
                }  else {
                    ctx.fillStyle = 'green';

                }
                ctx.fill();

        }
  

        t++;
        
    }, 1000)
}

function play() {
    audio.play()
}

window.onload= function() {
    canvas.width= window.outerWidth;
}

window.onresize =function() {
    canvas.width= window.outerWidth;
}