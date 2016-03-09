class Entity {
  static vertexBuffer = gl.createBuffer()
  static verts = new Float32Array([
    1.0,  1.0,   1.0,  241/255,  196/255,  15/255, // Right top
    1.0,  1.0,  -1.0,  241/255,  196/255,  15/255,
    1.0, -1.0,   1.0,  241/255,  196/255,  15/255,

    1.0, -1.0,  -1.0,  241/255,  196/255,  15/255, // Right bottom
    1.0,  1.0,  -1.0,  241/255,  196/255,  15/255,
    1.0, -1.0,   1.0,  241/255,  196/255,  15/255,

    1.0,  1.0,   1.0,  155/255,  89/255,  182/255, // Top back
    1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,
   -1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,

    1.0,  1.0,   1.0,  155/255,  89/255,  182/255, // Top front
   -1.0,  1.0,   1.0,  155/255,  89/255,  182/255,
   -1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,

    1.0,  1.0,   1.0,  230/255,  126/255,  34/255, // Front top
   -1.0,  1.0,   1.0,  230/255,  126/255,  34/255,
   -1.0, -1.0,   1.0,  230/255,  126/255,  34/255,

    1.0,  1.0,   1.0,  230/255,  126/255,  34/255, // Front bottom
    1.0, -1.0,   1.0,  230/255,  126/255,  34/255,
   -1.0, -1.0,   1.0,  230/255,  126/255,  34/255,

   -1.0,  1.0,  -1.0,  231/255,  76/255,  60/255, // Left top
   -1.0, -1.0,   1.0,  231/255,  76/255,  60/255,
   -1.0,  1.0,   1.0,  231/255,  76/255,  60/255,

   -1.0,  1.0,  -1.0,  231/255,  76/255,  60/255, // Left bottom
   -1.0, -1.0,   1.0,  231/255,  76/255,  60/255,
   -1.0, -1.0,  -1.0,  231/255,  76/255,  60/255,

   -1.0,  1.0,  -1.0,  192/255,  57/255,  43/255, // Back top
    1.0,  1.0,  -1.0,  192/255,  57/255,  43/255,
    1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,

   -1.0,  1.0,  -1.0,  192/255,  57/255,  43/255, // Back bottom
   -1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,
    1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,

    1.0, -1.0,  -1.0,  39/255,  174/255,  96/255, // Bottom right
   -1.0, -1.0,   1.0,  39/255,  174/255,  96/255,
    1.0, -1.0,   1.0,  39/255,  174/255,  96/255,

    1.0, -1.0,  -1.0,  39/255,  174/255,  96/255, // Bottom left
   -1.0, -1.0,   1.0,  39/255,  174/255,  96/255,
   -1.0, -1.0,  -1.0,  39/255,  174/255,  96/255,
  ])
  static n_verts = 12*3

  constructor() {
    this.pos            = [0, 0, 0] // x, y, z
    this.anchor         = null
    this.rotation       = [0, 0, 1, 0] // angle, x, y, z
    this.rotation_point = [0, 0, 0]

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

  setRotationPoint(point) {
    this.rotation_point = point
  }

  draw(uLoc_MvpMatrix, mvp_matrix, uLoc_ModelMatrix, model_matrix, uLoc_NormalMatrix, normal_matrix) {
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

    let a_Normal = gl.getAttribLocation(gl.program, 'a_Normal')
    if(a_Position < 0) {
      console.log('Failed to get the storage location of a_Normal')
      return -1
    }
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * GL.shader_stride, 0)
    gl.enableVertexAttribArray(a_Normal)


    // Update position of object
    model_matrix.setTranslate(0,0,0)

    // If anchored, update pos based off parent
    let anchors = []
    let anchor = this.anchor
    while (anchor) {
      anchors.unshift(anchor)
      anchor = anchor.parent.anchor
    }

    for (anchor of anchors) {
      model_matrix.translate(...anchor.parent.pos)
      model_matrix.translate(...anchor.parent.rotation_point)
      model_matrix.rotate(...anchor.parent.rotation)
      model_matrix.translate(...anchor.parent.rotation_point.map(function(e){
        return e*-1
      }))
      model_matrix.translate(...anchor.pos)
    }

    model_matrix.translate(...this.pos)
    model_matrix.translate(...this.rotation_point)
    model_matrix.rotate(...this.rotation)
    model_matrix.translate(...this.rotation_point.map(function(e){
      return e*-1
    }))

    // Update based off of values of view_matrix
    let mvp_matrix_temp = new Matrix4()
    mvp_matrix_temp.elements = Float32Array.from(mvp_matrix.elements)
    mvp_matrix_temp.multiply(model_matrix)
    normal_matrix.setInverseOf(model_matrix)
    normal_matrix.transpose()

    gl.uniformMatrix4fv(uLoc_ModelMatrix, false, model_matrix.elements);
    gl.uniformMatrix4fv(uLoc_MvpMatrix, false, mvp_matrix_temp.elements);
    gl.uniformMatrix4fv(uLoc_NormalMatrix, false, normal_matrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, this.constructor.n_verts)
  }
}

