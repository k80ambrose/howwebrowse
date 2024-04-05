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