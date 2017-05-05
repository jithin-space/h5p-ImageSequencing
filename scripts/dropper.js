(function(ImageSequencing, EventDispatcher, $) {
  /**
   * Controls all the operations on the dropper object created
   *
   * @class H5P.ImageSequencing.Dropper
   * @extends H5P.EventDispatcher
   *
   */

  ImageSequencing.Dropper = function() {
    /** @alias H5P.ImageSequencing.Dropper# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    var pos = 0;
    /**
     * set the image position
     */
    self.setPos = function(position) {
      pos = pos;
    }
    /**
     * get the image position
     * @returns {number}
     */
    self.getPos = function() {
      return pos;
    }

    /**
     * when an image enter into the dropper
     */
    self.handleDragEnter = function(e) {
      self.$dropper.addClass('over');
    }
    /**
     * when an image drag over the dropper
     */
    self.handleDragOver = function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.originalEvent.dataTransfer.dropEffect = 'move';

      return false;
    }
    /**
     * when an image drag leave the dropper
     */

    self.handleDragLeave = function(e) {
      self.$dropper.removeClass('over');
    }
    /**
     * when an image drops on dropper element
     */
    self.handleDrop = function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // stops the browser from redirecting.
      }
      pos = dragSrcEl_.getPos();
      pos = pos - (pos * 2);
      dragSrcEl_.setPos(pos);
      dragSrcEl_.setMoves();
      self.trigger('reattach');
      return false;
    }
    /**
     * Append the dropper to the imageHolder
     * with the spcified holder and imagesizes
     * and attach all event listeners.
     * @param {H5P.jQuery} $container
     * @param {array} size
     */

    self.appendTo = function($container, size) {
      self.$dropper = $('<div class="columns" width="' + size[0] + 'px" height="' + size[0] + 'px" ><header class="count" data-col-moves="0">Drop Here</header>\
              <div style="min-height:' + size[1] + 'px;min-width:' + size[1] + 'px;">please drop </div></div>').appendTo($container);
      self.$dropper.on('dragenter', function(e) {
        self.handleDragEnter(e)
      });
      self.$dropper.on('dragover', function(e) {
        self.handleDragOver(e)
      });
      self.$dropper.on('dragleave', function(e) {
        self.handleDragLeave(e)
      });
      self.$dropper.on('drop', function(e) {
        self.handleDrop(e)
      });
    };
  };

  // Extends the event dispatcher
  ImageSequencing.Dropper.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.Dropper.prototype.constructor = ImageSequencing.Dropper;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
