var $ = function (id) {return document.getElementById(id)};

var paused = false;

var canvas, ctx;
var w = window.innerWidth;
var h = window.innerHeight;
var gameW = 0; 
var gameH = 0;
var isDragging = false;
var selected = false;
var score = 0;

var colors = {
    one: '#5be700',
    two: '#d578d4',
    ballotBoxColor: '#caafeb',
    scoreColor: '#000'
};

var imagesSrc = {
    ballotBoxImgSrc: 'img/ballotBox.png',
    bulletinYes: 'img/yes.jpg',
    bulletinNo: 'img/no.jpg'
};

var mouse = {
    x: undefined,
    y: undefined
}

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

var bulletinValue= {
    bulletinYesValue: 1,
    bulletinNoValue: -1
}

var ballotBoxImage = new Image();

var delta = 0, time = 0, timer = 0, oldTime = 0;

var isCursorInRect = function (rec) {
    return mouse.x >= rec.position[0] && mouse.x <= rec.position[0] + rectSize.x
            && mouse.y >= rec.position[1] && mouse.y <= rec.position[1] + rectSize.y;
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.addEventListener('mousedown', e =>{
    mouse.x = e.x;
    mouse.y = e.y;
    if(!selected){
        let i = rects.length - 1;
        for (; i >= 0; i -= 1){
            var r = rects[i];
            
            if(mouse.x >= r.position[0] && mouse.x <= r.position[0] + rectSize.x
                && mouse.y >= r.position[1] && mouse.y <= r.position[1] + rectSize.y){
                    isDragging = true;
                    selected = r;
                    r.position[0] = mouse.x - rectSize.x / 2;
                    r.position[1] = mouse.y - rectSize.y / 2;
                }
        }
    }
    
})

window.addEventListener('mousemove', e => {
    if(isDragging === true){
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        let i = rects.length - 1;

        for (; i >= 0; i -= 1){
            if(isCursorInRect(rects[i])){
                
            rects[i].position[0] = mouse.x - rectSize.x / 2;
            rects[i].position[1] = mouse.y - rectSize.y / 2;
            }       
         }
    } 
})

window.addEventListener('mouseup', (e) =>{
    if(isDragging === true) {
        isDragging = false;
        selected = false;
    }
})

// window.addEventListener('dblclick', (e) =>{
    
//     let i = rects.length - 1;
//     for (; i >= 0; i -= 1){
//         var r = rects[i];
//         if (mouse.x >= r.position[0] && mouse.x <= r.position[0] + rectSize.x
//             && mouse.y >= r.position[1] && mouse.y <= r.position[1] + rectSize.y) {

//                 r.position.y += 100;
//         } 
//     }
// })

function drawBallotBox() {   
        ballotBoxImage.src = imagesSrc.ballotBoxImgSrc;
        ctx.drawImage(ballotBoxImage, ballotBoxPos.x, ballotBoxPos.y, ballotBoxSize.x, ballotBoxSize.y);
}  

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colors.scoreColor;
    ctx.fillText("Score: "+score, w / 2, h * 0.05);
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
                    score++;
                } else if (r.bulletinValue == 'bulletinNoValue') {
                    score--;
                }
            }

            // deleting Extra Rects
        if (r.position[0] < 0 || r.position[0] > w
            || r.position[1] > h) {
                let rectId = rects.findIndex(e => e === r);
                rects.splice(rectId, 1);
            }
    } 
}

function rect () {
    this.size = [rectSize.x, rectSize.y];
    this.imagesSrc = rand(0, 1) ? 'bulletinYes' : 'bulletinNo';
    this.position = [rand(0, w-rectSize.x), -rectSize.y];
    this.bulletinValue = (this.imagesSrc === 'bulletinYes') ? 'bulletinYesValue' : 'bulletinNoValue';
}

rect.prototype = {
    draw: function (){ 
        var bulletin = new Image();
        bulletin.src = imagesSrc[this.imagesSrc];
        ctx.drawImage(bulletin, this.position[0], this.position[1], this.size[0], this.size[1]);
    }
}

function engine(){
    if(paused) return;
    // delta time
    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;
    // update
    ctx.clearRect(0, 0, w, h);

    var i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        r.position[1] += 0.05 * delta; 
        r.draw();
    }
    
    // create
    timer += delta;
    if(timer > 1000){
        rects.push(new rect());
        timer = 0;
    }
    drawBallotBox();
    drawScore();
    counting();
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