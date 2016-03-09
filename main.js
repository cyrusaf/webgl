var canvas = document.getElementById('webgl')
var gl = getWebGLContext(canvas)
var glInst
var delta_theta = 1
var last_called

function mainLoop() {
  let fps
  if (!last_called) {
    last_called = Date.now()
    fps = 0
    window.requestAnimationFrame(mainLoop)
    return
  }
  let delta = (Date.now() - last_called)/1000
  last_called = Date.now()

  glInst.entities[0].rotation[0] += 50*delta

  if (glInst.entities[1].rotation[0] >= 60) {
    delta_theta = -100*delta
  } else if (glInst.entities[1].rotation[0] <= 0) {
    delta_theta = 100*delta
  }

  for (let entity of glInst.entities.slice(1, glInst.entities.length+1)) {
    if (entity.constructor.name != 'Entity') { continue }

    entity.rotation[0] += delta_theta
  }
  glInst.draw()
  window.requestAnimationFrame(mainLoop)
}

function main() {

  // Init WebGL
  glInst = new GL(canvas)
  glInst.initVertexBuffers()

  // Create entities
  for (let i = 0; i < 6; i++) {
    let entity = new Entity()
    if (i != 0) {
      entity.setAnchor(glInst.entities[i-1], [2, 0, 0])
      entity.setRotationPoint([-1, 0, -1])
      entity.rotation = [60, 0, 1, 0]
    }
    glInst.entities.push(entity)
  }

  //let grid = new Grid()
  //glInst.entities.push(grid)

  window.requestAnimationFrame(mainLoop)


  $(document).keydown(function(e) {
    let diff = [0, 0, 0]
    diff[0] += glInst.camera.dist*Math.sin(glInst.camera.angle[1])*Math.cos(glInst.camera.angle[0])
    diff[2] += glInst.camera.dist*Math.sin(glInst.camera.angle[1])*Math.sin(glInst.camera.angle[0])
    diff[1] += glInst.camera.dist*Math.cos(glInst.camera.angle[1])
    normalize(diff, 1)

    let speed = 0.5
    let angle_speed = 0.05
      switch(e.which) {
          case 37: // left
            glInst.camera.angle[0] -= angle_speed
            break;

          case 38: // up
            glInst.camera.angle[1] += angle_speed
            break;

          case 39: // right
            glInst.camera.angle[0] += angle_speed
            break;

          case 40: // down
            glInst.camera.angle[1] -= angle_speed
            break;

          case 83: // s
            glInst.camera.pos[0] -= speed*diff[0]
            glInst.camera.pos[1] -= speed*diff[1]
            glInst.camera.pos[2] -= speed*diff[2]
            break;

          case 87: // w
            glInst.camera.pos[0] += speed*diff[0]
            glInst.camera.pos[1] += speed*diff[1]
            glInst.camera.pos[2] += speed*diff[2]
            break;

          case 65: // a
            let d = math.cross(diff, [0, 1, 0])
            glInst.camera.pos[0] -= speed*d[0]
            glInst.camera.pos[1] -= speed*d[1]
            glInst.camera.pos[2] -= speed*d[2]
            break;

          case 68: // d
            let d2 = math.cross(diff, [0, 1, 0])
            glInst.camera.pos[0] += speed*d2[0]
            glInst.camera.pos[1] += speed*d2[1]
            glInst.camera.pos[2] += speed*d2[2]
            break;

          default: return; // exit this handler for other keys
      }
      $('#pos').html(glInst.camera.pos[0] + ", " + glInst.camera.pos[1] + ", " + glInst.camera.pos[2]);
      $('#look_at').html(glInst.camera.angle[0] + ", " + glInst.camera.angle[1]);
      e.preventDefault(); // prevent the default action (scroll / move caret)
  });

  $(window).resize(function() {
    glInst.resize()
  })
}





function normalize(point, scale) {
  var norm = Math.sqrt(point[0] * point[0] + point[1] * point[1] + point[2] * point[2]);
  if (norm != 0) { // as3 return 0,0 for a point of zero length
    point[0] = scale * point[0] / norm;
    point[1] = scale * point[1] / norm;
    point[2] = scale * point[2] / norm;
  }
}
