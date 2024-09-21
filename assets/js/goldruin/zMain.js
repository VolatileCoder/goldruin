//REQUIRES Game

var game

VC.Client.OnReady(()=>{
    game = new Game();

    game.screen.canvas.addEventListener("touchstart",function(e){
        VC.Client._orientation = VC.Orientation.PORTRAIT;
        changeOrientation();
    });
    changeOrientation();
    
    
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pause();
        }
    });
    
    game.debug = DEBUG;
    game.play();
})


window.onerror = function(message, source, lineNumber, colno, error) {
    if(!game.debug){
            
        body = encodeURI(`
        Send this email to help debug the issue!
        
        Message: ${message}
        
        Error: ${error}

        LineNumber: ${lineNumber}, ${colno}

        Call Stack:
        ${error.stack.replaceAll("https://goldruin.com/play/", "")}

        `);

        uri = `mailto:Gold Ruin Developers<goldruindev@gmail.com>?subject=GoldRuin ${VERSION} Exception&body=${body}`

        if(confirm("Exception Found!\n\nWould you like to send this error to the developers?")){
            window.open(uri, "_self");
        }

    }
};
