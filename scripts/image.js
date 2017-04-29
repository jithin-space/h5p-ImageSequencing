(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Image = function(image,id,seq_no,description) {

        var self = this;
        EventDispatcher.call(self);

        var path = H5P.getPath(image.path, id);
        var seq_no = seq_no;
        var description = description;

        self.getDescription = function() {
            return description;
        };

        self.setPos = function(pos){
          self.pos=pos;
        }

        self.getImage = function() {
            return $image.find('img').clone();
        };

        self.getPos = function() {
          // alert(self.$dropper.find('img').attr('data-pos'));
          return self.$dropper.find('img').attr('data-pos');
          // return img.getAttribute('data-pos');
        }

        self.getSequenceNo = function() {
          return self.$dropper.find('img').attr('data-id');
        };
        self.correct= function(){
          self.$dropper.removeClass('incorrect');
          self.$dropper.addClass('correct');
        }
        self.incorrect= function(){
          self.$dropper.removeClass('correct');
          self.$dropper.addClass('incorrect');
        }




        self.handleStart=function(e){
          self.$dropper.css('opacity','0.4');
          dragSrcEl_ = self;
          self.$dropper.addClass('moving');
          e.originalEvent.dataTransfer.effectAllowed = 'move';
          e.originalEvent.dataTransfer.setData('pos',self.pos);
          // self.trigger('drag');
        }

        self.handleDragEnter=function(e) {

           self.$dropper.addClass('over');
          }

        self.handleDragOver=function(e) {
          if (e.preventDefault) {
          e.preventDefault(); // Necessary. Allows us to drop.
          }

          e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

          return false;
          }

          self.handleDragLeave=function(e) {
            self.$dropper.removeClass('over');  // this / e.target is previous target element.
          }

        self.handleDrop=function(e) {
        // this / e.target is current target element.


        if (e.preventDefault) {
          e.preventDefault(); // stops the browser from redirecting.
        }


        if (dragSrcEl_.pos != self.pos) {

          dragSrcEl_.pos=self.pos;
          self.pos=e.originalEvent.dataTransfer.getData('pos');

          self.trigger('reattach');
          //dragSrcEl_.pos=self.pos;

          // Set the source column's HTML to the HTML of the column we dropped on.
          //  dragSrcEl_= self;
          //  self= e.originalEvent.dataTransfer.getData('dropper');
          //  self.trigger('reattach');
          // var count = th.querySelector('.count');
          // var newCount = parseInt(count.getAttribute('data-col-moves')) + 1;
          // var img1 = th.querySelector('img');
          // var pos1 = parseInt(img1.getAttribute('data-pos'));
          // var img2 = dragSrcEl_.querySelector('img');
          // var pos2 = parseInt(img2.getAttribute('data-pos'));
          // img1.setAttribute('data-pos',pos2);
          // img2.setAttribute('data-pos',pos1);
          // count.setAttribute('data-col-moves', newCount);
          // count.textContent = 'moves: ' + newCount;
        }
        // See the section on the DataTransfer object.
        // self.handleDragEnd(e,th);
        return false;
      }

      self.handleDragEnd=function(e,th) {
      // this/e.target is the source node.
      // var id_ = 'columns-full';
      // var cols_ = document.querySelectorAll('#' + id_ + ' .columns');
      // console.log(cols_.length);
      //   [].forEach.call(cols_, function (col) {
      //     col.removeClassName('over');
      //     col.removeClassName('moving');
      //     col.style.opacity ='1';
      //   });
    }




        self.appendTo = function($container,width) {
            self.$dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" draggable="true"><header class="count" data-col-moves="0">moves:0</header><div>\
            <img src="' + path + '"  alt="Sequence Image Card" width="'+width[1]+'px" height="'+width[1]+'px" drggable="true"/></div></div>').appendTo($container);
            self.$dropper.on('dragstart',function(e){self.handleStart(e)});
            self.$dropper.on('dragenter',function(e){self.handleDragEnter(e)});
            self.$dropper.on('dragover',function(e){self.handleDragOver(e)});
            self.$dropper.on('dragleave',function(e){self.handleDragLeave(e)});
            self.$dropper.on('drop',function(e){self.handleDrop(e)});
            self.$dropper.on('dragend',function(e){self.handleDragEnd(e)});
        };
    };

    ImageSequencing.Image.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Image.prototype.constructor = ImageSequencing.Image;

    ImageSequencing.Image.isValid = function(params) {
        return (params !== undefined && params.image !== undefined && params.image.path !== undefined);
    };

})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
