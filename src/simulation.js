import { Ball, ForceField } from './library.js'

const balls = []
const ForceFields = []

const ff_Radius = 50
const force = 0.1

export function runSim (xMouseVec, yMouseVec, width, height, ctx, mode) {
  
  const BallCount = balls.length

  BallMove(xMouseVec, yMouseVec, BallCount)
  ForceFieldsImpact(BallCount)
  BallBallCollision(mode, BallCount)
  BallWallCollision(width, height, BallCount)
  
  drawForceFields(ctx)
  drawBalls(ctx, BallCount)
}

export function addBall () {
  const BallCount = balls.length
  let values = []

  switch (BallCount) {
    case 0: values = [700.0, 200.0, 0.0, 0.0, 50.0]
      break
    case 1: values = [100.0, 200.0, 7.0, 0.0, 15.0]
      break
    case 2: values = [700.0, 300.0, -7.0, 0.0, 50.0]
      break
    case 3: values = [100.0, 300.0, 5.0, 1.0, 15.0]
      break
    default: values = [50.0, 50.0, Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)]
  }

  const ball = new Ball(values[0], values[1], values[2], values[3], values[4])
  balls.push(ball)
}

export function addForceField (x, y) {
  ForceFields.push(new ForceField(x, y))
}

function drawForceFields (ctx) {
  for (let i = 0; i < ForceFields.length; i++) {
    drawForceField(ForceFields[i], ctx)
  }
}

function ForceFieldsImpact (BallCount) {
  for (let i = 0; i < ForceFields.length; i++) {
    for (let j = 0; j < BallCount; j++) {
      const ff = ForceFields[i]
      const ball = balls[j]

      if ((ball.x - ff.x) ** 2 + (ball.y - ff.y) ** 2 < ffRadius ** 2) {
        ball.xVec += (ff.x - ball.x) * force
        ball.yVec += (ff.y - ball.y) * force
      }
    }
  }
}

function BallMove (xMouseVec, yMouseVec, BallCount) {
  const friction = 0.994
  const force = 0.1

  // move ball loop
  for (let i = 0; i < BallCount; i++) {
    const xVec = (balls[i].xVec * friction) + (xMouseVec * force)
    const yVec = (balls[i].yVec * friction) + (yMouseVec * force)

    balls[i].xVec = xVec
    balls[i].yVec = yVec

    balls[i].x += xVec
    balls[i].y += yVec
  }
}

function BallWallCollision (width, height, BallCount) {
  // ball-wall collision check
  for (let i = 0; i < BallCount; i++) {
    let reflected = [0, 0]

    reflected = reflect(balls[i].x, balls[i].xVec, balls[i].radius, width - balls[i].radius)
    balls[i].x = reflected[0]
    balls[i].xVec = reflected[1]

    reflected = reflect(balls[i].y, balls[i].yVec, balls[i].radius, height - balls[i].radius)
    balls[i].y = reflected[0]
    balls[i].yVec = reflected[1]
  }
}

function drawBalls (ctx, BallCount) {
  for (let i = 0; i < BallCount; i++) {
    drawBall(ctx, balls[i].x, balls[i].y, balls[i].radius, balls[i].color)
  }
}

function BallBallCollision (mode, BallCount) {
  // ball-ball collision check

  // loop through all balls
  for (let i = 0; i < BallCount; i++) {
    // loop through "all" balls again (skipping all duplicate combinations)
    for (let j = i + 1; j < BallCount; j++) {
      // check for balls intersection
      if ((balls[i].x - balls[j].x) ** 2 + (balls[i].y - balls[j].y) ** 2 < (balls[i].radius + balls[j].radius) ** 2) {
        // reset balls to position before collision
        balls[i].x = balls[i].x - balls[i].xVec
        balls[i].y = balls[i].y - balls[i].yVec
        balls[j].x = balls[j].x - balls[j].xVec
        balls[j].y = balls[j].y - balls[j].yVec

        // calculate collision vector
        let xColvec = balls[i].x - balls[j].x
        let yColvec = balls[i].y - balls[j].y

        // //get amount of collision vector
        const ColvecAmount = Math.hypot(xColvec, yColvec)

        // normalize collision vector
        xColvec = xColvec / ColvecAmount
        yColvec = yColvec / ColvecAmount

        if (mode === 1) { // BUBBLES
          // get amount auf (velocity) vector for each ball
          const iBallAmount = Math.hypot(balls[i].xVec, balls[i].yVec)
          const jBallAmount = Math.hypot(balls[j].xVec, balls[j].yVec)

          balls[i].xVec += (xColvec * iBallAmount) * 0.4 + (xColvec * jBallAmount) * 0.4
          balls[i].yVec += (yColvec * iBallAmount) * 0.4 + (yColvec * jBallAmount) * 0.4
          balls[j].xVec -= (xColvec * jBallAmount) * 0.4 + (xColvec * iBallAmount) * 0.4
          balls[j].yVec -= (yColvec * jBallAmount) * 0.4 + (yColvec * iBallAmount) * 0.4
        } else { // RIGID
          // mass calculation (not working)
          // let mi = (balls[i].radius / 2.0).powi(2) * PI;
          // let mj = (balls[j].radius / 2.0).powi(2) * PI;
          // let m = mi + mj;

          // moves balls away from each other (intersection prevention)
          const intersection = balls[i].radius + balls[j].radius - ColvecAmount
          const OffsetFactor = intersection / 2.0

          balls[i].x += xColvec * OffsetFactor
          balls[i].y += yColvec * OffsetFactor
          balls[j].x -= xColvec * OffsetFactor
          balls[j].y -= yColvec * OffsetFactor

          // https://flatredball.com/documentation/tutorials/math/circle-collision/ ####################

          // get tangent vector
          let xTan = balls[j].y - balls[i].y
          let yTan = -(balls[j].x - balls[i].x)

          const TanAmount = Math.hypot(xTan, yTan) // needed for normalization

          // normalize collision tangent
          xTan = xTan / TanAmount
          yTan = yTan / TanAmount

          // get relative speed of balls to each other
          const relx = balls[j].xVec - balls[i].xVec
          const rely = balls[j].yVec - balls[i].yVec

          // velocity vector component parallel to tangent
          const length = relx * xTan + yTan * rely // dot product of relative vel vector and tangent vector

          // calculate tangential vector component
          const xTangent = xTan * length
          const yTangent = yTan * length

          // calculate perpendicular vector component (bounce vector)
          const xVertical = relx - xTangent
          const yVertical = rely - yTangent

          balls[i].xVec += xVertical
          balls[i].yVec += yVertical
          balls[j].xVec -= xVertical
          balls[j].yVec -= yVertical
        }

        // set new ball positions (with new vector)
        balls[i].x += balls[i].xVec
        balls[i].y += balls[i].yVec
        balls[j].x += balls[j].xVec
        balls[j].y += balls[j].yVec
      }
    }
  }
}

function reflect (pos, vec, radius, border) {
  if (pos < radius) { // collision with low border (left or up)
    pos = radius - (pos - radius)
    vec = -vec
  } else if (pos > border) { // collision with high border (right or bottom)
    pos = border - (pos - border)
    vec = -vec
  }
  return [pos, vec]
}

function drawBall (ctx, x, y, radius, color) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 6.2831)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

function drawForceField (ff, ctx) {
  const x = ff.x
  const y = ff.y

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, ffRadius)
  gradient.addColorStop(0, 'black')
  gradient.addColorStop(1, 'white')

  ctx.beginPath()
  ctx.arc(x, y, 60, 0, 6.2813)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.closePath()
}
