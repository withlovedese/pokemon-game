//we create this class for cleaner code when animating
class Sprite {
    constructor({
        position, 
        velocity, 
        image, 
        frames = { max: 1, hold:10 }, //hold determines frames per second i think
        sprites, 
        animate = false,
        rotation = 0
    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0};
        this.image.onload = () => {
            this.width = this.image.width/this.frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src        
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
        
    }

    draw() {
        // c.save() and restore because we'er using global canvas propperty which only affects code within the two lines
        c.save();
        c.translate( //to transfer rotation axis from canvas 0,0 to  center of object we wanna rotate
            this.position.x + this.width / 2, 
            this.position.y + this.height / 2
            );
        c.rotate(this.rotation); //in radians
        c.translate( //to transfer rotation axis from canvas center of object we wanna rotate back to canvas 0,0
            -this.position.x - this.width / 2, 
            -this.position.y - this.height / 2
            );
        c.globalAlpha = this.opacity; //global canvas property
        // c.drawImage(this.image, this.position.x, this.position.y); //only takes an html img tag with starting x and y coords
        //draw player/bg
        c.drawImage(
        this.image,
        this.frames.val*this.width, //x coord for start of crop *48 to push over to next animation frame
        0, //y coord for start of crop
        this.image.width/this.frames.max, //x coord for end of crop (crop width)
        this.image.height, //x coord for end of crop
        this.position.x,
        this.position.y,
        this.image.width/this.frames.max, //actual width and height of image rendered on screen
        this.image.height,
        );

        c.restore();

        if (!this.animate) return;

        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }

        if (this.frames.elapsed % this.frames.hold === 0){
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }

    }

}

//monster class

class Monster extends Sprite{
    constructor({
        position, 
        velocity, 
        image, 
        frames = { max: 1, hold:10 }, //hold determines frames per second i think
        sprites, 
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({ //properties depend on parent
            position, 
            velocity, 
            image, 
            frames,
            sprites, 
            animate,
            rotation,
        })

        this.name = name;
        this.isEnemy = isEnemy;
        this.health = 100;
        this.attacks = attacks;

    }

    attack({attack, recipient, renderedSprites}){
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name

        let healthBar = '#enemyHealthBar';
        if (this.isEnemy) healthBar = '#myHealthBar'
        recipient.health -= attack.damage; //updates health bar

        let rotation = 1;
        if(this.isEnemy) rotation = -2.2;
        switch (attack.name) {
            case 'Tackle':
                const tl = gsap.timeline();

                let movementDistance = 20;
                if (this.isEnemy) movementDistance = -20;
                

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }) .to(this.position, {
                    x: this.position.x + (movementDistance*2),
                    duration: 0.1,
                    onComplete:() => { //arrow func so we can access recipient.health from class
                        //enemy gets hit
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                }) .to(this.position, {
                    x: this.position.x
                })
                        
                break;
                
            case 'Fireball':
                audio.initFireball.play();
                const fireballImage = new Image();
                fireballImage.src = './imgs/fireball.png'
                const fireball = new Sprite({
                    position:{
                        x: this.position.x,
                        y: this.position.y
                    },
                    frames: {
                        max:4,
                        hold:10
                    },
                    image:fireballImage,
                    animate: true,
                    rotation
                })
                renderedSprites.splice(1,0, fireball);
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        //enemy gets hit
                        audio.fireballHit.play();
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        renderedSprites.splice(1,1); //removes fireball
                    }
                } )
                break;
            default:
                break;
        }
        

    }

    faint(){
        document.querySelector('#dialogueBox').innerHTML = this.name + ' has fainted!!';
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play();
    }

}

//create canvas object based on collisionsmap
class Boundary{
    static width = 48;
    static height = 48;
    constructor({position}){
        this.position = position;
        this.width = 48;
        this.height = 48;
    }

    draw(){
        c.fillStyle = 'rgba(255, 0, 0, 0)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}