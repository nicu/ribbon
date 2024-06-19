//===============================================================================================
// OBJECT EDITOR GLOBALS
//===============================================================================================
var objEditor = {
    selection: new ObjEditorSelection(),
    undoProvider: new UndoProvider(),
    styleID: 'objEditor',
    mouseDown: false,
    mouseX: 0,
    mouseY: 0,
    handleSize: 6,
    doc: null,
    window: null,
    resizer: null,
    minWidth: 4,
    minHeight: 4,
    moveElement: objEditor_moveElement,
    resizeElement: objEditor_resizeElement,
    alignRight: objEditor_alignRight,
    alignBottom: objEditor_alignBottom,
    distributeHorizontally: objEditor_distributeHorizontally,
    distributeVertically: objEditor_distributeVertically,
    getDocumentText: objEditor_getDocumentText,
    setInputID: objEditor_setInputID,
    getInputID: objEditor_getInputID,
    setInputFormula: objEditor_setInputFormula,
    getInputFormula: objEditor_getInputFormula,
    cloneInput: objEditor_cloneInput,
    selectAll: objEditor_selectAll,
    setIFrame: objEditor_setIFrame,
    findInput:objEditor_findInput
}

function buildArray(_inputs){
var newArray=new Array();
      for (var i = 1; i < _inputs.length; i++) { 
     newArray[i]=_inputs[i].id;
      }
 return newArray;
}

function objEditor_findInput(){
  objEditor.selection.clear();
  var value = document.getElementById('inputFindID').value;
  var inputs = docUtils.getInputs(this.doc, true);
  var newArray=buildArray(inputs)
  for (i=1;i<newArray.length;i++) {
      if (newArray[i].indexOf(value) != -1) {
        objEditor.selection.add(inputs[i], true);
        objEditor.selection.assignResizer(inputs[i]);    
      }
  }
 }

function objEditor_selectAll() {
    objEditor.selection.clear();
    var inputs = docUtils.getInputs(objEditor.doc, false);
    var extensions = docUtils.getExtensions(objEditor.doc);
    
    var i;
    for (i = 0; i < inputs.length; i++) {
        objEditor.selection.add(inputs[i], true);
    }
    
    for (i = 0; i < extensions.length; i++) {
        objEditor.selection.add(extensions[i], true);
    }
    
    if (inputs.length > 0) {
        objEditor.selection.assignResizer(inputs[0]);
    }
}

function objEditor_cloneInput() {
    if (this.resizer == null) return;
    if (this.resizer.elem == null) return;

    var elem = this.resizer.elem;
    this.selection.clear();    
    var node = elem.cloneNode(true);
    node.style.left = (elem.offsetLeft + 5) + 'px';
    node.style.top = (elem.offsetTop + 5) + 'px';
    node.onmousedown = elem.onmousedown;
    node.onmouseup = elem.onmouseup;
    node.onmousemove = elem.onmousemove;

    elem.parentElement.appendChild(node);
    this.selection.add(node);
}

function objEditor_alignRight() {
    var i;
    for (i = 0; i < this.selection.items.length; i++) {
        if (this.selection.items[i].elem != this.resizer.elem) {
            var right = this.resizer.elem.offsetLeft + this.resizer.elem.offsetWidth;
            
            this.moveElement(this.selection.items[i].elem, right - this.selection.items[i].elem.offsetWidth, this.selection.items[i].elem.offsetTop);
        }
    }
}

function objEditor_alignBottom() {
    var i;
    for (i = 0; i < this.selection.items.length; i++) {
        if (this.selection.items[i].elem != this.resizer.elem) {
            var bottom = this.resizer.elem.offsetTop + this.resizer.elem.offsetHeight;
            
            this.moveElement(this.selection.items[i].elem, this.selection.items[i].elem.offsetLeft, bottom - this.selection.items[i].elem.offsetHeight);
        }
    }
}

