(function (ImageSequencing, Timer) {


  ImageSequencing.Timer = function (element) {

    var self = this;

    Timer.call(self, 100);

    var naturalState = element.innerText;


    var update = function () {
      var time = self.getTime();

      var minutes = Timer.extractTimeElement(time, 'minutes');
      var seconds = Timer.extractTimeElement(time, 'seconds') % 60;
      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      element.innerText = minutes + ':' + seconds;
    };


    self.notify('every_tenth_second', update);
    self.on('reset', function () {
      element.innerText = naturalState;
      self.notify('every_tenth_second', update);
    });
  };

  // Inheritance
  ImageSequencing.Timer.prototype = Object.create(Timer.prototype);
  ImageSequencing.Timer.prototype.constructor = ImageSequencing.Timer;

})(H5P.ImageSequencing, H5P.Timer);
