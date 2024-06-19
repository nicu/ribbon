function UndoProvider() {
    this.__undoStack = [];
    this.__redoStack = [];
    this.__inProgress = false;
    this.canUndo = false;
    this.canRedo = false;
    
    this.Undo = UndoProvider_Undo;
    this.Redo = UndoProvider_Redo;
    this.StoreAction = UndoProvider_StoreAction;
    
    this.clearStack = UndoProvider_clearStack;
    this.updateState = UndoProvider_updateState;
    
    this.onCanUndoChanged = null;
    this.onCanRedoChanged = null;
}

function UndoProvider_Undo() { 
    if (this.canUndo) {
        this.__inProgress = true;
        
        var action = this.__undoStack.pop();
        action.Undo();
        this.__redoStack[this.__redoStack.length] = action;

        this.__inProgress = false;
        
        this.updateState();
    }
}

function UndoProvider_Redo() {
    if (this.canRedo) {
        this.__inProgress = true;
        
        var action = this.__redoStack.pop();
        action.Redo();
        this.__undoStack[this.__undoStack.length] = action;
        
        this.__inProgress = false;
        
        this.updateState();
    }
}

function UndoProvider_clearStack(_stack) {
    //try to avoid memory leaks
    var i;
    for (i = 0; i < _stack.length; i++) {
        try {
            _stack[i].destroy();
            _stack[i] = null;
        }
        catch (e) {
        }
    }
    
    _stack.length = 0;
}

function UndoProvider_StoreAction(_action) { 
    if (!this.__inProgress) {
        if (_action.Execute()) {
            this.__undoStack[this.__undoStack.length] = _action;
            this.clearStack(this.__redoStack);
            this.updateState();
        }
    }
}

function UndoProvider_updateState() {
    this.canUndo = this.__undoStack.length > 0;
    this.canRedo = this.__redoStack.length > 0;

    if (typeof this.onCanUndoChanged == 'function') {
        this.onCanUndoChanged(this.canUndo);
    }
    
    if (typeof this.onCanRedoChanged == 'function') {
        this.onCanRedoChanged(this.canRedo);
    }
}