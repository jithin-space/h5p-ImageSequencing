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
  ImageSequencing.Card = function(cardParams, id, seqNumber, unsupportedAudio) {
    /** @alias H5P.ImageSequencing.Card# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);
    var path = H5P.getPath(cardParams.image.path, id);
    self.seqNo = seqNumber;
    self.isSelected = false;
    self.description = cardParams.imageDescription;
    var audio = cardParams.audio;
    var html = (self.description !== undefined) ? self.description : '';




    /**
     * self - create a container with audio files
     *
     * @return {H5P.jQuery}  $audioWrapper
     */

    self.createAudioWrapper = function() {
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
    };

    /**
     * assign the correctly positioned card with class correct
     */
    self.setCorrect = function() {
      self.$card.removeClass('sequencing-incorrect').addClass(
        'sequencing-correct');
      self.$card.find('.sequencing-mark').removeClass(
        'sequencing-incorrect-mark').addClass('sequencing-correct-mark');
    };


    /**
     * mark the card as solved
     */
    self.setSolved = function() {
      self.$card.removeClass('sequencing-incorrect').addClass(
        'sequencing-correct');
    };

    /*
     * assign the incorrectly positioned card with class incorrect
     */
    self.setIncorrect = function() {
      self.$card.removeClass('sequencing-correct').addClass(
        'sequencing-incorrect');
      self.$card.find('.sequencing-mark').removeClass(
        'sequencing-correct-mark').addClass('sequencing-incorrect-mark');
    };

    /**
     * toggle between selected and unselected states
     */
    self.setSelected = function() {
      if (!self.isSelected) {
        self.isSelected = true;
        self.$card.addClass('selected');
        self.$audio.find('button').attr('tabindex','0');
        self.trigger('selected');
      } else {
        self.isSelected = false;
        self.$card.removeClass('selected');
        self.$audio.find('button').attr('tabindex','-1');
      }
    };

    /**
     * makTabbable - Make the card accessible when tabbing
     */
    self.makeTabbable = function() {
      if (self.$card) {
        self.$card.attr('tabindex', '0');

      }
    };

    /**
     *  Make card tabbable and move focus to it
     */
    self.setFocus = function() {
      self.makeTabbable();
      self.$card.focus();
    };

    /**
     *  Prevent tabbing to the card
     */
    self.makeUntabbable = function() {
      if (self.$card) {
        self.$card.attr('tabindex', '-1');
      }
    };


    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function($container) {

      self.$audio = self.createAudioWrapper();
      //disable tabbing the audio button under normal circumstances
      self.$audio.find('button').attr('tabindex','-1');
      var $card = $('<li class="sequencing-item draggabled" id="item_' +
        seqNumber + '">' +
        '<span class="sequencing-mark"></span></li>');
      var $image = $('<div class="image-container">' +
        '<img src="' + path + '" alt="' + self.description + '"/>' +
        '</div>' +
        '<div class="image-desc" data-title="'+html+'">' +
        '<span class="text">' + html + '</span>' +
        '</div>');


      $card.append(self.$audio);
      $card.append($image);
      self.$card = $card;

      // for tooltip functionality
      $card.find('.image-desc').on('click',function(event){
        var $this = $(this);
        if(this.offsetWidth < this.scrollWidth){
            $this.tooltip('option','content',$this.find('.text').html());
            $this.tooltip( "option", "items", "[data-title]" );
        }
         $(this).tooltip('enable').tooltip('open');
      });

      $card.find('.image-desc').tooltip({
        items:'[data-title]',
        content:'',
        show: null,
        position: {
          my: "left top",
          at: "center bottom",
          collision: "fit",
          using: function( position, feedback ) {
            $( this ).css( position );
            $( "<div>" )
              .addClass( "arrow" )
              .addClass( feedback.vertical )
              .addClass( feedback.horizontal )
              .appendTo( this );
          }
        },
        // disabled by default
        disabled: true,
        close: function( event, ui ) {
           $(this).tooltip('disable');
          }
      });

      self.$audio.on('keydown',function(event){
        if(event.which == 13 || event.which == 32){
          //play or stop the audio without affecting the card
          event.stopPropagation();
        }
      });

      $card.appendTo($container).on('keydown', function(event) {
        switch (event.which) {
          case 13: // Enter
          case 32: // Space
            self.setSelected();
            event.preventDefault();
            return;
          case 39: // Right
          case 40: // Down
            // Move focus forward
            self.trigger('next');
            event.preventDefault();
            return;
          case 37: // Left
          case 38: // Up
            // Move focus back
            self.trigger('prev');
            event.preventDefault();
            return;
          case 35:
            // Move to last card
            self.trigger('last');
            event.preventDefault();
            return;
          case 36:
            // Move to first card
            self.trigger('first');
            event.preventDefault();
            return;
        }
      });
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
    return (params !== undefined && params.image !== undefined && params.image
      .path !== undefined);
  };


})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
