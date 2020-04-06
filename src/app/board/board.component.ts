import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Sprite} from '../classes/sprite';
import { Entity} from '../classes/entity';
import { Timer } from '../classes/timer';
import { Point2d, SpriteTypes, GlobalConfig } from '../interfaces/interfaces';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {


//http://clintbellanger.net/articles/isometric_math/
  
//########################################################################################################
// member variables
//
//########################################################################################################  

  isoOffsetX: number = 400;
  isoOffsetY: number = 0;
  canvasWidth: number;
  canvasHeight: number;

  globalConfig: GlobalConfig = {
    zoomLevel: 1,
    canvasWidth: 1920,
    tileWidth: 100,
    tileHeight: 100,
    hasChanged: false,
    offsetX: 0,
    offsetY: 0
  }

  groundTileSpritesZIndex0: Map<number, Sprite> = new Map<number, Sprite>();
  buildingTileSpritesZIndex1: Map<number, Sprite> = new Map<number, Sprite>();
  playerTileSpritesZIndex2: Map<number, Sprite> = new Map<number, Sprite>();
  entityTileSpritesZIndex2: Map<number, Sprite> = new Map<number, Sprite>();
  spriteMapLookupIdSequence: number = 0;  
  lastScrollTop: number = 0;
  rows: number =  8;
  columns: number = 11;
  //we did have 200 to 100 before .. which is 2 to 1.. but thats not a true isometric projection
  //Technically, isometric tiles cannot have a width/height ratio of 2:1. 
  //The ratio actually has to be 1.732:1 for the angular properties to be preserved. What we call an "isometric" projection is actually a dimetric projection
  //Anyway, FWIW, 2:1 is much easier math-wise. I'm not sure using real isometric angles would be worth the extra effort.
  //I was just reading Wikipedia and saw the same thing about dimetric projection actually being used instead of isometric projection, but I guess everybody 
  //still calls it isometric projection anyways.
  tileWidth: number = 100;
  tileHeight: number = 100;
  levelData: number [][] = [
    [20,20,20,20,20,20,20,20,20,20,23],
    [20,20,20,20,20,20,20,20,20,20,20],
    [20,20,20,20,20,20,20,20,20,20,20],
    [20,20,20,20,20,20,20,0,20,20,20],
    [20,20,20,20,20,20,20,20,20,20,20],
    [20,20,20,20,20,20,20,20,20,20,20],
    [20,20,20,20,20,20,20,20,20,20,20],
    [25,20,20,20,20,20,20,20,20,20,24]
  ];



  spriteTypesLookupMap: Map<number, Sprite> = new Map<number, Sprite>();
  imagesLoaded: number = 0;
  currentPlayerSpriteId: number = 0;
  currentPlayerSprite: Sprite = null;

  playerWalking: boolean = false;
  player: Entity = new Entity();
  currentGroundSpriteId: number;


  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;


  mouseCurrentPosEvent;

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    this.mouseCurrentPosEvent = event;
    //let point: Point2d = this.whatTileWasClicked();
    //this.levelData[point.x][point.y] = 3;
    //this.tilesZIndex1 = [];
    //this.tilesZIndex2 = [];
  }

  @HostListener('wheel', ['$event']) 
  onMousewheel(event) {
    console.log(event);
    if(event.deltaY>0){
      this.globalConfig.zoomLevel += 0.5;
      this.globalConfig.tileWidth = this.globalConfig.tileWidth * 0.5;
      this.globalConfig.tileHeight = this.globalConfig.tileHeight * 0.5;
      this.globalConfig.offsetY += 400;
      this.globalConfig.hasChanged = true;
    }
    if(event.deltaY<0){
      this.globalConfig.zoomLevel -= 0.5;
      this.globalConfig.tileWidth = this.globalConfig.tileWidth / 0.5;
      this.globalConfig.tileHeight = this.globalConfig.tileHeight / 0.5;
      //this.globalConfig.offsetY = this.centerIso;
      this.globalConfig.offsetY -= 400;
      this.globalConfig.hasChanged = true;
    }
  }

  keyDown: object = {};

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e){
    e = e || event; // to deal with IE
    this.keyDown[e.key.toLowerCase()] = false;
    this.keyDown[e.key.toUpperCase()] = false;
  }


  
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e){
    e = e || event; // to deal with IE
    //Handle upper and lowercase version (In case the have caps lock on)
    this.keyDown[e.key.toLowerCase()] = true;
    this.keyDown[e.key.toUpperCase()] = true;
  }

  gameLoopF;
  timer: Timer = new Timer();
  fpsCount: number = 0;
  fps: number = 60;
  startTime: number = 0;



