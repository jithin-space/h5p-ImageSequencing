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

    /**
     * Get the Feedback Message Based On Score
     *
     * @param {number} performance
     * @param {H5P.jQuery} $feedbacks
     * @return {String} msg
     */

    var getFeedbackMessage = function(performance, $feedbacks) {
      var msg = "";
      switch (true) {
        case (performance < 25):
          msg = $feedbacks.poorEffort;
          break;
        case performance < 50:
          msg = $feedbacks.keepTrying;
          break;
        case performance < 75:
          msg = $feedbacks.almostThere;
          break;
        case performance < 100:
          msg = $feedbacks.closeToVictory;
          break;
        default:
          msg = $feedbacks.successFeedback;
      }
      return msg;
    };

    /*
    * assign the correctly positioned card with class correct
    * @param {H5P.jQuery} $item
    */
    var setCorrect = function($item) {
      $item.removeClass('sequencing-incorrect').addClass('sequencing-correct');
      $item.find('.sequencing-mark').removeClass('sequencing-incorrect-mark').addClass('sequencing-correct-mark');
    }

    /*
    * assign the incorrectly positioned card with class incorrect
    * @param {H5P.jQuery} $item
    */
    var setIncorrect = function($item) {
      $item.removeClass('sequencing-correct').addClass('sequencing-incorrect');
      $item.find('.sequencing-mark').removeClass('sequencing-correct-mark').addClass('sequencing-incorrect-mark');
    }

    /*
    * when user clicks the check button
    *@param {Array} order
    *@param {H5P.jQuery} $item
    */
    var gameSubmitted = function(order, $list) {
      self.isSubmitted = true;
      self.timer.stop();
      var score = 0;
      for (var i = 0; i < order.length; i++) {
        if (i == order[i].split('_')[1]) {
          score++;
          setCorrect($list.find('#' + order[i]));

        } else {
          setIncorrect($list.find('#' + order[i]));
        }
      }
      self.$progressBar.setScore(score); //set the score on the progressBar
      var feedbackMessage = getFeedbackMessage((score / (order.length - 1)) * 100, parameters.l10n.feedbacks); //get the feedback message based on the performance
      self.$feedback.html(feedbackMessage); //set the feedback to feedbackMessage obtained.
      self.$submit.hide();
      $list.sortable("disable"); //disable sortable functionality and create the retry button
      self.$retry = UI.createButton({
        title: 'Retry',
        click: function() {
          self.$wrapper.empty();
          shuffledCards = shuffleCards(cardsToUse);
          self.attach(self.$wrapper);
        },
        html: '<span><i class="fa fa-undo" aria-hidden="true"></i></span>Retry'
      });
      self.$retry.appendTo(self.$wrapper);
      self.$feedback.addClass('sequencing-feedback-show'); //show  feedbackMessage
      self.$progressBar.$scoreBar.addClass('sequencing-feedback-show'); //show progressBar
    }

    /*
    * shuffle the cards before the game starts or restarts
    * @param {Array} cardsToUse
    * @return {Array} shuffledCards
    */
    var shuffleCards = function(cardsToUse) {
      var numCardsToUse = cardsToUse.length;
      var numPicket = 0;
      var pickedCardsMap = {};
      var shuffledCards = [];
      while (numPicket < numCardsToUse) {
        var pickIndex = Math.floor(Math.random() * numCardsToUse);
        if (pickedCardsMap[pickIndex]) {
          continue; // Already picked, try again!
        }

        shuffledCards.push(cardsToUse[pickIndex]);
        pickedCardsMap[pickIndex] = true;
        numPicket++;
      }

      return shuffledCards;
    }

    /*
    * Initialize the cards to be used in the game
    */
    var getCardsToUse = function() {
      var cardsToUse = [];
      for (var i = 0; i < parameters.sequenceImages.length; i++) {
        var cardParams = parameters.sequenceImages[i];
        if (ImageSequencing.Card.isValid(cardParams)) {
          var card = new ImageSequencing.Card(cardParams.image, id, i, cardParams.imageDescription);
        }
        cardsToUse.push(card);

      }
      return cardsToUse;
    }

    var cardsToUse = getCardsToUse();
    var shuffledCards = shuffleCards(cardsToUse);


    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function($container) {
      self.$wrapper = $container.addClass('h5p-image-sequencing').html('');
      $('<div class="h5p-task-description">' + parameters.taskDescription + '</div>').appendTo($container);
      var $list = $('<ul class="sortable"/>');
      for (var i = 0; i < shuffledCards.length; i++) {
        shuffledCards[i].appendTo($list);
      }
      if ($list.children().length) {
        $list.appendTo($container);
        self.$feedback = $('<div class="sequencing-feedback"></div>');
        self.$status = $('<dl class="sequencing-status">' + '<dt>' + parameters.l10n.timeSpent + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
          '<dt>' + parameters.l10n.totalMoves + '</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
        self.$status.appendTo($container);
        self.$progressBar = UI.createScoreBar(shuffledCards.length - 1, 'scoreBarLabel');
        self.$progressBar.appendTo($container);
        self.$progressBar.$scoreBar.addClass("sequencing-feedback");
        self.$feedback.appendTo($container);
        self.$submit = UI.createButton({
          title: 'Submit',
          click: function(event) {
            var order = $list.sortable("toArray");
            gameSubmitted(order, $list);
          },
          html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>Check'
        });
        self.$submit.appendTo($container);
      }
      // $list.sortable();
      //make the list sortable using jquery ui sortable
      $list.sortable({
        placeholder: "sequencing-dropzone",
        tolerance: "pointer",
        helper: "clone",
        start: function(event, ui) {
          $(ui.helper).addClass("ui-sortable-helper");
        },
        stop: function(event, ui) {
          $(ui.helper).removeClass("ui-sortable-helper");
        },
      });
      $list.disableSelection(); //for preventing clicks on each sortable element
      self.timer = new ImageSequencing.Timer(self.$status.find('.h5p-time-spent')[0]); //Initialize timer
      self.counter = new ImageSequencing.Counter(self.$status.find('.h5p-submits'));   //Initialize counter
      // capturing the drop event on sortable
      $list.find("li").droppable({
        drop: function(event, ui) {
          self.timer.play();
          self.counter.increment();
        }
      });
    };
    // registering the H5P.ImageSequencingObject to handle the resize event
    if (self.level) {
      // self.on('resize', scaleGameSize);
    }

  }
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
