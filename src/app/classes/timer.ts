export class Timer {

/**
 * A simple timer
 */
  date: Date;

  constructor() {
	  this.date = new Date();
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


}
