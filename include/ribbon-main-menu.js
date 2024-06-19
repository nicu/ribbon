function translate(_txt) {
  return _txt;
}

function RibbonMainMenu(_parent) {
  //public properties
  this.parent = _parent;
  this.ownerDocument = this.parent.ownerDocument;
  this.visible = false;
  this.defaultView = translate("Recent documents");
  this.recentDocs = null;

  //private properties
  this.html = new Object();
  this.html.mainDiv = null;
  this.html.leftCell = null;
  this.html.rightCell = null;
  this.html.viewDiv = null;
  this.html.selectedItem = null;
  this.html.selectedSubItem = null;
  this.activeView = null;
  this.views = new Array();
  this.popupMenu = null; //NC 2007-09-27

  //public methods
  this.show = RibbonMainMenu_show;
  this.hide = RibbonMainMenu_hide;
  this.addView = RibbonMainMenu_addView;
  this.showView = RibbonMainMenu_showView;
  this.hideView = RibbonMainMenu_hideView;
  this.selectHTMLItem = RibbonMainMenu_selectHTMLItem;
  this.deselectHTMLItem = RibbonMainMenu_deselectHTMLItem;
  this.selectHTMLSubItem = RibbonMainMenu_selectHTMLSubItem;
  this.deselectHTMLSubItem = RibbonMainMenu_deselectHTMLSubItem;
  this.setItems = RibbonMainMenu_setItems;

  //private methods
  this.buildInterface = RibbonMainMenu_buildInterface; //TO-DO rename this
  this.buildItems = RibbonMainMenu_buildItems; //TO-DO rename this
  this.itemToHTML = RibbonMainMenu_itemToHTML;
  //this.assignItemEvents = RibbonMainMenu_assignItemEvents;
  //this.assignSubItemEvents = RibbonMainMenu_assignSubItemEvents;
  this.clearHTML = RibbonMainMenu_clearHTML;
  this.updateViewsHeight = RibbonMainMenu_updateViewsHeight;

  //public events
  this.onMouseEnter = RibbonMainMenu_onMouseEnter;
  this.onMouseLeave = RibbonMainMenu_onMouseLeave;
  this.onLoadData = null; //NC 2007-10-20

  //private events
  this.onHTMLItemSelected = RibbonMainMenu_onHTMLItemSelected;
  this.onHTMLItemDeselected = RibbonMainMenu_onHTMLItemDeselected;
  this.onHTMLSubItemSelected = RibbonMainMenu_onHTMLSubItemSelected;
  this.onHTMLSubItemDeselected = RibbonMainMenu_onHTMLSubItemDeselected;
  this.handleMouseOver = RibbonMainMenu_handleMouseOver;
  this.handleMouseOut = RibbonMainMenu_handleMouseOut;
  this.handleOnClick = RibbonMainMenu_handleOnClick;

  /********************/
  this.buildInterface();
  this.recentDocs = new RibbonMnuRecentDocs(this);

  var viewDefault = this.addView(this.defaultView, true);
  //tmpDefaultView.isDefaultView = true;

  //DEV +
  viewDefault.setContent(this.recentDocs.html.tblDoc);
  //DEV -
  /*******************/
}

//----------------------------------------------------------------------------------------------------------------------------
//PUBLIC METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMainMenu_show() {
  var self = this;
  //NC 2007-10-20
  //TODO handle errors (empty XML response)
  if (typeof this.onLoadData == "function") {
    var xml = this.onLoadData(self);
    this.setItems(xml);
  }
  this.parent.html.mainMenu.className = "mainMenu_down";
  this.html.mainDiv.style.display = "block";
  this.visible = true;
  this.showView(this.defaultView);

  this.html.mainDiv.setCapture(true);
  //this.html.mainDiv.tabIndex = 0;
  //this.html.mainDiv.focus();
}

function RibbonMainMenu_hide() {
  this.html.mainDiv.releaseCapture();

  this.parent.html.mainMenu.className = "mainMenu";
  if (this.html.selectedItem != null)
    this.deselectHTMLItem(this.html.selectedItem);
  if (this.popupMenu != null) {
    this.popupMenu.hide();
  }
  this.html.mainDiv.style.display = "none";
  this.visible = false;

  //var ifr = this.ownerDocument.getElementById('backgroundIframeID');
  //ifr.contentWindow.document.activeElement.focus();
}

