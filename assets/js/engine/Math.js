//REQUIRES VC

VC.Math = class {
    static constrain (min, val, max){
        if (val<min) return min;
        if (val>max) return max;
        return val;
    }

    static percentToRange (percentage, rangeMin, rangeMax){
        percentage = VC.Math.constrain(0, percentage, 1);
        return rangeMin + (percentage * (rangeMax-rangeMin));
    }

    static inversePercentToRange (percentage, rangeMin, rangeMax){
        percentage = VC.Math.constrain(0, percentage, 1);
        return rangeMax - (percentage * (rangeMax-rangeMin));
    }

}