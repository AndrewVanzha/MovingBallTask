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

let crossTriangleBorder = (ballCoords, triangleVector1, triangleVector2) => {
  let res = 0; // минимизировать R * T2 - T1 * T2 + T1 * R (векторные произведения)
  res = vectorMultiplyVectorToVector(ballCoords, triangleVector2);
  res -= vectorMultiplyVectorToVector(triangleVector1, triangleVector2);
  res += vectorMultiplyVectorToVector(triangleVector1, ballCoords);
  return res;
}

let rejectVectorInCollision = (velocity, triangleVector1, triangleVector2) => {
  let c = new Vector();
  let res = new Vector();
  c = subsractVectorToVector(triangleVector1, triangleVector2); // c = T2 - T1
  let L = scalarMultiplyVectorToVector(velocity, c);    // L = v . c
  let du = 2 * L / (scalarMultiplyVectorToVector(c, c));
  let cc = multiplyScalarToVector(du, c);   // 2 * L / c2 . c - v
  res = subsractVectorToVector(cc, vector);

  return res;
}
