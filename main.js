let canvas = document.getElementById('webgl')
var gl = getWebGLContext(canvas)

function main() {
  let glInst = new GL(canvas.width, canvas.height)
  let entity = new Entity()

  entity.draw(glInst.u_ViewMatrix, glInst.view_matrix)
}
