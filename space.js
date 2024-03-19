//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; //32*16
let boardHeight = tileSize * rows;//32*16
let context;

//rocket
let rocketWidth = tileSize*2;
let rocketHeight = tileSize*2;
let rocketX = tileSize * columns/2 - tileSize;
let rocketY = tileSize * rows - tileSize*2;

let rocket = {
    x : rocketX,
    y : rocketY,
    width : rocketWidth,
    height : rocketHeight
}

let rocketImg;
let rocketVelocityX = tileSize; //rocket moving speed

//alien
let alienArray = [];
let alienWidth = tileSize;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of alien to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocity = -10; //bullet moving speed

let score = 0;
let gameOver = false;  

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //untuk menggambar board

    //draw initial rocket
    // context.fillStyle="green";
    // context.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);

    //load images
    rocketImg = new Image();
    rocketImg.src = "./rocket.png";
    rocket.onload = function() {
        context.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien1.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveRocket);
    document.addEventListener("keyup", shoot);
}

function update(){
    requestAnimationFrame(update);

    if (gameOver){
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //rocket
    context.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= rocket.y) {
                gameOver = true;
            }
        }
    }
    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocity;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with alien
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if(!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 &&(bulletArray[0].used || bulletArray[0].y <0)){
        bulletArray.shift(); //menghapus first element of array
    }

    //next level
    if(alienCount == 0) {
        //increase the number of aliens in columns an row by 1
        alienColumns = Math.min(alienColumns + 1, columns/2 - 2); // cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows-4); //cap at 16-4 = 12
        alienVelocityX += 0.2; // increase the alien movement speed
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.front="16px courier";
    context.fillText(score, 5, 20);
}

function moveRocket(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "ArrowLeft" && rocket.x - rocketVelocityX >=0){
        rocket.x -= rocketVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && rocket.x + rocketVelocityX + rocket.width <= board.width) {
        rocket.x += rocketVelocityX; // move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : rocket.x +rocketWidth*15/32,
            y : rocket.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
            a.x + a.width > b.x && //a's top right corner passes b's top left corner
            a.y < b.y + b.height && //a's top left corner doesnt reach b's bottom left corner
            a.y + a.height > b.y; // a's bottom left corner passes b's top left corner
}