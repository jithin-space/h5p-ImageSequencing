var H5P = H5P || {};
H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

    function ImageSequencing(parameters, id) {

      var self = this;
      EventDispatcher.call(self);

      var imageList=[];
      var level=0;
      var shuffled=[];

      var addImage = function(image){
        imageList.push(image)
      }
      var getGameLevel = function(){
        return imageList.length;
      }
      var setGameLevel = function(){
        level=imageList.length;
      }
      var getImageList = function(){
        return imageList;
      }
      var setImageList = function(images,id){
        for (var i = 0; i < images.length; i++) {
            var image = new ImageSequencing.Image(images[i].image,id,i,images[i].description);
            addImage(image);
        }

      }
      var scaleGameSize = function() {
        // resizing value;
      }
      var initializeGame = function(images,id){
        setImageList(images,id);
        setGameLevel();
        shuffled=H5P.shuffleArray(imageList);
      }

       initializeGame(parameters.sequenceimages,id);

        self.attach = function($container) {

            var $wrapper = $container.addClass('l-wrap').html('');
            var size = self.calculate($wrapper.width());
            var $dragZone = $('<div id="columns-full" class="l-col-grid"/>');
            for (var i = 0; i < level; i++) {
                shuffled[i].appendTo($dragZone);
            }
            if (level) {
                $dragZone.appendTo($container);
                var $feedback = $('<div class="h5p-feedback"> Good Work! </div>').appendTo($container);
                var $status = $('<dl class="h5p-status">' + '<dt>Time Spent</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
                    '<dt>Drags:</dt>' + '<dd class="h5p-card-turns">0</dd>' + '</dl>').appendTo($container);
                var $submit=$('<button type="button" class="h5p-submit">Submit</button>').appendTo($container).on('click',function(e){gameSubmitted()});
                timer = new ImageSequencing.Timer($status.find('.h5p-time-spent')[0]);
                counter = new ImageSequencing.Counter($status.find('.h5p-card-turns'));
            }
        }

    }

    ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.prototype.constructor = ImageSequencing;

    return ImageSequencing;
  })(H5P.EventDispatcher, H5P.jQuery ,H5P.JoubelUI);
