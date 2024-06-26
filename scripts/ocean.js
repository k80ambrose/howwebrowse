// global variables
  let scrollAmount = 0;
  let currentTime = 0; 
  let blinkTime = 0; // Time counter for blinking
  let bgFadeElapsed = 0; 
  let fadeStartTime = null; 
  let startBgFade = false; // Flag to start the background color fade
  let allowNormalScroll = false;
  let popups = []; 
  let thumbnails = [];
  let menuItems = [];
  let baseColors = [
    [1, 42, 74], //1
    [1, 58, 99], //2
    [1, 58, 99], //2
    [1, 73, 124], //3
    [1, 73, 124], //3
    [1, 79, 134], //4
    [42, 111, 151], //5
    [44, 125, 160], //6
    [70, 143, 175], //7
    [97, 165, 194], //8
    [137, 194, 217], //9
    [169, 214, 229] //10
  ];
  let arrows; // To hold the SVG element
  let title;
  // Declare menuItemTitles
  const menuItemTitles = [
    "Introduction",
    "Background",
    "Literature Review",
    "Data & Methods",
    "Results",
    "Discussion",
    "Bibliography",
    "Acknowledgments"
  ];
  // Map menu titles to section IDs
  const menuTitleToSectionId = {
    "Introduction": "introduction",
    "Background": "background",
    "Literature Review": "litreview",
    "Data & Methods": "methods",
    "Results": "results",
    "Discussion": "discussion",
    "Bibliography": "bibliography",
    "Acknowledgments": "acknowledgments"
  };

// Constants to control the effect
const maxScroll = 3000; // The total amount of scroll needed for the full effect
const scrollFactor = 100; // The factor to slow down the effect of scrolling

// setup functions
function setup() {
  // Create a canvas that fills the window
  let cnv = createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  cnv.parent('ocean-container');
  // Start the fade-in process now
  fadeStartTime = millis(); 
  // Initialize the title object
  title = new Title("The Choreography of Choice: Browsing Netflix as a Cultural Exercise");
  // populate thumbnails
  let initialThumbnailCount = 300; 
  for (let i = 0; i < initialThumbnailCount; i++) {
    thumbnails.push(new Thumbnail(random(width), random(height)));
  }
  // ARROWS
  arrows = createImg('images/SVGs/arrows.svg', 'arrows icon');
  arrows.style('position', 'absolute');
  arrows.style('bottom', '50px');
  arrows.style('left', 'calc(50% - 25px)'); 
  arrows.style('width', '40px'); 
  arrows.style('height', '50px'); 
  arrows.style('z-index', '1000'); 
  arrows.style('opacity', '0.8'); 

  // Start blinking immediately
  let isHidden = false; // To toggle visibility
  setInterval(() => {
    arrows.style('opacity', isHidden ? 0.6 : 0);
    isHidden = !isHidden; // Toggle the state
  }, 1000); // Adjust timing as needed for blink speed

  // populate popups
  popups = [];
  let middleRightX = windowWidth * 2 / 3;
  let middleRightY = windowHeight / 2;
  popups.push(new Popup("  Browsing has arisen as a necessary means of navigating the cluttered digital sphere.", 150, 250, 1000, 3000));
  popups.push(new Popup("  There's so much out there,", middleRightX, middleRightY - 10, 4000, 3000));
  popups.push(new Popup("  yet so little feels right.", middleRightX + 60, middleRightY + 60, 5000, 2000));
  popups.push(new Popup("  When Netflix users encounter their homepage, they are met with a deluge of information,", 150, 400, 7000, 6000));
  popups.push(new Popup("  how they use culture to make sense of it all was the subject of this study.", 300, 500, 10000, 3000));
}

