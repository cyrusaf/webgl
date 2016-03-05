class Entity {
  static vertexBuffer = gl.createBuffer()

  constructor() {
    this.pos = [0, 0, 0]

    // Check vertex buffer
    if (!this.constructor.vertexBuffer) {
      console.log('Failed to create the buffer object')
      return -1
    }

    this.initVertexBuffers()
  }

  initVertexBuffers() {
    let verts = new Float32Array([
      0.0,  0.0,   0.0,  1.0,  0.0,  0.0, // The back green one
      1.0,  0.0,   0.0,  0.0,  1.0,  0.0,
      0.0,  0.0,  -1.0,  0.0,  0.0,  1.0,

      1.0,  0.0,  -1.0,  1.0,  0.0,  0.0,
      1.0,  0.0,   0.0,  0.0,  1.0,  0.0,
      0.0,  0.0,  -1.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      1.0,  0.0,   0.0,  0.0,  1.0,  0.0,
      1.0, 1.0,    0.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      0.0,  1.0,   0.0,  0.0,  1.0,  0.0,
      1.0, 1.0,    0.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   -1.0,  1.0,  0.0,  0.0,
      1.0,  0.0,   -1.0,  0.0,  1.0,  0.0,
      1.0, 1.0,    -1.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   -1.0,  1.0,  0.0,  0.0,
      0.0,  1.0,   -1.0,  0.0,  1.0,  0.0,
      1.0, 1.0,    -1.0,  0.0,  0.0,  1.0,

      0.0,  1.0,   0.0,  1.0,  0.0,  0.0,
      1.0,  1.0,   0.0,  0.0,  1.0,  0.0,
      0.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

      1.0,  1.0,  -1.0,  1.0,  0.0,  0.0,
      1.0,  1.0,   0.0,  0.0,  1.0,  0.0,
      0.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      0.0,  0.0,  -1.0,  0.0,  1.0,  0.0,
      0.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

      0.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      0.0,  1.0,   0.0,  0.0,  1.0,  0.0,
      0.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

      1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      1.0,  0.0,  -1.0,  0.0,  1.0,  0.0,
      1.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

      1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
      1.0,  1.0,   0.0,  0.0,  1.0,  0.0,
      1.0,  1.0,  -1.0,  0.0,  0.0,  1.0
    ])
    this.n_verts = 12*3

    // Bind buffer and add data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    let FSIZE = verts.BYTES_PER_ELEMENT

    // Get a_Position
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    if(a_Position < 0) {
      console.log('Failed to get the storage location of a_Position')
      return -1
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * GL.shader_stride, 0)
    gl.enableVertexAttribArray(a_Position)

    // Get a_Color
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
    if(a_Color < 0) {
      console.log('Failed to get the storage location of a_Color');
      return -1
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * GL.shader_stride, FSIZE * GL.shader_index)
    gl.enableVertexAttribArray(a_Color)
  }

  draw(u_ViewMatrix, view_matrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor.vertexBuffer)
    view_matrix.setTranslate(...this.pos);
    gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix.elements)
    gl.drawArrays(gl.TRIANGLES, 0, this.n_verts)
  }
}
