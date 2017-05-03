(function(ImageSequencing, EventDispatcher, $) {


    ImageSequencing.Image = function(image,id,seq_no,description) {

        var self = this;
        EventDispatcher.call(self);

        var path = H5P.getPath(image.path, id);
        var seq_no = seq_no;
        var description = description;
        var moves=0;

        self.getDescription = function() {
            return description;
        };

        self.setPos = function(pos){
          self.pos=pos;
        }

        self.getMoves= function(){
          return moves;
        }

        self.setMoves = function(){
          moves++;
        }

        self.getImage = function() {
            return $image.find('img').clone();
        };

        self.getPos = function() {
          return self.pos;
        }

        self.getSequenceNo = function() {
          return seq_no;
        };
        self.correct= function(){
          self.$dropper.removeClass('incorrect');
          self.$dropper.addClass('correct');
        }
        self.incorrect= function(){
          self.$dropper.removeClass('correct');
          self.$dropper.addClass('incorrect');
        }

        self.setNext = function(image){
          self.next=image;
        }
        self.setPrev = function(image){
          self.prev=image;
        }
        self.getNext = function(){
          return self.next;
        }
        self.getPrevious = function(){
          return self.prev;
        }

        self.correct = function(){
          self.$dropper.css('border','2px solid green');
        }

        self.incorrect = function(){
          self.$dropper.css('border','2px solid red');
        }



        self.handleStart=function(e){
          self.$dropper.css('opacity','0.4');
          dragSrcEl_ = self;
          self.$dropper.addClass('moving');
          e.originalEvent.dataTransfer.effectAllowed = 'move';
          //e.originalEvent.dataTransfer.setData('pos',self.pos);
          e.originalEvent.dataTransfer.setData('src',self);
          self.trigger('drag');
        }

        self.handleDragEnter=function(e) {

           self.$dropper.addClass('over');
          if (dragSrcEl_.pos != self.pos) {
             var i= self.pos;
             var move=Math.abs(dragSrcEl_.pos) - self.pos;
             var current=self;
             if(move>0){
               //dir=righ
               while(current != undefined && move !=0){
                 next=current.getNext();
                 current.pos+=1;
                 current=next;
                 move--;
               }
             }
             else{
               while(current != undefined && move !=0){
                 prev=current.getPrevious();
                 current.pos-=1;
                 current=prev;
                 move++;
               }
             }

               dragSrcEl_.pos=i - (i * 2);
             self.trigger('reattach');

           }

          }

        self.handleDragOver=function(e) {
          if (e.preventDefault) {
          e.preventDefault();
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

        self.$dropper.removeClass('over');
        if (dragSrcEl_.pos != self.pos) {

          //dragSrcEl_.pos=e.originalEvent.dataTransfer.getData('pos');
          //self.trigger('reattach');
          //dragSrcEl_.pos=self.pos;
        }
        // See the section on the DataTransfer object.
        // self.handleDragEnd(e,th);
        return false;
      }

      self.handleDragEnd=function(e) {
          self.$dropper.removeClass('moving');
          self.$dropper.css('opacity','1');
      }




        self.appendTo = function($container,width) {
            self.$dropper = $('<div class="columns" width="'+width[0]+'px" height="'+width[0]+'px" draggable="true"><header class="count" data-col-moves="0">moves:'+self.getMoves()+'</header><div>\
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
