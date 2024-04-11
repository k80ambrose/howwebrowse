// Instance mode wrapper function
const oceanSketch = (p) => {
    // Global variables for instance mode, prefixed with `p.`
    let scrollAmount = 0;
    let currentTime = 0;
    let blinkTime = 0;
    let bgFadeElapsed = 0;
    let fadeStartTime = null;
    let startBgFade = false;
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
    let arrows;
    let title;
    
    const menuItemTitles = [
      "Introduction", "Background", "Literature Review",
      "Data & Methods", "Results", "Discussion",
      "Bibliography", "Acknowledgments"
    ];
    
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
    
    const maxScroll = 3000;
    const scrollFactor = 100;
  
    p.setup = () => {
        let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.parent('ocean-container');
        p.colorMode(p.RGB);
        fadeStartTime = p.millis();
    
        // Initialize the title object
        title = new Title("The Choreography of Choice: Browsing Netflix as a Cultural Exercise", p);
    
        // Populate thumbnails
        for (let i = 0; i < 300; i++) {
            thumbnails.push(new Thumbnail(p.random(p.width), p.random(p.height), p));
        }
    
        // Initialize arrows with p5.dom functions
        arrows = p.createImg('images/SVGs/arrows.svg', 'arrows icon');
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
            arrows.style('opacity', isHidden ? '0.6' : '0');
            isHidden = !isHidden; // Toggle the state
        }, 1000); // Adjust timing as needed for blink speed
    
        // Populate popups
        let middleRightX = p.windowWidth * 2 / 3;
        let middleRightY = p.windowHeight / 2;
        popups.push(new Popup("  Browsing has arisen as a necessary means of navigating the cluttered digital sphere.", 150, 250, 1000, 3000, p));
        popups.push(new Popup("  There's so much out there,", middleRightX, middleRightY - 10, 4000, 3000, p));
        popups.push(new Popup("  yet so little feels right.", middleRightX + 60, middleRightY + 60, 5000, 2000, p));
        popups.push(new Popup("  When Netflix users encounter their homepage, they are met with a deluge of information,", 150, 400, 7000, 6000, p));
        popups.push(new Popup("  how they use culture to make sense of it all was the subject of this study.", 300, 500, 10000, 3000, p));
    };

    p.draw = () => {
        currentTime = p.millis();
        // Calculate visible thumbnails based on scroll
        let visibleThumbnails = p.map(scrollAmount, 0, maxScroll * 0.005, thumbnails.length, 0);
        visibleThumbnails = p.constrain(visibleThumbnails, 0, thumbnails.length);
        
        // Background fade logic
        if (visibleThumbnails <= 0 && !startBgFade) {
          startBgFade = true;
          bgFadeElapsed = p.millis();
        }
        if (startBgFade) {
          let bgFadeDuration = p.millis() - bgFadeElapsed;
          let r, g, b;
          if (bgFadeDuration <= 2000) {
            let fadeProgress = bgFadeDuration / 2000;
            r = p.lerp(1, 235, fadeProgress);
            g = p.lerp(42, 235, fadeProgress);
            b = p.lerp(74, 235, fadeProgress);
          } else {
            r = g = b = 235; // Soft white/very light gray
          }
          p.background(r, g, b);
        } else {
          p.background(1, 42, 74); // Original dark blue color
        }
      
        // Update and display thumbnails
        thumbnails.forEach((thumb, i) => {
          if (i < visibleThumbnails) {
            let targetX = p.map(scrollAmount, 0, maxScroll, thumb.x, p.width / 2);
            thumb.x = p.lerp(thumb.x, targetX, 0.002);
            thumb.update();
            thumb.display();
          }
        });
      
        // Blinking arrow logic
        blinkTime += 0.05;
        let opacity = p.abs(p.sin(blinkTime)) * 0.6;
        if (arrows) arrows.style('opacity', opacity);

        // Menu items logic
        if (visibleThumbnails <= 0 && menuItems.length === 0) {
          menuItems = menuItemTitles.map((title, index) => {
            let x = p.width / (menuItemTitles.length + 1) * (index + 1);
            let y = p.height / 2;
            return new MenuItems(x, y, title, p);
          });
        }
      
        menuItems.forEach(item => {
          item.update();
          item.display();
        });
        
        // check menu visibility to see if you can scroll normally
        allowNormalScroll = menuItems.length > 0 && menuItems.every(item => item.isFullyVisible());

        // Popups and title display logic
        if (!allowNormalScroll) {
          popups.forEach(popup => {
            popup.update(currentTime);
            popup.display();
          });
        }
      
        if (menuItems.length > 0 && menuItems[0].isFullyVisible()) {
          title.fadeIn();
        } 
        title.display();
      };
      
    p.mouseWheel = (event) => {
    // SO YOU CAN SCROLL NORMALLY LATER
    if (allowNormalScroll) {
        // If the custom animation is complete, don't prevent default browser scroll.
        return true;
    } else {
        scrollAmount += event.delta / scrollFactor;
        scrollAmount = p.constrain(scrollAmount, 0, maxScroll);
        p.console.log(scrollAmount);
        // Prevent the default scroll behavior.
        event.preventDefault();
    }
    // HIDE ARROW IF YOU'RE SCROLLING
    if (arrows && scrollAmount > 3) {
        arrows.style('display', 'none');
    }
    };

    p.mousePressed = () => {
        // When the mouse is pressed, check each thumbnail and menu item
        let anyMenuItemClicked = false; // Flag to check if any menu item was clicked
        
        thumbnails.forEach((thumbnail) => {
          thumbnail.clicked(p.mouseX, p.mouseY);
        });
        
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
      };

    p.mouseReleased = () => {
    // When the mouse is released, stop dragging
    thumbnails.forEach((thumbnail) => {
        thumbnail.released();
    });
    };

    class MenuItems {
        constructor(x, y, text, p) {
          this.p = p; // Store reference to the p5 instance
          this.x = x;
          this.y = y;
          this.text = text;
          this.sectionId = menuTitleToSectionId[text];
          this.size = 150;
          this.height = 70;
          this.originalBgColor = [1, 79, 134]; // Original color
          this.hoverBgColor = [70, 143, 175]; // New shade of blue for hover
          this.textColor = [224, 225, 221];
          this.xOffset = this.p.random(2, 5);
          this.yOffset = this.p.random(2, 5);
          this.alpha = 0;
        }
      
        isFullyVisible() {
          return this.alpha >= 178; // Considering fully visible if alpha is 178 or more
        }
      
        isMouseOver() {
          return this.p.mouseX > this.x - this.size / 2 && this.p.mouseX < this.x + this.size / 2 &&
                 this.p.mouseY > this.y - this.height / 2 && this.p.mouseY < this.y + this.height / 2;
        }
      
        clicked() {
          if (this.isMouseOver()) {
            window.location.hash = '#' + this.sectionId;
          }
        }
      
        update() {
          // fade in
          if (fadeStartTime !== null) {
            let timeSinceStart = this.p.millis() - fadeStartTime;
            if (timeSinceStart > 2000) {
              let elapsedTime = timeSinceStart - 2000;
              this.alpha = this.p.map(elapsedTime, 0, 2000, 0, 180);
              this.alpha = this.p.constrain(this.alpha, 0, 180);
            }
          }
          // jiggling effect
          this.x += this.p.map(this.p.noise(this.xOffset), 0, 1, -0.1, 0.1);
          this.y += this.p.map(this.p.noise(this.yOffset), 0, 1, -0.1, 0.1);
          this.xOffset += 0.001;
          this.yOffset += 0.001;
        }
      
        display() {
          let bgColor = this.isMouseOver() ? this.hoverBgColor : this.originalBgColor;
          this.p.fill(bgColor[0], bgColor[1], bgColor[2], this.alpha);
          this.p.noStroke();
          this.p.rect(this.x - this.size / 2, this.y - this.height / 2, this.size, this.height, 5);
          this.p.fill(this.textColor[0], this.textColor[1], this.textColor[2], this.alpha);
          this.p.textSize(16);
          this.p.textFont("articulat-cf");
          this.p.textStyle(this.p.NORMAL);
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.p.text(this.text, this.x, this.y);
        }
      }

    class Thumbnail {
    constructor(x, y, p) {
        this.p = p; // Store the reference to the p5 instance
        this.x = x;
        this.y = y;
        this.xOffset = this.p.random(1000);
        this.yOffset = this.p.random(2000, 3000);
        this.size = this.p.random(120, 150);
        this.alphaOffset = this.p.random(4000, 5000);
        this.color = this.p.random(baseColors); 
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.originalSize = this.size; // Store the original size
    }

    // Method to start dragging
    clicked(mx, my) {
        let d = this.p.dist(mx, my, this.x, this.y);
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
        this.x = this.p.mouseX + this.offsetX;
        this.y = this.p.mouseY + this.offsetY;
        }
        this.x += this.p.map(this.p.noise(this.xOffset), 0, 1, -1, 1);
        this.y += this.p.map(this.p.noise(this.yOffset), 0, 1, -0.5, 0.5);
        this.xOffset += 0.01;
        this.yOffset += 0.005;
        // Alpha oscillation
        this.alpha = 150 + this.p.sin(this.p.frameCount * 0.005 + this.alphaOffset) * 105;
    }

    display() {
        this.p.fill(this.p.color(...this.color, this.alpha));
        this.p.noStroke();
        let newSize = this.p.map(scrollAmount, 0, 1000, this.size, this.size / 2); // Example mapping
        let newX = this.p.map(scrollAmount, 0, 1000, this.x, this.p.width / 2);
        this.size = newSize;
        this.x = newX;
        this.p.rect(this.x, this.y, newSize, newSize / 2, 5); // Use newSize for dynamic sizing
    }
    }

    class Popup {
        constructor(message, x, y, startTime, duration, p) {
          this.p = p; // Store reference to the p5 instance
          this.message = message;
          this.fullMessage = message;
          this.x = x;
          this.y = y;
          this.startTime = startTime;
          this.duration = duration;
          this.visible = false;
          this.currentLength = 0;
          this.maxWidth = this.p.windowWidth / 4;
          this.bgColor = [1, 42, 74];
          this.typingSpeed = 30;
          this.charWidth = this.p.textSize();
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
            this.p.push(); // Start a new drawing state
            this.p.textSize(22); // Set the text size
            this.p.textAlign(this.p.LEFT, this.p.TOP);
            this.p.textFont("articulat-cf"); // Set the font to Articulat CF
            this.p.textStyle(this.p.ITALIC); // Normal weight, oblique style
            this.p.noStroke();
            this.p.textLeading(30);
            let chars = this.fullMessage.substring(0, this.currentLength).split('');
            let xCursor = this.x;
            let extraSpacing = 5; // Adjust as needed for the italic slant
            let bottomPadding = 10; // Bottom padding for each character's background
      
            for (let i = 0; i < chars.length; i++) {
              let charWidth = this.p.textWidth(chars[i]) + extraSpacing;
              this.p.fill(this.p.color(...this.bgColor));
              this.p.noStroke();
              // Add the extraSpacing to the width of the rectangle to account for italics
              this.p.rect(xCursor, this.y, charWidth, this.p.textSize() + bottomPadding);
              this.p.fill(255); // Set text color to white
              // Draw the text slightly offset to the left by half the extraSpacing
              this.p.text(chars[i], xCursor - extraSpacing / 2, this.y);
              // Increment xCursor by the width of the character without extraSpacing
              // to maintain proper spacing between characters
              xCursor += this.p.textWidth(chars[i]);
            }
            this.p.pop();
          }
        }
      }
      
    class Title {
        constructor(text, p) {
        this.p = p; // Storing the reference to the p5 instance
        this.text = text;
        this.x = this.p.width / 2; // Center of the canvas
        this.y = 150; // Distance from the top of the canvas
        this.alpha = 0; // Start with the title invisible
        }
        // Function to display the title
        display() {
        this.p.textSize(32); // Example size, adjust as needed
        this.p.fill(0, this.alpha); // White color for the text with transparency
        this.p.noStroke();
        this.p.textAlign(this.p.CENTER, this.p.TOP);
        this.p.textFont("articulat-cf"); // Your chosen font
        this.p.textStyle(this.p.BOLD); // Adjust as needed
        this.p.text(this.text, this.x, this.y);
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
};
new p5(oceanSketch, 'ocean-container');        