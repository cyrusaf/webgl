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
      pos: [0.0, 9.0, 20.0],
      angle: [Math.PI/2, -1*Math.PI/1.6],
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
    gl.clearColor(52/255, 152/255, 219/255, 1.0)
    gl.enable(gl.DEPTH_TEST)

    // Set the viewport
    gl.viewport(0, 0, this.width, this.height)

    // Create matrices
    this.uLoc_eyePosWorld  = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
    this.uLoc_ModelMatrix  = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    this.uLoc_MvpMatrix    = gl.getUniformLocation(gl.program, 	'u_MvpMatrix');
    this.uLoc_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');
    if (!this.uLoc_ModelMatrix	|| !this.uLoc_MvpMatrix || !this.uLoc_NormalMatrix) {
    	console.log('Failed to get uLoc_ matrix storage locations');
    	return;
  	}
    this.eye_pos_world = new Float32Array(3)
    this.model_matrix  = new Matrix4()
    this.mvp_matrix    = new Matrix4()
    this.normal_matrix = new Matrix4()

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

    this.VSHADER_SOURCE =
      'attribute vec4 a_Position;\n' +
      'attribute vec4 a_Normal;\n' +

      'uniform mat4 u_MvpMatrix;\n' +
      'uniform mat4 u_ModelMatrix;\n' +
      'uniform mat4 u_NormalMatrix;\n' +

      'uniform vec3 u_Kd;\n' +

      'varying vec3 v_Kd;\n' +

      'varying vec4 v_Position;\n' +
      'varying vec3 v_Normal;\n' +

      'void main() {\n' +
      '  gl_Position = u_MvpMatrix * a_Position;\n' +
      '  v_Position = u_ModelMatrix * a_Position; \n' + // hmmm...
      '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
      '	 v_Kd = u_Kd; \n' +
      '}\n'

    // Fragment shader program
    this.FSHADER_SOURCE =
      '#ifdef GL_ES\n' +
      'precision mediump float;\n' +
      '#endif\n' +

      'uniform vec3 u_Lamp0Pos;\n' + 			// Phong Illum: position
      'uniform vec3 u_Lamp0Amb;\n' +   		// Phong Illum: ambient
      'uniform vec3 u_Lamp0Diff;\n' +     // Phong Illum: diffuse
    	'uniform vec3 u_Lamp0Spec;\n' +			// Phong Illum: specular

      'uniform vec3 u_Ke;\n' +						// Phong Reflectance: emissive
      'uniform vec3 u_Ka;\n' +						// Phong Reflectance: ambient
      'uniform vec3 u_Ks;\n' +						// Phong Reflectance: specular
      'uniform int u_Kshiny;\n' +				  // Phong Reflectance: 1 < shiny < 200

      'uniform vec3 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

      'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
      'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
      'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix

      'void main() {\n' +
      '  vec3 normal = normalize(v_Normal); \n' +
      '  vec3 lightDirection = normalize(u_Lamp0Pos - v_Position.xyz);\n' +
      '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
      '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
      '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
      '  float nDotH = max(dot(H, normal), 0.0); \n' +
      '  float e64 = pow(nDotH, float(u_Kshiny));\n' +
      '	 vec3 emissive = u_Ke;' +
      '  vec3 ambient = u_Lamp0Amb * u_Ka;\n' +
      '  vec3 diffuse = u_Lamp0Diff * v_Kd * nDotL;\n' +
      '	 vec3 speculr = u_Lamp0Spec * u_Ks * e64;\n' +
      '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
      '}\n'
  }

  drawEntity(entity) {
    entity.draw(this.uLoc_MvpMatrix, this.mvp_matrix, this.uLoc_ModelMatrix,
      this.model_matrix, this.uLoc_NormalMatrix, this.normal_matrix)
  }

  initVertexBuffers() {
    this.uLoc_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');

    let uLoc_Lamp0Pos   = gl.getUniformLocation(gl.program, 	'u_Lamp0Pos');
    let uLoc_Lamp0Ambi  = gl.getUniformLocation(gl.program, 	'u_Lamp0Amb');
    let uLoc_Lamp0Diff  = gl.getUniformLocation(gl.program, 	'u_Lamp0Diff');
    let uLoc_Lamp0Spec	= gl.getUniformLocation(gl.program,		'u_Lamp0Spec');
    if( !uLoc_Lamp0Pos || !uLoc_Lamp0Ambi	|| !uLoc_Lamp0Diff || !uLoc_Lamp0Spec	) {
      console.log('Failed to get the Lamp0 storage locations');
      return;
    }

    let uLoc_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  	let uLoc_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  	let uLoc_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  	let uLoc_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  	let uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');

  	if(!uLoc_Ke || !uLoc_Ka || !uLoc_Kd
  		  		    || !uLoc_Ks || !uLoc_Kshiny
  		 ) {
  		console.log('Failed to get the Phong Reflectance storage locations');
  		return;
  	}

    var lamp0Pos  = new Float32Array(3);	// x,y,z in world coords
    var	lamp0Ambi = new Float32Array(3);	// r,g,b for ambient illumination
    var lamp0Diff = new Float32Array(3);	// r,g,b for diffuse illumination
    var lamp0Spec	= new Float32Array(3);	// r,g,b for specular illumination
    lamp0Pos.set( [6.0, 5.0, 5.0]);
    lamp0Ambi.set([0.4, 0.4, 0.4]);
    lamp0Diff.set([1.0, 1.0, 1.0]);
    lamp0Spec.set([1.0, 1.0, 1.0]);

    gl.uniform3fv(uLoc_Lamp0Pos, lamp0Pos);
    gl.uniform3fv(uLoc_Lamp0Ambi, lamp0Ambi);		// ambient
    gl.uniform3fv(uLoc_Lamp0Diff, lamp0Diff);		// diffuse
    gl.uniform3fv(uLoc_Lamp0Spec, lamp0Spec);		// Specular

    var	matl0_Ke = new Float32Array(3);					// r,g,b for emissive 'reflectance'
    var	matl0_Ka = new Float32Array(3);					// r,g,b for ambient reflectance
    var	matl0_Kd = new Float32Array(3);					// r,g,b for diffuse reflectance
    var	matl0_Ks = new Float32Array(3);					// r,g,b for specular reflectance
    var matl0_Kshiny = false;
    matl0_Ke.set([0.0, 0.0, 0.0]);
  	matl0_Ka.set([0.6, 0.0, 0.0]);
  	matl0_Kd.set([0.8, 0.0, 0.0]);
  	matl0_Ks.set([0.8, 0.8, 0.8]);
  	matl0_Kshiny = 16;

    gl.uniform3fv(uLoc_Ke, matl0_Ke);				// Ke emissive
  	gl.uniform3fv(uLoc_Ka, matl0_Ka);				// Ka ambient
    gl.uniform3fv(uLoc_Kd, matl0_Kd);				// Kd	diffuse
  	gl.uniform3fv(uLoc_Ks, matl0_Ks);				// Ks specular
  	gl.uniform1i(uLoc_Kshiny, matl0_Kshiny);					// Kshiny shinyness exponent

    Entity.initVertexBuffers()
    Entity2.initVertexBuffers()
    Grid.initVertexBuffers()
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

    gl.uniform3fv(this.uLoc_eyePosWorld, Float32Array.from(this.camera.pos));
    this.mvp_matrix.setPerspective(30, this.width/this.height, 1, 100)
    this.mvp_matrix.lookAt(...this.camera.pos, ...look_at, 0, 1, 0)
    gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvp_matrix.elements)
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
