// Array to hold thumbnail objects
let thumbnails = [];

function setup() {
  // Create a canvas that fills the window
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB); // Use HSB color mode for easier control over hue and brightness
  // Populate the array with thumbnail objects
  for (let i = 0; i < 900; i++) { // Create 100 thumbnails, adjust as needed
    thumbnails.push(new Thumbnail(random(width), random(height)));
  }
}

function draw() {
  // Clear the background with no opacity for a clean frame each time
  background(20, 33, 51);
  
  // Update and display each thumbnail
  thumbnails.forEach(thumb => {
    thumb.update();
    thumb.display();
  });
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

// Define the base colors from your palette
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
  
  
  class Thumbnail {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.xOffset = random(1000);
      this.yOffset = random(2000, 3000);
      this.size = random(120, 150);
      this.alphaOffset = random(4000, 5000);
      this.color = random(baseColors); // Direct selection without adjustment
          // New properties for dragging
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
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
      rect(this.x, this.y, this.size, this.size / 2, 5); // Less rounded corners as per your preference
    }
  }