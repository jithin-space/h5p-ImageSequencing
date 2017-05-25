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

    var elementList = []; //list of image
    var sequence = []; // getting a random sequence

    /**
     * set gameLevel
     * gameLevel is one more than the number of images
     * @private
     */
    var setGameLevel = function() {
      self.level = elementList.length;
    };


    /**
     * creating the imageNodes for the linkedList
     * @private
     */

    var createImageNodes = function(images, id) {
      for (var i = 0; i < images.length; i++) {
        var image = new ImageSequencing.Image(images[i].image, id, i, images[i].imageDescription);
        image.on('drag', function() {
          self.timer.play();
        });
        // registering event listeners on image object
        image.on('dragstart', function(pos) {
          self.handleDragStart(pos.data);
        });
        image.on('dragenter', function(pos) {
          self.handleDragEnter(pos.data);
        });
        image.on('dragLeave', function(pos) {
          self.handleDragLeave();
        });
        elementList.push(image); //push the created Node to the elementList
      }

    };

    /**
     * creating the dropperNode for the linkedList
     * @private
     */

    var createDropperNode = function(pos) {
      var dropper = new ImageSequencing.Dropper(pos, parameters.l10n.dropperText);
      // registering the event listeners
      dropper.on('drop', function() {
        self.handleDrop();
      });
      dropper.on('dragLeave', function() {
        self.handleDragLeave();
      });
      elementList.push(dropper); //push the created Node to the elementList
    };

    /**
     * generate a random sequence between [0 to gameLevel-1]
     * to shuffle the elementList on every page reload
     * @private
     */
    var setRandomSequence = function() {
      sequence = Array.apply(null, {
        length: self.level
      }).map(Number.call, Number); // array[0..N-1]
      H5P.shuffleArray(sequence); // shuffle the array
    };

    /**
     * give each element in the elementList a random position
     * called only once during the initial game loading
     * @private
     */
    var setListPos = function() {
      for (var i = 0; i < elementList.length; i++) {
        elementList[i].setPos(sequence[i]);
      }
      elementList.sort(reorder); //reorder the elements on the list based on their current positions
    };

    /**
     * sorting elementList according to the pos values
     * @private
     */
    var reorder = function(a, b) {
      if (a.getPos() < b.getPos())
        return -1;
      if (a.getPos() > b.getPos())
        return 1;
      return 0;
    };

    /**
     * creating the Nodes for the linkedList
     * nodes include both Image and Dropper Nodes
     * @private
     */
    var createHolderNodes = function(images, id) {
      createImageNodes(images, id);
      createDropperNode();
    };
    /**
     * initialize a linkedList for the game
     * @private
     */
    var initializeLinkedList = function() {
      self.linkedList = new ImageSequencing.LinkedList();
    };
    /**
     * add the created Nodes in the elementList to the linkedList
     * @private
     */
    var addNodesToList = function() {
      for (var i = 0; i < elementList.length; i++) {
        self.linkedList.add(elementList[i]);
      }
    };

    /**
     * function to initalize game by setting all game parameters
     * @private
     */

    var initializeGame = function(images, id) {
      createHolderNodes(images, id);
      initializeLinkedList();
      setGameLevel();
      setRandomSequence();
      setListPos();
      addNodesToList();
    };

    /**
     * function to resize the elements according to the current window size
     * triggered by the resize event
     * @private
     */

    var scaleGameSize = function() {
      self.size = calculate(self.$wrapper.width(), self.level);
      if (self.isSubmitted) {
        gameSubmitted();
      } else {
        self.reattach();
      }
    };

    /**
     * calculate the holderSize and imageSize
     * according to the wrapper width and no. of elements to display
     * @private
     */
    var calculate = function(width, level) {
      var holderSize = (width - (4 * level)) / level;
      var imageSize = (holderSize - (20));
      return [holderSize, imageSize];
    };

    /**
     * calculate the score each time user submits
     * @private
     */
    var calculateScore = function(elementList) {
      var score = 0;
      for (var i = 0; i < elementList.length; i++) {
        if (i == elementList[i].getSequenceNo()) {
          score++;
          elementList[i].setCorrect();
        } else {
          elementList[i].setIncorrect();
        }
      }
      self.$progressBar.setScore(score); //set the score on the progressBar
      var feedbackMessage = getFeedbackMessage((score / (self.level - 1)) * 100, parameters.l10n.feedbacks); //get the feedback message based on the performance
      self.$feedback.html(feedbackMessage); //set the feedback to feedbackMessage obtained.
    };

    /**
     * get the feedbackMessage based on the performance
     * @private
     */

    var getFeedbackMessage = function(performance, feedbacks) {
      var msg = "";
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
    };

    /**
     * displaySubmittedList after eliminating the dropper element
     * @private
     */

    var displaySubmission = function(submittedList) {
      self.$wrapper.empty(); //empty the whole wrapper
      self.$dragZone.empty(); //unset the dragZone component
      var size = calculate(self.$wrapper.width(), self.level - 1);
      self.$dragZone = $('<div class="sequencing-grid"/>'); //reinitiate dragZone
      for (var i = 0; i < submittedList.length; i++) {
        submittedList[i].appendTo(self.$dragZone, size);
      }
      self.attachRest();
    };

    /**
     * remove the dropper element from the submittedList and
     * pass that trimmed list to the displaySubmittedList function
     * @private
     */

    var prepareSubmission = function() {
      var submittedList = [];
      for (var i = 0; i < self.level; i++) {
        if (!(self.linkedList.getNodeAt(i).getType() == "Dropper")) {
          submittedList.push(self.linkedList.getNodeAt(i));
        }
      }
      displaySubmission(submittedList);
      calculateScore(submittedList);
    };
    /**
     * trigger when the user submits the game
     * @private
     */
    var gameSubmitted = function() {
      //set for getting the current status of the game ie submitted or not
      self.isSubmitted = true;
      prepareSubmission();
      self.timer.stop(); //stop the timer
      self.$feedback.addClass('sequencing-feedback-show'); //show  feedbackMessage
      self.$progressBar.$scoreBar.addClass('sequencing-feedback-show'); //show progressBar
    };

    /**
     * trigger when ever a shift in position occurs
     * during both drag and drop
     * @private
     */
    self.reattach = function() {
      self.$wrapper.empty(); //empty the whole wrapper
      self.$dragZone.empty(); //unset the dragZone component
      self.$dragZone = $('<div  class="sequencing-grid"/>'); //reinitiate dragZone
      for (var i = 0; i < self.level; i++) {
        self.linkedList.getNodeAt(i).appendTo(self.$dragZone, self.size);
      }
      self.attachRest();
    };

    /* for attaching components other than the dragZone */
    self.attachRest = function() {
      if (self.level) {
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
    };

    /*
     * initalizeGame...
     * first function execution with in the H5P.ImageSequencing constructor
     * uses the parameters uploaded for content creation
     */
    initializeGame(parameters.sequenceimages, id);

    /* event listeners triggerd either by image nodes or dropper node
     * for overall rearrangement in the LinkedList
     */

    /*
     * continue handling the dragstart event started by the anyone of the image nodes
     */
    self.handleDragStart = function(pos) {
      self.dragSrcEl_ = self.linkedList.getNodeAt(pos);
      self.isSubmitted = false;
    };
    /*
     * continue handling the dragenter event triggerd by either an image or dropper node
     */
    self.handleDragEnter = function(pos) {
      self.dragUnderEl_ = self.linkedList.getNodeAt(pos);
      if (self.linkedList.getDropperPos() != self.dragUnderEl_.getPos() && self.dragUnderEl_.getPos() != self.dragSrcEl_.getPos()) {
        self.linkedList.moveThroughList(self.dragUnderEl_.getPos(), self.linkedList.getDropperPos());
        self.reattach();
      }
      self.dragSrcEl_.$dropper.addClass('moving');
    };
    self.handleDragLeave = function() {
      self.dragSrcEl_.$dropper.removeClass('moving');
    };

    self.handleDrop = function() {
      var dropperPos = self.linkedList.getDropperPos();
      self.linkedList.moveThroughList(self.dragSrcEl_.getPos(), self.linkedList.getDropperPos()); //move dropper to dragSrcEl_'s position
      self.linkedList.moveThroughList(dropperPos, self.dragSrcEl_.getPos()); //move dragSrcEl_ to the dropper's previous position
      self.reattach();
      self.counter.increment(); //increment the counter for each movement occurs
    };
    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function($container) {
      self.$wrapper = $container.addClass('sequencing-wrapper').html('');
      self.size = calculate(self.$wrapper.width(), self.level);
      self.$dragZone = $('<div class="sequencing-grid"/>');
      for (var i = 0; i < self.level; i++) {
        self.linkedList.getNodeAt(i).appendTo(self.$dragZone, self.size);
      }
      if (self.level) {
        self.$dragZone.appendTo($container);
        self.$feedback = $('<div class="sequencing-feedback"></div>');
        self.$progressBar = UI.createScoreBar(self.level - 1, 'scoreBarLabel');
        self.$progressBar.appendTo($container);
        self.$progressBar.$scoreBar.addClass("sequencing-feedback");
        self.$feedback.appendTo($container);
        self.$status = $('<dl class="sequencing-status">' + '<dt>' + parameters.l10n.timeSpent + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
          '<dt>' + parameters.l10n.totalMoves + '</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
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
    };
    // registering the H5P.ImageSequencingObject to handle the resize event
    if (self.level) {
      self.on('resize', scaleGameSize);
    }

  }
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
