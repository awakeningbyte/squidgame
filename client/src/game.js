const congrSound = new Audio("medias/Congratulations.wav");
const buzzSound = new Audio("medias/BuzzerWav.wav");
const audio = new Audio("medias/DollSing.wav");
export class Game {
    constructor(duration, page) {
        this.duration = duration
        this.started = false
        this.intv = null
        this.traveled = 0
        this.red = false
        this.page = page
        this.interval = null
        this.page.canvas.addEventListener('move',  (e) => {
            let currentTime = (performance || Date).now()
            if (this.started && this.interval && (e.timeStamp - currentTime) < 100) {
                setTimeout(()=> {
                    if (this.red) {
                        this.loss()
                    } else {
                        this.move(e)
                    }

                },0)
            }
        })

        this.page.startBtn.addEventListener('click', () => {
            this.start()
            this.play(3, "")
        }, false)
        audio.volume = 0.2;
        audio.load();

        audio.onplay = () => {
            this.isRed = false;
        }
        audio.ontimeupdate = () => {
            //console.log(audio.currentTime)
            if (audio.currentTime >5.26) {
                this.isRed = true 
            }    
        }
    }
    /**
     * @param {boolean} red
     */
    set isRed(red) {
        this.red = red
    }
    start() {
        this.page.showGame();
        this.page.player.style.transform = `translateX(0)`;
        this.traveled = 0;
    }

    win() {
        this.started = false;
        clearInterval(this.interval)
        this.interval = null
        congrSound.play()
        this.page.showWon();
    }

    loss() {
        this.started = false;
        clearInterval(this.interval)
        buzzSound.play()
        this.page.showLost()

    }
    move(e) {
        if (!this.started) {
            return;
        }
        let dist = e.detail.dist * 375 / this.page.baseline
        this.traveled += dist
        this.traveled = Math.floor(this.traveled)
        if (dist > 5) {
            this.page.movePlayer(this.traveled);
        }
    }

    play(n) {
        audio.play()
        audio.pause()
        let  t =0 
        this.interval = setInterval(() => {
            var ctx = this.page.canvas.getContext("2d");

            
            ctx.clearRect(0, 0, this.page.canvas.width, this.page.canvas.height)
            let countdown = (this.duration - t + n);
            if (t < n) {
                this.page.notify('28px serif', "#333" ,"READY " + (n - t), 20, 50)
            } else if (t == n) {
                this.page.notify('28px serif', "#333", "GO!", 20, 50)
                this.started = true;
                audio.play()
            } else if (countdown == 0) {
                this.page.notify('28px serif',"red", "MOTION DETECTED", 20, 50)
                clearInterval(this.interval)
                this.started = false
                this.loss()
            }
            else {
                let text ="00:" + ("0" + countdown).slice(-2);
                this.page.notify('28px serif',"red", text, 20, 50)
                if (audio.ended) {
                    audio.play()
                    //this.red = false
                }

                this.page.showLight(this.red)
            }

            if (this.traveled >= this.page.progress.clientWidth) {
                youWon();
            }
            t++;

        }, 1000)
    }
}