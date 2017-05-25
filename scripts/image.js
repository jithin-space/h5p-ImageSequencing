(function(ImageSequencing, EventDispatcher, $) {

  /**
   * Controls all the operations for each image
   *
   * @class H5P.ImageSequencing.Image
   * @extends H5P.EventDispatcher
   * @param {Object} image
   * @param {number} id
   * @param {number} seqNumber
   * @param {string} imageDescription
   */
  ImageSequencing.Image = function(image, id, seqNumber, imageDescription) {
    /** @alias H5P.ImageSequencing.Image# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    var path = H5P.getPath(image.path, id);
    var seqNo = seqNumber;
    var description = description;
    /**
     * get the image description
     * @returns {string}
     */
    self.getImageDescription = function() {
      return imageDescription;
    };
    /**
     * set the image position
     */
    self.setPos = function(pos) {
      self.pos = pos;
    };
    /**
     * get the image position
     * @returns {number}
     */
    self.getPos = function() {
      return self.pos;
    };
    /**
     * get the image sequence number
     * @returns {number}
     */
    self.getSequenceNo = function() {
      return seqNo;
    };
    /**
     * set it to the class correct
     */
    self.setCorrect = function() {
      self.$dropper.removeClass('sequencing-incorrect');
      self.$dropper.addClass('sequencing-correct');
    };
    /**
     * set it to the class incorrect
     */
    self.setIncorrect = function() {
      self.$dropper.removeClass('sequencing-correct');
      self.$dropper.addClass('sequencing-incorrect');
    };
    /**
     * set next to the next node in the linkedList
     * @param {H5P.ImageSequencing.Image} or {H5P.ImageSequencing.Dropper} node
     */
    self.setNext = function(node) {
      self.next = node;
    };

    /**
     * set previous to previous node in the linkedList
     * @param {H5P.ImageSequencing.Image} or {H5P.ImageSequencing.Dropper} node
     */
    self.setPrev = function(node) {
      self.prev = node;
    };
    /*
     *for getting the type of the node in the linked list
     * @return {String}
     */
    self.getType = function() {
      return "Image";
    };
    /**
     * get the next element in the linkedList
     * @return {H5P.ImageSequencing.Image} or {H5P.ImageSequencing.Dropper}
     */
    self.getNext = function() {
      return self.next;
    };

    /**
     * get the previous element in the imageList
     * @return {H5P.ImageSequencing.Image}
     */
    self.getPrev = function() {
      return self.prev;
    };

    /**
     * when dragstart event is fired on the image
     */
    self.handleStart = function(e) {
      self.$dropper.css('opacity', '0.4');
      self.$dropper.addClass('moving');
      e.originalEvent.dataTransfer.effectAllowed = 'move';
      self.trigger('drag'); //for firing the timer when drag starts on an image element
      self.trigger('dragstart', self.pos); //for firing the dragStart handling at the linkedList
    };
    /**
     * when an image (drag) enter into the droppable (self) area of another image
     */
    self.handleDragEnter = function(e) {
      self.$dropper.addClass('over');
      self.trigger('dragenter', self.pos); //for firing dragenter event handling at linkeList
    };

    /**
     * when an image(self) enter into the droppable area of another image
     */
    self.handleDragOver = function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.originalEvent.dataTransfer.dropEffect = 'move';
      return false;
    };

    /**
     * when an image leaves the droppable area of another image (self)
     */
    self.handleDragLeave = function(e) {
      self.$dropper.removeClass('over');
      self.trigger('dragLeave'); //for firing the dragleave event handling at the linkedList
    };
    /**
     * when an image dragging finally ends.
     */

    self.handleDragEnd = function(e) {
      self.$dropper.removeClass('moving');
    };

    /**
     * when an image leaves the droppable area of another node (self)
     */
    self.handleDrop = function(e) {

      if (e.preventDefault) {
        e.preventDefault(); // stops the browser from redirecting.
      }
      self.$dropper.removeClass('over');
      self.$dropper.removeClass('moving');
      return false;
    };

    /**
     * Append the image to the imageHolder
     * with the spcified holder and imagesizes
     * and attach all event listeners.
     * @param {H5P.jQuery} $container
     * @param {array} size
     */

    self.appendTo = function($container, size) {
      self.$dropper = $('<div class="sequencing-columns" width="' + size[0] + 'px" height="' + size[0] + 'px" draggable="true">\
                            <header class="sequencing-header" >' + self.getImageDescription() + '</header><div>\
                              <img src="' + path + '"  alt="Sequence Image Card" width="' + size[1] + 'px" height="' + size[1] + 'px"/>\
                            </div></div>').appendTo($container);
      // registering event listeners
      self.$dropper.on('dragstart', function(e) {
        self.handleStart(e);
      });
      self.$dropper.on('dragenter', function(e) {
        self.handleDragEnter(e);
      });
      self.$dropper.on('dragover', function(e) {
        self.handleDragOver(e);
      });
      self.$dropper.on('dragleave', function(e) {
        self.handleDragLeave(e);
      });
      self.$dropper.on('dragend', function(e) {
        self.handleDragEnd(e);
      });
      self.$dropper.on('drop', function(e) {
        self.handleDrop(e);
      });
    };
  };
  // Extends the event dispatcher
  ImageSequencing.Image.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.Image.prototype.constructor = ImageSequencing.Image;
  /**
   * Check to see if the given object corresponds with the semantics for
   * a ImageSequencing image
   * @param {object} params
   * @returns {boolean}
   */
  ImageSequencing.Image.isValid = function(params) {
    return (params !== undefined && params.image !== undefined && params.image.path !== undefined);
  };

})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
