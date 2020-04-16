import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Sprite} from '../classes/sprite';
import { Entity} from '../classes/entity';
import { Timer } from '../classes/timer';
import { Point2d, SpriteTypes, GlobalConfig } from '../interfaces/interfaces';
import * as Utils from '../utils/utils'
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  
//########################################################################################################
// member variables
//
//########################################################################################################  

  globalConfig: GlobalConfig = {
    zoomLevel: 1,
    zoomFactor: 1,
    zoomPercent: 1,
    canvasWidth: 1920,
    canvasHeight: 1080,
    tileWidth: 100,
    tileHeight: 100,
    hasChanged: false,
    offsetX: 0,
    offsetY: 0,
    alternateDebugGridLine: 1,
    debug: false,
    initialOffsetX: 0,
    initialOffsetY: 0,
    boardCellWidth: 0,
    boardCellHeight: 0,
    boardCellsWide: 0,
    boardCellsHeigh: 0,
    boardCenterPointX: 0,
    boardCenterPointY: 0,
    boardCenterCellNumberX: 0,
    boardCenterCellNumberY: 0,
    boardCenterCellNumberXOld: 0,
    boardCenterCellNumberYOld: 0,
    boardCellWidthInitial: 0,
    boardCellHeightInitial: 0,
    boardHeight: 0,
    boardWidth: 0,
    boardOffsetX: 0,
    boardCellWidthDifference: 0,
    boardCellHeightDifference: 0,
    boardCellWidthOld: 0,
    boardCellHeightOld: 0,
    boardCellWidthToHeightRatio: 0
  }

  groundTileSpritesZIndex0: Map<number, Sprite> = new Map<number, Sprite>();
  buildingTileSpritesZIndex1: Map<number, Sprite> = new Map<number, Sprite>();
  playerTileSpritesZIndex2: Map<number, Sprite> = new Map<number, Sprite>();
  entityTileSpritesZIndex2: Map<number, Sprite> = new Map<number, Sprite>();
  spriteMapLookupIdSequence: number = 0;
  allSprites: Map<string, Sprite> = new Map<string, Sprite>();


  clickedCell: Point2d = {x: 0, y: 0};

  spriteTypesLookupMap: Map<number, Sprite> = new Map<number, Sprite>();
  currentPlayerSpriteId: number = 0;
  currentPlayerSprite: Sprite = null;

  playerWalking: boolean = false;
  player: Entity = new Entity();

  rows: number =  11;
  columns: number = 10;
  //we did have 200 to 100 before .. which is 2 to 1.. but thats not a true isometric projection
  //Technically, isometric tiles cannot have a width/height ratio of 2:1. 
  //The ratio actually has to be 1.732:1 for the angular properties to be preserved. What we call an "isometric" projection is actually a dimetric projection
  //Anyway, FWIW, 2:1 is much easier math-wise. I'm not sure using real isometric angles would be worth the extra effort.
  //I was just reading Wikipedia and saw the same thing about dimetric projection actually being used instead of isometric projection, but I guess everybody 
  //still calls it isometric projection anyways.
  levelData: number [][];


  gameLoopF;
  timer: Timer;
  fpsCount: number = 0;
  fps: number = 60;
  SVGgridImg: any;
  initialized: boolean = false;


  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;

  mouseCurrentPos = { clientX: 0, clientY: 0 };
  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    var bounds = this.ctx.canvas.getBoundingClientRect();
    // get the mouse coordinates, subtract the canvas top left and any scrolling
    this.mouseCurrentPos.clientX = event.pageX - bounds.left - scrollX;
    this.mouseCurrentPos.clientY = event.pageY - bounds.top - scrollY;
  
    //To get the correct canvas coordinate you need to scale the mouse coordinates to match the canvas resolution coordinates.
     // first normalize the mouse coordinates from 0 to 1 (0,0) top left
     // off canvas and (1,1) bottom right by dividing by the bounds width and height
     this.mouseCurrentPos.clientX /=  bounds.width; 
     this.mouseCurrentPos.clientY /=  bounds.height; 
  
     // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution
     this.mouseCurrentPos.clientX *= this.ctx.canvas.width;
     this.mouseCurrentPos.clientY *= this.ctx.canvas.height;
     this.clickedCell = this.whatCellWasClicked();

     let spriteId = this.clickedCell.x.toString()+":"+this.clickedCell.y.toString();
     let sprite = this.allSprites.get(spriteId);
     console.log(JSON.stringify(this.allSprites));
     sprite.toggleIsClicked();
    }

  @HostListener('wheel', ['$event']) 
  onMousewheel(event) {
    var bounds = this.ctx.canvas.getBoundingClientRect();
    // get the mouse coordinates, subtract the canvas top left and any scrolling
    this.mouseCurrentPos.clientX = event.pageX - bounds.left - scrollX;
    this.mouseCurrentPos.clientY = event.pageY - bounds.top - scrollY;
  
    //To get the correct canvas coordinate you need to scale the mouse coordinates to match the canvas resolution coordinates.
     // first normalize the mouse coordinates from 0 to 1 (0,0) top left
     // off canvas and (1,1) bottom right by dividing by the bounds width and height
     this.mouseCurrentPos.clientX /=  bounds.width; 
     this.mouseCurrentPos.clientY /=  bounds.height; 
     // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution
     this.mouseCurrentPos.clientX *= this.ctx.canvas.width;
     this.mouseCurrentPos.clientY *= this.ctx.canvas.height;
      if(event.deltaY>0){
        this.globalConfig.zoomLevel -= 1;
        if (this.globalConfig.zoomLevel < -8){ 
          this.globalConfig.zoomLevel = -8;
          return;
        }
        this.globalConfig.zoomPercent -= 0.1;
      }
      if(event.deltaY<0){
        this.globalConfig.zoomLevel += 1;
        this.globalConfig.zoomPercent += 0.1;
      }
      this.globalConfig.boardCellWidthOld = this.globalConfig.boardCellWidth;
      this.globalConfig.boardCellHeightOld = this.globalConfig.boardCellHeight;
      this.globalConfig.boardCellWidth = Math.round((this.globalConfig.boardCellWidthInitial) * this.globalConfig.zoomPercent);
      this.globalConfig.boardCellHeight = Math.round((this.globalConfig.boardCellHeightInitial) * this.globalConfig.zoomPercent);   
      this.globalConfig.hasChanged = true;
      this.reconfigureBoardSettings();
      this.reinitializeSpritesPositionAndZindexRenderMapFromBoardLevelData();      
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

    this.timer = new Timer();

    this.player.setPoint2d({ x: 200, y: 500});
    this.player.setZindex(2);
    this.player.setSpeed(200);
    this.player.setDead(false);

    //this.initGrid();
    this.configureBoardSettings();

    ////Create our lookupmap so when we are looking through our level data we can lookup the sprite we need per tile
    this.initializeSpriteLookupMap();

    this.createLevelData();

    ////Add the sprites that are in the levelmap data to the render queues at the right positions
    this.addPlayerToBoard();
    this.placetile(1, {x: 0, y: 0},0,0);
    this.placetile(2, {x: 0, y: 0},0,0);
    this.placetile(3, {x: 0, y: 0},0,0);

    this.initializeSpritesPositionAndZindexRenderMapFromBoardLevelData();
    this.gameLoop();

  }

