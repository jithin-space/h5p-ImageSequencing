var H5P = H5P || {};
H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

  /**
   * Image Sequencing Constructor
   *
   * @class H5P.ImageSequencing
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   * @param {Number} id
   */

  function ImageSequencing(parameters, id) {
    /** @alias H5P.ImageSequencing# */
    var self = this;
    // Initialize event inheritance
    EventDispatcher.call(self);

    var imageList = []; //list of images to be sequenced
    var imageHolder = []; // list of imageholders
    var level = 0; // game level ie number of images to sort
    var sequence = []; // getting a random sequence
    var timer; // timer object for the game

    /**
     * get gameLevel
     * @private
     */
    var getGameLevel = function() {
      return imageList.length;
    }

    /**
     * set gameLevel
     * @private
     */

    var setGameLevel = function() {
      level = imageList.length;
    }

    /**
     * get the imageList
     * @private
     */

    var getImageList = function() {
      return imageList;
    }

    /**
     * setting up the imageList from the parameters
     * @private
     */

    var setImageList = function(images, id) {
      for (var i = 0; i < images.length; i++) {
        var image = new ImageSequencing.Image(images[i], id, i, parameters.l10n.moves);
        addImage(image);
      }

    }

    /**
     * pushing H5P.imageSequencing.Image Objects to imageList
     * attaching event listeners.
     * @private
     */

    var addImage = function(image) {
      image.on('reattach', function() {
        reattach();
      });
      image.on('drag', function() {
        self.timer.play();
      });
      imageList.push(image);
    }

    /**
     *  instantiate an H5P.ImageSequencing.Dropper object with required pos
     * attaching event listeners.
     * @private
     */
    var setDropper = function() {
      self.dropper = new ImageSequencing.Dropper();
      self.dropper.on('reattach', function() {
        reattach();
      })
    }

    /**
     * get the dropper for the game
     * @private
     */
    var getDropper = function() {
      return self.dropper;
    }

    /**
     * generate a random sequence between [0 to level-1]
     * to shuffle the imageList on every page reload
     * @private
     */
    var setRandomSequence = function() {
      sequence = Array.apply(null, {
        length: level
      }).map(Number.call, Number);
      H5P.shuffleArray(sequence);

    }
    /**
     * set the postion of images on imageList for the first time
     * using the random sequence generated
     * @private
     */
    var setImagePos = function() {
      for (var i = 0; i < level; i++) {
        imageList[i].setPos(sequence[i]);
      }
    }
    /**
     * setting the previous and next links to all
     * H5P.ImageSequencing.Image Objects on the imageList
     * @private
     */
    var setLinks = function() {
      imageList.sort(reorder);
      for (var i = 0; i < level; i++) {
        imageList[i].setNext(imageList[i + 1]);
        imageList[i].setPrev(imageList[i - 1]);
      }
    }

    var setImageHolder = function() {
      for (var i = 0; i < level; i++) {
        position = imageList[i].getPos();
        if (position >= 0) {
          imageHolder[position] = $('<div class="imageHolder"></div>');
          imageList[i].appendTo(imageHolder[position], self.size);
        } else {
          position = position - (position * 2); //negative pos means need to dropper object in that pos
          imageHolder[position] = $('<div class="imageHolder"></div>');
          self.dropper.setPos(position); //set the position of the dropper to current position
          self.dropper.appendTo(imageHolder[position], self.size);
        }

      }
    }

    var scaleGameSize = function() {
      // resizing value;
      // console.log(self.$wrapper.width());
      self.size = calculate(self.$wrapper.width());
      reattach();
    }

    /**
     * function to initalize game by setting all game parameters
     * @private
     */

    var initializeGame = function(images, id) {
      setImageList(images, id); //initialize imageList
      setDropper();
      setGameLevel(); //initialize gameLevel
      setRandomSequence(); //create a random sequence
      // imageList.sort(reorder);
      setImagePos(); //set image positions based on the random sequence
      setLinks(); // set previous and next links to each image elements
    }

    /**
     * calculate the holderSize and imageSize
     * according to the wrapper width
     * @private
     */


    var calculate = function(width) {
      var holderSize = (width - (2 * level)) / level;
      var imageSize = (holderSize - (20));
      return [holderSize, imageSize];
    }
    /**
     * sorting imageList according to the pos values
     * required for proper link setting
     * @private
     */
    var reorder = function(a, b) {
      if (a.getPos() < b.getPos())
        return -1;
      if (a.getPos() > b.getPos())
        return 1;
      return 0;
    }


    /**
     * calculate the score each time user submits
     * @private
     */
    var calculateScore = function() {
      score = 0
      imageList.forEach(function(element) {
        if (element.getPos() == element.getSequenceNo()) {
          score++;
          element.setCorrect();
        } else {
          element.setIncorrect();
        }
      });
      self.$progressBar.setScore(score);
      feedbackMessage = getFeedbackMessage((score / level) * 100, parameters.l10n.feedbacks); //get the feedback message based on the performance
      self.$feedback.html(feedbackMessage); //set the feedback to feedbackMessage obtained.
    }

    /**
     * get the feedbackMessage based on the performance
     * @private
     */

    var getFeedbackMessage = function(performance, feedbacks) {

      switch (true) {
        case (performance < 25):
          msg = feedbacks.poorEffort;
          break;
        case performance < 50:
          msg = feedbacks.keepTrying;
          break;
        case performance < 75:
          msg = feedbacks.almostThere;
          break;
        case performance < 100:
          msg = feedbacks.closeToVictory;
          break;
        default:
          msg = feedbacks.successFeedback;
      }
      return msg;
    }

    /**
     * trigger when the user submits the game
     * @private
     */

    var gameSubmitted = function() {
      calculateScore(); //calculateScore based on the current positioning
      self.timer.stop(); //stop the timer
      self.counter.increment(); // increment the number of submissions
      self.$feedback.addClass('h5p-show'); //show  feedbackMessage
      self.$progressBar.$scoreBar.addClass('h5p-show'); //show progressBar
    }

    /**
     * trigger when ever a shift in positioning occurs
     * during both drag and drop
     * @private
     */
    var reattach = function() {
      self.$wrapper.empty(); //empty the whole wrapper
      self.$dragZone.empty(); //unset the dragZone component
      setLinks(); //reset the links
      self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>'); //reinitiate dragZone
      setImageHolder(); // reinitiate imageHolders
      for (var i = 0; i < level; i++) {
        imageHolder[i].appendTo(self.$dragZone, self.size); //append each to dragZone
      }
      if (level) {
        self.$dragZone.appendTo(self.$wrapper);
        self.$feedback.appendTo(self.$wrapper);
        self.$progressBar.appendTo(self.$wrapper);
        self.$status.appendTo(self.$wrapper);
        self.$submit = H5P.JoubelUI.createButton({
          title: 'Submit',
          click: function(event) {
            gameSubmitted();
          },
          html: 'Submit'
        });
        self.$submit.appendTo(self.$wrapper);
      }
    }

    /*
     * initalizeGame...
     * first function execution with in the H5P.ImageSequencing constructor
     * uses the parameters uploaded for content creation
     */
    initializeGame(parameters.sequenceimages, id);

    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function($container) {
      self.$wrapper = $container.addClass('l-wrap').html('');
      self.size = calculate(self.$wrapper.width());
      self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
      setImageHolder();
      for (var i = 0; i < level; i++) {
        imageHolder[i].appendTo(self.$dragZone, self.size);
      }
      if (level) {
        self.$dragZone.appendTo($container);
        self.$feedback = $('<div class="h5p-feedback"></div>');
        self.$progressBar = UI.createScoreBar(level, 'scoreBarLabel');
        self.$progressBar.appendTo($container);
        self.$progressBar.$scoreBar.addClass("h5p-feedback");
        self.$feedback.appendTo($container);
        self.$status = $('<dl class="h5p-status">' + '<dt>' + parameters.l10n.timeSpent + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
          '<dt>' + parameters.l10n.totalSubmits + '</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
        self.$status.appendTo($container);
        self.$submit = UI.createButton({
          title: 'Submit',
          click: function(event) {
            gameSubmitted();
          },
          html: 'Submit'
        });
        self.$submit.appendTo($container);
        self.timer = new ImageSequencing.Timer(self.$status.find('.h5p-time-spent')[0]);
        self.counter = new ImageSequencing.Counter(self.$status.find('.h5p-submits'));
      }
    }

    if (level) {
      self.on('resize', scaleGameSize);
    }

  };
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
