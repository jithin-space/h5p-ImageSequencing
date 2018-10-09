H5P.ImageSequencing = (function (EventDispatcher, $, UI) {

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
    let that = this;
    that.isRetry = false;
    that.isResume = false;
    that.isShowSolution = false;
    that.isGamePaused = false;
    that.isAttempted = false;
    that.params = $.extend(true,{},{
      l10n:{
        showSolution: "ShowSolution",
        resume: "Resume",
        audioNotSupported: "Audio Error"
      }
    },parameters);

    // Initialize event inheritance
    EventDispatcher.call(that);

    /**
     * when user clicks the check button
     **/
    that.gameSubmitted = function () {
      that.isSubmitted = true;
      that.timer.stop();
      that.score = 0;
      for (let i = 0; i < that.numCards; i++) {
        if (that.cardsToUse[i].audio && that.cardsToUse[i].audio.stop) {
          that.cardsToUse[i].audio.stop();
          that.cardsToUse[i].$audio.find('.h5p-audio-inner').addClass(
            'audio-disabled');
        }
        if (i === that.shuffledCards[i].seqNo) {
          that.score++;
          that.shuffledCards[i].setCorrect();
        }
        else {
          that.shuffledCards[i].setIncorrect();
        }
      }
      that.$progressBar.setScore(that.score); //set the score on the progressBar
      let scoreText = that.params.l10n.score;
      scoreText = scoreText.replace('@score', that.score).replace(
        '@total', that.numCards);
      that.$feedback.html(scoreText); //set the feedback to feedbackMessage obtained.
      that.$submit.hide();
      if (that.$showSolution) {
        that.$showSolution.hide();
      }
      that.$list.sortable("disable");
      that.isGamePaused = true; //disable sortable functionality and create the retry button
      if (that.score != that.numCards) {
        that.createRetryButton();
        if (that.params.behaviour.enableResume) {
          //only if the retry button is enabled
          that.$resume = UI.createButton({
            title: 'Resume',
            'class': 'h5p-image-sequencing-resume',
            click: function () {
              that.$wrapper.empty();
              that.isResume = true;
              that.isGamePaused = false;
              that.attach(that.$wrapper);
            },
            html: '<span><i class="fa fa-repeat" aria-hidden="true"></i></span>&nbsp;' +
             that.params.l10n.resume
          });
          that.$resume.appendTo(that.$footerContainer);
        }
      }
      that.$feedbackContainer.addClass('sequencing-feedback-show'); //show  feedbackMessage
      that.$feedback.focus();
      // xApi Section
      // either completed or answered xAPI is required. Assuming answerd , disabling completed
      // let completedEvent = that.createXAPIEventTemplate('completed');
      // completedEvent.setScoredResult(that.score, that.numCards, that,
      //   true, that.score ==== that.numCards);
      // completedEvent.data.statement.result.duration = 'PT' + (Math.round(
      //   that.timer.getTime() / 10) / 100) + 'S';
      // that.trigger(completedEvent);
      //for implementing question contract
      let xAPIEvent = that.createXAPIEventTemplate('answered');
      that.addQuestionToXAPI(xAPIEvent);
      that.addResponseToXAPI(xAPIEvent);
      that.trigger(xAPIEvent);
      that.trigger('resize');
    };

    that.createRetryButton = function () {
      if (that.params.behaviour.enableRetry) {
        that.$retry = UI.createButton({
          title: 'Retry',
          'class': 'h5p-image-sequencing-retry',
          click: that.resetTask,
          html: '<span><i class="fa fa-undo" aria-hidden="true"></i></span>&nbsp;' +
           that.params.l10n.tryAgain
        });
        that.$retry.appendTo(that.$footerContainer);
      }
    }


    /**
     * Get xAPI data.
     * Contract used by report rendering engine.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    that.getXAPIData = function () {
      let xAPIEvent = that.createXAPIEventTemplate('answered');
      that.addQuestionToXAPI(xAPIEvent);
      that.addResponseToXAPI(xAPIEvent);
      return {
        statement: xAPIEvent.data.statement
      };
    };

    /**
     * Add the question itthat to the definition part of an xAPIEvent
     */
    that.addQuestionToXAPI = function (xAPIEvent) {
      let definition = xAPIEvent.getVerifiedStatementValue(['object',
        'definition'
      ]);
      definition.description = {
        // Remove tags, must wrap in div tag because jQuery 1.9 will crash if the string isn't wrapped in a tag.
        'en-US': that.params.taskDescription
      };
      definition.type =
        'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'sequencing';
      definition.correctResponsesPattern = [];
      definition.choices = [];
      for (let i = 0; i <that.params.sequenceImages.length; i++) {
        definition.choices[i] = {
          'id': 'item_' + i + '',
          'description': {
            // Remove tags, must wrap in div tag because jQuery 1.9 will crash if the string isn't wrapped in a tag.
            'en-US':  that.shuffledCards[i].description
          }
        };
        if (i === 0) {
          definition.correctResponsesPattern[0] = 'item_' + i + '[,]';
        }
        else if (i ===that.params.sequenceImages.length - 1) {
          definition.correctResponsesPattern[0] += 'item_' + i;
        }
        else {
          definition.correctResponsesPattern[0] += 'item_' + i + '[,]';
        }
      }
    };

    /**
     * Add the response part to an xAPI event
     *
     * @param {H5P.XAPIEvent} xAPIEvent
     *  The xAPI event we will add a response to
     */
    that.addResponseToXAPI = function (xAPIEvent) {
      let maxScore = that.getMaxScore();
      let score = that.getScore();
      let success = (score === maxScore);
      let response = [''];
      for (let i = 0; i < that.shuffledCards.length; i++) {
        if (response[0] !== '') {
          response[0] += '[,]';
        }
        response[0] += 'item_' + that.shuffledCards[i].seqNo;
      }
      xAPIEvent.setScoredResult(score, maxScore, that, true, success);
      xAPIEvent.data.statement.result.response = response;
    };


    /**
     * function that triggered upon clicking show solutions button
     */
    that.showSolutions = function () {
      let orderedCards = [];
      for (let i = 0; i < that.numCards; i++) {
        for (let j = 0; j < that.numCards; j++) {
          if (that.shuffledCards[j].seqNo === i) {
            orderedCards.push(that.shuffledCards[j]);
            break;
          }
        }
      }
      that.shuffledCards = orderedCards;
      that.$wrapper.empty();
      that.isShowSolution = true;
      that.timer.stop();
      for ( i = 0; i < that.numCards; i++) {
        if (that.cardsToUse[i].audio && that.cardsToUse[i].audio.stop) {
          that.cardsToUse[i].audio.stop();
          that.cardsToUse[i].$audio.find('.h5p-audio-inner').addClass(
            'audio-disabled');
        }
      }
      that.attach(that.$wrapper);
      that.$list.sortable("disable");
      that.isGamePaused = true; //disable sortable functionality and create the retry button
      that.createRetryButton();
      that.trigger('resize');
    };

    /**
     * shuffle the cards before the game starts or restarts
     */
    that.shuffleCards = function () {
      let numPicket = 0;
      let pickedCardsMap = {};
      that.shuffledCards = [];
      while (numPicket < that.cardsToUse.length) {
        let pickIndex = Math.floor(Math.random() * that.cardsToUse.length);
        if (pickedCardsMap[pickIndex]) {
          continue; // Already picked, try again!
        }
        that.shuffledCards.push(that.cardsToUse[pickIndex]);
        pickedCardsMap[pickIndex] = true;
        numPicket++;
      }
    };



    /**
     * key board navigation
     * @param  {number} direction
     */
    let createItemChangeFocusHandler = function (direction) {

      return function () {


        let currentItem = this;
        for (let i = 0; i < that.numCards; i++) {
          if (that.shuffledCards[i] === currentItem) {
            let nextItem = that.shuffledCards[i + direction];
            let nextIndex = i + direction;
            if (!nextItem) {
              return;
            }

            if (currentItem.isSelected) {
              if (that.isGamePaused) {
                //for disabling the effect of selection in show solution mode
                currentItem.setSelected();
                currentItem.makeUntabbable();
                nextItem.setFocus();
                return;
              }
              swapCards(i, nextIndex);
              let tempDesc= currentItem.description?currentItem.description:'sequencing item';
              currentItem.$card.attr('aria-label','Moved'+tempDesc+ 'from '+(i+1)+'to '+(nextIndex+1));
              currentItem.setFocus();
              that.counter.increment();
              that.isAttempted = true;
              return false;
            }
            else {
              currentItem.makeUntabbable();
              nextItem.setFocus();
            }


          }
        }
      };
    };



    /**
     * updating shuffled cards based on keyboard movements
     *
     * @param  {number} firstPos
     * @param  {number} secondPos
     */
    let swapCards = function (firstPos, secondPos) {
      let i = firstPos;
      let j = secondPos;
      if (i < j) {
        that.shuffledCards[i].$card.insertAfter(that.shuffledCards[j].$card);
      }
      else {
        that.shuffledCards[j].$card.insertAfter(that.shuffledCards[i].$card);
      }
      // that.shuffledCards.swapItems(firstPos, secondPos);

      that.shuffledCards[firstPos] = that.shuffledCards.splice(secondPos, 1, that.shuffledCards[firstPos])[0]; // Swap items
    };


    // /**
    //  * Array.prototype.swapItems -swapping within an array
    //  *
    //  * @param  {ArrayElement} a
    //  * @param  {ArrayElement} b
    //  * @return {Array}
    //  */
    // Array.prototype.swapItems = function (a, b) {
    //   this[a] = this.splice(b, 1, this[a])[0];
    //   return this;
    // };


    /**
     * function that triggers when sortupdate happens on the list
     * used for updating the shuffled list based on the movements made with mouse
     * @param  {Array} order
     */
    let sortUpdate = function (order) {
      let newList = [];
      for (let i = 0; i < that.numCards; i++) {
        for (let j = 0; j < that.numCards; j++) {
          if (that.shuffledCards[j].seqNo === parseInt(order[i].split('_')[1])) {
            newList.push(that.shuffledCards[j]);
            continue;
          }
        }
      }
      that.shuffledCards = newList;
    };

    // implementing question contract.


    /**
     * check whether user is able to play the game
     *
     * @return {boolean}
     */
    that.getAnswerGiven = function () {
      return that.isAttempted;
    };

    /**
     * return the score obtained
     *
     * @return {number}
     */
    that.getScore = function () {
      return that.score;
    };


    /**
     * return the maximum possible score that can be obtained
     *
     * @return {number}
     */
    that.getMaxScore = function () {
      return that.numCards;
    };


    /**
     * function that gets triggered when retry button is pressed
     *
     * @return {type}  description
     */
    that.resetTask = function () {
      that.$wrapper.empty();
      that.shuffleCards();
      that.isRetry = true;
      that.isShowSolution = false;
      that.isGamePaused = false;
      that.attach(that.$wrapper);
    };



    /**
     * Initialize the cards to be used in the game
     */
    that.cardsToUse = that.params.sequenceImages
      .filter(function (params) {
        return ImageSequencing.Card.isValid(params);
      })
      .map(function (params, i) {
        return new ImageSequencing.Card(params, id, i,
          that.params.l10n.audioNotSupported);
      });

    that.shuffleCards();
    that.numCards = that.shuffledCards.length;



    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    that.attach = function ($container) {

      that.triggerXAPI('attempted');
      that.$wrapper = $container.addClass('h5p-image-sequencing').html('');
      $('<div class="h5p-task-description" aria-label="'+that.params.altTaskDescription+'" tabindex="0">' +that.params.taskDescription +
        '</div>').appendTo($container);
      that.$list = $('<ul class="sortable" role="listbox"/>');
      for (let i = 0; i < that.numCards; i++) {
        that.shuffledCards[i].appendTo(that.$list);
        if (!that.isRetry && !that.isResume && !that.isShowSolution) {
          //else events are already registered.
          that.shuffledCards[i].on('selected',function () {
            if (!that.isGamePaused) {
              that.timer.play();
            }
          });

          that.shuffledCards[i].on('next', createItemChangeFocusHandler(1));
          that.shuffledCards[i].on('prev', createItemChangeFocusHandler(-1));
        }
        if (that.isShowSolution) {
          that.shuffledCards[i].setSolved();
        }
      }
      if (that.$list.children().length) {
        that.$list.appendTo($container);
        that.shuffledCards[0].setFocus();

        that.$footerContainer = $('<div class="footer-container"  />');
        that.$feedbackContainer = $('<div class="sequencing-feedback"/>');
        that.$buttonContainer = $(
          '<div class="sequencing-feedback-show" />');
        that.$feedback = $('<div class="feedback-element" ></div>');
        if (!that.isResume && !that.isShowSolution) {
          //else persist existing timer and counter values
          that.$status = $('<dl class="sequencing-status" aria-label="game status" tabindex="0" role="group">' + '<dt id="timeSpent" role="term" tabindex="0">' +
           that.params.l10n.timeSpent + '</dt>' +
            '<dd class="h5p-time-spent" tabindex="0">0:00</dd>' +
            '<dt role="term" tabindex="0">' +that.params.l10n.totalMoves + '</dt>' +
            '<dd  tabindex="0" class="h5p-submits">0</dd>' + '</dl>');
          that.timer = new ImageSequencing.Timer(that.$status.find(
            '.h5p-time-spent')[0]); //Initialize timer
          that.counter = new ImageSequencing.Counter(that.$status.find(
            '.h5p-submits')); //Initialize counter
        }
        else {
          that.isResume = false;
        }
        that.$status.appendTo(that.$footerContainer);
        that.$progressBar = UI.createScoreBar(that.numCards,
          'scoreBarLabel');
        that.$feedback.attr('tabindex', '0');
        that.$feedback.appendTo(that.$feedbackContainer);
        that.$progressBar.appendTo(that.$feedbackContainer);
        that.$feedbackContainer.appendTo(that.$footerContainer);

        if (!that.isShowSolution) {
          //not on showSolution mode
          that.$submit = UI.createButton({
            title: 'Submit',
            click: that.gameSubmitted,
            html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' +
             that.params.l10n.checkAnswer
          });
          that.$submit.appendTo(that.$buttonContainer);
          if (that.params.behaviour.enableSolutionsButton) {
            that.$showSolution = UI.createButton({
              title: 'Submit',
              click: that.showSolutions,
              html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' +
               that.params.l10n.showSolution
            });
            that.$showSolution.appendTo(that.$buttonContainer);
          }
        }
        that.$buttonContainer.appendTo(that.$footerContainer);
        that.$footerContainer.appendTo($container);
      }
      //make the list sortable using jquery ui sortable
      that.$list.sortable({
        placeholder: "sequencing-dropzone",
        tolerance: "pointer",
        helper: "clone",
        containment: $container,
        start: function (event, ui) {
          $(ui.helper).addClass("ui-sortable-helper");
          that.timer.play();
          that.triggerXAPI('interacted');
        },
        stop: function (event, ui) {
          $(ui.helper).removeClass("ui-sortable-helper");
        },
        update: function (event, ui) {
          let order = that.$list.sortable("toArray");
          sortUpdate(order);
        },
      });
      //for preventing clicks on each sortable element
      that.$list.disableSelection();
      // capturing the drop event on sortable
      that.$list.find("li").droppable({
        drop: function (event, ui) {
          that.counter.increment();
          that.isAttempted = true;
        }
      });
    };
    // registering the H5P.ImageSequencingObject to handle the resize event
    if (that.level) {
      // that.on('resize', scaleGameSize);
      that.trigger('resize');
    }
  }
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
