export interface Point2d {
  x: number;
  y: number;
}


export interface Player {
  point2d: Point2d;
  speed: number;
  name: string;
  id: number;
  dead: boolean;
}


export enum SpriteTypes {
  GROUND = 1,
  BUILDING = 2,
  ENEMY = 3,
  PLAYER = 4,
}


export interface GlobalConfig{
  zoomLevel: number;
  zoomPercent: number;
  canvasWidth: number;
  canvasHeight: number;
  alternateDebugGridLine: number;
  debug: boolean;
  boardCellWidth: number;
  boardCellHeight: number;
  boardCellsWide: number;
  boardCellsHeigh: number;
  boardCenterPointX: number;
  boardCenterPointY: number;
  boardCenterCellNumberX: number;
  boardCenterCellNumberY: number;
  boardCellWidthInitial: number;
  boardCellHeightInitial: number;
  boardHeight: number;
  boardWidth: number;
  boardOffsetX: number;
  boardOffsetY: number;
  boardCellWidthToHeightRatio: number,
  HoveredOverCell: Point2d;
  playerCellWidth: number;
  playerCellHeight: number;
  playerCellWidthInitial: number;
  playerCellHeightInitial: number;
  boardOffsetFromScrollX: number;
  boardOffsetFromScrollY: number;
  percentDownOrUp: number;
  currentZoomThreshold: number;
}


export interface HUDElement{
  x: number;
  y: number;
  width: number;
  height: number;
  isClicked: boolean;
  execute: () => number;
  draw: () => number;
  spritesheet: HTMLImageElement;
  isHovered: boolean;
}