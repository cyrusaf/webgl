class Grid extends Entity {
  static vertexBuffer = gl.createBuffer()
  static verts = makeGroundGrid()
  static n_verts = 400

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

    view_matrix.setTranslate(...this.pos);
    view_matrix.rotate(90, 1, 0, 0)
    gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix.elements)
    gl.drawArrays(gl.LINES, 0, this.constructor.n_verts)
  }
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	let xcount = 100;			// # of lines to draw in x,y to make the grid.
	let ycount = 100;
	let xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	let xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	let yColr = new Float32Array([1.0, 1.0, 1.0]);	// bright green.
  let floatsPerVertex = 6

	// Create an (global) array to hold this ground-plane's vertices:
	let gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.

	let xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	let ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

  let v = 0
  let j = 0
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = xColr[0];			// red
		gndVerts[j+4] = xColr[1];			// grn
		gndVerts[j+5] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = yColr[0];			// red
		gndVerts[j+4] = yColr[1];			// grn
		gndVerts[j+5] = yColr[2];			// blu
	}

  return gndVerts
}
