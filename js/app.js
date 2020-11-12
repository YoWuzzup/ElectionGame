var $ = function (id) {return document.getElementById(id)};

var canvas, ctx;
var w = window.innerWidth;
var h = window.innerHeight;
var currentWidth = window.innerWidth, currentHeight = window.innerWidth;
var score = 0;
var paused = false;
var eventIsOn = false;
var screenChanging = false;
var watcherEventIsOn = false;
var eraser, pen, thumbTack;
var sliderCount;

var colors = {
    scoreColor: '#000'
};

var images = {
    // different
    ballotBoxImg: new Image(),
                                          // inGameBackground: new Image(),

    // bulletins
    bulletinYes: new Image(),
    bulletinNo: new Image(),
    bulletinSpoiled: new Image(),
    bulletinEmpty: new Image(),

    // skills
    skillLighter: new Image(),
    skillEraser: new Image(),
    skillPencil: new Image(),
    skillThumbTack: new Image(),

    // events
    navalny: new Image(),
    watcher: new Image(),
};

var imagesSrc = {
    // different
    ballotBoxImg: 'img/ballotBox.png',
                                                 // inGameBackground: '../img/background.jpg',

    // bulletins
    bulletinYes: 'img/yes.png',
    bulletinNo: 'img/no.png',
    bulletinSpoiled: 'img/spoiled.png',
    bulletinEmpty: 'img/empty.png',

    // skills
    skillLighter: 'img/skills/lighter.png',
    skillEraser: 'img/skills/eraser.png',
    skillPencil: 'img/skills/pencil.png',
    skillThumbTack: 'img/skills/thumbTack.png',

    // events
    navalny: 'img/events/Navalny.jpg',
    watcher: 'img/events/The Watcher.jpg',
};

var skillPanelNames = [
    'namePencil',
    'nameEraser',
    'nameLighter',
    'nameThumbTack'
];
var statusActive = skillPanelNames[0];

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

var skillPanels = [];
var rects = [];
var rectSize = {
    x: 50,
    y: 50
};

var skillPanelSize = {
    x: w / 100 * 7,
    y: h / 100 * 7
};

var skillPanelPos = {
    x: w * 0.30,
    y: h - (skillPanelSize.y + skillPanelSize.y / 2) 
}

var ballotBoxSize = {
    x: w - rectSize.x * 1.3 * 2,
    y: 100
};

var ballotBoxPos = {
    x: 0, 
    y: h / 1.3
};

var ballotMovingDirection = rand(0, 1) ? 'left' : 'right';
var ballotBoxMoving = false;

var bulletinValue= {
    bulletinYesValue: 2,
    bulletinNoValue: -2,
    bulletinSpoiledValue: -1,
    bulletinEmptyValue: 1
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

function currentSize(){
    currentWidth = window.innerWidth, currentHeight = window.innerHeight;

    // canvas.width and canvas.height set the size of the canvas. 
    canvas.width = currentWidth;
    canvas.height = currentHeight;

    // canvas.style.width and canvas.style.height set the resolution.
    canvas.style.width = currentWidth;
    canvas.style.height = currentHeight;
    
    ballotBoxPos = {
        x: currentWidth / 2 - (ballotBoxSize.x / 2), 
        y: currentHeight / 1.3
    };
    
    ballotBoxSize = {
        x: currentWidth - rectSize.x * 1.3 * 2,
        y: 100
    };

    skillPanelPos = {
        x: currentWidth * 0.30,
        y: currentHeight - (skillPanelSize.y + skillPanelSize.y / 2) 
    };
    
    for (let i = 0; i < skillPanels.length; i++) {
        skillPanels[i].position[0] = skillPanels[i].position[0];
        skillPanels[i].position[1] = skillPanelPos.y;
    }
}

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

window.addEventListener('click', e =>{
    if(e.detail === 1){        
        mouse.x = e.x;
        mouse.y = e.y;
    }
    // activating skill panel
    for (let i = 0; i < skillPanels.length; i++) {
        let r = skillPanels[i];

        if(mouse.x >= r.position[0] && mouse.x <= r.position[0] + skillPanelSize.x
            && mouse.y >= r.position[1] && mouse.y <= r.position[1] + skillPanelSize.y){
                statusActive = skillPanelNames[i];
            }
    }
})

window.addEventListener('touchstart', e =>{
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    let i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        
        if(isCursorInRect(r) && r.isDragging === false){
                r.isDragging = true;
                r.selected = true;
                r.position[0] = mouse.x - rectSize.x / 2;
                r.position[1] = mouse.y - rectSize.y / 2;
        }
    }
})

