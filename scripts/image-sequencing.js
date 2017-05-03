var H5P = H5P || {};
H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

    function ImageSequencing(parameters, id) {

        var self = this;
        EventDispatcher.call(self);

        var imageList = [];
        var imageHolder = [];
        var level = 0;
        var sequence = [];
        var timer;

        var addImage = function(image) {
            image.on('reattach', function() {
                reattach();
            });
            image.on('drag', function(){
                self.timer.play();
            });
            imageList.push(image);
        }
        var getGameLevel = function() {
            return imageList.length;
        }
        var setGameLevel = function() {
            level = imageList.length;
        }
        var getImageList = function() {
            return imageList;
        }
        var setImageList = function(images, id) {
            for (var i = 0; i < images.length; i++) {
                var image = new ImageSequencing.Image(images[i].image, id, i, images[i].description);
                addImage(image);
            }

        }

        var setDropper = function(pos) {
            self.dropper = new ImageSequencing.Dropper(pos);
            self.dropper.on('reattach',function(){
                reattach();
            })
        }
        var getDropper = function() {
            self.dropper;
        }


    var setRandomSequence = function() {
        sequence = Array.apply(null, {
            length: level
        }).map(Number.call, Number);
        H5P.shuffleArray(sequence);

    }

    var setImagePos = function() {
        for (var i = 0; i < level; i++) {
            imageList[i].setPos(sequence[i]);
        }
    }
    var setLinkedList = function() {
      for (var i = 0; i < level; i++) {
          imageList[i].setNext(imageList[i+1]);
          imageList[i].setPrev(imageList[i-1]);
      }
    }

    var setImageHolder = function(list) {
        for (var i = 0; i < level; i++) {
            position = list[i].getPos();
            // console.log(position);
            if (position >= 0) {
                imageHolder[position] = $('<div class="imageHolder"></div>');
                list[i].appendTo(imageHolder[position], self.size);
            } else {
                position = position - (position * 2);
                imageHolder[position] = $('<div class="imageHolder"></div>');
                setDropper(position);
                self.dropper.appendTo(imageHolder[position], self.size);
            }

        }
        // console.log('end');
    }

    var scaleGameSize = function() {
        // resizing value;
    }
    var initializeGame = function(images, id) {
        setImageList(images, id);
        setGameLevel();
        setRandomSequence();
        imageList.sort(reorder);
        setImagePos();
        setLinkedList();
    }

    var calculate = function(width) {
        var eWidth = (width - (2 * level)) / level;
        var iWidth = (eWidth - (20));
        return [eWidth, iWidth];
    }

    var reorder = function(a, b) {
        if (a.pos < b.pos)
            return -1;
        if (a.pos > b.pos)
            return 1;
        return 0;
    }

    var gameSubmitted = function (){

      calculateScore();
      console.log('entering');
      self.timer.stop();
      self.counter.increment();
      self.$feedback.addClass('h5p-show');
      self.$progressBar.$scoreBar.addClass('h5p-show');
      //stop timer
      //show feedback good work
      //if retry option is enabled...create Button for try again and
      //resetGame
    }

    var calculateScore = function(){
      score=0
      imageList.forEach(function(element) {
            // alert(element.getPos()+'on'+element.getSequenceNo());
            if(element.getPos() == element.getSequenceNo()){
              score++;
              element.correct();
            }
            else{
              element.incorrect();
            }

        });
      self.$progressBar.setScore(score);

      feedbackMessage= getFeedbackMessage((score/level)*100);

      self.$feedback.html(feedbackMessage);

    }

    var getFeedbackMessage = function(performance){

      switch (true) {
        case (performance<25):
            msg="Poor Effort";
          break;
          case performance<50:
              msg="Keep Trying";
            break;
            case performance<75:
                msg="Almost There";
              break;
              case performance<100:
                  msg="Close To Victory";
                break;
        default:
            msg="Excellent..";

      }
      return msg;
    }

    var reattach = function() {
        self.$wrapper.empty();
        self.$dragZone.empty();
        self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
        imageList.sort(reorder);
        setLinkedList();
        setImageHolder(imageList);
        for (var i = 0; i < level; i++) {
            imageHolder[i].appendTo(self.$dragZone, self.$size);
        }
        if (level) {
            self.$dragZone.appendTo(self.$wrapper);
            self.$feedback.appendTo(self.$wrapper);
            self.$progressBar.appendTo(self.$wrapper);
            self.$status.appendTo(self.$wrapper);
            self.$submit = H5P.JoubelUI.createButton({title: 'Submit', click: function (event) { gameSubmitted(); },html:'Submit'});
            self.$submit.appendTo(self.$wrapper);

        }
    }

    initializeGame(parameters.sequenceimages, id);

    self.attach = function($container) {

        self.$wrapper = $container.addClass('l-wrap').html('');
        self.size = calculate(self.$wrapper.width());
        self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
        setImageHolder(imageList);
        for (var i = 0; i < level; i++) {
            imageHolder[i].appendTo(self.$dragZone, self.$size);
        }
        if (level) {
            self.$dragZone.appendTo($container);
            self.$feedback = $('<div class="h5p-feedback"> Good Work! </div>');
            self.$progressBar=UI.createScoreBar(level, 'scoreBarLabel');
            self.$progressBar.appendTo($container);
            self.$progressBar.$scoreBar.addClass("h5p-feedback");
            self.$feedback.appendTo($container);
            self.$status = $('<dl class="h5p-status">' + '<dt>Time Spent</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
                '<dt>Total Submits:</dt>' + '<dd class="h5p-submits">0</dd>' + '</dl>');
            self.$status.appendTo($container);
            self.$submit = H5P.JoubelUI.createButton({title: 'Submit', click: function (event) { gameSubmitted(); },html:'Submit'});
            self.$submit.appendTo($container);


            // $('<button type="button" class="h5p-submit">Submit</button>').on('click', function(e) {
            //     gameSubmitted()
            // });
            self.$submit.appendTo($container);
            self.timer = new ImageSequencing.Timer(self.$status.find('.h5p-time-spent')[0]);
            self.counter = new ImageSequencing.Counter(self.$status.find('.h5p-submits'));
        }
    }

};

ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
ImageSequencing.prototype.constructor = ImageSequencing;

return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
