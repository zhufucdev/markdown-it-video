var path = require('path');
var generate = require('markdown-it-testgen');
var assert = require('assert');

describe('markdown-it-video', function requireMarkdownIt() {
  var md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true,
  }).use(require('../'));
  generate(path.join(__dirname, 'fixtures/video.txt'), md);

  it('should not render two on a single line', function() {
    assert.equal(md.render('@[vine](MhQ2lvg29Un) @[vine](MhQ2lvg29Un)'),
      '<p>@<a href="MhQ2lvg29Un">vine</a> <div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item vine-player" type="text/html" width="600" height="600" src="https://vine.co/v/MhQ2lvg29Un/embed/simple" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div></p>\n');
  });
  it('should not double two iframes with diffent ids after a single line break', function() {
    assert.equal(md.render('@[vine](MhQ2lvg29Un) \n @[vine](00000000000)'),
      '<p><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item vine-player" type="text/html" width="600" height="600" src="https://vine.co/v/MhQ2lvg29Un/embed/simple" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>\n <div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item vine-player" type="text/html" width="600" height="600" src="https://vine.co/v/00000000000/embed/simple" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div></p>\n');
  });
  it('should not double two iframes with diffent ids after a single double break', function() {
    assert.equal(md.render('@[vine](MhQ2lvg29Un) \n @[vine](00000000000)'),
      '<p><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item vine-player" type="text/html" width="600" height="600" src="https://vine.co/v/MhQ2lvg29Un/embed/simple" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>\n <div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item vine-player" type="text/html" width="600" height="600" src="https://vine.co/v/00000000000/embed/simple" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div></p>\n');
  });

});
