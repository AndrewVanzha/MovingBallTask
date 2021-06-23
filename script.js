let fieldObject = {
  'borderLeft': 0,
  'borderRight': 0,
  'borderTop': 0,
  'borderBottom': 0,
};
let ballObject = {
  'currentX': 0,
  'currentY': 0,
  'centerX': 0,
  'centerY': 0,
  'diameter': 0,
  'radius': 0,
};
let rejectVelocity = {
  'vx': 0,
  'vy': 0,
};
let timerId; // ball render timer id

let ix = 0;
//window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const duration = 50; // milliseconds
const stepX = .01; // множитель к шагу по х (выключено)
const gg = .75; // ускорение поля

var ballCoords = {
  'startX': 10,
  'startY': 0,
  'finishX': 0,
  'finishY': 0
};

let detectField = (obj) => { // obtain field grids
  let size = obj.getBoundingClientRect();
  fieldObject.borderLeft = size.left;
  fieldObject.borderRight = size.right;
  fieldObject.borderTop = size.top;
  fieldObject.borderBottom = size.bottom;
  return size;
}

let getBallSize = (obj) => { // obtain ball size
  let size = obj.getBoundingClientRect();
  ballObject.diameter = size.right - size.left;
  ballObject.radius = ballObject.diameter / 2;
  return size;
}

let putBallOnPosition = (obj) => { // put ball on initial position
  ballObject.centerX = (fieldObject.borderRight - fieldObject.borderLeft) * .5 + fieldObject.borderLeft;
  ballObject.currentX = ballObject.centerX - ballObject.radius;
  ballObject.centerY = (fieldObject.borderBottom - fieldObject.borderTop) * .5 + fieldObject.borderTop;
  ballObject.currentY = ballObject.centerY - ballObject.radius;
  $(obj).offset({top: ballObject.currentY, left: ballObject.currentX});
  return ballObject;
}

let findBallPosition = (obj) => { // find current ball position
  ballObject.currentX = obj.getBoundingClientRect().left;
  ballObject.centerX = ballObject.currentX + ballObject.radius;
  ballObject.currentY = obj.getBoundingClientRect().top;
  ballObject.centerY = ballObject.currentY + ballObject.radius;
  //console.log(ballObject);
  return ballObject;
}

let findCurvePushParams = (pushCoords, centerCoords) => { // find parameters of current parabola
  let params = { // a * x2 + b * x + c
    'cosF': 1,
    'sinF': 0,
    'v0': 2, // pixels
    'h0': 0,
    'x0': 0,
  };
  //console.log(centerCoords);
  if(Math.abs(pushCoords.x-centerCoords.x) > 1.01) { // толчок не слишком близко к центру шара
    let vv = (pushCoords.x - centerCoords.x) * (pushCoords.x - centerCoords.x);
    vv += (pushCoords.y - centerCoords.y) * (pushCoords.y - centerCoords.y);
    params.v0 = Math.sqrt(vv);
    params.cosF = (pushCoords.x - centerCoords.x) / params.v0;
    params.sinF = (centerCoords.y - pushCoords.y) / params.v0;
    params.h0 = centerCoords.y;
    params.x0 = centerCoords.x;
  }
  //console.log(params);
  return params;
}

let findCurveRejectParams = (rejectVelocity, centerCoords) => { // find parameters of current parabola while ball rejecting
  let params = { // a * x2 + b * x + c
    'cosF': 1,
    'sinF': 0,
    'v0': 2, // pixels
    'h0': 0,
    'x0': 0,
  };
  params.v0 = rejectVelocity.vx * rejectVelocity.vx + rejectVelocity.vy * rejectVelocity.vy;
  params.v0 = Math.sqrt(params.v0);
  params.cosF = rejectVelocity.vx / params.v0;
  params.sinF = - rejectVelocity.vy / params.v0;
  params.h0 = centerCoords.y;
  params.x0 = centerCoords.x;

  return params;
}

