const WIDTH = 1000
const HEIGHT = 750

const UPPER_LINE = HEIGHT/6
const LEFT_LINE = WIDTH*(3/16)
const RIGHT_LINE = WIDTH*(13/16)

let boardSize = 11 // Musi byc nieprzyste

const GAME_BOARD = HEIGHT-UPPER_LINE // == RIGHT_LINE - LEFT_LINE
const SQUARE = GAME_BOARD / boardSize

let c = document.getElementById("myCanvas")
let ctx = c.getContext("2d")

let cBuffer = document.getElementById("myCanvas")
cBuffer.width = WIDTH
cBuffer.height = HEIGHT
let ctxBuffer = c.getContext("2d")

let playersPos = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];

window.setInterval(game,10)


document.addEventListener('keydown', function(event) {
    console.log("EELO")
    let key = event.which
    if(key === 37) {
        playersPos[0][0] = playersPos[0][0] - 1
    } else if(key === 39) {
        playersPos[0][0] = playersPos[0][0] + 1
    } else if(key === 38) {
        playersPos[0][1] = playersPos[0][1] - 1
    } else if(key === 40) {
        playersPos[0][1] = playersPos[0][1] + 1
    }
})

function game() {

    drawBackground(boardSize,boardSize)
    drawPlayers()
    ctx.drawImage(cBuffer)
}

// RYSUJE TYLKO 1 GRACZA
function drawPlayers() {
    let player1Img = new Image(SQUARE,SQUARE)
    player1Img.onload = function() {
        ctxBuffer.drawImage(player1Img, LEFT_LINE + SQUARE + playersPos[0][0]*SQUARE, UPPER_LINE + SQUARE + playersPos[0][1]*SQUARE, this.width, this.height)

    }
    player1Img.src = "sprites/player1.png"
}

function drawBackground(sizeX, sizeY) {
    // GORNA LINIA
    ctxBuffer.moveTo(0,UPPER_LINE)
    ctxBuffer.lineTo(WIDTH,UPPER_LINE)

    // LEWY PANEL
    ctxBuffer.moveTo(LEFT_LINE,UPPER_LINE)
    ctxBuffer.lineTo(LEFT_LINE,HEIGHT)

    // PRAWY PANEL
    ctxBuffer.moveTo(RIGHT_LINE,UPPER_LINE)
    ctxBuffer.lineTo(RIGHT_LINE,HEIGHT)

    // GREEN BACKGROUND
    ctxBuffer.fillStyle = "#23aa4b" // 35, 170, 75
    ctxBuffer.fillRect(LEFT_LINE, UPPER_LINE, RIGHT_LINE-LEFT_LINE, HEIGHT-UPPER_LINE)

    // WALL BLOCKS
    let wall = new Image(SQUARE,SQUARE)
    wall.onload = function() {
        
        for(let i=0;i<sizeY;i++) {
            let posX = LEFT_LINE
            let posY = UPPER_LINE + i*SQUARE
            ctxBuffer.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeY;i++) {
            let posX = RIGHT_LINE - SQUARE
            let posY = UPPER_LINE + i*SQUARE
            ctxBuffer.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeX;i++) {
            let posX = LEFT_LINE + i*SQUARE
            let posY = UPPER_LINE
            ctxBuffer.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeX;i++) {
            let posX = LEFT_LINE + i*SQUARE
            let posY = HEIGHT - SQUARE
            ctxBuffer.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<(sizeX-2)/2;i++) {
            for(let j=0;j<(sizeY-2)/2;j++) {
                let posX = LEFT_LINE + 2*SQUARE + i*2*SQUARE
                let posY = UPPER_LINE + 2*SQUARE + j*2*SQUARE
                ctxBuffer.drawImage(wall, posX, posY, this.width, this.height)
            }
        }

    }
    wall.src = "sprites/wall.png"
}
