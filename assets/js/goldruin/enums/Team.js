class Team {
    static get UNALIGNED(){
        return 0;
    }
    static get HEROIC(){
        return 1;
    }
    static get DUNGEON(){
        return 2;
    }
    static getOpposingTeam(team){
        switch(team){
            case Team.HEROIC:
                return Team.DUNGEON;
            case Team.DUNGEON:
                return Team.HEROIC;
        }
    }
}