function RibbonMainMenu_addView(_name, _default) {
  this.views[_name] = new RibbonMnuView(this, _name, _default);
  this.html.viewDiv.appendChild(this.views[_name].html.viewTable);
  return this.views[_name];
}

function RibbonMainMenu_showView(_viewName) {
  if (this.views[_viewName] == null) return;
  if (this.activeView == _viewName) return;

  this.hideView(this.activeView);
  this.views[_viewName].show();
  this.activeView = _viewName;
}

function RibbonMainMenu_hideView(_viewName) {
  if (this.views[_viewName] == null) return;
  this.views[_viewName].hide();
  this.activeView = null;
  if (this.popupMenu != null) {
    this.popupMenu.hide();
  }
}

function RibbonMainMenu_selectHTMLItem(_item) {
  if (this.html.selectedItem == _item) return false;
  if (this.html.selectedItem != null) {
    this.deselectHTMLItem(this.html.selectedItem);
  }

  if (_item.className == "disabled") {
    this.showView(this.defaultView);
    return false;
  }

  _item.className = "selected";
  this.html.selectedItem = _item;
  return true;
}

function RibbonMainMenu_deselectHTMLItem(_item) {
  if (_item.className == "disabled") return false;

  _item.className = "";

  //TO-DO check if the _item.item exists
  if (_item.item.isModule) {
    //must deselect the module and change the view to default
    if (this.html.selectedSubItem != null) {
      this.deselectHTMLSubItem(this.html.selectedSubItem);
    }
    this.hideView(_item.item.viewName);
  }
  this.html.selectedItem = null;
  return true;
}

function RibbonMainMenu_selectHTMLSubItem(_item) {
  if (this.html.selectedSubItem == _item) return false;
  if (this.html.selectedSubItem != null) {
    this.deselectHTMLSubItem(this.html.selectedSubItem);
  }

  if (_item.className == "disabled") {
    if (this.popupMenu != null) {
      this.popupMenu.hide();
    }
    return false;
  }

  _item.className = "selected";
  this.html.selectedSubItem = _item;
  return true;
}

function RibbonMainMenu_deselectHTMLSubItem(_item) {
  if (_item.className == "disabled") return false;
  _item.className = "";
  this.html.selectedSubItem = null;
  return true;
}

