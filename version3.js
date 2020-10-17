var $ = function (id) {return document.getElementById(id)};

var paused = false;

var canvas, ctx;
var w = window.innerWidth;
var h = window.innerHeight;
var currentWidth, currentHeight;
var gameW = 0; 
var gameH = 0;
var isDragging = false;
var score = 0;
var eventIsOn = false;
var watcherEventIsOn = false;
var screenChanging = false;

var colors = {
    one: '#5be700',
    two: '#d578d4',
    ballotBoxColor: '#caafeb',
    scoreColor: '#000'
};

var images = {
    ballotBoxImg: new Image(),
    bulletinYes: new Image(),
    bulletinNo: new Image(),
    navalny: new Image(),
    watcher: new Image()
};

var imagesSrc = {
    ballotBoxImg: 'img/ballotBox.png',
    bulletinYes: 'img/yes.jpg',
    bulletinNo: 'img/no.jpg',
    navalny: 'img/Navalny.jpg',
    watcher: 'img/The Watcher.jpg'
};

var navalnyPos = {
    x: 200,
    y: 700
};

var navalnySize = {
    x: 200,
    y: 100
};

var watcherPos = {
    x: 800,
    y: 500
};

var watcherSize = {
    x: 200,
    y: 100
};

var mouse = {
    x: undefined,
    y: undefined
};

var rects = [];
var rectSize = {
    x: 50,
    y: 50
};

var ballotBoxSize = {
    x: 200,
    y: 100
};
var ballotBoxPos = {
    x: w / 2 - (ballotBoxSize.x / 2), 
    y: h / 1.3
};

var ballotMovingDirection = rand(0, 1) ? 'left' : 'right';
var ballotBoxMoving = false;

var bulletinValue= {
    bulletinYesValue: 1,
    bulletinNoValue: -1
};

var delta = 0, time = 0, timer = 0, oldTime = 0, constTimer;

var isCursorInRect = function (rec) {
    return mouse.x >= rec.position[0] && mouse.x <= rec.position[0] + rectSize.x
            && mouse.y >= rec.position[1] && mouse.y <= rec.position[1] + rectSize.y;
}

                        // rand func for integers
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

                        // rand func for floats
function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

var navalnyRandomTime = rand(2000, 5000);

                        // resizing the game
window.addEventListener('resize', resizeGame);
function resizeGame() {

    screenChanging = true;
    if(screenChanging){
            // canvas.width and canvas.height set the size of the canvas. 
        canvas.width = currentWidth;
        canvas.height = currentHeight;

            // canvas.style.width and canvas.style.height set the resolution.
        canvas.style.width = currentWidth;
        canvas.style.height = currentHeight;

        ballotBoxPos = {
            x: currentWidth / 2 - (ballotBoxSize.x / 2), 
            y: currentHeight / 1.3
        }
    }
    screenChanging = false;
}

                    // resizing the game on orientation change
window.addEventListener('orientationchange', orientationChange);
function orientationChange(){

    screenChanging = true;
    if(screenChanging){
    
            // canvas.width and canvas.height set the size of the canvas. 
        canvas.width = currentWidth;
        canvas.height = currentHeight;

            // canvas.style.width and canvas.style.height set the resolution.
        canvas.style.width = currentWidth;
        canvas.style.height = currentHeight;
        console.log('sad');

        ballotBoxPos = {
            x: currentWidth / 2 - (ballotBoxSize.x / 2), 
            y: currentHeight / 1.3
        }
    }
    screenChanging = false;
}

window.addEventListener('mousedown', e =>{
    mouse.x = e.x;
    mouse.y = e.y;
    let i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        
        if(mouse.x >= r.position[0] && mouse.x <= r.position[0] + rectSize.x
            && mouse.y >= r.position[1] && mouse.y <= r.position[1] + rectSize.y){
                isDragging = true;
                r.selected = true;
                r.position[0] = mouse.x - rectSize.x / 2;
                r.position[1] = mouse.y - rectSize.y / 2;
            }
    }
})

window.addEventListener('mousemove', e => {
    if(isDragging === true){
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        let i = rects.length - 1;
        
        for (; i >= 0; i -= 1){
            var r = rects[i];
            if(isCursorInRect(rects[i]) && r.selected === true){
                
            rects[i].position[0] = mouse.x - rectSize.x / 2;
            rects[i].position[1] = mouse.y - rectSize.y / 2;
            }       
         }
    } 
})

window.addEventListener('mouseup', (e) =>{
    if(isDragging === true) {
        isDragging = false;
        rects.forEach(e => {
            e.selected = false; 
        });
    }
})

                        // drawing the watcher pic
function drawWathcer(){
    ctx.drawImage(images.watcher, watcherPos.x, watcherPos.y, watcherSize.x, watcherSize.y);
}

                        // drawing navalny pic
