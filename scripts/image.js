(function(ImageSequencing, EventDispatcher, $) {

  /**
   * Controls all the operations for each image
   *
   * @class H5P.ImageSequencing.Image
   * @extends H5P.EventDispatcher
   * @param {Object} image
   * @param {number} id
   * @param {number} seq_no
   * @param {string} [description]
   */
  ImageSequencing.Image = function(image, id, seqNumber, movesText) {
    /** @alias H5P.ImageSequencing.Image# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);

    var path = H5P.getPath(image.path, id);
    var seqNo = seqNumber;
    var description = description;
    var moves = 0;

    /**
     * get the image description
     * @returns {string}
     */
    self.getMovesText = function() {
      return movesText;
    };

    /**
     * set the image position
     */

    self.setPos = function(pos) {
      self.pos = pos;
    }

    /**
     * get the number of image moves
     * @returns {number}
     */

    self.getMoves = function() {
      return moves;
    }

    /**
     * increment the image moves
     */

    self.setMoves = function() {
      moves++;
    }

    /**
     * get the image position
     * @returns {number}
     */
    self.getPos = function() {
      return self.pos;
    }
    /**
     * get the image sequence number
     * @returns {number}
     */
    self.getSequenceNo = function() {
      return seqNo;
    };
    /**
     * set it to the class correct*/
    self.setCorrect = function() {
      self.$dropper.removeClass('incorrect');
      self.$dropper.addClass('correct');
    }
    /**
     * set it to the class incorrect*/
    self.setIncorrect = function() {
      self.$dropper.removeClass('correct');
      self.$dropper.addClass('incorrect');
    }
    /**
     * set next to the next element in the imageList
     * @param {H5P.ImageSequencing.Image} image
     */
    self.setNext = function(image) {
      self.next = image;
    }

    /**
     * set previous to previous element in the imageList
     * @param {H5P.ImageSequencing.Image} image
     */
    self.setPrev = function(image) {
      self.prev = image;
    }

    /**
     * get the next element in the imageList
     * @return {H5P.ImageSequencing.Image}
     */
    self.getNext = function() {
      return self.next;
    }

    /**
     * get the previous element in the imageList
     * @return {H5P.ImageSequencing.Image}
     */
    self.getPrevious = function() {
      return self.prev;
    }

    /**
     * give correctly positioned element a green border
     */
    self.setCorrect = function() {
      self.$dropper.css('border', '2px solid green');
    }

    /**
     * give incorrectly positioned element a red border
     */
    self.incorrect = function() {
      self.$dropper.css('border', '2px solid red');
    }

    /**
     * when dragstart event is fired on the image
     */
    self.handleStart = function(e) {
      self.$dropper.css('opacity', '0.4');
      dragSrcEl_ = self;
      self.$dropper.addClass('moving');
      e.originalEvent.dataTransfer.effectAllowed = 'move';
      self.trigger('drag'); //for firing the timer when drag starts on an image element
    }
    /**
     * when an image (drag) enter into the droppable (self) area of another image
     */
    self.handleDragEnter = function(e) {
      self.$dropper.addClass('over');
      if (dragSrcEl_.pos != self.pos) {
        var i = self.pos;
        var move = Math.abs(dragSrcEl_.pos) - self.pos;
        var current = self;
        if (move > 0) {
          //shift all elements to right starting from the current position
          while (current != undefined && move != 0) {
            next = current.getNext();
            current.pos += 1;
            current = next;
            move--;
          }
        } else {
          //shift all elements to left starting from current position
          while (current != undefined && move != 0) {
            prev = current.getPrevious();
            current.pos -= 1;
            current = prev;
            move++;
          }
        }

        dragSrcEl_.pos = i - (i * 2); //set its pos negative so that a dropper can be placed at that position
        self.trigger('reattach'); //trigger reattach of the images to the container

      }

    }

    /**
     * when an image(self) enter into the droppable area of another image
     */
    self.handleDragOver = function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.originalEvent.dataTransfer.dropEffect = 'move';
      return false;
    }

    /**
     * when an image leaves the droppable area of another image (self)
     */
    self.handleDragLeave = function(e) {
      self.$dropper.removeClass('over');
    }
    /**
     * when an image dragging finally ends.
     */

    self.handleDragEnd = function(e) {
      self.$dropper.removeClass('moving');
      self.$dropper.css('opacity', '1');
    }

    /**
     * when an image leaves the droppable area of another image (self)
     */
    self.handleDrop = function(e) {

      if (e.preventDefault) {
        e.preventDefault(); // stops the browser from redirecting.
      }
      self.$dropper.removeClass('over');
      return false;
    }

    /**
     * Append the image to the imageHolder
     * with the spcified holder and imagesizes
     * and attach all event listeners.
     * @param {H5P.jQuery} $container
     * @param {array} size
     */


    self.appendTo = function($container, size) {
      self.$dropper = $('<div class="columns" width="' + size[0] + 'px" height="' + size[0] + 'px" draggable="true"><header class="count" data-col-moves="0">' + self.getMovesText() + ':' + self.getMoves() + '</header><div>\
            <img src="' + path + '"  alt="Sequence Image Card" width="' + size[1] + 'px" height="' + size[1] + 'px"/></div></div>').appendTo($container);
      self.$dropper.on('dragstart', function(e) {
        self.handleStart(e)
      });
      self.$dropper.on('dragenter', function(e) {
        self.handleDragEnter(e)
      });
      self.$dropper.on('dragover', function(e) {
        self.handleDragOver(e)
      });
      self.$dropper.on('dragleave', function(e) {
        self.handleDragLeave(e)
      });
      self.$dropper.on('dragend', function(e) {
        self.handleDragEnd(e)
      });
      self.$dropper.on('drop', function(e) {
        self.handleDrop(e)
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
