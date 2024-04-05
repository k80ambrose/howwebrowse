// global variables
let scrollAmount = 0;
let thumbnails = [];
let menuItems = []; // Array to store MenuItems instances
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
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB); // Use HSB color mode for easier control over hue and brightness

  // Populate the array with thumbnail objects
  let initialThumbnailCount = 300; 
  
  for (let i = 0; i < initialThumbnailCount; i++) {
    thumbnails.push(new Thumbnail(random(width), random(height)));
  }
}

function draw() {
  // Check if it's time to start the background fade
  if (visibleThumbnails <= 0 && !startBgFade) {
    startBgFade = true;
    bgFadeElapsed = millis(); // Mark the start time for background fade
}

if (startBgFade) {
    // Calculate how much time has passed since the fade started
    let bgFadeDuration = millis() - bgFadeElapsed;

    if (bgFadeDuration <= 700) { // Within the fade duration
        let fadeAmount = map(bgFadeDuration, 0, 700, 0, 255);
        // Calculate intermediate background color
        let r = map(fadeAmount, 0, 255, 20, 255);
        let g = map(fadeAmount, 0, 255, 33, 255);
        let b = map(fadeAmount, 0, 255, 51, 255);
        background(r, g, b);
    } else {
        background(255); // After 700ms, set background to white
    }
} else {
    // Default background before fade starts
    background(20, 33, 51);
}
  // Calculate the number of thumbnails to display based on scroll
  let visibleThumbnails = map(scrollAmount, 0, maxScroll * 0.005, thumbnails.length, 0); // Thumbnails disappear more rapidly
  visibleThumbnails = constrain(visibleThumbnails, 0, thumbnails.length);

  // Loop through the visible thumbnails to update their position and size gradually
  for (let i = 0; i < visibleThumbnails; i++) {
    let thumb = thumbnails[i];

    // Calculate new x position to center the thumbnail in a narrowing column
    let targetX = map(scrollAmount, 0, maxScroll, thumb.x, width / 2);
    // Interpolate the x position towards the center column more slowly for smoothness
    thumb.x = lerp(thumb.x, targetX, 0.02); // Smaller lerp value for slower movement

    // Keep thumbnail size constant
    thumb.size = thumb.originalSize;

    thumb.update();
    thumb.display();
  }

  // If no more thumbnails are visible, and menuItems have not been initialized
  if (visibleThumbnails <= 0 && menuItems.length === 0) {
    // Populate the menuItems array
    const itemCount = 5; // Number of MenuItems you want
    const spacing = width / (itemCount + 1);
    for (let i = 0; i < itemCount; i++) {
      const x = spacing * (i + 1);
      const y = height / 2; // Center vertically, adjust as needed
      menuItems.push(new MenuItems(x, y, `Item ${i+1}`));
    }
  // Adjust when fadeStartTime is set
if (visibleThumbnails <= 0 && fadeStartTime === null && menuItems.length > 0) {
  fadeStartTime = millis(); // Set fadeStartTime to now when thumbnails disappear
}
  }
  

  // Display each MenuItem if they've been initialized
  menuItems.forEach(item => {
    item.update(); // Update the position for the jiggling effect
    item.display(); // Then display it
  });
}

// Event handler for mouse wheel scroll
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
      this.text = text; // Text to display
      this.size = 150; // Adjusted size for all menu items
      this.bgColor = [13, 27, 42]; // Rich black text color
      this.textColor = [224, 225, 221]; // Platinum background color 
      this.xOffset = random(2, 5); // Ensure a unique offset for each instance
      this.yOffset = random(2, 5);
      this.alpha = 0; // Start fully transparent
    }
    update() {
      // Only start fading in if enough time has passed since fadeStartTime was set
      if (fadeStartTime !== null) {
      let timeSinceStart = millis() - fadeStartTime;
    
      // Start fading in after 3 seconds delay
      if (timeSinceStart > 1000) { // Check if we're past the delay
      let elapsedTime = timeSinceStart - 1000; // Adjust elapsedTime to start from 0 after the delay
      this.alpha = map(elapsedTime, 0, 1000, 0, 255);
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
      fill(this.bgColor[0], this.bgColor[1], this.bgColor[2], this.alpha);
      noStroke();
      rect(this.x - this.size / 2, this.y - this.size / 4, this.size, this.size / 2, 5);
      fill(this.textColor[0], this.textColor[1], this.textColor[2]); // Set the text color
      textSize(16);
      textAlign(CENTER, CENTER);
      text(this.text, this.x, this.y); // Draw the text centered on the menu item
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
