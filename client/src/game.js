const VOLUME_NUM = 0.5
const READY_COUNT = 3
const MUSIC_BREAK = 5.38
const TIME_GAP = 100
const THRESHOLD = 5
const MESSAGE_FONT = '32px serif'

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
            this.page.showLight(false)
        }
        audio.ontimeupdate = () => {
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
        let dist = e.detail.dist * 425 / this.page.baseline
        this.traveled += dist
        this.traveled = Math.floor(this.traveled)
        if (dist > THRESHOLD) {
            this.page.movePlayer(this.traveled);
        }
    }

    play(n) {
        audio.play()
        audio.pause()
        
        let t = 0
        this.interval = setInterval(() => {
            let countdown = (this.duration - t + n);
            if (t < n) {
                this.page.notify(MESSAGE_FONT, "#333", "READY " + (n - t), -10, 50)
            } else if (t == n) {
                this.page.notify(MESSAGE_FONT, "#333", "GO!", -10, 50)
                this.started = true;
                audio.play()
            } else if (countdown == 0) {
                this.page.notify(MESSAGE_FONT, "red", "MOTION DETECTED", 20, 50)
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

            if (this.traveled >= this.page.progress.clientWidth) {
                this.win(0);
            }
            t++;

        }, 1000)
    }
}