const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
//console.log(gsap)



canvas.width = 1024;
canvas.height = 576;

// c.fillStyle = 'white';
// c.fillRect(0, 0, canvas.width, canvas.height);

const collisionsMap = [];
//create 2d array for collisions
for (let i = 0; i < collisions.length; i+=70){ //70 tiles wide
    collisionsMap.push(collisions.slice(i, i + 70));

}

const battleZonesMap = [];
//create 2d array for battleZones
for (let i = 0; i < battlezonesdata.length; i+=70){ //70 tiles wide
    battleZonesMap.push(battlezonesdata.slice(i, i + 70));

}



const offset = {
    x:-735,
    y:-650
}

const boundaries = [];
collisionsMap.forEach((row, i) =>{
    row.forEach((tile, j) =>{
        if (tile === 1025) {
            boundaries.push(new Boundary({
                position:{
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y 
            }}));
        }  
    })
})

const battleZones = [];
battleZonesMap.forEach((row, i) =>{
    row.forEach((tile, j) =>{
        if (tile === 1025) {
            battleZones.push(new Boundary({
                position:{
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y 
            }}));
        }  
    })
})



//import img and create img html tag for it
const image = new Image();
image.src = './imgs/Pellet Town.png'

//create player image
const playerDown = new Image();
playerDown.src = './imgs/playerDown.png';
const playerUp = new Image();
playerUp.src = './imgs/playerUp.png';
const playerLeft = new Image();
playerLeft.src = './imgs/playerLeft.png';
const playerRight = new Image();
playerRight.src = './imgs/playerRight.png';

//create foreground image
const foregroundI= new Image();
foregroundI.src = './imgs/foregroundobjects.png';


const player = new Sprite({
    
    position: {
        x: canvas.width/2 - (192/4) /2,//puts img in middle of the screen/image location on canvas
        y: canvas.height/2 - 68/2,
    },
    image: playerDown,
    frames: {
        max:4,
        hold: 10
    },

    sprites: {
        up: playerUp,
        left: playerLeft,
        right: playerRight,
        down: playerDown
    }
})

const background = new Sprite({
    position: {
        x:offset.x,
        y:offset.y
    },
    image: image
});

const foreground = new Sprite({
    position: {
        x:offset.x,
        y:offset.y
    },
    image: foregroundI
});

const keys = {
    w:{
        pressed:false
    },
    up:{
        pressed:false
    },
    a:{
        pressed:false
    },
    left:{
        pressed:false
    },
    s:{
        pressed:false
    },
    down:{
        pressed:false
    },
    d:{
        pressed:false
    },
    right:{
        pressed:false
    }
}
// const testBoundary = new Boundary({
//     position: {
//         x:400,
//         y:400
//     }
// })

const movables = [background, ...boundaries, foreground, ...battleZones];
function rectangularCollision({rectangle1, rectangle2}){

    return(
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    );

}

