# IsometricBrowserGameTesting

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## Helpful links
*  Creating-isometric-worlds-a-primer-for-game-developers
     * https://gamedevelopment.tutsplus.com/tutorials/creating-isometric-worlds-a-primer-for-game-developers--gamedev-6511

* Angular Animations - transition-and-triggers
     * https://angular.io/guide/transition-and-triggers

* Envato Market - Game assets - isometric assets
     * https://graphicriver.net/graphics-with-isometric-in-game-assets?_ga=2.15940918.1677383907.1585510672-762106576.1585510672&as=1&referrer=homepage&type=c&utf8=%E2%9C%93
    
* CSS Position explained site
     * https://www.freecodecamp.org/news/how-to-use-the-position-property-in-css-to-align-elements-d8f49c403a26/

* Tileset sites
    * https://www.mapeditor.org/
    * https://github.com/andrewrk/node-tmx-parser
    * https://opengameart.org/content/isometric-64x64-outside-tileset
    * https://opengameart.org/content/isometric-tiles
    * https://graphicriver.net/item/the-green-isometric-tileset/20796124
    * https://www.gamedevmarket.net/user/login/
    * https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent
    * This seems to be the only formula that works
    * https://laserbrainstudios.com/2010/08/the-basics-of-isometric-programming/


## Notes
  * This seems to be the only formula that works
    * https://laserbrainstudios.com/2010/08/the-basics-of-isometric-programming/
  Also, what people done mention is that you need to get tiles that have been designed to be the ratio you are coding for.
  So if you are doing a 2 to 1 (twice the width as height, 2:1) ratio tile, then you need to get isometric assets that are 2 to 1
  For example.. 2400x1200.. Then when you are drawing and running the algorithm that projects from cartesian coordinations(x,y) to
  isometric coordinates, you need to specify your tileWidth and tileHeight as your ratio.. and also, as the actual size you want your tiles to be
  (So if you have a 2400x1200 image, and your tile width and height are 2:1... 100x50, then your 2400x1200 image will be "tiled" down to your 100x50 (2 to 1) image size
  when its projeted, since your projected formula uses the tile width and tile height to "project" the tile into an isometric projection.

  Copying the formula here in case the website goes away:
  This is where basic math came to the rescue. The algorithm I use for drawing tiles is:

   FOR Y := 1 TO SizeY DO BEGIN
      FOR X := 1 TO SizeX DO BEGIN
         DrawX := ((X - Y) * 38) + 400;
         DrawY := (X + Y) * 19;
      END;
   END;




## TODO

* [X] TODO - done
    * description continued
* [ ] TODO - not done
    * description continued
