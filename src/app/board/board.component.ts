import { Component, ViewChild, ElementRef, OnInit, ɵPlayer } from '@angular/core';
import { Tile } from '../classes/tile';
import { Sprite } from '../classes/sprite';
import { Timer } from '../classes/timer';
import { Point2d, RenderData, Player } from '../interfaces/interfaces';
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

  tilesZIndex1: RenderData [] = [];
  tilesZIndex2: RenderData [] = [];
  tiles: Map<number, Tile> = new Map<number, Tile>();
  rows: number =  8;
  columns: number = 11;
  //we did have 200 to 100 before .. which is 2 to 1.. but thats not a true isometric projection
  //Technically, isometric tiles cannot have a width/height ratio of 2:1. 
  //The ratio actually has to be 1.732:1 for the angular properties to be preserved. What we call an "isometric" projection is actually a dimetric projection
  //Anyway, FWIW, 2:1 is much easier math-wise. I'm not sure using real isometric angles would be worth the extra effort.
  //I was just reading Wikipedia and saw the same thing about dimetric projection actually being used instead of isometric projection, but I guess everybody 
  //still calls it isometric projection anyways.
  tileWidth: number = 200;
  tileHeight: number = 100;
  levelData: number [][] = [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ];
  //levelData: number [][] = [
  //  [1,1],
  //  [1,1]
  //];
  tileTypes: Map<number, Tile> = new Map<number, Tile>();
  imagesLoaded: number = 0;
  sprites: Map<number, Sprite> = new Map<number, Sprite>();
  currentPlayerSpriteId: number;


  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;


  mouseCurrentPosEvent;

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    this.mouseCurrentPosEvent = event;
    let point: Point2d = this.whatTileWasClicked();
    //this.levelData[point.x][point.y] = 3;
    //this.tilesZIndex1 = [];
    //this.tilesZIndex2 = [];
  }

  keyDown: object = {};

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e){
    e = e || event; // to deal with IE
    this.keyDown[e.key] = false;
  }


  
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e){
    e = e || event; // to deal with IE
    this.keyDown[e.key] = true;
  }

  gameLoopF;

  playerWalking: boolean = false;
  playerXPos: number = 0;
  playeryPos: number = 0;
  player: Player;


  isoOffsetX: number = 400;
  isoOffsetY: number = 0;
  canvasWidth: number;
  canvasHeight: number;

  timer: Timer = new Timer();
  fpsCount: number = 0;
  fps: number = 0;
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

    this.player = {
      point2d: {
        x: 100,
        y: 300
      },
      speed: 200,
      name: "Player",
      id: 1,
      dead: false
    }
    this.ctx.clearRect (0, 0, this.canvasWidth, this.canvasHeight);
    this.initializeTileLookupMap();
    this.setupBoard();
    this.initializePlayerSprite();
    this.gameLoop();
    //this.testSprites();
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
        this.currentPlayerSpriteId = 3;
      }
      if(this.keyDown["a"]) {
        this.player.point2d.x -= this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 2;
      }
      if(this.keyDown["w"]) {
        this.player.point2d.y -=  this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 4;
      }
      if(this.keyDown["s"]) {
        this.player.point2d.y +=  this.player.speed/this.fps;
        this.playerWalking = true;
        this.currentPlayerSpriteId = 1;
      }

      this.ctx.clearRect (0, 0, this.canvasWidth, this.canvasHeight);
      this.drawtiles();
      this.drawPlayerSpriteAndAnimate(this.timer.getSeconds());

    }, 1);

}  


//########################################################################################################
// initializeTileLookupMap
//
//########################################################################################################
  initializeTileLookupMap(){
    //ground
    let groundTile: Tile = new Tile();
    groundTile.setImage("assets/ground4.png");
    var img = new Image();   // Create new img element
    img.src = groundTile.getImage(); // Set source path
    groundTile.setZindex(1);
    let boardComponent = this;
    img.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1; 
    }
    groundTile.setImageElement(img);
    this.tileTypes.set(1, groundTile);

    //wall(Horizontal/Row?)
    let cornerWallHorizontalTile: Tile = new Tile();
    cornerWallHorizontalTile.setImage("assets/towerskeles.png");
    cornerWallHorizontalTile.setZindex(2);
    var img2 = new Image();   // Create new img element
    img2.src = cornerWallHorizontalTile.getImage(); // Set source path
    img2.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1; 
    }
    cornerWallHorizontalTile.setImageElement(img2);
    this.tileTypes.set(2, cornerWallHorizontalTile);


    //wall(Horizontal/Row?)
    let Tile3: Tile = new Tile();
    Tile3.setImage("assets/towerskeles2.png");
    Tile3.setZindex(2);
    var img3 = new Image();   // Create new img element
    img3.src = Tile3.getImage(); // Set source path
    img3.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1;   
    }
    Tile3.setImageElement(img3);
    this.tileTypes.set(3, Tile3);
  
  }


//########################################################################################################
// setupBoard
//
//########################################################################################################
  setupBoard(){

    let index: number = 0;
    for (let column: number = 0; column < this.columns; column++){
      for (let row: number = 0; row < this.rows; row++){
        let tilePositionX = ((row - column) * (this.tileWidth/2)) + (this.canvasWidth/2);
        let tilePositionY = (row + column) * (this.tileHeight/2);
        let tileType = this.levelData[row][column];
        this.addTile(tileType, Math.round(tilePositionX), Math.round(tilePositionY), index);
        ++index;
      }
    }

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
// drawtiles
//
//########################################################################################################
  drawtiles() {
    if (!(this.imagesLoaded === 3)){ return; }
    this.tilesZIndex1.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.tilePosition.x, renderData.tilePosition.y, this.tileWidth, this.tileHeight);
    });
    this.tilesZIndex2.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.tilePosition.x, renderData.tilePosition.y, this.tileWidth, this.tileHeight);
    });
  }

