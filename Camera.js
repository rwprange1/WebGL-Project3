/**
 * This is the camera class, it defines the location and relevant matrices needed for 3d-2d viewing in
 * webgl
 * @author Richard Prange
 * @version 11/25/2025
 */




/**
 * The constructor for the camera object
 * @param {*} location a vec4f of the location of the camera
 * @param {*} lookAtPoint  a vec4f the point the camera will look at
 * @param {*} up a vec4f rep of the point above us 
 */
function Camera(location, lookAtPoint, up){
    this.modelViewMatrix = mat4();
    this.projectionMatrix = mat4();
    this.cameraPos = location;

    this.lookAtDirection = [];
    this.up = [];
   
    for (let i = 0; i < lookAtPoint.length; i++){
        this.lookAtDirection[i] =  this.cameraPos[i] - lookAtPoint[i];
        this.up[i] = up[i] - this.cameraPos[i];
    }
    
    // this is the camera direction vector it should point at the look at point
    this.lookAtDirection[3] = 0.0;
    this.up[3] = 0.0;

    // this is the camera forward direction (z-axis)
    this.lookAtDirection = normalize(this.lookAtDirection);
    
    this.up = normalize(this.up);


    this.calculateU();
    this.calculateV();
    this.lookAt();
}


/**
 * This method will allow us to translate a a geometric object
 * in model coords to camera coords
 */
Camera.prototype.lookAt = function(){
    let MoveCamToOg = translate4x4(-this.cameraPos[0], -this.cameraPos[1], -this.cameraPos[2]);


    let rotationMat = mat4();

    rotationMat[0][0] = this.U[0];
    rotationMat[1][0] = this.U[1];
    rotationMat[2][0] = this.U[2];


    rotationMat[0][1] = this.V[0];
    rotationMat[1][1] = this.V[1];
    rotationMat[2][1] = this.V[2];

    rotationMat[0][2] = this.lookAtDirection[0];
    rotationMat[1][2] = this.lookAtDirection[1];
    rotationMat[2][2] = this.lookAtDirection[2];


    rotationMat = transpose(rotationMat);
    this.modelViewMatrix =matMult(rotationMat, MoveCamToOg); 
}


// x or camera right axis
Camera.prototype.calculateU = function(){
    this.U = normalize(cross(this.lookAtDirection, this.up));
    this.U.push(0.0);
   
}

// y or camera up axis
Camera.prototype.calculateV = function(){
    this.V = normalize(cross( this.U, this.lookAtDirection));
    this.V.push(0.0);
    
}




Camera.prototype.ortho = function(left, right, bottom, top, near, far){
    let mat = mat4();

    mat[0][0] = 2/(right - left);
    mat[0][3] = -1 * ((left + right)/ (right - left));

    mat[1][1] = 2/ (top-bottom);
    mat[1][3] = -1 * ((top+bottom)/ (top-bottom));

    mat[2][2] = -2 /(far - near);
    mat[2][3] = -1 * ((far + near) / (far- near))

    mat = transpose(mat);
    
    this.projectionMatrix = mat;
}

/**
 * This function builds the perspective matrix by building 
 * a frustum given the following floating point values
 * @param {*} left the left side of the frustums x-value
 * @param {*} right  the right side of the frustums x -value
 * @param {*} bottom  the bottom of the frustum y-value
 * @param {*} top  the top of the frustum y-value
 * @param {*} near the plane we are projecting onto (z-value)
 * @param {*} far  the far clipping plane (z-value)
 */
Camera.prototype.perspective = function(left, right, bottom, top, near, far){
    let mat = mat4();

    

    mat[0][0] = 2*near/(right-left);
    mat[0][2] = (right+left)/(right - left);

    mat[1][1] = 2*near/(top-bottom);
    mat[1][2] = (top + bottom)/(top - bottom);

    mat[2][2] = -1 * (far + near) / (far- near);
    mat[2][3] = -2* far * near / (far- near);

    mat[3][2] = -1;
    mat[3][3] = 0;
    this.perspectiveMatrix = transpose(mat);
}



