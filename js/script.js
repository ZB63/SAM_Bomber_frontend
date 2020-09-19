const WIDTH = 1000
const HEIGHT = 750

const UPPER_LINE = HEIGHT/6
const LEFT_LINE = WIDTH*(3/16)
const RIGHT_LINE = WIDTH*(13/16)

const GAME_BOARD = HEIGHT-UPPER_LINE // == RIGHT_LINE - LEFT_LINE

let gameStarted = false
let boardSize // Musi byc nieparzyste
let SQUARE = GAME_BOARD / boardSize
let bombs = [] //{ uid: 2137, x: 3 , y: 3 }
let explosions = [] //{ uid : 2137, x_range : 1, y_range : 1, objects_hit : null }

let c = document.getElementById("myCanvas")
let ctx = c.getContext("2d")
let websocket;

let uID;
let myNick;
let currentScore;
let bombAmount;
let boxes;
let gifts;

let players = [
    { nick: null, x: -1 , y: -1 },
    { nick: null, x: -1 , y: -1 },
    { nick: null, x: -1 , y: -1 },
    { nick: null, x: -1 , y: -1 }
]

// bomby mozna dodawac do listy za pomoca bombs.push({ uid: 2137, x: -1 , y: -1 })
// bomby mozna usuwac z listy za pomoca bombs.splice(indexBombyDoWywalenia, 1)

