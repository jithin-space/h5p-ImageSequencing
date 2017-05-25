(function(ImageSequencing, EventDispatcher, $) {
  /**
   * Controls all the operations on the dropper object created
   *
   * @class H5P.ImageSequencing.Dropper
   * @extends H5P.EventDispatcher
   * @param {Number} position
   * @param {String} dropperText
   */

  ImageSequencing.Dropper = function(position,dropperText) {
    /** @alias H5P.ImageSequencing.Dropper# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    self.pos = position;
    /**
     * @returns {String}
     */
     self.getDropperText = function() {
       return dropperText;
     };
     /**
      * @returns {undefined}
      */
     self.setPos = function(pos) {
       self.pos = pos;
     };
     /**
      * return the type of linkedList Element
      * either Image or Dropper
      * @returns {String}
      */
     self.getType = function(){
       return "Dropper";
     };
    /**
     * get the dropper's current position
     * @returns {number}
     */
     self.getPos = function() {
       return self.pos;
     };
     /**
      * sets the next property to the next element in the list
      */
     self.setNext = function(node) {
       self.next = node;
     };
     /**
      * sets the prev property to the previous element in the list
      */
     self.setPrev = function(node) {
       self.prev = node;
     };
     /**
      * returns the next element in the list
      * @returns {H5P.ImageSequencing.Image} or {H5P.ImageSequencing.Dropper}
      */
     self.getNext = function() {
       return self.next;
     };

     /**
      * returns the previous element in the list
      * @returns {H5P.ImageSequencing.Image} or {H5P.ImageSequencing.Dropper}
      */
     self.getPrev = function() {
        return self.prev;
     };

    //  event listeners on dropper element

    /**
     * when an image enter into the dropper
     */
    self.handleDragEnter = function(e) {
      self.$dropper.addClass('over');
    };
    /**
     * when an image drag over the dropper
     * @return {boolean}
     */
    self.handleDragOver = function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.originalEvent.dataTransfer.dropEffect = 'move';
      return false;
    };
    /**
     * when an image drag leave the dropper
     * @return {undefined}
     */

    self.handleDragLeave = function(e) {
      self.$dropper.removeClass('over');
      self.trigger('dragLeave'); //trigger the dragLeave event
    };
    /**
     * when an image drops on dropper element
     * @return {boolean}
     */
    self.handleDrop = function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // stops the browser from redirecting.
      }
      self.trigger('drop'); //trigger the drop event
      return false;
    };
    /**
     * Append the dropper to the container element
     * with the spcified holder and imagesizes
     * and attach all event listeners.
     * @param {H5P.jQuery} $container
     * @param {array} size
     */

    self.appendTo = function($container, size) {
      self.$dropper = $('<div class="sequencing-columns" width="' + size[0] + 'px" height="' + size[0] + 'px" >\
                            <header class="sequencing-header" data-col-moves="0">'+self.getDropperText()+'</header>\
                            <div style="min-height:' + size[1] + 'px;min-width:' + size[1] + 'px;width:auto !important;"></div>\
                          </div>').appendTo($container);
      self.$dropper.on('dragenter', function(e) {
        self.handleDragEnter(e);
      });
      self.$dropper.on('dragover', function(e) {
        self.handleDragOver(e);
      });
      self.$dropper.on('dragleave', function(e) {
        self.handleDragLeave(e);
      });
      self.$dropper.on('drop', function(e) {
        self.handleDrop(e);
      });
    };
  };

  // Extends the event dispatcher
  ImageSequencing.Dropper.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.Dropper.prototype.constructor = ImageSequencing.Dropper;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