//########################################################################################################
// constructor
//
//########################################################################################################  
  constructor() { 
  }


//########################################################################################################
// ngOnInit
//
//########################################################################################################  
  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.width  = this.canvas.nativeElement.offsetWidth;
    this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;

    this.isoOffsetX = this.canvas.nativeElement.width/2;

    this.canvasWidth = this.canvas.nativeElement.width;
    this.canvasHeight = this.canvas.nativeElement.height;

    this.globalConfig.canvasWidth = this.canvasWidth;
    
    this.globalConfig.offsetX = this.canvasWidth/2;

    this.player.setPoint2d({ x: 200, y: 500});
    this.player.setZindex(2);
    this.player.setSpeed(2);
    this.player.setDead(false);

    //Create our lookupmap so when we are looking through our level data we can lookup the sprite we need per tile
    this.initializeSpriteLookupMap();

    //Add the sprites that are in the levelmap data to the render queues at the right positions
    this.initializeSpritesPositionAndZindexRenderMapFromBoardLevelData();
    this.addSpriteForRenderingAndAnimating(1, 0, 0,0,0);
    this.addSpriteForRenderingAndAnimating(2, 0, 0,0,0);
    this.addSpriteForRenderingAndAnimating(3, 0, 0,0,0);
    this.gameLoop();
  }



//########################################################################################################
// gameLoop
//
//########################################################################################################
  gameLoop() {

  
    this.gameLoopF = setInterval(() => {
      this.playerWalking = false;
      if(this.keyDown["d"]) {
        this.player.point2d.x -= this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 2;
      }
      if(this.keyDown["a"]) {
        this.player.point2d.x += this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 1;
      }
      if(this.keyDown["w"]) {
        this.player.point2d.y -=  this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 3;
      }
      if(this.keyDown["s"]) {
        this.player.point2d.y +=  this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 0;
      }

      if(this.keyDown["s"]) {
        this.player.point2d.y +=  this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 0;
      }
 
      this.currentPlayerSprite = this.playerTileSpritesZIndex2.get(this.currentPlayerSpriteId);
      this.currentPlayerSprite.setCartisianPosition(this.player.point2d.x, this.player.point2d.y);

      this.ctx.clearRect (0, 0, this.canvasWidth, this.canvasHeight);
      this.drawAndAnimateSprites();
    
      this.drawTimeAndFpsStats(this.timer.getSeconds());
      this.drawDebugInfo();
      this.globalConfig.hasChanged = false;
    }, 1);

}  


//########################################################################################################
// initializeSpriteLookupMap
//
//########################################################################################################
  initializeSpriteLookupMap(){

    this.addGroundSpritesToLookupMap();
    this.addBuildingSpritesToLookupMap();
    this.addPlayerSpritesToLookupMap();
  
  }


//########################################################################################################
// initializeSpritesPositionAndZindexRenderMapFromBoardLevelData
//
//########################################################################################################
  initializeSpritesPositionAndZindexRenderMapFromBoardLevelData(){

    let index: number = 0;
    for (let column: number = 0; column < this.columns; column++){
      for (let row: number = 0; row < this.rows; row++){
        let tilePositionX = ((row - column) * (this.tileWidth/2)) + (this.globalConfig.offsetX);
        let tilePositionY = (row + column) * (this.tileHeight/2);
        let spriteType = this.levelData[row][column];        
        this.addSpriteForRenderingAndAnimating(spriteType, Math.round(tilePositionX), Math.round(tilePositionY), row, column);
        ++index;
      }
    }

  }


