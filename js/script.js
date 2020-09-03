const WIDTH = 1000
const HEIGHT = 750

const UPPER_LINE = HEIGHT/6
const LEFT_LINE = WIDTH*(3/16)
const RIGHT_LINE = WIDTH*(13/16)

const GAME_BOARD = HEIGHT-UPPER_LINE // == RIGHT_LINE - LEFT_LINE

let gameStarted = false
let boardSize = 11 // Musi byc nieparzyste
let uID;
let bombAmount;
let currentScore;
let boxes;
let gifts;

let SQUARE = GAME_BOARD / boardSize

let c = document.getElementById("myCanvas")
let ctx = c.getContext("2d")
let websocket;

let playersPos = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];

let playersNicks = [
    "stefan",
    "stolec",
    null,
    null
];

let bombs = {
    uid : null,
    x : null,
    y : null
}

// czy to aby na pewno jest potrzebne?
let bomb_Explosion = {
    uid : null,
    x_range : null,
    y_range : null,
    objects_hit : null
}

document.addEventListener('keydown', function(event) {
    let key = event.which
    if(key === 37) {
        let message = { msg_code: "player_move", x: playersPos[0][0] - 1, y: playersPos[0][1], uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 39) {
        let message = { msg_code: "player_move", x: playersPos[0][0] + 1, y: playersPos[0][1], uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 38) {
        let message = { msg_code: "player_move", x: playersPos[0][0], y: playersPos[0][1] - 1, uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 40) {
        let message = { msg_code: "player_move", x: playersPos[0][0], y: playersPos[0][1] + 1, uid: uID }
        websocket.send(JSON.stringify(message))
    }
})

//var obj = JSON.parse('{"msg_code": "welcome_msg", "map_size_x":11, "map_size_y": 11, "client_uid": 77, "bombs_amount": 3, "current_score": 0, "box": 0, "gifts": 0}');

function gameLoop() {
    
    //test
    game()
    
}

function game() {
    drawBackground(boardSize,boardSize)
    drawPlayers()
    drawBoxes()
}

function onConnect() {
    websocket = new WebSocket(document.myform.serverAddressImput.value);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onDisconnect() {
    console.log("UID:" + uID)
    let message = { msg_code: "disconnect", nick: uID }
    websocket.send(JSON.stringify(message))
    websocket.close()
}

function onOpen(evt) {
    document.getElementById("userResponseField").innerHTML = "Trwa łączenie!"
	document.myform.connectButton.disabled = true;
    document.myform.disconnectButton.disabled = false;
    console.log("POLACZONO")


    let message = { msg_code: "connect", nick: document.getElementById("userNameImput") }
    websocket.send(JSON.stringify(message))

}

function onClose(evt) {
    document.getElementById("userResponseField").innerHTML = "Zerwano polaczenie!"
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

function onError(evt) {
	websocket.close();
    document.getElementById("userResponseField").innerHTML = "Wystapił błąd!"
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

function pos_Msg(message){
    for(var i = 0; i < 4; i++){
        if(playersNicks[i] == message.nick)
            playersPos[i] = [message.x, message.y];
    }
}

function bomb_Amount_Msg(message){
    bombAmount = message.amount;
}

function bomb_Planted_Msg(message){
    bomb.uid = message.bomb_uid;
    bomb.x = message.x;
    bomb.y = message.y;
    //...
}

function handle_Explosion(message){
    bomb_Explosion.uid = message.bomb_uid;
    bomb_Explosion.x_range = message.x_range;
    bomb_Explosion.y_range = message.y_range;
    //bomb_Explosion.objects_hit = message.objects_hit;
}

function handleWelcomeMessage(message){
    boardSize = message.map_size_x;
    uID = message.client_uid;
    bombAmount = message.bombs_amount;
    currentScore = 0;
    boxes = JSON.parse(message.box);
    gifts = message.gifts;
    SQUARE = GAME_BOARD / boardSize
    window.setInterval(gameLoop,5)
}

function handlePlayerPos(message) {
    for(let i=0;i<playersPos.length;i++) {
        console.log(message.nick)
        console.log(playersNicks[i])
        console.log("\n")
        if(message.nick === playersNicks[i]) {
            playersPos[i][0] = message.x
            playersPos[i][1] = message.y
        }
    }
}

// nie jestem pewien do czego to sluzy
function disconnect_Player(message){
    for(var i = 0; i < 4; i++){
        if(playersNicks[i] == message.nick){
            playersPos[i] = [message.x, message.y];
            playersNicks[i] = null;
        }
    }
}


function onMessage(evt) {
    // TO DO
    // OBSLUGA PRZYCHODZACYCH POLECEN
    // DUZO ROBOTY!!!
    let message = JSON.parse(evt.data)
    console.log(message)
    if(message.msg_code === "welcome_msg" ) {
        handleWelcomeMessage(message)
    } else if(message.msg_code === "player_pos") {
        handlePlayerPos(message)
        console.log(playersPos[0][0])
    }

    //console.log(message.box)
    //console.log("\n\n")
    //game()
}

// TO DO
function doSend(message) {
    websocket.send(message);
  }

function drawBoxes() {
    let boxImage = new Image(SQUARE,SQUARE)
    boxImage.onload = function() {

        for (let i in boxes) {
            if (boxes.hasOwnProperty(i)) {
                let posX = boxes[i].pos[0]
                let posY = boxes[i].pos[1]
                ctx.drawImage(boxImage, LEFT_LINE + posX*SQUARE, UPPER_LINE + posY*SQUARE, this.width, this.height)
            }
        }

    }
    boxImage.src = "sprites/box.png"
}

// RYSUJE TYLKO 1 GRACZA, TRZEBA ZMIENIC
function drawPlayers() {

        if(playersNicks[0] != null){
            let player1Img = new Image(SQUARE,SQUARE)
            player1Img.onload = function() {
                ctx.drawImage(player1Img, LEFT_LINE + playersPos[0][0]*SQUARE, UPPER_LINE + playersPos[0][1]*SQUARE, this.width, this.height)
            }
            player1Img.src = "sprites/player1.png"
        }
        if(playersNicks[1] != null){
            let player2Img = new Image(SQUARE,SQUARE)
            player2Img.onload = function() {
                ctx.drawImage(player2Img, LEFT_LINE + playersPos[1][0]*SQUARE, UPPER_LINE + playersPos[1][1]*SQUARE, this.width, this.height)
            }
            player2Img.src = "sprites/player1.png"
        }
        if(playersNicks[2] != null){
            let player3Img = new Image(SQUARE,SQUARE)
            player3Img.onload = function() {
                ctx.drawImage(player3Img, LEFT_LINE + playersPos[2][0]*SQUARE, UPPER_LINE + playersPos[2][1]*SQUARE, this.width, this.height)
            }
            player3Img.src = "sprites/player1.png"
        }
        if(playersNicks[3] != null){
            let player4Img = new Image(SQUARE,SQUARE)
            player4Img.onload = function() {
                ctx.drawImage(player4Img, LEFT_LINE + playersPos[3][0]*SQUARE, UPPER_LINE + playersPos[3][1]*SQUARE, this.width, this.height)
            }
            player4Img.src = "sprites/player1.png"
        }
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
