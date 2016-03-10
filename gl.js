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
    gl.clearColor(0, 0, 0, 1.0)
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

    // Create lights
    this.light1 = new Light(0)
    this.light2 = new Light(1)
    this.light1.pos = [6.0, 5.0, 5.0]
    this.light1.ambi = [0.2, 0.2, 0.2]
    this.light1.diff = [0.4, 0.4, 0.4]
    this.light1.spec = [0.4, 0.4, 0.4]

    this.light2.pos = [6.0, 5.0, 5.0]
    this.light2.ambi = [0.2, 0.2, 0.2]
    this.light2.diff = [0.4, 0.4, 0.4]
    this.light2.spec = [0.4, 0.4, 0.4]

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

      'struct LampT {\n' +		// Describes one point-like Phong light source
    	'		vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
    												    //		   w==0.0 for distant light from x,y,z direction
    	' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    	' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    	'		vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    	'}; \n' +

      'uniform LampT u_LampSet[2];\n' +

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
      '  vec3 lightDirection[2];\n' +
      '  lightDirection[0] = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
      '  lightDirection[1] = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
      '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
      '  float nDotL[2];\n' +
      '  nDotL[0] = max(dot(lightDirection[0], normal), 0.0); \n' +
      '  nDotL[1] = max(dot(lightDirection[1], normal), 0.0); \n' +
      '  vec3 H[2];\n' +
      '  H[0] = normalize(lightDirection[0] + eyeDirection); \n' +
      '  H[1] = normalize(lightDirection[1] + eyeDirection); \n' +
      '  float nDotH[2];\n' +
      '  nDotH[0] = max(dot(H[0], normal), 0.0); \n' +
      '  nDotH[1] = max(dot(H[1], normal), 0.0); \n' +
      '  float e64[2];\n' +
      '  e64[0] = pow(nDotH[0], float(u_Kshiny));\n' +
      '  e64[1] = pow(nDotH[1], float(u_Kshiny));\n' +
      '	 vec3 emissive = u_Ke;' +

      '  vec3 ambient = (u_LampSet[0].ambi + u_LampSet[1].ambi) * u_Ka;\n' +
      '  vec3 diffuse = v_Kd * (u_LampSet[0].diff * nDotL[0] + u_LampSet[1].diff * nDotL[1]);\n' +
      '	 vec3 speculr = u_Ks * (u_LampSet[0].spec * e64[0] + u_LampSet[1].spec * e64[1]);\n' +
      '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
      '}\n'
  }

  drawEntity(entity) {
    entity.draw(this.uLoc_MvpMatrix, this.mvp_matrix, this.uLoc_ModelMatrix,
      this.model_matrix, this.uLoc_NormalMatrix, this.normal_matrix)
  }

  initVertexBuffers() {
    this.uLoc_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');

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

    var	matl0_Ke = new Float32Array(3);					// r,g,b for emissive 'reflectance'
    var	matl0_Ka = new Float32Array(3);					// r,g,b for ambient reflectance
    var	matl0_Kd = new Float32Array(3);					// r,g,b for diffuse reflectance
    var	matl0_Ks = new Float32Array(3);					// r,g,b for specular reflectance
    var matl0_Kshiny = false;
    matl0_Ke.set([0.0, 0.0, 0.0]);
  	matl0_Ka.set([0.6, 0.0, 0.0]);
  	matl0_Kd.set([0.8, 0.0, 0.0]);
  	matl0_Ks.set([0.8, 0.8, 0.8]);
  	matl0_Kshiny = 10;

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
    this.light1.pos = this.camera.pos

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
