(function (ImageSequencing) {


  ImageSequencing.Counter = function ($container) {
    var self = this;
    var current = 0;
    var update = function () {
      $container[0].innerText = current;
    };

    self.increment = function () {
      current++;
      update();
    };

    self.reset = function () {
      current = 0;
      update();
    };
  };

})(H5P.ImageSequencing);
