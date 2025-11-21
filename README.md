# Desc
This is project 3 for cs 6120. This project extends project 2 we will be adding a trackball interface to interactively view the 
teapot using quaternion rotations
# Author: 
Richard Prange
# Version: 
11/7/2025


# How to control the model and camera
1. To pan the camera in the x and y direction the user needs to hold down left click and drag their mouse in the direction they want to pan.
2. To zoom the camera in (z-direction) the user needs to hold down the scroll well and drag their mouse up to zoom in and drag it backwards to zoom out.
3. There are also wasd
    - **W**: zooms in.
    - **S**: zooms out.
    - **A**: "rotates" the teapot to the left by simultaniously moving the camera towards the origin in the x,z axis.
    - **D**: Is similar to A but rotates to the right.
4. To reset the model their is a button or use the **R** key.     
5. The sliders will allow the user to change the definition of the viewing frustum.
The frustum will remain symmetric. 

# How to run
1. Make sure you are in the project root directory then run **.\teapot.html**


# Help
The files in this folder contains the needed code to generate th teapot's 
vertices and normals, which are returned as a 2 element array.

Each vertex is 4 components, each normal is 4 components, with 4th component as 0);