const battle = {
    initiated: false
}
function animate(){
    const animationId = window.requestAnimationFrame(animate); //ensures it loops by creating an infinite loop
    //draw image
    background.draw();
    //draw collisions
    boundaries.forEach(boundary =>{
        boundary.draw();
    })
    //draw battle zone
    battleZones.forEach(zone =>{
        zone.draw();
    })

    //draw player
    player.draw();
    //draw foreground
    foreground.draw();

    let moving = true;
    player.animate = false;
    if(battle.initiated) return
    
    //activate a battle
    if (keys.s.pressed || keys.down.pressed || keys.w.pressed || keys.up.pressed || keys.a.pressed || keys.left.pressed || keys.d.pressed || keys.right.pressed){
        for(let i = 0; i < battleZones.length; i++){
            const zone= battleZones[i];
            const overlappingArea = ( //calculation for intersection 
                Math.min(player.position.x + player.width, zone.position.x + zone.width) - 
                Math.max(player.position.x, zone.position.x)) * (
                Math.min(player.position.y + player.height, zone.position.y + zone.height) -
                Math.max(player.position.y, zone.position.y));
            //detect for collision
            if ((rectangularCollision({
                    rectangle1:player, 
                    rectangle2: zone
                })) &&
                (overlappingArea > (player.width * player.height) / 2)  &&//ensures at least half of player is on battle zone before activating
                (Math.random() < 0.01) //gives a 1 percent chance of activating battle
                ){
                //deactivate current animation loop
                window.cancelAnimationFrame(animationId);
                audio.map.stop();
                audio.initBattle.play();
                audio.battle.play();
                battle.initiated = true;
                //animation for overlay
                gsap.to('#overlay', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlay', {
                            opacity:1,
                            duration: 0.4,
                            onComplete(){
                                //activate a new animation loop
                                initBattle();
                                animateBattle(); 
                                gsap.to('#overlay', {
                                    opacity:0,
                                    duration: 0.4,
                                })
                            }
                        })

                         
                    }
                });
                break;
            }
        }
    }
    
    
    if (keys.s.pressed && lastKey === 's' || keys.down.pressed && lastKey === 'down'){
        player.image = player.sprites.down;
        player.animate = true;
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            //detect for collision
            if (rectangularCollision({
                rectangle1:player, 
                rectangle2:{...boundary, position: { //makes a clone of current srpite and overwrites position to check for future collision
                    x:boundary.position.x,
                    y: boundary.position.y - 3
                }}
                })){
                moving = false;
                break; //break as soon as you collide, no need to loop through rest
            }
            
        }

        if (moving){
            movables.forEach((movable) => {
                movable.position.y -=3;
            })
        } 


    }
    else if (keys.w.pressed && lastKey === 'w'|| keys.up.pressed && lastKey === 'up') {
        player.image = player.sprites.up;
        player.animate = true;
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            //detect for collision
            if (rectangularCollision({
                rectangle1:player, 
                rectangle2:{...boundary, position: { //makes a clone of current srpite and overwrites position to check for future collision
                    x:boundary.position.x,
                    y: boundary.position.y + 3
                }}
                })){
                
                moving = false;
                break; //break as soon as you collide, no need to loop through rest
            }


        }
        if (moving){
            movables.forEach((movable) => {
                movable.position.y +=3;
            })
        }
    }
    else if (keys.a.pressed && lastKey === 'a'|| keys.left.pressed && lastKey === 'left') {
        player.image = player.sprites.left;
        player.animate = true;
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            //detect for collision
            if (rectangularCollision({
                rectangle1:player, 
                rectangle2:{...boundary, position: { //makes a clone of current srpite and overwrites position to check for future collision
                    x:boundary.position.x + 3,
                    y: boundary.position.y
                }}
                })){
                moving = false;
                break; //break as soon as you collide, no need to loop through rest
            }


        }
        if (moving){
            movables.forEach((movable) => {
                movable.position.x +=3;
            })
        }
    }
    else if (keys.d.pressed && lastKey === 'd'|| keys.right.pressed && lastKey === 'right') {
        player.image = player.sprites.right;
        player.animate = true;
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            //detect for collision
            if (rectangularCollision({
                rectangle1:player, 
                rectangle2:{...boundary, position: { //makes a clone of current srpite and overwrites position to check for future collision
                    x:boundary.position.x - 3,
                    y: boundary.position.y
                }}
                })){
                moving = false;
                break; //break as soon as you collide, no need to loop through rest
            }


        }
        if (moving){
            movables.forEach((movable) => {
                movable.position.x -=3;
            })
        }
    }
}
//animate();


let lastKey = '';
window.addEventListener('keydown', (e) => {
    
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'ArrowUp':
            keys.up.pressed = true;
            lastKey = 'up';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            lastKey = 'left';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'ArrowDown':
            keys.down.pressed = true;
            lastKey = 'down';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'ArrowRight':
            keys.right.pressed = true;
            lastKey = 'right';
            break;
        default:
            break;
    }
    
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'ArrowUp':
            keys.up.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'ArrowDown':
            keys.down.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
        default:
            break;
    }
});

let clicked = false;
addEventListener('click', () =>{
    if (!clicked) {
        audio.map.play();
        clicked= true;
    }   
})



