export class Ball {
  constructor (x, y, xVec, yVec, radius) {
    this.x = x
    this.y = y
    this.xVec = xVec
    this.yVec = yVec
    this.color = this.random_color()
    this.radius = radius !== undefined ? radius : Math.floor(Math.random() * 45) + 5
  }

  random_color () {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
    const r = randomBetween(0, 200)
    const g = randomBetween(0, 200)
    const b = randomBetween(0, 200)
    return `rgb(${r},${g},${b})` // Collect all to a css color string
  }
}

export class ForceField {
  constructor (x, y, radius) {
    this.x = x
    this.y = y
    this.radius = radius
  }
}

export class Rectangle {
  constructor (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

export class Square {
  constructor (x, y, width) {
    this.x = x
    this.y = y
    this.width = width
  }
}
