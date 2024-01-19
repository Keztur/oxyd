import { Ball, ForceField, Rectangle, Square } from './library.js'
import { ctx } from './game.js'

const balls = []
const ForceFields = []
const rectangles = []
const squares = []
const force = 0.01
let BallCount = 0
const debug = true

export function runSim (xMouseVec, yMouseVec, width, height, mode) {
  BallMove(xMouseVec, yMouseVec)
  ForceFieldsImpact()
  BallBallCollision(mode)
  BallWallCollision(width, height)
  BallRectangleCollision()
  BallSquareCollision()

  drawForceFields()
  drawBalls()
  drawRectangles()
  drawSquares()
}

export function addBall () {
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
  BallCount++
}

export function addForceField (x, y, radius) {
  ForceFields.push(new ForceField(x, y, radius))
}

export function addRectangle (x, y, width, height) {
  rectangles.push(new Rectangle(x, y, width, height))
}

export function addSquare (x, y, width) {
  squares.push(new Square(x, y, width))
}

function BallMove (xMouseVec, yMouseVec) {
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

function BallBallCollision (mode) {
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

function BallWallCollision (width, height) {
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

function ForceFieldsImpact () {
  for (let i = 0; i < ForceFields.length; i++) {
    for (let j = 0; j < BallCount; j++) {
      const ff = ForceFields[i]
      const ball = balls[j]
      if ((ball.x - ff.x) ** 2 + (ball.y - ff.y) ** 2 < ff.radius ** 2) {
        ball.xVec += (ff.x - ball.x) * force
        ball.yVec += (ff.y - ball.y) * force
      }
    }
  }
}

function BallRectangleCollision () {
  for (let i = 0; i < rectangles.length; i++) {
    for (let j = 0; j < BallCount; j++) {
      const rect = rectangles[i]
      const ball = balls[j]

      const bx = ball.x
      const by = ball.y
      const rx = rect.x
      const ry = rect.y

      // closest position of ball on rectangle surface (projection)
      const nx = Math.max(rx, Math.min(rx + rect.width, bx))
      const ny = Math.max(ry, Math.min(ry + rect.height, by))

      // skip if out of range
      if (!debug && (bx - nx) ** 2 + (by - ny) ** 2 > ball.radius ** 2) {
        continue
      }

      if (bx === nx && by === ny) { // if center of ball is inside rectangle
        continue // ignore collision (otherwise the following code would not work)
      }

      // Vector between closest position on rectangle and ball center ("pointing vector")
      const xvec = bx - nx
      const yvec = by - ny
      const amount = Math.hypot(xvec, yvec)

      if (debug) {
        drawBall(nx, ny, 3, 'red') // draw projection point
        drawLine(nx, ny, nx + xvec / amount * 100, ny + yvec / amount * 100) // draw pointing vector
        if ((bx - nx) ** 2 + (by - ny) ** 2 > ball.radius ** 2) {
          continue
        }
      }

      // collision check
      if (amount <= ball.radius) {
        // normalized pointing vector
        const xnorm = xvec / amount
        const ynorm = yvec / amount

        const BounceVector = RectangleBounceVector(xnorm, ynorm, ball.xVec, ball.yVec)

        // Solve collision by moving ball along pointing vector out of rectangle collision
        ball.x = nx + xnorm * ball.radius
        ball.y = ny + ynorm * ball.radius

        // reflection (invert ball movement vector)
        ball.xVec -= BounceVector.x
        ball.yVec -= BounceVector.y

        ball.x += ball.xVec
        ball.y += ball.yVec
      }
    }
  }
}

function RectangleBounceVector (xnorm, ynorm, xVec, yVec) {
  // tangent vector
  const xTan = ynorm
  const yTan = -xnorm
  // drawLine(nx, ny, nx + xTan * 100, ny + yTan * 100) // draw tangent vector

  // velocity vector component parallel to tangent
  const length = xVec * xTan + yVec * yTan // dot product of relative vel vector and tangent vector

  // calculate perpendicular vector component (bounce vector)
  const xVertical = (xVec - xTan * length) * 2
  const yVertical = (yVec - yTan * length) * 2

  return { x: xVertical, y: yVertical }
}

function BallSquareCollision () {
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < BallCount; j++) {
      const square = squares[i]
      const ball = balls[j]

      const bx = ball.x
      const by = ball.y
      const rx = square.x
      const ry = square.y
      const width = square.width
      const edgeRadius = width / 5

      // closest position of ball on surface (projection)
      let nx = Math.max(rx, Math.min(rx + width, bx))
      let ny = Math.max(ry, Math.min(ry + width, by))

      // skip if out of range
      if (!debug && (bx - nx) ** 2 + (by - ny) ** 2 > ball.radius ** 2) {
        continue
      }

      if (bx === nx && by === ny) { // if center of ball is inside rectangle
        continue // ignore collision (otherwise the following code would not work)
      }

      const nUpdate = EdgeCorrection(nx, ny, rx, ry, bx, by, edgeRadius, width)
      nx = nUpdate.x
      ny = nUpdate.y

      // Vector between closest position on rectangle and ball center ("pointing vector")
      const xvec = bx - nx
      const yvec = by - ny
      const amount = Math.hypot(xvec, yvec)

      if (debug) {
        drawBall(nx, ny, 3, 'red') // draw projection point
        drawLine(nx, ny, nx + xvec / amount * 100, ny + yvec / amount * 100) // draw pointing vector
        if ((bx - nx) ** 2 + (by - ny) ** 2 > ball.radius ** 2) {
          continue
        }
      }

      // collision check
      if (amount <= ball.radius) {
        // normalized pointing vector
        const xnorm = xvec / amount
        const ynorm = yvec / amount

        const BounceVector = RectangleBounceVector(xnorm, ynorm, ball.xVec, ball.yVec)

        // Solve collision by moving ball along pointing vector out of rectangle collision
        ball.x = nx + xnorm * ball.radius
        ball.y = ny + ynorm * ball.radius

        // reflection (invert ball movement vector)
        ball.xVec -= BounceVector.x
        ball.yVec -= BounceVector.y
      }
    }
  }
}

function EdgeCorrection (nx, ny, rx, ry, bx, by, edgeRadius, width) {
  let xEdge = 0
  let yEdge = 0

  // is closest point in any of the 4 edges (quarters)?
  if (nx < rx + edgeRadius) {
    xEdge = rx + edgeRadius
  } else if (nx > rx + width - edgeRadius) {
    xEdge = rx + width - edgeRadius
  }

  if (ny < ry + edgeRadius) {
    yEdge = ry + edgeRadius
  } else if (ny > ry + width - edgeRadius) {
    yEdge = ry + width - edgeRadius
  }

  // if closest point is in any of the 4 rounded edges: update nx, ny
  if (xEdge !== 0 && yEdge !== 0) {
    // calculate vector from center of "edge spheres" to center of ball
    const xEdgeVec = bx - xEdge
    const yEdgeVec = by - yEdge

    const EdgeVecAmount = Math.hypot(xEdgeVec, yEdgeVec)
    const EdgeFactor = EdgeVecAmount / edgeRadius

    nx = xEdge + xEdgeVec / EdgeFactor
    ny = yEdge + yEdgeVec / EdgeFactor
  }
  return { x: nx, y: ny }
}

function drawBalls () {
  for (let i = 0; i < BallCount; i++) {
    drawBall(balls[i].x, balls[i].y, balls[i].radius, balls[i].color)
  }
}

function drawBall (x, y, radius, color) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 6.2831)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

