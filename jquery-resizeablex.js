(function(window,$){"use strict";
/**
 * resizeable-x 
 * 
 * events 
 *       raxdragstart
 *       raxdragmove  
 *       raxdragend  
 *       raxmove
 *       raxstart
 *       raxend
 * 
 * 
 * @param Jquery element
 * @returns {jquery-resizeablex_L1.Resizablex}
 * @author xilei
 */
//resize handle html 
var handleTpl = '<div class="resizable-handle resizable-{d}"></div>';

var resizeHandles = {
        n:function(resize){
            var resizeh = resize.h+resize.t-resize.y;
            if(resizeh<resize.options.minh){
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
            if(resizew < resize.options.minw){
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
};

var _current = null;

var defaultOptions = {
    minh:10,
    minw:10,
    dragable:true
};

/**
 * resizeable manager 
 * @type type
 */
var RaxMananer = {
    _items:{},
    
    guid:0,
    
    create:function(element,options){
        var id = element.attr('id') || 'rax_'+this.guid++ ;
        this._items[id] = new Resizablex(element,options);
        return this._items[id];
    },
    
    get:function(id){
        return this._items[id];
    },
    
    call:function(fn,params){
        var checked = false,id=null;
        for(id in this._items){
            if(!checked && $.type(this._items[id][fn]) != 'function'){
                break;                
            }
            checked = true;
            this._items[id][fn](params);
        }
    }
};

var Resizablex = function(element,options){
         var _pos = element.position();
         this.dom = element;
         this.w = this.dom.width();
         this.h = this.dom.height();
         this.l = _pos.left;
         this.t = _pos.top;
         this.x = 0;
         this.y = 0;         
         this.options = $.extend({},defaultOptions,options);
         this.direction = null;
         this.dragoffset = null;
         this.controls = {};
         this.init();
     };    

    Resizablex.prototype = {

        init:function(){
            for(var direction in resizeHandles){
                this.controls[direction] = $(handleTpl.replace('{d}',direction));
                this.dom.append(this.controls[direction]);
                this.controls[direction]
                        .bind('mousedown',{direction:direction},$.proxy(this,'_mousedown'));
            }
            if(this.options.dragable){
                this.dom.bind('mousedown',$.proxy(this,'_dragmousedown'));
            }
        },

        _mousedown:function(e){
            if(this.dom.hasClass('rax-disable')){
                return true;
            }
            if(e.button===2)return false;
            e.stopPropagation();
            this.direction = e.data.direction;
            _current = this;
            this.dom.triggerHandler($.Event('raxstart',{rax:this}));
            return true;
        },

        width:function(value){
            if(value){
               this.w = value;
            }
            this.w = this.w < this.options.minw ? this.options.minw :this.w ;
            this.dom.width(this.w);
            return this;
        },
        height:function(value){
            if(value){
               this.h = value;
            }
            this.h = this.h < this.options.minh ? this.options.minh :this.h ;
            this.dom.height(this.h);
            return this;
        },

        left:function(value){
            if(value){
               this.l = value;
            }
            this.dom.css('left',this.l);
        },

        top:function(value){
            if(value){
               this.t = value;
            }
            this.dom.css('top',this.t);
        },
        
        limit:function(w,h){
            this.options.minw = w>0 ? w : 0;
            this.options.minh = h>0 ? h : 0;
        },
        
        //@todo disabled some direction  resize 
        disable:function(){
            this.dom.addClass('rax-disable');
        },
        
        //@todo enabled some direction  resize 
        enable:function(){
            this.dom.removeClass('rax-disable');
        },
        
        dragdisable:function(){
            this.dom.addClass('rax-drag-disable');
        },
        
        dragenable:function(){
           this.dom.removeClass('rax-drag-disable'); 
        },
        
        _dragmousedown:function(e){
            if(this.dom.hasClass('rax-drag-disable')){
                return true;
            }
            if(e.button===2)return false;
            
            e.stopPropagation();
            this.dragoffset = {
                x:e.clientX-this.l,
                y:e.clientY-this.t
            };
            _current = this;
            this.dom.triggerHandler($.Event('raxdragstart',{rax:this}));
        },
        
        _dragmousemove:function(e){
            this.l = e.clientX-this.dragoffset.x;
            this.t = e.clientY-this.dragoffset.y;
            this.dom.css({'left':this.l,'top':this.t});
        }
};
//less callback
$(window.document).bind('mousemove',function(e){
    if(!_current){
        return true;
    }
    e.preventDefault();
    e.stopPropagation();
    if(_current.direction){
        _current.x = e.clientX;
        _current.y = e.clientY;
        resizeHandles[_current.direction](_current);
        _current.dom.triggerHandler($.Event('raxmove',{rax:_current}));
    }else if(_current.dragoffset){
        _current._dragmousemove(e);
        _current.dom.triggerHandler($.Event('raxdragmove',{rax:_current}));
    }
}).bind('mouseup',function(e){
    if(!_current){
        return true;
    }
    e.stopPropagation();
    if(_current.direction){
        _current.dom.triggerHandler($.Event('raxend',{rax:_current}));
        _current.direction = null;
    }else if(_current.dragoffset){
        _current.dom.triggerHandler($.Event('raxdragend',{rax:_current}));
         _current.dragoffset = null;
    }
    _current = null;
});

/**
 * options object see defaultOptions
 *         string disable|enable|dragdisable|dragenable 
 * @returns jquery instance
 */
$.fn.resizeablex = function(options){
    if($.type(options) == 'string'){
        RaxMananer.call(options);
    }else{
        this.each(function(){
          RaxMananer.create($(this),options);
        });
    }
    return this;
};

})(window,jQuery);

