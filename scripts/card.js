(function(ImageSequencing, EventDispatcher, $) {

  /**
   * Controls all the operations for each image card
   *
   * @class H5P.ImageSequencing.Card
   * @extends H5P.EventDispatcher
   * @param {Object} image
   * @param {number} id
   * @param {number} seqNumber
   * @param {string} imageDescription
   */
  ImageSequencing.Card = function(image, id, seqNumber, imageDescription) {
    /** @alias H5P.ImageSequencing.Card# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    var path = H5P.getPath(image.path, id);
    var seqNo = seqNumber;
    var description = imageDescription;
    /*
     * set the image cards dimensions
     */
    if (image.width !== undefined && image.height !== undefined) {
      if (image.width > image.height) {
        width = '100%';
        height = 'auto';
      } else {
        height = '100%';
        width = 'auto';
      }
    } else {
      width = height = '100%';
    }

    var html = (description !== undefined) ? description : '';


    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function($container) {
      $card = $('<li class="h5p-drag-wrap" id="item_' + seqNumber + '"><div class="sequencing-item draggabled" role="button" tabindex="1"><span class="sequencing-mark"></span>' +
        '<div class="image-container">' +
        '<img src="' + path + '" alt="Memory Card" width=' + width + ' height=' + height + '/>' +
        '</div>' +
        '<span class="text">' + html + '</span>' +
        '</div></li>').appendTo($container);
    };

  };

  // Extends the event dispatcher
  ImageSequencing.Card.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.Card.prototype.constructor = ImageSequencing.Card;

  /**
   * Check to see if the given object corresponds with the semantics for
   * a ImageSequencing image Card
   * @param {object} params
   * @returns {boolean}
   */
  ImageSequencing.Card.isValid = function(params) {
    return (params !== undefined && params.image !== undefined && params.image.path !== undefined);
  };


})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
