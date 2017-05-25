(function(ImageSequencing, EventDispatcher, $) {
  /**
   * Controls all the operations on the linkedList Object Created
   *
   * @class H5P.ImageSequencing.LinkedList
   * @extends H5P.EventDispatcher
   *
   */

  ImageSequencing.LinkedList = function() {
    /** @alias H5P.ImageSequencing.Dropper# */
    var self = this;
    EventDispatcher.call(self);
    self.length = 0;
    self.head = null;
    self.tail = null;
    self.dropperPos=0;

    // function to get the length of the linkedList


    self.getLength = function(){
      return self.length;
    };
    // function to add a node to the linkedList
    self.add = function(node){
       if (self.length) {
           self.tail.setNext(node);
           node.setPrev(self.tail);
           self.tail = node;
       } else {
           self.head = node;
           self.tail = node;
       }
       self.length++;
        };
    // function to get the current position of dropper in the linkedList
    self.getDropperPos = function(){
      var currentNode = self.head ;
      var count=0;
       while (count < self.getLength()) {
         if(currentNode.getType() == "Dropper"){
           return currentNode.getPos();
         }
           currentNode = currentNode.getNext();
           count++;
       }
    };

    // function to move a node from currentPos to targetPos through the linkedList
    self.moveThroughList = function(targetPos,currentPos){
      var moves = currentPos-targetPos;
      var currentNode = self.getNodeAt(currentPos);
      if(moves < 0){
        while(moves<0){
         var nextNode = currentNode.getNext();
         self.swap(currentNode,nextNode);
          moves++;
        }
      }
      else{
        while(moves>0){
          var prevNode = currentNode.getPrev();
          self.swap(prevNode,currentNode);
          moves--;
        }
      }
    };

    // function to swap prevNode with currentNode
    self.swap = function(prevNode,currentNode){
      var temp=currentNode.getPos();
      currentNode.setPos(prevNode.getPos());
      prevNode.setPos(temp);
      prevNode.setNext(currentNode.getNext());
      temp=prevNode.getPrev();
      prevNode.setPrev(currentNode);
      currentNode.setPrev(temp);
      currentNode.setNext(prevNode);
      if(currentNode.getPrev() !== undefined){
        currentNode.getPrev().setNext(currentNode);
      }
      else {
        self.head = currentNode;
      }
      if(prevNode.getNext() !== undefined){
        prevNode.getNext().setPrev(prevNode);
      }
      else {
        self.tail = prevNode;
      }
    };
    // function to shift the  dropper from currentPos to targetPos in the linkedList
    self.swapDropper = function(targetPos){
      var currentPos=self.getDropperPos();
      if(currentPos > targetPos ){
        self.swap(self.getNodeAt(targetPos),self.getNodeAt(currentPos));
      }else{
        self.swap(self.getNodeAt(currentPos),self.getNodeAt(targetPos));
      }
    };

    // function to getNode at given pos in the linkedList
    self.getNodeAt = function(pos){
        var currentNode = self.head ;
        var count = 0 ;
         while (count < pos) {
             currentNode = currentNode.getNext();
             count++;
         }
         return currentNode;
      };

  };


  // Extends the event dispatcher
  ImageSequencing.LinkedList.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.LinkedList.prototype.constructor = ImageSequencing.LinkedList;



})(H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