function drawNavalny() {  
    ctx.drawImage(images.navalny, navalnyPos.x, navalnyPos.y, navalnySize.x, navalnySize.y);
} 

                        // drawing ballot box
function drawBallotBox() {   
    images.ballotBoxImg.src = imagesSrc.ballotBoxImg;
    ctx.drawImage(images.ballotBoxImg, ballotBoxPos.x, ballotBoxPos.y, ballotBoxSize.x, ballotBoxSize.y);
}  

                        // drawing score
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colors.scoreColor;
    ctx.fillText("Score: "+score, currentWidth / 2, currentHeight * 0.05);
}   

                        // counting the score
function counting() {

    let i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        if (r.position[0] >= ballotBoxPos.x && r.position[0] <= ballotBoxPos.x + ballotBoxSize.x
            && r.position[1] >= ballotBoxPos.y && r.position[1] <= ballotBoxPos.y + ballotBoxSize.y) {

                let rectId = rects.findIndex(e => e === r);
                rects.splice(rectId, 1);

                // addition and substraction to the score
                if(r.bulletinValue == 'bulletinYesValue'){
                    score += bulletinValue.bulletinYesValue;
                } else if (r.bulletinValue == 'bulletinNoValue') {
                    score += bulletinValue.bulletinNoValue;
                }
            }

            // deleting Extra Rects
        if (r.position[0] < 0 || r.position[0] > currentWidth
            || r.position[1] > currentHeight) {
                let rectId = rects.findIndex(e => e === r);
                rects.splice(rectId, 1);
            }
    } 
}

function rect () {
    this.size = [rectSize.x, rectSize.y];
    this.imagesSrc = rand(0, 1) ? 'bulletinYes' : 'bulletinNo';
    this.position = [rand(0, currentWidth - rectSize.x), -rectSize.y];
    this.bulletinValue = (this.imagesSrc === 'bulletinYes') ? 'bulletinYesValue' : 'bulletinNoValue';
    this.selected = false;
    this.speed = randFloat(0.1, 0.5);
}    

rect.prototype = {
    draw: function (){ 
        var bulletin = images[this.imagesSrc];
        ctx.drawImage(bulletin, this.position[0], this.position[1], this.size[0], this.size[1]);
    }
}
 
for(let [name,value] of Object.entries(imagesSrc)) {
    images[name].src = value;
}

                        // moving the ballot box
function navalnyAlert(){
    drawNavalny();
    var pos = 10;
    if(ballotMovingDirection === 'left') {
        ballotBoxPos.x -= pos;
        if(ballotBoxPos.x <= 0) {
            ballotMovingDirection = 'right';
        }
    }else if(ballotMovingDirection === 'right'){
        ballotBoxPos.x += pos;
        if(ballotBoxPos.x >= currentWidth - ballotBoxSize.x) {
            ballotMovingDirection = 'left';
        }
    }
}                       
                        // counting the score with the watcher on
function watcherEvent(){
    drawWathcer();
    eventIsOn = true;
    watcherEventIsOn = true;
    bulletinValue.bulletinYesValue = -10;
}

// setInterval(watcherEvent, 3000);

// setInterval(() => {
//         ballotBoxMoving = true;
// }, navalnyRandomTime);

function engine(){
    if(paused) return;
    currentWidth = window.innerWidth, currentHeight = window.innerHeight;

    // delta time
    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    // update
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    var i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        if(!r.selected) {
            r.position[1] += r.speed * delta; 
        } else {
            r.position = [mouse.x - rectSize.x / 2, mouse.y - rectSize.y / 2];
        }
        r.draw();
    }
    
    // create
    timer += delta;
    if(timer > 1000){
        rects.push(new rect());
        timer = 0;
    }

    // moving the box plus picture
    // ballotBoxMoving = true;
    // if(ballotBoxMoving){
    //     navalnyAlert();
    // }

    // run the watcherEvent
    if(score >= 3){
        watcherEvent();
    } else if (score <= 3){
        bulletinValue.bulletinYesValue = 1;
        watcherEventIsOn = false;
        eventIsOn = false;
    }
    // navalnyAlert();
    drawScore();
    counting();
    drawBallotBox();
    requestAnimationFrame(engine);
}

function init(){
    canvas = $('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
}

function hideMenu(){
    $('menu').hidden = true;
    $('inGameMenu').hidden = false;
}

function showMenu(){
    $('menu').hidden = false;
    $('inGameMenu').hidden = true;
}

function newGame(){
    paused = false;
    rects = [];
    score = 0;
    engine();
    hideMenu();
}

function pauseGame(){
    paused = true;
    showMenu();
}

function continueGame(){
    paused = false;
    engine();
    hideMenu();
}