class Entity2 extends Entity {
  static vertexBuffer = gl.createBuffer()
  static verts = new Float32Array([
    1.0,  1.0,   1.0,  241/255,  196/255,  15/255, // Right top
    1.0,  1.0,  -1.0,  241/255,  196/255,  15/255,
    1.0, -1.0,   1.0,  241/255,  196/255,  15/255,

    1.0, -1.0,  -1.0,  241/255,  196/255,  15/255, // Right bottom
    1.0,  1.0,  -1.0,  241/255,  196/255,  15/255,
    1.0, -1.0,   1.0,  241/255,  196/255,  15/255,

    1.0,  1.0,   1.0,  155/255,  89/255,  182/255, // Top back
    1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,
   -1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,

    1.0,  1.0,   1.0,  155/255,  89/255,  182/255, // Top front
   -1.0,  1.0,   1.0,  155/255,  89/255,  182/255,
   -1.0,  1.0,  -1.0,  155/255,  89/255,  182/255,

    1.0,  1.0,   1.0,  230/255,  126/255,  34/255, // Front top
   -1.0,  1.0,   1.0,  230/255,  126/255,  34/255,
   -1.0, -1.0,   1.0,  230/255,  126/255,  34/255,

    1.0,  1.0,   1.0,  230/255,  126/255,  34/255, // Front bottom
    1.0, -1.0,   1.0,  230/255,  126/255,  34/255,
   -1.0, -1.0,   1.0,  230/255,  126/255,  34/255,

   -1.0,  1.0,  -1.0,  231/255,  76/255,  60/255, // Left top
   -1.0, -1.0,   1.0,  231/255,  76/255,  60/255,
   -1.0,  1.0,   1.0,  231/255,  76/255,  60/255,

   -1.0,  1.0,  -1.0,  231/255,  76/255,  60/255, // Left bottom
   -1.0, -1.0,   1.0,  231/255,  76/255,  60/255,
   -1.0, -1.0,  -1.0,  231/255,  76/255,  60/255,

   -1.0,  1.0,  -1.0,  192/255,  57/255,  43/255, // Back top
    1.0,  1.0,  -1.0,  192/255,  57/255,  43/255,
    1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,

   -1.0,  1.0,  -1.0,  192/255,  57/255,  43/255, // Back bottom
   -1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,
    1.0, -1.0,  -1.0,  192/255,  57/255,  43/255,

    1.0, -1.0,  -1.0,  39/255,  174/255,  96/255, // Bottom right
   -1.0, -1.0,   1.0,  39/255,  174/255,  96/255,
    1.0, -1.0,   1.0,  39/255,  174/255,  96/255,

    1.0, -1.0,  -1.0,  39/255,  174/255,  96/255, // Bottom left
   -1.0, -1.0,   1.0,  39/255,  174/255,  96/255,
   -1.0, -1.0,  -1.0,  39/255,  174/255,  96/255,
  ])
  static n_verts = 12*3
}
