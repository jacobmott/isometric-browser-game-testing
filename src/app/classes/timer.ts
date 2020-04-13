export class Timer {

/**
 * A simple timer
 */
  date: Date;
  startTime: number = 0; //Seconds when we started

  constructor() {
    this.date = new Date();
    this.startTime = this.getSeconds();
  }

  update() {
  	var d = new Date();
  	this.date = d;
  }
  	
  getMilliseconds() {
  	return this.date.getTime();
  }
  	
  getSeconds() {
  	return Math.round(this.date.getTime() / 1000);
  }

  getStartTime(){
    return this.startTime;
  }


}
