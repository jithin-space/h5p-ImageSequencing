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
    self.isResume = false;
    self.isShowSolution = false;
    self.isGamePaused = false;
    self.isAttempted = false;

    // Initialize event inheritance
    EventDispatcher.call(self);



    /*
     * when user clicks the check button
     *@param {Array} order
     *@param {H5P.jQuery} $item
     */
    var gameSubmitted = function() {
      self.isSubmitted = true;
      self.timer.stop();
      self.score = 0;
      for (var i = 0; i < self.numCards; i++) {

        if (cardsToUse[i].audio && cardsToUse[i].audio.stop) {
            cardsToUse[i].audio.stop();
            cardsToUse[i].$audio.find('.h5p-audio-inner').addClass('audio-disabled');
      }

        if (i == shuffledCards[i].seqNo) {
          self.score++;
          shuffledCards[i].setCorrect();
        } else {
          shuffledCards[i].setIncorrect();
        }
      }
      self.$progressBar.setScore(self.score); //set the score on the progressBar
      var scoreText = parameters.l10n.score;
      scoreText = scoreText.replace('@score', self.score).replace('@total', self.numCards);
      self.$feedback.html(scoreText); //set the feedback to feedbackMessage obtained.
      self.$submit.hide();
      if(self.$showSolution){
          self.$showSolution.hide();
      }
      self.$list.sortable("disable");
      self.isGamePaused = true;//disable sortable functionality and create the retry button



      if (self.score != self.numCards ) {
        if(parameters.behaviour.enableRetry){
          self.$retry = UI.createButton({
            title: 'Retry',
            'class': 'h5p-image-sequencing-retry',
            click: self.resetTask,
            html: '<span><i class="fa fa-undo" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.tryAgain
          });
          self.$retry.appendTo(self.$footerContainer);
        }
        if(parameters.behaviour.enableResume){
          self.$resume = UI.createButton({
            title: 'Resume',
            'class': 'h5p-image-sequencing-resume',
            click: function() {
              self.$wrapper.empty();
              self.isResume = true;
              self.isGamePaused = false;
              self.attach(self.$wrapper);

            },
            html: '<span><i class="fa fa-repeat" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.resume
          });
          self.$resume.appendTo(self.$footerContainer);
        }

        // self.$retry[0].focus();
        self.trigger('resize');
      }

      self.$feedbackContainer.addClass('sequencing-feedback-show'); //show  feedbackMessage
      self.$feedback.focus();


     var completedEvent = self.createXAPIEventTemplate('completed');
     completedEvent.setScoredResult(self.score, self.numCards, self, true, self.score === self.numCards);
     completedEvent.data.statement.result.duration = 'PT' + (Math.round(self.timer.getTime() / 10) / 100) + 'S';
     self.trigger(completedEvent);

    };



    var showSolutions = function(){
      var orderedCards=[];
      for (var i = 0; i < self.numCards; i++) {
        for(var j=0; j < self.numCards; j++){
          if(shuffledCards[j].seqNo === i){
            orderedCards.push(shuffledCards[j]);
            break;
          }
        }


      }

      shuffledCards = orderedCards;

      self.$wrapper.empty();
      self.isShowSolution = true;
      self.timer.stop();
      for (var i = 0; i < self.numCards; i++) {

        if (cardsToUse[i].audio && cardsToUse[i].audio.stop) {
            cardsToUse[i].audio.stop();
            cardsToUse[i].$audio.find('.h5p-audio-inner').addClass('audio-disabled');
      }

      }
      self.attach(self.$wrapper);



      self.$list.sortable("disable");
      self.isGamePaused = true; //disable sortable functionality and create the retry button
      if(parameters.behaviour.enableRetry){
        self.$retry = UI.createButton({
        title: 'Retry',
        'class': 'h5p-image-sequencing-retry',
        click: self.resetTask,
        html: '<span><i class="fa fa-undo" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.tryAgain
      });
      self.$retry.appendTo(self.$footerContainer);
      }

        // self.$retry[0].focus();
        self.trigger('resize');
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

    self.numCards = shuffledCards.length;

    var createItemChangeFocusHandler = function(direction){

      return function(){

        if(self.isGamePaused){
          return;
        }
        var currentItem = this;
        for (var i = 0; i < self.numCards; i++) {
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
                  currentItem.setFocus();
                  self.counter.increment();
                  self.isAttempted = true;
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
        shuffledCards[i].$card.insertAfter(shuffledCards[j].$card);
      }
      else{
          shuffledCards[j].$card.insertAfter(shuffledCards[i].$card);
      }
      shuffledCards.swapItems(firstPos,secondPos);
    }

    Array.prototype.swapItems = function(a, b){
      this[a] = this.splice(b, 1, this[a])[0];
      return this;
    }


    var sortUpdate = function(order){
      var newList=[];
      for (var i = 0; i < self.numCards; i++) {
        for(j=0;j< self.numCards; j++){
          if(shuffledCards[j].seqNo == order[i].split('_')[1]){
            newList.push(shuffledCards[j]);
            continue;
          }
        }
      }
      shuffledCards = newList;
    }


    // implementing question contract.

    self.getAnswerGiven = function(){
      return self.isAttempted;
    }

    self.getScore = function(){
      return self.score;
    }

    self.getMaxScore = function(){
      return self.numCards;
    }

    self.resetTask = function(){
        self.$wrapper.empty();
        shuffledCards = shuffleCards(cardsToUse);
        self.isRetry = true;
        self.isShowSolution = false;
        self.isGamePaused = false;
        self.attach(self.$wrapper);
    }



    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function($container) {

      self.triggerXAPI('attempted');

      self.$wrapper = $container.addClass('h5p-image-sequencing').html('');
      $('<div class="h5p-task-description" tabindex= "0">' + parameters.taskDescription + '</div>').appendTo($container);
      self.$list = $('<ul class="sortable"/>');
      for (var i = 0; i < self.numCards; i++) {
        shuffledCards[i].appendTo(self.$list);

        if(!self.isRetry && !self.isResume && !self.isShowSolution){
          //else events are already registered.
          shuffledCards[i].on('selected',function(){
            self.timer.play();
          });
          shuffledCards[i].on('next',createItemChangeFocusHandler(1));
          shuffledCards[i].on('prev', createItemChangeFocusHandler(-1));
        }

        if(self.isShowSolution){
          shuffledCards[i].setSolved();
        }

      }

      if (self.$list.children().length) {
        self.$list.appendTo($container);
        shuffledCards[0].setFocus();

        self.$footerContainer = $('<div class="footer-container" />');

        self.$feedbackContainer = $('<div class="sequencing-feedback"/>');
        self.$buttonContainer = $('<div class="sequencing-feedback-show" />');
        self.$feedback = $('<div class="feedback-element"></div>');
        if(!self.isResume && !self.isShowSolution){
          //else persist existing timer and counter values
          self.$status = $('<dl class="sequencing-status">' + '<dt>' + parameters.l10n.timeSpent + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
            '<dt>' + parameters.l10n.totalMoves + '</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
            self.timer = new ImageSequencing.Timer(self.$status.find('.h5p-time-spent')[0]); //Initialize timer
            self.counter = new ImageSequencing.Counter(self.$status.find('.h5p-submits')); //Initialize counter
        }
        else{
          self.isResume = false;
        }

        self.$status.appendTo(self.$footerContainer);
        self.$progressBar = UI.createScoreBar(self.numCards, 'scoreBarLabel');
        self.$feedback.attr('tabindex','0');
        self.$feedback.appendTo(self.$feedbackContainer);
        self.$progressBar.appendTo(self.$feedbackContainer);
        self.$feedbackContainer.appendTo(self.$footerContainer);

        if(!self.isShowSolution){
          //not on showSolution mode
          self.$submit = UI.createButton({
            title: 'Submit',
            click: gameSubmitted,
            html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.checkAnswer
          });
          self.$submit.appendTo(self.$buttonContainer);
          if(parameters.behaviour.enableSolutionsButton){
            self.$showSolution = UI.createButton({
              title: 'Submit',
              click: showSolutions,
              html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + parameters.l10n.showSolution
            });
            self.$showSolution.appendTo(self.$buttonContainer);
          }




        }

        self.$buttonContainer.appendTo(self.$footerContainer);
        self.$footerContainer.appendTo($container);
      }
      //make the list sortable using jquery ui sortable
      self.$list.sortable({
        placeholder: "sequencing-dropzone",
        tolerance: "pointer",
        helper: "clone",
        containment: $container,
        start: function(event, ui) {
          $(ui.helper).addClass("ui-sortable-helper");
          self.timer.play();
          self.triggerXAPI('interacted');
        },
        stop: function(event, ui) {
          $(ui.helper).removeClass("ui-sortable-helper");
        },
        update:function(event,ui){
          var order = self.$list.sortable("toArray");
          sortUpdate(order);
        },
      });

      self.$list.disableSelection();
       //for preventing clicks on each sortable element

      // capturing the drop event on sortable
      self.$list.find("li").droppable({
        drop: function(event, ui) {
          self.counter.increment();
          self.isAttempted = true;
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
