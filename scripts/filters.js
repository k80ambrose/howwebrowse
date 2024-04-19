  document.addEventListener('DOMContentLoaded', function() {
      const svgElement = document.getElementById('Layer_2'); // Reference to the entire SVG
      const infoWrapper = document.querySelector('.info-text-wrapper');
      const infoTexts = document.querySelectorAll('.info-text');
  
      // Define circles and lines for each group
      const groups = {
        'tropes': {
            circle: document.querySelector('#tropes-group circle'),
            lines: document.querySelectorAll('#tropes-group line'),
            color: '#fb6107', // Reddish
            infoText: document.getElementById('info-tropes')
        },
        'associations': {
            circle: document.querySelector('#associations-group circle'),
            lines: document.querySelectorAll('#associations-group line'),
            color: '#2196f3', // Blueish
            infoText: document.getElementById('info-associations')
        },
        'audience': {
            circle: document.querySelector('#audience-group circle'),
            lines: document.querySelectorAll('#audience-group line'),
            color: '#7161ef', // Purple
            infoText: document.getElementById('info-audience')
        },
        'situation': {
            circle: document.querySelector('#situation-group circle'),
            lines: document.querySelectorAll('#situation-group line'),
            color: '#FFC857', // Yellow
            infoText: document.getElementById('info-situation')
        },
        'acceptability': {
            circle: document.querySelector('#acceptability-group circle'),
            lines: document.querySelectorAll('#acceptability-group line'),
            color: '#55a630', // Green
            infoText: document.getElementById('info-acceptability')
        }
    };
  
    function changeStrokeColor(elements, color, infoText) {
        elements.forEach(element => {
            element.style.stroke = color;
        });
    }
    
    function isPointInCircle(x, y, cx, cy, radius) {
          const distanceSquared = (x - cx) ** 2 + (y - cy) ** 2;
          return distanceSquared <= radius * radius;
      }
  
      svgElement.addEventListener('mousemove', function(event) {
        const rect = svgElement.getBoundingClientRect();
        const scaleX = svgElement.viewBox.baseVal.width / rect.width;
        const scaleY = svgElement.viewBox.baseVal.height / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
        let anyCircleHovered = false;

        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            if (isPointInCircle(mouseX, mouseY, group.circle.cx.baseVal.value, group.circle.cy.baseVal.value, group.circle.r.baseVal.value)) {
                anyCircleHovered = true;
                changeStrokeColor([group.circle, ...group.lines], group.color, group.infoText);
                group.infoText.style.display = 'block';
            } else {
                changeStrokeColor([group.circle, ...group.lines], '#cccccc', group.infoText);
                group.infoText.style.display = 'none';
            }
        });

        if (anyCircleHovered) {
            infoWrapper.style.display = 'flex';
        } else {
            infoWrapper.style.display = 'none';
        }
    });

function calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    svgElement.addEventListener('mousemove', function(event) {
        const rect = svgElement.getBoundingClientRect();
        const scaleX = svgElement.viewBox.baseVal.width / rect.width;
        const scaleY = svgElement.viewBox.baseVal.height / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
        let closestCircle = null;
        let minDistance = Infinity;

        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            const cx = group.circle.cx.baseVal.value;
            const cy = group.circle.cy.baseVal.value;
            const radius = group.circle.r.baseVal.value;
            const distance = calculateDistance(mouseX, mouseY, cx, cy);

            if (distance < radius && distance < minDistance) {
                closestCircle = group;
                minDistance = distance;
            }
        });

        if (closestCircle) {
            infoWrapper.style.display = 'flex';
            Object.values(groups).forEach(group => {
                group.infoText.style.display = 'none';
            });
            closestCircle.infoText.style.display = 'block';
        } else {
            infoWrapper.style.display = 'none';
        }
    });
});
