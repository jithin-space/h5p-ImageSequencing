var H5PUpgrades = H5PUpgrades || {};
H5PUpgrades['H5P.ImageSequencing'] = (function ($) {
  return {
    1: {
      1: function (parameters, finished) {
        // Wrap summaries to allow tip.
          if(!parameters.behaviour){
            parameters.behaviour= {
              enableSolutionsButton:true,
              enableRetry:true,
              enableResume:true
          }
        }
        if(parameters.l10n){
          parameters.l10n.showSolution="Show Solution";
          parameters.l10n.resume="Resume";
          parameters.l10n.audioNotSupported="Audio Not Supported";
        }
        finished(null, parameters);
      }
    }
  };
})(H5P.jQuery);
