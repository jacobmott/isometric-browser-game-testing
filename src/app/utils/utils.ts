export function degreeToRadian(degree: number){
    return degree * (Math.PI / 180);
}


export function getRandomArbitrary(min, max): number{
  return Math.round(Math.random() * (max - min) + min);
}



export function drawDiamond(context, x, y, width, height){
  context.save();
  context.beginPath();
  context.moveTo(x, y);
  
  // top left edge
  let tleX = x - width / 2;
  let tleY = y + height / 2;
  context.lineTo(tleX, tleY);
  
  // bottom left edge
  context.lineTo(x, y + height);
  
  // bottom right edge
  context.lineTo(x + width / 2, y + height / 2);
  
  // closing the path automatically creates
  // the top right edge
  context.closePath();
  
  context.fillStyle = "red";
  context.fill();
  context.restore();
}



export function collidePointRect (pointX, pointY, x, y, xW, yW) {
  //2d
  if (pointX >= x &&         // right of the left edge AND
      pointX <= x + xW &&    // left of the right edge AND
      pointY >= y &&         // below the top AND
      pointY <= y + yW) {    // above the bottom
          return true;
  }
  return false;
};