//########################################################################################################
// addSpriteForRenderingAndAnimating
//
//########################################################################################################
addSpriteForRenderingAndAnimating(spriteType: number, x: number, y: number, row: number, column: number) {
  this.spriteMapLookupIdSequence += 1;

  //Clone the tile so we have a copy, all objects are passed by reference in typescript
  let sprite: Sprite = this.spriteTypesLookupMap.get(spriteType);
  let clonedSprite: Sprite = sprite.deepClone();
  clonedSprite.setCartisianPosition(column, row);
  clonedSprite.setScreenPosition(x, y);  
  clonedSprite.setMapLookupId(this.spriteMapLookupIdSequence);

  if (clonedSprite.getZindex() === 0){
    if (clonedSprite.getSpriteType() === SpriteTypes.GROUND){
      this.groundTileSpritesZIndex0.set(clonedSprite.getMapLookupId(), clonedSprite);
    }
  }

  if (clonedSprite.getZindex() === 1){
    if (clonedSprite.getSpriteType() === SpriteTypes.BUILDING){
      this.buildingTileSpritesZIndex1.set(clonedSprite.getMapLookupId(), clonedSprite);
    }
  }

  if (clonedSprite.getZindex() === 2){
    if (clonedSprite.getSpriteType() === SpriteTypes.PLAYER){
      clonedSprite.setMapLookupId(sprite.getMapLookupId());
      if (clonedSprite.getMapLookupId() > 0){
        let startingPlayerSprite: Sprite = this.playerTileSpritesZIndex2.get(0);
        clonedSprite.setCartisianPosition(startingPlayerSprite.getCartisianPosition().x, startingPlayerSprite.getCartisianPosition().y);
      }
      else{
        this.player.point2d.x = column;
        this.player.point2d.y = row;
      }
      this.playerTileSpritesZIndex2.set(clonedSprite.getMapLookupId(), clonedSprite);
    }
    else if (clonedSprite.getSpriteType() === SpriteTypes.ENEMY){
      this.entityTileSpritesZIndex2.set(clonedSprite.getMapLookupId(), clonedSprite);
    }
  }

}


//########################################################################################################
// drawAndAnimateSprites
//
//########################################################################################################
  drawAndAnimateSprites() {

    this.groundTileSpritesZIndex0.forEach((sprite: Sprite, key: number) => {
      sprite.draw(this.ctx);
    });
    this.buildingTileSpritesZIndex1.forEach((sprite: Sprite, key: number) => {
      sprite.draw(this.ctx);
    });
    if (this.playerWalking){
      this.currentPlayerSprite.animate(this.ctx, this.timer);
    }
    else{
      this.currentPlayerSprite.draw(this.ctx);
    }
    //this.playerTileSpritesZIndex2.forEach((sprite: Sprite, key: number) => {
    //  sprite.draw(this.ctx);
    //});
    this.entityTileSpritesZIndex2.forEach((sprite: Sprite, key: number) => {
      sprite.draw(this.ctx);
    });
  }


//########################################################################################################
// whatTileWasClicked
//
//########################################################################################################
  whatTileWasClicked(): Point2d{

   let screenX = this.mouseCurrentPosEvent.clientX;
   let screenY = this.mouseCurrentPosEvent.clientY;

    screenX = screenX - ((this.canvasWidth / 2)+(this.tileWidth/2));
    let tileX = Math.trunc((screenY / (this.tileHeight)) + (screenX / this.tileWidth));
    let tileY = Math.trunc((screenY / (this.tileHeight)) - (screenX / this.tileWidth));
    //console.log("Tile X: "+tileX+" : "+"Y: "+tileY+" : Was clicked!");
    let point: Point2d = {
      x: tileX,
      y: tileY
    };
    return point;
  }

