(function(ImageSequencing, Timer) {

  /**
   * Adapter between image sequencing and H5P.Timer
   *
   * @class H5P.ImageSequencing.Timer
   * @extends H5P.Timer
   * @param {Element} element
   */
  ImageSequencing.Timer = function(element) {
    /** @alias H5P.ImageSequencing.Timer# */
    var self = this;
    // Initialize event inheritance
    Timer.call(self, 100);
    /** @private {string} */
    var naturalState = element.innerText;
    /**
     * Set up callback for time updates.
     * Formats time stamp for humans.
     *
     * @private
     */

    var update = function() {
      var time = self.getTime();

      var minutes = Timer.extractTimeElement(time, 'minutes');
      var seconds = Timer.extractTimeElement(time, 'seconds') % 60;
      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      element.innerText = minutes + ':' + seconds;
    };

    // Setup default behavior
    self.notify('every_tenth_second', update);
    self.on('reset', function() {
      element.innerText = naturalState;
      self.notify('every_tenth_second', update);
    });
  };

  // Inheritance
  ImageSequencing.Timer.prototype = Object.create(Timer.prototype);
  ImageSequencing.Timer.prototype.constructor = ImageSequencing.Timer;

})(H5P.ImageSequencing, H5P.Timer);
