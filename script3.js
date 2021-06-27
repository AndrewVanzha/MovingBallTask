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
let barrierT1 = new Vector(240, 220); // координаты точек треугольника - препятствия
let barrierT2 = new Vector(90, 300); 
let barrierT3 = new Vector(270, 350); 
let barrierObject = {
  'T1': new Vector,
  'T2': new Vector,
  'T3': new Vector,
}
let timerId; // ball render timer id
let pushForce = .01 * 9;
let tt = pushForce; // параметрическое время

let ix = 0;
let stopMove = false; // признак останова цикла
//window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const duration = 10; // milliseconds
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

let findPushParams = (pushVector, centerCoords, speedScale) => { // find initial push parameters
  let ballParticle = new Particle();
  let ballVector = new Vector();
  let ballVelocity = new Vector();

  ballVector = addVectorToVector(centerCoords, centerCoords); // vR1 = vR0 + vR0 - vPush
  ballVector = subsractVectorToVector(ballVector, pushVector);
  ballVelocity = subsractVectorToVector(centerCoords, pushVector); // v = sS . (vR0 - vPush)
  ballVelocity = multiplyScalarToVector(speedScale, ballVelocity);
  ballParticle.x = ballVector.x;  // начальный толчок
  ballParticle.y = ballVector.y;
  ballParticle.vx = ballVelocity.x;
  ballParticle.vy = ballVelocity.y;

  return ballParticle;
}

let ballCrossTriangleBorder = (newBallVector, triangleVector1, triangleVector2, eps) => { // find collision
  let vR = new Vector();
  let arrVr = Array();
  let qw = Math.sqrt(2) / 2;
  let sw = Math.sqrt(3) / 2;
  let rr = ballObject.radius;
  let cross = false;

  let vr0 = new Vector(rr, 0);   // опрос ближайших окрестностей мяча
  arrVr.push(vr0);
  //let vr1 = new Vector(qw*rr, -qw*rr);
  let vr1 = new Vector(sw*rr, -.5*rr);
  arrVr.push(vr1);
  //let vr2 = new Vector(0, -rr);
  let vr2 = new Vector(.5*rr, -sw*rr);
  arrVr.push(vr2);
  //let vr3 = new Vector(-qw*rr, -qw*rr);
  let vr3 = new Vector(0, -rr);
  arrVr.push(vr3);
  //let vr4 = new Vector(-rr, 0);
  let vr4 = new Vector(-.5*rr, -sw*rr);
  arrVr.push(vr4);
  //let vr5 = new Vector(-qw*rr, qw*rr);
  let vr5 = new Vector(-sw*rr, -.5*rr);
  arrVr.push(vr5);
  //let vr6 = new Vector(0, rr);
  let vr6 = new Vector(-rr, 0);
  arrVr.push(vr6);
  //let vr7 = new Vector(qw*rr, qw*rr);
  let vr7 = new Vector(-sw*rr, .5*rr);
  arrVr.push(vr7);
  let vr8 = new Vector(-.5*rr, sw*rr);
  arrVr.push(vr8);
  let vr9 = new Vector(0, rr);
  arrVr.push(vr9);
  let vr10 = new Vector(.5*rr, sw*rr);
  arrVr.push(vr10);
  let vr11 = new Vector(sw*rr, .5*rr);
  arrVr.push(vr11);

  for(let ii=0; ii<arrVr.length; ii++) {
    vR = addVectorToVector(newBallVector, arrVr[ii]);
    cross = crossTriangleBorder(vR, triangleVector1, triangleVector2, eps);
    if(cross) break;
  }
  return cross;
}