//########################################################################################################
// playersCurrentTileLocation
//
//########################################################################################################
playersCurrentTileLocation(): Point2d{

  let screenX = this.player.point2d.x;
  let screenY = this.player.point2d.y;

   screenX = screenX - ((this.canvasWidth / 2)+(this.tileWidth/2));
   let tileX = Math.trunc((screenY / (this.tileHeight)) + (screenX / this.tileWidth));
   let tileY = Math.trunc((screenY / (this.tileHeight)) - (screenX / this.tileWidth));
   //console.log("Tile X: "+tileX+" : "+"Y: "+tileY+" : Was clicked!");
   let point: Point2d = {
     x: tileX,
     y: tileY
   };
   return point;
 }


//########################################################################################################
// addGroundSpritesToLookupMap
// ground sprites range 10-19
//########################################################################################################
  addGroundSpritesToLookupMap() {


    // Initialize our sprites
    let spritesheet = 'assets/ground4.png';

    let ground10: Sprite = new Sprite(spritesheet, 2400, 1200,0,0,0,0, SpriteTypes.GROUND);
    ground10.setZindex(0);
    ground10.setMapLookupId(10);
    ground10.setGlobalConfig(this.globalConfig);
    this.spriteTypesLookupMap.set(10, ground10);


    // Initialize our sprites
    spritesheet = 'assets/Medieval_Expansion_GroundDecals_3.png';

    let ground11  = new Sprite(spritesheet, 384, 384, 0, 0, 1, 0, SpriteTypes.GROUND);
    let ground12  = new Sprite(spritesheet, 384, 384, 384, 0, 1, 0, SpriteTypes.GROUND);
    let ground13  = new Sprite(spritesheet, 384, 384, 0, 384, 1, 0, SpriteTypes.GROUND);
    let ground14  = new Sprite(spritesheet, 384, 384, 384, 384, 1, 0, SpriteTypes.GROUND);

    ground11.setGlobalConfig(this.globalConfig);
    ground12.setGlobalConfig(this.globalConfig);
    ground13.setGlobalConfig(this.globalConfig);
    ground14.setGlobalConfig(this.globalConfig);

    ground11.setZindex(0);
    ground12.setZindex(0);
    ground13.setZindex(0);
    ground14.setZindex(0);    
    ground11.setMapLookupId(11);
    ground12.setMapLookupId(12);
    ground13.setMapLookupId(13);
    ground14.setMapLookupId(14);

    ground11.setTileWidth(this.tileWidth);
    ground12.setTileWidth(this.tileWidth);
    ground13.setTileWidth(this.tileWidth);
    ground14.setTileWidth(this.tileWidth);    
    ground11.setTileHeight(this.tileHeight);
    ground12.setTileHeight(this.tileHeight);
    ground13.setTileHeight(this.tileHeight);
    ground14.setTileHeight(this.tileHeight);

    this.spriteTypesLookupMap.set(11, ground11);
    this.spriteTypesLookupMap.set(12, ground12);
    this.spriteTypesLookupMap.set(13, ground13);
    this.spriteTypesLookupMap.set(14, ground14);

  }