document.addEventListener('keydown', function(event) {
    let key = event.which
    if(key === 37) {
        let message = { msg_code: "player_move", x: players[0].x - 1, y: players[0].y, uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 39) {
        let message = { msg_code: "player_move", x: players[0].x + 1, y: players[0].y, uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 38) {
        let message = { msg_code: "player_move", x: players[0].x, y: players[0].y - 1, uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 40) {
        let message = { msg_code: "player_move", x: players[0].x, y: players[0].y + 1, uid: uID }
        websocket.send(JSON.stringify(message))
    } else if(key === 32) {
        // SPACJA - PODKLADANIE BOMBY
        let message = { msg_code: "player_plant_bomb", uid: uID }
        websocket.send(JSON.stringify(message))
    }
})

function game() {
    drawBackground(boardSize,boardSize)
    drawBoxes()
    drawBombs()
    drawExplosions()
    clearBombs()
    clearExplosions()
    drawPlayers()
    drawScore()
}

function onConnect() {
    websocket = new WebSocket(document.myform.serverAddressImput.value);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onDisconnect() {
    let message = { msg_code: "disconnect", uid: uID }
    websocket.send(JSON.stringify(message))
    websocket.close()
}

function onOpen(evt) {
    document.getElementById("userResponseField").innerHTML = "Trwa łączenie!"
	document.myform.connectButton.disabled = true;
    document.myform.disconnectButton.disabled = false;
    myNick = document.getElementById("userNameImput").value
    let message = { msg_code: "connect", nick: document.getElementById("userNameImput").value }
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

// UWAGA !!!!!!!!
// ...
// ...
// ...
// DO MODYFIKACJI

function handleWelcomeMessage(message) {
    boardSize = message.map_size_x;
    uID = message.client_uid;
    bombAmount = message.bombs_amount;
    currentScore = 0;
    boxes = JSON.parse(message.box);
    gifts = message.gifts;
    SQUARE = GAME_BOARD / boardSize
    //window.setInterval(gameLoop,5)
}

function handlePlayerPos(message) {
    for(let i=0;i<players.length;i++) {
        if(message.nick === players[i].nick) {
            players[i].x = message.x
            players[i].y = message.y
            return
        }
    }

    // jezeli nie odnajdziemy gracza na liscie, to go do niej dodajemy
    for(let i=0;i<players.length;i++) {
        if(players[i].nick === null) {
            players[i].nick = message.nick
            players[i].x = message.x
            players[i].y = message.y
            return
        }
    }
}

function handleCurrentScore(message) {
    currentScore = message.score
}

function handleBombAmount(message) {
    bombAmount = message.amount
}

function handleBombHasBeenPlanted(message) {
    bombs.push({ uid: message.bomb_uid, x: message.x , y: message.y ,timeStarted: new Date()})
}

function handleBombExploded(message) {
    explosions.push({ 
        uid: message.bomb_uid,
        x_range: message.x_range, 
        y_range: message.y_range,
        objects_hit: JSON.parse(message.objects_hit), 
        timeStarted: new Date()
    })
    objects_hit = JSON.parse(message.objects_hit);
    for(let i = 0; i < boxes.length; i++){
        for(let j = 0; j < objects_hit.length; j++){
            if(boxes[i].uid === objects_hit[j].uid){
                boxes.splice(i, 1);
            }
        }
    }
}

function clearBombs() {
    endTime = new Date();
    for (let i = 0; i < bombs.length; i++){
        timeDiff = (endTime - bombs[i].timeStarted)/1000;
        if (timeDiff > 6) {
            bombs.splice(i, 1);
            break;
        }
    }
}

function clearExplosions() {
    endTime = new Date();
    for (let i = 0; i < explosions.length; i++){
        timeDiff = (endTime - explosions[i].timeStarted)/1000;
        if (timeDiff > 0.1) {
            explosions.splice(i, 1);
            bombs.splice(i, 1);
            break;
        }
    }
}

function handleCurrentScore(message) {
    currentScore = message.score;
}

function onMessage(evt) {

    let message = JSON.parse(evt.data)
    if(message.msg_code === "welcome_msg" ) {
        handleWelcomeMessage(message)
    } else if(message.msg_code === "player_pos") {
        handlePlayerPos(message)
    } else if(message.msg_code === "current score") {
        handleCurrentScore(message)
    } else if(message.msg_code === "bomb_amount") {
        handleBombAmount(message)
    } else if(message.msg_code === "Bomb has been planted") {
        handleBombHasBeenPlanted(message)
    } else if(message.msg_code === "Bomb exploded") {
        handleBombExploded(message)
    } else if(message.msg_code === "current score") {
        handleCurrentScore(message)
    }

    game()
}

// RYSUJE SCORE
function drawScore() {
    ctx.font='25px Verdana';
    var hue=0;
    var direction=1;

    requestAnimationFrame(animate);

    function animate(time){
    ctx.fillStyle='black';
    ctx.fillRect(400, 8, 210, 100);
    ctx.fillStyle='hsl('+hue+',100%,50%)';
    ctx.fillText('Score : ' + currentScore, 440,40);    
    ctx.fillText("Bombs : " + bombAmount, 440, 90);
    requestAnimationFrame(animate);
    hue+=direction;
    if(hue>255){direction*=-1;hue=255;}
    if(hue<0){direction*=-1;hue=0;}
    }
}

// RYSUJE BOMBY
function drawBombs() {
    let bombImage = new Image(SQUARE,SQUARE)
    bombImage.onload = function() {
        for (let i in bombs) {
            if (bombs.hasOwnProperty(i)) {
                let posX = bombs[i].x
                let posY = bombs[i].y
                ctx.drawImage(bombImage, LEFT_LINE + posX*SQUARE, UPPER_LINE + posY*SQUARE, this.width, this.height)
            }
        }
    }
    bombImage.src = "sprites/bomb.png"
}

// RYSUJE WYBUCHY
function drawExplosions() {
    let explosionImage = new Image(SQUARE,SQUARE)
    explosionImage.onload = function() {
        for(let i=0;i<explosions.length;i++) {
            let bombUid = explosions[i].uid
            let posX = 0
            let posY = 0 
            for(let j=0;j<bombs.length;j++) {
                if(bombs[j].uid === bombUid) {
                    posX = bombs[j].x
                    posY = bombs[j].y
                    break
                }
            }
            
            ctx.drawImage(explosionImage, LEFT_LINE + posX*SQUARE, UPPER_LINE + posY*SQUARE, this.width, this.height)

            // eksplozja musi sie zatrzymac na pilarach w pionie
            if(posX % 2 == 1) {
                for(let j=1;j<=explosions[i].y_range;j++) {
                    if(UPPER_LINE + posY*SQUARE + j*SQUARE < UPPER_LINE + (boardSize-1) * SQUARE) {
                        ctx.drawImage(explosionImage, LEFT_LINE + posX*SQUARE, UPPER_LINE + posY*SQUARE + j*SQUARE, this.width, this.height)
                    }
                    if(UPPER_LINE + posY*SQUARE - j*SQUARE > UPPER_LINE) {
                        ctx.drawImage(explosionImage, LEFT_LINE + posX*SQUARE, UPPER_LINE + posY*SQUARE - j*SQUARE, this.width, this.height)
                    }
                }
            }
            
            // eksplozja musi sie zatrzymac w poziomie
            if(posY % 2 == 1) {
                for(let j=1;j<=explosions[i].x_range;j++) {
                    if(LEFT_LINE + posX*SQUARE + j*SQUARE < LEFT_LINE + (boardSize-1)* SQUARE) {
                        ctx.drawImage(explosionImage, LEFT_LINE + posX*SQUARE + j*SQUARE, UPPER_LINE + posY*SQUARE, this.width, this.height)
                    }
                    if(LEFT_LINE + posX*SQUARE - j*SQUARE > LEFT_LINE) {
                        ctx.drawImage(explosionImage, LEFT_LINE + posX*SQUARE - j*SQUARE, UPPER_LINE + posY*SQUARE, this.width, this.height)
                    }
                }
            }
        }
    }
    explosionImage.src = "sprites/explosion.png"
}


// RYSUJE BOXY DO ZNISZCZENIA
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

function drawPlayers() {
    for(let i=0;i<players.length;i++) {
        if(players[i].nick != null) {
            let img = new Image(SQUARE, SQUARE)
            img.onload = function() {
                ctx.drawImage(img, LEFT_LINE + players[i].x * SQUARE, UPPER_LINE + players[i].y * SQUARE, this.width, this.height)
            }
            let imgSrc = "sprites/player" + (i + 1) + ".png";
            console.log(imgSrc)
            img.src = imgSrc
        }
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
