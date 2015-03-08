/*
http://davidwalsh.name/street-fighter
http://stackoverflow.com/questions/3393162/creating-a-css-class-in-jquery
http://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-singleton-in-javascript

*/

var spriteAnimation = (function() {
    //singleton instance
    var animations = {};
    var browser_prefixes = ["-webkit-", "-moz-", "-ms-", ""];

    function addClasses (classes) {
        var style = '<style>' + classes + '</style>';
        $('html > head').append(style);
    }

    return { // public interface
        addSpriteSheet: function(sheet_id, url, options){
            /* options
                - url is a path to an image sprite sheet
                - width of exactly the size of an image in our sprite
                - height of exactly the size of an image in our sprite
             */
            options.url = url;
            if (!options.url){ throw "options needs url to be defined";}
            var classes = "." + sheet_id + " { width:"+(options.width || 50)+"px; height:"+(options.height || 50)+"px; background-image:url('"+options.url+"'); }";
            addClasses(classes);
            options.css_style = classes;
            animations[sheet_id] = JSON.parse(JSON.stringify(options));
        },
        addAnimation: function (sheet_id, animation_id, options) {
            /* options
                - repeate: number|infinite|initial|inherit http://www.w3schools.com/cssref/css3_pr_animation-iteration-count.asp
                - steps: is the number of images is in our defined slot
                - duration: is the time of the animation in milli seconds
            */
            // all private members are accesible here
            var duration = options.duration/1000;
            var classes = "."+animation_id+" {";
            for (var i in browser_prefixes){
                classes = classes + browser_prefixes[i] + "animation: "+animation_id+" steps("+options.steps+") "+duration+"s " + (options.repeate || "infinite") + ";";
            }
            options.css_style = classes + "}";
            addClasses(classes);
            // do the animation seq
            classes = "";
            for (i in browser_prefixes){
                //classes = classes + "@"+browser_prefixes[i]+"keyframes explode {from { background-position:"+(options.animate_from_x || 0)+"px "+(options.animate_from_y || 0)+"px; }to { background-position:"+(options.animate_to_x || options.animate_from_x || 0)+"px "+(options.animate_to_y || options.animate_from_y || 0)+"px; }}"
                classes = classes + "@"+browser_prefixes[i] + "keyframes "+animation_id+" {from { background-position:"+(options.animate_from_x || 0)+"px "+(options.animate_from_y || 0)+"px; }to { background-position:"+(options.animate_to_x || options.animate_from_x || 0)+"px "+(options.animate_to_y || options.animate_from_y || 0)+"px; }}"
            }
            addClasses(classes);
            options.css_style = options.css_style + classes;
            animations[sheet_id][animation_id] = options;
        },
        play: function (element_id, sheet_id, animation_id) {
            if(!animations[sheet_id][animation_id]){
                throw "Animation was not defined in sheet";
            }
            $(element_id).addClass(sheet_id);
            $(element_id).addClass(animation_id);
            //if (animations[sheet_id][animation_id][repeate] == "oneshoot"){
            setTimeout(function() { $(element_id).removeClass(animation_id); }, animations[sheet_id][animation_id]["duration"]);
            //}
        },
        stop: function (element_id, animation_id) {
            $(element_id).removeClass(animation_id);
        }
    };
})();
