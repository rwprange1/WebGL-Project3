


function addQuat(q1, q2){
    if (q1.length != 4 || q2.length != 4){
        return `Invalid quaternion addition, length must be 4. q1: ${q1.length}, q2: ${q2.length}`;
    } 

    let vec = vector_add(q1.slice(1), q2.slice(1))
    return [q1[0] + q2[0], vec[0], vec[1], vec[2]];
}

function quatScale(q1, val){
    return vector_scale(q1, val);
}



/**
 * Multiply q1 by q2
 * @param {*} q1  a quat [s, x,y,z]
 * @param {*} q2  a quat [s, x, y ,z]
 */
function multQuat(q1, q2){ 
    if (q1.length != 4 || q2.length != 4){
        return `Invalid quaternion multiplication, length must be 4. q1: ${q1.length}, q2: ${q2.length}`;
    } 

    let s1 = q1[0];
    let s2 = q2[0];

    let v1 = [q1[1], q1[2], q1[3]];
    let v2 = [q2[1], q2[2], q2[3]];

    let p1 = vector_add(vector_scale(v1,s2), vector_scale(v2, s1));
    let vec = vector_add(p1, cross_product(v1,v2));

    return [s1*s2 - dot(v1,v2), vec[0], vec[1], vec[2]];

}

/**
 * This function will rotate a quat q1 about an arbitrary axis axis (vec3)
 * @param {float} q1 the quat to rotate
 * @param {float} theta  the angle of rot
 * @param {number[]}} axis  the axis of rot
 * @returns the rotated quat
 */
function rotateQuat(q1, theta, axis){
    theta = theta/2;
    axis = normalize(axis);
    
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);

    axis = vector_scale(axis, sin);

    let r =  [cos, axis[0], axis[1], axis[2]];
    let rInv = unitInv(r);

    return multQuat(multQuat(r,q1), rInv);
    
}

function quatMagnitude(q1){
    let vec = q1.slice(1);
    return dot(vec, vec);
}

/**
 * Find the inverse of a quat, (1, 0, 0, 0) is the identity quat
 * @param {*} q1 
 */
function quatInv(q1){
    let val = 1/quatMagnitude(q1);
    q1[1] *= -1;
    q1[2] *= -1;
    q1[3] *= -1;
    return quatScale(q1, val);
}


function unitInv(q1){

    q1[1] *= -1;
    q1[2] *= -1;
    q1[3] *= -1;
    return q1;

}


function findY(x,z){
    
    let d = (x*x) + (z*z);
    let v = [];
    v[0] = -x;
    v[1] = z;

    if (d < 1.0){
        v[2] =  Math.sqrt(1.0 - d);
    }else{
        let a = 1.0/ Math.sqrt(d);
        v[2] = 0.0;
        v[0] *= a;
        v[1] *= a;
    }
    return v;
}