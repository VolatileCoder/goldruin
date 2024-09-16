class Trig {
    static degreesToRadians(angle){
        return (angle % 360) / 360 * 2 * Math.PI;
    }
    static radiansToDegrees(angle){
        return angle * 57.2958;
    }
    static cotangent(radians){
        return 1/Math.tan(radians);
    }
    static tangent(radians){
        return Math.tan(radians);
    }
    static pointToAngle(opposite, adjacent){
        return Math.atan(opposite/adjacent);
    }   
}