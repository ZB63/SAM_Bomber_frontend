const WIDTH = 1000
const HEIGHT = 750

const UPPER_LINE = HEIGHT/6
const LEFT_LINE = WIDTH*(3/16)
const RIGHT_LINE = WIDTH*(13/16)

let boardSize = 7 // Musi byc nieprzyste

const GAME_BOARD = HEIGHT-UPPER_LINE // == RIGHT_LINE - LEFT_LINE
const SQUARE = GAME_BOARD / boardSize

let c = document.getElementById("myCanvas")
let ctx = c.getContext("2d")
let websocket;

let playersPos = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];

window.setInterval(gameLoop,5)


document.addEventListener('keydown', function(event) {
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

function gameLoop() {
    drawBackground(boardSize,boardSize)
    drawPlayers()
}

function onConnect() {
    websocket = new WebSocket(document.myform.serverAddressImput.value);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    // websocket.onmessage = function(evt) { onMessage(evt) };
    // websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
    document.getElementById("userResponseField").innerHTML = "Trwa łączenie!"
	document.myform.connectButton.disabled = true;
	document.myform.disconnectButton.disabled = false;
}

function onClose(evt) {
    document.getElementById("userResponseField").innerHTML = "Zerwano polaczenie!"
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

function onMessage(evt) {
    // TO DO
    // OBSLUGA PRZYCHODZACYCH POLECEN
    // DUZO ROBOTY!!!
    console.log(evt.data)
}

function onError(evt) {
	websocket.close();
    document.getElementById("userResponseField").innerHTML = "Wystapił błąd!"
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

// TO DO
function doSend(message) {
    websocket.send(message);
  }

// RYSUJE TYLKO 1 GRACZA, TRZEBA ZMIENIC
function drawPlayers() {
    let player1Img = new Image(SQUARE,SQUARE)
    player1Img.onload = function() {
        ctx.drawImage(player1Img, LEFT_LINE + SQUARE + playersPos[0][0]*SQUARE, UPPER_LINE + SQUARE + playersPos[0][1]*SQUARE, this.width, this.height)

    }
    player1Img.src = "sprites/player1.png"
}

// RYSUJE TŁO

function drawBackground(sizeX, sizeY) {
    // GORNA LINIA
    ctx.moveTo(0,UPPER_LINE)
    ctx.lineTo(WIDTH,UPPER_LINE)

    // LEWY PANEL
    ctx.moveTo(LEFT_LINE,UPPER_LINE)
    ctx.lineTo(LEFT_LINE,HEIGHT)

    // PRAWY PANEL
    ctx.moveTo(RIGHT_LINE,UPPER_LINE)
    ctx.lineTo(RIGHT_LINE,HEIGHT)

    // GREEN BACKGROUND
    ctx.fillStyle = "#23aa4b" // 35, 170, 75
    ctx.fillRect(LEFT_LINE, UPPER_LINE, RIGHT_LINE-LEFT_LINE, HEIGHT-UPPER_LINE)

    // WALL BLOCKS
    let wall = new Image(SQUARE,SQUARE)
    wall.onload = function() {
        
        for(let i=0;i<sizeY;i++) {
            let posX = LEFT_LINE
            let posY = UPPER_LINE + i*SQUARE
            ctx.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeY;i++) {
            let posX = RIGHT_LINE - SQUARE
            let posY = UPPER_LINE + i*SQUARE
            ctx.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeX;i++) {
            let posX = LEFT_LINE + i*SQUARE
            let posY = UPPER_LINE
            ctx.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<sizeX;i++) {
            let posX = LEFT_LINE + i*SQUARE
            let posY = HEIGHT - SQUARE
            ctx.drawImage(wall, posX, posY, this.width, this.height)
        }

        for(let i=0;i<(sizeX-2)/2;i++) {
            for(let j=0;j<(sizeY-2)/2;j++) {
                let posX = LEFT_LINE + 2*SQUARE + i*2*SQUARE
                let posY = UPPER_LINE + 2*SQUARE + j*2*SQUARE
                ctx.drawImage(wall, posX, posY, this.width, this.height)
            }
        }

    }
    wall.src = "sprites/wall.png"
}
