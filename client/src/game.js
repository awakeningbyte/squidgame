const VOLUME_NUM = 0.5
const READY_COUNT = 3
const MUSIC_BREAK = 5.38
const TIME_GAP = 100
const THRESHOLD = 5
const MESSAGE_FONT = '42px serif'

const congrSound = new Audio("medias/Congratulations.wav");
const buzzSound = new Audio("medias/BuzzerWav.wav");
const audio = new Audio("medias/DollSing.wav");
let round = 0
export class Game {
    constructor(duration, page) {
        this.duration = duration
        this.started = false
        this.intv = null
        this.traveled = 0
        this.red = false
        this.page = page
        this.interval = null
        this.started = false
        this.page.onMoveEvent = (e) => {
            let currentTime = (performance || Date).now()
            if (this.started && this.interval && (e.timeStamp - currentTime) < TIME_GAP) {
                if (this.red) {
                    this.loss()
                } else {
                    this.move(e)
                }
            }
        }

        this.page.onPlayEvent = () => {
            this.start()
        }

        audio.volume = VOLUME_NUM;
        audio.load();

        audio.onplay = () => {
            this.isRed = false;
            if (this.started) {

                this.page.showLight(false)
            }
         
        }
        audio.onended = () => {
            round +=1
            audio.playbackRate += round /10.00
        }
        audio.ontimeupdate = () => {
            if (!this.started) {
                return
            }
            if (audio.currentTime > MUSIC_BREAK) {
                this.isRed = true
                this.page.showLight(true);
                setTimeout(()=> this.isRed = true,0)
            } else {
                this.isRed = false
                this.page.showLight(false)
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
        this.traveled = 0;
        this.play(READY_COUNT, "")
    }

    win() {
        this.page.notify(MESSAGE_FONT, "red", "Win", 20, 50)
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
        let dist = e.detail.speed * this.page.baseline
        this.traveled += dist
        this.traveled = Math.floor(this.traveled)
        if (dist ) {
            this.page.movePlayer(this.traveled);
        }
    }

    play(n) {
        audio.playbackRate =1
        audio.play()
        audio.pause()
        round =0 
        let t = 0
        this.interval = setInterval(() => {
            let countdown = (this.duration - t + n);
            if (t < n) {
                this.page.notify(MESSAGE_FONT, "#fff", "READY " + (n - t), -10, 50)
            } else if (t == n) {
                this.page.notify(MESSAGE_FONT, "#fff", "GO!", -10, 50)
                this.started = true;
                audio.play()
            } else if (countdown == 0) {
                this.page.notify(MESSAGE_FONT, "red", "Time Out", 20, 50)
                clearInterval(this.interval)
                this.started = false
                this.loss()
            }
            else {
                let text = "00:" + ("0" + countdown).slice(-2);
                this.page.notify(MESSAGE_FONT, "red", text, 5, 50)
                if (audio.ended) {
                    audio.play()
                }

                
            }

            if (this.traveled + 50>= this.page.progress.clientWidth) {
                this.win(0);
            }
            t++;

        }, 1000)
    }
}