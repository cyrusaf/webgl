let canvas = document.getElementById('webgl')
var gl = getWebGLContext(canvas)

function main() {
  let glInst = new GL(canvas.width, canvas.height)
  glInst.initVertexBuffers()

  let entity = new Entity()
  let entity2 = new Entity()
  let entity3 = new Entity2()

  entity.pos = [-2, 1, 0]
  entity2.pos = [1, 0, 0]
  entity2.pos = [1, -2, 0]
  glInst.entities.push(entity)
  glInst.entities.push(entity2)
  glInst.entities.push(entity3)

  glInst.draw()



  $(document).keydown(function(e) {
    let diff = [glInst.camera.pos[0] - glInst.camera.look_at[0], glInst.camera.pos[1] - glInst.camera.look_at[1], glInst.camera.pos[2] - glInst.camera.look_at[2]]
    normalize(diff, 1)
    let speed = 0.5
      switch(e.which) {
          case 37: // left
            glInst.camera.look_at[0] -= speed/4
            break;

          case 38: // up
            glInst.camera.look_at[1] += speed/4
            break;

          case 39: // right
            glInst.camera.look_at[0] += speed/4
            break;

          case 40: // down
            glInst.camera.look_at[1] -= speed/4
            break;

          case 87: // w
            glInst.camera.pos[0] -= speed*diff[0]
            glInst.camera.look_at[0] -= speed*diff[0]
            glInst.camera.pos[1] -= speed*diff[1]
            glInst.camera.look_at[1] -= speed*diff[1]
            glInst.camera.pos[2] -= speed*diff[2]
            glInst.camera.look_at[2] -= speed*diff[2]
            break;

          case 83: // s
            glInst.camera.pos[0] += speed*diff[0]
            glInst.camera.look_at[0] += speed*diff[0]
            glInst.camera.pos[1] += speed*diff[1]
            glInst.camera.look_at[1] += speed*diff[1]
            glInst.camera.pos[2] += speed*diff[2]
            glInst.camera.look_at[2] += speed*diff[2]
            break;

          case 65: // a
            let d = math.cross(diff, [0, 1, 0])
            glInst.camera.pos[0] += speed*d[0]
            glInst.camera.look_at[0] += speed*d[0]
            glInst.camera.pos[1] += speed*d[1]
            glInst.camera.look_at[1] += speed*d[1]
            glInst.camera.pos[2] += speed*d[2]
            glInst.camera.look_at[2] += speed*d[2]
            break;

          case 68: // d
            let d2 = math.cross(diff, [0, 1, 0])
            console.log(d2)
            glInst.camera.pos[0] -= speed*d2[0]
            glInst.camera.look_at[0] -= speed*d2[0]
            glInst.camera.pos[1] -= speed*d2[1]
            glInst.camera.look_at[1] -= speed*d2[1]
            glInst.camera.pos[2] -= speed*d2[2]
            glInst.camera.look_at[2] -= speed*d2[2]
            break;

          default: return; // exit this handler for other keys
      }
      glInst.draw()
      $('#pos').html(glInst.camera.pos[0] + ", " + glInst.camera.pos[1] + ", " + glInst.camera.pos[2]);
      $('#look_at').html(glInst.camera.look_at[0] + ", " + glInst.camera.look_at[1] + ", " + glInst.camera.look_at[2]);
      e.preventDefault(); // prevent the default action (scroll / move caret)
  });
}


function normalize(point, scale) {
  var norm = Math.sqrt(point[0] * point[0] + point[1] * point[1] + point[2] * point[2]);
  if (norm != 0) { // as3 return 0,0 for a point of zero length
    point[0] = scale * point[0] / norm;
    point[1] = scale * point[1] / norm;
    point[2] = scale * point[2] / norm;
  }
}
