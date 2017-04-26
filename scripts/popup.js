(function (ImageSequencing, $) {


  ImageSequencing.Popup = function ($container) {
    var self = this;

    var closed;

    var $popup = $('<div class="h5p-memory-pop"><div class="h5p-memory-image"></div><div class="h5p-memory-desc"></div></div>').appendTo($container);
    var $desc = $popup.find('.h5p-memory-desc');
    var $image = $popup.find('.h5p-memory-image');


    self.show = function (desc, $img, done) {
      $desc.html(desc);
      $img.appendTo($image.html(''));
      $popup.show();
      closed = done;
    };


    self.close = function () {
      if (closed !== undefined) {
        $popup.hide();
        closed();
        closed = undefined;
      }
    };


    self.setSize = function (fontSize) {
      // Set image size
      $image[0].style.fontSize = fontSize + 'px';

      // Determine card size
      var cardSize = fontSize * 6.25; // From CSS

      // Set popup size
      $popup[0].style.minWidth = (cardSize * 2) + 'px';
      $popup[0].style.minHeight = cardSize + 'px';
      $desc[0].style.marginLeft = (cardSize + 20) + 'px';
    };
  };

})(H5P.ImageSequencing, H5P.jQuery);