// draw functions
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
  if (bgFadeDuration <= 2000) { // Keeping the same fade duration
      // Using a more gradual and visually appealing fade transition
      // Starting from a dark blue (1, 42, 74) to a softer blue before reaching white
      let fadeProgress = bgFadeDuration / 2000; // Normalizing fade duration from 0 to 1
      let r = lerp(1, 235, fadeProgress); // Start with dark blue, transition to a light shade before white
      let g = lerp(42, 235, fadeProgress);
      let b = lerp(74, 235, fadeProgress);
      
      // Update background color based on the calculated RGB values
      background(r, g, b);
  } else {
      // Final background color after the transition completes
      // Consider setting this to a very light blue or gray instead of pure white for a softer transition
      background(235, 235, 235); // Soft white/very light gray to ease the transition's end
  }
} else {
  // Default background before fade starts
  background(1, 42, 74); // Keeping your original dark blue color
}
  // Update and display thumbnails
  for (let i = 0; i < visibleThumbnails; i++) {
      let thumb = thumbnails[i];
      let targetX = map(scrollAmount, 0, maxScroll, thumb.x, width / 2);
      thumb.x = lerp(thumb.x, targetX, 0.002);
      thumb.size = thumb.originalSize;
      thumb.update();
      thumb.display();
  }

// BLINKING ARROW STUFFF
  // Increment the time counter
blinkTime += 0.05; // Adjust this value to control the speed of the blinking

  // Calculate the opacity: oscillate between 0 and 0.6 using the sin function
let opacity = Math.abs(Math.sin(blinkTime)) * 0.6;

  // Apply the calculated opacity to the SVG
if (arrows) {
  arrows.style('opacity', opacity);
}

// MENU ITEMS
if (visibleThumbnails <= 0 && menuItems.length === 0) {
  const itemCount = menuItemTitles.length; // Update based on the actual number of titles
  const spacing = width / (itemCount + 1);
  
  for (let i = 0; i < itemCount; i++) {
      const x = spacing * (i + 1);
      const y = height / 2; // Center vertically, adjust if necessary
      menuItems.push(new MenuItems(x, y, menuItemTitles[i]));
  }
}
  // Update and display menu items
let mouseOverMenuItem = false; // Flag to track if the mouse is over any menu item
menuItems.forEach(item => {
  item.update(); // Handles positioning and fading logic
  item.display();
  if (item.isMouseOver()) {
    mouseOverMenuItem = true; // Set the flag if the mouse is over a menu item
  }
});
  // Change the cursor style based on whether the mouse is over a menu item
if (mouseOverMenuItem) {
  cursor('pointer'); // Change cursor to pointer if over a menu item
} else {
  cursor('grab'); // Default cursor style when not over a menu item
}
  // Display each MenuItem, with fade-in handled by their update method
menuItems.forEach(item => {
  item.update(); // Handles positioning and fading logic
  item.display();
});
  // check menu visibility to see if you can scroll normally
allowNormalScroll = menuItems.length > 0 && menuItems.every(item => item.isFullyVisible());

// POPUPS
  // Only show popups if menu items are not yet fully visible or custom scrolling is still active
  if (!allowNormalScroll) {
    popups.forEach(popup => {
      popup.update(currentTime);
      popup.display();
    });
  }

// TITLE STUFF -- Check if the menu items are fully visible, then fade in the title
if (menuItems.length > 0 && menuItems[0].isFullyVisible()) {
  title.fadeIn();
} 
title.display();
}

// things that happen when scroll
function mouseWheel(event) {
  // SO YOU CAN SCROLL NORMALLY LATER
  if (allowNormalScroll) {
    // If the custom animation is complete, don't prevent default browser scroll.
    return true;
  } else {
    scrollAmount += event.delta / scrollFactor;
    scrollAmount = constrain(scrollAmount, 0, maxScroll);
    console.log(scrollAmount);
    // Prevent the default scroll behavior.
    event.preventDefault(); 
  }
  // HIDE ARROW IF YOU'RE SCROLLING
  if (arrows && scrollAmount > 3) {
    arrows.style('display', 'none');
  }
}
// things that happen when the mouse is pressed
function mousePressed() {
  // When the mouse is pressed, check each thumbnail and menu item
  let anyMenuItemClicked = false; // Flag to check if any menu item was clicked
  for (let i = 0; i < thumbnails.length; i++) {
    thumbnails[i].clicked(mouseX, mouseY);
  }
  for (let i = 0; i < menuItems.length; i++) {
    if (menuItems[i].isMouseOver()) {
      menuItems[i].clicked(); // Call the clicked method on the menu item
      anyMenuItemClicked = true; // Set the flag to true
      break; // Exit the loop after finding the clicked menu item
    }
  }
  // If a menu item was clicked, prevent other mousePressed actions
  if (anyMenuItemClicked) {
    return false;
  }
}
// things that happen when the mouse is released
function mouseReleased() {
    // When the mouse is released, stop dragging
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].released();
    }
  }

