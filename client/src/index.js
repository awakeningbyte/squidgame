import * as signalR from '@microsoft/signalr'
import * as service from './service'
let infoBar = document.getElementById("info")
let countdownSpan = document.getElementById("countdownSpan")
let canvas = document.getElementById("monitor")
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7091/gamehub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start() {
    try {
        await connection.start();
        //console.log("SignalR Connected.");
        infoBar.textContent = "game room connected."
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
start();
service.run();
let startBtn= document.getElementById("startBtn")

const audio = new Audio("DollSing.wav");
audio.volume = 0.2;
audio.load();

startBtn.addEventListener('click', () => {
    startBtn.style.visibility = "hidden"

            //play()
    countDown(3, "Remaining Time" )
    //initializeClock('clockdiv', deadline);
}, false)

function countDown(n,str) {
    let t= n
    play()
    audio.pause()
    //setInterval(play, 8000);
    let intv = setInterval(()=> {
        if ((t % 8) == 0) {
            audio.play();
        }
        //if (t==0) {
            //clearInterval(intv)
            //play()
        //}
        var ctx = canvas.getContext("2d");
        ctx.font = "30px Arial";
        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.fillText( ('0' + t).slice(-2), 10, 50);
        t++;
        
    }, 1000)
}

function play() {
    audio.play()
}