function objEditor_getDocumentText() {
    //remove all the elements/tags/styles added to the document by the object editor
    this.selection.clear(); //deselect elements to remove the handles and the "selected" class name
    
    //temporary remove our style from the header
    var style = this.doc.getElementById(this.styleID);
    var head = style.parentElement;
    head.removeChild(style);
    
    this.doc.onkeydown = null;
    //this.doc.detachEvent('onmousedown', Ribbon_handleClick);
    
    //remove elements class name 'input'
    var i;
    var inputs = docUtils.getInputs(this.doc, true);
    for (i = 0; i < inputs.length; i++) {
        inputs[i].className = inputs[i].className.replace(/\s?input/, '');
        inputs[i].onmousedown = null;
        inputs[i].onmouseup = null;
        inputs[i].onmousemove = null;
    }
    
    var htmlText = '';
    for (i = 0; i < this.doc.childNodes.length; i++) {
        switch (this.doc.childNodes[i].tagName) {
            case '!':
                htmlText += this.doc.childNodes[i].text;
                break;
            default:
                htmlText += this.doc.childNodes[i].outerHTML;
                break;
        }
        
    } 
    
    //re-assign class names
    for (i = 0; i < inputs.length; i++) {
         if (inputs[i].className != '')
            inputs[i].className += ' input';
        else
            inputs[i].className = 'input';
            
        inputs[i].onmousedown = function() { inputMouseDown(this); };
        inputs[i].onmouseup = function() { inputMouseUp(this); };
        inputs[i].onmousemove = function() { inputMouseMove(this); };
    }
    
    //re-attach the style
    head.appendChild(style);
    
    //re-assign onkeydown
    this.doc.onkeydown = documentKeyDown;
    //this.doc.attachEvent('onmousedown', Ribbon_handleClick);
     
    return htmlText;       
}


function objEditor_distributeHorizontally() {
}

function objEditor_distributeVertically() {
    try {
        var i;
        /*var topElem = objEditor.selection.items[0];
        var bottomElem = objEditor.selection.items[0];
        
        //find top and bottom elements
        for (i = 1; i < objEditor.selection.items.length; i++) {
            if (objEditor.selection.items[i].elem.offsetTop < topElem.elem.offsetTop)
                topElem = objEditor.selection.items[i];
                
            if (objEditor.selection.items[i].elem.offsetTop > bottomElem.elem.offsetTop)
                bottomElem = objEditor.selection.items[i];
        }
        
        //distribute space
        var topY = topElem.elem.offsetTop + topElem.elem.offsetHeight / 2;
        var bottomY = bottomElem.elem.offsetTop + bottomElem.elem.offsetHeight / 2;
        var totalY = bottomY - topY;
        var spacePerItem = totalY / (objEditor.selection.items.length - 2);
        if (spacePerItem < 0) spacePerItem = 0;*/
        
        for (i = 0; i < objEditor.selection.items.length; i++) {
            
        }
        
        objEditor.resizer.updateHandlePos();
    }
    catch (e) {}
}


function objEditor_setIFrame(_iframe) {
    this.window = _iframe.contentWindow;
    this.doc = this.window.document;
    
    //this.doc.attachEvent('onmousedown', Ribbon_handleClick);

    //move the styles in the HEAD section
    docUtils.moveStylesToHead(iDoc);

    //create a custom style and insert it into the document
    var heads = this.doc.getElementsByTagName("HEAD");
    var head = heads[0];
    
    var style = this.doc.createElement("STYLE");
    style.type = "text/css";
    var txt = '.input {';
        txt += '    filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=50)"; ';
        txt += '    background-color: green;';
        txt += '    position: absolute;';
        txt += '    border: none;';
        txt += '    cursor: move;';
        txt += '}';
        txt += '.selected {';
        txt += '    background-color: navy;';
        txt += '}'; 
        txt += '.handle {';
        txt += '    position: absolute;';
        txt += '    width: ' + objEditor.handleSize + 'px;';
        txt += '    height: ' + objEditor.handleSize + 'px;';
        txt += '    line-height: ' + objEditor.handleSize + 'px;';
        txt += '    font-size: 1px; ';
        txt += '    background-color: red;';
        txt += '}';
    style.styleSheet.cssText = txt;
    style.id = this.styleID;
    head.appendChild(style);
        
    this.doc.onmousedown = documentMouseDown;
    this.doc.onkeydown = documentKeyDown;
    
    heads = null;
    head = null;
    style = null;
}

