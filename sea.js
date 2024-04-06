// global variables
let scrollAmount = 0;
let popups = []; 
let thumbnails = [];
let currentTime = 0;
let menuItems = [];
let baseColors = [
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [13, 27, 42],   // Rich black
  [20, 33, 51],   // idk
  [20, 33, 51],   // idk
  [20, 33, 51],   // idk
  [20, 33, 51],   // idk
  [20, 33, 51],   // idk
  [20, 33, 51],   // idk
  [27, 38, 59],   // Oxford Blue
  [27, 38, 59],   // Oxford Blue
  [27, 38, 59],   // Oxford Blue
  [27, 38, 59],   // Oxford Blue
  [37, 51, 74],   // ur mom
  [37, 51, 74],   // ur mom
  [37, 51, 74],   // ur mom
  [37, 51, 74],   // ur mom
  [46, 64, 89],   // Indigo Dye
  [46, 64, 89],   // Indigo Dye
  [46, 64, 89],   // Indigo Dye
  [46, 64, 89],   // Indigo Dye
  [46, 64, 89],   // Indigo Dye
  [46, 64, 89],   // Indigo Dye
  [65, 90, 119],  // YInMn Blue
  [65, 90, 119],  // YInMn Blue
  [65, 90, 119],  // YInMn Blue
  [65, 90, 119],  // YInMn Blue
  [82, 105, 131],  // Yet Another Blue
  [82, 105, 131],  // Yet Another Blue
  [82, 105, 131],  // Yet Another Blue
  [82, 105, 131],  // Yet Another Blue
  [82, 105, 131],  // Yet Another Blue
  [111, 132, 155], // almost light
  [111, 132, 155], // almost light
  [111, 132, 155], // almost light
  [119, 141, 169], // Silver Lake Blue
  [224, 225, 221] // Platinum
];
let fadeStartTime = null; // To track when to start fading in the menu items
let startBgFade = false; // Flag to start the background color fade
let bgFadeElapsed = 0; // Timestamp to mark the start of the background fade

// Constants to control the effect
const maxScroll = 3000; // The total amount of scroll needed for the full effect
const scrollFactor = 100; // The factor to slow down the effect of scrolling

function setup() {
  // Create a canvas that fills the window
  let cnv = createCanvas(windowWidth, windowHeight);
  colorMode(RGB);

  // Attach the canvas to an existing HTML element, or leave it as is to attach to the body
  // For example, if you have a div with id 'canvas-container' in your HTML:
  cnv.parent('canvas-container');

  // Apply the font class to the canvas
  cnv.addClass('articulat-cf-demi-bold-oblique');
  
  // Populate the array with thumbnail objects
  let initialThumbnailCount = 300; 
  
  for (let i = 0; i < initialThumbnailCount; i++) {
    thumbnails.push(new Thumbnail(random(width), random(height)));
  }
  popups = [];
  let middleRightX = windowWidth * 2 / 3;
  let middleRightY = windowHeight / 2;
  popups.push(new Popup("Browsing has arisen as a necessary means of navigating the cluttered digital sphere.", 150, 250, 1000, 3000));
  popups.push(new Popup("There is so much out there,", middleRightX, middleRightY - 10, 4000, 3000));
  popups.push(new Popup("yet so little feels right.", middleRightX + 60, middleRightY + 60, 5000, 2000));
  popups.push(new Popup("When Netflix users encounter their homepage, they are met with a deluge of information.", 150, 400, 7000, 6000));
  popups.push(new Popup("How they use culture to make sense of it all was the subject of my thesis.", 300, 500, 10000, 3000));
}

