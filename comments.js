function ImageAnnotator (imageParent) {
  this.imageParent = imageParent;
  this.image = imageParent.getElementsByTagName ('img')[0];
  this.dummyImage = new Image ();
}; // ImageAnnotator;

ImageAnnotator.prototype.loadData = function (data) {
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    if (!item) continue;
    this.newItemNode (item);
  }
  this.image.onclick = function (e) {
    if (document.currentAnnotationEditor) {
      document.currentAnnotationEditor.close ();
      document.currentAnnotationEditor = null;
    } else {
      var ia = document.imageAnnotator;
      var x = (e ? e : window.event).clientX - this.offsetLeft;
      x /= ia.widthRatio;
      var y = (e ? e : window.event).clientY - this.offsetTop;
      y /= ia.widthRatio;
      ia.newItem (x, y);
    }
  };
  this.redraw ();
}; // loadData

ImageAnnotator.prototype.newItem = function (x, y) {
  var item = {text: "", x: x, y: y, color: 'white', fontSize: 20,
              key: (new Date ()) + Math.random ()};
  var div = this.newItemNode (item);
  this.redraw ();

  document.currentAnnotationEditor
      = new AnnotationEditor (div, this.imageParent);
}; // newItem

ImageAnnotator.prototype.newItemNode = function (item) {
  var div = document.createElement ('div');
  div.item = item;
  div.className = 'imageAnnotation';
  div.onclick = function () {
    if (document.currentAnnotationEditor) {
      document.currentAnnotationEditor.close ();
    }
    document.currentAnnotationEditor
      = new AnnotationEditor (this, document.imageAnnotator.imageParent);
  };
  this.imageParent.appendChild (div);
  return div;
}; // newItemNode

ImageAnnotator.prototype.clearData = function () {
  var nodes = this.imageParent.childNodes;
  var nodesLength = nodes.length;
  for (var i = nodesLength - 1; i >= 0; i--) {
    var node = nodes[i];
    if (node.item) {
      this.imageParent.removeChild (node);
    }
  }
};  // clearData

ImageAnnotator.prototype.updateItem = function (item) {
  // TODO: server
}; // updateItem

ImageAnnotator.prototype.redraw = function () {
  this.widthRatio = this.image.offsetWidth
      / ((this.image.naturalWidth ? this.image.naturalWidth :
          this.dummyImage.width) || 1);
  var nodes = this.imageParent.childNodes;
  var nodesLength = nodes.length;
  for (var i = 0; i < nodesLength; i++) {
    var node = nodes[i];
    if (node.item) {
      node.innerText = node.item.text;
      node.textContent = node.item.text;
      node.style.left = (this.image.offsetLeft + node.item.x * this.widthRatio) + 'px';
      node.style.top = (this.image.offsetTop + node.item.y * this.widthRatio) + 'px';
      node.style.color = node.item.color;
      node.style.fontSize = node.item.fontSize * this.widthRatio + 'px';
    }
  }
}; // redraw

function AnnotationEditor (itemNode, container) {
  this.itemNode = itemNode;
  this.item = itemNode.item;
  this.image = container.getElementsByTagName ('img')[0];
  var thisobj = this;

  var node = document.createElement ('div');
  this.element = node;
  node.className = 'annotationEditor';
  node.style.left = itemNode.style.left;
  node.style.top = itemNode.style.top;
  var p = document.createElement ('p');
  var label = document.createElement ('label');
  var input = document.createElement ('input');
  input.className = 'text';
  input.type = 'text';
  input.value = this.item.text;
  input.onchange = function () {
    thisobj.item.text = this.value;
    thisobj.onchange ();
  };
  input.oninput = input.onchange;
  input.style.color = itemNode.style.color;
  input.style.fontSize = itemNode.style.fontSize;
  label.appendChild (input);
  p.appendChild (label);
  node.appendChild (p);

  var colorList = document.createElement ('p');
  colorList.className = 'colorList';
  var colors = ['black', 'gray', 'silver', 'white', 'maroon', 'red',
  'purple', 'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy',
  'blue', 'teal', 'aqua', 'orange'];
  for (var i = 0; i < colors.length; i++) {
    var button = document.createElement ('input');
    var color = colors[i];
    button.type = 'button';
    button.onclick = function () {
      input.style.color = this.style.backgroundColor;
      thisobj.item.color = input.style.color;
      thisobj.onchange ();
    };
    button.style.backgroundColor = color;
    button.value = '  ';
    colorList.appendChild (button);
  }
  node.appendChild (colorList);

  var sizeList = document.createElement ('p');
  sizeList.className = 'sizeList';
  var sizes = [12, 16, 20, 36];
  for (var i = 0; i < sizes.length; i++) {
    var button = document.createElement ('input');
    var size = sizes[i];
    button.type = 'button';
    button.onclick = function () {
      input.style.fontSize = this.style.fontSize;
      thisobj.item.fontSize = this.sizeValue;
      thisobj.onchange ();
    };
    button.style.fontSize = size * document.imageAnnotator.widthRatio
        + 'px';
    button.sizeValue = size;
    button.value = 'A';
    sizeList.appendChild (button);
  }
  node.appendChild (sizeList);

  container.appendChild (node);
  itemNode.style.display = 'none';
  input.focus ();
} // AnnotationEditor

AnnotationEditor.prototype.onchange = function () {
  document.imageAnnotator.updateItem (this.item);
  document.imageAnnotator.redraw ();
}; // onchange

AnnotationEditor.prototype.close = function () {
  this.element.parentNode.removeChild (this.element);
  if (this.item.text == "") {
    this.itemNode.parentNode.removeChild (this.itemNode);
  } else {
    this.itemNode.style.display = 'block';
  }
}; // close