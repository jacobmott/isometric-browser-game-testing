import { SpriteTypes, GlobalConfig, Point2d } from '../interfaces/interfaces'

export class Sprite {

    spritesheet: HTMLImageElement = null;
    mapLookupId: number; 
    offsetX: number = 0;
    offsetY: number = 0;
    width: number;
    height: number;
    frames: number = 1;
    currentFrame: number = 0;
    duration: number = 1;
    cartisianPosX: number = 0;
    cartisianPosY: number = 0;
    shown: boolean = true;
    zoomLevel: number = 1;
    globalConfig: GlobalConfig = { zoomLevel: 1, canvasWidth: 1920, tileWidth: 200, tileHeight: 100, hasChanged: false, offsetX: 0, offsetY: 0 };
    ftime: number;
    zIndex: number = 0;
    spriteType: SpriteTypes = 0;
    tileWidth: number;
    tileHeight: number;
    tileGridLocationRow: number;
    tileGridLocationColumn: number;
    isStatic: boolean = true;
    screenPosY: number;
    screenPosX: number;
    firstInit: boolean = true;


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
      sprite.setTileGridLocation(this.tileGridLocationRow, this.tileGridLocationColumn);
      sprite.setIsStatic(this.isStatic);
      sprite.screenPosY = this.screenPosY;
      sprite.screenPosX = this.screenPosX;
      sprite.cartisianPosX = this.cartisianPosX;
      sprite.cartisianPosY = this.cartisianPosY;
      return sprite;
    }

    setIsStatic(isStatic: boolean) {
      this.isStatic = isStatic;
    }

    setTileGridLocation(tileGridLocationRow: number, tileGridLocationColumn: number) {
      this.tileGridLocationRow = tileGridLocationRow;
      this.tileGridLocationColumn = tileGridLocationColumn;
    }

    setMapLookupId(id: number) {
      this.mapLookupId = id;
    }
    getMapLookupId() {
      return this.mapLookupId;
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
    setScreenPosition(x: number, y: number) {
      this.screenPosX = x;
      this.screenPosY = y;
    }
    getScreenPosition(): Point2d {
     return { x: this.screenPosX, y: this.screenPosY };
    }

    
    setCartisianPosition(x: number, y: number) {
      this.cartisianPosX = x;
      this.cartisianPosY = y;
    }
    getCartisianPosition(): Point2d {
     return { x: this.cartisianPosX, y: this.cartisianPosY };
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
    
    draw(c) {

      //If the user has zoomed, then the position has changed and we need to recacluate it
      // only needs to be done for static sprites that are not moving
      if (this.globalConfig.hasChanged || this.firstInit || !this.isStatic){
        this.firstInit = false;
        let row = this.cartisianPosY;
        let column = this.cartisianPosX;
        let tilePositionX = ((row - column) * (this.globalConfig.tileWidth/2)) + (this.globalConfig.offsetX);
        let tilePositionY = (row + column) * (this.globalConfig.tileHeight/2) + (this.globalConfig.offsetY);
        this.screenPosX = tilePositionX;
        this.screenPosY = tilePositionY;
      }
      if (this.shown) {
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        c.drawImage(this.spritesheet,
                    this.offsetX,
                    this.offsetY,
                    this.width,
                    this.height,
                    this.screenPosX,
                    this.screenPosY,
                    this.globalConfig.tileWidth,
                    this.globalConfig.tileHeight);
      }
    }  

}