function draw() {
  currentTime = millis();
  // First, calculate the number of thumbnails to display based on scroll
  let visibleThumbnails = map(scrollAmount, 0, maxScroll * 0.005, thumbnails.length, 0);
  visibleThumbnails = constrain(visibleThumbnails, 0, thumbnails.length);

  // Check to start the background fade if all thumbnails have disappeared
  if (visibleThumbnails <= 0 && !startBgFade) {
      startBgFade = true;
      bgFadeElapsed = millis(); // Mark the start time for background fade
  }

  // Background fade logic
  if (startBgFade) {
      let bgFadeDuration = millis() - bgFadeElapsed;
      if (bgFadeDuration <= 1000) { // Within the fade duration
          let fadeAmount = map(bgFadeDuration, 0, 1000, 0, 255);
          let r = map(fadeAmount, 0, 255, 20, 255);
          let g = map(fadeAmount, 0, 255, 33, 255);
          let b = map(fadeAmount, 0, 255, 51, 255);
          background(r, g, b);
      } else {
          background(255);
      }
  } else {
      // Default background before fade starts
      background(20, 33, 51);
  }

  // Update and display thumbnails
  for (let i = 0; i < visibleThumbnails; i++) {
      let thumb = thumbnails[i];
      let targetX = map(scrollAmount, 0, maxScroll, thumb.x, width / 2);
      thumb.x = lerp(thumb.x, targetX, 0.02);
      thumb.size = thumb.originalSize;
      thumb.update();
      thumb.display();
  }

  // Initialize menuItems once all thumbnails are gone
  if (visibleThumbnails <= 0 && menuItems.length === 0) {
      const itemCount = 5; // Number of MenuItems you want
      const spacing = width / (itemCount + 1);
      for (let i = 0; i < itemCount; i++) {
          const x = spacing * (i + 1);
          const y = height / 2; // Center vertically
          menuItems.push(new MenuItems(x, y, `Item ${i+1}`));
      }
  }

  // Display each MenuItem, with fade-in handled by their update method
  menuItems.forEach(item => {
      item.update(); // Handles positioning and fading logic
      item.display();
  });
  
  // Update and display popups
  popups.forEach(popup => {
    popup.update(currentTime);
    popup.display();
  });
}

function mouseWheel(event) {
  // Adjust the scrollAmount by a smaller increment to slow down the effect
  scrollAmount += event.delta / scrollFactor;
  scrollAmount = constrain(scrollAmount, 0, maxScroll); // Constrain to maximum scroll
  console.log(scrollAmount); // Debugging statement
  return false;
}