//########################################################################################################
// addBuildingSpritesToLookupMap
// building sprites range 20-29
//########################################################################################################
  addBuildingSpritesToLookupMap() {

  // Initialize our sprites
  let spritesheet = 'assets/Medieval_Expasnion_Pantheon_9.png';
  // Initialize our sprites
  let building20: Sprite = new Sprite(spritesheet, 1524, 1593,0,0,0,0, SpriteTypes.BUILDING);
  building20.setZindex(1);
  building20.setMapLookupId(20);
  building20.setTileWidth(this.tileWidth);
  building20.setTileHeight(this.tileHeight);
  building20.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(20, building20);

  //wall(Horizontal/Row?)
  spritesheet = "assets/towerskeles.png";
  let building21: Sprite = new Sprite(spritesheet, 622, 311,0,0,0,0, SpriteTypes.BUILDING);
  building21.setZindex(1);
  building21.setMapLookupId(21);
  building21.setTileWidth(this.tileWidth);
  building21.setTileHeight(this.tileHeight);
  building21.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(21, building21);

  //wall(Horizontal/Row?)
  spritesheet = "assets/towerskeles2.png";
  let building22: Sprite = new Sprite(spritesheet, 622, 311,0,0,0,0, SpriteTypes.BUILDING);
  building22.setZindex(1);
  building22.setMapLookupId(22);
  building22.setTileWidth(this.tileWidth);
  building22.setTileHeight(this.tileHeight);
  building22.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(22, building22);

  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_8.png";
  let building23: Sprite = new Sprite(spritesheet, 1524, 1593,0,0,0,0, SpriteTypes.BUILDING);
  building23.setZindex(1);
  building23.setMapLookupId(23);
  building23.setTileWidth(this.tileWidth);
  building23.setTileHeight(this.tileHeight);
  building23.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(23, building23);  

  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_7.png";
  let building24: Sprite = new Sprite(spritesheet, 599, 738,0,0,0,0, SpriteTypes.BUILDING);
  building24.setZindex(1);
  building24.setMapLookupId(24);
  building24.setTileWidth(this.tileWidth);
  building24.setTileHeight(this.tileHeight);
  building24.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(24, building24);  


  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_16.png";
  let building25: Sprite = new Sprite(spritesheet, 959, 1115,0,0,0,0, SpriteTypes.BUILDING);
  building25.setZindex(1);
  building25.setMapLookupId(25);
  building25.setTileWidth(this.tileWidth);
  building25.setTileHeight(this.tileHeight);
  building25.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(25, building25); 

  
  

}


//########################################################################################################
// addPlayerSpritesToLookupMap
// ground sprites range 0-9
//########################################################################################################
  addPlayerSpritesToLookupMap() {
    
    // Initialize our sprites
    let spritesheet = 'assets/Medieval_KT_Female_1_walking.png';
    
    let femaleWalkingDown  = new Sprite(spritesheet, 128, 128, 0, 0, 8, 1000, SpriteTypes.PLAYER);
    let femaleWalkingLeft  = new Sprite(spritesheet, 128, 128, 0, 128, 8, 1000, SpriteTypes.PLAYER);
    let femaleWalkingRight = new Sprite(spritesheet, 128, 128, 0, 256, 8, 1000, SpriteTypes.PLAYER);
    let femaleWalkingUp    = new Sprite(spritesheet, 128, 128, 0, 384, 8, 1000, SpriteTypes.PLAYER);
    femaleWalkingDown.setZindex(2);
    femaleWalkingLeft.setZindex(2);
    femaleWalkingRight.setZindex(2);
    femaleWalkingUp.setZindex(2);
    femaleWalkingDown.setMapLookupId(0);
    femaleWalkingLeft.setMapLookupId(1);
    femaleWalkingRight.setMapLookupId(2);
    femaleWalkingUp.setMapLookupId(3);
    femaleWalkingDown.setTileWidth(this.tileWidth);
    femaleWalkingDown.setTileHeight(this.tileHeight);
    femaleWalkingLeft.setTileWidth(this.tileWidth);
    femaleWalkingLeft.setTileHeight(this.tileHeight);
    femaleWalkingRight.setTileWidth(this.tileWidth);
    femaleWalkingRight.setTileHeight(this.tileHeight);
    femaleWalkingUp.setTileWidth(this.tileWidth);
    femaleWalkingUp.setTileHeight(this.tileHeight);

    femaleWalkingDown.setGlobalConfig(this.globalConfig);
    femaleWalkingLeft.setGlobalConfig(this.globalConfig);
    femaleWalkingRight.setGlobalConfig(this.globalConfig);
    femaleWalkingUp.setGlobalConfig(this.globalConfig);      
    
    
    femaleWalkingDown.setIsStatic(false);
    femaleWalkingLeft.setIsStatic(false);
    femaleWalkingRight.setIsStatic(false);
    femaleWalkingUp.setIsStatic(false);  
    

    this.spriteTypesLookupMap.set(0, femaleWalkingDown);
    this.spriteTypesLookupMap.set(1, femaleWalkingLeft);
    this.spriteTypesLookupMap.set(2, femaleWalkingRight);
    this.spriteTypesLookupMap.set(3, femaleWalkingUp);

}