function RibbonMainMenu_setItems(_xmlData) {
  var profile = getProfile();
  var evalFn = null; //TO-DO - assign evalFn per menu or per item
  // var xml = new ActiveXObject('Microsoft.XMLDOM');
  // xml.async = false;
  // xml.loadXML(_xmlData);
  var parser = new DOMParser();
  var doc = parser.parseFromString(_xmlData, "text/xml");
  var items = modulesAndProcessToItems(doc.documentElement, profile, evalFn);
  this.buildItems(items);
  xml = null;
}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMainMenu_buildInterface() {
  var self = this;

  this.html.mainDiv = this.ownerDocument.createElement("DIV");
  this.html.mainDiv.id = "rbnMainMenu";
  this.html.mainDiv.style.width = "400px";
  //this is the element that will setCapture and handles all mouse events
  this.html.mainDiv.onmouseover = function () {
    self.handleMouseOver();
  };
  this.html.mainDiv.onmouseout = function () {
    self.handleMouseOut();
  };
  this.html.mainDiv.onclick = function () {
    self.handleOnClick();
  };

  //TOP margin
  var topDiv = this.ownerDocument.createElement("DIV");
  topDiv.id = "rbnMainMenu_top";
  topDiv.isMenuElem = true; //NC 2007-09-27
  this.html.mainDiv.appendChild(topDiv);

  var topLeftDiv = this.ownerDocument.createElement("DIV");
  topLeftDiv.isMenuElem = true; //NC 2007-09-27
  topLeftDiv.id = "rbnMainMenu_topLeft";
  topDiv.appendChild(topLeftDiv);

  var topRightDiv = this.ownerDocument.createElement("DIV");
  topRightDiv.isMenuElem = true; //NC 2007-09-27
  topRightDiv.id = "rbnMainMenu_topRight";
  topLeftDiv.appendChild(topRightDiv);

  //LEFT + RIGHT margin
  var leftDiv = this.ownerDocument.createElement("DIV");
  leftDiv.isMenuElem = true; //NC 2007-09-27
  leftDiv.id = "rbnMainMenu_contentLeft";
  this.html.mainDiv.appendChild(leftDiv);

  var rightDiv = this.ownerDocument.createElement("DIV");
  rightDiv.isMenuElem = true; //NC 2007-09-27
  rightDiv.id = "rbnMainMenu_contentRight";
  leftDiv.appendChild(rightDiv);

  //BOTTOM margin
  var bottomDiv = this.ownerDocument.createElement("DIV");
  bottomDiv.isMenuElem = true; //NC 2007-09-27
  bottomDiv.id = "rbnMainMenu_bottom";
  this.html.mainDiv.appendChild(bottomDiv);

  var bottomLeftDiv = this.ownerDocument.createElement("DIV");
  bottomLeftDiv.isMenuElem = true; //NC 2007-09-27
  bottomLeftDiv.id = "rbnMainMenu_bottomLeft";
  bottomDiv.appendChild(bottomLeftDiv);

  var bottomRightDiv = this.ownerDocument.createElement("DIV");
  bottomRightDiv.isMenuElem = true; //NC 2007-09-27
  bottomRightDiv.id = "rbnMainMenu_bottomRight";
  bottomLeftDiv.appendChild(bottomRightDiv);

  //CONTENT layout (2 columns)
  var contentTbl = this.ownerDocument.createElement("TABLE");
  contentTbl.isMenuElem = true; //NC 2007-09-27
  contentTbl.style.width = "100%";
  contentTbl.style.height = "100%";
  contentTbl.cellPadding = "0";
  contentTbl.cellSpacing = "0";
  var contentRow = contentTbl.insertRow(-1);
  contentRow.isMenuElem = true; //NC 2007-09-27

  this.html.leftCell = contentRow.insertCell(-1);
  this.html.leftCell.isMenuElem = true; //NC 2007-09-27
  this.html.leftCell.style.width = "35%";
  this.html.leftCell.style.verticalAlign = "top";
  this.html.leftCell.style.backgroundColor = "#FFFFFF";
  this.html.leftCell.style.borderRight = "1px solid #CACACA";

  this.html.rightCell = contentRow.insertCell(-1);
  this.html.rightCell.isMenuElem = true; //NC 2007-09-27
  this.html.rightCell.style.width = "65%";
  this.html.rightCell.style.verticalAlign = "top";
  this.html.rightCell.style.backgroundColor = "#E9EAEE";

  this.html.viewDiv = this.ownerDocument.createElement("DIV");
  this.html.viewDiv.isMenuElem = true; //NC 2007-09-27
  this.html.viewDiv.id = "rbnViews";
  this.html.viewDiv.style.overflowX = "hidden";
  this.html.viewDiv.style.overflowY = "hidden"; //TODO change back'auto';
  this.html.viewDiv.style.height = "100%";
  this.html.viewDiv.style.position = "relative";
  this.html.rightCell.appendChild(this.html.viewDiv);

  rightDiv.appendChild(contentTbl);

  //append the menu to the owner document
  this.ownerDocument.body.appendChild(this.html.mainDiv);
}