//########################################################################################################
// addTile
//
//########################################################################################################
  addTile(tileType: number, x: number, y: number, index: number) {

    //Clone the tile so we have a copy, all objects are passed by reference in typescript
    let tile: Tile = this.tileTypes.get(tileType);
    let clonedTile: Tile = tile.deepClone();
    clonedTile.setId(index);

    let tilePosition: Point2d = {
      x: x,
      y: y
    };

    let renderData: RenderData = {
      imgElement: clonedTile.getImageElement(),
      tilePosition: tilePosition
    };
    if (tile.getZindex() === 1){
      this.tilesZIndex1.push(renderData);
    }
    else if (tile.getZindex() === 2){
      this.tilesZIndex2.push(renderData);
    }

  }


//########################################################################################################
// initializeSprites
//
//########################################################################################################
  initializePlayerSprite() {
    let canvas = this.canvas.nativeElement;
    let c = canvas.getContext('2d');
    
    // Initialize our sprites
    let spritesheet = 'assets/Medieval_KT_Female_1_walking.png';
    
    let femaleWalkingDown  = new Sprite(spritesheet, 128, 128, 0, 0, 8, 1000);
    let femaleWalkingLeft  = new Sprite(spritesheet, 128, 128, 0, 128, 8, 1000);
    let femaleWalkingRight = new Sprite(spritesheet, 128, 128, 0, 256, 8, 1000);
    let femaleWalkingUp    = new Sprite(spritesheet, 128, 128, 0, 384, 8, 1000);
    this.sprites.set(1, femaleWalkingDown);
    this.sprites.set(2, femaleWalkingLeft);
    this.sprites.set(3, femaleWalkingRight);
    this.sprites.set(4, femaleWalkingUp);    
    this.currentPlayerSpriteId = 1;
    femaleWalkingDown.setPosition(this.player.point2d.x, this.player.point2d.y);
        
    c.font = '14px _sans';

}


//########################################################################################################
// drawPlayerSpriteAndAnimate
//
//########################################################################################################
  drawPlayerSpriteAndAnimate(timeStamp) {

    this.timer.update();
  
    if (timeStamp !== this.timer.getSeconds()) {
      this.fps = this.fpsCount;
      this.fpsCount = 0;
    } 
    else {
      this.fpsCount++;
    }
  
    //c.fillStyle = '#FFFFFF';
    //c.fillRect (0, 0, canvas.width, canvas.height);
  
    //c.fillStyle = '#000000';
    let currentPlayerSprite = this.sprites.get(this.currentPlayerSpriteId);
    if (this.playerWalking){
      let playerXPosition = this.player.point2d.x;
      let playerYPosition = this.player.point2d.y;
      currentPlayerSprite.setPosition(playerXPosition, playerYPosition);
      currentPlayerSprite.animate(this.ctx, this.timer);
      currentPlayerSprite.draw(this.ctx);
    }
    else{
      currentPlayerSprite.setToStartFrame();
      currentPlayerSprite.animate(this.ctx, this.timer);
      currentPlayerSprite.draw(this.ctx);
    }
    
    this.ctx.fillText ("Elapsed Time: " + (timeStamp - this.startTime) + " Seconds", 10, 20);
    this.ctx.fillText ("FPS: " + this.fps, 10, 40);

  }


//########################################################################################################
// testSprites
//
//########################################################################################################
  testSprites() {

    let fpsCount = 0;
    let startTime = 0;
  
    let thisInstance = this;
    window.onload = function() {
      let canvas = thisInstance.canvas.nativeElement;
      let c = canvas.getContext('2d');
  
      // Initialize our sprites
      let spritesheet = 'assets/sprite1.png';
  
      let gray = new Sprite(spritesheet, 60, 60, 0, 0, 5, 5000);
      let yellow = new Sprite(spritesheet, 60, 60, 0, 60, 5, 2500);
      let red = new Sprite(spritesheet, 60, 60, 0, 120, 5, 1666);
      let blue = new Sprite(spritesheet, 60, 60, 0, 180, 5, 1250);
      let green = new Sprite(spritesheet, 60, 60, 0, 240, 5, 1000);
  
      let timer = new Timer();
  
      c.font = '14px _sans';
  
      let startTime = timer.getSeconds();
      draw(startTime);
  
      function draw (timeStamp) {
        timer.update();
  
        if (timeStamp !== timer.getSeconds()) {
          thisInstance.fps = fpsCount;
          fpsCount = 0;
        } 
        else {
          fpsCount++;
        }
  
        c.fillStyle = '#FFFFFF';
        c.fillRect (0, 0, canvas.width, canvas.height);
  
        c.fillStyle = '#000000';
  
        gray.setPosition(40, 60);
        gray.animate(c, timer);
        gray.draw(c);
  
  
        yellow.setPosition(80, 100);
        yellow.animate(c, timer);
        yellow.draw(c);
    
        red.setPosition(120, 140);
        red.animate(c, timer);
        red.draw(c);
    
        blue.setPosition(160, 180);
        blue.animate(c, timer);
        blue.draw(c);
    
        green.setPosition(200, 220);
        green.animate(c, timer);
        green.draw(c);
    
        c.fillText ("Elapsed Time: " + (timeStamp - startTime) + " Seconds", 10, 20);
        c.fillText ("FPS: " + thisInstance.fps, 10, 40);
    
        setTimeout(function() {
          draw(timer.getSeconds());
        }, 1);
  
      }
  
    }
  }


}
