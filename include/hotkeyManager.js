//================================================================================================
// HotKeyManager
//================================================================================================
function HotKeyManager() {
  //private properties
  //this.__hotKey = 16; //120; //TODO replace with other hotkey (current key: F9)
  this.__controls = [];
  this.__activeControl = -1;
  this.__state = 0; //no active control
  //1 - all controls display their main (level 0) hotkeys
  //2 - there is an active control. all keys will be sent to that control1

  //public methods
  this.registerDocument = HotKeyManager_registerDocument;
  this.unregisterDocument = HotKeyManager_unregisterDocument;
  this.activateAccels = HotKeyManager_activateAccels;
  this.activateControl = HotKeyManager_activateControl;
  this.deactivateAccels = HotKeyManager_deactivateAccels;
  this.addControl = HotKeyManager_addControl;
  this.removeControl = HotKeyManager_removeControl;
  this.attachAccel = HotKeyManager_attachAccel;
  this.isHotKey = HotKeyManager_isHotKey;

  //private methods
  this.handleKeyDown = HotKeyManager_handleKeyDown;
  this.broadcast = HotKeyManager_broadcast;
  this.send = HotKeyManager_send;
}

//================================================================================================
// PUBLIC METHODS
//================================================================================================
function HotKeyManager_registerDocument(_doc) {
  if (_doc.attachEvent("onkeydown", document_handleKeyDown)) {
    _doc.hotkeyManager = this;
  }
}

function HotKeyManager_unregisterDocument(_doc) {
  if (_doc.hotkeyManager != null) {
    _doc.hotkeyManager = null;
    _doc.detachEvent("onkeydown", document_handleKeyDown);
  }
}

function HotKeyManager_activateAccels() {}
function HotKeyManager_activateControl(_control) {}
function HotKeyManager_deactivateAccels() {
  this.__state = 0;
}

function HotKeyManager_addControl(_control) {
  this.__controls[this.__controls.length] = _control;
}

function HotKeyManager_removeControl(_control) {
  var i;
  for (i = 0; i < this.__controls.length; i++) {
    if (this.__controls[i] == _control) {
      this.__controls.splice(i, 1);
      return;
    }
  }
}

function HotKeyManager_attachAccel(_node) {
  try {
    var accelObj = new Object();
    var useShift = false;
    var letter = _node.selectSingleNode("accel").text;
    if (letter.indexOf("+") == 0) {
      letter = letter.substring(1);
      useShift = true;
    }
    accelObj.letter = letter;
    accelObj.useShift = useShift;
    accelObj.fn = _node.selectSingleNode("src").text;
    return accelObj;
  } catch (exception) {
    reportError(exception);
  }
  return null;
}

function HotKeyManager_isHotKey(_event) {
  // if ((_event.keyCode == 16) && (_event.ctrlKey))
  if (_event.keyCode == 46) return true;
  else return false;
}

//================================================================================================
// PRIVATE METHODS
//================================================================================================
function document_handleKeyDown() {
  try {
    var evt = getEvent();
    var doc = evt.srcElement.document;
    var self = doc.hotkeyManager;
    self.handleKeyDown(evt);
  } catch (e) {}
}

function HotKeyManager_handleKeyDown(_event) {
  var key = _event.keyCode;

  switch (this.__state) {
    case 0: //no active control
      var isHotKey = this.isHotKey(_event);
      if (isHotKey || _event.ctrlKey) {
        this.broadcast(_event);

        if (isHotKey) this.__state = 1;
      }
      break;

    case 1: //all controls are active
      this.broadcast(_event);
      break;

    case 2: //single control is active
      break;
  }
}

function HotKeyManager_broadcast(_event) {
  var i;
  for (i = 0; i < this.__controls.length; i++) {
    this.send(i, _event);
  }
}

function HotKeyManager_send(_ctrlIndex, _event) {
  this.__controls[_ctrlIndex].handleAccel(_event);
}