function RibbonMainMenu_itemToHTML(_table, _item, _level, _fullText) {
  _fullText = _fullText || false;
  var row = _table.insertRow(-1);
  row.isMenuElem = true; //NC 2007-09-27

  switch (_level) {
    case 1:
      row.itemType = "MENU_ITEM";
      break;

    case 2:
      row.itemType = "MENU_SUBITEM";
      break;
  }
  row.item = _item; //attaching the item to the HTML element
  if (_item.disabled) {
    //TO-DO - check for default actions
    row.className = "disabled";
    row.disabled = true;
  }

  //LEFT
  var leftCell = row.insertCell(-1);
  leftCell.isMenuElem = true; //NC 2007-09-27
  leftCell.handler = row;
  leftCell.className = "left";
  leftCell.innerHTML = "&nbsp;";

  //IMG
  var imgCell = row.insertCell(-1);
  imgCell.isMenuElem = true; //NC 2007-09-27
  imgCell.handler = row;
  imgCell.className = "img";
  var img = this.ownerDocument.createElement("IMG");
  img.isMenuElem = true; //NC 2007-09-27
  img.handler = row;
  img.width = 32;
  img.height = 32;
  img.src = "graphics/" + _item.icon + "_large.gif";
  imgCell.appendChild(img);

  //NC 2007-11-08
  //shortCut
  var shortCut = this.ownerDocument.createElement("DIV");
  shortCut.isMenuElem = true;
  shortCut.handler = row;
  shortCut.className = "shortcut";
  imgCell.appendChild(shortCut);

  //TEXT
  var txtCell = row.insertCell(-1);
  txtCell.isMenuElem = true; //NC 2007-09-27
  txtCell.handler = row;
  txtCell.className = "text";
  if (_fullText) {
    var strongElem = this.ownerDocument.createElement("STRONG");
    strongElem.isMenuElem = true; //NC 2007-09-27
    strongElem.handler = row;
    strongElem.innerHTML = _item.name;
    txtCell.appendChild(strongElem);

    var brElem = this.ownerDocument.createElement("BR");
    brElem.isMenuElem = true; //NC 2007-09-27
    brElem.handler = row;
    txtCell.appendChild(brElem);

    var helpElem = this.ownerDocument.createElement("TEXT");
    helpElem.isMenuElem = true; //NC 2007-09-27
    helpElem.handler = row;
    helpElem.innerHTML = _item.help;
    txtCell.appendChild(helpElem);

    //txtCell.innerHTML = '<strong>' + _item.name + '</strong><br/>' + _item.help;
  } else txtCell.innerHTML = _item.name;

  if (!_item.isModule) {
    txtCell.colSpan = "2";
  } else {
    var arrowCell = row.insertCell(-1);
    arrowCell.isMenuElem = true; //NC 2007-09-27
    arrowCell.handler = row;
    arrowCell.className = "arrow";
    var arrow = this.ownerDocument.createElement("DIV");
    arrow.isMenuElem = true; //NC 2007-09-27
    arrow.handler = row;
    arrow.className = "arrow";
    arrowCell.appendChild(arrow);
  }

  //RIGHT
  var rightCell = row.insertCell(-1);
  rightCell.isMenuElem = true; //NC 2007-09-27
  rightCell.handler = row;
  rightCell.className = "right";
  rightCell.innerHTML = "&nbsp;";

  return row;
}

function RibbonMainMenu_updateViewsHeight(_height) {
  var viewName;
  for (viewName in this.views) {
    this.views[viewName].setHeight(_height);
  }
}

function RibbonMainMenu_buildItems(_items) {
  //clearing existing items
  this.clearHTML();

  var table = this.ownerDocument.createElement("TABLE");
  table.isMenuElem = true; //NC 2007-09-27
  table.cellPadding = 0;
  table.cellSpacing = 0;
  table.className = "rbnMainMenu_items";
  table.style.width = "100%";
  table.style.height = "100%";
  this.html.leftCell.appendChild(table);

  var i;
  for (i = 0; i < _items.length; i++) {
    var htmlElem = this.itemToHTML(table, _items[i], 1);
    //this.assignItemEvents(htmlElem, _items[i]);

    if (_items[i].isModule) {
      var _item = _items[i];
      _item.viewName = _item.name;

      //create the module HTML
      var itmTable = this.ownerDocument.createElement("TABLE");
      itmTable.isMenuElem = true; //NC 2007-09-27
      itmTable.cellPadding = 0;
      itmTable.cellSpacing = 0;
      itmTable.className = "rbnMainMenu_items";
      itmTable.style.width = "100%";

      var view = this.addView(_item.viewName, false);
      view.setContent(itmTable);

      var j;
      for (j = 0; j < _item.length; j++) {
        var moduleHTML = this.itemToHTML(itmTable, _item[j], 2, true);
        //this.assignSubItemEvents(moduleHTML, _item[j]);
      }
    } else {
      _items[i].viewName = this.defaultView;
    }
  }

  this.html.viewDiv.style.height = 160 + _items.length * 44 + "px";
  this.updateViewsHeight(160 + _items.length * 44);
}

/*function RibbonMainMenu_assignItemEvents(_htmlElem, _item) {
    var self = this;

    _htmlElem.onmouseenter = function() {
        if (self.selectHTMLItem(_htmlElem)) {
            self.onHTMLItemSelected(_htmlElem);
        }
    }
    if (! _item.isModule) {
        //click events
        _htmlElem.onclick = function() { 
            try {
                _item.onclick(); 
            }
            catch (e) {}
            self.hide();
        }
        
        _htmlElem.onmouseleave = function() {
            if (self.deselectHTMLItem(_htmlElem)) {
                self.onHTMLItemDeselected(_htmlElem);
            }
        }
    }
}


function RibbonMainMenu_assignSubItemEvents(_htmlElem, _item) {
    var self = this;
    
    _htmlElem.onmouseenter = function() {
        if (self.selectHTMLSubItem(_htmlElem)) {
            //self.onHTMLItemSelected(_htmlElem);
           //SL 20070917 - uncomment
            if (_item.isModule) {
                var pos = compute_element_Coordinates(_htmlElem);
                new popUpMenu(this.ownerDocument, _item, pos.x, pos.y - _htmlElem.offsetHeight, function() { self.hide(); });
            }
            //SL 20070917 - end uncomment
        }
    }
//    if (_item.isModule == false) {
        _htmlElem.onmouseleave = function() {
            if (self.deselectHTMLSubItem(_htmlElem)) {
                //self.onHTMLItemDeselected(_htmlElem);
            }
        }
//    }

    _htmlElem.onclick = function() { 
            try {
                _item.onclick(); 
            }
            catch (e) {}
            self.hide();
        }
}*/

