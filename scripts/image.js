(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Image = function(image, id, seq_no, description,level) {

        var self = this;
        EventDispatcher.call(self);
        self.seq_no=seq_no;

        var path = H5P.getPath(image.path, id);
        var width, height, margin, $card;

        if (image.width !== undefined && image.height !== undefined) {
            if (image.width > image.height) {
                width = '100%';
                height = 'auto';
            } else {
                height = '100%';
                width = 'auto';
            }
        } else {
            width = height = '100%';
        }


        self.drop = function() {
            $image.addClass('h5p-drag');
            self.trigger('drop');
        };


        self.dropBack = function() {
            $image.removeClass('h5p-drag');
        };

        /**
         * Remove.
         */
        self.remove = function() {
            $image.addClass('h5p-matched');
        };

        /**
         * Reset card to natural state
         */
        self.reset = function() {
            $image.classList.remove('h5p-drag', 'h5p-matched');
        };


        self.getDescription = function() {
            return description;
        };


        self.getImage = function() {
            return $img.find('img').clone();
        };

        self.getSequenceNo = function() {
          return self.seq_no;
        };

        drag= function(ev) {
          ev.dataTransfer.setData("id",ev.target.getAttribute('data-id'));
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



        self.handleStart=function(e,th){
          th.style.opacity = '0.4';  // this / e.target is the source node.
          dragSrcEl_ = th;
          th.addClassName('moving');

          e.originalEvent.dataTransfer.effectAllowed = 'move';
          e.originalEvent.dataTransfer.setData('text/html', th.innerHTML);

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
        [].forEach.call(cols_, function (col) {
          col.removeClassName('over');
          col.removeClassName('moving');
          col.style.opacity ='1';
        });
    }




        self.appendTo = function($container) {
            var width  = ImageSequencing.calculate($container.width());
            $dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" draggable="true"><header class="count" data-col-moves="0">moves:0</header><div>\
            <img src="' + path + '" data-id="'+self.getSequenceNo()+'"  alt="Sequence Image Card" \
             width="'+width[1]+'px" height="'+width[1]+'px" drggable="true"/></div></div>').appendTo($container);
            $dropper.on('dragstart',function(e){self.handleStart(e,this)});
            $dropper.on('dragenter',function(e){self.handleDragEnter(e,this)});
            $dropper.on('dragover',function(e){self.handleDragOver(e)});
            $dropper.on('dragleave',function(e){self.handleDragLeave(e,this)});
            $dropper.on('drop',function(e){self.handleDrop(e,this)});
            $dropper.on('dragend',function(e){self.handleDragEnd(e,this)});

        };

        /**
         * Re-append to parent container
         */
        // self.reAppend = function() {
        //     var parent = $Image[0].parentElement.parentElement;
        //     parent.appendChild($Image[0].parentElement);
        // };
    };

    // Extends the event dispatcher
    ImageSequencing.Image.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Image.prototype.constructor = ImageSequencing.Image;

    /**
     * Check to see if the given object corresponds with the semantics for
     * a memory game Image.
     *
     * @param {object} params
     * @returns {boolean}
     */
     ImageSequencing.Image.isValid = function(params) {
        return (params !== undefined &&
            params.image !== undefined &&
            params.image.path !== undefined);
    };


    // ImageSequencing.Card.hasTwoImages = function(params) {
    //     return (params !== undefined &&
    //         params.match !== undefined &&
    //         params.match.path !== undefined);
    // };

})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
