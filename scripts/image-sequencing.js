var H5P = H5P || {};
H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

    function ImageSequencing(parameters, id) {

      var self = this;
      EventDispatcher.call(self);

      var imageList=[];
      var level=0;
      var sequence=[];

      var addImage = function(image){
        image.on('reattach',function(){
          reattach();
        });
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

      var setRandomSequence = function(){
        sequence=Array.apply(null, {length: level}).map(Number.call, Number);
        H5P.shuffleArray(sequence);

      }

      var setImagePos = function(){
        for (var i = 0; i < level; i++) {
            imageList[i].setPos(sequence[i]);
        }
      }

      var scaleGameSize = function() {
        // resizing value;
      }
      var initializeGame = function(images,id){
        setImageList(images,id);
        setGameLevel();
        setRandomSequence();
        setImagePos();
        imageList.sort(reorder);
        // shuffled=H5P.shuffleArray(imageList);
      }

      var calculate = function(width){
        var eWidth = (width - (2 * level)) / level;
        var iWidth = (eWidth - (20));
        return [eWidth,iWidth];
      }

      var reorder = function (a,b) {
        if (a.pos < b.pos)
          return -1;
        if (a.pos > b.pos)
          return 1;
        return 0;
        }


      var reattach = function(){
        self.$dragZone.empty();
        self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
        // console.log(shuffled);
        for (var i = 0; i < level; i++) {

        imageList.sort(reorder);
        imageList[i].appendTo(self.$dragZone,self.$size);
        }
        self.$dragZone.appendTo(self.$wrapper);
      }

       initializeGame(parameters.sequenceimages,id);

        self.attach = function($container) {

            self.$wrapper = $container.addClass('l-wrap').html('');
            self.$size = calculate(self.$wrapper.width());
            self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');

            for (var i = 0; i < level; i++) {
                imageList[i].appendTo(self.$dragZone,self.$size);
            }
            if (level) {
                self.$dragZone.appendTo($container);
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
