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
//let ballVector = new Vector();
let ballVelocity = new Vector();
let barrierT1 = new Vector(200, 200); // координаты точек треугольника - препятствия
let barrierT2 = new Vector(50, 300); 
let barrierT3 = new Vector(300, 400); 
let barrierObject = {
  'T1': new Vector,
  'T2': new Vector,
  'T3': new Vector,
}
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

let detectField = (obj) => { // obtain field grids
  let size = obj.getBoundingClientRect();
  fieldObject.borderLeft = size.left;
  fieldObject.borderRight = size.right;
  fieldObject.borderTop = size.top;
  fieldObject.borderBottom = size.bottom;
  console.log(fieldObject);
  return size;
}

let getBallSize = (obj) => { // obtain ball size
  let size = obj.getBoundingClientRect();
  ballObject.diameter = size.right - size.left;
  ballObject.radius = ballObject.diameter / 2;
  return size;
}

let putBallOnPosition = (obj) => { // put ball on initial position
  let ballVector = new Vector();
  ballObject.centerX = (fieldObject.borderRight - fieldObject.borderLeft) * .5 + fieldObject.borderLeft;
  ballObject.currentX = ballObject.centerX - ballObject.radius;
  ballObject.centerY = (fieldObject.borderBottom - fieldObject.borderTop) * .5 + fieldObject.borderTop;
  ballObject.currentY = ballObject.centerY - ballObject.radius;
  $(obj).offset({top: ballObject.currentY, left: ballObject.currentX});
  ballVector.x = ballObject.centerX;
  ballVector.y = ballObject.centerY;

  $('.ping-message').offset({top: ballObject.centerY, left: ballObject.centerX}); // устанавливаю координаты баннера

  return ballVector;
}

let putTriangleOnPosition = (obj) => {
  let ctx = obj.getContext("2d"); // canvas element
  ctx.strokeStyle = "crimson";

  ctx.beginPath();
  ctx.moveTo(barrierT1.x, barrierT1.y);
  ctx.lineTo(barrierT2.x, barrierT2.y);
  ctx.lineTo(barrierT3.x, barrierT3.y);
  ctx.lineTo(barrierT1.x, barrierT1.y);

  ctx.fillStyle = "crimson";
  ctx.fill();
  ctx.closePath();
  ctx.stroke();

  barrierObject.T1.x = barrierT1.x + fieldObject.borderLeft;
  barrierObject.T1.y = barrierT1.y + fieldObject.borderTop;
  barrierObject.T2.x = barrierT2.x + fieldObject.borderLeft;
  barrierObject.T2.y = barrierT2.y + fieldObject.borderTop;
  barrierObject.T3.x = barrierT3.x + fieldObject.borderLeft;
  barrierObject.T3.y = barrierT3.y + fieldObject.borderTop;
  return barrierObject;
}

