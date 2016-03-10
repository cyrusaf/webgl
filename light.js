class Light {
  constructor(i) {
    this._pos  = new Float32Array(3)
    this._ambi = new Float32Array(3)
    this._diff = new Float32Array(3)
    this._spec = new Float32Array(3)

    this.u_pos  = gl.getUniformLocation(gl.program, 	'u_LampSet[' + i + '].pos')
    this.u_ambi = gl.getUniformLocation(gl.program, 	'u_LampSet[' + i + '].ambi')
    this.u_diff = gl.getUniformLocation(gl.program, 	'u_LampSet[' + i + '].diff')
    this.u_spec = gl.getUniformLocation(gl.program, 	'u_LampSet[' + i + '].spec')
    if( !this.u_pos || !this.u_ambi	|| !this.u_diff || !this.u_spec	) {
      console.log('Failed to get the Lamp0 storage locations')
      return
    }

    this.active = true
  }

  set pos(val) {
    this._pos.set(val)
    gl.uniform3fv(this.u_pos,  this._pos.slice(0,3))
  }

  get pos() {
    return this._pos
  }

  set ambi(val) {
    this._ambi.set(val)
    gl.uniform3fv(this.u_ambi, this._ambi)
  }

  get ambi() {
    return this._ambi
  }

  set diff(val) {
    this._diff.set(val)
    gl.uniform3fv(this.u_diff, this._diff)
  }

  get diff() {
    return this._diff
  }

  set spec(val) {
    this._spec.set(val)
    gl.uniform3fv(this.u_spec, this._spec)
  }
}
