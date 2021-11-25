export class Page {
     constructor() {
        this.progressPanel = document.getElementById("progress-panel")
        this.progress = document.getElementById("progress")
        this.canvas = document.getElementById("monitor")
        this.ctx = this.canvas.getContext("2d")
        this.output = document.getElementById("output")
        this.player = document.getElementById("player")
        this.video = document.getElementById("video")
        this.videoPanel = document.getElementById("video-panel")
        this.startBtn = document.getElementById("startBtn")
     }
     showGame() {
        this.page.player.style.transform = `translateX(0)`;
        this.startBtn.style.visibility = "hidden"
        this.progressPanel.style.visibility ="visible"
     }
     showWon() {
        this.output.style.visibility ="hidden"
        this.videoPanel.style.backgroundImage= "url('images/win-squidgame.gif')";
        setTimeout(() => this.reset(), 6000)
     }
     showLost() {
        this.output.style.visibility ="hidden"
        this.videoPanel.style.backgroundImage= "url('images/200w.webp')";
        setTimeout(() =>this.reset(), 6000)
     }

     reset() {
        this.output.style.visibility ="visible"
        this.videoPanel.style.backgroundImage= "url('images/loading.gif')";
        this.startBtn.style.visibility = "visible"
        this.progressPanel.style.visibility = "hidden"
     }

     movePlayer(traveled) {
        this.player.style.transform=`translateX(${traveled}px)`;
     }

     notify(font, color, text, x, y){
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
         this.ctx.font = font;
         this.ctx.fillStyle = color;
         this.ctx.fillText(text, x,y);
     }
     
     showLight(red) {
         this.ctx.clearRect(this.canvas.width /2, 0, this.canvas.width, this.canvas.height)
         this.ctx.beginPath();
         this.ctx.arc(this.canvas.width/2, this.canvas.height / 2, 50, 0, 2 * Math.PI, false);
         if (red) {
            this.ctx.fillStyle = 'red';
         } else {
            this.ctx.fillStyle = 'green';

         }
         this.ctx.fill();
     }
     get baseline() {
         return (this.output.width + this.output.height)
     }

     set onMoveEvent(handler) {
        this.canvas.addEventListener('move', handler)
     }

     set onPlayEvent(handler) {
        this.startBtn.addEventListener('click', handler, false)
     }
}

window.onload= function() {
   // page.canvas.clientWidth= `${window.outerWidth}px`;
}

window.onresize =function() {
   //page.canvas.clientWidth= `${window.outerWidth}px`;
}