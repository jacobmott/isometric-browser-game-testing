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

//export interface Player {
//  rect: Rect;
//  speed: number;
//  name: string;
//  id: number;
//  dead: boolean;
//  state: State;
//  img: string
//}
