(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Dropper = function( id, seq_no) {

        var self = this;
        EventDispatcher.call(self);

        self.seq_no=seq_no;
        self.drop = function() {
            $image.addClass('h5p-drag');
            self.trigger('drop');
        };


        self.reset = function() {
            //$image.classList.remove('h5p-drag', 'h5p-matched');
        };

        self.getSequenceNo = function() {
          return self.seq_no;
        };

        allowDrop=function(ev){
           ev.preventDefault();

        }
        drop=function(ev,target){
          ev.preventDefault();
          // alert(target.id);
          ev.target.appendChild(document.getElementById(data));
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

        if (e.stopPropagation) {
          e.stopPropagation(); // stops the browser from redirecting.
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

        return false;
      }

      self.handleDragEnd=function(e,th) {
      // this/e.target is the source node.
      th.style.opacity = '1';
      var id_ = 'columns-full';
      var cols_ = document.querySelectorAll('#' + id_ + ' .columns');
        [].forEach.call(cols_, function (col) {
          col.removeClassName('over');
          col.removeClassName('moving');
        });
    }


        self.appendTo = function($container) {
            // var width  = ImageSequencing.calculate($container.width());
            // $dropper = $('<div class="columns" draggable="true"><header class="count" data-col-moves="0">Drags:0</header><div></div></div>').appendTo($container);
            // $dropper.on('dragstart',function(e){self.handleStart(e,this)});
            // $dropper.on('dragenter',function(e){self.handleDragEnter(e,this)});
            // $dropper.on('dragover',function(e){self.handleDragOver(e)});
            // $dropper.on('dragleave',function(e){self.handleDragLeave(e,this)});
            // $dropper.on('drop',function(e){self.handleDrop(e,this)});
            // $dropper.on('dragend',function(e){self.handleDragEnd(e,this)});
          };


    };

    // Extends the event dispatcher
    ImageSequencing.Dropper.prototype = Object.create(EventDispatcher.prototype);
    ImageSequencing.Dropper.prototype.constructor = ImageSequencing.Dropper;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
