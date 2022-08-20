//create battlebackground sprite
const battleBackgroundImage = new Image();
battleBackgroundImage.src = './imgs/battleBackground.png';
const battleBackground = new Sprite({
    position: {
        x:0,
        y:0
    },
    image: battleBackgroundImage
});


let draggle;
let emby;
let renderedSprites;
let queue;

let battleFrameId;

function initBattle(){
    //show user interface and hide dialogue box
    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';

    //initialize health bars to full health
    document.querySelector('#enemyHealthBar').style.width= '100%';
    document.querySelector('#myHealthBar').style.width = '100%';

    //empty attacks box for future repopulation
    document.querySelector('#attacksBox').replaceChildren();
    
    //create draggle monster sprite
    draggle = new Monster(monsters.Draggle);
    //create emby monster sprite
    emby = new Monster(monsters.Emby);
    //initialize battle layout order
    renderedSprites = [draggle, emby];
    //initialize attack animation queue
    queue = []

    //populate attack buttons
    emby.attacks.forEach((attack) => {

        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#attacksBox').append(button);
    
    })

    //event listners for attack buttons
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            })

            if (draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint();
                })
                queue.push(() => {
                    //fade to black
                    gsap.to('#overlay',{
                        opacity: 1,
                        onComplete: () => {
                            window.cancelAnimationFrame(battleFrameId);
                            animate();
                            document.querySelector('#userInterface').style.display = 'none';
                            gsap.to('#overlay',{
                                opacity: 0
                            })

                            battle.initiated = false;
                            audio.map.play();
                        }
                    })
                })
            }

            //enemy attacks here
            const randomAttack = draggle.attacks[Math.floor(Math.random()*draggle.attacks.length)]
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })

                if (emby.health <= 0) {
                    queue.push(() => {
                        emby.faint();
                    })
                    queue.push(() => {
                        //fade to black
                        gsap.to('#overlay',{
                            opacity: 1,
                            onComplete: () => {
                                window.cancelAnimationFrame(battleFrameId);
                                animate();
                                document.querySelector('#userInterface').style.display = 'none';
                                gsap.to('#overlay',{
                                    opacity: 0
                                })

                                battle.initiated = false;
                                audio.map.play();
                            }
                        })
                    })
                }
            });
        })

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attackType').innerHTML = selectedAttack.type;
            document.querySelector('#attackType').style.color = selectedAttack.color;
        })
        
    })

}

function animateBattle(){
    battleFrameId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();


    renderedSprites.forEach((sprite) =>{
        sprite.draw();
    })

}
animate()
// initBattle();
// animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else e.currentTarget.style.display = 'none';
    
})