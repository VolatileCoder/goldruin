//REQUIRES VC

VC.Trig = class {
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
        if(adjacent<0){
            return Math.PI + Math.atan(opposite/adjacent);        
        }
        return Math.atan(opposite/adjacent);
    }
    static distance (x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}