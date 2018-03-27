var H5PPresave = H5PPresave || {};

H5PPresave['H5P.ImageSequencing'] = function (content, finished) {
  var presave = H5PEditor.Presave;

  if (isContentInValid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid ImageSequencing Error')
  }

  var score = content.sequenceImages.length;

  presave.validateScore(score);

  if (finished) {
    finished({maxScore: score});
  }

  function isContentInValid() {
    return !presave.checkNestedRequirements(content, 'content.sequenceImages') || !Array.isArray(content.sequenceImages);
  }
};
