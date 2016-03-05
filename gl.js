class GL {
  static shader_stride = 6
  static shader_index  = 3
  constructor(canvas) {

    // Instance variables
    this.canvas = canvas
    this.width  = canvas.width
    this.height = canvas.height
    this.entities = []
    this.camera = {
      pos: [0.0, 0.0, 10.0],
      angle: [Math.PI/2, -1*Math.PI/2],
      dist: 5.0
    }

    // Get the rendering context for WebGL
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL')
      return;
    }

    // Initialize shaders
    this.createShaderSources()
    if (!initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.')
      return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    // Set the viewport
    gl.viewport(0, 0, this.width, this.height)

    // Create view/projection matricies
    this.u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    this.u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
    if (!this.u_ViewMatrix || !this.u_ProjMatrix) {
      console.log('Failed to get u_ViewMatrix or u_ProjMatrix')
      return
    }
    this.view_matrix = new Matrix4()
    this.proj_matrix = new Matrix4()

    // Set perpective and send to shaders
    this.resize()
  }

  createShaderSources() {
    this.VSHADER_SOURCE =
      'attribute vec4 a_Position;\n' +
      'attribute vec4 a_Color;\n' +
      'uniform mat4 u_ViewMatrix;\n' +
      'uniform mat4 u_ProjMatrix;\n' +
      'varying vec4 v_Color;\n' +
      'void main() {\n' +
      '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
      '  v_Color = a_Color;\n' +
      '}\n'

    // Fragment shader program
    this.FSHADER_SOURCE =
      '#ifdef GL_ES\n' +
      'precision mediump float;\n' +
      '#endif\n' +
      'varying vec4 v_Color;\n' +
      'void main() {\n' +
      '  gl_FragColor = v_Color;\n' +
      '}\n'
  }

  drawEntity(entity) {
    entity.draw(this.u_ViewMatrix, this.view_matrix)
  }

  initVertexBuffers() {
    Entity.initVertexBuffers()
    Entity2.initVertexBuffers()
  }

  resize() {
    let height = $(window).height() - 100
    let width  = $(window).width()

    this.canvas.width  = width
    this.canvas.height = height
    this.width  = width
    this.height = height

    gl.viewport(0, 0, this.width, this.height)
    this.updateCamera()
    this.draw()
  }

  updateCamera() {
    let look_at = [this.camera.pos[0], this.camera.pos[1], this.camera.pos[2]]
    look_at[0] += this.camera.dist*Math.sin(this.camera.angle[1])*Math.cos(this.camera.angle[0])
    look_at[2] += this.camera.dist*Math.sin(this.camera.angle[1])*Math.sin(this.camera.angle[0])
    look_at[1] += this.camera.dist*Math.cos(this.camera.angle[1])

    this.proj_matrix.setPerspective(30, this.width/this.height, 1, 100)
    this.proj_matrix.lookAt(...this.camera.pos, ...look_at, 0, 1, 0)
    gl.uniformMatrix4fv(this.u_ProjMatrix, false, this.proj_matrix.elements)
  }

  draw() {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.updateCamera()
    for (let entity of this.entities) {
      this.drawEntity(entity)
    }
  }

}
