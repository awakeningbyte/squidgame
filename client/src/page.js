export class Page {
     constructor() {
        this.progressPanel = document.getElementById("progress-panel")
        this.progress = document.getElementById("progress")
        this.canvas = document.getElementById("monitor")
        this.output = document.getElementById("output")
        this.player = document.getElementById("player")
        this.video = document.getElementById("video")
        this.videoPanel = document.getElementById("video-panel")
        this.startBtn = document.getElementById("startBtn")
     }
     showGame() {
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
}