//########################################################################################################
// addPlayerToBoard
//
//########################################################################################################
addPlayerToBoard() {
  this.placetile(0, {x: 200, y: 200}, 0, 0);
}


//########################################################################################################
// createLevelData
//
//########################################################################################################
createLevelData() {

  //20 to 25 buildings

  let myRows = this.globalConfig.boardCellsHeigh;
  let myColumns = this.globalConfig.boardCellsWide;
  this.levelData = [];
  for (let row: number = 0; row < myRows; row++){
    this.levelData[row] = [];
    for (let column: number = 0; column < myColumns; column++){
      this.levelData[row][column] = this.getRandomLevelData();
    }
  }

}



//########################################################################################################
// getRandomLevelData
//
//########################################################################################################
getRandomLevelData() {

  //return 13;
  let setToChooseFrom = Utils.getRandomArbitrary(SpriteTypes.GROUND, SpriteTypes.BUILDING);

  //default 13 ground
  let type: number = 13;

  if (setToChooseFrom === SpriteTypes.GROUND){
    //20 to 26 buildings
    type = Utils.getRandomArbitrary(20, 26);
  }
  else if (setToChooseFrom === SpriteTypes.BUILDING){
    //10 to 14 ground
    type = Utils.getRandomArbitrary(10, 14);
  }

  return type;
}