export function drawLine (xFrom, yFrom, xTo, yTo) {
  ctx.beginPath() // Start a new path
  ctx.moveTo(xFrom, yFrom) // Move the pen to (30, 50)
  ctx.lineTo(xTo, yTo) // Draw a line to (150, 100)
  ctx.stroke() // Render the path
}

function drawForceFields () {
  for (let i = 0; i < ForceFields.length; i++) {
    drawForceField(ForceFields[i])
  }
}

function drawForceField (ff) {
  const x = ff.x
  const y = ff.y

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, ff.radius)
  gradient.addColorStop(0, 'black')
  gradient.addColorStop(1, 'white')

  ctx.beginPath()
  ctx.arc(x, y, ff.radius, 0, 6.2813)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.closePath()
}

function drawRectangles () {
  for (let i = 0; i < rectangles.length; i++) {
    drawRectangle(rectangles[i])
  }
}

function drawRectangle (r) {
  ctx.fillStyle = 'black'
  ctx.fillRect(r.x, r.y, r.width, r.height)
}

function drawSquares () {
  for (let i = 0; i < squares.length; i++) {
    drawSquare(squares[i])
  }
}

function drawSquare (r) {
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.roundRect(r.x, r.y, r.width, r.width, r.width / 5)
  ctx.fill()
  ctx.closePath()
}