let findBallPosition = (obj) => { // find current ball position
  let ballVector = new Vector();
  ballObject.currentX = obj.getBoundingClientRect().left;
  ballObject.centerX = ballObject.currentX + ballObject.radius;
  ballObject.currentY = obj.getBoundingClientRect().top;
  ballObject.centerY = ballObject.currentY + ballObject.radius;
  ballVector.x = ballObject.centerX;
  ballVector.y = ballObject.centerY;
  //console.log(ballObject);
  return ballVector;
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

let findCollision = (newParticle, oldParticle) => {
  let oldBallVector = new Vector(oldParticle.x, oldParticle.y);
  let newBallVector = new Vector(newParticle.x, newParticle.y);
  let va = new Vector();
  let vb = new Vector();
  let vc = new Vector();
  const eps = 150;
  let closeToBorder;
  let ballPosition;
  let aux;

  // приближение к барьеру T1 - T2
  va = subsractVectorToVector(newBallVector, barrierObject.T1);   // критерий умножения векторов
  vb = subsractVectorToVector(barrierObject.T2, newBallVector);
  aux = vectorMultiplyVectorToVector(va, vb);
  closeToBorder = aux > 0? aux : -aux;
  //console.log(barrierObject.T1);
  //console.log(newBallVector);
  //console.log(closeToBorder);

  vc = subsractVectorToVector(barrierObject.T2, barrierObject.T1);  // критерий знака скалярного произведения
  ballPosition = scalarMultiplyVectorToVector(va, vc);
  ballPosition *= scalarMultiplyVectorToVector(vb, vc);

  if(closeToBorder <= eps && ballPosition >= 0) {
    // намечается пересечение барьера T1 - T2
    console.log('T1 - T2');
    console.log(closeToBorder);
    console.log(ballPosition);
    console.log(newParticle);
    console.log(barrierObject.T1);
    console.log(barrierObject.T2);
    clearInterval(timerId);
    stopMove = true;
  }

  // приближение к барьеру T2 - T3
  va = subsractVectorToVector(newBallVector, barrierObject.T2);   // критерий умножения векторов
  vb = subsractVectorToVector(barrierObject.T3, newBallVector);
  aux = vectorMultiplyVectorToVector(va, vb);
  closeToBorder = aux > 0? aux : -aux;

  vc = subsractVectorToVector(barrierObject.T3, barrierObject.T2);  // критерий знака скалярного произведения
  ballPosition = scalarMultiplyVectorToVector(va, vc);
  ballPosition *= scalarMultiplyVectorToVector(vb, vc);

  if(closeToBorder <= eps && ballPosition >= 0) {
    // намечается пересечение барьера T2 - T3
    console.log('T2 - T3');
    console.log(closeToBorder);
    console.log(ballPosition);
    console.log(newParticle);
    console.log(barrierObject.T2);
    console.log(barrierObject.T3);
    clearInterval(timerId);
    stopMove = true;
  }

  // приближение к барьеру T3 - T1
  va = subsractVectorToVector(newBallVector, barrierObject.T3);   // критерий умножения векторов
  vb = subsractVectorToVector(barrierObject.T1, newBallVector);
  aux = vectorMultiplyVectorToVector(va, vb);
  closeToBorder = aux > 0? aux : -aux;

  vc = subsractVectorToVector(barrierObject.T1, barrierObject.T3);  // критерий знака скалярного произведения
  ballPosition = scalarMultiplyVectorToVector(va, vc);
  ballPosition *= scalarMultiplyVectorToVector(vb, vc);

  if(closeToBorder <= eps && ballPosition >= 0) {
    // намечается пересечение барьера T3 - T1
    console.log('T3 - T1');
    console.log(closeToBorder);
    console.log(ballPosition);
    console.log(newParticle);
    console.log(barrierObject.T2);
    console.log(barrierObject.T3);
    clearInterval(timerId);
    stopMove = true;
  }
}

let calculateNextStep = (oldParticle) => { // рассчитываю следующую итерацию
  let velocity = new Vector();
  let newParticle = new Particle();
  let gridX0 = fieldObject.borderLeft + ballObject.radius; // границы поля
  let gridY0 = fieldObject.borderTop + ballObject.radius;
  let gridX1 = fieldObject.borderRight - ballObject.radius;
  let gridY1 = fieldObject.borderBottom - ballObject.radius;
  //console.log('calculateNextStep');

  let dx = oldParticle.vx * tt; // прирост координаты
  newParticle.x = oldParticle.x + dx; //
  let dy = oldParticle.vy * tt;
  newParticle.y = oldParticle.y + dy;

  let dvx = 0; //   прирост скорости
  velocity.x = oldParticle.vx + dvx;
  let dvy = gg * tt; // 
  velocity.y = oldParticle.vy + dvy;

  if(newParticle.x <= gridX0) { // to left
    velocity.x = -oldParticle.vx;
  }
  if(newParticle.x >= gridX1) { // to right
    velocity.x = -oldParticle.vx;
  }
  if(newParticle.y <= gridY0) { // to top
    velocity.y = -oldParticle.vy;
  }
  if(newParticle.y >= gridY1) { // to bottom
    velocity.y = -oldParticle.vy;
  }
  if(newParticle.x <= gridX0 && newParticle.y <= gridY0) { // to left top
    velocity.x = -oldParticle.vx;
    velocity.y = -oldParticle.vy;
  }
  if(newParticle.x >= gridX1 && newParticle.y <= gridY0) { // to right top
    velocity.x = -oldParticle.vx;
    velocity.y = -oldParticle.vy;
  }
  if(newParticle.x <= gridX0 && newParticle.y >= gridY1) { // to left bottom
    velocity.x = -oldParticle.vx;
    velocity.y = -oldParticle.vy;
  }
  if(newParticle.x >= gridX1 && newParticle.y >= gridY1) { // to right bottom
    velocity.x = -oldParticle.vx;
    velocity.y = -oldParticle.vy;
  }
  //alert('A!');
  newParticle.vx = velocity.x;
  newParticle.vy = velocity.y;

  findCollision(newParticle, oldParticle); // определяю столкновения с помехой

  return newParticle;
}

let makePing = (clickVector) => { // высвечиваю надпись на время в заданном месте
  let message = document.querySelector('.ping-message');
  console.log('makePing');
  message.classList.add('message-show');
  $(message).offset({top: clickVector.y, left: clickVector.x});
  setTimeout(() => {
    message.classList.remove('message-show');
  }, 4000);

}

let trackBallMovement = (obj, ballVector) => { // render ball movement
  $(obj).offset({top: ballVector.y-ballObject.radius, left: ballVector.x-ballObject.radius});
}

let startMoveBall = (obj, clickVector, startBallVector) => { // движение после начального толчка
  let ballVector = new Vector();
  let newBallVector = new Vector();
  let ballParticle = new Particle();
  let parabParams;
  
  parabParams = findCurvePushParams(clickVector, startBallVector);
  
  let dx = parabParams.vx * parabParams.cosF * tt; // вначале
  ballVector.x = startBallVector.x + dx; // 
  let dy = -parabParams.vy * parabParams.sinF * tt;
  ballVector.y = startBallVector.y + dy; // 
  ballParticle.x = ballVector.x;
  ballParticle.y = ballVector.y;
  ballParticle.vx = parabParams.vx;
  ballParticle.vy = parabParams.vy;

  timerId = setInterval(function() {
    if (stopMove) {
      console.log('render expired');
      clearInterval(timerId);
    } else {
      ballParticle = calculateNextStep(ballParticle);
      trackBallMovement(obj, ballParticle);
      console.log('move');
    }
  }, duration);
  
}

$(document).ready(function() {
  let fieldElement = document.querySelector('.fieldq');
  let ballElement = document.querySelector('.ballq');
  let barrierElement = document.querySelector('.barrier-field'); 
  let ballVector = new Vector();
  //console.log(ballElement);
  //console.log(fieldElement);
  
  detectField(fieldElement);
  getBallSize(ballElement);
  ballVector = putBallOnPosition(ballElement);
  putTriangleOnPosition(barrierElement);

  $('.duration').val(duration);
  $('.smooth').val(tt);
  $('.data-button').click(()=>{
    duration = parseInt($('.duration').val());
    tt = parseFloat($('.smooth').val());
    if (tt > .1) tt = .1;
    });

  $(ballElement).click(function(elem) {
    let clickVector = new Vector(elem.pageX, elem.pageY); // координаты клика
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
    
        ballVector = findBallPosition(ballElement);
        makePing(clickVector);
        startMoveBall(ballElement, clickVector, ballVector);
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
  
      ballVector = findBallPosition(ballElement);
      //console.log(ballObject);
      makePing(clickVector);
      startMoveBall(ballElement, clickVector, ballVector);
    }
    console.log('stage finish');

  });
  
});

// https://basicweb.ru/jquery/jquery_effect_animate.php
// https://www.sql.ru/forum/823024/jquery-animate-proizvolnoe-dvizhenie
// https://javascript.ru/forum/jquery/22657-dvizhenie-obekta-po-krivojj.html
// https://ruseller.com/jquery.php?id=90
// https://overcoder.net/q/961188/jquery-animate-step-%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%B0%D0%B2%D0%BB%D0%B8%D0%B2%D0%B0%D0%B5%D1%82-%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D1%8E
