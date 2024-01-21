import { runSim, addBall, addForceField, addRectangle, addSquare } from './simulation.js'

const canvas = document.getElementById('myCanvas')
export const ctx = canvas.getContext('2d')

export let xMouse = 0
export let yMouse = 0
let xLastMouse = 0
let yLastMouse = 0
let xMouseStartDrag = 0
let yMouseStartDrag = 0

let width = 10
let height = 10

let hint = true
let mode = 2 // 1:bubbles, 2:rigid
let obstacle = ''
export let drag = false
export let mousedown = false

resizeCanvas()

// firefox issue after reloading
document.getElementById('shading').checked = false
document.getElementById('debug').checked = false

setInterval(simulation, 10) // game render cycle

canvas.addEventListener('mousedown', (evt) => {
  mousedown = true
  xMouseStartDrag = xMouse
  yMouseStartDrag = yMouse

  if (obstacle) {
    if (obstacle === 'square') {
      addSquare(xMouse, yMouse, 50)
    } else {
      drag = true
    }
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
  mousedown = false
  if (drag) {
    drag = false
    switch (obstacle) {
      case 'force':
        addFF()
        break
      case 'rect':
        addRect()
        break
    }
  }
})

window.addEventListener('resize', resizeCanvas, false)

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      addBall()
      if (hint) {
        document.getElementById('hint').remove()
        hint = false
      }
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

  if (drag) {
    drawObstacle()
  }
}

function drawObstacle () {
  switch (obstacle) {
    case 'force':
      drawLine(xMouseStartDrag, yMouseStartDrag, xMouse, yMouse)
      break
    case 'rect':
      drawRectLine()
      break
  }
}

function addRect () {
  const width = xMouse - xMouseStartDrag
  const height = yMouse - yMouseStartDrag
  if (width > 5 && height > 5) {
    addRectangle(xMouseStartDrag, yMouseStartDrag, width, height)
  }
}

function addFF () {
  const radius = Math.hypot(xMouse - xMouseStartDrag, yMouse - yMouseStartDrag)
  if (radius > 5) {
    addForceField(xMouseStartDrag, yMouseStartDrag, radius)
  }
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

window.ChangeObstacle = ChangeObstacle // connect click-event with function

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
    ctx.strokeStyle = '#ff0000'
    ctx.setLineDash([10, 10])
    ctx.strokeRect(xMouseStartDrag, yMouseStartDrag, xMouse - xMouseStartDrag, yMouse - yMouseStartDrag)
  }
}

function drawLine (xFrom, yFrom, xTo, yTo) {
  ctx.strokeStyle = '#ff0000'
  ctx.beginPath()
  ctx.moveTo(xFrom, yFrom)
  ctx.lineTo(xTo, yTo)
  ctx.setLineDash([10, 10])
  ctx.stroke()
}
