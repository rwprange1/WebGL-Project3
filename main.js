

/**
 * This will be the main file for displaying a 3d teapot and the camera 
 * movement and updates
 * @author Richard Prange
 * @version 11/7/2025
 */

var program;
var canvas;
var gl;

// a 2-n matrix where [0] is vertex pos, [1] is vertex normals
var teapot_geom;
var dataBuffer;

var camera; 
var quaternion;

var cameraPos = [0, 8., 8.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];

var near = 1.0;
var far = 200.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0;
var topCam = 1.0;


var isHeld = false;
var prevPoint;
var click;
var quatPointer;
var camVelo = .005;
var y =1;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    gl = initWebGL(canvas);
    
    if (!gl) {
        this.alert("WebGL isnt available");
    }



    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.,.5,.25,1.0);



    quaternion = new Quaternion([0.0, 0.0, 0.0], 1);
    quatPointer = gl.getUniformLocation(program, "uRotQuat");
    gl.uniform4fv(quatPointer, quaternion.toVec4());


  

    buildBuffers();
    buildCamera();
    initHTMLEventListeners();
    render();
}




/**
 * This function loads in the teapot and the index buffer to the gpu
 */
function buildBuffers(){


    // generate hte teapot model
	teapot_geom = createTeapotGeometry(6);
	
	

    let vals = [...teapot_geom[0]];
    vals.push(...teapot_geom[1]);

    let data = matToFloat32Array(vals);
    
    
    
    dataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        data,
        gl.STATIC_DRAW
    );

    bindBuffer();

    
}


/**
 * Tell webgl the positions of the attributes in the GLbuffer 
 */
function bindBuffer(){
    gl.bindBuffer(gl.ARRAY_BUFFER,  dataBuffer);
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    let vNorm = gl.getAttribLocation(program, "vNorm");
    

    gl.vertexAttribPointer(vNorm, 4, gl.FLOAT, false, 0, 16*teapot_geom[0].length); // each element is a vec4f, 4 4 byte floats
    gl.enableVertexAttribArray(vNorm);
}


/**
 * This is the render loop, we clear the canvas and display the content and call render again
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    gl.drawArrays(gl.TRIANGLES, 0,teapot_geom[0].length );
 
    
    // sleep for 100 ms
    setTimeout(
		function (){requestAnimFrame(render);}, 60
    );
    
}

/**
 * Called when we want to initialize or change some specifications about our camera
 * It will rebuild the camera and set the html values to the new information
 */
function buildCamera(){
    camera = new Camera(cameraPos, lookAtPoint, up);
    updateCameraUniforms();
    let valueHolder = this.document.getElementById("cameraPos");
    valueHolder.innerHTML = ("Camera Position " + cameraPos);
}

/**
 * This should only be called after a camera has been built, it will 
 * call the camera perspective function which builds the projection/perspective matrix.
 * It will then load our projection and view matrices to the shader
 */
function updateCameraUniforms(){
    //console.log(left, right, bottom, topCam, near, far)
    camera.perspective(left, right, bottom, topCam, near, far);
    let modelMatrix = gl.getUniformLocation(program, "uCamera");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, matToFloat32Array(transpose(camera.modelViewMatrix)));
    gl.uniformMatrix4fv(perspectiveMatrix, false , matToFloat32Array(camera.perspectiveMatrix));
}





/**
 * This function initializes the html listener functions
 */

function initHTMLEventListeners(){
    


    let resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", () => {
        reset(heightSliderOut, widthSliderOut, nearSliderOut, farSliderOut);
    })

   
   


    
    canvas.addEventListener("mousemove", (event) => {
        if (!isHeld || click === null) return; 
        

        if (prevPoint === undefined || prevPoint === null){
            
            let localCoords = getMousePosition(event)
            prevPoint = [localCoords[0], findY(localCoords[0], localCoords[1]) , localCoords[1]];
            return;
        }

        if(click === 0 ){
            
            let localCoords = getMousePosition(event)
            let val = [localCoords[0], findY(localCoords[0], localCoords[1]), localCoords[1]];
            
            let quat = normalize(cross(val, prevPoint));
            

            quaternion = quaternion.rotate(length(quat),  quat);;
            console.log(quaternion);
            console.log(quaternion.toVec4());
            gl.uniform4fv(quatPointer, quaternion.toVec4());
            
            prevPoint = val;
          

        }else if (click === 1){ 
            // zoom in/out
            let localCoords = getMousePosition(event)
            let val = [localCoords[0], localCoords[1], 0.0 , 0.0];

            if (val[1] - prevPoint[1] > 0){
                cameraPos =  add(cameraPos, vector_scale(camera.lookAtDirection, -2));
            }else{
                cameraPos =  add(cameraPos, vector_scale(camera.lookAtDirection, 2));
            }
            buildCamera()
            prevPoint = val;
        }
    });

    canvas.addEventListener("mousedown", (event) =>{
        isHeld = true;
        click = event.button;
    });

    this.document.addEventListener("mouseup", ()=>{
        isHeld = false;
        click = null;
        prevPoint = null;
    });
}



/**
 * A simple helper function to reset the world and camera view and position
 *  @param heightSliderOut: this is a reference to the HTML height slider
 *  @param widthSliderOut: this is a reference to the HTML height slider
 *  @param nearSliderOut: this is a reference to the HTML height slider
 *  @param farSliderOut: this is a reference to the HTML height slider
 */
function reset(){

    console.log("reset")
    let heightSliderOut = document.getElementById("Height-Slider-Value");
    let widthSliderOut = document.getElementById("Width-Slider-Value");
    let nearSliderOut = document.getElementById("Near-Slider-Value");
    let farSliderOut = document.getElementById("Far-Slider-Value");
    

    let heightSliderIn =  document.getElementById("height-slider");
    let widthSliderIn = document.getElementById("width-slider");
   
    let nearSliderIn = document.getElementById("near");
    let farSliderIn = document.getElementById("far");




    
    cameraPos = [0, 100., 100.0 ,1.0]; 
    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
    up = [0.0, 1.0, 0.0, 1.0];
    near = 1.0;
    far = 200.0;
    left = -1.0;
    right = 1.0;
    bottom = -1.0;
    topCam = 1.0;

   
    
    heightSliderIn.value = 2*topCam;
    widthSliderIn.value = 2*right;
    nearSliderIn.value = near;
    farSliderIn.value = far;

    widthSliderOut.innerHTML = ("Current: " + 2*right);
    heightSliderOut.innerHTML = ("Current: " + 2*topCam);
    farSliderOut.innerHTML = ("Current: " + far);
    nearSliderOut.innerHTML = ("Current: " + near);

    let transMatPointer = gl.getUniformLocation(program, "uTransMat");
    transMat = mat4();
    gl.uniformMatrix4fv(transMatPointer, false, matToFloat32Array(transpose(transMat)));
    buildCamera();
}
    
    
 

  
