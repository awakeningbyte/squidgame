import * as service from './service'
import  {Page} from './page'

const page = new Page()
const GAME_TIME=60
let started = false
let intv = null;
let traveled = 0
let startBtn= document.getElementById("startBtn")

const audio = new Audio("medias/DollSing.wav");
let red = true

function youWon() {
    clearInterval(intv)
    started = false;
    const congrSound = new Audio("medias/Congratulations.wav");
    congrSound.play()
    startBtn.textContent = "Play again"
    startBtn.style.visibility = "visible"
    progressPanel.style.visibility = "hidden"
}

function gameOver() {
    clearInterval(intv)
    const buzzSound = new Audio("medias/BuzzerWav.wav");
    buzzSound.play()
    output.style.visibility="hidden" 
    started = false;
    startBtn.textContent = "Try again"
    startBtn.style.visibility = "visible"
}

function playerMove(e) {
    let dist =(e.detail.dist /(2 * (output.width + output.height))) * progress.clientWidth 
    traveled +=dist
    if (dist > 5) {
        //playerCtx.clearRect(0,0, player.width, player.height);
        //playerCtx.drawImage(playerImage, traveled,0)
        player.style.transform=`translateX(${traveled}px)`;
    }
}

page.canvas.addEventListener('move', function(e) {
    if (started && intv) {
        if (red ) {
            gameOver()
        } else if (started) {
            playerMove(e)
        }
    }
})

// Start the connection.
//start();
service.run();


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
    page.progressPanel.style.visibility ="visible"
    countDown(3,"" )
    //initializeClock('clockdiv', deadline);
}, false)

function countDown(n,str) {
    let t= 0
    play()
    audio.pause()
    //setInterval(play, 8000);
    intv = setInterval(()=> {            
        var ctx = page.canvas.getContext("2d");
        const centerX = page.canvas.width / 2;
        const centerY = page.canvas.height / 2;
        const radius = 25;
        //ctx.font = "25px Arial";
        ctx.clearRect(0,0, page.canvas.width, page.canvas.height)

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
            page.progressPanel.style.visibility  = "hidden"
            started = false
            gameOver();
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
  
        if (traveled >= page.progress.clientWidth) {
            youWon();
        }
        t++;
        
    }, 1000)
}

function play() {
    audio.play()
}

window.onload= function() {
    page.canvas.width= window.outerWidth;
}

window.onresize =function() {
    page.canvas.width= window.outerWidth;
}