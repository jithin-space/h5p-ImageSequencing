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
  ImageSequencing.Card = function(cardParams, id, seqNumber,unsupportedAudio) {
    /** @alias H5P.ImageSequencing.Card# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    var path = H5P.getPath(cardParams.image.path, id);
    var seqNo = seqNumber;
    var description = cardParams.imageDescription;
    var audio = cardParams.audio;

    var html = (description !== undefined) ? description : '';

    self.createAudioWrapper = function(){

      var audioObj;
      var $audioWrapper = $('<div>', {
        'class': 'h5p-image-sequencing-audio-wrapper'
      });

      if (audio !== undefined) {

        var audioDefaults = {
          files: audio,
          audioNotSupported: unsupportedAudio
        };

        audioObj = new H5P.Audio(audioDefaults, id);
        audioObj.attach($audioWrapper);

    // Have to stop else audio will take up a socket pending forever in chrome.
        if (audioObj.audio && audioObj.audio.preload) {
          audioObj.audio.preload = 'none';
        }
      }
      else {
        $audioWrapper.addClass('hide');
      }

      self.audio = audioObj;

      return $audioWrapper;
    }
    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function($container) {

      self.$audio = self.createAudioWrapper();
      $card = $('<li class="sequencing-item draggabled" id="item_' + seqNumber + '">' +
        '<span class="sequencing-mark"></span></li>');
      $image = $('<div class="image-container">' +
      '<img src="' + path + '" alt="' + description + '"/>' +
      '</div>' +
      '<div class="image-desc">' +
      '<span class="text">' + html + '</span>' +
      '</div>');


        $card.append(self.$audio);
        $card.append($image);
        $card.appendTo($container);


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