function objEditor_moveElement(_elem, _left, _top) {
    _elem.style.left = _left + 'px';
    _elem.style.top = _top + 'px';
}

function objEditor_resizeElement(_elem, _width, _height) {
    _elem.style.width = _width + 'px';
    _elem.style.height = _height + 'px';
}

//===============================================================================================
// SELECTION ITEM
//===============================================================================================
function ObjEditorItem(_elem) {
    //properties
    this.elem = _elem; //reference to the HTML element it represents
    this.x = 0;
    this.y = 0;
    
    this.select = ObjEditorItem_select;
    this.deselect = ObjEditorItem_deselect;
    this.move = ObjEditorItem_move;
    
    this.select();
}

function ObjEditorItem_select() {
    this.elem.className += ' selected';
}

function ObjEditorItem_deselect() {
    this.elem.className = this.elem.className.replace(/ selected/, '');
}

function ObjEditorItem_move(_dx, _dy) {
    this.elem.style.left = (this.x + _dx) + 'px';
    this.elem.style.top = (this.y + _dy) + 'px';
}


//===============================================================================================
// SELECTION
//===============================================================================================
function ObjEditorSelection() {
    //properties
    this.items = [];
    
    //methods
    this.add = ObjEditorSelection_add;
    this.remove = ObjEditorSelection_remove;
    this.removeAt = ObjEditorSelection_removeAt;
    this.find = ObjEditorSelection_find;
    this.clear = ObjEditorSelection_clear;
    this.move = ObjEditorSelection_move;
    this.initPos = ObjEditorSelection_initPos;
    this.assignResizer = ObjEditorSelection_assignResizer;
}

function objEditor_setInputID() {
    if (this.resizer == null) return;
    if (this.resizer.elem == null) return;
    
    var value = '';
    var inputID = document.getElementById('inputID');
    if (inputID != null)
        value = inputID.value;
    this.resizer.elem.id = value;
}

function objEditor_getInputID() {
    try {
        var value = '';
        if (this.resizer != null && this.resizer.elem != null)
            value = this.resizer.elem.id
        document.getElementById('inputID').value = value;
    }
    catch (e) { }
}

function objEditor_setInputFormula() {
    if (this.resizer == null) return;
    if (this.resizer.elem == null) return;
    
    var fmla = '';
    var formula = document.getElementById('formula');
    if (formula != null) {
        var fmlaAttr = objEditor.doc.createAttribute('x:fmla');
        fmlaAttr.value = formula.value;
    }
    this.resizer.elem.attributes.setNamedItem(fmlaAttr);
}

function objEditor_getInputFormula() {
    try {
        var value = '';
        if (this.resizer != null && this.resizer.elem != null) {
            var node = this.resizer.elem.attributes.getNamedItem('x:fmla');
            value = node.value;
        }
        document.getElementById('formula').value = value;
    }
    catch (e) { }
}

function ObjEditorSelection_assignResizer(_elem) {
    if (objEditor.resizer != null) {
        objEditor.resizer.destructor();
        objEditor.resizer = null;
    }
    objEditor.resizer = new ObjEditorResizer(_elem);
    objEditor.getInputID();
    objEditor.getInputFormula();
}


function ObjEditorSelection_add(_elem, _noResizer) {
    this.items[this.items.length] = new ObjEditorItem(_elem);
    if (_noResizer === true) return;
    this.assignResizer(_elem);
}

