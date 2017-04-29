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

        Element.prototype.hasClassName = function(name) {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
      };

      Element.prototype.addClassName = function(name) {
        if (!this.hasClassName(name)) {
          this.className = this.className ? [this.className, name].join(' ') : name;
        }
      };

      Element.prototype.removeClassName = function(name) {
        if (this.hasClassName(name)) {
          var c = this.className;
          this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
        }
      };


        self.handleStart=function(e){
          self.$dropper.style.opacity = '0.4';
          dragSrcEl_ = self.$dropper;
          self.$dropper.addClassName('moving');
          e.originalEvent.dataTransfer.effectAllowed = 'move';
          self.trigger('drag');
        }

        self.handleDragEnter=function(e,th) {
          // this / e.target is the current hover target.
          th.classList.add('over');
          }

        self.handleDragOver=function(e) {
          if (e.preventDefault) {
          e.preventDefault(); // Necessary. Allows us to drop.
          }

          e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

          return false;
          }

          self.handleDragLeave=function(e,th) {
            th.classList.remove('over');  // this / e.target is previous target element.
          }

        self.handleDrop=function(e,th) {
        // this / e.target is current target element.


        if (e.preventDefault) {
          e.preventDefault(); // stops the browser from redirecting.
        }


        if (dragSrcEl_ != th) {

          // Set the source column's HTML to the HTML of the column we dropped on.
          dragSrcEl_.innerHTML = th.innerHTML;
          th.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
          var count = th.querySelector('.count');
          var newCount = parseInt(count.getAttribute('data-col-moves')) + 1;
          var img1 = th.querySelector('img');
          var pos1 = parseInt(img1.getAttribute('data-pos'));
          var img2 = dragSrcEl_.querySelector('img');
          var pos2 = parseInt(img2.getAttribute('data-pos'));
          img1.setAttribute('data-pos',pos2);
          img2.setAttribute('data-pos',pos1);
          count.setAttribute('data-col-moves', newCount);
          count.textContent = 'moves: ' + newCount;
        }
        // See the section on the DataTransfer object.
        self.handleDragEnd(e,th);
        return false;
      }

      self.handleDragEnd=function(e,th) {
      // this/e.target is the source node.
      var id_ = 'columns-full';
      var cols_ = document.querySelectorAll('#' + id_ + ' .columns');
      console.log(cols_.length);
        [].forEach.call(cols_, function (col) {
          col.removeClassName('over');
          col.removeClassName('moving');
          col.style.opacity ='1';
        });
    }




        self.appendTo = function($container) {
            width=[100,100];
            self.$dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" draggable="true"><header class="count" data-col-moves="0">moves:0</header><div>\
            <img src="' + path + '" data-pos="'+pos+'" data-id="'+seq_no+'""  alt="Sequence Image Card" \
             width="'+width[1]+'px" height="'+width[1]+'px" drggable="true"/></div></div>').appendTo($container);
            self.$dropper.on('dragstart',handleStart(e));
            self.$dropper.on('dragenter',handleDragEnter(e));
            self.$dropper.on('dragover',handleDragOver(e));
            self.$dropper.on('dragleave',handleDragLeave(e));
            self.$dropper.on('drop',handleDrop(e));
            self.$dropper.on('dragend',handleDragEnd(e));
        };
    };

    ImageSequencing.Image.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Image.prototype.constructor = ImageSequencing.Image;

    ImageSequencing.Image.isValid = function(params) {
        return (params !== undefined &&
            params.image !== undefined &&
            params.image.path !== undefined);
    };

})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
