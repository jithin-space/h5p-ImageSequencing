(function (ImageSequencing, EventDispatcher, $) {

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
  ImageSequencing.Card = function (cardParams, id, seqNumber, unsupportedAudio) {
    /** @alias H5P.ImageSequencing.Card# */
    let that = this;
    // Initialize event inheritance
    EventDispatcher.call(that);
    let path = H5P.getPath(cardParams.image.path, id);
    that.seqNo = seqNumber;
    that.isSelected = false;
    that.description = cardParams.imageDescription;
    let audio = cardParams.audio;
    let html = (that.description !== undefined) ? that.description : '';




    /**
     * that - create a container with audio files
     *
     * @return {H5P.jQuery}  $audioWrapper
     */

    that.createAudioWrapper = function () {
      let audioObj;
      let $audioWrapper = $('<div>', {
        'class': 'h5p-image-sequencing-audio-wrapper'
      });

      if (audio !== undefined) {
        let audioDefaults = {
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
      that.audio = audioObj;


      return $audioWrapper;
    };

    /**
     * assign the correctly positioned card with class correct
     */
    that.setCorrect = function () {
      that.$card.removeClass('sequencing-incorrect').addClass(
        'sequencing-correct');
      that.$card.find('.sequencing-mark').removeClass(
        'sequencing-incorrect-mark').addClass('sequencing-correct-mark');
    };


    /**
     * mark the card as solved
     */
    that.setSolved = function () {
      that.$card.removeClass('sequencing-incorrect').addClass(
        'sequencing-correct');
    };

    /*
     * assign the incorrectly positioned card with class incorrect
     */
    that.setIncorrect = function () {
      that.$card.removeClass('sequencing-correct').addClass(
        'sequencing-incorrect');
      that.$card.find('.sequencing-mark').removeClass(
        'sequencing-correct-mark').addClass('sequencing-incorrect-mark');
    };

    /**
     * toggle between selected and unselected states
     */
    that.setSelected = function () {
      if (!that.isSelected) {
        that.isSelected = true;
        that.$card.addClass('selected');
        that.$card.attr('aria-selected',true);
        that.$audio.find('button').attr('tabindex','0').attr('aria-label','play the corresponding audio').attr('role','button');
        that.trigger('selected');
      }
      else {
        that.isSelected = false;
        that.$card.removeClass('selected');
        that.$card.attr('aria-selected','');
        that.$card.attr('aria-label',(that.description?that.description:"sequencing item"));
        that.$audio.find('button').attr('tabindex','-1').attr('aria-label','');
      }
    };

    /**
     * makTabbable - Make the card accessible when tabbing
     */
    that.makeTabbable = function () {
      if (that.$card) {
        that.$card.attr('tabindex', '0');

      }
    };

    /**
     *  Make card tabbable and move focus to it
     */
    that.setFocus = function () {
      that.makeTabbable();
      that.$card.focus();
    };

    /**
     *  Prevent tabbing to the card
     */
    that.makeUntabbable = function () {
      if (that.$card) {
        that.$card.attr('tabindex', '-1');
      }
    };


    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    that.appendTo = function ($container) {

      that.$audio = that.createAudioWrapper();
      //disable tabbing the audio button under normal circumstances
      that.$audio.find('button').attr('tabindex','-1');
      let $card = $('<li class="sequencing-item draggabled" id="item_' +
        seqNumber + '" role="option"  aria-label="'+(that.description?that.description:"sequencing item")+'" >' +
        '<span class="sequencing-mark"></span></li>');
      let $image = $('<div class="image-container">' +
        '<img src="' + path + '"/>' +
        '</div>' +
        '<div class="image-desc" data-title="'+html+'">' +
        '<span class="text">' + html + '</span>' +
        '</div>');


      $card.append(that.$audio);
      $card.append($image);
      that.$card = $card;
      that.$card.attr('role','group').attr('aria-label','sequencing item');

      // for tooltip functionality
      $card.find('.image-desc').on('click',function (event) {
        let $this = $(this);
        if (this.offsetWidth < this.scrollWidth) {
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
          using: function ( position, feedback ) {
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
        close: function ( event, ui ) {
          $(this).tooltip('disable');
        }
      });

      that.$audio.on('keydown',function (event ) {
        if (event.which == 13 || event.which == 32) {
          //play or stop the audio without affecting the card
          event.stopPropagation();
        }
      });

      that.$card.appendTo($container).on('keydown', function (event) {
        switch (event.which) {
          case 13: // Enter
          case 32: // Space
            that.setSelected();
            event.preventDefault();
            return;
          case 39: // Right
          case 40: // Down
            // Move focus forward
            that.trigger('next');
            event.preventDefault();
            return;
          case 37: // Left
          case 38: // Up
            // Move focus back
            that.trigger('prev');
            event.preventDefault();
            return;
          case 35:
            // Move to last card
            that.trigger('last');
            event.preventDefault();
            return;
          case 36:
            // Move to first card
            that.trigger('first');
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
  ImageSequencing.Card.isValid = function (params) {
    return (params !== undefined && params.image !== undefined && params.image
      .path !== undefined);
  };


})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
