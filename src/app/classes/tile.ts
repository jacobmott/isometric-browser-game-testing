import { Point2d, DivStyle, ImgStyle } from '../interfaces/interfaces';

export class Tile {

  point2d: Point2d;
  img: string;
  divStyle: DivStyle;
  imgStyle: ImgStyle;
  id: number; 
  imgElement: HTMLImageElement;
  zIndex: number = 0;

  constructor() {}

  deepClone(): Tile{
    let tile: Tile = new Tile();

    tile.setImage(this.img);
    tile.setDivStyle(this.divStyle);
    tile.setImgStyle(this.imgStyle);    
    tile.setPoint2d(this.point2d);
    tile.setImageElement(this.imgElement);
    tile.setZindex(this.zIndex);

    return tile;
  }


  setImage(img: string){
    this.img = img;
  }
  getImage(): string {
    return this.img;
  }
  logImage() {
    console.log("Image: "+this.img);
  }

  setPoint2d(point2d: Point2d){
    this.point2d = point2d;
  }
  getPoint2d(): Point2d {
    return this.point2d;
  }
  logPoint2d() {
    console.log("Point2d: "+this.point2d);
  }


  setImageElement(imgElem: HTMLImageElement){
    this.imgElement = imgElem;
  }
  getImageElement(): HTMLImageElement {
    return this.imgElement;
  }


  setDivStyle(divStyle: DivStyle){
    this.divStyle = divStyle;
  }
  getDivStyle(): DivStyle {
    return this.divStyle;
  }
  logDivStyle() {
    console.log("DivStyle: "+this.divStyle);
  }

  setImgStyle(imgStyle: ImgStyle){
    this.imgStyle = imgStyle;
  }
  getImgStyle(): ImgStyle {
    return this.imgStyle;
  }
  logImgStyle() {
    console.log("ImgStyle: "+this.imgStyle);
  }


  setZindex(zIndex: number){
    this.zIndex = zIndex;
  }
  getZindex(): number {
    return this.zIndex;
  }


  setId(id: number){
    this.id = id;
  }
  getId(): number {
    return this.id;
  }
  logId() {
    console.log("Id: "+this.id);
  }


}









