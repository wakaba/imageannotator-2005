#!/usr/bin/perl
use strict;

my $pattern = qr/\.(?:png|jpe?g|gif)$/i;
my $title = htescape (q[Album]);

opendir my $dir, '.' or die "$0: .: $!";
my @files = sort {$a cmp $b} grep { /$pattern/ } readdir $dir;
closedir $dir;

my $r = qq[<!DOCTYPE html>
<html lang="ja">
<head>
<title>$title</title>
<style type="text/css">
  ul {
    position: absolute;
    right: 0;
    width: 10em;
    bottom: 0;
    top: 0;
    overflow: auto;
    margin: 0;
    padding: 0;
  }
  li {
    margin-left: 0;
    padding-left: 0;
    list-style-type: none;
  }
  a img {
    width: 8em;
    height: 5em;
  }
  #preview {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 10em;
    text-align: center;
  }
  #preview img {
    width: 80%;
    height: 80%;
  }
  button {
    font-weight: bolder;
    width: 2em;
    height: 2em;
  }
</style>
<script type="text/javascript">
window.onload = function () {
  var preview = document.getElementById ('preview');
  preview.style.display = 'block';
  var previewImage = document.getElementById ('previewImage');
  var images = document.images;
  var imagesLength = images.length - 1;
  for (var i = 0; i < imagesLength; i++) {
    var image = images[i];
    image.parentNode.onclick = (function (i) { return function () {
      showImage (i);
      return false;
    } }) (i); // onclick
  }
  document.getElementById ('allNumber').firstChild.data = imagesLength;
  showImage (0);
}; // onload

function showImage (i) {
  var imagesLength = document.images.length - 1;
  i = (i + imagesLength) % imagesLength;
  document.currentImageIndex = i;
  document.getElementById ('previewImage').src = document.images[i].parentNode.href;
  document.getElementById ('currentNumber').firstChild.data = i + 1;
} // showImage

function prevImage () {
  showImage (document.currentImageIndex - 1);
} // prevImage

function nextImage () {
  showImage (document.currentImageIndex + 1);
} // nextImage

function thisImage () {
  location.href = document.getElementById ('previewImage').src;
} // thisImage
</script>
</head>
<body>
<ul>
];

system 'mkdir', 'small';
for my $file_name (@files) {
  my $small_file_name = 'small/' . $file_name;
  system 'convert', '-geometry', '10%', $file_name => $small_file_name
      unless -f $small_file_name;
  my $file_name_e = htescape ($file_name);
  my $small_file_name_e = htescape ($small_file_name);
  $r .= qq[<li><a href="$file_name_e"><img src="$small_file_name_e"></a></li>];
}

$r .= q[</ul>
<div id="preview" style="display: none">
<img id="previewImage">
<div class="controler">
<button type="button" onclick="prevImage ()" accesskey="p">&lt;</button>
<button type="button" onclick="thisImage ()">@</button>
<button type="button" onclick="nextImage ()" accesskey="n">&gt;</button>
</div>
<div class="info">
<span id="currentNumber">0</span> / <span id="allNumber">0</span>
</div>
</div>
</body>
</html>
];

print $r;

sub htescape ($) {
  my $s = shift;
  $s =~ s/&/&amp;/g;
  $s =~ s/</&lt;/g;
  $s =~ s/>/&gt;/g;
  $s =~ s/"/&quot;/g;
  return $s;
} # htescape