function ObjEditorSelection_remove(_elem) {
    var pos = this.find(_elem);
    
    if (pos > -1) {
        this.removeAt(pos);
    }
}

function ObjEditorSelection_removeAt(_index) {
    this.items[_index].deselect();
    this.items.splice(_index, 1);
    
    objEditor.getInputID();
    objEditor.getInputFormula();
}

function ObjEditorSelection_find(_elem) {
    var i;
    for (i = 0; i < this.items.length; i++) {
        if (this.items[i].elem == _elem) {
            return i;
        }
    }
    
    return -1;
}

function ObjEditorSelection_clear() {

    if (objEditor.resizer != null) {
        objEditor.resizer.destructor();
        objEditor.resizer = null;
    }

    var i;
    while (this.items.length > 0) {
        this.removeAt(0);
    }
}

function ObjEditorSelection_move(_dx, _dy) {
    var i;
    
    for (i = 0; i < this.items.length; i++) {
        this.items[i].move(_dx, _dy);
    }
    
    if (objEditor.resizer != null) {
        objEditor.resizer.updateHandlePos();
    }
}

function ObjEditorSelection_initPos() {
    var i;
    for (i = 0; i < this.items.length; i++) {
        this.items[i].x = this.items[i].elem.offsetLeft;
        this.items[i].y = this.items[i].elem.offsetTop;
    }
}



//===============================================================================================
// RESIZING
//===============================================================================================
function ObjEditorResizer(_elem) {
    //properties
    this.elem = _elem;
    this.nDiv = null;
    this.sDiv = null;
    this.vDiv = null;
    this.eDiv = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.elemWidth = 0;
    this.elemHeight = 0;
    
    //methods
    this.buildInterface = ObjEditorResizer_buildInterface;
    this.destructor = ObjEditorResizer_destructor;
    this.updateHandlePos = ObjEditorResizer_updateHandlePos;
    this.onmousedown = ObjEditorResizer_onmousedown;
    this.onmouseup = ObjEditorResizer_onmouseup;
    this.onmousemove = ObjEditorResizer_onmousemove;
    this.resize = ObjEditorResizer_resize;
    
    //init
    this.buildInterface();
}

function ObjEditorResizer_resize(_dx, _dy) {
    var newWidth = this.elem.offsetWidth + _dx;
    if (newWidth < objEditor.minWidth)
        newWidth = objEditor.minWidth;
    this.elem.style.width = newWidth + 'px';
    
    var newHeight = this.elem.offsetHeight + _dy;
    if (newHeight < objEditor.minHeight)
        newHeight = objEditor.minHeight;
    this.elem.style.height = newHeight + 'px';
    
    this.updateHandlePos();
}

function ObjEditorResizer_buildInterface() {
    var self = this;
    
    this.nDiv = objEditor.doc.createElement('DIV');
    this.nDiv.className = 'handle';
    this.nDiv.style.cursor = 'n-resize';
    this.nDiv.innerHTML = '&nbsp';
    this.sDiv = objEditor.doc.createElement('DIV');
    this.sDiv.className = 'handle';
    this.sDiv.style.cursor = 's-resize';
    this.sDiv.innerHTML = '&nbsp';
    this.vDiv = objEditor.doc.createElement('DIV');
    this.vDiv.className = 'handle';
    this.vDiv.style.cursor = 'w-resize';
    this.vDiv.innerHTML = '&nbsp';
    this.eDiv = objEditor.doc.createElement('DIV');
    this.eDiv.className = 'handle';
    this.eDiv.style.cursor = 'e-resize';
    this.eDiv.innerHTML = '&nbsp';
    
    this.updateHandlePos();
     
    this.elem.parentElement.appendChild(this.nDiv);
    this.elem.parentElement.appendChild(this.sDiv);
    this.elem.parentElement.appendChild(this.vDiv);
    this.elem.parentElement.appendChild(this.eDiv);
    
    this.eDiv.onmousedown = function() { self.onmousedown(this); }
    this.eDiv.onmouseup = function() { self.onmouseup(this); }
    this.eDiv.onmousemove = function() { self.onmousemove(this, "east"); }
    
    this.sDiv.onmousedown = function() { self.onmousedown(this); }
    this.sDiv.onmouseup = function() { self.onmouseup(this); }
    this.sDiv.onmousemove = function() { self.onmousemove(this, "south"); }
}

