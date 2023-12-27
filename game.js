import { runSim, addBall, addForceField } from './simulation.js'

const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

let xMouse = 0
let yMouse = 0
let xLastMouse = 0
let yLastMouse = 0

let width = 10
let height = 10

let mode = 2 // 1:bubbles, 2:rigid

resizeCanvas()

// let field = [0, 0]

// let forcePos = [{x: 314, y: 384}, {x: 628, y: 384}]
// let mouseDown = false

// let OffsetX = 0
// let OffsetY = 0

// start game render cycle
setInterval(simulation, 10)

setTimeout(() => document.getElementById('hint').remove(), 5000)

// ### FUNCTIONS ######################################
function simulation () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const xMouseVec = xMouse - xLastMouse
  const yMouseVec = yMouse - yLastMouse

  runSim(xMouseVec, yMouseVec, width, height, ctx, mode)

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

// function drawCenter(color: string, x: number, y: number, size: number) {
//     ctx.beginPath();
//     ctx.arc(x, y, size, 0, Math.PI*2);
//     ctx.fillStyle = color;
//     ctx.fill();
//     ctx.closePath();
// }

// function inRadius(ax:number, bx:number, ay:number, by:number, radius:number) {

//     let distance = Math.sqrt(Math.pow(ax-bx, 2) + Math.pow(ay-by, 2))
//     // console.log(Math.round(distance))
//     return  distance < radius

// }

// function ForceField(center_x:number, center_y:number, x_new:number, y_new:number, x:number, y:number, center_force:number, size:number) {

//     drawCenter('#539CAE', center_x, center_y, size)

//     if (inRadius(x, center_x, y, center_y, size)) {
//         x_new += center_force * (center_x-x)
//         y_new += center_force * (center_y-y)
//     }

//     return [x_new, y_new]
// }

// function reflect() {

//     if (x < ballRadius || x > width - ballRadius) {
//         x_invert = -1
//     } else {
//         x_invert = 1
//     }

//     if (y < ballRadius || y > height - ballRadius) {
//         y_invert = -1
//     } else {
//         y_invert = 1
//     }

// }

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
