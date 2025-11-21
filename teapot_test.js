window.onload = function init() {

	// generate hte teapot model
	teapot_geom = createTeapotGeometry(6);
	
	console.log('Teapot model: ' +
		teapot_geom[0].length + ' vertices, ' + teapot_geom[1].length + " vertex normals");

	console.log("vertex (x,y,z,w):"  + teapot_geom[0][0].length + " components \n"
	+ "Normal (x,y,z,w: "  +  teapot_geom[1][0].length + " components (last component is 0!)");

	console.log("first 5 vertices\n");
	for (let k = 0; k < 5; k++) 
		console.log("\tvertex " + k + ": " + teapot_geom[0][k]);
	console.log("first 5 normals\n");
	for (let k = 0; k < 5; k++) 
		console.log("\tvertex " + k + ": " + teapot_geom[1][k]);
}