let doCollision = (newParticle, oldParticle) => { // рассчет параметров движения при столкновении с чем-либо
  let realParticle = new Particle();
  let newBallVector = new Vector(newParticle.x, newParticle.y);
  let vc = new Vector();
  const eps = 500;

  realParticle = newParticle;

  // приближение к барьеру T1 - T2
  if(ballCrossTriangleBorder(newBallVector, barrierObject.T1, barrierObject.T2, eps)) {
    // намечается пересечение барьера T1 - T2
    console.log('T1 - T2');
    vc = subsractVectorToVector(barrierObject.T2, barrierObject.T1);  // 
    realParticle = rejectVectorInCollision(oldParticle, vc);  // calculate velocity after collision
    return realParticle;
  }

  // приближение к барьеру T2 - T3
  if(ballCrossTriangleBorder(newBallVector, barrierObject.T2, barrierObject.T3, eps)) {
    // намечается пересечение барьера T2 - T3
    console.log('T2 - T3');
    vc = subsractVectorToVector(barrierObject.T3, barrierObject.T2);  // 
    realParticle = rejectVectorInCollision(oldParticle, vc);  // calculate velocity after collision
    return realParticle;
  }

  // приближение к барьеру T3 - T1
  if(ballCrossTriangleBorder(newBallVector, barrierObject.T3, barrierObject.T1, eps)) {
    // намечается пересечение барьера T3 - T1
    console.log('T3 - T1');
    vc = subsractVectorToVector(barrierObject.T1, barrierObject.T3);  // 
    realParticle = rejectVectorInCollision(oldParticle, vc);  // calculate velocity after collision
    return realParticle;
  }

  return realParticle;
}

let calculateNextStep = (oldParticle) => { // рассчитываю следующую итерацию
  let position = new Vector();
  let velocity = new Vector();
  let newParticle = new Particle();
  let gridX0 = fieldObject.borderLeft + ballObject.radius; // границы поля
  let gridY0 = fieldObject.borderTop + ballObject.radius;
  let gridX1 = fieldObject.borderRight - ballObject.radius;
  let gridY1 = fieldObject.borderBottom - ballObject.radius;
  //console.log('calculateNextStep');

  let dx = oldParticle.vx * tt; // прирост координаты
  position.x = oldParticle.x + dx; //
  let dy = oldParticle.vy * tt;
  position.y = oldParticle.y + dy;

  let dvx = 0; //   прирост скорости
  velocity.x = oldParticle.vx + dvx;
  let dvy = gg * tt; // 
  velocity.y = oldParticle.vy + dvy;

  if(position.x <= gridX0) { // cross left
    velocity.x = -oldParticle.vx; // move back
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.x >= gridX1) { // cross right
    velocity.x = -oldParticle.vx; // move back
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.y <= gridY0) { // cross top
    velocity.y = -oldParticle.vy; // move back
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.y >= gridY1) { // cross bottom
    velocity.y = -oldParticle.vy; // move back
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.x <= gridX0 && position.y <= gridY0) { // to left top
    velocity.x = -oldParticle.vx; // move back
    velocity.y = -oldParticle.vy;
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.x >= gridX1 && position.y <= gridY0) { // to right top
    velocity.x = -oldParticle.vx; // move back
    velocity.y = -oldParticle.vy;
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.x <= gridX0 && position.y >= gridY1) { // to left bottom
    velocity.x = -oldParticle.vx; // move back
    velocity.y = -oldParticle.vy;
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  if(position.x >= gridX1 && position.y >= gridY1) { // to right bottom
    velocity.x = -oldParticle.vx; // move back
    velocity.y = -oldParticle.vy;
    position.x = oldParticle.x; // stay on place
    position.y = oldParticle.y;
  }
  //alert('A!');
  newParticle.x = position.x;
  newParticle.y = position.y;
  newParticle.vx = velocity.x;
  newParticle.vy = velocity.y;

  newParticle = doCollision(newParticle, oldParticle); // определяю столкновения с помехой

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
  let ballParticle = new Particle();
  const speedScale = 2; // масштаб начальной скорости
  
  ballParticle = findPushParams(clickVector, startBallVector, speedScale);  // начальный толчок

  timerId = setInterval(function() {
    if (stopMove) {
      console.log('render stop');
      clearInterval(timerId);
    } else {
      ballParticle = calculateNextStep(ballParticle);
      trackBallMovement(obj, ballParticle);
      //console.log('move');
    }
  }, duration);
  
}

$(document).ready(function() {
  let fieldElement = document.querySelector('.fieldq');
  let ballElement = document.querySelector('.ballq');
  let barrierElement = document.querySelector('.barrier-field'); 
  let ballVector = new Vector();
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
    let pos = $(this).offset();  // координаты верхней правой точки мяча
    $('.duration').prop( "disabled", true );
    $('.smooth').prop( "disabled", true );
    $('.data-button').css("opacity","0.5");;
    if(timerId !== undefined) { // мяч уже в движении
      clearInterval(timerId);
      console.log('suspend');
      stopMove = true;
      setTimeout(() => {
        stopMove = false;
        $('.stop-button').click(function() { // остановка движения по кнопке
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
      $('.stop-button').click(function() { // остановка движения по кнопке
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
