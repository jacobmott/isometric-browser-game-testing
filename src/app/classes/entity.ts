import { Point2d } from '../interfaces/interfaces';

export class Entity {

  point2d: Point2d;
  id: number; 
  zIndex: number = 0;
  speed: number = 0;
  dead: boolean = false;

  constructor() {}

  deepClone(): Entity{
    let entity: Entity = new Entity(); 
    entity.setPoint2d(this.point2d);
    entity.setZindex(this.zIndex);
    entity.setSpeed(this.speed);
    entity.setDead(this.dead);
    return entity;
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

  setSpeed(speed: number){
    this.speed = speed;
  }
  getSpeed(): number {
    return this.speed;
  }
  logSpeed() {
    console.log("Speed: "+this.speed);
  }


  setDead(dead: boolean){
    this.dead = dead;
  }
  getDead(): boolean {
    return this.dead;
  }
  logDead() {
    console.log("Dead: "+this.dead);
  } 


  setPoint2dX(point2dX: number){
    this.point2d.x = point2dX;
  }
  getPoint2dX(): number {
    return this.point2d.x;
  }

  setPoint2dY(point2dY: number){
    this.point2d.y = point2dY;
  }
  getPoint2dY(): number {
    return this.point2d.y;
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









