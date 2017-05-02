var H5P = H5P || {};
H5P.ImageSequencing = (function(EventDispatcher, $, UI) {

    function ImageSequencing(parameters, id) {

      var self = this;
      EventDispatcher.call(self);

      var imageList=[];
      var imageHolder=[];
      var level=0;
      var sequence=[];

      var addImage = function(image){
        image.on('reattach',function(){
          reattach();
        });
        imageList.push(image);
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

      var setDropper = function(){
            var dropper = new ImageSequencing.Dropper();
        }
      var getDropper = function(){
         return dropper;
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

      var setImageHolder = function(list){
          for (var i = 0; i < level; i++) {
            position=list[i].getPos();
            if(position >=0){
              imageHolder[position]=$('<div class="imageHolder"></div>');
              list[i].appendTo(imageHolder[position],self.size);
            }
            else{
              position++;
              position=position-(position * 2);
              dropper.appendTo(imageHolder[position],self.size);
            }

          }
      }

      var scaleGameSize = function() {
        // resizing value;
      }
      var initializeGame = function(images,id){
        setImageList(images,id);
        setDropper();
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
        self.$wrapper.empty();
        self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
        // console.log(shuffled);
        setImageHolder(imageList);
        for (var i = 0; i < level; i++) {
        imageHolder[i].appendTo(self.$dragZone,self.$size);
        }
        if (level) {
            self.$dragZone.appendTo(self.$wrapper);
            var $feedback = $('<div class="h5p-feedback"> Good Work! </div>').appendTo(self.$wrapper);
            var $status = $('<dl class="h5p-status">' + '<dt>Time Spent</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
                '<dt>Drags:</dt>' + '<dd class="h5p-card-turns">0</dd>' + '</dl>').appendTo(self.$wrapper);
            var $submit=$('<button type="button" class="h5p-submit">Submit</button>').appendTo(self.$wrapper).on('click',function(e){gameSubmitted()});
            timer = new ImageSequencing.Timer($status.find('.h5p-time-spent')[0]);
            counter = new ImageSequencing.Counter($status.find('.h5p-card-turns'));
        }
      }

       initializeGame(parameters.sequenceimages,id);

        self.attach = function($container) {

            self.$wrapper = $container.addClass('l-wrap').html('');
            self.size = calculate(self.$wrapper.width());
            self.$dragZone = $('<div id="columns-full" class="l-col-grid"/>');
            setImageHolder(imageList);
            for (var i = 0; i < level; i++) {
                imageHolder[i].appendTo(self.$dragZone,self.$size);
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

  

    ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.prototype.constructor = ImageSequencing;

    return ImageSequencing;
  })(H5P.EventDispatcher, H5P.jQuery ,H5P.JoubelUI);
