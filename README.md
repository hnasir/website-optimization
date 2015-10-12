# Website Performance Optimization portfolio project

## Introduction

Submission for Project #4 in Udacity's Front-end Wed Developer Nanodegree course 

## Project File & Directory Structure

######src/

Contains all HTML, CSS, JS development files and image assets

######dist/

Contains all production ready HTML, CSS, JS development files and image assets through build process on files in the /src directory

######gulpfile.js

Configuration file for gulp build utility that is used for automating build tasks to prepare development source files for production distribution

######package.json

Configuration file providing dependencies required for installation through NPM Package Manager for javascript 

##Build

Please note that [NPM Package Manager for javascript](https://www.npmjs.com/) should be first installed as build tools required are obtained using the NPM utility. Latest installation file can be obtained [here](https://nodejs.org/download/release/latest/)

1. Install the required dependency packages through NPM (required packages are configured in package.json)

  ```bash
  $> NPM install
  ```
2. Run gulp build tool to clean dist folder, resize images, inline CSS and minify HTML, CSS, JS and prepare ./dist folder

  ```bash
  $> gulp
  ```

3. Run local server on the production code residing in (project folder)/dist and access the website through localhost:8080

  ```bash
  $> cd /path/to/your-project-folder/dist
  $> python -m SimpleHTTPServer 8080
  ```

## Optimizations Done on Main.js

### Improving moving pizza animation to meet 60 FPS

The following was done in the updatePositions method to achieve this:

1. Retrieving mover pizza elements using faster DOM accessor method getElementsByClassName
2. Triggering code to access DOM only once instead of multiple times during for-loop and storing it in object array for use later. This prevents the layout thrashing that was initially bringing down the FPS performance.
3. Repetitive and redundent mathematical calculation done for the phase pixel distance movement for each pizza element was removed out of the for-loop and instead computed only once since there are only 5 distince phases. Values were stored in a Phases array object and accessed more quickly instead of original recalculation approach.
4. CSS 'transform' was used to replace 'left' when updating moving pizza position since the former requires less browser resources as it does not trigger screen layout or paint
5. For-loop does calculation of array length only once to prevent redundent recalculation 

```js
// Moves the sliding background pizzas based on scroll position
function updatePositions() {
  frame++;
  window.performance.mark("mark_start_frame");

  // move DOM accessing call outside for loop to prevent forced layout
  var scrollPos = document.body.scrollTop;
  // retrieve elements from DOM only once using faster getElementsByClassName method
  var items = document.getElementsByClassName('mover');
  // create array of 5 phases containing px distance required for pizza to move
  var phases = [];
  for (var j = 0; j < 5; j++) {
    phases.push(100 * Math.sin((scrollPos / 1250) + j));
  }
  // refactor for-loop code to calculate length of array only once
  for (var i = 0, len = items.length; i < len; i++) {
    // replaced left with transform which does not trigger layout and paint to improve page drawing performance
    items[i].style.transform = 'translateX(' + phases[i%5] + 'px)';
  }

  // User Timing API to the rescue again. Seriously, it's worth learning.
  // Super easy to create custom metrics.
  window.performance.mark("mark_end_frame");
  window.performance.measure("measure_frame_duration", "mark_start_frame", "mark_end_frame");
  if (frame % 10 === 0) {
    var timesToUpdatePosition = window.performance.getEntriesByName("measure_frame_duration");
    logAverageFrame(timesToUpdatePosition);
  }
}
```

The number of moving pizzas drawn on screen was reduced and calculated dynamically based on screen height since original number of 200 is not required for display on typical browser screens.

elem.basicLeft was also replaced with elem.style.left in conjunction with use of style.transform and translateX in updatePositions().

```js
// Generates the sliding pizzas when the page loads.
document.addEventListener('DOMContentLoaded', function() {
  var cols = 8;
  var s = 256;
  // calculate optimum number of pizzas required
  var numPizzas = Math.floor(window.screen.height / s) * 8;
  for (var i = 0; i < numPizzas; i++) {
    var elem = document.createElement('img');
    elem.className = 'mover';
    elem.src = "images/pizza.png";
    elem.style.height = "100px";
    elem.style.width = "73.333px";
    // replace elem.basicLeft with elem.style.left
    elem.style.left = (i % cols) * s + 'px';
    elem.style.top = (Math.floor(i / cols) * s) + 'px';
    document.querySelector("#movingPizzas1").appendChild(elem);
  }
  updatePositions();
});
```

### Bringing down the time required to resize pizzas to < 5 ms

The following changes were made to bring down time taken for browser to resize pizza size when slider is moved

1. Retrieving randomPizzaContainer elements using faster DOM accessor method getElementsByClassName
2. Replace querySelector with faster getElementById Web API call
3. Triggering code to access DOM only once instead of multiple times during for-loop and storing it in object array for use later. This prevents the layout thrashing that increases time for resizing of pizza by browser
4. Calculation of size difference and new width of pizza is also taken out of the for-loop and done once only since all the pizza containers are of the same width to begin with, hence calculation only needs to be done once and newwidth value can be used multiple times to set value for all pizza containers
5. For-loop does calculation of array length only once to prevent redundent recalculation

```js
// Returns the size difference to change a pizza element from one size to another. Called by changePizzaSlices(size).
  function determineDx (elem, size) {
    var oldwidth = elem.offsetWidth;
    // replace querySelector with getElementById Web API call that is faster
    var windowwidth = document.getElementById("randomPizzas").offsetWidth;
    var oldsize = oldwidth / windowwidth;

    // TODO: change to 3 sizes? no more xl?
    // Changes the slider value to a percent width
    function sizeSwitcher (size) {
      switch(size) {
        case "1":
          return 0.25;
        case "2":
          return 0.3333;
        case "3":
          return 0.5;
        default:
          console.log("bug in sizeSwitcher");
      }
    }

    var newsize = sizeSwitcher(size);
    var dx = (newsize - oldsize) * windowwidth;

    return dx;
  }

  // Iterates through pizza elements on the page and changes their widths
  function changePizzaSizes(size) {

    // call selector once to store array of all pizza containers instead of during each loop
    var pizzaContainers = document.getElementsByClassName("randomPizzaContainer");
    // get size difference once only using first pizza in array as all pizzas have the same size
    var dx = determineDx(pizzaContainers[0], size);
    // calculate new width of all pizzas outside for loop only once using first pizza in array
    var newwidth = (pizzaContainers[0].offsetWidth + dx) + 'px';

  // refactor for-loop code to calculate length of array only once
    for (var i = 0, len = pizzaContainers.length; i < len; i++) {
      pizzaContainers[i].style.width = newwidth;
    }
  }
```

Page loading speed was improved by morning pizzasDiv declaration outside of for loop so only one call to DOM is required instead of calling during every loop

```js
// bring array declaration outside of for-loop to ony make single DOM call
var pizzasDiv = document.getElementById("randomPizzas");
// This for-loop actually creates and appends all of the pizzas when the page loads
for (var i = 2; i < 100; i++) {
  pizzasDiv.appendChild(pizzaElementGenerator(i));
}
```

## References

The following sites were referenced when working on this project:

* <a href="https://css-tricks.com/gulp-for-beginners/">Gulp for Beginners</a>
* <a href="https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/image-optimization">Google Developer: Image Optimization</a>
* <a href="http://davidwalsh.name/gulp-run-sequence">Sync Gulp Tasks with Run-sequence</a>
* <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform">Mozilla Developer: CSS Transform</a>
* <a href="http://csstriggers.com/">CSS Triggers</a>
* <a href="http://www.kirupa.com/html5/setting_css_styles_using_javascript.htm">CSS Style using Javascript</a>
