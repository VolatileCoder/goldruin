
class Direction {
    static get NONE(){
        return -1;
    }
    static get NORTH(){
        return 0;
    }
    static get NORTHEAST(){
        return 0.5;
    }
    static get EAST(){
        return 1;
    }
    static get SOUTHEAST(){
        return 1.5;
    }
    static get SOUTH(){
        return 2;
    }
    static get SOUTHWEST(){
        return 2.5;
    }
    static get WEST(){
        return 3;
    }
    static get NORTHWEST(){
        return 3.5;
    }
    static toDegress(direction){
        switch (direction){
            case Direction.NORTH:
                return 0;
            case Direction.NORTHEAST:
                return 45;
            case Direction.EAST:
                return 90;
            case Direction.SOUTHEAST:
                return 135;
            case Direction.SOUTH: 
                return 180;
            case Direction.SOUTHWEST:
                return 225;
            case Direction.WEST:
                return 270;
            case Direction.NORTHWEST:
                return 315;
            default:
                return 0;
        }
    }
}