function ObjEditorResizer_onmousedown(_sender) {
    this.mouseX = objEditor.window.event.clientX;
    this.mouseY = objEditor.window.event.clientY;
    this.elemWidth = this.elem.offsetWidth;
    this.elemHeight = this.elem.offsetHeight;
    this.mouseDown = true;
    _sender.setCapture(true);
}

function ObjEditorResizer_onmouseup(_sender) {
    this.mouseDown = false;
    _sender.releaseCapture();
}

function ObjEditorResizer_onmousemove(_sender, _direction) {
    if (this.mouseDown) {
        switch (_direction) {
            case "east":
                var newWidth = this.elemWidth + (objEditor.window.event.clientX - this.mouseX);
                if (newWidth < objEditor.minWidth)
                    newWidth = objEditor.minWidth;
                this.elem.style.width = newWidth + 'px';
            break;
            
            case "south":
                var newHeight = this.elemHeight + (objEditor.window.event.clientY - this.mouseY);
                if (newHeight < objEditor.minHeight)
                    newHeight = objEditor.minHeight;
                this.elem.style.height= newHeight + 'px';
            break;
        }
        this.updateHandlePos();
    }
}


function ObjEditorResizer_destructor() {
    this.nDiv.parentElement.removeChild(this.nDiv);
    this.sDiv.parentElement.removeChild(this.sDiv);
    this.vDiv.parentElement.removeChild(this.vDiv);
    this.eDiv.parentElement.removeChild(this.eDiv);
    
    this.nDiv = null;
    this.sDiv = null;
    this.vDiv = null;
    this.eDiv = null;
}

function ObjEditorResizer_updateHandlePos() {

    this.nDiv.style.left = (this.elem.offsetLeft + (this.elem.offsetWidth - objEditor.handleSize) / 2) + 'px';
    this.nDiv.style.top = (this.elem.offsetTop - objEditor.handleSize) + 'px';
    
    this.vDiv.style.left = (this.elem.offsetLeft - objEditor.handleSize) + 'px';
    this.vDiv.style.top = (this.elem.offsetTop + (this.elem.offsetHeight - objEditor.handleSize) / 2) + 'px';
    
    this.sDiv.style.left = (this.elem.offsetLeft + (this.elem.offsetWidth - objEditor.handleSize) / 2) + 'px';
    this.sDiv.style.top = (this.elem.offsetTop + this.elem.offsetHeight) + 'px';
    
    this.eDiv.style.left = (this.elem.offsetLeft + this.elem.offsetWidth) + 'px';
    this.eDiv.style.top = (this.elem.offsetTop + (this.elem.offsetHeight - objEditor.handleSize) / 2) + 'px';
}


//===============================================================================================
// GLOBAL FUNCTIONS
//===============================================================================================
function rectIntersects(x, y, width, height, tx, ty, tw, th) {
    return (x < tx + tw) && (y < ty + th) && (x + width > tx) && (y + height > ty);
}

