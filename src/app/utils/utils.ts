export function degreeToRadian(degree: number){
    return degree * (Math.PI / 180);
}


export function getRandomArbitrary(min, max): number{
  return Math.round(Math.random() * (max - min) + min);
}