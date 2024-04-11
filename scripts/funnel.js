const funnelSketch = (p) => {
  let echoes = [];

  p.setup = () => {
    let canvas = p.createCanvas(800, 300);
    canvas.parent('funnel-container');
    p.noFill();
  };

  p.draw = () => {
    p.background(255);
    let funnelLength = 700;
    let baseEllipseRadiusX = 20;
    let baseEllipseRadiusY = 100;
    let baseEllipseCenterX = (p.width / 2) - (funnelLength / 2) + baseEllipseRadiusX;
    let tipX = (p.width / 2) + (funnelLength / 2) - baseEllipseRadiusX;

    p.stroke(0);
    p.strokeWeight(2);
    p.ellipse(baseEllipseCenterX, p.height / 2, baseEllipseRadiusX * 2, baseEllipseRadiusY * 2);
    p.line(baseEllipseCenterX, p.height / 2 - baseEllipseRadiusY, tipX, p.height / 2);
    p.line(baseEllipseCenterX, p.height / 2 + baseEllipseRadiusY, tipX, p.height / 2);

    let colors = [
      "#caf0f8", "#ade8f4", "#90e0ef", "#48cae4",
      "#00b4d8", "#0096c7", "#0077b6", "#023e8a", "#03045e"
    ];

    let mouseXConstrained = p.constrain(p.mouseX, baseEllipseCenterX, tipX);
    let distance = p.map(mouseXConstrained, baseEllipseCenterX, tipX, 0, funnelLength - 2 * baseEllipseRadiusX);
    let currentRadiusY = baseEllipseRadiusY * (1 - (distance / (funnelLength - 2 * baseEllipseRadiusX)));
    let currentRadiusX = currentRadiusY * (baseEllipseRadiusX / baseEllipseRadiusY);

    let colorIndex = p.floor(p.map(distance, 0, funnelLength - 2 * baseEllipseRadiusX, 0, colors.length));
    let currentColor = colors[colorIndex];

    p.stroke(currentColor);
    p.strokeWeight(1);
    p.ellipse(mouseXConstrained, p.height / 2, currentRadiusX * 2, currentRadiusY * 2);

    echoes.push({x: mouseXConstrained, y: p.height / 2, rx: currentRadiusX, ry: currentRadiusY, color: currentColor});

    if (echoes.length > 5) {
      echoes.shift();
    }

    echoes.forEach((echo, index) => {
      let alpha = p.map(index, 0, echoes.length - 1, 255, 50);
      let alphaHex = p.floor(alpha).toString(16).padStart(2, '0');
      p.stroke(echo.color + alphaHex);
      p.strokeWeight(1);
      p.ellipse(echo.x, echo.y, echo.rx * 2, echo.ry * 2);
    });

    p.stroke(0);
    p.strokeWeight(2);
    p.ellipse(baseEllipseCenterX, p.height / 2, baseEllipseRadiusX * 2, baseEllipseRadiusY * 2);
    p.line(baseEllipseCenterX, p.height / 2 - baseEllipseRadiusY, tipX, p.height / 2);
    p.line(baseEllipseCenterX, p.height / 2 + baseEllipseRadiusY, tipX, p.height / 2);
  };
};

new p5(funnelSketch);