function RibbonMainMenu_clearHTML() {
  //TO-DO - call destructor for js objects attached

  var i;
  var nodes = this.html.leftCell.childNodes;
  for (i = 0; i < nodes.length; i++) {
    this.html.leftCell.removeChild(nodes[i]);
  }

  for (i in this.views) {
    if (!this.views[i].isDefault) {
      this.views[i].remove();
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------
//PUBLIC EVENTS
//----------------------------------------------------------------------------------------------------------------------------
//NC 2007-09-22
function RibbonMainMenu_onMouseEnter(_sender) {}

function RibbonMainMenu_onMouseLeave(_sender) {}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE EVENTS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMainMenu_onHTMLItemSelected(_htmlItem) {
  this.showView(_htmlItem.item.viewName);
}

function RibbonMainMenu_onHTMLItemDeselected(_htmlItem) {}

function RibbonMainMenu_onHTMLSubItemSelected(_htmlItem) {
  if (this.popupMenu != null) {
    this.popupMenu.hide();
  }
}

function RibbonMainMenu_onHTMLSubItemDeselected(_htmlItem) {}

function RibbonMainMenu_handleMouseOver() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  var element = null;
  if (_event.srcElement.isMenuElem) {
    //handling ribbon's main menu elements
    element = _event.srcElement.handler;
    if (element == null) return; //no element to handle. exit

    switch (element.itemType) {
      case "MENU_ITEM":
        if (this.selectHTMLItem(element)) {
          this.onHTMLItemSelected(element);
        }
        break;

      case "MENU_SUBITEM":
        if (this.selectHTMLSubItem(element)) {
          this.onHTMLSubItemSelected(element);
          if (element.item.isModule) {
            var pos = compute_element_Coordinates(element);
            this.popupMenu = new popUpMenu(
              this.ownerDocument,
              element.item,
              pos.x,
              pos.y - element.offsetHeight,
              null,
              null,
              null,
              true
            );
          }
        }
        break;

      case "MENU_RECENTDOC":
        if (_event.srcElement.semiHot) element.className = "semihot";
        else element.className = "hot";
        break;
    }
  } else {
    element = _event.srcElement.MenuRow;
    //TODO stop event if item is separator
    if (
      element == null ||
      element.className == "menuItemSeparator" ||
      element.item.disabled
    )
      return;
    menuItemOn();
  }
}

function RibbonMainMenu_handleMouseOut() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  var element = null;
  if (_event.srcElement.isMenuElem) {
    //handling ribbon's main menu elements
    element = _event.srcElement.handler;
    if (element == null) return; //no element to handle. exit

    switch (element.itemType) {
      case "MENU_ITEM":
        if (!element.item.isModule) {
          if (this.deselectHTMLItem(element)) {
            this.onHTMLItemDeselected(element);
          }
        }
        return true;
        break;

      case "MENU_SUBITEM":
        if (!element.item.isModule) {
          if (this.deselectHTMLSubItem(element)) {
            this.onHTMLSubItemDeselected(element);
          }
        }
        break;

      case "MENU_RECENTDOC":
        element.className = "";
        break;
    }
  } else {
    element = _event.srcElement.MenuRow;
    //TODO stop event if item is separator
    if (
      element == null ||
      element.className == "menuItemSeparator" ||
      element.item.disabled
    )
      return;
    menuItemOff();
  }
}

function RibbonMainMenu_handleOnClick() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  var element = null;
  if (_event.srcElement.isMenuElem) {
    //handling ribbon's main menu elements
    element = _event.srcElement.handler;
    if (element == null) return; //no element to handle. exit

    switch (element.itemType) {
      case "MENU_ITEM":
        if (element.item != null && element.item.onclick != null) {
          element.item.onclick();
          this.hide();
        }
        break;

      case "MENU_SUBITEM":
        if (element.item != null && element.item.onclick != null) {
          element.item.onclick();
          this.hide();
        }
        break;

      case "MENU_RECENTDOC":
        if (element.parentObj == null) return; //TODO check with instanceof ?
        if (_event.srcElement.semiHot) {
          element.parentObj.setStickyMode(element.parentObj.sticky, true);
        } else {
          element.parentObj.DoItemClick();
        }
        break;
    }
  } else {
    element = _event.srcElement.MenuRow;
    //TODO stop event if item is separator
    if (
      element == null ||
      element.className == "menuItemSeparator" ||
      element.item.disabled
    ) {
      this.hide();
      return;
    } else {
      menuClick();
      this.hide();
    }
  }
}

