import { runSim, addBall, addForceField, addRectangle, addSquare, drawLine } from './simulation.js'

const canvas = document.getElementById('myCanvas')
export const ctx = canvas.getContext('2d')

let xMouse = 0
let yMouse = 0
let xLastMouse = 0
let yLastMouse = 0
let xMouseStartDrag = 0
let yMouseStartDrag = 0

let width = 10
let height = 10

let mode = 2 // 1:bubbles, 2:rigid
let obstacle = ''
let drag = false

resizeCanvas()

// start game render cycle
setInterval(simulation, 10)

let dragIntervalID = 0

setTimeout(() => document.getElementById('hint').remove(), 8000)

function drawObstacle () {
  switch (obstacle) {
    case 'force':
      drawLine(xMouseStartDrag, yMouseStartDrag, xMouse, yMouse)
      break
    case 'rect':
    case 'square':
      drawRectLine()
      break
  }
}

window.ChangeObstacle = ChangeObstacle

canvas.addEventListener('mousedown', (evt) => {
  xMouseStartDrag = xMouse
  yMouseStartDrag = yMouse

  if (obstacle) {
    drag = true
    dragIntervalID = setInterval(drawObstacle, 10)
  }
})

window.addEventListener('mousemove', (evt) => {
  if (xMouse === 0) {
    xLastMouse = evt.clientX
    yLastMouse = evt.clientY
  }

  xMouse = evt.clientX
  yMouse = evt.clientY
}, false)

window.addEventListener('mouseup', (evt) => {
  if (drag) {
    drag = false
    clearInterval(dragIntervalID)
    switch (obstacle) {
      case 'force':
        addFF()
        break
      case 'rect':
        addRect()
        break
      case 'square':
        addSquare(xMouse, yMouse, 50)
        break
    }
  }
})

function addRect () {
  const width = xMouse - xMouseStartDrag
  const height = yMouse - yMouseStartDrag
  if (width > 1 && height > 1) {
    addRectangle(xMouseStartDrag, yMouseStartDrag, width, height)
  }
}

function addFF () {
  const radius = Math.hypot(xMouse - xMouseStartDrag, yMouse - yMouseStartDrag)
  if (radius > 1) {
    addForceField(xMouseStartDrag, yMouseStartDrag, radius)
  }
}

window.addEventListener('resize', resizeCanvas, false)

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      addBall()
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

// ### FUNCTIONS ######################################
function simulation () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const xMouseVec = xMouse - xLastMouse
  const yMouseVec = yMouse - yLastMouse

  runSim(xMouseVec, yMouseVec, width, height, mode)

  xLastMouse = xMouse
  yLastMouse = yMouse
}

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  width = canvas.width
  height = canvas.height
}

function setModeHint (mode) {
  const HintNode = document.getElementById('mode')
  if (HintNode) {
    HintNode.innerHTML = mode + ' collision activated'
    setTimeout(() => HintNode.innerHTML = '', 5000)
  }
}

function ChangeObstacle (type) {
  Array.from(document.getElementsByClassName('active')).forEach(el => el.classList.remove('active'))

  if (obstacle === type) {
    obstacle = ''
    document.body.style.cursor = ''
  } else {
    obstacle = type
    document.getElementById(type).classList.add('active')
    document.body.style.cursor = 'crosshair'
  }
}

function drawRectLine () {
  if (xMouse > xMouseStartDrag && yMouse > yMouseStartDrag) {
    ctx.strokeStyle = 'black'
    ctx.strokeRect(xMouseStartDrag, yMouseStartDrag, xMouse - xMouseStartDrag, yMouse - yMouseStartDrag)
  }
}
