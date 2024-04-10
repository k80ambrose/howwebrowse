function setup() {
  createCanvas(800, 800); // Set canvas size to 800 x 800 pixels
  noLoop();
}

function draw() {
  background(255);
  
  // Parameters for the funnel
  let funnelLength = 700; // Total length of the funnel
  let baseEllipseRadiusX = 20; // Horizontal radius of the base ellipse
  let baseEllipseRadiusY = 100; // Vertical radius of the base ellipse
  
   // Hex color codes from lighter to darker
   let colors = [
    "#caf0f8", "#ade8f4", "#90e0ef", "#48cae4", 
    "#00b4d8", "#0096c7", "#0077b6", "#023e8a", "#03045e"
  ];

  // Calculating the positions to center the entire funnel
  let baseEllipseCenterX = (width / 2) - (funnelLength / 2) + baseEllipseRadiusX;
  let tipX = (width / 2) + (funnelLength / 2) - baseEllipseRadiusX;
  
  // Draw the ellipses and lines with gradient
  let numEllipses = 60;
  for (let i = 0; i <= numEllipses; i++) {
    // Calculate the position and size of each ellipse based on its index
    let distance = lerp(0, funnelLength - 2 * baseEllipseRadiusX, i / numEllipses);
    let currentX = baseEllipseCenterX + distance;
    
    // Using similar triangles to calculate the radiusY at the current position
    let currentRadiusY = baseEllipseRadiusY * (1 - (distance / (funnelLength - 2 * baseEllipseRadiusX)));
    let currentRadiusX = currentRadiusY * (baseEllipseRadiusX / baseEllipseRadiusY);
    
    // Get the corresponding color for this ellipse
    let colorIndex = floor(map(i, 0, numEllipses, 0, colors.length));
    let currentColor = colors[colorIndex];
    
    // Set the stroke to the current color and draw the ellipse
    stroke(currentColor);
    noFill();
    ellipse(currentX, height / 2, currentRadiusX * 2, currentRadiusY * 2);
  }

  // Draw the funnel lines at the end so they are on top
  for (let i = 0; i < colors.length; i++) {
    let lerpRatio = i / (colors.length - 1);
    let lineY = lerp(height / 2 - baseEllipseRadiusY, height / 2, lerpRatio);
    
    stroke(colors[i]);
    line(baseEllipseCenterX, lineY, tipX, height / 2);
    line(baseEllipseCenterX, height - lineY, tipX, height / 2);
  }
}
