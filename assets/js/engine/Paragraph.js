//REQUIRES VC

VC.Paragraph =  class {
    #text = "";
    #fontFamily = "monospace";
    #fontSize = "12px";
    #fontWeight = "normal";
    #wrapWidth = 400;
    #element = null;
    #fill = "#FFF";

    constructor(text, fontFamily, fontSize, fontWeight, fill, wrapWidth){
        this.#text = text;
        this.#fontFamily = fontFamily;
        this.#fontSize = fontSize;
        this.#fontWeight = fontWeight
        this.#wrapWidth = wrapWidth;
        this.#fill = fill;
    }

    render(screen){
        if(!this.#element){
                
            var words = this.#text.split(" ");
            var composite = "";
            this.#element = screen.text(-10000, -10000, composite);
            this.#element.attr({"font-size": this.#fontSize, "font-family": this.#fontFamily, "font-weight": this.#fontWeight, "fill": this.#fill})

            for(var w = 0; w < words.length; w++){
                this.#element.attr("text", composite + " " + words[w]);
                var width = this.#element.getBBox().width;
                if(width <= this.#wrapWidth){
                    composite += " " + words[w];
                    continue;
                }
                this.#element.attr("text", composite + "\n" + words[w]);
                var width = this.#element.getBBox().width;
                if(width <= this.#wrapWidth){
                    composite += "\n" + words[w];
                    continue;
                }
                composite += "%" + w + "%\n" //handle words too long for line (poorly)
            }
            for(var w = 0; w < words.length; w++){
                composite = composite.replace("%" + w + "%",words[w]);
            }
            
            this.#element.attr("text", composite);
        }
        return this.#element
    }

}