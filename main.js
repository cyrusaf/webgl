let canvas = document.getElementById('webgl')
var gl = getWebGLContext(canvas)

function main() {
  let glInst = new GL(canvas.width, canvas.height)
  let entity = new Entity()
  let entity2 = new Entity()

  entity.pos = [-2, 0, 0]
  entity2.pos = [1, 0, 0]
  glInst.entities.push(entity)
  glInst.entities.push(entity2)

  glInst.draw()
}
