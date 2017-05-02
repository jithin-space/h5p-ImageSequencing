(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Dropper = function( id, seq_no) {

        var self = this;
        EventDispatcher.call(self);

        self.handleDrop=function(e) {
        // this / e.target is current target element.


        if (e.preventDefault) {
          e.preventDefault(); // stops the browser from redirecting.
        }


        if (dragSrcEl_.pos != self.pos) {

          dragSrcEl_.pos=e.originalEvent.dataTransfer.getData('pos');
          self.trigger('reattach');
        }
      }


          self.appendTo = function($container,width) {
              self.$dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" ><header class="count" data-col-moves="0">moves:0</header>\
              <div style="min-height:'+width[1]+'px;min-width:'+width[1]+'px;">please drop </div></div>').appendTo($container);
              self.$dropper.on('drop',function(e){self.handleDrop(e)});
          };



    };

    // Extends the event dispatcher
    ImageSequencing.Dropper.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Dropper.prototype.constructor = ImageSequencing.Dropper;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
