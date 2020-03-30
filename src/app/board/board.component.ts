import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Tile } from '../classes/tile';
import { Point2d, DivStyle, ImgStyle, RenderData } from '../interfaces/interfaces';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;



  tilesZIndex1: RenderData [] = [];
  tilesZIndex2: RenderData [] = [];;
  tiles: Map<number, Tile> = new Map<number, Tile>();
  rows: number =  8;
  columns: number =  8;
  tileWidth: number = 20;
  tileHeight: number = 44;
  levelData: number [][] = [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ];
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
    this.initializeTypeTypes();
  }

  initializeTypeTypes(){
    //ground
    let groundTile: Tile = new Tile();
    groundTile.setImage("assets/ground2.png");
    var img = new Image();   // Create new img element
    img.src = groundTile.getImage(); // Set source path
    groundTile.setZindex(1);
    let boardComponent = this;
    img.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1;
      boardComponent.createBoard();   
    }
    groundTile.setImageElement(img);
    this.tileTypes.set(0, groundTile);

    //wall(Horizontal/Row?)
    let cornerWallHorizontalTile: Tile = new Tile();
    cornerWallHorizontalTile.setImage("assets/ground2.png");
    cornerWallHorizontalTile.setZindex(1);
    var img2 = new Image();   // Create new img element
    img2.src = cornerWallHorizontalTile.getImage(); // Set source path
    img2.onload = function(){
      boardComponent.imagesLoaded = boardComponent.imagesLoaded+1;
      boardComponent.createBoard();   
    }
    cornerWallHorizontalTile.setImageElement(img2);
    this.tileTypes.set(1, cornerWallHorizontalTile);
  
  }

  createBoard(){


    if (!(this.imagesLoaded === 2)){ return; }
    let index: number = 0;
    for (let row: number = 0; row < this.rows; row++){
      for (let column: number = 0; column < this.columns; column++){
        let x = column * this.tileWidth;
        let y = row * this.tileHeight;
        let tileType = this.levelData[row][column];
        this.addTile(tileType, x, y, index);
        ++index;
      }
    }

    this.drawtiles();

  }

  drawtiles(){
    this.tilesZIndex1.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.isoCoords.x, renderData.isoCoords.y);
    });
    this.tilesZIndex2.forEach((renderData: RenderData, key: number) => {
      this.ctx.drawImage(renderData.imgElement, renderData.isoCoords.x, renderData.isoCoords.y);
    });
  }

  addTile(tileType: number, x: number, y: number, index: number){
    let tile: Tile = this.tileTypes.get(tileType);
    let clonedTile: Tile = tile.deepClone();
    clonedTile.setId(index);
    let cartPoint2d: Point2d = {
      x: x,
      y: y
    };
    let isoCord: Point2d = this.cartesianToIsometric(cartPoint2d);
    let renderData: RenderData = {
      imgElement: clonedTile.getImageElement(),
      isoCoords: isoCord
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
