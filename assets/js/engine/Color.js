class Color{
    static hexToRGB(hexColor){
        if(hexColor.length==6 || hexColor.length == 3){
            hexColor = "#" + hexColor
        }
        var red = "00";
        var green = "00";
        var blue = "00"
        if(hexColor.length == 4){
            red = hexColor.substring(1,2);
            red += red;
            green = hexColor.substring(2,3);
            green += green;
            blue = hexColor.substring(3,4);
            blue += blue;
        }
        if(hexColor.length == 7){
            red = hexColor.substring(1,3);
            green = hexColor.substring(3,5);
            blue = hexColor.substring(5,7);
        }

        return {
            r: parseInt(red,16),
            g: parseInt(green,16),
            b: parseInt(blue,16)
        }
    }

    static rgbToHex(rgb){
        var hex="#"
        hex += right("0" + rgb.r.toString(16),2);
        hex += right("0" + rgb.g.toString(16),2);
        hex += right("0" + rgb.b.toString(16),2);
        return hex;
    }

    static calculateAlpha(backgroundHex, foregroundHex, foregroundOpacity){
        //alpha * new + (1 - alpha) * old
        var backgroundRGB = Color.hexToRGB(backgroundHex);
        var foregroundRGB = Color.hexToRGB(foregroundHex);
        return Color.rgbToHex({
            r: Math.round(foregroundRGB.r * foregroundOpacity + (1-foregroundOpacity) * backgroundRGB.r),
            g: Math.round(foregroundRGB.g * foregroundOpacity + (1-foregroundOpacity) * backgroundRGB.g),
            b: Math.round(foregroundRGB.b * foregroundOpacity + (1-foregroundOpacity) * backgroundRGB.b)
        });
    }
}