import { runSim, addBall, addForceField, addRectangle, addSquare } from './simulation.js'

const canvas = document.getElementById('myCanvas')
export const ctx = canvas.getContext('2d')

let xMouse = 0
let yMouse = 0
let xLastMouse = 0
let yLastMouse = 0

let width = 10
let height = 10

let mode = 2 // 1:bubbles, 2:rigid
let Obstacle = ''

resizeCanvas()

// start game render cycle
setInterval(simulation, 10)

setTimeout(() => document.getElementById('hint').remove(), 8000)

// ### FUNCTIONS ######################################
function simulation () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const xMouseVec = xMouse - xLastMouse
  const yMouseVec = yMouse - yLastMouse

  runSim(xMouseVec, yMouseVec, width, height, mode)

  xLastMouse = xMouse
  yLastMouse = yMouse
}

// move ball
window.addEventListener('mousemove', (evt) => {
  if (xMouse === 0) {
    xLastMouse = evt.clientX
    yLastMouse = evt.clientY
  }

  xMouse = evt.clientX
  yMouse = evt.clientY
}, false)

window.addEventListener('resize', resizeCanvas, false)

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  width = canvas.width
  height = canvas.height
}

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      addBall()
      break
    case 'f':
      addForceField(xMouse, yMouse)
      break
    case 'g':
      addRectangle(xMouse, yMouse, 100, 100)
      break
    case 'h':
      addSquare(xMouse, yMouse, 50)
      break
    case 'b':
      mode = 1
      setModeHint('bubble')
      break
    case 'r':
      mode = 2
      setModeHint('rigid')
      break
  }
})

function setModeHint (mode) {
  const HintNode = document.getElementById('mode')
  if (HintNode) {
    HintNode.innerHTML = mode + ' collision activated'
    setTimeout(() => HintNode.innerHTML = '', 5000)
  }
}

function ChangeObstacle (type) {
  Array.from(document.getElementsByClassName('active')).forEach(el => el.classList.remove('active'))

  if (Obstacle === type) {
    Obstacle = ''
    document.body.style.cursor = ''
  } else {
    Obstacle = type
    document.getElementById(type).classList.add('active')
    document.body.style.cursor = 'crosshair'
  }
}
window.ChangeObstacle = ChangeObstacle

canvas.addEventListener('mousedown', (evt) => {
  switch (Obstacle) {
    case 'force':
      addForceField(xMouse, yMouse)
      break
    case 'rect':
      addRectangle(xMouse, yMouse, 100, 100)
      break
    case 'square':
      addSquare(xMouse, yMouse, 50)
      break
  }
})

// window.addEventListener("mousemove", (evt) => {

//     let mousePos = getMousePos(canvas, evt);

//     if (mouseDown) {
//         if (inRadius(mousePos.x, forcePos[0].x, mousePos.y, forcePos[0].y, 50)) {
//             forcePos[0].x = mousePos.x + OffsetX
//             forcePos[0].y = mousePos.y + OffsetY
//         } else if (inRadius(mousePos.x, forcePos[1].x, mousePos.y, forcePos[1].y, 50)) {
//             forcePos[1].x = mousePos.x + OffsetX
//             forcePos[1].y = mousePos.y + OffsetY
//         }
//     }

//     xLastMouse = xMouse
//     yLastMouse = yMouse

//     xMouse = evt.clientX
//     yMouse = evt.clientY

// }, false);

// canvas.addEventListener("mousedown", (evt) => {

//     let mousePos = getMousePos(canvas, evt);

//     if (inRadius(mousePos.x, forcePos[0].x, mousePos.y, forcePos[0].y, 50)) {
//         OffsetX = forcePos[0].x - mousePos.x
//         OffsetY = forcePos[0].y - mousePos.y
//     } else if (inRadius(mousePos.x, forcePos[1].x, mousePos.y, forcePos[1].y, 50)) {
//         OffsetX = forcePos[1].x - mousePos.x
//         OffsetY = forcePos[1].y - mousePos.y
//     }

//     mouseDown = true

// }, false);

// canvas.addEventListener("mouseup", function (evt) {
//     mouseDown = false
// }, false);

// //Get Mouse Position
// function getMousePos(canvas: HTMLCanvasElement, evt:MouseEvent) {
//     let rect = canvas.getBoundingClientRect();
//     return {
//         x: evt.clientX - rect.left,
//         y: evt.clientY - rect.top
//     };
// }