//CLASSES
  // menu thumbnails 
  class MenuItems {
      constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.sectionId = menuTitleToSectionId[text];
        this.size = 150;
        this.height = 70;
        this.originalBgColor = [1, 79, 134]; // Original color
        this.hoverBgColor = [70, 143, 175]; // New shade of blue for hover
        this.textColor = [224, 225, 221]; 
        this.xOffset = random(2, 5);
        this.yOffset = random(2, 5);
        this.alpha = 0;
      }
      isFullyVisible() {
        return this.alpha >= 178; // Considering fully visible if alpha is 178 or more
      }
      isMouseOver() {
        return mouseX > this.x - this.size / 2 && mouseX < this.x + this.size / 2 &&
              mouseY > this.y - this.height / 2 && mouseY < this.y + this.height / 2;
      }
      clicked() {
        if (this.isMouseOver()) {
          window.location.hash = '#' + this.sectionId;
        }
      }
      update() {
        // fade in
        if (fadeStartTime !== null) {
        let timeSinceStart = millis() - fadeStartTime;
        if (timeSinceStart > 2000) { 
        let elapsedTime = timeSinceStart - 2000; 
        this.alpha = map(elapsedTime, 0, 2000, 0, 180);
        this.alpha = constrain(this.alpha, 0, 180);
      }
    }
      // jiggling effect
        this.x += map(noise(this.xOffset), 0, 1, -0.1, 0.1);
        this.y += map(noise(this.yOffset), 0, 1, -0.1, 0.1);
        this.xOffset += 0.001;
        this.yOffset += 0.001;
      }
      display() {
        let bgColor = this.isMouseOver() ? this.hoverBgColor : this.originalBgColor;
        fill(bgColor[0], bgColor[1], bgColor[2], this.alpha);
        noStroke();
        rect(this.x - this.size / 2, this.y - this.height / 2, this.size, this.height, 5);
        fill(this.textColor[0], this.textColor[1], this.textColor[2], this.alpha);
        textSize(16);
        textFont("articulat-cf");
        textStyle(NORMAL);
        textAlign(CENTER, CENTER);
        text(this.text, this.x, this.y);
      }
    }
  // thumbnail 
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
  // popups 
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
        this.bgColor = [1, 42, 74];
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
          push(); // Start a new drawing state
          textSize(22); // Set the text size
          textAlign(LEFT, TOP);
          textFont("articulat-cf"); // Set the font to Articulat CF
          textStyle(ITALIC); // Normal weight, oblique style
          noStroke();
          textLeading(30);
          let chars = this.fullMessage.substring(0, this.currentLength).split('');
          let xCursor = this.x;
          let extraSpacing = 5; // Adjust as needed for the italic slant
          let bottomPadding = 10; // Bottom padding for each character's background
          
          for (let i = 0; i < chars.length; i++) {
            let charWidth = textWidth(chars[i]) + extraSpacing;
            fill(...this.bgColor);
            noStroke();
            // Add the extraSpacing to the width of the rectangle to account for italics
            rect(xCursor, this.y, charWidth, textSize() + bottomPadding);
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
  // title 
  class Title {
    constructor(text) {
      this.text = text;
      this.x = width / 2; // Center of the canvas
      this.y = 150; // Distance from the top of the canvas
      this.alpha = 0; // Start with the title invisible
    }
    // Function to display the title
    display() {
      textSize(32); // Example size, adjust as needed
      fill(0, this.alpha); // White color for the text with transparency
      noStroke();
      textAlign(CENTER, TOP);
      textFont("articulat-cf"); // Your chosen font
      textStyle(BOLD); // Adjust as needed
      text(this.text, this.x, this.y);
    }

    // Function to fade in the title
    fadeIn() {
      // Fade in over 2 seconds, adjust duration as needed
      if (this.alpha < 255) {
        this.alpha += 255 / (60 * 2); // Increase alpha over 2 seconds at 60 frames per second
      }
    }

    // Function to check if the title is fully visible
    isFullyVisible() {
      return this.alpha === 255;
    }
  }