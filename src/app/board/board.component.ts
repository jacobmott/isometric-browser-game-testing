import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Tile } from '../classes/tile';
import { Point2d, DivStyle, ImgStyle, RenderData } from '../interfaces/interfaces';
import {HostListener} from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;
  mouseCurrentPosEvent;

  //@HostListener('mousemove', ['$event'])
  //handleMousemove(event) {
  //  this.mouseCurrentPosEvent = event;
  //  this.whatTileWasClicked();
  //}

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    //console.log(event);
    this.mouseCurrentPosEvent = event;
    let point: Point2d = this.whatTileWasClicked();
    this.levelData[point.x][point.y] = 3;
    this.tilesZIndex1 = [];
    this.tilesZIndex2 = [];
    this.createBoard();
  }

  tilesZIndex1: RenderData [] = [];
  tilesZIndex2: RenderData [] = [];;
  tiles: Map<number, Tile> = new Map<number, Tile>();
  rows: number =  8;
  columns: number = 11;
  //we did have 200 to 100 before .. which is 2 to 1.. but thats not a true isometric projection
  //Technically, isometric tiles cannot have a width/height ratio of 2:1. 
  //The ratio actually has to be 1.732:1 for the angular properties to be preserved. What we call an "isometric" projection is actually a dimetric projection
  //Anyway, FWIW, 2:1 is much easier math-wise. I'm not sure using real isometric angles would be worth the extra effort.
  //I was just reading Wikipedia and saw the same thing about dimetric projection actually being used instead of isometric projection, but I guess everybody still calls it isometric projection anyways.
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
  isoOffsetX: number = 400;
  isoOffsetY: number = 0;

  constructor() { 
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.width  = this.canvas.nativeElement.offsetWidth;
    this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
    this.isoOffsetX = window.innerWidth/2;
    this.initializeTypeTypes();
  }

  initializeTypeTypes(){
    //ground
    let groundTile: Tile = new Tile();
    groundTile.setImage("assets/ground4.png");
    var img = new Image();   // Create new img element
    img.src = groundTile.getImage(); // Set source path
    groundTile.setZindex(1);
    let boardComponent = this;
    img.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1;
      boardComponent.createBoard();   
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
      boardComponent.createBoard();   
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
      boardComponent.createBoard();   
    }
    Tile3.setImageElement(img3);
    this.tileTypes.set(3, Tile3);
  
  }

  createBoard(){

    if (!(this.imagesLoaded === 3)){ return; }
    this.ctx.clearRect (0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    let index: number = 0;
    for (let column: number = 0; column < this.columns; column++){
      for (let row: number = 0; row < this.rows; row++){
        let tilePositionX = ((row - column) * (this.tileWidth/2)) + (this.canvas.nativeElement.width / 2);
        let tilePositionY = (row + column) * (this.tileHeight/2);
        //let tilePositionX = (row-column) * this.tileWidth;
        //tilePositionX += (this.canvas.nativeElement.width / 2) - (this.tileWidth / 2);
        //let tilePositionY = (row + column) * (this.tileHeight / 2);
        let tileType = this.levelData[row][column];
        this.addTile(tileType, Math.round(tilePositionX), Math.round(tilePositionY), index);
        console.log("Col"+column+ ": Row"+row+": tilePositionX: "+tilePositionX+": tilePositionY: "+tilePositionY);
        ++index;
      }
    }

    this.drawtiles();

  }


  whatTileWasClicked():  Point2d{

   let screenX = this.mouseCurrentPosEvent.clientX;
   let screenY = this.mouseCurrentPosEvent.clientY;

    screenX = screenX - ((this.canvas.nativeElement.width / 2)+(this.tileWidth/2));
    let tileX = Math.trunc((screenY / (this.tileHeight)) + (screenX / this.tileWidth));
    let tileY = Math.trunc((screenY / (this.tileHeight)) - (screenX / this.tileWidth));
    console.log("Tile X: "+tileX+" : "+"Y: "+tileY+" : Was clicked!");
    let point: Point2d = {
      x: tileX,
      y: tileY
    };
    return point;
  }

  drawtiles(){
    this.tilesZIndex1.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.tilePosition.x, renderData.tilePosition.y, this.tileWidth, this.tileHeight);
    });
    this.tilesZIndex2.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.tilePosition.x, renderData.tilePosition.y, this.tileWidth, this.tileHeight);
    });
  }

  addTile(tileType: number, x: number, y: number, index: number){
    let tile: Tile = this.tileTypes.get(tileType);
    let clonedTile: Tile = tile.deepClone();
    clonedTile.setId(index);
    let tilePosition: Point2d = {
      x: x,
      y: y
    };
    //let isoCord: Point2d = this.cartesianToIsometric(cartPoint2d);
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

  //placetile(tileType: number, x: number, y: number, index: number){
  //  let tile: Tile = this.tileTypes.get(tileType);
  //  let clonedTile: Tile = tile.deepClone();
//
  //  let divStyle: DivStyle = {
  //    position: 'absolute',
  //    color: "red",
  //    width:  "100px",
  //    height: "100px",
  //    left : x+"px",
  //    top: y+"px"
  //  }
//
  //  let imgStyle: ImgStyle = {
  //    width:  "100px",
  //    height: "100px"
  //  }
//
  //  clonedTile.setDivStyle(divStyle);
  //  clonedTile.setImgStyle(imgStyle);    
  //  clonedTile.setId(index);
  //  this.tiles.set(index, clonedTile);
  //}

  getTileImgStyle(id: number){
    return this.tiles.get(id).getImgStyle();
  }

  getTileDivStyle(id: number){
    return this.tiles.get(id).getDivStyle();
  }

  getTileImage(id: number){
    return this.tiles.get(id).getImage();
  }

  cartesianToIsometric(cartPt: Point2d){
    let tempPt: Point2d = {
      x: 0,
      y: 0
    };
    tempPt.x=cartPt.x-cartPt.y;
    tempPt.y=(cartPt.x+cartPt.y)/2;
    tempPt.x = tempPt.x + this.isoOffsetX;
    tempPt.y = tempPt.y + this.isoOffsetY;
    return tempPt;
  }

  isometricToCartesian(isoPt: Point2d){
    let tempPt: Point2d = {
        x: 0,
        y: 0
      };
      tempPt.x=(2*isoPt.y+isoPt.x)/2;
      tempPt.y=(2*isoPt.y-isoPt.x)/2;
      return tempPt;
  }

  getTileCoordinates(cartPt: Point2d, tileHeight: number){
    let tempPt: Point2d = {
      x: 0,
      y: 0
    };
    tempPt.x=Math.floor(cartPt.x/tileHeight);
    tempPt.y=Math.floor(cartPt.y/tileHeight);
    return tempPt;
  }


  getCartesianFromTileCoordinates(tilePt: Point2d, tileHeight: number){
    let tempPt: Point2d = {
      x: 0,
      y: 0
    };
    tempPt.x=tilePt.x*tileHeight;
    tempPt.y=tilePt.y*tileHeight;
    return tempPt;
  }


  


}
