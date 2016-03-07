class Entity {
  static vertexBuffer = gl.createBuffer()
  static verts = new Float32Array([
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
  static n_verts = 12*3

  constructor() {
    this.pos    = [0, 0, 0]
    this.anchor = null

    // Check vertex buffer
    if (!this.constructor.vertexBuffer) {
      console.log('Failed to create the buffer object')
      return -1
    }
  }

  static initVertexBuffers() {

    // Bind buffer and add data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW)

  }

  setAnchor(parent, pos) {
    this.anchor = {
      parent: parent,
      pos: pos
    }
  }

  draw(u_ViewMatrix, view_matrix) {
    let FSIZE = this.constructor.verts.BYTES_PER_ELEMENT
    gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor.vertexBuffer)

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


    // Update position of object
    // TODO Add rotation
    view_matrix.setTranslate(0,0,0);

    // If anchored, update pos based off parent
    if (this.anchor) {
      view_matrix.translate(...this.anchor.parent.pos)
      view_matrix.translate(...this.anchor.pos)
    }
    view_matrix.translate(...this.pos);
    gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix.elements)
    gl.drawArrays(gl.TRIANGLES, 0, this.constructor.n_verts)
  }
}

class Entity2 extends Entity {
  static vertexBuffer = gl.createBuffer()
  static verts = new Float32Array([
    1.0,  0.0,   0.0,  1.0,  0.0,  0.0, // The back green one
    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    1.0,  0.0,  -1.0,  1.0,  0.0,  0.0,

    1.0,  0.0,  -1.0,  1.0,  0.0,  0.0,
    1.0,  0.0,   0.0,  1.0,  0.0,  0.00,
    1.0,  0.0,  -1.0,  1.0,  0.0,  0.0,

    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    1.0, 1.0,    0.0,  1.0,  0.0,  0.0,

    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    1.0,  1.0,   0.0,  1.0,  0.0,  0.0,
    1.0, 1.0,    0.0,  1.0,  0.0,  0.0,

    1.0,  0.0,   -1.0,  1.0,  0.0,  0.0,
    1.0,  0.0,   -1.0,  0.0,  1.0,  0.0,
    1.0, 1.0,    -1.0,  0.0,  0.0,  1.0,

    1.0,  0.0,   -1.0,  1.0,  0.0,  0.0,
    1.0,  1.0,   -1.0,  0.0,  1.0,  0.0,
    1.0, 1.0,    -1.0,  0.0,  0.0,  1.0,

    1.0,  1.0,   0.0,  1.0,  0.0,  0.0,
    1.0,  1.0,   0.0,  0.0,  1.0,  0.0,
    1.0,  1.0,  -1.0,  0.0,  0.0,  1.0,

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
  static n_verts = 12*3
}
