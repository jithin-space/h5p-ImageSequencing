H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

    // We don't want to go smaller than 100px per card(including the required margin)
    // var CARD_MIN_SIZE = 100; // PX
    // var CARD_STD_SIZE = 116; // PX
    // var STD_FONT_SIZE = 16; // PX
    // var LIST_PADDING = 1; // EMs

    /**
     * Image Sequencing Constructor
     *
     * @class H5P.ImageSequencing
     * @extends H5P.EventDispatcher
     * @param {Object} parameters
     * @param {Number} id
     */
    function ImageSequencing(parameters, id) {

        var self = this;


        EventDispatcher.call(self);

        // var flipped, timer, counter, popup, $feedback, $wrapper, maxWidth, numCols;
        var timer;
         var images = [];
         var droppers=[];
        // var flipBacks = []; // Que of cards to be flipped back
        // var numFlipped = 0;
        // var removed = 0;


        var check= function (image,dropzone){
           //check for correct dropping
           if(!correct)
           {
             //do actions and
             return;
           }
           //do other stuffs here
          var isFinished = ( stage === images.length);
          var desc = image.getDescription();
          if(desc !== undefined){
            timer.pause();
            popup.show(desc, image.getImage(), function() {
                if (isFinished) {
                    // Game done
                    finished();
                } else {
                    // Popup is closed, continue.
                    timer.play();
                }
            });
          }else if (isFinished) {
              // Game done
              finished();
          }

           //common counter operations
         };

        var finished = function (){
          // alert("working");
          calculateScore();
          timer.stop();
          self.feedback.addClass('h5p-show');
          //stop timer
          //show feedback good work
          //if retry option is enabled...create Button for try again and
          //resetGame
        }

        var calculateScore = function(){
          images.forEach(function(element) {
                // alert(element.getPos()+'on'+element.getSequenceNo());
                if(element.getPos() == element.getSequenceNo()){
                  element.correct();
                }
                else{
                  element.incorrect();
                }
            });

        }

         var resetGame = function(){
           //reinitialize counters..
           //reset all images. (image.reset)
           //remove feedback appeared
           //timer reset
           //counter reset
           //Shuffle images
           //reappend to Dom (images.reappend) and respond to new scale
         }


        var createButton= function (name,label,action){
          //create the retry button
          //attach event listeners
          //return buttonElement
        }

        var addImage = function(image,pos)
        {
          image.on('drag',function(e){
            timer.play();
          });

          images[pos]= image;
          // images.push(image);

        }

        var addDropper = function(dropper)
        {

          droppers.push(dropper);

        }

        var getImagesToUse = function(){
         return parameters.sequenceimages;
       }

       ImageSequencing.calculate = function(width) {
         var level=images.length;
         var width=self.$wrapper.width();
         var eWidth = (width - (2 * level)) / level;
         var iWidth = (eWidth - (20));
         return [eWidth,iWidth];
       }




      var imagesToUse= getImagesToUse();
      seq=Array.apply(null, {length: imagesToUse.length}).map(Number.call, Number)
      H5P.shuffleArray(seq);
       for (var i=0; i< imagesToUse.length; i++){
         var imageParams = imagesToUse[i];
         if (ImageSequencing.Image.isValid(imageParams)) {
             var image = new ImageSequencing.Image(imageParams.image, id,seq[i],i,imageParams.description);
             addImage(image,seq[i]);
         }

       }

      //  H5P.shuffleArray(images);



        self.attach = function($container) {
          //for once
            self.$wrapper = $container.addClass('l-wrap').html('');
            var $dragZone = $('<div id="columns-full" class="l-col-grid"/>');
            for (var i = 0; i < images.length; i++) {
                images[i].appendTo($dragZone);
            }

            if ($dragZone.children().length) {
                $dragZone.appendTo($container);

                self.feedback = $('<div class="h5p-feedback"> Good Work! </div>').appendTo($container);

                // Add status bar
                var $status = $('<dl class="h5p-status">' +
                    '<dt>Time Spent</dt>' +
                    '<dd class="h5p-time-spent">0:00</dd>' +
                    '<dt>Drags:</dt>' +
                    '<dd class="h5p-card-turns">0</dd>' +
                    '</dl>').appendTo($container);
		var $button = H5P.JoubelUI.createButton({
  title: 'Retry',
  click: function (event) {
    console.log('Retry was clicked');
  }
}).appendTo($container);
		//H5P.JoubelUI.showButton('acddl');
		var $progressbar=H5P.JoubelUI.createScoreBar(5,'Progress').appendTo($container);
                // self.$dropZone.append(H5P.JoubelUI.createTip(self.tip));
                submit=$('<button type="button" class="h5p-submit">Submit</button>').appendTo($container);
                submit.on('click',function(e){finished()});
                timer = new ImageSequencing.Timer($status.find('.h5p-time-spent')[0]);
                counter = new ImageSequencing.Counter($status.find('.h5p-card-turns'));
                popup = new ImageSequencing.Popup($container);


            }


            // Add images to list
            //add list to container
            //initialize feedback section
            //image drags and timer elements..
            //initialize timer and counter//
            //on click popup should be closed...

        };


        var scaleGameSize = function() {
          //dkjkdsjkjsdk
          //scale the game according to the image
        };

        // if (parameters.behaviour && parameters.behaviour.useGrid && cardsToUse.length) {
        //     self.on('resize', scaleGameSize);
        // }
    }

    // Extends the event dispatcher
    ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.prototype.constructor = ImageSequencing;

    return ImageSequencing;
})(H5P.EventDispatcher, H5P.jQuery );
