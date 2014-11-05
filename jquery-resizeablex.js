(function(window,$){
/**
 * resizeable-x 
 * @param Jquery element
 * @returns {jquery-resizeablex_L1.Resizablex}
 * @author xilei
 */
var Resizablex = function(element){
         var _pos = element.position();
         this.dom = element;
         this.w = this.dom.width();
         this.h = this.dom.height();
         this.l = _pos.left;
         this.t = _pos.top;
         this.x = 0;
         this.y = 0;
         this.direction = null;
         this.controls = {};
         this.init();
     };
    //resize handle html 
    Resizablex.htmlTpl = '<div class="resizable-handle resizable-{d}"></div>';

    Resizablex.prototype = {

        resizeHandles:{
            n:function(resize){
                var resizeh = resize.h+resize.t-resize.y;
                if(resizeh<0){
                    return ;
                }
                resize.h = resizeh;
                resize.t = resize.y;               
                resize.top();
                resize.height();
            },
            e:function(resize){
                resize.w = resize.x - resize.l;
                resize.width();
            },
            s:function(resize){
                resize.h = resize.y - resize.t;
                resize.height();
            },
            w:function(resize){
                var resizew = resize.w+resize.l-resize.x;
                if(resizew<0){
                    return ;
                }
                resize.w = resizew;
                resize.l = resize.x;
                resize.left();
                resize.width();
            },
            se:function(resize){
                this.s(resize);this.e(resize);
            },
            sw:function(resize){
                this.s(resize);this.w(resize);
            },
            ne:function(resize){
                this.n(resize);this.e(resize);
            },
            nw:function(resize){
                this.n(resize);this.w(resize);
            }
        },

        init:function(){
            for(var direction in this.resizeHandles){
                this.controls[direction] = $(Resizablex.htmlTpl.replace('{d}',direction));
                this.dom.append(this.controls[direction]);
                this.controls[direction]
                        .bind('mousedown',{direction:direction},$.proxy(this,'_mousedown'));
            }
            //@todo: only bind once
            $(window.document)
                    .bind('mousemove',$.proxy(this,'_mousemove'))
                    .bind('mouseup',$.proxy(this,'_mouseup'));
        },

        _mousedown:function(e){
            e.stopPropagation();
            this.direction = e.data.direction;
            return true;
        },

        _mousemove:function(e){
            if(!this.direction){return true;}
            e.preventDefault();
            e.stopPropagation();
            this.x = e.clientX;
            this.y = e.clientY;
            this.resizeHandles[this.direction](this);
            return true;
        },

        _mouseup:function(e){
            e.stopPropagation();
            this.direction = null;
            return true;
        },

        width:function(value){
            if(!value){
                value = this.w;
            }
            this.dom.width(value < 0 ? 0 :value);
            return this;
        },
        height:function(value){
            if(!value){
                value = this.h;
            }
            this.dom.height(value < 0 ? 0 :value);
            return this;
        },

        left:function(value){
            if(value===undefined){
                value = this.l;
            }
            this.dom.css('left',value);
        },

        top:function(value){
            if(value===undefined){
                value = this.t;
            }
            this.dom.css('top',value);
        },
        
        //@todo disabled some direction  resize 
        disabled:function(){

        },
        
        //@todo enabled some direction  resize 
        enabled:function(){

        },
        
        //@todo dragable for element
        dragable:function(){

        }

   };

$.fn.resizeablex = function(){
    $.each(this,function(){
       new Resizablex($(this));
    });
};

})(window,jQuery);

