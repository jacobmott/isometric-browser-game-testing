export interface Point2d {
  x: number;
  y: number;
}
    
    
export interface Direction {
  x: number;
  y: number;
}


export interface DivStyle {
  position: string,
  color: string,     
  width:  string,
  height:  string,
  left : string,
  top: string
}


export interface ImgStyle {
  width:  string,
  height:  string,
}


export interface RenderData{
  imgElement: HTMLImageElement,
  tilePosition: Point2d
}

export interface Player {
  point2d: Point2d;
  speed: number;
  name: string;
  id: number;
  dead: boolean;
}

//export interface Player {
//  rect: Rect;
//  speed: number;
//  name: string;
//  id: number;
//  dead: boolean;
//  state: State;
//  img: string
//}


export enum SpriteTypes {
  GROUND = 1,
  BUILDING = 2,
  PLAYER = 3,
  ENEMY = 4
}


export interface GlobalConfig{
  zoomLevel: number;
  canvasWidth: number;
  tileWidth: number;
  tileHeight: number;
  hasChanged: boolean;
  offsetX: number;
  offsetY: number;
  alternateDebugGridLine: number;
  debug: boolean;
}