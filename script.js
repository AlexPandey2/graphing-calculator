const canvas = document.getElementById('graphCanvas');
canvas.addEventListener('wheel', handleScrollZoom)
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', duringDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);
canvas.addEventListener('mousemove', showTooltip);
canvas.addEventListener('mouseleave', () => {
  document.getElementById('hoverBox').style.display = 'none';
});



let isDragging = false;
let dragStart = { x: 0, y: 0 };

const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const originalScale = 80;
let scale = 80;
let xOff = 0;
let yOff = 0;
let radians = true;

const coordCanvas = document.getElementById('displayCanvas');
const dtx = coordCanvas.getContext('2d');
const ccwidth = coordCanvas.width;
const ccheight = coordCanvas.height;
dtx.font = '20px serif';




function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }


let currentExpr = null;
let functionCount = 1;
let functionInputs = ["functionInput"]
const inputBox = document.getElementById('functionInput')
inputBox.addEventListener('input', () => {
  try {
    const x = 1;
    math.evaluate(inputBox.value, { x });
    plot();
    
  }
    catch (e) {
      createEmptyGrid();
    }
});

canvas.addEventListener('mousemove', function(evt) {

  dtx.clearRect(0, 0, ccwidth, ccheight);
  var mousePos = getMousePos(canvas, evt);
  const graphX = (mousePos.x - width / 2) / scale + xOff;
  const graphY = (-mousePos.y + height/2) / scale - yOff;
  dtx.fillText(graphX.toFixed(2), 10, 45);
  dtx.fillText(graphY.toFixed(2), 10, 70);

});

canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  const graphX = (mousePos.x - width / 2) / scale + xOff;
  const graphY = (-mousePos.y + height/2) / scale - yOff;

  if (currentExpr) {
    try {
      let expY = math.evaluate(currentExpr, { x: graphX });
      dtx.fillText("f(x): " + expY.toFixed(2), 10, 95);

      graphPosY = -(((expY + yOff)*scale)-(height/2))
      if (Math.abs(graphY - expY) < 0.1) {
        plot();
        ctx.fillStyle = '#0077ff';
        ctx.beginPath();
        ctx.arc(mousePos.x, graphPosY, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
      else {
        plot();
      }
    } catch (e) {

    }
  }
});

canvas.addEventListener('mousemove', function(evt) {
    const mousePos = getMousePos(canvas, evt);
    const graphX = (mousePos.x - width / 2) / scale + xOff;
    const graphY = (-mousePos.y + height / 2) / scale - yOff;
    let expY = math.evaluate(inputBox.value, { x: graphX });

    graphPosY = -(((expY + yOff)*scale)-(height/2))
    if (Math.abs(expY - graphY) < 0.1*scale) {
        currentExpr = inputBox.value;
      }
      else {
        currentExpr = null;
      }
      
  });


createEmptyGrid();

function createEmptyGrid() {
  ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - yOff * scale); // x-axis
    ctx.lineTo(width, height / 2 - yOff * scale);
    

    ctx.moveTo(width / 2 - xOff * scale, 0); // y-axis
    ctx.lineTo(width / 2 - xOff * scale, height); 

    ctx.stroke();


    
    let unit = originalScale / scale;
    let exponent = Math.floor(Math.log10(unit)); 
    let fraction = unit / Math.pow(10, exponent);

    let step;
    if (fraction < 2) {
        step = 1;
    } else if (fraction < 5) {
        step = 2;
    } else {
        step = 5;
    }

    step *= Math.pow(10, Math.floor(Math.log10(originalScale / scale)));

    ctx.strokeStyle = '#dddddd';
    ctx.fillStyle = 'black';
    ctx.beginPath();


    for (let px = 0; px < (width*(originalScale/scale)); px+=step) {

    let displayValue = Math.round(px * 1000000) / 1000000;

    ctx.moveTo(0, (height / 2 - yOff * scale) + (scale*px)); // grid
    ctx.lineTo(width, (height / 2 - yOff * scale) + (scale*px));
    ctx.moveTo(0, (height / 2 - yOff * scale) + (scale*-px));
    ctx.lineTo(width, (height / 2 - yOff * scale) + (scale*-px));


    ctx.moveTo((width / 2 - xOff * scale) + (scale*px), 0);
    ctx.lineTo((width / 2 - xOff * scale) + (scale*px), height); 
    ctx.fillText(displayValue, (width / 2 - xOff * scale) + (scale*px), (height/2)-(yOff*scale)+9); //x, y=0
    ctx.fillText(-displayValue, ((height/2)-(xOff*scale)), ((width / 2 - yOff * scale) + (scale*px))+9);

    ctx.moveTo((width / 2 - xOff * scale) + (scale*-px), 0);
    ctx.lineTo((width / 2 - xOff * scale) + (scale*-px), height); 
    ctx.fillText(-displayValue, (width / 2 - xOff * scale) + (scale*-px), (height/2)-(yOff*scale)+9);
    ctx.fillText(displayValue, ((height/2)-(xOff*scale)), ((width / 2 - yOff * scale) + (scale*-px))+9);
  }

  ctx.stroke();
}

function plot() {
  createEmptyGrid();
  functionInputs.forEach(plotFunc);
}

