function setup() {
  createCanvas(800, 800);
  noFill();
}

function draw() {
  background(255);
  
  // Parameters for the funnel
  let funnelLength = 700;
  let baseEllipseRadiusX = 20;
  let baseEllipseRadiusY = 100;
  let baseEllipseCenterX = (width / 2) - (funnelLength / 2) + baseEllipseRadiusX;
  let tipX = (width / 2) + (funnelLength / 2) - baseEllipseRadiusX;

  // Draw the black outline of the funnel
  stroke(0);
  strokeWeight(2);
  ellipse(baseEllipseCenterX, height / 2, baseEllipseRadiusX * 2, baseEllipseRadiusY * 2);
  line(baseEllipseCenterX, height / 2 - baseEllipseRadiusY, tipX, height / 2);
  line(baseEllipseCenterX, height / 2 + baseEllipseRadiusY, tipX, height / 2);

  // Hex color codes from lighter to darker for gradient ellipses
  let colors = [
    "#caf0f8", "#ade8f4", "#90e0ef", "#48cae4",
    "#00b4d8", "#0096c7", "#0077b6", "#023e8a", "#03045e"
  ];

  // Calculate the ellipse size based on mouse X position within the funnel
  let mouseXConstrained = constrain(mouseX, baseEllipseCenterX, tipX);
  let distance = map(mouseXConstrained, baseEllipseCenterX, tipX, 0, funnelLength - 2 * baseEllipseRadiusX);
  let currentRadiusY = baseEllipseRadiusY * (1 - (distance / (funnelLength - 2 * baseEllipseRadiusX)));
  let currentRadiusX = currentRadiusY * (baseEllipseRadiusX / baseEllipseRadiusY);

  // Determine the color based on mouse X position within the funnel
  let colorIndex = floor(map(distance, 0, funnelLength - 2 * baseEllipseRadiusX, 0, colors.length));
  let currentColor = colors[colorIndex];
  
  // Draw the ellipse that follows the mouse
  stroke(currentColor);
  strokeWeight(1);
  ellipse(mouseXConstrained, height / 2, currentRadiusX * 2, currentRadiusY * 2);
}
