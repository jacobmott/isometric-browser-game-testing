import { SpriteTypes, GlobalConfig, Point2d } from '../interfaces/interfaces'

export class Sprite {

    spritesheet: HTMLImageElement = null;
    mapLookupId: number;
    originalMapLookupId: number;
    offsetX: number = 0;
    offsetY: number = 0;
    width: number;
    height: number;
    frames: number = 1;
    currentFrame: number = 0;
    duration: number = 1;
    shown: boolean = true;
    zoomLevel: number = 1;
    globalConfig: GlobalConfig;
    ftime: number;
    zIndex: number = 0;
    spriteType: SpriteTypes = 0;
    tileWidth: number;
    tileHeight: number;
    isStatic: boolean = true;
    firstInit: boolean = true;
    debug: boolean = true;
    toggleZindex: boolean = true;
    isClicked: boolean = false;

    renderMapLookupId: number;
    isoColumnX: number = 0;
    isoRowY: number = 0;
    cartisianScreenPosX: number = 0;
    cartisianScreenPosY: number = 0;


    constructor(src: any, width: number, height: number, offsetX: number, offsetY: number, frames: number, duration: number, spriteType: SpriteTypes) {

      this.width = width;
      this.height = height  
      this.setSpritesheet(src);
      this.setOffset(offsetX, offsetY);
      this.setFrames(frames)  
      this.setDuration(duration);
      this.setSpriteType(spriteType);
      let d = new Date();
      if (this.duration > 0 && this.frames > 0) {
        this.ftime = d.getTime() + (this.duration / this.frames);
      } 
      else {
        this.ftime = 0;
      }

    }

    deepClone(): Sprite{
      let sprite: Sprite = new Sprite(
        this.getSpritesheet(),
        this.getWidth(),
        this.getHeight(),
        this.getOffsetX(),
        this.getOffsetY(),
        this.getFrames(),
        this.getDuration(),
        this.getSpriteType()
      );
      sprite.setZindex(this.zIndex);
      sprite.setTileWidth(this.tileWidth);
      sprite.setTileHeight(this.tileHeight);
      sprite.setGlobalConfig(this.globalConfig);
      //sprite.setTileGridLocation(this.tileGridLocationRow, this.tileGridLocationColumn);
      sprite.setIsStatic(this.isStatic);
      sprite.setCartisianScreenPosition(this.getCartisianScreenPosition().x, this.getCartisianScreenPosition().y);
      sprite.setIsoGridPosition(this.getIsoGridPosition().x, this.getIsoGridPosition().y);
      sprite.setMapLookupId(this.mapLookupId);
      return sprite;
    }

    setIsStatic(isStatic: boolean) {
      this.isStatic = isStatic;
    }


    setMapLookupId(id: number) {
      this.mapLookupId = id;
    }
    getMapLookupId() {
      return this.mapLookupId;
    }

    setIsClicked(isClicked: boolean) {
      this.isClicked = isClicked;
    }
    


    setRenderMapLookupId(id: number) {
      this.renderMapLookupId = id;
    }
    getRenderMapLookupId() {
      return this.renderMapLookupId;
    }

    

    setGlobalConfig(globalConfig: GlobalConfig) {
      this.globalConfig = globalConfig;
    }
    getGlobalConfig() {
      return this.globalConfig;
    }


    setTileWidth(tileWidth: number) {
      this.tileWidth = tileWidth;
    }
    getTileWidth() {
      return this.tileWidth;
    }   

    setTileHeight(tileHeight: number) {
      this.tileHeight = tileHeight;
    }
    getTileHeight() {
      return this.tileHeight;
    }       


    setZoomLevel(zoomLevel: number) {
      this.zoomLevel = zoomLevel;
    }
    getZoomLevel() {
      return this.zoomLevel;
    }  

    setSpriteType(spriteType: SpriteTypes) {
      this.spriteType = spriteType;
    }
    getSpriteType() {
      return this.spriteType;
    }