function RibbonMnuView(_parent, _name, _default) {
  //public properties
  this.parent = _parent; //this should always be a reference to a RibbonMainMenu object
  this.ownerDocument = this.parent.ownerDocument; //reference to the document in which the object was created
  this.name = _name;
  this.isDefault = _default || false;

  //private properties
  this.html = new Object(); //used to hold references to HTML elements
  this.html.viewTable = null; //reference to the table containing the view's contents
  this.html.viewTitle = null; //reference to the HTML element containing the view's title
  this.html.viewContent = null; //reference to the HTML element containing the view's content

  //public methods
  this.show = RibbonMnuView_show;
  this.hide = RibbonMnuView_hide;
  this.setContent = RibbonMnuView_setContent;
  this.setHeight = RibbonMnuView_setHeight;
  this.remove = RibbonMnuView_remove;

  //private methods
  this.buildUI = RibbonMnuView_buildUI;

  //everything is initialized, building the user interface
  this.buildUI();
}

//----------------------------------------------------------------------------------------------------------------------------
//PUBLIC METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuView_show() {
  this.html.viewTable.style.display = "block";
}

function RibbonMnuView_hide() {
  this.html.viewTable.style.display = "none";
  this.html.viewContent.scrollTop = 0; //TO-DO - remove?
}

function RibbonMnuView_setContent(_content) {
  this.html.viewContent.innerHTML = ""; //TO-DO - update this to use removeChild method
  this.html.viewContent.appendChild(_content);
}

function RibbonMnuView_setHeight(_height) {
  this.html.viewContent.style.height = _height - 24 + "px";
}

function RibbonMnuView_remove() {
  //TO-DO - remove the content also
  this.parent.html.viewDiv.removeChild(this.html.viewTable);
  this.html.viewTable = null;
  this.html.viewTitle = null;
  this.html.viewContent = null;
}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuView_buildUI() {
  this.html.viewTable = this.ownerDocument.createElement("DIV");
  this.html.viewTable.isMenuElem = true; //NC 2007-09-27
  this.html.viewTable.className = "rbnMenuView";

  this.html.viewTitle = this.ownerDocument.createElement("DIV");
  this.html.viewTitle.isMenuElem = true; //NC 2007-09-27
  this.html.viewTitle.className = "rbnMenuViewTitle";
  this.html.viewTitle.innerHTML = this.name;
  this.html.viewTable.appendChild(this.html.viewTitle);

  this.html.viewContent = this.ownerDocument.createElement("DIV");
  this.html.viewContent.isMenuElem = true; //NC 2007-09-27
  this.html.viewContent.className = "rbnMenuViewContent";
  this.html.viewTable.appendChild(this.html.viewContent);
}

//=============================================================================================================================
// RibbonMnuRecentDocs
//=============================================================================================================================
function RibbonMnuRecentDocs(_parent) {
  //TODO save somewhere else the max doc number
  this.maxDocuments = 10;

  //public properties
  this.parent = _parent; //this should always be a reference to a RibbonMnuView object
  this.ownerDocument = this.parent.ownerDocument; //reference to the document in which the object was created

  //private properties
  this.html = new Object(); //used to hold references to HTML elements
  this.html.tblDoc = null; //reference to the table containing the rows representing the recent documents
  this.__docs = new Array(); //internal list of recent documents

  //public methods
  this.insertDoc = RibbonMnuRecentDocs_insertDoc;
  this.removeDoc = RibbonMnuRecentDocs_removeDoc;
  this.docs = RibbonMnuRecentDocs_docs;
  this.setFirstItem = RibbonMnuRecentDocs_setFirstItem;

  //private methods
  this.buildUI = RibbonMnuRecentDocs_buildUI;
  this.updateDocsPos = RibbonMnuRecentDocs_updateDocsPos;

  //public events
  this.onItemClicked = null;
  this.onStickyClicked = null;

  //everything is initialized, building the user interface
  this.buildUI();
}

