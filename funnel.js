let filterPosition = 0;
let movingForward = true;
const funnelWidth = 200; // Width of the wide end of the funnel
const funnelLength = 600; // Length of the funnel from wide end to point
const funnelDepthFactor = 0.5; // Determines the height of the funnel's wide end

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(255);

  // Draw the funnel centered on the page
  drawFunnel();

  // Update filter position
  updateFilterPosition();

  // Draw the filter as an ellipse
  drawFilter();
}

function drawFunnel() {
  push();
  translate(width / 2, height / 2); // Centering the funnel

  // Draw the two sides of the funnel
  line(-funnelWidth / 2, -funnelWidth * funnelDepthFactor / 2, funnelLength / 2, 0);
  line(funnelWidth / 2, -funnelWidth * funnelDepthFactor / 2, funnelLength / 2, 0);
  line(-funnelWidth / 2, funnelWidth * funnelDepthFactor / 2, funnelLength / 2, 0);
  line(funnelWidth / 2, funnelWidth * funnelDepthFactor / 2, funnelLength / 2, 0);

  // Draw the wide end as an ellipse
  ellipse(0, 0, funnelWidth, funnelWidth * funnelDepthFactor);
  pop();
}

function updateFilterPosition() {
  // Update the position of the filter to move it back and forth along the funnel
  const speed = 2; // Adjust as necessary for faster or slower movement
  filterPosition += movingForward ? speed : -speed;

  // Reverse direction at the ends
  if (filterPosition > funnelLength || filterPosition < 0) {
    movingForward = !movingForward;
    filterPosition = constrain(filterPosition, 0, funnelLength);
  }
}

function drawFilter() {
  push();
  translate(width / 2 - funnelLength / 2, height / 2); // Centering the funnel

  // Scale the filter based on its position for depth effect
  const filterWidth = map(filterPosition, 0, funnelLength, funnelWidth, 0);
  const filterHeight = filterWidth * funnelDepthFactor;

  // Ensure the filter ellipse doesn't exceed the bounds of the funnel
  const clampedFilterWidth = constrain(filterWidth, 0, funnelWidth);
  const clampedFilterHeight = constrain(filterHeight, 0, funnelWidth * funnelDepthFactor);

  // Draw the filter as an ellipse
  ellipse(filterPosition - funnelLength / 2, 0, clampedFilterWidth, clampedFilterHeight);
  pop();
}
