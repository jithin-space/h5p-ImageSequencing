(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Dropper = function(pos) {

        var self = this;
        EventDispatcher.call(self);
        self.pos=pos;
        var setPos = function(pos){
          self.pos=pos;
        }
        var getPos = function(){
          return self.pos;
        }
        self.handleDragOver=function(e) {
          if (e.preventDefault) {
          e.preventDefault();
          }
          e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

          return false;
          }

          self.handleDragEnter=function(e) {

             self.$dropper.addClass('over');


            }


          self.handleDragLeave=function(e) {
            self.$dropper.removeClass('over');  // this / e.target is previous target element.
          }

        self.handleDrop=function(e) {


        if (e.preventDefault) {
          e.preventDefault(); // stops the browser from redirecting.
        }



          // dragSrcEl_=e.originalEvent.dataTransfer.getData('src');
          dragSrcEl_.pos=self.pos;
          dragSrcEl_.setMoves();
          self.trigger('reattach');


        return false;
      }



          self.appendTo = function($container,width) {
              self.$dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" ><header class="count" data-col-moves="0">Drop Here</header>\
              <div style="min-height:'+width[1]+'px;min-width:'+width[1]+'px;">please drop </div></div>').appendTo($container);

              self.$dropper.on('dragenter',function(e){self.handleDragEnter(e)});
              self.$dropper.on('dragover',function(e){self.handleDragOver(e)});
              self.$dropper.on('dragleave',function(e){self.handleDragLeave(e)});
              self.$dropper.on('drop',function(e){self.handleDrop(e)});

          };



    };

    // Extends the event dispatcher
    ImageSequencing.Dropper.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Dropper.prototype.constructor = ImageSequencing.Dropper;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
