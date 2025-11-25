

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

var cameraPos = [0, 6., 10.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];


var shininess = 32;

var lightPos = [-58., -60.,  100.0,  1.0];
var lightAmbient = [1,1,1,1.];
var lightDiffuse = [1,1,1,1.];
var lightSpecular = [1. , 1., 1., 1.];

var materialAmbient = [.8, 0, .2, 1.0];
var materialDiffuse = [.8, 0, .4, 1.];
var materialSpecular = [.8, .77, .77, 1.0];



var near = 1.0;
var far = 50.;
var left = -.65;
var right = .65;
var bottom = -.65;
var topCam = .65;


var isHeld = false;
var prevPoint;
var click;
var quatPointer;



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



    quaternion = [1.0, 0.0, 0.0, 0.0];
    quatPointer = gl.getUniformLocation(program, "uRotQuat");
    gl.uniform4fv(quatPointer, quaternion);

    buildBuffers();
    buildCamera();
    calculateLight();

    initHTMLEventListeners();
    render();
}



function calculateLight(){
    let ambientProduct = cross(lightAmbient, materialAmbient);
    let diffuseProduct = cross(lightDiffuse, materialDiffuse);
    let specularProduct = cross(lightSpecular, materialSpecular);

    ambientProduct.push(1.0);
    diffuseProduct.push(1.0);
    specularProduct.push(1.0);

    console.log("amb", ambientProduct);
    console.log("diff", diffuseProduct);
    console.log("spec", specularProduct);
    
    let ambPointer = gl.getUniformLocation(program, "ambientProduct");
    console.log(ambPointer)
    gl.uniform4fv(ambPointer, ambientProduct);

    let diffPointer = gl.getUniformLocation(program, "diffuseProduct");
    console.log(diffPointer)
    gl.uniform4fv(diffPointer, diffuseProduct);

    let specularPointer = gl.getUniformLocation(program, "specularProduct");
    console.log(specularPointer)
    gl.uniform4fv(specularPointer, specularProduct);

    let shininessPointer = gl.getUniformLocation(program, "shininess");
    console.log(shininessPointer)
    gl.uniform1f(shininessPointer, shininess);

    let lightPosPointer = gl.getUniformLocation(program, "lightPos");
    console.log(lightPosPointer)
    gl.uniform4fv(lightPosPointer, lightPos);


    let viewerPosPointer = gl.getUniformLocation(program, "viewerPos");
    gl.uniform4fv(viewerPosPointer, cameraPos);
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
    console.log(vNorm);

    gl.vertexAttribPointer(vNorm, 4, gl.FLOAT, false, 0, 16*teapot_geom[0].length); // each element is a vec4f, 4 4 byte floats
    gl.enableVertexAttribArray(vNorm);
}


/**
 * This is the render loop, we clear the canvas and display the content and call render again
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    gl.drawArrays(gl.TRIANGLES, 0,teapot_geom[0].length );
 
    requestAnimFrame(render);

    
    
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
        reset();
    })

   
    document.addEventListener("keypress", (event)=>{
        if (event.key === "w") {
            lightPos[0] -= .25;
        }

        if(event.key === "s"){
            lightPos[0] += .25;
        }
        calculateLight();
    })
   


    
    canvas.addEventListener("mousemove", (event) => {
        if (!isHeld || click === null) return; 
        
        if (prevPoint === undefined || prevPoint === null){
            let localCoords = getMousePosition(event)
            prevPoint = findY(localCoords[0], localCoords[1]);
            return;
        }

        if(click === 0 ){
            let localCoords = getMousePosition(event)
            let val = findY(localCoords[0], localCoords[1]);
            
            let axis = cross(val, prevPoint);
            
            axis = normalize(axis);
            
            let theta = length(axis)/150;
            
            let cos = Math.cos(theta);
            let sin = Math.sin(theta);

            axis = vector_scale(axis, sin);
            let rotation = [cos, axis[0], axis[1], axis[2]];
            
            quaternion = multQuat(quaternion, rotation);
            gl.uniform4fv(quatPointer, quaternion);
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
 */
function reset(){
    console.log("reset");
    
    cameraPos = [0, 6., 10.0 ,1.0]; 
    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
    up = [0.0, 1.0, 0.0, 1.0];

    shininess = 4.0;
    
    lightPos = [-58., -60,, 100.0, 1.0];
    lightAmbient = [.2,.2,.2,1.];
    lightDiffuse = [.7,.7,.7,1.];
    lightSpecular = [1. , 1., 1., 1.];

    materialAmbient = [1.0 , 1.0, 1.0, 1.0];
    materialDiffuse = [.25, .36, .2, 1.];
    materialSpecular = [.8, .77, .77, 1.0];

    near = 1.0;
    far = 50.;
    left = -.65;
    right = .65;
    bottom = -.65;
    topCam = .65;
    buildCamera();
}
    
    
 

  