//########################################################################################################
// drawTimeAndFpsStats
//
//########################################################################################################
drawTimeAndFpsStats(timeStamp) {

  this.timer.update();

  if (timeStamp !== this.timer.getSeconds()) {
    this.fps = this.fpsCount;
    this.fpsCount = 0;
  } 
  else {
    this.fpsCount++;
  }

  this.ctx.font = '14px _sans';
  this.ctx.fillText ("Elapsed Time: " + (timeStamp - this.startTime) + " Seconds", 10, 20);
  this.ctx.fillText ("FPS: " + this.fps, 10, 40);

}



//########################################################################################################
// drawDebugInfo() {

//
//########################################################################################################
drawDebugInfo() {


  //if(this.keyDown["d"]) {
  //  this.player.point2d.x += this.player.speed/this.fps;
  //  this.playerWalking = true;
  //  this.currentPlayerSpriteId = 2;
  //}
  //if(this.keyDown["a"]) {
  //  this.player.point2d.x -= this.player.speed/this.fps;
  //  this.playerWalking = true;
  //  this.currentPlayerSpriteId = 1;
  //}
  //if(this.keyDown["w"]) {
  //  this.player.point2d.y -=  this.player.speed/this.fps;
  //  this.playerWalking = true;
  //  this.currentPlayerSpriteId = 3;
  //}
  //if(this.keyDown["s"]) {
  //  this.player.point2d.y +=  this.player.speed/this.fps;
  //  this.playerWalking = true;
  //  this.currentPlayerSpriteId = 0;
  //}
//
  //let tileGridLocationRow = this.currentPlayerSprite.tileGridLocationRow;
  //let tileGridLocationColumn = this.currentPlayerSprite.tileGridLocationColumn;
  //this.currentPlayerSprite = this.playerTileSpritesZIndex2.get(this.currentPlayerSpriteId);


  let playerLeftDKey = this.playerTileSpritesZIndex2.get(2);
  let playerRightAKey = this.playerTileSpritesZIndex2.get(1);
  let playerUpWKey = this.playerTileSpritesZIndex2.get(3);
  let playerDownSKey = this.playerTileSpritesZIndex2.get(0);

  this.ctx.font = '14px _sans';
  this.ctx.fillText ("playersCurrentTileLocation: "+"Column: "+this.playersCurrentTileLocation().x+" : "+"Row: "+this.playersCurrentTileLocation().y, 10, 300);
  this.ctx.fillText ("playerLeftDKeyCurrentPosition: "+playerLeftDKey.getCartisianPosition().x+" : "+playerLeftDKey.getCartisianPosition().y, 10, 320);
  this.ctx.fillText ("playerRightAKeyCurrentPosition: "+playerRightAKey.getCartisianPosition().x+" : "+playerRightAKey.getCartisianPosition().y, 10, 340);  
  this.ctx.fillText ("playerUpWKeyCurrentPosition: "+playerUpWKey.getCartisianPosition().x+" : "+playerUpWKey.getCartisianPosition().y, 10, 360);  
  this.ctx.fillText ("playerDownSKeyCurrentPosition: "+playerDownSKey.getCartisianPosition().x+" : "+playerDownSKey.getCartisianPosition().y, 10, 380);  
  //this.ctx.fillText ("playerLeftDKeyTileLocation: "+playerLeftDKey.screenPosX+" : "+playerLeftDKey.screenPosY, 10, 400);  
      
  
}
 



}
