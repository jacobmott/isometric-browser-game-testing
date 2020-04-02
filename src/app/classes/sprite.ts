export class Sprite {

    spritesheet = null;
    offsetX: number = 0;
    offsetY: number = 0;
    width: number;
    height: number;
    frames: number = 1;
    currentFrame: number = 0;
    duration: number = 1;
    posX: number = 0;
    posY: number = 0;
    shown: boolean = true;
    zoomLevel: number = 1;
    ftime: number;

    constructor(src: string, width: number, height: number, offsetX: number, offsetY: number, frames: number, duration: number) {

        this.width = width;
        this.height = height;

        this.setSpritesheet(src);
        this.setOffset(offsetX, offsetY);
        this.setFrames(frames);

        this.setDuration(duration);
        let d = new Date();
        if (this.duration > 0 && this.frames > 0) {
          this.ftime = d.getTime() + (this.duration / this.frames);
        } 
        else {
          this.ftime = 0;
        }
    }
      
    setSpritesheet(src) {
      if (src instanceof Image) {
        this.spritesheet = src;
      } 
      else {
        this.spritesheet = new Image();
        this.spritesheet.src = src;
      }
    }
    
    
    setPosition(x, y) {
      this.posX = x;
      this.posY = y;
    }
    
    setOffset(x, y) {
      this.offsetX = x;
      this.offsetY = y;
    }
    
    setFrames(fcount) {
      this.currentFrame = 0;
      this.frames = fcount;
    }

    setToStartFrame() {
      this.currentFrame = 0;
    }
    
    setDuration(duration) {
      this.duration = duration;
    }
    
    animate(c, t) {
      if (t.getMilliseconds() > this.ftime) {
        this.nextFrame ();
      }
    
      this.draw(c);
    }
    
       
    nextFrame() {
      if (this.duration > 0) {
        let d = new Date();
        if (this.duration > 0 && this.frames > 0) {
          this.ftime = d.getTime() + (this.duration / this.frames);
        } 
        else {
          this.ftime = 0;
        }
        this.offsetX = this.width * this.currentFrame;
        if (this.currentFrame === (this.frames - 1)) {
          this.currentFrame = 0;
        } 
        else {
          this.currentFrame++;
        }
      }
    }
    
    draw(c) {
      if (this.shown) {

        c.drawImage(this.spritesheet,
                    this.offsetX,
                    this.offsetY,
                    this.width,
                    this.height,
                    this.posX,
                    this.posY,
                    this.width * this.zoomLevel,
                    this.height * this.zoomLevel);
      }
    }  

}

