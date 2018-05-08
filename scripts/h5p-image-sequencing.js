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
    self.isRetry = false;
    // Initialize event inheritance
    EventDispatcher.call(self);

    /*
     * assign the correctly positioned card with class correct
     * @param {H5P.jQuery} $item
     */
    var setCorrect = function($item) {
      $item.removeClass('sequencing-incorrect').addClass('sequencing-correct');
      $item.find('.sequencing-mark').removeClass('sequencing-incorrect-mark').addClass('sequencing-correct-mark');
    };

    /*
     * assign the incorrectly positioned card with class incorrect
     * @param {H5P.jQuery} $item
     */
    var setIncorrect = function($item) {
      $item.removeClass('sequencing-correct').addClass('sequencing-incorrect');
      $item.find('.sequencing-mark').removeClass('sequencing-correct-mark').addClass('sequencing-incorrect-mark');
    };

    /*
     * when user clicks the check button
     *@param {Array} order
     *@param {H5P.jQuery} $item
     */
    var gameSubmitted = function(order) {
      self.isSubmitted = true;
      self.timer.stop();


      var score = 0;
      for (var i = 0; i < order.length; i++) {

        if (cardsToUse[i].audio && cardsToUse[i].audio.stop) {
            cardsToUse[i].audio.stop();
            cardsToUse[i].$audio.find('.h5p-audio-inner').addClass('audio-disabled');
      }

        if (i == order[i].split('_')[1]) {
          score++;
          setCorrect(self.$list.find('#' + order[i]));

        } else {
          setIncorrect(self.$list.find('#' + order[i]));
        }
      }
      self.$progressBar.setScore(score); //set the score on the progressBar
      var scoreText = parameters.l10n.score;
      scoreText = scoreText.replace('@score', score).replace('@total', order.length);
      self.$feedback.html(scoreText); //set the feedback to feedbackMessage obtained.
      self.$submit.hide();
      self.$list.sortable("disable"); //disable sortable functionality and create the retry button
      if (score != order.length) {
        self.$retry = UI.createButton({
          title: 'Retry',
          'class': 'h5p-image-sequencing-retry',
          click: function() {
            self.$wrapper.empty();
            shuffledCards = shuffleCards(cardsToUse);
            self.isRetry = true;
            self.attach(self.$wrapper);

          },
          html: '<span><i class="fa fa-undo" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.tryAgain
        });
        self.$retry.appendTo(self.$wrapper);
        self.$retry[0].focus();
        self.trigger('resize');
      }
      self.$feedbackContainer.addClass('sequencing-feedback-show'); //show  feedbackMessage


     var completedEvent = self.createXAPIEventTemplate('completed');
     completedEvent.setScoredResult(score, order.length, self, true, score===order.length);
     completedEvent.data.statement.result.duration = 'PT' + (Math.round(self.timer.getTime() / 10) / 100) + 'S';
     self.trigger(completedEvent);

    };

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
    };

    /*
     * Initialize the cards to be used in the game
     */
    var getCardsToUse = function() {
      var cardsToUse = [];
      for (var i = 0; i < parameters.sequenceImages.length; i++) {
        var cardParams = parameters.sequenceImages[i];
        if (ImageSequencing.Card.isValid(cardParams)) {
          var card = new ImageSequencing.Card(cardParams, id, i,parameters.l10n.audioNotSupported);
          cardsToUse.push(card);
        }
      }
      return cardsToUse;
    };

    var cardsToUse = getCardsToUse();
    var shuffledCards = shuffleCards(cardsToUse);

    var createItemChangeFocusHandler = function(direction){

      return function(){
        var currentItem = this;
        for (var i = 0; i < shuffledCards.length; i++) {
          if (shuffledCards[i] === currentItem) {
            var currentIndex=i;
            var nextItem;
            nextItem = shuffledCards[i + direction];
            var nextIndex= i + direction;
              if (!nextItem) {
                return;
              }
              if(currentItem.isSelected){
                  swapCards(currentIndex,nextIndex);
                  shuffledCards.swapItems(currentIndex,nextIndex);
                  currentItem.setFocus();
                  self.counter.increment();
                  return false;
              }
              else{
                currentItem.makeUntabbable();
                nextItem.setFocus();
              }


          }
        }
      }
    }



    var swapCards = function(firstPos,secondPos){
      var i=firstPos;
      var j=secondPos;
      if(i < j){
        self.$list.find('li:eq('+i+')').insertAfter(self.$list.find('li:eq('+j+')'));
      }
      else{
          self.$list.find('li:eq('+j+')').insertAfter(self.$list.find('li:eq('+i+')'));
          console.log('exectutin twice');
      }
    }

    Array.prototype.swapItems = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    console.log(a+'_'+b);
    return this;
    }


    var sortUpdate = function(){
      console.log('update');
      self.$list.sortable("refreshPositions");
      self.$list.sortable();
    }

    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function($container) {

      self.triggerXAPI('attempted');

      self.$wrapper = $container.addClass('h5p-image-sequencing').html('');
      $('<div class="h5p-task-description">' + parameters.taskDescription + '</div>').appendTo($container);
       self.$list = $('<ul class="sortable"/>');
      for (var i = 0; i < shuffledCards.length; i++) {
        shuffledCards[i].appendTo(self.$list);
        shuffledCards[i].isSelected = false;

        if(!self.isRetry){
          //else events are already registered.
          shuffledCards[i].on('selected',function(){
            self.timer.play();
          });
          shuffledCards[i].on('next',createItemChangeFocusHandler(1));
          shuffledCards[i].on('prev', createItemChangeFocusHandler(-1));
        }

      }

      if (self.$list.children().length) {
        self.$list.appendTo($container);

        shuffledCards[0].setFocus();


        self.$feedbackContainer = $('<div class="sequencing-feedback"/>');
        self.$buttonContainer = $('<div class="sequencing-feedback-show" />');
        self.$feedback = $('<div class="feedback-element"></div>');
        self.$status = $('<dl class="sequencing-status">' + '<dt>' + parameters.l10n.timeSpent + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
          '<dt>' + parameters.l10n.totalMoves + '</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
        self.$status.appendTo($container);
        self.$progressBar = UI.createScoreBar(shuffledCards.length, 'scoreBarLabel');
        self.$feedback.appendTo(self.$feedbackContainer);
        self.$progressBar.appendTo(self.$feedbackContainer);
        self.$feedbackContainer.appendTo($container);
        self.$submit = UI.createButton({
          title: 'Submit',
          click: function(event) {
            var order = self.$list.sortable("toArray");
            gameSubmitted(order);
          },
          html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.checkAnswer
        });
        self.$submit.appendTo(self.$buttonContainer);
        self.$buttonContainer.appendTo($container);
      }
      //make the list sortable using jquery ui sortable
      self.$list.sortable({
        placeholder: "sequencing-dropzone",
        tolerance: "pointer",
        helper: "clone",
        start: function(event, ui) {
          $(ui.helper).addClass("ui-sortable-helper");
          self.triggerXAPI('interacted');
        },
        stop: function(event, ui) {
          $(ui.helper).removeClass("ui-sortable-helper");
        },
        update:sortUpdate,
      });

      self.$list.on('sortupdate',sortUpdate);
      self.$list.disableSelection(); //for preventing clicks on each sortable element
      self.timer = new ImageSequencing.Timer(self.$status.find('.h5p-time-spent')[0]); //Initialize timer
      self.counter = new ImageSequencing.Counter(self.$status.find('.h5p-submits')); //Initialize counter
      // capturing the drop event on sortable
      self.$list.find("li").droppable({
        drop: function(event, ui) {
          self.timer.play();
          self.counter.increment();
        }
      });

    };
    // registering the H5P.ImageSequencingObject to handle the resize event
    if (self.level) {
      // self.on('resize', scaleGameSize);
      self.trigger('resize');
    }

  }
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