let calculateCurveArray = (params, step_x) => { // make array filled with points of movement
  let pointsArray = new Array(0, 0, 0, 0); // массив точек кривой
  //let pointsArray = new Array(); // массив точек кривой
  let curvePoint = {
    'x': 0,
    'y': 0,
    'vx': 0,
    'vy': 0,
  };
  let tt = 0;

  let gridX0 = fieldObject.borderLeft + ballObject.radius;
  let gridY0 = fieldObject.borderTop + ballObject.radius;
  let gridX1 = fieldObject.borderRight - ballObject.radius;
  let gridY1 = fieldObject.borderBottom - ballObject.radius;
  let ii = 0;
  let side = '';
  let pushForce = step_x * params.v0;
  pushForce = .01 * 9;
  
  curvePoint.x = params.x0;
  curvePoint.y = params.h0;
  curvePoint.vx = rejectVelocity.vx; // vx
  curvePoint.vy = rejectVelocity.vy; // vy

  do {
    tt += pushForce; // параметрическое время
    pointsArray.push(curvePoint.x);
    pointsArray.push(curvePoint.y);
    pointsArray.push(curvePoint.vx);
    pointsArray.push(curvePoint.vy);
    //pointsArray.push(curvePoint);

    curvePoint.x = params.x0 + params.v0 * params.cosF * tt; // x0 + (v0*sinF)*t
    curvePoint.y = params.h0;
    curvePoint.y = curvePoint.y - params.v0 * params.sinF * tt;
    curvePoint.y = curvePoint.y + gg * tt * tt / 2; // h0 - (v0*sinF)*t + g*t*t/2

    curvePoint.vx = params.v0 * params.cosF;  // (v0 * cosF)
    curvePoint.vy = -params.v0 * params.sinF + gg * tt;  // -(v0*sinF) + g*t

    ii += 1;
    if(curvePoint.x <= gridX0) {
      side = 'left';
    }
    if(curvePoint.y <= gridY0) {
      side = 'top';
    }
    if(curvePoint.x >= gridX1) {
      side = 'right';
    }
    if(curvePoint.y >= gridY1) {
      side = 'bottom';
    }
    
  } while (curvePoint.x>gridX0 && curvePoint.y>gridY0 && curvePoint.x<gridX1 && curvePoint.y<gridY1);

  rejectVelocity.vx = pointsArray[pointsArray.length-2]; // вектор скорости после отражения
  rejectVelocity.vy = pointsArray[pointsArray.length-1];
  switch(side) {
    case 'left':
      rejectVelocity.vx *= -1;
      break;
    case 'right':
      rejectVelocity.vx *= -1;
      break;
    case 'top':
      rejectVelocity.vy *= -1;
      break;
    case 'bottom':
      rejectVelocity.vy *= -1;
  }

  return pointsArray;
}

let trackBallMovement = (obj, arrPoints) => { // render ball movement
  timerId = setInterval(function() {
    if (arrPoints.length === 0) {
      console.log('render expired');
      clearInterval(timerId);
      ballRock(obj);
    } else {
      $(obj).offset({top: arrPoints[1]-ballObject.radius, left: arrPoints[0]-ballObject.radius});
      console.log('move');
      arrPoints.shift();
      arrPoints.shift();
      arrPoints.shift();
      arrPoints.shift();
    }
  }, duration);

  console.log('arrPoints.length='+arrPoints.length);
}

let startMoveBall = (obj, clickCoords, centerCoords) => { // движение после начального толчка
  let objectTrack = [];
  let parabParams;
  parabParams = findCurvePushParams(clickCoords, centerCoords);
  objectTrack = calculateCurveArray(parabParams, stepX);
  trackBallMovement(obj, objectTrack);
}

let moveBall = (obj, rejectVelocity, centerCoords) => { // движение после отражения от стенки
  let objectTrack = [];
  let parabParams;

  parabParams = findCurveRejectParams(rejectVelocity, centerCoords);
  objectTrack = calculateCurveArray(parabParams, stepX);
  trackBallMovement(obj, objectTrack);
}

let ballRock = (ballElement) => { // движение после начального толчка
  let centerCoords = {
    'x': 0,
    'y': 0
  }
  
  findBallPosition(ballElement);
  centerCoords.x = ballObject.centerX;
  centerCoords.y = ballObject.centerY;
  moveBall(ballElement, rejectVelocity, centerCoords);
  
}

$(document).ready(function() {
  let fieldElement = document.querySelector('.fieldq');
  let ballElement = document.querySelector('.ballq');
  
  detectField(fieldElement);
  getBallSize(ballElement);
  putBallOnPosition(ballElement);

  $(ballElement).click(function(elem) {
    let clickCoords = { // координаты клика
      'x': elem.pageX,
      'y': elem.pageY
    };
    let centerCoords = {
      'x': ballObject.centerX,
      'y': ballObject.centerY
    }
    let pos = $(this).offset();  // координаты верхней правой точки мяча

    /*if(timerId !== undefined) { // мяч в движении
      clearInterval(timerId);
    }*/

    findBallPosition(ballElement);
    centerCoords.x = ballObject.centerX;
    centerCoords.y = ballObject.centerY;
    startMoveBall(ballElement, clickCoords, centerCoords);

  });
  
});