//########################################################################################################
// gameLoop
//
//########################################################################################################
  gameLoop() {

    this.gameLoopF = setInterval(() => {

      this.playerWalking = false;
      if(this.keyDown["d"]) {
        this.player.point2d.x += this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 2;
      }
      if(this.keyDown["a"]) {
        this.player.point2d.x -= this.player.speed/this.fps;
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
      if(this.keyDown["0"]) {
        this.globalConfig.debug = !this.globalConfig.debug;
      }
   
      //Update the current sprites position(So we can draw the sprite) from the players position
      this.currentPlayerSprite = this.playerTileSpritesZIndex2.get(this.currentPlayerSpriteId);
      this.currentPlayerSprite.setCartisianScreenPosition(this.player.point2d.x, this.player.point2d.y);
      let playersIsoPoint = this.playersCurrentTileLocation();
      let isoColumnX: number = playersIsoPoint.x;
      let isoRowY: number = playersIsoPoint.y;      
      this.currentPlayerSprite.setIsoGridPosition(isoColumnX,isoRowY);
      this.ctx.clearRect (0, 0, this.globalConfig.canvasWidth, this.globalConfig.canvasHeight);
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


  getTileCoordinates(pt:Point2d): Point2d{
    let tempPt: Point2d = {x: 0, y: 0};
    tempPt.x = Math.floor(pt.x / this.globalConfig.boardCellWidth);
    tempPt.y = Math.floor(pt.y / this.globalConfig.boardCellHeight);
    return tempPt;
  }

//########################################################################################################
// whatCellWasClicked
// https://laserbrainstudios.com/2010/08/the-basics-of-isometric-programming/
//########################################################################################################
  whatCellWasClicked(): Point2d {

   let screenX = this.mouseCurrentPos.clientX;
   let screenY = this.mouseCurrentPos.clientY;
   //You’ll notice that I start with subtracting 438 from the mouse cursor’s x-coordinate. 
   //This is because I added 400 to the x-coordinate when drawing the tiles, 
   //so I have to subtract this again (as well as half a tile width) before calculating which tile the mouse is over.
   
   screenX = screenX - (this.globalConfig.boardOffsetX+(this.globalConfig.boardCellWidth/2));
   let columnX = Math.trunc((screenY / (this.globalConfig.boardCellHeight)) + (screenX / this.globalConfig.boardCellWidth));
   let rowY = Math.trunc((screenY / (this.globalConfig.boardCellHeight)) - (screenX / this.globalConfig.boardCellWidth));

   let point: Point2d = {
     x: columnX,
     y: rowY
   };
   return point;
 }

//########################################################################################################
// playersCurrentTileLocation
//  This calculates the edge of our box.. the top left corner on the screen is the edge of the box.
//  The the real player probably should have the point in the center of themselves for this calculation
//########################################################################################################
  playersCurrentTileLocation(): Point2d{
  
   let screenX = this.player.point2d.x;
   let screenY = this.player.point2d.y;
  
    screenX = screenX - (this.globalConfig.boardCellWidth/2) ;
    let tileX = Math.trunc((screenY / (this.globalConfig.boardCellHeight)) + (screenX / this.globalConfig.boardCellWidth));
    let tileY = Math.trunc((screenY / (this.globalConfig.boardCellHeight)) - (screenX / this.globalConfig.boardCellWidth));
    let point: Point2d = {
      x: tileX,
      y: tileY
    };
    return point;
  }


//########################################################################################################
// reconfigureBoardSettings
//
//########################################################################################################
reconfigureBoardSettings() {

  this.ctx = this.canvas.nativeElement.getContext('2d');
  
  //We only want the quotient for this wide/heigh measurment
  this.globalConfig.boardCellsWide = Math.floor(this.globalConfig.canvasWidth/this.globalConfig.boardCellWidth); 
  this.globalConfig.boardCellsHeigh = Math.floor(this.globalConfig.canvasHeight/this.globalConfig.boardCellHeight);
  
  //This should actually remain the same (currnetly locked to 2 to 1 (2:1))
  this.globalConfig.boardCellWidthToHeightRatio = Math.trunc(this.globalConfig.boardCellWidth / this.globalConfig.boardCellHeight);
  //Lets double the cells to make is larger, since when we convert these cells to isometric and display them they are much smaller
  //Also, lets make sure the wide and heigh is always even, that lets us get a "center" position of the grid easily (just divide wide and height by 2
  //and we get another nice even number
  this.globalConfig.boardCellsWide *= 2;
  this.globalConfig.boardCellsHeigh *= 2;
  if (this.globalConfig.boardCellsWide % 2 === 0){
  }
  else{
    this.globalConfig.boardCellsWide += 1;
  }

  if (this.globalConfig.boardCellsHeigh % 2 === 0){
  }
  else{
    this.globalConfig.boardCellsHeigh += 1;
  }  


  this.globalConfig.boardCenterCellNumberXOld = this.globalConfig.boardCenterCellNumberX;
  this.globalConfig.boardCenterCellNumberYOld = this.globalConfig.boardCenterCellNumberY;

  //This is the iso center cell, (We have to figure out how to get this center cell aligned with the screen coordinates center)
  this.globalConfig.boardCenterCellNumberX = (this.globalConfig.boardCellsWide/2);
  this.globalConfig.boardCenterCellNumberY = (this.globalConfig.boardCellsHeigh/2);

  this.globalConfig.boardWidth = this.globalConfig.boardCellsWide * this.globalConfig.boardCellWidth;
  this.globalConfig.boardHeight = this.globalConfig.boardCellsHeigh * this.globalConfig.boardCellHeight;  

  this.globalConfig.boardCellWidthDifference = this.globalConfig.boardCellWidthOld - this.globalConfig.boardCellWidth;
  this.globalConfig.boardCellHeightDifference = this.globalConfig.boardCellHeightOld - this.globalConfig.boardCellHeight;  

  this.globalConfig.boardOffsetX = (this.globalConfig.canvasWidth/2 - (this.globalConfig.boardCellWidth/2));
}  


//########################################################################################################
// configureBoardSettings
//
//########################################################################################################
 configureBoardSettings() {

  this.ctx = this.canvas.nativeElement.getContext('2d');
  this.canvas.nativeElement.width  = this.canvas.nativeElement.offsetWidth;
  this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;

  this.globalConfig.canvasWidth = this.canvas.nativeElement.width;
  this.globalConfig.canvasHeight = this.canvas.nativeElement.height;
  
  /*let's say we want to draw an isometric square in the center of the page. 
  Before we do that though, let's draw a normal square in the center of the page 
  so you know where some of these wild assumptions come from. To do that, we need to know 
  where the square should go. We know our canvas is canvasWidth wide and our cells are cellWidth wide so
  we can assume that our canvas can fit around canvasWidth/cellWidth cells.*/

  this.globalConfig.boardCellWidth = 200;
  this.globalConfig.boardCellHeight = 100;
  this.globalConfig.boardCellWidthToHeightRatio = Math.trunc(this.globalConfig.boardCellWidth / this.globalConfig.boardCellHeight);

  //We only want the quotient for this wide/heigh measurment
  this.globalConfig.boardCellsWide = Math.floor(this.globalConfig.canvasWidth/this.globalConfig.boardCellWidth); //9
  this.globalConfig.boardCellsHeigh = Math.floor(this.globalConfig.canvasHeight/this.globalConfig.boardCellHeight); //10
  //Lets double the cells to make is larger, since when we convert these cells to isometric and display them they are much smaller
  //Also, lets make sure the wide and heigh is always even, that lets us get a "center" position of the grid easily (just divide wide and height by 2
  //and we get another nice even number
  this.globalConfig.boardCellsWide *= 2; //18
  this.globalConfig.boardCellsHeigh *= 2; //20
  if (this.globalConfig.boardCellsWide % 2 === 0){
  }
  else{
    this.globalConfig.boardCellsWide += 1;
  }

  if (this.globalConfig.boardCellsHeigh % 2 === 0){
  }
  else{
    this.globalConfig.boardCellsHeigh += 1;
  }  

  //this is the center in screen coordinates
  this.globalConfig.boardCenterPointX = (this.globalConfig.canvasWidth/2);
  this.globalConfig.boardCenterPointY = (this.globalConfig.canvasHeight/2);


  //This is the iso center cell, (We still have to figure out how to get this center cell aligned with the screen coordinates center)
  this.globalConfig.boardCenterCellNumberX = (this.globalConfig.boardCellsWide/2);
  this.globalConfig.boardCenterCellNumberY = (this.globalConfig.boardCellsHeigh/2);



  this.globalConfig.boardCellWidthInitial =this.globalConfig.boardCellWidth;
  this.globalConfig.boardCellHeightInitial =this.globalConfig.boardCellHeight;
  this.globalConfig.boardWidth = this.globalConfig.boardCellsWide * this.globalConfig.boardCellWidth;
  this.globalConfig.boardHeight = this.globalConfig.boardCellsHeigh * this.globalConfig.boardCellHeight;  

  this.globalConfig.boardOffsetX = (this.globalConfig.canvasWidth/2 - (this.globalConfig.boardCellWidth/2));
}


//########################################################################################################
// isoTo2D
//
//########################################################################################################
isoTo2D(pt:Point2d):Point2d{
  var tempPt:Point2d = {x: 0, y: 0};
  tempPt.x = (2 * pt.y + pt.x) / 2;
  tempPt.y = (2 * pt.y - pt.x) / 2;
  //we have a 2 to 1 ratio cell size, so we have to scale
  //Otherwise we'd just do this above if we had a 1 to 1 ratio, width to height cell size (1:1)  
  tempPt.x = tempPt.x * this.globalConfig.boardCellWidthToHeightRatio;
  return tempPt;
}


//########################################################################################################
// twoDToIso
//
//########################################################################################################
 twoDToIso(pt:Point2d):Point2d{
  var tempPt:Point2d = {x: 0, y: 0};
  //we have a 2 to 1 ratio cell size, so we have to scale
  pt.x = pt.x / this.globalConfig.boardCellWidthToHeightRatio;
  //Otherwise we'd just do this below if we had a 1 to 1 ratio, width to height cell size (1:1)
  tempPt.x = pt.x - pt.y;
  tempPt.y = (pt.x + pt.y) / 2;
  return tempPt;
}

//########################################################################################################
// initializeSpritesPositionAndZindexRenderMapFromBoardLevelData
//
//########################################################################################################
initializeSpritesPositionAndZindexRenderMapFromBoardLevelData() {

  let myRows = this.globalConfig.boardCellsHeigh;
  let myColumns = this.globalConfig.boardCellsWide;


  //for (i, loop through rows)
  //for (j, loop through columns)
  // x = j * tile width
  // y = i * tile height
  // tileType = levelData[i][j]
  // placetile(tileType, x, y)

  for (let row: number = 0; row < myRows; row++){

    for (let column: number = 0; column < myColumns; column++){
      let x = column * this.globalConfig.boardCellWidth;
      let y = row * this.globalConfig.boardCellHeight;
      let spriteType = this.levelData[row][column]
      let isoScreenCoord: Point2d = this.twoDToIso({x: x, y: y}) ;
      //let reverseBackToXandY: Point2d = this.isoTo2D(isoScreenCoord);
      isoScreenCoord.x = isoScreenCoord.x + this.globalConfig.boardOffsetX;
      this.placetile(spriteType, isoScreenCoord, row, column);
    }

  }



}



//########################################################################################################
// reinitializeSpritesPositionAndZindexRenderMapFromBoardLevelData
//
//########################################################################################################
reinitializeSpritesPositionAndZindexRenderMapFromBoardLevelData() {

  //lets draw a isometric tile at position 0,0
  //now, give this an isometric perspective is pretty easy, we essentially tilt the square.
  //a sort of simplified way to do this is as follows - 
  //It means that we essentially draw a diamond instead of a square, and then halve the height
  //and double the width.
  //the first point, (the top of the diamond) is 1/2 the width of the square from where the top left
  //corner of a normal square would be, to the right
  let cellWidth = this.globalConfig.boardCellWidth;
  let cellHeight = this.globalConfig.boardCellHeight;

  this.groundTileSpritesZIndex0.forEach((sprite: Sprite, key: number) => {
    let row = sprite.getIsoGridPosition().y;
    let column = sprite.getIsoGridPosition().x;    
    let x = column * this.globalConfig.boardCellWidth;
    let y = row * this.globalConfig.boardCellHeight;
    let isoScreenCoord: Point2d = this.twoDToIso({x: x, y: y}) ;
    isoScreenCoord.x = isoScreenCoord.x + this.globalConfig.boardOffsetX;
    sprite.setCartisianScreenPosition(isoScreenCoord.x, isoScreenCoord.y);
  });
  this.buildingTileSpritesZIndex1.forEach((sprite: Sprite, key: number) => {
    let row = sprite.getIsoGridPosition().y;
    let column = sprite.getIsoGridPosition().x;    
    let x = column * this.globalConfig.boardCellWidth;
    let y = row * this.globalConfig.boardCellHeight;
    let isoScreenCoord: Point2d = this.twoDToIso({x: x, y: y}) ;
    isoScreenCoord.x = isoScreenCoord.x + this.globalConfig.boardOffsetX;
    sprite.setCartisianScreenPosition(isoScreenCoord.x, isoScreenCoord.y);
  });

  //what to do with player?

  //let row = this.currentPlayerSprite.getIsoGridPosition().y;
  //let column = this.currentPlayerSprite.getIsoGridPosition().x;    
  //let x = column * this.globalConfig.boardCellWidth;
  //let y = row * this.globalConfig.boardCellHeight;
  //let isoScreenCoord: Point2d = this.twoDToIso({x: x, y: y}) ;
  //isoScreenCoord.x = isoScreenCoord.x + this.globalConfig.boardOffsetX;
  //this.currentPlayerSprite.setCartisianScreenPosition(isoScreenCoord.x, isoScreenCoord.y);
  //this.currentPlayerSprite.setCartisianScreenPosition(xz, yz);

  //this.currentPlayerSprite.draw(this.ctx);
  //we dont have any enemeies yet
  //this.entityTileSpritesZIndex2.forEach((sprite: Sprite, key: number) => {
  //  let row = sprite.getIsoGridPosition().y;
  //  let column = sprite.getIsoGridPosition().x;    
  //  let center = {
  //    x: ( (row-column)*(cellWidth/2) ) + offsetXToCenterIsoGrid,
  //    y: ( (row+column)*(cellHeight/2) ) - offsetYToCenterIsoGrid
  //  }
  //  sprite.setCartisianScreenPosition(center.x, center.y);
  //});


}

//########################################################################################################
// placetile
//
//########################################################################################################
placetile(spriteType: number, isoScreenCoord: Point2d, isoRowY: number, isoColumnX: number) {
  this.spriteMapLookupIdSequence += 1;

  let x = isoScreenCoord.x;
  let y = isoScreenCoord.y;
  //Clone the tile so we have a copy, all objects are passed by reference in typescript
  let sprite: Sprite = this.spriteTypesLookupMap.get(spriteType);
  let clonedSprite: Sprite = sprite.deepClone();
  //column is our x, row is our y
  clonedSprite.setCartisianScreenPosition(x, y);
  clonedSprite.setIsoGridPosition(isoColumnX,isoRowY);
  clonedSprite.setRenderMapLookupId(this.spriteMapLookupIdSequence);
  let spriteId = isoColumnX.toString()+":"+isoRowY.toString();

  if (clonedSprite.getZindex() === 0){
    if (clonedSprite.getSpriteType() === SpriteTypes.GROUND){
      this.groundTileSpritesZIndex0.set(clonedSprite.getRenderMapLookupId(), clonedSprite);

      this.allSprites.set(spriteId, clonedSprite);
    }
  }

  if (clonedSprite.getZindex() === 1){
    if (clonedSprite.getSpriteType() === SpriteTypes.BUILDING){
      this.buildingTileSpritesZIndex1.set(clonedSprite.getRenderMapLookupId(), clonedSprite);

      this.allSprites.set(spriteId, clonedSprite);
    }
  }

  if (clonedSprite.getZindex() === 2){
    if (clonedSprite.getSpriteType() === SpriteTypes.PLAYER){
      clonedSprite.setRenderMapLookupId(sprite.getMapLookupId());
      if (clonedSprite.getRenderMapLookupId() > 0){
        let startingPlayerSprite: Sprite = this.playerTileSpritesZIndex2.get(0);
        clonedSprite.setCartisianScreenPosition(startingPlayerSprite.getCartisianScreenPosition().x, startingPlayerSprite.getCartisianScreenPosition().y);
        clonedSprite.setIsoGridPosition(startingPlayerSprite.getIsoGridPosition().x,startingPlayerSprite.getIsoGridPosition().y);
      }
      else{
        this.player.point2d.x = x;
        this.player.point2d.y = y;
      }
      this.playerTileSpritesZIndex2.set(clonedSprite.getRenderMapLookupId(), clonedSprite);

      this.allSprites.set(spriteId, clonedSprite);
    }
    else if (clonedSprite.getSpriteType() === SpriteTypes.ENEMY){
      this.entityTileSpritesZIndex2.set(clonedSprite.getRenderMapLookupId(), clonedSprite);

      this.allSprites.set(spriteId, clonedSprite);
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
    this.entityTileSpritesZIndex2.forEach((sprite: Sprite, key: number) => {
      sprite.draw(this.ctx);
    });
  }



//########################################################################################################
// addGroundSpritesToLookupMap
// ground sprites range 10-19
//########################################################################################################
  addGroundSpritesToLookupMap() {


    let cellHeight = this.globalConfig.boardCellHeight;
    let cellWidth = this.globalConfig.boardCellWidth;    

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

    ground11.setTileWidth(cellWidth);
    ground12.setTileWidth(cellWidth);
    ground13.setTileWidth(cellWidth);
    ground14.setTileWidth(cellWidth);    
    ground11.setTileHeight(cellHeight);
    ground12.setTileHeight(cellHeight);
    ground13.setTileHeight(cellHeight);
    ground14.setTileHeight(cellHeight);

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

  let cellHeight = this.globalConfig.boardCellHeight;
  let cellWidth = this.globalConfig.boardCellWidth;

  // Initialize our sprites
  let spritesheet = 'assets/Medieval_Expasnion_Pantheon_9.png';
  // Initialize our sprites]
  let building20: Sprite = new Sprite(spritesheet, 1524, 1593,0,0,0,0, SpriteTypes.BUILDING);
  building20.setZindex(1);
  building20.setMapLookupId(20);
  building20.setTileWidth(cellWidth);
  building20.setTileHeight(cellHeight);
  building20.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(20, building20);

  //wall(Horizontal/Row?)
  spritesheet = "assets/towerskeles.png";
  let building21: Sprite = new Sprite(spritesheet, 622, 311,0,0,0,0, SpriteTypes.BUILDING);
  building21.setZindex(1);
  building21.setMapLookupId(21);
  building21.setTileWidth(cellWidth);
  building21.setTileHeight(cellHeight);
  building21.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(21, building21);

  //wall(Horizontal/Row?)
  spritesheet = "assets/towerskeles2.png";
  let building22: Sprite = new Sprite(spritesheet, 622, 311,0,0,0,0, SpriteTypes.BUILDING);
  building22.setZindex(1);
  building22.setMapLookupId(22);
  building22.setTileWidth(cellWidth);
  building22.setTileHeight(cellHeight);
  building22.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(22, building22);

  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_8.png";
  let building23: Sprite = new Sprite(spritesheet, 1524, 1593,0,0,0,0, SpriteTypes.BUILDING);
  building23.setZindex(1);
  building23.setMapLookupId(23);
  building23.setTileWidth(cellWidth);
  building23.setTileHeight(cellHeight);
  building23.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(23, building23);  

  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_7.png";
  let building24: Sprite = new Sprite(spritesheet, 599, 738,0,0,0,0, SpriteTypes.BUILDING);
  building24.setZindex(1);
  building24.setMapLookupId(24);
  building24.setTileWidth(cellWidth);
  building24.setTileHeight(cellHeight);
  building24.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(24, building24);  


  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expasnion_Pantheon_16.png";
  let building25: Sprite = new Sprite(spritesheet, 959, 1115,0,0,0,0, SpriteTypes.BUILDING);
  building25.setZindex(1);
  building25.setMapLookupId(25);
  building25.setTileWidth(cellWidth);
  building25.setTileHeight(cellHeight);
  building25.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(25, building25); 


  //wall(Horizontal/Row?)
  spritesheet = "assets/Medieval_Expansion_Trees_54.png";
  let building26: Sprite = new Sprite(spritesheet, 355, 415,0,0,0,0, SpriteTypes.BUILDING);
  building26.setZindex(1);
  building26.setMapLookupId(26);
  building26.setTileWidth(cellWidth);
  building26.setTileHeight(cellHeight);
  building26.setGlobalConfig(this.globalConfig);
  this.spriteTypesLookupMap.set(26, building26); 


}


//########################################################################################################
// addPlayerSpritesToLookupMap
// ground sprites range 0-9
//########################################################################################################
  addPlayerSpritesToLookupMap() {
    

    let cellHeight = this.globalConfig.boardCellHeight;
    let cellWidth = this.globalConfig.boardCellWidth;    

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
    femaleWalkingDown.setTileWidth(cellWidth);
    femaleWalkingDown.setTileHeight(cellHeight);
    femaleWalkingLeft.setTileWidth(cellWidth);
    femaleWalkingLeft.setTileHeight(cellHeight);
    femaleWalkingRight.setTileWidth(cellWidth);
    femaleWalkingRight.setTileHeight(cellHeight);
    femaleWalkingUp.setTileWidth(cellWidth);
    femaleWalkingUp.setTileHeight(cellHeight);

    femaleWalkingDown.setGlobalConfig(this.globalConfig);
    femaleWalkingLeft.setGlobalConfig(this.globalConfig);
    femaleWalkingRight.setGlobalConfig(this.globalConfig);
    femaleWalkingUp.setGlobalConfig(this.globalConfig);      
    
    
    femaleWalkingDown.setIsStatic(false);
    femaleWalkingLeft.setIsStatic(false);
    femaleWalkingRight.setIsStatic(false);
    femaleWalkingUp.setIsStatic(false);  

    femaleWalkingDown.isPlayer = true;
    femaleWalkingLeft.isPlayer = true;
    femaleWalkingRight.isPlayer = true;
    femaleWalkingUp.isPlayer = true;
    
    

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
  let c = this.ctx;

  if (timeStamp !== this.timer.getSeconds()) {
    this.fps = this.fpsCount;
    this.fpsCount = 0;
  } 
  else {
    this.fpsCount++;
  }
  c.globalAlpha = 0.7;
  c.fillStyle = "white";
  c.fillRect(0, 0, 460, 540);
  c.globalAlpha = 1.0;
  c.fillStyle = "black";

  c.font = 'italic bold 12pt Hack';
  let elapsedTime = timeStamp - this.timer.getStartTime();
  let floatMinutes = elapsedTime/60;
  let minutes = Math.trunc(floatMinutes);
  let seconds = elapsedTime%60;
  c.fillText ("Elapsed Time: "+"Minutes( "+minutes+" ) Seconds( "+seconds+" )", 10, 20);
  c.fillText ("FPS: " + this.fps, 10, 40);


  c.fillText ("Zoom Info: ", 10, 80);
  c.fillText ("Level: " + this.globalConfig.zoomLevel, 10, 100);
  c.fillText ("zoomPercent: " + this.globalConfig.zoomPercent, 10, 120); 


  c.fillText ("Mouse Info: ", 10, 160);
  c.fillText ("xPosition: " + this.mouseCurrentPos.clientX, 10, 180);  
  c.fillText ("yPosition: " + this.mouseCurrentPos.clientY, 10, 200);  
  c.fillText ("clickedCell: " + this.clickedCell.x+" : "+this.clickedCell.y, 10, 220);    

  c.fillText ("Board Info: ", 10, 260);
  c.fillText ("BoardWidth: " + this.globalConfig.boardWidth, 10, 280);
  c.fillText ("BoardHeight: " + this.globalConfig.boardHeight, 10, 300);
  c.fillText ("BoardCellsWide: " + this.globalConfig.boardCellsWide, 10, 320);
  c.fillText ("BoardCellsHeigh: " + this.globalConfig.boardCellsHeigh, 10, 340);
  c.fillText ("BoardCellWidth: " + this.globalConfig.boardCellWidth, 10, 360);
  c.fillText ("BoardCellHeight: " + this.globalConfig.boardCellHeight, 10, 380);
  c.fillText ("boardCellWidthDifference: " + this.globalConfig.boardCellWidthDifference, 10, 400);
  c.fillText ("boardCellHeightDifference: " + this.globalConfig.boardCellHeightDifference, 10, 420);
  c.fillText ("boardCellWidthToHeightRatio: " + this.globalConfig.boardCellWidthToHeightRatio, 10, 440);
  


  c.fillText ("Player Info: ", 10, 480);
  c.fillText ("XPos: " + this.currentPlayerSprite.getCartisianScreenPosition().x, 10, 500);
  c.fillText ("YPos: " + this.currentPlayerSprite.getCartisianScreenPosition().y, 10, 520);  

}



//########################################################################################################
// drawDebugInfo() {
//
//########################################################################################################
drawDebugInfo() {

  let c = this.ctx;
  c.globalAlpha = 0.7;
  c.fillStyle = "white";
  c.fillRect(1330, 0, 600, 160);
  c.globalAlpha = 1.0;

  c.fillStyle = "black";
  c.font = 'italic bold 12pt Hack';
  c.fillText ("CONTROLS: ", 1330, 20);
  c.fillText ("W,A,S,D to move: ", 1330, 40);
  c.fillText ("Scroll up and down on mouse scrollwheel to zoom in/out ", 1330, 60);  
  c.fillText ("Tap 0(zero) to toggle debug info on the map on/off: ", 1330, 80);  

  c.fillText ("LEGEND: ", 1330, 100);
  c.fillText ("Ct: Cartesian(Screen) coordinates (X/Y)", 1330, 120);
  c.fillText ("Is: Isometric Tile/Grid coordinates (Column(X)/Row(Y))", 1330, 140);  
  
 // this.ctx.fillText ("CURRENT PLAYER LOCATION INFO: ", 1300, 234);
 // this.ctx.fillText ("Ct: x: "+this.currentPlayerSprite.getCartisianScreenPosition().x, 1300, 248);  
 // this.ctx.fillText ("Ct: y: "+this.currentPlayerSprite.getCartisianScreenPosition().y, 1300, 262);  
  
}
 



}

