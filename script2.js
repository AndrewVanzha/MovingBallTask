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
let pushForce = .01 * 9;
let tt = pushForce; // параметрическое время

let ix = 0;
let stopMove = false; // признак останова цикла
//window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

let duration = 10; // milliseconds
const stepX = .01; // множитель к шагу по х
const gg = .75; // ускорение поля

let ballSize = 50; // диаметр мяча для наибольшей ширины поля
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

  $('.ping-message').offset({top: ballObject.centerY, left: ballObject.centerX}); // устанавливаю координаты баннера

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

let findCurvePushParams = (pushCoords, centerCoords) => { // find initial push parameters
  let params = { // a * x2 + b * x + c
    'cosF': 1,
    'sinF': 0,
    'v0': 10, // pixels
    'h0': 0,
    'x0': 0,
    'vx': 10,
    'vy': 0,
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
    params.vx = params.v0 * params.cosF;
    params.vy = -params.v0 * params.sinF;
  }
  //console.log(params);
  return params;
}

let calculateNextStep = (oldPoint) => { // рассчитываю следующую итерацию
  let curvePoint = {
    'x': 0,
    'y': 0,
    'vx': 0,
    'vy': 0,
  };
  //console.log('calculateNextStep');
  let gridX0 = fieldObject.borderLeft + ballObject.radius;
  let gridY0 = fieldObject.borderTop + ballObject.radius;
  let gridX1 = fieldObject.borderRight - ballObject.radius;
  let gridY1 = fieldObject.borderBottom - ballObject.radius;

  let dx = oldPoint.vx * tt; //
  curvePoint.x = oldPoint.x + dx; //
  let dy = oldPoint.vy * tt;
  curvePoint.y = oldPoint.y + dy;

  let dvx = 0; //
  curvePoint.vx = oldPoint.vx + dvx;
  let dvy = gg * tt; // 
  curvePoint.vy = oldPoint.vy + dvy;

  if(curvePoint.x <= gridX0) { // to left
    curvePoint.vx = -oldPoint.vx;
  }
  if(curvePoint.x >= gridX1) { // to right
    curvePoint.vx = -oldPoint.vx;
  }
  if(curvePoint.y <= gridY0) { // to top
    curvePoint.vy = -oldPoint.vy;
  }
  if(curvePoint.y >= gridY1) { // to bottom
    curvePoint.vy = -oldPoint.vy;
  }
  if(curvePoint.x <= gridX0 && curvePoint.y <= gridY0) { // to left top
    curvePoint.vx = -oldPoint.vx;
    curvePoint.vy = -oldPoint.vy;
  }
  if(curvePoint.x >= gridX1 && curvePoint.y <= gridY0) { // to right top
    curvePoint.vx = -oldPoint.vx;
    curvePoint.vy = -oldPoint.vy;
  }
  if(curvePoint.x <= gridX0 && curvePoint.y >= gridY1) { // to left bottom
    curvePoint.vx = -oldPoint.vx;
    curvePoint.vy = -oldPoint.vy;
  }
  if(curvePoint.x >= gridX1 && curvePoint.y >= gridY1) { // to right bottom
    curvePoint.vx = -oldPoint.vx;
    curvePoint.vy = -oldPoint.vy;
  }
  //console.log(curvePoint);
  //alert('A!');
  return curvePoint;
}

let makePing = (clickCoords) => { // высвечиваю надпись на время в заданном месте
  let message = document.querySelector('.ping-message');
  console.log('makePing');
  message.classList.add('message-show');
  $(message).offset({top: clickCoords.y, left: clickCoords.x});
  setTimeout(() => {
    message.classList.remove('message-show');
  }, 4000);

}

let trackBallMovement = (obj, curvePoint) => { // render ball movement
  $(obj).offset({top: curvePoint.y-ballObject.radius, left: curvePoint.x-ballObject.radius});
}

let startMoveBall = (obj, clickCoords, centerCoords) => { // движение после начального толчка
  let currentPoint = {
    'x': 0,
    'y': 0,
    'vx': 0,
    'vy': 0,
  };
  let parabParams;
  
  parabParams = findCurvePushParams(clickCoords, centerCoords);
  
  let dx = parabParams.vx * parabParams.cosF * tt; // вначале
  currentPoint.x = centerCoords.x + dx; // 
  let dy = -parabParams.vy * parabParams.sinF * tt;
  currentPoint.y = centerCoords.y + dy; // 
  currentPoint.vx = parabParams.vx;
  currentPoint.vx = parabParams.vy;
  //console.log(currentPoint);

  timerId = setInterval(function() {
    if (stopMove) {
      console.log('render expired');
      clearInterval(timerId);
    } else {
      currentPoint = calculateNextStep(currentPoint);
      trackBallMovement(obj, currentPoint);
      console.log('move');
    }
  }, duration);
  
}

$(document).ready(function() {
  let fieldElement = document.querySelector('.fieldq');
  let ballElement = document.querySelector('.ballq');
  //console.log(ballElement);
  //console.log(fieldElement);
  
  detectField(fieldElement);
  getBallSize(ballElement);
  putBallOnPosition(ballElement);

  $('.duration').val(duration);
  $('.smooth').val(tt);
  $('.data-button').click(()=>{
    duration = parseInt($('.duration').val());
    tt = parseFloat($('.smooth').val());
    if (tt > .1) tt = .1;
    });

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
    $('.duration').val(duration);
    $('.smooth').val(tt);
    if(timerId !== undefined) { // мяч уже в движении
      clearInterval(timerId);
      console.log('suspend');
      stopMove = true;
      setTimeout(() => {
        stopMove = false;
        $('.stop-button').click(function() { // остановка движения
          clearInterval(timerId);
          console.log('stop');
          stopMove = true;
          setTimeout(() => {
            stopMove = false;
          }, 100);
        });
    
        findBallPosition(ballElement);
        centerCoords.x = ballObject.centerX;
        centerCoords.y = ballObject.centerY;
        makePing(clickCoords);
        startMoveBall(ballElement, clickCoords, centerCoords);
  
      }, 100);
    } else {   // первый толчок
      $('.stop-button').click(function() { // остановка движения
        clearInterval(timerId);
        console.log('stop');
        stopMove = true;
        setTimeout(() => {
          stopMove = false;
        }, 2000);
      });
  
      findBallPosition(ballElement);
      console.log(ballObject);
      centerCoords.x = ballObject.centerX;
      centerCoords.y = ballObject.centerY;
      makePing(clickCoords);
      startMoveBall(ballElement, clickCoords, centerCoords);
  
    }
    console.log('stage finish');

  });
  
});

// https://basicweb.ru/jquery/jquery_effect_animate.php
// https://www.sql.ru/forum/823024/jquery-animate-proizvolnoe-dvizhenie
// https://javascript.ru/forum/jquery/22657-dvizhenie-obekta-po-krivojj.html
// https://ruseller.com/jquery.php?id=90
// https://overcoder.net/q/961188/jquery-animate-step-%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%B0%D0%B2%D0%BB%D0%B8%D0%B2%D0%B0%D0%B5%D1%82-%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D1%8E
