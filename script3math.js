class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Particle extends Vector {
  constructor(x, y, vx, vy) {
    super(x , y),
    this.vx = vx;
    this.vy = vy;
  }
}

let moduleOfVector = (vector) => { // модуль вектора
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

let multiplyScalarToVector = (scalar, vector) => { // умножение вектора на скаляр
  let mult = new Vector();
  mult.x = scalar * vector.x;
  mult.y = scalar * vector.y;
  return mult;
}

let addVectorToVector = (a, b) => { // сложение 2-х векторов a + b
  let sum = new Vector();
  sum.x = a.x + b.x;
  sum.y = a.y + b.y;
  return sum;
}

let scalarMultiplyVectorToVector = (a, b) => { // скалярное умножение 2-х векторов a * b
  return (a.x * b.x + a.y * b.y);
}

let vectorMultiplyVectorToVector = (a, b) => { // векторное умножение 2-х векторов a * b
  return (a.x * b.y - a.y * b.x);
}

let subsractVectorToVector = (a, b) => { // вычитание 2-х векторов a - b
  let subs = new Vector();
  subs.x = a.x - b.x;
  subs.y = a.y - b.y;
  return subs;
}

let multiplyMatrixToVector = (matrix, vector) => { // умножение матрицы на вектор
  let mult = {
    'x': matrix.m11 * vector.x + matrix.m12 * vector.y,
    'y': matrix.m21 * vector.x + matrix.m22 * vector.y,
  }
  return mult;
}

let crossTriangleBorder = (newBallVector, triangleVector1, triangleVector2, eps) => { // find collision
  let va = new Vector();
  let vb = new Vector();
  let vc = new Vector();
  let ballPosition;
  let closeToBorder;
  let aux;

  va = subsractVectorToVector(newBallVector, triangleVector1);   // критерий умножения векторов
  vb = subsractVectorToVector(triangleVector2, newBallVector);   // | va * vb | < eps
  aux = vectorMultiplyVectorToVector(va, vb);
  closeToBorder = aux > 0? aux : -aux;

  vc = subsractVectorToVector(barrierObject.T2, barrierObject.T1);  // критерий знака скалярного произведения
  ballPosition = scalarMultiplyVectorToVector(va, vc);    // (va . vc) . (vb . vc) > 0
  ballPosition *= scalarMultiplyVectorToVector(vb, vc);

  if(closeToBorder <= eps && ballPosition >= 0) {
    // намечается пересечение барьера T1 - T2
    //console.log(closeToBorder);
    return true;
  }
  return false;
}

let rejectVectorInCollision = (oldParticle, vc) => {  // calculate particle velocity after collision with vc
  let realParticle = new Particle();
  let oldBallVelocity = new Vector(oldParticle.vx, oldParticle.vy);
  let vu = new Vector();
  let aux;
  let L;

  realParticle.x = oldParticle.x;  // stay on place
  realParticle.y = oldParticle.y;
  L = scalarMultiplyVectorToVector(oldBallVelocity, vc);  // L = (v_old . vc)
  aux = 2 * L / scalarMultiplyVectorToVector(vc, vc);     // v_new = 2 * L / (vc . vc) . vc - v_old
  vu = multiplyScalarToVector(aux, vc);
  vu = subsractVectorToVector(vu, oldBallVelocity);
  realParticle.vx = vu.x;
  realParticle.vy = vu.y;

  return realParticle;
}