function inputMouseDown(_elem) {
    objEditor.mouseDown = true;
    objEditor.mouseX = objEditor.window.event.clientX;
    objEditor.mouseY = objEditor.window.event.clientY;
    
    var pos = objEditor.selection.find(_elem);
    
    if (objEditor.window.event.ctrlKey) {
        if (pos == -1) {
            objEditor.selection.add(_elem);
            //objEditor.undoProvider.StoreAction(new SelectAction(_elem));
        }
        else {
            objEditor.selection.remove(_elem);
            //objEditor.undoProvider.StoreAction(new DeselectAction(_elem));
        }
    }
    else {
        if (objEditor.window.event.shiftKey) {
            if (objEditor.resizer != null) {
                    var elemTop = compute_element_Coordinates(_elem, true);
                    var elemBottom = new point(elemTop.x + _elem.offsetWidth, elemTop.y + _elem.offsetHeight);
                    var resizerTop = compute_element_Coordinates(objEditor.resizer.elem, true);
                    var resizerBottom = new point(resizerTop.x + objEditor.resizer.elem.offsetWidth, resizerTop.y + objEditor.resizer.elem.offsetHeight);
                
                    var topX = Math.min(elemTop.x, resizerTop.x);
                    var topY = Math.min(elemTop.y, resizerTop.y);
                    var bottomX = Math.max(elemBottom.x, resizerBottom.x);
                    var bottomY = Math.max(elemBottom.y, resizerBottom.y);
                    
                    objEditor.selection.clear();
                    var i;
                    var inputs = docUtils.getInputs(objEditor.doc, true);
                    for (i = 0; i < inputs.length; i++) {
                    
                        var inputTop = compute_element_Coordinates(inputs[i], true);
                        if (rectIntersects(inputTop.x, inputTop.y, inputs[i].offsetWidth, inputs[i].offsetHeight,
                                       topX, topY, (bottomX - topX), (bottomY - topY))) {
                            objEditor.selection.add(inputs[i]);
                        }
                    }
            }
        }
        else {
            if (pos == -1) {
                objEditor.selection.clear();
                objEditor.selection.add(_elem);
                //objEditor.undoProvider.StoreAction(new SelectAction(_elem));
            }
            else {
                objEditor.selection.assignResizer(_elem);
            }
        }
    }
    
    objEditor.selection.initPos();
}

function inputMouseUp(_elem) {
    //objEditor.selection.remove(_elem);
    objEditor.mouseDown = false;
}

function inputMouseMove(_elem) {
    if (objEditor.mouseDown) {
        if (objEditor.window.event.ctrlKey || objEditor.window.event.shiftKey) { 
            //don't move objects while trying to (de)select them
            return;
        }
        objEditor.selection.move(objEditor.window.event.clientX - objEditor.mouseX, objEditor.window.event.clientY - objEditor.mouseY);
    }
}

function documentMouseDown() {
    var event = objEditor.window.event;
    var elem = event.srcElement;

    if ((elem.tagName != 'INPUT') && (elem.tagName != 'SELECT')) {
        /*//check for selectable spans
        var parent = elem.parentElement;
        while (parent != null && parent.tagName != 'SPAN') {
            parent = parent.parentElement;
        }
        if (parent != null) {
            return;
        }*/
    
        if (!(elem.tagName == 'DIV' && elem.className == 'handle'))
            objEditor.selection.clear();
    }
}

function documentKeyDown() {
  
    if (objEditor.selection.items.count == 0) return;
    var event = objEditor.window.event;
    
    var dx = 0;
    var dy = 0;           
    var handled = false;
    
    switch (event.keyCode) {
        case 37: dx = -1; handled = true; break; //LEFT
        case 38: dy = -1; handled = true; break; //UP
        case 39: dx = 1; handled = true; break; //RIGHT
        case 40: dy = 1; handled = true; break; //DOWN
        case 13: break; //ENTER
    }

    if ( handled ) {
        if (event.shiftKey) {
            dx = dx * 10;
            dy = dy * 10;
        }
        
        if (event.ctrlKey) {
            //RESIZE
            objEditor.resizer.resize(dx, dy);
        }
        else {
            //MOVE
            objEditor.selection.initPos();
            objEditor.selection.move(dx, dy);
        }
    }
}