//----------------------------------------------------------------------------------------------------------------------------
//PUBLIC METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuRecentDocs_insertDoc(_id, _name, _sticky, _userData) {
  //NC 2007-09-25
  var newDoc = null;

  var oldDoc = this.docs(_id);
  if (oldDoc != null) {
    //remove to update position
    if (_sticky == null) {
      _sticky = oldDoc.sticky; //preserve the "sticky" status
    }
    oldDoc.remove();
    oldDoc = null;
  } else {
    //insert new item
    if (this.__docs.length == this.maxDocuments) {
      var found = false;
      var i = this.__docs.length - 1;
      while (i >= 0 && !found) {
        if (this.__docs[i].sticky == false) {
          found = true;
        } else i--;
      }

      if (found) {
        this.__docs[i].remove();
      } else {
        return null;
      }
    }
  }

  newDoc = new RibbonMnuDocItem(this, 0, _id, _name, _sticky, _userData);
  this.__docs.splice(0, 0, newDoc);
  this.updateDocsPos(1);

  return newDoc;
}

function RibbonMnuRecentDocs_removeDoc(_doc) {
  //TO-DO use IDs instead of names

  var pos = _doc.position;
  _doc.remove();
  this.__docs.splice(pos, 1);
  this.updateDocsPos(pos);
}

function RibbonMnuRecentDocs_docs(_id) {
  //NC 2007-09-25 updated to use IDs
  if (_id == null) return this.__docs;

  var i;
  for (i = 0; i < this.__docs.length; i++) {
    if (this.__docs[i].id == _id) {
      return this.__docs[i];
    }
  }
  return null;
}

function RibbonMnuRecentDocs_setFirstItem(_doc) {
  if (this.__docs.length == 0) return;

  var pos = _doc.position;
  this.__docs.splice(pos, 1);
  this.__docs.splice(0, 0, _doc);

  this.updateDocsPos(0);
  _doc.parent.html.tblDoc.moveRow(_doc.html.row.rowIndex, 0);
}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuRecentDocs_buildUI() {
  this.html.tblDoc = this.ownerDocument.createElement("TABLE");
  this.html.tblDoc.isMenuElem = true; //NC 2007-09-27
  this.html.tblDoc.cellSpacing = 0;
  this.html.tblDoc.cellPadding = 0;
  this.html.tblDoc.className = "rbnMainMenuDocItems";
}

function RibbonMnuRecentDocs_updateDocsPos(_index) {
  var i;
  var count = this.__docs.length;
  for (i = 0; i < count; i++) {
    this.__docs[i].position = i;
  }
}

//=============================================================================================================================
// RibbonMnuDocItem
//=============================================================================================================================
function RibbonMnuDocItem(_parent, _position, _id, _name, _sticky, _userData) {
  //NC 2007-09-25
  //public properties
  this.parent = _parent; //this should always be a reference to a RibbonMnuRecentDocs object
  this.ownerDocument = this.parent.ownerDocument; //reference to the document in which the object was created
  this.position = _position;
  this.id = _id; //NC 2007-09-25
  this.name = _name;
  this.sticky = _sticky;

  //private properties
  this.html = new Object(); //used to hold references to HTML elements
  this.html.row = null; //reference to the row containing the current item
  this.html.sticky = null; //reference to the sticky image
  this.__userData = _userData; //NC 2007-09-25 not used

  //public methods
  this.setStickyMode = RibbonMnuDocItem_setStickyMode;
  this.remove = RibbonMnuDocItem_remove;
  this.setUserData = RibbonMnuDocItem_setUserData; //NC 2007-09-26
  this.getUserData = RibbonMnuDocItem_getUserData; //NC 2007-09-26

  //private methods
  this.render = RibbonMnuDocItem_render;
  this.DoItemClick = RibbonMnuDocItem_DoItemClick;

  //everything is initialized, rendering the item
  this.render();
  this.setStickyMode(!this.sticky, false); //setting the sticky image
}
//----------------------------------------------------------------------------------------------------------------------------
//PUBLIC METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuDocItem_setUserData(_data) {
  this.__userData = _data;
}

function RibbonMnuDocItem_getUserData() {
  return this.__userData;
}