function mousePressed() {
    // When the mouse is pressed, check each thumbnail
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].clicked(mouseX, mouseY);
    }
  }
  
  function mouseReleased() {
    // When the mouse is released, stop dragging
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].released();
    }
  }

  class MenuItems {
    constructor(x, y, text) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.size = 150;
      this.bgColor = [27, 38, 59]; 
      this.textColor = [224, 225, 221]; 
      this.xOffset = random(2, 5);
      this.yOffset = random(2, 5);
      this.alpha = 0; 
    }
    update() {
      // Only start fading in if enough time has passed since fadeStartTime was set
      if (fadeStartTime !== null) {
      let timeSinceStart = millis() - fadeStartTime;
    
      // Start fading in after 3 seconds delay
      if (timeSinceStart > 2000) { // Check if we're past the delay
      let elapsedTime = timeSinceStart - 2000; // Adjust elapsedTime to start from 0 after the delay
      this.alpha = map(elapsedTime, 0, 2000, 0, 255);
      this.alpha = constrain(this.alpha, 0, 255);
    }
  }
      // Use noise to adjust the x and y position slightly for the jiggling effect
      this.x += map(noise(this.xOffset), 0, 1, -0.5, 0.5);
      this.y += map(noise(this.yOffset), 0, 1, -0.5, 0.5);
      // Increment the offsets for continuous movement
      this.xOffset += 0.01;
      this.yOffset += 0.01;
    }

    display() {
      fill(this.bgColor[0], this.bgColor[1], this.bgColor[2]);
      noStroke();
      rect(this.x - this.size / 2, this.y - this.size / 4, this.size, this.size / 2, 5);
      fill(this.textColor[0], this.textColor[1], this.textColor[2]); // Set the text color
      textSize(16);
      textAlign(CENTER, CENTER);
      text(this.text, this.x, this.y);
    }
  
    // Additional functionality for MenuItems can go here
  }
  
  class Thumbnail {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.xOffset = random(1000);
      this.yOffset = random(2000, 3000);
      this.size = random(120, 150);
      this.alphaOffset = random(4000, 5000);
      this.color = random(baseColors); 
      this.dragging = false;
      this.offsetX = 0;
      this.offsetY = 0;
      this.originalSize = this.size; // Store the original size
  }

  
  // Method to start dragging
  clicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    // Check if the mouse is inside the thumbnail
    if (d < this.size / 2) {
      this.dragging = true;
      this.offsetX = this.x - mx;
      this.offsetY = this.y - my;
    }
  }
  
  // Method to stop dragging
  released() {
    this.dragging = false;
  }
    update() {
        if (this.dragging) {
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
          }
      this.x += map(noise(this.xOffset), 0, 1, -1, 1);
      this.y += map(noise(this.yOffset), 0, 1, -0.5, 0.5);
      this.xOffset += 0.01;
      this.yOffset += 0.005;
      // Alpha oscillation can remain the same as before
      this.alpha = 150 + sin(frameCount * 0.005 + this.alphaOffset) * 105;
    }
    display() {
      fill(...this.color, this.alpha);
      noStroke();
      rect(this.x, this.y, this.size, this.size / 2, 5); 
      // Update thumbnail size based on scroll position
    let newSize = map(scrollAmount, 0, 1000, this.size, this.size / 2); // Example mapping
    this.size = newSize;

    // Calculate new x position to center the thumbnail in a narrowing column
    let newX = map(scrollAmount, 0, 1000, this.x, width / 2);
    this.x = newX;

    fill(...this.color, this.alpha);
    noStroke();
    rect(this.x, this.y, newSize, newSize / 2, 5); // Use newSize for dynamic sizing
    }
  }

  class Popup {
    constructor(message, x, y, startTime, duration) {
      this.message = message;
      this.fullMessage = message;
      this.x = x;
      this.y = y;
      this.startTime = startTime;
      this.duration = duration;
      this.visible = false;
      this.currentLength = 0;
      this.maxWidth = windowWidth / 4;
      this.bgColor = [20, 33, 51];
      this.typingSpeed = 30; 
      this.charWidth = textSize();
    }
  
    update(currentTime) {
      // Determine visibility based on the current time and start time
      this.visible = currentTime >= this.startTime && currentTime < this.startTime + this.duration;
  
      if (this.visible) {
        let timeSinceStart = currentTime - this.startTime;
        let charactersToShow = timeSinceStart / this.typingSpeed;
        this.currentLength = Math.min(this.fullMessage.length, Math.floor(charactersToShow));
      }
    }
  
    display() {
      if (this.visible) {
        textSize(22); // Set the text size
        textStyle(ITALIC); // Set text style to italic
        textAlign(LEFT, TOP);
        noStroke();
        textLeading(30);
        let chars = this.fullMessage.substring(0, this.currentLength).split('');
        let xCursor = this.x;
        let extraSpacing = 5; // Adjust as needed for the italic slant
        
        for (let i = 0; i < chars.length; i++) {
          let charWidth = textWidth(chars[i]) + extraSpacing;
          fill(...this.bgColor);
          noStroke();
          // Add the extraSpacing to the width of the rectangle to account for italics
          rect(xCursor, this.y, charWidth, textSize());
          fill(255); // Set text color to white
          // Draw the text slightly offset to the left by half the extraSpacing
          text(chars[i], xCursor - extraSpacing / 2, this.y);
          // Increment xCursor by the width of the character without extraSpacing
          // to maintain proper spacing between characters
          xCursor += textWidth(chars[i]);
        }
      }
    }
  }