/**
 * 
 * @param {*} vec 
 * @param {*} scale
 */
function Quaternion(vec, scalar){
    this.vec = vec;
    this.scalar = scalar;
}

Quaternion.prototype.mult = function(q){

    let s1 = this.scalar;
    let v1 = this.vec;

    let s2 = q.scalar;
    let v2 = q.vec;
    
    let scalar = s1 * s2 - dot(v1, v2);

    let vec3 = vector_add(vector_scale(v2, s1), vector_scale(v1, s2));
    console.log(vec3)
    let vec = [
       vector_add(vec3, cross_product(v1, v2))
    ];
    return new Quaternion(vec, scalar);
};


Quaternion.prototype.rotate = function(theta, vec){

    let rot = new Quaternion(
        vector_scale(vec, Math.sin(theta/2)),
        Math.cos(theta/2.)
    );

    console.log(rot, "rot mat")
    let ret = this.mult(rot);

    console.log("rotate" ,  ret)
    return ret;

}

Quaternion.prototype.toVec4 = function(){
    return [this.scalar, this.vec[0], this.vec[1], this.vec[2]];
}

function findY(x, z){
    return Math.sqrt(1-(x*x) - (z*z));
}