function plotFunc(funcInput) {
    const expr = document.getElementById(funcInput).value;
    
    if (!expr.trim()) return;

    ctx.strokeStyle = '#0077ff';
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
        const x = (px - width / 2) / scale + xOff; 
        let y;
        try {
        if (containsTrig(expr) && radians == false) {
          const xDeg = x * Math.PI / 180; 
          y = math.evaluate(expr, { x: xDeg })
        }
        else {
          y = math.evaluate(expr, { x });
        }
        } catch (e) {
        console.error('Invalid expression', e);
        return;
        }
        
        const py = height / 2 - (y + yOff) * scale;
        if (px === 0) {
        ctx.moveTo(px, py);
        } else {
        ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    
}

function containsTrig(expr) {
  const hasTrig = /(?:^|\W)(sin|cos|tan|asin|acos|atan)\s*\(/.test(expr);
  if (hasTrig) {
    return true;
  }
  else {
    return false
  }
}

function toggleRadians() {
  radians = !radians;
  var elem = document.getElementById("radiansButton");
  if (elem.innerHTML == "Radians") elem.innerHTML = "Degrees";
  else elem.innerHTML = "Radians"; 
  plot();
}

function showTooltip(event) {
  const rect = canvas.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;

  const x = (px - width / 2) / scale + xOff;
  let y;

  try {
    y = math.evaluate(expr, { x });
  } catch (e) {
    return;
  }

  const graphY = height / 2 - (y - yOff) * scale;

  if (Math.abs(py - graphY) < 5) {
    const hoverBox = document.getElementById('hoverBox');
    hoverBox.style.left = `${event.clientX + 10}px`;
    hoverBox.style.top = `${event.clientY - 30}px`;
    hoverBox.style.display = 'block';
    hoverBox.textContent = `x: ${x.toFixed(2)}\ny: ${y.toFixed(2)}`;
  } else {
    document.getElementById('hoverBox').style.display = 'none';
  }
}

function calcTrig() {

    const expr = document.getElementById('functionInput').value;

}

function insert(value) {
    const input = document.getElementById("functionInput");
    input.value += value;
    input.focus(); 
  }

function clearInput() {
    const input = document.getElementById("functionInput");
    input.value = ""
    input.focus()
}

function handleScrollZoom(event) {
    event.preventDefault();
  
    if (event.deltaY < 0) {
      scale *= 1.2;
    } else {
      scale /= 1.2;
    }
  
    plot();
  }

function zoomIn() {
    scale *= 1.2;
    plot();
}

function zoomOut() {
    scale /= 1.2;
    plot();
}

function moveLeft() {
    xOff -= 1;
    plot();
}

function moveRight() {
    xOff += 1;
    plot();
}

function moveUp() {
    yOff -= 1;
    plot();
}

function moveDown() {
    yOff += 1;
    plot();
}

function startDrag(event) {
    isDragging = true;
    dragStart.x = event.offsetX;
    dragStart.y = event.offsetY;
}

function duringDrag(event) {
    if (!isDragging) return;

    const dx = event.offsetX - dragStart.x;
    const dy = event.offsetY - dragStart.y;

    xOff -= dx / scale;
    yOff -= dy / scale;

    dragStart.x = event.offsetX;
    dragStart.y = event.offsetY;

    plot();
}

function endDrag() {
    isDragging = false;
}

function addFunctionInput() {
  const inputArea = document.querySelector(".input-area");
  const newDiv = document.createElement("div");
  newDiv.className = "function-input";

  const newInput = document.createElement("input");
  newInput.id = `functionInput${functionCount++}`;
  functionInputs.push(newInput.id);
  newInput.type = "text";
  newInput.placeholder = "Enter another function, e.g., cos(x)";
  newInput.addEventListener('input', () => {
  try {
    const x = 1;
    math.evaluate(inputBox.value, { x });
    plot();
  }
    catch (e) {
      createEmptyGrid();
    }
  });

  const hoverListener = (evt) => {
    const mousePos = getMousePos(canvas, evt);
    const graphX = (mousePos.x - width / 2) / scale + xOff;
    const graphY = (-mousePos.y + height / 2) / scale - yOff;
    let expY = math.evaluate(newInput.value, { x: graphX });

    graphPosY = -(((expY + yOff)*scale)-(height/2))
    if (Math.abs(expY - graphY) < 0.1) {
        currentExpr = newInput.value;
        /*plot();
        ctx.fillStyle = '#0077ff';
        ctx.beginPath();
        ctx.arc(mousePos.x, graphPosY, 6, 0, 2 * Math.PI);
        ctx.fill();
        */
      }
      else {
        //plot();
      }
      
  }

  canvas.addEventListener("mousemove", hoverListener);

  const removeButton = document.createElement("button");
  removeButton.textContent = "–";
  removeButton.type = "button";
  removeButton.onclick = () => {
    inputArea.removeChild(newDiv);
    functionInputs = functionInputs.filter(id => id !== newInput.id);
    canvas.removeEventListener("mousemove", hoverListener);
    plot();
  }

  newDiv.appendChild(newInput);
  newDiv.appendChild(removeButton);

  inputArea.appendChild(newDiv);
}