window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    let i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        if(isCursorInRect(r) && r.selected === true && r.isDragging === true){
            r.position[0] = mouse.x - rectSize.x / 2;
            r.position[1] = mouse.y - rectSize.y / 2;
        }       
    } 
})

window.addEventListener('touchend', (e) =>{
        rects.forEach(el => {
            if(el.isDragging === true) {
                el.selected = false; 
            }
            el.isDragging = false;
        });
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

                        // drawing background in the game
function drawInGameBackground() {   
    ctx.beginPath();
    ctx.fillStyle = '#63feb3';
    ctx.rect(0, 0, currentWidth, currentHeight);
    ctx.fill();
}

                        // drawing score
function drawScore() {
    let scoreText = `Score: ${score}`; 
    let measureText = ctx.measureText(scoreText).width;
    ctx.font = "16px Arial";
    ctx.fillStyle = colors.scoreColor;
    ctx.fillText(scoreText, currentWidth / 2 - measureText / 2, currentHeight * 0.05);
}   

                        // counting the score
function counting() {
    let i = rects.length - 1;
    
    for (; i >= 0; i -= 1){
        var r = rects[i];
        if (   r.position[0] + r.size[0] * 0.70 >= ballotBoxPos.x + r.size[0] * 1.5
            && r.position[0] + r.size[0] * 0.30 <= ballotBoxPos.x + ballotBoxSize.x - r.size[0] * 1.5
            && r.position[1] + r.size[1] * 0.70 >= ballotBoxPos.y 
            && r.position[1] + r.size[1] * 0.30 <= ballotBoxPos.y + ballotBoxSize.y) {

                let rectId = rects.findIndex(e => e === r);
                rects.splice(rectId, 1);

                // addition and substraction to the score
                if(r.bulletinValue == 'bulletinYesValue'){
                    score += bulletinValue.bulletinYesValue;
                } else if (r.bulletinValue == 'bulletinNoValue') {
                    score += bulletinValue.bulletinNoValue;
                } else if (r.bulletinValue == 'bulletinSpoiledValue') {
                    score += bulletinValue.bulletinSpoiledValue;
                } else if (r.bulletinValue == 'bulletinEmptyValue') {
                    score += bulletinValue.bulletinEmptyValue;
                }
            }

            // deleting extra rects outside the screen
        if (   r.position[0] + r.size[0] * 0.30 < 0 
            || r.position[0] + r.size[0] * 0.70 > currentWidth
            || r.position[1] - r.size[1] * 0.20 > currentHeight) {
                let rectId = rects.findIndex(e => e === r);
                rects.splice(rectId, 1);
            }
    } 
}

                    //  the skill panel
function skillPanel() {   
    this.size = [skillPanelSize.x, skillPanelSize.y];
    this.position = [skillPanelPos.x, skillPanelPos.y];
    this.imagesSrc;
}

skillPanel.prototype = {
    draw: function (){ 
        var skillImage = images[this.imagesSrc];
        ctx.drawImage(skillImage, this.position[0], this.position[1], this.size[0], this.size[1]);
    }
}

function activatingSkillPanel() {
    switch (statusActive) {
        case 'namePencil':
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "red";
            ctx.rect(skillPanels[0].position[0], skillPanels[0].position[1], skillPanelSize.x, skillPanelSize.y);
            ctx.stroke();
            break;
        case 'nameEraser':
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "red";
            ctx.rect(skillPanels[1].position[0], skillPanels[1].position[1], skillPanelSize.x, skillPanelSize.y);
            ctx.stroke();
            break;
        case 'nameLighter':
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "red";
            ctx.rect(skillPanels[2].position[0], skillPanels[2].position[1], skillPanelSize.x, skillPanelSize.y);
            ctx.stroke();
            break;
        case 'nameThumbTack':
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "red";
            ctx.rect(skillPanels[3].position[0], skillPanels[3].position[1], skillPanelSize.x, skillPanelSize.y);
            ctx.stroke();
            break;
    }
}

                    // the bulletins 
function rect() {
    this.size = [rectSize.x, rectSize.y];
    this.imagesSrc = rand(0, 1) ? 'bulletinYes' : rand(0, 1) ? 'bulletinNo'
                   : rand(0, 1) ? 'bulletinSpoiled': 'bulletinEmpty';
    this.position = [rand(0, currentWidth - rectSize.x), -rectSize.y];
    this.bulletinValue = (this.imagesSrc === 'bulletinYes') ? 'bulletinYesValue' 
                       : (this.imagesSrc === 'bulletinNo') ? 'bulletinNoValue'
                       : (this.imagesSrc === 'bulletinSpoiled') ? 'bulletinSpoiledValue'
                       : 'bulletinEmptyValue';
    this.selected = false;
    this.changed = false;
    this.isDragging = false;
    this.thumbTacked = false;
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

                // the main function
function engine(){
    if(paused) return;
    currentSize();

    // delta time
    time = new Date().getTime();
    delta = time - oldTime;
    oldTime = time;

    // update
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    drawInGameBackground();
    var i = rects.length - 1;
    for (; i >= 0; i -= 1){
        var r = rects[i];
        if(!r.selected && !r.thumbTacked) {
            r.position[1] += r.speed * delta; 
        } else if(r.selected && r.thumbTacked){
            r.position = [mouse.x - rectSize.x / 2, mouse.y - rectSize.y / 2];
        }

        // pen skill
        if(isCursorInRect(r) && statusActive === 'namePencil' 
        && r.imagesSrc === 'bulletinEmpty' && r.changed === false 
        && r.selected === true){
            r.changed = true;
            r.imagesSrc = 'bulletinYes';
            r.bulletinValue = 'bulletinYesValue';
        } else if (isCursorInRect(r) && statusActive === 'namePencil' && r.changed !== true 
        && (r.imagesSrc === 'bulletinYes' || r.imagesSrc === 'bulletinNo') && r.selected === true){
            r.imagesSrc = 'bulletinSpoiled';
            r.bulletinValue = 'bulletinSpoiledValue';
        }

        // eraser skill
        if(isCursorInRect(r) && statusActive === 'nameEraser' 
        &&(r.imagesSrc === 'bulletinYes' || r.imagesSrc === 'bulletinNo') && r.selected === true){
            r.imagesSrc = 'bulletinEmpty';
            r.bulletinValue = 'bulletinEmptyValue';
        }

        // lighter skill
        if (isCursorInRect(r) && statusActive === 'nameLighter' && r.selected === true) {
            let rectId = rects.findIndex(e => e === r);
            rects.splice(rectId, 1);
        }
        
        // thumb tack skill
        if(isCursorInRect(r) && statusActive === 'nameThumbTack' && r.selected === true
            && r.thumbTacked === false){
            r.thumbTacked = true;
            r.position[0] = mouse.x - rectSize.x / 2;
            r.position[1] = mouse.y - rectSize.y / 2;
        } else if (!isCursorInRect(r)){
            r.thumbTacked = false;

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
    // if(score >= 3){
    //     watcherEvent();
    // } else if (score <= 3){
    //     bulletinValue.bulletinYesValue = 1;
    //     watcherEventIsOn = false;
    //     eventIsOn = false;
    // }
    // navalnyAlert();
  
    drawScore();
    counting();
    drawBallotBox();
    skillPanels.forEach(e => {
        e.draw();
    });
    activatingSkillPanel();
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
    skillPanels = [];
    score = 0;

    // positioning the skill panel
    for (let i = 0; i < 4; i++) {
        skillPanels.push(new skillPanel());
        skillPanels[i].name = skillPanelNames[i]; 
        skillPanels[i].imagesSrc = (skillPanels[i].name === "namePencil") ? 'skillPencil'
                                 : (skillPanels[i].name === "nameEraser") ? 'skillEraser'
                                 : (skillPanels[i].name === "nameLighter") ? 'skillLighter': 'skillThumbTack'; 
        for (let j = 1; j < skillPanels.length; j++) {
            skillPanels[i].position[0] += 20 + skillPanelSize.x;
            skillPanels[i].position[1] = skillPanelPos.y;
        }
    }
    $('inGameMenu').style.display = 'block';
    init();
    engine();
    hideMenu();
}

function pauseGame(){
    paused = true;
    document.querySelector('.menu-continue').style.display = 'inline-block';
    $('tutorial').style.display = 'none';
    $('inGameMenu').style.display = 'none';
    showMenu();
}

                    // tutorial show up
function tutorial(){
    $('tutorial').style.display = 'block';
    $('tutorial').hidden = false;
    document.querySelector('.tutorial__slider').style.display = 'block';
    $('inGameMenu').style.display = 'block';
    sliderCount = 0;
    hideMenu();
}

                    // tutorial slides changing
function next(){
    let activeSlide;
    let allSlides = document.querySelectorAll('.tutorial_info');
    sliderCount++;
    for (let i = 0; i < allSlides.length; i++) {
        const e = allSlides[i];
        e.classList.remove("active");
        if(i === sliderCount){
            activeSlide = e;
            activeSlide.classList.add(`active`);
        } else if(sliderCount >= allSlides.length){
            sliderCount = 0;
            activeSlide = allSlides[0];
            activeSlide.classList.add(`active`);
            $('tutorial').style.display = 'none';
            $('inGameMenu').style.display = 'none';
            showMenu();
        }
    }
}

function continueGame(){
    paused = false;
    $('inGameMenu').style.display = 'inline-block';
    engine();
    hideMenu();
}