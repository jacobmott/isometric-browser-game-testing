import { Sprite } from './sprite';

describe('Sprite', () => {
  it('should create an instance', () => {
    expect(new Sprite("assets/ground4.png",384, 384, 0, 0, 1, 0, 0)).toBeTruthy();
  });
});