    setWidth(width: number) {
      this.width = width;
    }
    getWidth() {
      return this.width;
    }

    setHeight(height: number) {
      this.height = height;
    }
    getHeight() {
      return this.height;
    }
      

    setSpritesheet(src: any) {
      if (src instanceof Image) {
        this.spritesheet = src;
      } 
      else {
        this.spritesheet = new Image();
        this.spritesheet.src = src;
      }
    }
    getSpritesheet(): HTMLImageElement {
      return this.spritesheet;
    }

    //Isometric coordinates
    setIsoGridPosition(isoColumnX: number, isoRowY: number) {
      this.isoColumnX = isoColumnX;
      this.isoRowY = isoRowY;
    }
    getIsoGridPosition(): Point2d {
     return { x: this.isoColumnX, y: this.isoRowY };
    }

    
    setCartisianScreenPosition(x: number, y: number) {
      this.cartisianScreenPosX = x;
      this.cartisianScreenPosY = y;
    }
    getCartisianScreenPosition(): Point2d {
     return { x: this.cartisianScreenPosX, y: this.cartisianScreenPosY };
    }

    getZindex() {
      return this.zIndex;
    }
    setZindex(zIndex: number) {
      this.zIndex = zIndex;
    }

    
    getOffsetY() {
      return this.offsetY;
    }
    getOffsetX() {
      return this.offsetX;
    }
    setOffset(x: number, y: number) {
      this.offsetX = x;
      this.offsetY = y;
    }
    
    setFrames(fcount: number) {
      this.frames = fcount;
    }
    getFrames() {
      return this.frames;
    }

    setToStartFrame() {
      this.currentFrame = 0;
    }
    
    setDuration(duration) {
      this.duration = duration;
    }
    getDuration() {
      return this.duration;
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

    roundCorrectly(num: number){
      return Math.round((num + Number.EPSILON) * 100) / 100;
    }
    
    draw(c) {
      if (this.shown) {
        if (this.globalConfig.debug){
          c.beginPath();
          c.lineWidth = 1;
          c.strokeStyle = this.globalConfig.alternateDebugGridLine%2 === 0 ? "blue" : "red";
          ++this.globalConfig.alternateDebugGridLine;
          c.rect(this.cartisianScreenPosX, this.cartisianScreenPosY, this.globalConfig.boardCellWidth, this.globalConfig.boardCellHeight);
          c.stroke();
          c.font = 'italic bold 10pt Courier';
          c.fillStyle = "yellow";  //<======= here
          c.fillRect(this.cartisianScreenPosX, this.cartisianScreenPosY, this.globalConfig.boardCellWidth/1.2, this.globalConfig.boardCellHeight/2.5);
          c.fillStyle = "black";  //<======= here
          c.fillText ("Ct:"+this.cartisianScreenPosX.toFixed(2)+":"+this.cartisianScreenPosY.toFixed(2), this.cartisianScreenPosX, this.cartisianScreenPosY+12); 
          c.fillText ("Is:"+this.isoRowY+":"+this.isoColumnX, this.cartisianScreenPosX, this.cartisianScreenPosY+24); 
          c.fillText ("Tp:"+this.getMapLookupId(), this.cartisianScreenPosX, this.cartisianScreenPosY+36);
        } 
        else{
          //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
          c.drawImage(this.spritesheet,
                      this.offsetX,
                      this.offsetY,
                      this.width,
                      this.height,
                      this.cartisianScreenPosX,
                      this.cartisianScreenPosY,
                      this.globalConfig.boardCellWidth,
                      this.globalConfig.boardCellHeight);
        }
        if (this.isClicked){
          c.globalAlpha = 0.3;
          c.fillStyle = "yellow";
          c.fillRect(this.cartisianScreenPosX, this.cartisianScreenPosY, this.globalConfig.boardCellWidth, this.globalConfig.boardCellHeight);
          c.globalAlpha = 1.0;
        }
  
      }
    }  

}

