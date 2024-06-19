/// <reference path="objeditor.js" />

//=================================================================================================================
// SELECT
//=================================================================================================================
function SelectAction(_object) {
    this.Object = _object;
   
    this.Execute = SelectAction_execute;
    this.Undo = SelectAction_undo;
    this.Redo = SelectAction_redo;
    this.destroy = SelectAction_destroy;
    
    this.getState = SelectAction_getState;
    this.setState = SelectAction_setState;
    
    this.initialState = [];
    this.state = [];
    this.initialState = this.getState();
}

function SelectAction_execute() {
    objEditor.selection.add(this.Object);
    this.state = this.getState();
    
    return true;
}

function SelectAction_undo() {
    //this.setState(this.initialState);
    objEditor.selection.remove(this.Object);
}

function SelectAction_redo() {
    //this.setState(this.state);    
    objEditor.selection.add(this.Object);
}

function SelectAction_destroy() {
    this.Object = null;
    this.initialState = null;
    this.state = null;
}

function SelectAction_getState() {
    var i;
    var result = [];
    
    for (i = 0; i < objEditor.selection.items.length; i++) {
        result[result.length] = objEditor.selection.items[i];
    }
    
    return result;
}

function SelectAction_setState(_state) {
    var i;
    objEditor.selection.items = [];
    
    for (i = 0; i < _state.length; i++) {
        objEditor.selection.items[i] = _state[i];
    }
}

//=================================================================================================================
// DESELECT
//=================================================================================================================
function DeselectAction(_object) {
    this.Object = _object;
   
    this.Execute = DeselectAction_execute;
    this.Undo = DeselectAction_undo;
    this.Redo = DeselectAction_redo;
    this.destroy = DeselectAction_destroy;
    
    this.getState = DeselectAction_getState;
    this.setState = DeselectAction_setState;
    
    this.initialState = new Array();
    this.state = new Array();
    this.getState(this.initialState);
}

function DeselectAction_execute() {
    objEditor.selection.remove(this.Object);
    this.getState(this.state);
    
    return true;
}

function DeselectAction_undo() {
    this.setState(this.initialState);
}

function DeselectAction_redo() {
    this.setState(this.state);    
}

function DeselectAction_destroy() {
    this.Object = null;
    this.initialState = null;
    this.state = null;
}

function DeselectAction_getState(_state) {
    var i;
    _state = new Array();
    
    for (i = 0; i < objEditor.selection.items.length; i++) {
        _state[_state.length] = objEditor.selection.items[i];
    }
}

function DeselectAction_setState(_state) {
    var i;
    objEditor.selection.items = new Array();
    
    for (i = 0; i < _state.length; i++) {
        objEditor.selection.items[i] = _state[i];
    }
}