//REQUIRES State

class Statistics {
    #screen = null;
    damageDealt = 0;
    damageReceived = 0;
    goldCollected = 0;
    keysCollected = 0;
    keysSpawned = 0;
    heartsCollected = 0;
    chestsSpawned = 0;
    chestsOpened = 0;
    enemiesKilled = 0;
    enemiesSpawned = 0;
    caveSpidersSpawned = 0;
    caveSpidersKilled = 0;
    swordSkeletonsSpawned = 0;
    swordSkeletonsKilled = 0;
    kingCobrasSpawned = 0;
    kingCobrasKilled = 0;
    doorsUnlocked = 0;
    doorsSpawned = 0;
    roomsVisited = 0;
    roomsSpawned = 0;
    timeSpent = 0;
    tntCollected = 0;
    tntThrown = 0; 

    constructor(screen){
        this.#screen = screen;
    }
    add(s){
        this.damageDealt += s.damageDealt;
        this.damageReceived += s.damageReceived;
        this.goldCollected += s.goldCollected;
        this.keysCollected += s.keysCollected;
        this.keysSpawned += s.keysSpawned;
        this.heartsCollected += s.heartsCollected;
        this.chestsSpawned += s.chestsSpawned;
        this.chestsOpened += s.chestsOpened;
        this.enemiesKilled += s.enemiesKilled;
        this.enemiesSpawned += s.enemiesSpawned;
        this.caveSpidersSpawned += s.caveSpidersSpawned;
        this.caveSpidersKilled += s.caveSpidersKilled;
        this.swordSkeletonsSpawned += s.swordSkeletonsSpawned;
        this.swordSkeletonsKilled += s.swordSkeletonsKilled;
        this.kingCobrasSpawned += s.kingCobrasSpawned;
        this.kingCobrasKilled += s.kingCobrasKilled;
        this.doorsUnlocked += s.doorsUnlocked;
        this.doorsSpawned += s.doorsSpawned;
        this.roomsVisited += s.roomsVisited;
        this.roomsSpawned += s.roomsSpawned;
        this.timeSpent += s.timeSpent;
        this.tntCollected += s.tntCollected;    
        this.tntThrown+=s.tntThrown;
    }

    render(title, box){
        var y = box.y + 64;
        var title = this.#screen.text(box.center().x, y,title)
        title.attr({ "font-size": "48px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "middle", "font-weight": "bold"});

        var x1 = box.x + 40;
        var x2 = box.x + box.width - 40;
        var indent = 40;
        var attrHeaderLeft = { "font-size": "32px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "start", opacity:0};
        var attrHeaderRight = { "font-size": "32px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "end", opacity:0};
        
        var attrStatLeft = { "font-size": "24px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "start", opacity:0};
        var attrStatRight = { "font-size": "24px", "font-family": "monospace", "fill": "#FFF", "text-anchor": "end", opacity:0};
        
        var stats=[];

        y += 64;
        stats.push(this.#screen.text(x1, y, "LEVELS CLEARED:").attr(attrHeaderLeft))
        
        stats.push(this.#screen.text(x2, y,  numberWithCommas(game.level.number + (game.player.state==State.DEAD ? 0 : 1))).attr(attrHeaderRight));

        y += 64;
        stats.push(this.#screen.text(x1, y, "TIME SPENT:").attr(attrHeaderLeft));
        stats.push(this.#screen.text(x2, y,  msToTime(this.timeSpent)).attr(attrHeaderRight));
        
        y += 64;
        stats.push(this.#screen.text(x1, y, "ROOMS DISCOVERED:").attr(attrHeaderLeft));
        stats.push(this.#screen.text(x2, y,  numberWithCommas(this.roomsVisited) + " / " + numberWithCommas(this.roomsSpawned)).attr(attrHeaderRight));
        
        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"DOORS UNLOCKED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.doorsUnlocked) + " / " + numberWithCommas(this.doorsSpawned)).attr(attrStatRight));

        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"KEYS COLLECTED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.keysCollected) + " / " + numberWithCommas(this.keysSpawned)).attr(attrStatRight));

        y += 64;
        stats.push(this.#screen.text(x1, y,"CHESTS OPENED:").attr(attrHeaderLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.chestsOpened) + " / " + numberWithCommas(this.chestsSpawned)).attr(attrHeaderRight));
        
        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"GOLD COLLECTED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.goldCollected)).attr(attrStatRight));

        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"HEARTS COLLECTED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.heartsCollected)).attr(attrStatRight));
        
        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"TNT COLLECTED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.tntCollected)).attr(attrStatRight));

        y += 64;
        stats.push(this.#screen.text(x1, y,"ENEMIES KILLED:").attr(attrHeaderLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.enemiesKilled) + " / " + numberWithCommas(this.enemiesSpawned)).attr(attrHeaderRight));

        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"DAMAGE DEALT:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.damageDealt)).attr(attrStatRight));

        y += 40;
        stats.push(this.#screen.text(x1 + indent, y,"DAMAGE RECEIVED:").attr(attrStatLeft));
        stats.push(this.#screen.text(x2, y, numberWithCommas(this.damageReceived)).attr(attrStatRight));

        if(this.caveSpidersSpawned>0){       
            y += 40;
            stats.push(this.#screen.text(x1 + indent, y,"SPIDERS SQUASHED:").attr(attrStatLeft));
            stats.push(this.#screen.text(x2, y, numberWithCommas(this.caveSpidersKilled) + " / " + numberWithCommas(this.caveSpidersSpawned)).attr(attrStatRight));
        }
        if(this.swordSkeletonsSpawned>0){       
            y += 40;
            stats.push(this.#screen.text(x1 + indent, y,"SKELETONS SMASHED:").attr(attrStatLeft));
            stats.push(this.#screen.text(x2, y, numberWithCommas(this.swordSkeletonsKilled) + " / " + numberWithCommas(this.swordSkeletonsSpawned)).attr(attrStatRight));
        }
        if(this.kingCobrasSpawned>0){       
            y += 40;
            stats.push(this.#screen.text(x1 + indent, y,"SNAKES STOMPED:").attr(attrStatLeft));
            stats.push(this.#screen.text(x2, y, numberWithCommas(this.kingCobrasKilled) + " / " + numberWithCommas(this.kingCobrasSpawned)).attr(attrStatRight));
        }

        var ms = 0;
        stats.forEach((s,i)=>{
            if(i % 2 == 0){
                ms += 100;
            }
            setTimeout(()=>{s.animate({opacity:1},250)}, ms);
        });

 
    }

}    