function RibbonMnuDocItem_setStickyMode(_enabled, _fireEvent) {
  this.sticky = !_enabled;
  if (this.sticky) {
    this.html.sticky.src = "graphics/skins/blue/rbnMnuDocItem_sticky-on.gif";
  } else {
    this.html.sticky.src = "graphics/skins/blue/rbnMnuDocItem_sticky-off.gif";
  }

  if (_fireEvent) {
    if (typeof this.parent.onStickyClicked == "function") {
      this.parent.onStickyClicked(this);
    }
  }
}

function RibbonMnuDocItem_remove() {
  this.parent.__docs.splice(this.position, 1); //NC 2007-09-25
  this.parent.html.tblDoc.deleteRow(this.html.row.rowIndex);
}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE METHODS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuDocItem_render() {
  //var self = this;
  this.html.row = this.parent.html.tblDoc.insertRow(this.position);
  this.html.row.title = this.__userData; //FOR HTML EDITOR..
  this.html.row.isMenuElem = true; //NC 2007-09-27
  this.html.row.itemType = "MENU_RECENTDOC"; //NC 2007-09-27
  this.html.row.parentObj = this; //NC 2007-09-27
  //this.html.row.onmouseenter = function() { this.className = 'hot'; }
  //this.html.row.onmouseleave = function() { this.className = ''; }

  var cell = this.html.row.insertCell(-1);
  cell.isMenuElem = true; //NC 2007-09-27
  cell.handler = this.html.row; //NC 2007-09-27
  cell.className = "left";
  cell.innerHTML = "&nbsp;";
  //cell.onclick = function() { self.DoItemClick(); }

  cell = this.html.row.insertCell(-1);
  cell.isMenuElem = true; //NC 2007-09-27
  cell.handler = this.html.row; //NC 2007-09-27
  cell.className = "title";
  //cell.onclick = function() { self.DoItemClick(); }
  var div = this.ownerDocument.createElement("DIV");
  div.isMenuElem = true; //NC 2007-09-27
  div.handler = this.html.row; //NC 2007-09-27
  div.innerHTML = this.name;
  cell.appendChild(div);

  cell = this.html.row.insertCell(-1);
  cell.isMenuElem = true; //NC 2007-09-27
  cell.handler = this.html.row; //NC 2007-09-27
  cell.semiHot = true; //NC 2007-09-27
  cell.className = "mleft";
  cell.innerHTML = "&nbsp;";
  //cell.onmouseenter = function() { this.parentNode.className = 'semihot'; }
  //cell.onmouseleave = function() { this.parentNode.className = 'hot'; }
  //cell.onclick = function() { self.setStickyMode(self.sticky, true); }

  cell = this.html.row.insertCell(-1);
  cell.isMenuElem = true; //NC 2007-09-27
  cell.handler = this.html.row; //NC 2007-09-27
  cell.semiHot = true; //NC 2007-09-27
  cell.className = "sticky";
  //cell.onmouseenter = function() { this.parentNode.className = 'semihot'; }
  //cell.onmouseleave = function() { this.parentNode.className = 'hot'; }
  //cell.onclick = function() { self.setStickyMode(self.sticky, true); }
  this.html.sticky = this.ownerDocument.createElement("IMG");
  this.html.sticky.isMenuElem = true;
  this.html.sticky.handler = this.html.row; //NC 2007-09-27
  this.html.sticky.semiHot = true; //NC 2007-09-27
  cell.appendChild(this.html.sticky);

  cell = this.html.row.insertCell(-1);
  cell.isMenuElem = true; //NC 2007-09-27
  cell.handler = this.html.row; //NC 2007-09-27
  cell.semiHot = true; //NC 2007-09-27
  cell.className = "right";
  cell.innerHTML = "&nbsp;";
  //cell.onmouseenter = function() { this.parentNode.className = 'semihot'; }
  //cell.onmouseleave = function() { this.parentNode.className = 'hot'; }
  //cell.onclick = function() { self.setStickyMode(self.sticky, true); }
}

//----------------------------------------------------------------------------------------------------------------------------
//PRIVATE EVENTS
//----------------------------------------------------------------------------------------------------------------------------
function RibbonMnuDocItem_DoItemClick() {
  //deselect the row (it's a bug when setting it at the first item, it doesn't get deselected)
  this.html.row.className = "";

  this.parent.setFirstItem(this);
  this.parent.parent.hide();

  if (typeof this.parent.onItemClicked == "function") {
    this.parent.onItemClicked(this);
  }
}
