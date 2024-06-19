//NC 2007-09-20
var RibbonState = new Object();
RibbonState.Normal = 1;
RibbonState.Minimized = 2;
RibbonState.Popup = 3; //NOT used yet

function Ribbon(_document) {
  //public properties
  this.ownerDocument = _document; //reference to the document containing the ribbon
  this.parent = this.ownerDocument.getElementById("ribbon"); //TO-DO - remove this. create it by BuildInterface
  this.activeTab = null; //reference to the active tab
  this.xsl = new Object(); //helper object used to store different XSL documents loaded from the server
  this.xsl.modulesAndProcessesToButtons = new XML2();
  this.xsl.modulesAndProcessesToButtons.load("ribbon.module_and_process.xsl"); //load the XSL
  this.xsl.tabContent = new XML2();
  this.xsl.tabContent.load("ribbon.xsl");
  this.html = new Object(); //helper object used to store references to relevant HTML elements
  this.html.pageContent = this.ownerDocument.getElementById("pageContent");
  this.timer = null; //used to scroll tabs and groups
  this.evalFn = []; //array of function pointer used to execute code in the appropriate content/document
  this.preRenderQueue = []; //list of functions to execute when the iframe loads
  this.preRenderDoc = null;
  this.preRenderFrame = null;
  this.state = RibbonState.Normal; //TODO read from "user preferences"
  this.accelsVisible = false; //NC 2007-11-12
  //creating the main menu
  this.menu = new RibbonMainMenu(this);

  //private properties
  this.__tabs = []; //internal array of tabs
  this.__qat = []; //internal array of quick access buttons
  this.__popupMenu = null; //reference to the current displayed popup menu
  this.__activeDropDown = null; //reference to the current dropdown button pressed that displays the popup menu
  this.__mustRedraw = false; //this will be set to true when trying to draw while minimized, so the next time the ribbon is
  //shown, we now the size has changed, so we must redraw
  this.__registeredElements = []; //SL array of params for showMenu when there are  dependencies
  this.__hkState = 0; //NC 2007-11-09
  //attaching events
  var self = this;
  //Ibiza_attachEvent(window, "onresize", function() { self.onResize() });
  // this.ownerDocument.attachEvent("onmousedown", Ribbon_handleClick); //NC 2007-11-12
  // document.attachEvent("onmousedown", Ribbon_handleClick); //NC 2007-11-12
  // window.attachEvent("onresize", function () {
  //   self.onResize();
  // });

  this.iframeLoaded = false;

  this.ownerDocument.addEventListener("mousedown", Ribbon_handleClick); //NC 2007-11-12
  document.addEventListener("mousedown", Ribbon_handleClick); //NC 2007-11-12
  window.addEventListener("resize", function () {
    self.onResize();
  });
}
//public methods
Ribbon.prototype.insertTab = Ribbon_insertTab; //inserts a new tab
Ribbon.prototype.removeTab = Ribbon_removeTab; //removes the specified tab
Ribbon.prototype.getTabCount = Ribbon_getTabCount; //returns the number of tabs
Ribbon.prototype.addTabContext = Ribbon_addTabContext; //adds context-sensitive data
Ribbon.prototype.removeTabContext = Ribbon_removeTabContext; //removes context-sensitive data
Ribbon.prototype.setTabContextID = Ribbon_setTabContextID; //applies context-sensitive data
Ribbon.prototype.tabs = Ribbon_tabs; //returns the tab with the specified name
Ribbon.prototype.setActiveTab = Ribbon_setActiveTab;
Ribbon.prototype.insertQATButton = Ribbon_insertQATButton;
Ribbon.prototype.removeQATButton = Ribbon_removeQATButton;
Ribbon.prototype.getQATCount = Ribbon_getQATCount;
Ribbon.prototype.qat = Ribbon_qat; //returns the tab with the specified name
Ribbon.prototype.scrollGroups = Ribbon_scrollGroups; //scrolls the groups from the active tab in the specified position
Ribbon.prototype.scrollTabs = Ribbon_scrollTabs; //scrolls the tabs in the specified position
Ribbon.prototype.render = Ribbon_render; //draws the ribbon
Ribbon.prototype.show = Ribbon_show; //shows the ribbon
Ribbon.prototype.showMinimized = Ribbon_showMinimized; //shows the ribbon in the minimized state
Ribbon.prototype.minimize = Ribbon_minimize; //minimizes the ribbon
Ribbon.prototype.setTitle = Ribbon_setTitle; //sets the title text of the ribbon
Ribbon.prototype.destructor = Ribbon_destructor; //destructor
Ribbon.prototype.stopScroll = Ribbon_stopScroll;
Ribbon.prototype.checkOverflow = Ribbon_checkOverflow;
Ribbon.prototype.scrollGroup2Left = Ribbon_scrollGroup2Left;
Ribbon.prototype.scrollGroup2Right = Ribbon_scrollGroup2Right;
Ribbon.prototype.scrollGroup = Ribbon_scrollGroup;
Ribbon.prototype.scrollTab2Left = Ribbon_scrollTab2Left;
Ribbon.prototype.scrollTab2Right = Ribbon_scrollTab2Right;
Ribbon.prototype.scrollTab = Ribbon_scrollTab;
Ribbon.prototype.execute = Ribbon_execute;
Ribbon.prototype.addEvalFn = Ribbon_addEvalFn;
Ribbon.prototype.removeEvalFn = Ribbon_removeEvalFn;
Ribbon.prototype.showMenu = Ribbon_showMenu;
Ribbon.prototype.getEvalFn = Ribbon_getEvalFn;
Ribbon.prototype.updateQATPositions = Ribbon_updateQATPositions;
Ribbon.prototype.updateUserCount = Ribbon_updateUserCount; //NC 2007-10-13
Ribbon.prototype.setMainMenuLogo = Ribbon_setMainMenuLogo; //NC 2007-11-19
Ribbon.prototype.getButton = Ribbon_getButton; //NC 2008-01-23
//private methods
Ribbon.prototype.buildUserInterface = Ribbon_buildUserInterface;
Ribbon.prototype.resizePageContent = Ribbon_resizePageContent;
Ribbon.prototype.checkTabOverflow = Ribbon_checkTabOverflow;
Ribbon.prototype.checkGroupOverflow = Ribbon_checkGroupOverflow;
Ribbon.prototype.toggleMainMenu = Ribbon_toggleMainMenu;
Ribbon.prototype.onPrerenderLoaded = Ribbon_onPrerenderLoaded;
Ribbon.prototype.showQATMenu = Ribbon_showQATMenu; //displays the pop-up menu when the QAT arrow is clicked
Ribbon.prototype.getQATMenu = Ribbon_getQATMenu; //returns the contents of the QAT menu
Ribbon.prototype.closePopupMenu = Ribbon_closePopupMenu;
Ribbon.prototype.handleAccel = Ribbon_handleAccel; //NC 2007-11-09
Ribbon.prototype.showAccels = Ribbon_showAccels; //NC 2007-11-09
Ribbon.prototype.hideAccels = Ribbon_hideAccels; //NC 2007-11-09
//public events
Ribbon.prototype.onShow = Ribbon_onShow; //occurs when the ribbon is shown
Ribbon.prototype.onMinimize = Ribbon_onMinimize; //occurs when the ribbon is hidden
//private events
Ribbon.prototype.onResize = Ribbon_onResize; //occurs when the browser window is resized (we have to be carefull to not override other 'onresize' events)
Ribbon.prototype.buildMenu = Ribbon_buildMenu; //SL 20071024

//=========================================================================================================
// PUBLIC METHODS
//=========================================================================================================
function Ribbon_getButton(_btnID) {
  try {
    return new RibbonBTN(
      this,
      _btnID,
      this.ownerDocument.getElementById("rbnBTN_" + _btnID)
    );
  } catch (e) {
    return null;
  }
}

function Ribbon_onMenuDepsLoaded(_index) {
  //SL : get last elt registered and call show menu
  var ribObj = getRibbon();
  var registeredCall = ribObj.__registeredElements[_index];
  if (registeredCall == null) return;

  eval(
    "ribObj.showMenu( registeredCall.el , registeredCall.xml , registeredCall.contextID , registeredCall.onbuildFn )"
  );
}

function Ribbon_buildMenu(el, xml, _contextID, _onbuildFn, _dependencies) {
  if (typeof _dependencies != "undefined" && _dependencies != "") {
    var paramsObj = new Object();
    paramsObj.el = el;
    paramsObj.xml = xml;
    paramsObj.contextID = _contextID;
    paramsObj.onbuildFn = _onbuildFn;

    this.__registeredElements[this.__registeredElements.length] = paramsObj;
    var idx = this.__registeredElements.length - 1;
    var actionFn = 'Ribbon_onMenuDepsLoaded("' + idx.toString() + '")';

    var pos = compute_element_Coordinates(el);
    var menuItems = new Array();
    menuItems[0] = new menuItem(
      translate("Loading in progress..."),
      "",
      "",
      "pixel",
      true,
      false
    );
    menuItems[0].srcElement = el;
    this.__popupMenu = new popUpMenu(
      el.document,
      menuItems,
      pos.x - el.offsetWidth,
      pos.y
    ); //, (this.state == RibbonState.Popup));

    loadPrototypes(_dependencies, actionFn);
  } else this.showMenu(el, xml, _contextID, _onbuildFn);
}

function Ribbon_showMenu(el, xml, _contextID, _onbuildFn) {
  //_onbuildFn has highest priority.
  //if _onbuildFn does not return any result, the xml provided will be used, making it easy to set default content for dynamic menus

  //if there is an onBuild function, ask for the items
  var data = null;
  var evalFn = this.getEvalFn(_contextID);
  switch (typeof _onbuildFn) {
    case "string":
      if (_onbuildFn != "") {
        if (evalFn != null) data = evalFn(_onbuildFn + "()");
        else data = eval(_onbuildFn + "()");
      }
      break;

    case "function":
      data = _onbuildFn();
      break;
  }
  if (data == null || data == "") data = xml; //if there was no onbuildFn, or no return value, load the xml provided

  // var moduleNode = new ActiveXObject("Microsoft.XMLDOM");
  // moduleNode.loadXML("<action>" + data + "</action>");
  var parser = new DOMParser();
  var moduleNode = parser.parseFromString(
    "<action>" + data + "</action>",
    "text/xml"
  );

  //var evalFn = this.getEvalFn( _contextID );
  var crtProfile = ""; //getProfile();
  var items = modulesAndProcessToItems(
    moduleNode.documentElement,
    crtProfile,
    evalFn
  );

  el.className = el.className.replace("_hot", "_down");
  el.className = el.className.replace("_hover", "_down");

  var pos = compute_element_Coordinates(el);
  this.__popupMenu = new popUpMenu(
    el.document,
    items,
    pos.x - el.offsetWidth,
    pos.y,
    Ribbon_RestoreButtonState,
    el,
    evalFn
  ); //, (this.state == RibbonState.Popup));
}
function Ribbon_getEvalFn(_contextID) {
  if (_contextID == "" || _contextID == null) return null;
  return this.evalFn[_contextID];
}

function Ribbon_RestoreButtonState(el) {
  el.className = el.className.replace("_down", "");
  var group = el.parentNode;
  while (group != null) {
    if (group.className == "ribbonGroup_hot") {
      group.className = "ribbonGroup";
      break;
    } else group = group.parentNode;
  }
}

function Ribbon_insertTab(_position, _id, _name, _content) {
  var nbTabs = this.getTabCount();
  var position = _position;
  if (position < 0 || position > nbTabs) {
    position = nbTabs;
  }
  var newTab = new RibbonTab(this, position, _id, _name, _content);
  this.__tabs.splice(position, 0, newTab);

  //update tab positions
  var i;
  for (i = position + 1; i < this.__tabs.length; i++) {
    this.__tabs[i].position = i;
  }

  //return the new tab object
  return newTab;
}

function Ribbon_checkOverflow() {
  this.checkTabOverflow();
  this.checkGroupOverflow();
}

function Ribbon_removeTab(_tab) {
  //here we must handle onHide event

  this.__tabs.splice(_tab.position, 1);
  _tab.destructor(); //TO-DO - implement this method

  this.setActiveTab(null);
}

function Ribbon_getTabCount() {
  //here we can return the number of normal tabs and/or the number of total tabs (including context tabs)
  return this.__tabs.length;
}

function Ribbon_tabs(_tabID) {
  var i;
  for (i = 0; i < this.__tabs.length; i++) {
    if (this.__tabs[i].id == _tabID) return this.__tabs[i];
  }
  return null;
}

function Ribbon_addTabContext(_tab, _contextID, _content) {
  return _tab.setContent(_contextID, _content);
}

function Ribbon_removeTabContext(_tab, _contextID) {
  return _tab.removeContent(_contextID);
}

function Ribbon_setTabContextID(_tab, _contextID) {
  return _tab.setContextID(_contextID);
}

function Ribbon_setActiveTab(_tab, _userClick) {
  //if (this.activeTab == _tab) return; //if we need to reload the buttons from a tab, even if it's the same, we leave this commented out

  if (this.activeTab != null) {
    if (this.activeTab.deselect() == false) return false; //if the activeTab can't be deselected, return false
  }

  if (_tab != null && !_tab.select(_userClick)) return false; //if the new tab can't be selected, return false

  this.activeTab = _tab;
  return true;
}

function Ribbon_qat(_qatID) {
  var i;
  for (i = 0; i < this.__qat.length; i++) {
    if (this.__qat[i].id == _qatID) return this.__qat[i];
  }
  return null;
}

function Ribbon_getQATCount() {
  return this.__qat.length;
}

function Ribbon_insertQATButton(_position, _id, _xml, _contextID) {
  var qatCount = this.getQATCount();
  _position = _position < 0 || _position > qatCount ? qatCount : _position;

  var qatBtn = new RibbonQATBtn(this, _position, _id, _xml, _contextID);
  this.__qat.splice(_position, 0, qatBtn);

  //update qat buttons positions
  var i;
  for (i = _position + 1; i < qatCount; i++) {
    this.__qat[i].position = i;
  }

  //return the new qatBtn object
  return qatBtn;
}

function Ribbon_removeQATButton(_qatButton) {
  _qatButton.remove();
}

function Ribbon_stopScroll() {
  try {
    clearInterval(this.timer);
  } catch (e) {}
}

function Ribbon_scrollGroups(_direction, _amount) {}
function Ribbon_scrollTabs(_direction, _amount) {}
function Ribbon_render() {}

function Ribbon_show() {
  if (this.state == RibbonState.Popup) this.minimize();

  this.html.ribbonBar.style.display = "block";
  this.parent.style.height = "146px";
  this.state = RibbonState.Normal;

  if (this.__mustRedraw && this.activeTab != null) {
    this.activeTab.render();
  }
  DoResize(); //TODO remove (fct from index.html)
}

function cancelEvent(e) {
  // try to prevent side effects (browser defaults)
  e.cancelBubble = true;
  e.returnValue = false;
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault) e.preventDefault();
  return false;
}

function Ribbon_handleClick() {
  //NC 2007-11-12
  var ribbon = getRibbon();
  if (ribbon.accelsVisible) {
    ribbon.hideAccels(false);
  }

  if (ribbon.state != RibbonState.Popup) return; //handle only the "popup" state

  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  var element = null;
  if (_event.srcElement.isRibbonElem == "true") {
    element = _event.srcElement;
    while (element != null && element.itemType == null) {
      element = element.parentNode;
    }
    if (element == null || element.disabled) return;

    switch (element.itemType) {
      case "RBN_BTN_LARGE":
      case "RBN_BTN_MEDIUM":
      case "RBN_BTN_SMALL":
        if (!element.isDropDown) {
          if (element.onclick != null) {
            element.onclick();
          }
          ribbon.minimize();
        }
        break;

      case "RBN_TAB":
        ribbon.closePopupMenu();
        break;

      default:
        ribbon.closePopupMenu();
        break;
    }
  } else {
    element = _event.srcElement.MenuRow;
    if (
      element == null ||
      element.className == "menuItemSeparator" ||
      element.item.disabled
    ) {
      ribbon.minimize();
      return false;
    } else {
      menuClick();
      ribbon.minimize();
    }
  }
}

function Ribbon_showMinimized() {
  this.html.ribbonBar.style.display = "block";
  this.parent.style.height = "55px";
  this.state = RibbonState.Popup;
  //this.onResize();
}

function Ribbon_minimize() {
  this.closePopupMenu();

  this.parent.style.width = this.ownerDocument.body.offsetWidth + "px"; //there was a a slight table resize, but this fixes it
  this.html.ribbonBar.style.display = "none";
  this.parent.style.height = "55px";
  this.state = RibbonState.Minimized;
  this.onResize();
  DoResize(); //TODO remove (fct from index.html)
}

function Ribbon_setTitle(_title) {
  _title = _title || "&nbsp;";
  this.html.titleBarText.innerHTML = _title;
}

//NC 2007-10-13
function Ribbon_updateUserCount(_userCount) {
  var txt = "";
  if (_userCount == 1) txt = translate("user");
  else txt = translate("users");

  this.html.titleBarUsers.innerHTML = _userCount + " " + txt;
}

function Ribbon_destructor() {
  if (this.activeTab != null) {
    this.activeTab.destructor(); //TODO check if a destructor is called for the controls in the context and default content
    this.activeTab = null;
  }
  this.xsl = null;
  this.pageContent = null;
  this.appBar = null;
  this.qat = null;
  this.qatRow = null;
  this.qatMenu = null;
  this.docTitle = null;
  this.titleBarText = null;
  this.titleBarUsers = null;
  this.titleBarLogout = null;
  this.tabContainer = null;
  this.tabScroll = null;
  this.tabStripScrollLeft = null;
  this.tabStripScrollRight = null;
  this.tabs = null;
  this.tabsRow = null;
  this.ribbonBar = null;
  this.mainMenu = null;
  this.groupScrollLeft = null;
  this.groupScrollRight = null;
  this.ribbonPage = null;
  this.ribbonPageTbl = null;
  this.ribbonPageContainer = null;

  this.preRenderDoc = null;
  this.preRenderFrame = null;

  //this.menu.destructor(); //TODO implement
  var i;
  for (i = 0; i < this.__tabs.length; i++) {
    this.__tabs[i].destructor(); //TODO check
    this.__tabs[i] = null;
  }
  this.__tabs = null;

  for (i = 0; i < this.__qat.length; i++) {
    //this.__qat[i].destructor(); //TODO implement
    this.__qat[i] = null;
  }
  this.__qat = null;

  //NC 2007-11-20
  for (i in this.html) {
    this.html[i] = null;
  }
  this.html = null;
}

function Ribbon_scrollGroup2Left() {
  this.html.ribbonPage.parentElement.scrollLeft -= 25;
  this.checkGroupOverflow();
}

function Ribbon_scrollGroup2Right() {
  this.html.ribbonPage.parentElement.scrollLeft += 25;
  this.checkGroupOverflow();
}

function Ribbon_scrollGroup(direction) {
  try {
    if (this.timer != null) this.stopScroll();

    var self = this;
    switch (direction) {
      case "left":
        this.timer = window.setInterval(function () {
          self.scrollGroup2Left();
        }, 50);
        break;
      case "right":
        this.timer = window.setInterval(function () {
          self.scrollGroup2Right();
        }, 50);
        break;
    }
  } catch (e) {}
}

function Ribbon_scrollTab2Left() {
  this.html.tabScroll.scrollLeft -= 25;
  this.checkTabOverflow();
}

function Ribbon_scrollTab2Right() {
  this.html.tabScroll.scrollLeft += 25;
  this.checkTabOverflow();
}

function Ribbon_scrollTab(direction) {
  try {
    if (this.timer != null) this.stopScroll();

    var self = this;
    switch (direction) {
      case "left":
        this.timer = window.setInterval(function () {
          self.scrollTab2Left();
        }, 50);
        break;
      case "right":
        this.timer = window.setInterval(function () {
          self.scrollTab2Right();
        }, 50);
        break;
    }
  } catch (e) {}
}

function Ribbon_execute(_contextID, _fn) {
  try {
    if (this.evalFn[_contextID] != null) this.evalFn[_contextID](_fn);
    else eval(_fn);
  } catch (exception) {}
}

function Ribbon_addEvalFn(_contextID, _fn) {
  this.evalFn[_contextID] = _fn;
}

function Ribbon_removeEvalFn(_contextID) {
  //SL set eval fn when there is the case, otherwise set it to null
  this.evalFn[_contextID] = null;
}

//NC 2007-11-19
function Ribbon_setMainMenuLogo(_src) {
  if (_src == null || _src == "") return;
  this.html.mainMenuLogo.src = _src;
}

//=========================================================================================================
// PRIVATE METHODS
//=========================================================================================================
//NC 2007-10-01
function Ribbon_closePopupMenu() {
  if (this.__popupMenu != null) {
    this.__popupMenu.hide();
    this.__popupMenu = null;
  }

  if (this.__activeDropDown != null) {
    this.__activeDropDown.pressed = false;
    this.__activeDropDown = null;
  }
}

//NC 2007-09-20
function Ribbon_getQATMenu() {
  var itemName, itemAction;
  switch (this.state) {
    case RibbonState.Normal:
      itemName = translate("Minimize");
      itemAction = "getRibbon().minimize()";
      break;

    case RibbonState.Minimized:
    case RibbonState.Popup:
      itemName = translate("Show");
      itemAction = "getRibbon().show();";
      break;
  }

  var xml =
    "<process><name>" +
    itemName +
    "</name><src>" +
    itemAction +
    "</src></process>";
  return xml;
}

function Ribbon_showQATMenu() {
  this.showMenu(this.html.qatMenu, this.getQATMenu());
}

function Ribbon_onPrerenderLoaded() {
  //TO-DO implement the self.onLoaded
  //self.onLoaded();

  this.iframeLoaded = true;
  for (i in this.preRenderQueue) {
    this.preRenderQueue[i]();
  }
}

function Ribbon_updateQATPositions(_index) {
  var i;
  var count = this.getQATCount();
  for (i = _index; i < count; i++) {
    this.__qat[i].position = i;
  }
}

function Ribbon_checkTabOverflow() {
  try {
    if (this.html.tabScroll.scrollLeft > 0) {
      this.html.tabStripScrollLeft.style.display = "block";
    } else {
      this.html.tabStripScrollLeft.style.display = "none";
      this.stopScroll();
    }

    if (
      this.html.tabs.scrollWidth - this.html.tabScroll.scrollLeft >
      this.html.tabContainer.offsetWidth
    ) {
      this.html.tabStripScrollRight.style.display = "block";
    } else {
      this.html.tabStripScrollRight.style.display = "none";
      this.stopScroll();
    }
  } catch (e) {}
}

function Ribbon_checkGroupOverflow() {
  if (this.state == RibbonState.Minimized) return;
  try {
    if (this.html.ribbonPage.parentElement.scrollLeft > 0) {
      this.html.groupScrollLeft.style.display = "block";
    } else {
      this.html.groupScrollLeft.style.display = "none";
      this.stopScroll();
    }

    if (
      this.html.ribbonPageTbl.scrollWidth -
        this.html.ribbonPage.parentElement.scrollLeft >
      this.html.ribbonPageContainer.offsetWidth
    ) {
      this.html.groupScrollRight.style.display = "block";
    } else {
      this.html.groupScrollRight.style.display = "none";
      this.stopScroll();
    }
  } catch (e) {}
}

function Ribbon_resizePageContent() {
  try {
    this.parent.style.width = this.ownerDocument.body.offsetWidth + "px";
    this.html.pageContent.style.height =
      this.ownerDocument.body.clientHeight - this.parent.offsetHeight + "px";
  } catch (e) {}
}

function applyVisualStyle(sender, className) {
  sender.onmouseenter = function () {
    this.className = className + "_hover";
    this.hot = true;
  };
  sender.onmouseleave = function () {
    this.className = className;
    this.hot = false;
  };
  sender.onmousedown = function () {
    this.className = className + "_down";
  };
  sender.onmouseup = function () {
    if (this.hot) this.className = className + "_hover";
    else this.className = className;
  };
}

function Ribbon_buildUserInterface() {
  var self = this;

  //application bar
  this.html.appBar = this.ownerDocument.createElement("DIV");
  this.html.appBar.id = "appBar";
  this.parent.appendChild(this.html.appBar);

  //quick access toolbar
  var divMainMenu = this.ownerDocument.createElement("DIV");
  divMainMenu.id = "appBarMainMenu";
  this.html.appBar.appendChild(divMainMenu);

  var qatLeft = this.ownerDocument.createElement("DIV");
  qatLeft.id = "quickAccessLeft";
  this.html.appBar.appendChild(qatLeft);

  this.html.qat = this.ownerDocument.createElement("TABLE");
  this.html.qat.id = "quickAccessContent";
  this.html.qat.cellPadding = 0;
  this.html.qat.cellSpacing = 0;
  this.html.appBar.appendChild(this.html.qat);
  this.html.qatRow = this.html.qat.insertRow(-1);

  var qatRight = this.ownerDocument.createElement("DIV");
  qatRight.id = "quickAccessRight";
  this.html.appBar.appendChild(qatRight);

  this.html.qatMenu = this.ownerDocument.createElement("DIV");
  this.html.qatMenu.className = "quickAccessCustomizeButton";
  applyVisualStyle(this.html.qatMenu, "quickAccessCustomizeButton");
  this.html.appBar.appendChild(this.html.qatMenu);
  this.html.qatMenu.onclick = function () {
    self.showQATMenu();
  }; //NC 2007-09-20

  this.html.docTitle = this.ownerDocument.createElement("DIV");
  this.html.docTitle.id = "appBarText";
  //this.html.docTitle.innerHTML = "&nbsp;"; //NC 2007-10-13
  this.html.appBar.appendChild(this.html.docTitle);

  //NC 2007-10-13

  var tblText = this.ownerDocument.createElement("TABLE");
  tblText.cellPadding = 0;
  tblText.cellSpacing = 0;
  tblText.id = "ribbonTableText";
  var tblTextRow = tblText.insertRow(-1);
  this.html.titleBarText = tblTextRow.insertCell(-1);
  this.html.titleBarText.id = "titleBarText";

  this.html.titleBarUsers = tblTextRow.insertCell(-1);
  this.html.titleBarUsers.id = "titleBarUsers";

  this.html.titleBarLogout = tblTextRow.insertCell(-1);
  //NC 2007-10-26
  var img = this.ownerDocument.createElement("IMG");
  img.src = "graphics/logout_small.gif";
  img.width = 19;
  img.height = 19;
  //20071204 TODO finish img.onclick = function() { alert('call cache.logout()') };
  this.html.titleBarLogout.appendChild(img);

  this.html.docTitle.appendChild(tblText);

  //tabs
  var tabStrip = this.ownerDocument.createElement("DIV");
  tabStrip.id = "tabStrip";
  this.parent.appendChild(tabStrip);

  var tabStripScroll = this.ownerDocument.createElement("DIV");
  tabStripScroll.id = "tabStripScroll";
  tabStripScroll.style.display = "inline-block";
  tabStripScroll.style.margin = "0 45px 0 0";
  tabStrip.appendChild(tabStripScroll);

  this.html.tabContainer = this.ownerDocument.createElement("DIV");
  this.html.tabContainer.id = "tabContainer";
  tabStripScroll.appendChild(this.html.tabContainer);

  this.html.tabScroll = this.ownerDocument.createElement("DIV");
  this.html.tabScroll.id = "tabScroll";
  this.html.tabContainer.appendChild(this.html.tabScroll);

  this.html.tabStripScrollLeft = this.ownerDocument.createElement("DIV");
  this.html.tabStripScrollLeft.id = "tabStripScrollLeft";
  this.html.tabStripScrollLeft.innerHTML = "&nbsp;";
  tabStripScroll.appendChild(this.html.tabStripScrollLeft);

  this.html.tabStripScrollRight = this.ownerDocument.createElement("DIV");
  this.html.tabStripScrollRight.id = "tabStripScrollRight";
  this.html.tabStripScrollRight.innerHTML = "&nbsp;";
  tabStripScroll.appendChild(this.html.tabStripScrollRight);

  /*var tabBtns = this.ownerDocument.createElement('TABLE');
        tabBtns.style.position = 'absolute';
        tabBtns.style.right = 0;
        tabBtns.style.top = 0;
        tabBtns.cellSpacing = 0;
        tabBtns.cellPading = 0;
        tabStrip.appendChild(tabBtns);
        
            var row = tabBtns.insertRow(-1);
        
            var cell = row.insertCell(-1);
            this.html.tabBtnHelp = UI.createSmallBtn(this.ownerDocument, 'help_tab', translate('Help'), RibbonBtn_helpClick, false);
            cell.appendChild(this.html.tabBtnHelp);
            
            cell = row.insertCell(-1);
            this.html.tabBtnClose = UI.createSmallBtn(this.ownerDocument, 'close', translate('Close'), RibbonBtn_closeClick, true);
            cell.style.display = 'none';
            cell.appendChild(this.html.tabBtnClose);*/

  //building the tab user interface
  var div = this.ownerDocument.createElement("DIV");
  div.style.height = "23px";
  this.html.tabs = this.ownerDocument.createElement("TABLE");
  this.html.tabs.cellSpacing = "0";
  this.html.tabs.cellPadding = "0";
  this.html.tabs.id = "tabs";
  this.html.tabs.height = "23";
  this.html.tabScroll.appendChild(div);
  div.appendChild(this.html.tabs);
  this.html.tabsRow = this.html.tabs.insertRow(-1);

  //ribbon page container
  this.html.ribbonBar = this.ownerDocument.createElement("DIV");
  this.html.ribbonBar.id = "ribbonBar";
  this.html.ribbonBar.style.position = "absolute";
  this.html.ribbonBar.style.left = "0";
  this.html.ribbonBar.style.top = "53px";
  this.html.ribbonBar.isRibbonElem = "true"; //NC 2007-11-07
  if (this.parent.ownerDocument != null)
    this.parent.ownerDocument.body.appendChild(this.html.ribbonBar);
  else this.parent.document.body.appendChild(this.html.ribbonBar);

  //main menu
  this.html.mainMenu = this.ownerDocument.createElement("DIV");
  this.html.mainMenu.className = "mainMenu";
  this.html.mainMenu.onmouseover = function () {
    if (!self.menu.visible) this.className = "mainMenu_hot";
  };
  this.html.mainMenu.onmouseout = function () {
    if (!self.menu.visible) this.className = "mainMenu";
  };
  this.html.mainMenu.onclick = function () {
    self.toggleMainMenu();
  };
  this.ownerDocument.body.appendChild(this.html.mainMenu);

  //NC 2007-11-19
  this.html.mainMenuLogo = this.ownerDocument.createElement("IMG");
  this.html.mainMenuLogo.id = "mainMenuLogo";
  this.html.mainMenuLogo.src = "graphics/ibiza-logo-small.gif";
  this.html.mainMenu.appendChild(this.html.mainMenuLogo);

  //creating the pre-render iframe
  var iframe = this.ownerDocument.createElement("IFRAME");
  iframe.id = "prerender";
  iframe.src = "ribbon.prerender.html";
  iframe.name = "prerender";
  iframe.width = "100%";
  iframe.height = "100%";
  this.parent.appendChild(iframe);
  this.preRenderDoc = iframe.contentWindow.document;
  this.preRenderFrame = iframe;

  this.preRenderDoc.onload = function () {
    for (i in self.preRenderQueue) {
      self.preRenderQueue[i]();
    }
  };

  this.html.tabStripScrollLeft.onmouseenter = function () {
    this.className = "hot";
  };
  this.html.tabStripScrollLeft.onmouseleave = function () {
    self.stopScroll();
    this.className = "";
  };
  this.html.tabStripScrollRight.onmouseenter = function () {
    this.className = "hot";
  };
  this.html.tabStripScrollRight.onmouseleave = function () {
    self.stopScroll();
    this.className = "";
  };

  this.html.tabStripScrollLeft.onmousedown = function () {
    this.className = "down";
    self.scrollTab("left");
  };
  this.html.tabStripScrollLeft.onmouseup = function () {
    this.className = "hot";
    self.stopScroll();
  };
  this.html.tabStripScrollRight.onmousedown = function () {
    this.className = "down";
    self.scrollTab("right");
  };
  this.html.tabStripScrollRight.onmouseup = function () {
    this.className = "hot";
    self.stopScroll();
  };
}

function Ribbon_toggleMainMenu() {
  if (this.menu.visible) this.menu.hide();
  else this.menu.show();
}

function Ribbon_handleAccel(_event) {
  var hkManager = getHotKeyManager();
  var homeTab = this.tabs(getHomeTabID());
  var accels = homeTab.getAccels();
  var ch = String.fromCharCode(_event.keyCode);
  var accel = accels[ch];

  switch (this.__hkState) {
    case 0:
      if (hkManager.isHotKey(_event)) {
        this.showAccels();
        if (this.activeTab != homeTab) this.setActiveTab(homeTab);
        this.__hkState = 1;
      } else {
        if (accel != null) {
          if (
            (accel.useShift && _event.shiftKey) ||
            (!accel.useShift && !_event.shiftKey)
          ) {
            this.execute(accel.contextID, accel.fn);
            this.hideAccels(true);
          }
        }
      }
      break;

    case 1:
      if (_event.keyCode == 27 || hkManager.isHotKey(_event)) {
        this.hideAccels(true);
      } else {
        if (accel != null) {
          this.execute(accel.contextID, accel.fn);
          this.hideAccels(true);
        }
      }
      break;
  }
}

function Ribbon_showAccels() {
  this.html.ribbonBar.className = "shortCutEnabled";
  this.accelsVisible = true;
  if (this.state == RibbonState.Minimized) {
    this.showMinimized();
  }
}

function Ribbon_hideAccels(_minimize) {
  this.html.ribbonBar.className = "";
  this.accelsVisible = false;
  this.__hkState = 0;
  var hkManager = getHotKeyManager();
  hkManager.deactivateAccels();
  if (_minimize) {
    if (this.state == RibbonState.Popup) {
      this.minimize();
    }
  }
}

//=========================================================================================================
// PUBLIC EVENTS
//=========================================================================================================
function Ribbon_onShow() {}
function Ribbon_onMinimize() {}

//=========================================================================================================
// PUBLIC EVENTS
//=========================================================================================================
function Ribbon_onResize() {
  try {
    var self = this;
    self.resizePageContent();

    if (this.timer != null) clearTimeout(this.timer);

    this.timer = setTimeout(function () {
      self.activeTab.render();
      // }, 300);
    }, 0);
  } catch (e) {}
}

//---------------------------------------------------------------------------------------------------------

function RibbonTab(_parent, _position, _id, _name, _content) {
  //public properties
  this.parent = _parent; //link to the parent ribbon
  this.position = _position; //position index
  this.id = _id;
  this.contextID = null;
  this.name = _name; //name of the tab (label)
  this.defaultContent = new Object(); //the default content of the
  this.defaultContent.xml = null; //default XML
  this.defaultContent.controls = new Array(); //default controls
  this.contextContent = []; //context-sensitive list of contents
  this.ownerDocument = this.parent.ownerDocument;
  this.html = new Object(); //helper obejct to hold references to HTML elements
  this.html.cell = null; //this will point to the TD element that contains the tab
  this.groupSizeCombinations = []; //list of all possible group size combinations for the default content
  this.userData = null; //used to attach user data

  //private properties
  this.lastWidth = -1;

  //everything is initialized
  this.buildUserInterface(); //draw the tab
  this.setContent(null, _content); //indicates whether the tab content has been loaded or not
}
//public methods
RibbonTab.prototype.insertGroup = RibbonTab_insertGroup; //inserts a group into the current tab
RibbonTab.prototype.removeGroup = RibbonTab_removeGroup; //removes the specified group from the current tab
RibbonTab.prototype.select = RibbonTab_select; //selects the current tab
RibbonTab.prototype.deselect = RibbonTab_deselect; //deselects the current tab
RibbonTab.prototype.setContent = RibbonTab_setContent; //sets the content of the tab from an XML
RibbonTab.prototype.removeContent = RibbonTab_removeContent; //removes the content asociated with the specified contextID
RibbonTab.prototype.contentLoaded = RibbonTab_contentLoaded; //indicates if the content of the specified contextID is loaded
RibbonTab.prototype.groups = RibbonTab_groups; //returns the group with the specified name from the current tab
RibbonTab.prototype.attachEvent = RibbonTab_attachEvent; //attaches a custom event
RibbonTab.prototype.destructor = RibbonTab_destructor; //TO-DO fully implement RibbonTab method
RibbonTab.prototype.remove = RibbonTab_remove; //removes the current tab from the ribbon
RibbonTab.prototype.setContextID = RibbonTab_setContextID; //sets the current context ID
RibbonTab.prototype.getContextID = RibbonTab_getContextID; //returns the current context ID
RibbonTab.prototype.controls = RibbonTab_controls; //returns the specified control
RibbonTab.prototype.getControls = RibbonTab_getControls; //returns the array of controls associated with the current contextID
RibbonTab.prototype.getUserData = RibbonTab_getUserData; //SL 20070919
RibbonTab.prototype.setUserData = RibbonTab_setUserData; //SL 20070919
RibbonTab.prototype.getAccels = RibbonTab_getAccels; //NC 2007-11-12

//private methods
RibbonTab.prototype.getGroupSizeCombinations =
  RibbonTab_getGroupSizeCombinations; //returns the list of group size combinations for the given context ID
RibbonTab.prototype.buildUserInterface = RibbonTab_buildUserInterface; //builds the tab HTML user interface
RibbonTab.prototype.getContent = RibbonTab_getContent; //combines the default content with the current context content
RibbonTab.prototype.preRender = RibbonTab_preRender; //pre-renders the contents of the current tab, to retrieve the total width of the tab's group(s)
RibbonTab.prototype.render = RibbonTab_render; //draws the contents of the current tab. RibbonTab method is called automatically when you select the current tab
RibbonTab.prototype.applyGroupSizeCombination =
  RibbonTab_applyGroupSizeCombination; //sets the "size" attribute of each group according to the specified group size combination
RibbonTab.prototype.createGroupSizeCombinations =
  RibbonTab_createGroupSizeCombinations; //creates a list of all possible group size combinations for the given XML
RibbonTab.prototype.redrawCustomControls = RibbonTab_redrawCustomControls;
RibbonTab.prototype.destroyControls = RibbonTab_destroyControls;

//public events
RibbonTab.prototype.onSelect = RibbonTab_onSelect; //occurs before the current tab is selected
RibbonTab.prototype.onDeselect = RibbonTab_onDeselect; //occurs before the current tab is deselected
RibbonTab.prototype.onClick = RibbonTab_onClick; //occurs when the user clicks the current tab

//=========================================================================================================
// PUBLIC METHODS
//=========================================================================================================
function RibbonTab_getUserData() {
  //SL 20070919
  return this.userData;
}
function RibbonTab_setUserData(_data) {
  if (this.userData == null)
    //SL 20070919 TODO check
    this.userData = _data;
}

function RibbonTab_getControls(_contextID) {
  if (_contextID == null) return this.defaultContent.controls;
  else {
    if (this.contextContent[_contextID] != null) {
      return this.contextContent[_contextID].controls;
    } else {
      return new Array(); //TODO return null ?
    }
  }
}

function RibbonTab_controls(_ctrlID, _contextID) {
  var i;
  var controls = this.getControls(_contextID);
  var result = null;

  for (i = 0; i < controls.length; i++) {
    if (controls[i].id == _ctrlID) {
      return controls[i];
    }
  }

  //cleanup memory
  controls = null;
  i = null;
  return null;
}

function RibbonTab_insertGroup(_position, _contextID, _content) {}
function RibbonTab_removeGroup(_group) {}
function RibbonTab_select(_userClick) {
  this.lastWidth = -1;
  if (typeof this.onSelect == "function" && this.onSelect(this) == false)
    return false; //if the onSelect function returned false, we stop

  //if the ribbon's state is minimized, show the ribbon
  //TODO - handle the "popup" state
  if (_userClick == true) {
    if (this.parent.state == RibbonState.Minimized) {
      this.parent.showMinimized();
    }
  }

  //updating the user interface
  this.html.cell.className = "selected";

  //draw the contents
  this.render();

  return true;
}

function RibbonTab_deselect() {
  if (typeof this.onDeselect == "function" && this.onDeselect(this) === false)
    return false;

  //updating the user interface
  this.html.cell.className = "";

  //TO-DO hide/destroy contents

  return true;
}

function RibbonTab_setContent(_contextID, _content) {
  if (typeof _content != "string") return false; //if content is null or undefined, return false
  var cID = _contextID == null ? "" : ' contextID="' + _contextID + '"';
  var profile = ' profile="' + getProfile() + '"';
  var content =
    "<data" + cID + profile + ">" + _content.replace(/\'/g, "\\'") + "</data>";
  //transforming modules and processes to ribbon format
  var xml = new XML2();
  xml.loadXML(content);

  //NC 2007-11-09 Reading accels
  var hkManager = getHotKeyManager();
  var nodes = xml.selectNodes('//process[accel != ""]|//module[accel != ""]');
  var i;
  var accels = [];
  var accelObj = null;
  for (i = 0; i < nodes.length; i++) {
    accelObj = hkManager.attachAccel(nodes[i]);
    accelObj.contextID = _contextID;
    accels[accelObj.letter] = accelObj;
  }

  var xmlString = xml.transformNode(
    this.parent.xsl.modulesAndProcessesToButtons
  );
  xml.loadXML(xmlString);

  this.destroyControls(_contextID); //destroying existing controls
  //load custom controls
  //TODO - improve performance

  var ctrlNodes = xml.selectNodes("//control");
  var controls = new Array();
  for (j = 0; j < ctrlNodes.length; j++) {
    controls[controls.length] = new RibbonControl(this, ctrlNodes[j]);
  }

  if (_contextID == null) {
    //setting the default content
    this.defaultContent.xml = xml;
    //resetting the group size combinations
    this.groupSizeCombinations = [];
    //clearing all the cached XMLs from context contents
    for (i in this.contextContent) {
      this.contextContent[i].cachedXML = null;
    }
    //creating group size combinations
    this.groupSizeCombinations = this.createGroupSizeCombinations(
      this.defaultContent.xml
    );
    //assigning new controls
    this.defaultContent.controls = controls;

    this.defaultContent.accels = accels; //NC 2007-11-12
  } else {
    //setting the context-sensitive content
    this.contextContent[_contextID] = new Object();
    this.contextContent[_contextID].xml = xml;
    this.contextContent[_contextID].cachedXML = null;
    this.contextContent[_contextID].groupSizeCombinations = []; //clear the groupSizeCombinations
    //assigning new controls
    this.contextContent[_contextID].controls = controls;

    this.contextContent[_contextID].accels = accels; //NC 2007-11-12
  }
  xml = null; //free memory
  controls = null;

  return true;
}

function RibbonTab_getAccels() {
  if (this.contextID == null) return this.defaultContent.accels;
  else return this.contextContent[this.contextID].accels;
}

function RibbonTab_removeContent(_contextID) {
  if (_contextID == null) {
    this.defaultContent.xml = null; //destroy the default content
  } else {
    this.contextContent[_contextID].xml = null; //destroy the context content
    this.contextContent[_contextID].cachedXML = null; //destroy the cached context content
    this.contextContent[_contextID].groupSizeCombinations = null; //destroy the group size combinations
    this.contextContent.splice(_contextID, 1); //remove the contextID from the hash
  }
}

function RibbonTab_contentLoaded(_contextID) {
  if (_contextID == null) {
    //no context
    if (this.defaultContent.xml == null) return false;
  } else {
    //context-sensitive
    if (this.contextContent[_contextID].xml == null) return false;
  }

  return true;
}

function RibbonTab_groups(_groupName) {}
function RibbonTab_attachEvent(_evtName, _fct) {
  try {
    switch (_evtName) {
      case "onSelect":
        this.onSelect = _fct;
        break;
      case "onDeselect":
        this.onDeselect = _fct;
        break;
    }
  } catch (e) {
    reportError(e);
  }
}

function RibbonTab_remove() {
  this.parent.removeTab(this);
}

function RibbonTab_setContextID(_contextID, _noRender) {
  this.contextID = _contextID;
  if (!_noRender) {
    //NC 2007-11-28
    if (this.parent.activeTab == this) this.render();
  }
}

function RibbonTab_getContextID() {
  return this.contextID;
}

function RibbonTab_destructor() {
  //remove the HTML element
  this.html.cell.parentNode.removeChild(this.html.cell);
}

//=========================================================================================================
// PRIVATE METHODS
//=========================================================================================================
function RibbonTab_destroyControls(_contextID) {
  var i;
  if (_contextID == null) {
    for (i = 0; i < this.defaultContent.controls.length; i++) {
      this.defaultContent.controls[i].destructor();
      this.defaultContent.controls[i] = null;
    }
    this.defaultContent.controls.length = 0;
  } else {
    if (this.contextContent[_contextID] != null) {
      for (i = 0; i < this.contextContent[_contextID].controls.length; i++) {
        this.contextContent[_contextID].controls[i].destructor();
        this.contextContent[_contextID].controls[i] = null;
      }
      this.contextContent[_contextID].controls.length = 0;
    }
  }
  i = null;
}

function RibbonTab_redrawCustomControls(_document, _xml, _prerendering) {
  var groupNodes = _xml.selectNodes("//group");
  var i;
  for (i = 0; i < groupNodes.length; i++) {
    var ctrlNodes = groupNodes[i].selectNodes("box/control");
    var size = getAttributeText(groupNodes[i], "size", 3);
    var j;
    for (j = 0; j < ctrlNodes.length; j++) {
      var contextID = getAttributeText(ctrlNodes[j], "contextID", null);
      var id = getAttributeText(ctrlNodes[j], "id", null);
      var disabled = getAttributeText(ctrlNodes[j], "disabled", false);

      var control = this.controls(id, contextID);
      if (control != null) {
        control.disabled = disabled == "true" ? true : false;
        control.draw(_document, size, _prerendering);
      }
    }
  }
}

function RibbonTab_getGroupSizeCombinations() {
  if (this.contextID == null) return this.groupSizeCombinations;
  else return this.contextContent[this.contextID].groupSizeCombinations;
}

function RibbonTab_applyGroupSizeCombination(_xml, _groupSizes, _index) {
  var groupNodes = _xml.selectNodes("//group");
  var i;
  for (i = 0; i < groupNodes.length; i++) {
    setAttributeText(groupNodes[i], "size", _groupSizes[_index].items[i]);
  }
}

function RibbonTab_getContent() {
  //we don't test if these XMLs are NULL. If they are, someone has done something wrong
  //the defaultContent can't be null and contextContent should not be called for an non existing context ID
  //TO-DO - optimize this method
  //for the default context, return the default content
  if (this.contextID == null) {
    return this.defaultContent.xml; //here we don't have to combine default and context content
  }

  //for a custom context ID, return the cached content
  if (this.contextContent[this.contextID].cachedXML != null) {
    return this.contextContent[this.contextID].cachedXML;
  }

  //if there is no cached content for the custom context ID, create it
  var i;

  //copying the default content's XML
  var result = new XML2();
  result.load("<data/>");
  result.parser.documentElement =
    this.defaultContent.xml.parser.documentElement.cloneNode(true);
  //setting the 'disabled' state 'true' for all buttons
  var buttons = result.selectNodes("//button|//control");
  for (i = 0; i < buttons.length; i++) {
    setAttributeText(buttons[i], "disabled", "true");
  }

  var groupNodes =
    this.contextContent[this.contextID].xml.selectNodes("//group");
  var gIndex;
  for (gIndex = 0; gIndex < groupNodes.length; gIndex++) {
    var boxNode = null;
    var contextNodes = groupNodes[gIndex].selectNodes("box/button|box/control");
    //merging the copied default content's XML with the context content XML
    for (i = 0; i < contextNodes.length; i++) {
      var idNode = contextNodes[i].attributes.getNamedItem("id");
      var attr = "id";
      if (idNode == null) {
        idNode = contextNodes[i].attributes.getNamedItem("label"); //this can throw error if we have button with no label attribute
        attr = "label";
      }
      var id = idNode.text || idNode.textContent;
      var newNode = contextNodes[i].cloneNode(true);
      var node = result.selectSingleNode(
        "//button[@" + attr + '="' + id + '"]|//control[@id="' + id + '"]'
      );
      if (node != null) {
        node.parentNode.replaceChild(newNode, node);
        //setAttributeText(newNode, 'disabled', 'false'); //TO-DO check this. If I uncomment this line, we can't overwrite the behaviour of a button, but still keep it disabled for the moment
      } else {
        //if there is no new group created, create one
        if (boxNode == null) {
          var newGroup = result.parser.createElement("group");
          result.parser.documentElement.appendChild(newGroup);
          var name = groupNodes[gIndex].selectSingleNode("@label");
          if (name != null) setAttributeText(newGroup, "label", name.text);

          boxNode = result.parser.createElement("box");
          newGroup.appendChild(boxNode);
        }

        boxNode.appendChild(newNode);
      }
      setAttributeText(newNode, "contextID", this.contextID);
    }
  }

  //if there was no valid cached XML, the group size combinations for this contextID must be reset
  this.contextContent[this.contextID].groupSizeCombinations = [];
  this.contextContent[this.contextID].cachedXML = result;

  //creating groupSize combinations
  this.contextContent[this.contextID].groupSizeCombinations =
    this.createGroupSizeCombinations(result);

  result = null;

  return this.contextContent[this.contextID].cachedXML;
}

function RibbonTab_preRender(_xml, _groupSizes, _index) {
  this.applyGroupSizeCombination(_xml, _groupSizes, _index);

  var html = _xml.transformNode(this.parent.xsl.tabContent);
  var div =
    this.parent.preRenderFrame.contentWindow.document.getElementById(
      "ribbonBar"
    );
  div.innerHTML = html;

  //pre-rendering custom controls
  this.redrawCustomControls(
    this.parent.preRenderFrame.contentWindow.document,
    _xml,
    true
  );

  _groupSizes[_index].width =
    this.parent.preRenderFrame.contentWindow.document.getElementById(
      "ribbonPageTbl"
    ).scrollWidth; //CHANGED this.parent.preRenderDoc pt IE
}

function RibbonTab_render() {
  this.parent.__mustRedraw = true;
  if (this.parent.state == RibbonState.Minimized) {
    this.parent.checkOverflow(); //if needed, the scroll buttons will be displayed
    return;
  }

  //var start = new Date();
  if (
    this.parent.preRenderFrame.contentWindow.document.readyState != "complete"
    // !this.iframeLoaded
  ) {
    //the iframe used for pre-rendering is not loaded yet
    var self = this;
    //adding this method call to the preRenderQueue
    this.parent.preRenderQueue[this.parent.preRenderQueue.length] =
      function () {
        self.render();
      };
    return;
  }

  var xml = this.getContent();
  var gsc = this.getGroupSizeCombinations();
  var found = false;
  var i;
  for (i = 0; i < gsc.length; i++) {
    if (gsc[i].width == null) {
      this.preRender(xml, gsc, i);
    }

    if (gsc[i].width <= this.parent.parent.offsetWidth) {
      if (gsc[i].width != this.lastWidth) {
        this.lastWidth = gsc[i].width;
        this.applyGroupSizeCombination(xml, gsc, i);

        //draw the ribbon
        var html = xml.transformNode(this.parent.xsl.tabContent);
        this.parent.html.ribbonBar.innerHTML = html;
        html = null;
        this.lastWidth = gsc[i].width;

        this.redrawCustomControls(this.ownerDocument, xml, false);
      }

      found = true;
      break;
    }
  }

  if (!found) {
    if (gsc.length > 0 && gsc[gsc.length - 1].width != this.lastWidth) {
      this.lastWidth = gsc[gsc.length - 1].width;
      //no groupCombination fits the available space
      //rendering the smallest combination
      this.applyGroupSizeCombination(xml, gsc, gsc.length - 1);

      //draw the ribbon
      var html = xml.transformNode(this.parent.xsl.tabContent);
      this.parent.html.ribbonBar.innerHTML = html;
      html = null;

      this.redrawCustomControls(this.ownerDocument, xml, false);
    }
  }

  try {
    //searching relevant html elements
    var self = this.parent;
    this.parent.html.groupScrollLeft = this.ownerDocument.getElementById(
      "ribbonBarScrollLeft"
    );
    this.parent.html.groupScrollRight = this.ownerDocument.getElementById(
      "ribbonBarScrollRight"
    );
    this.parent.html.ribbonPage =
      this.ownerDocument.getElementById("ribbonPage");
    this.parent.html.ribbonPageTbl =
      this.ownerDocument.getElementById("ribbonPageTbl");
    this.parent.html.ribbonPageContainer = this.ownerDocument.getElementById(
      "ribbonPageContainer"
    );

    //assigning events
    this.parent.html.groupScrollLeft.onmouseenter = function () {
      this.className = "hot";
    };
    this.parent.html.groupScrollLeft.onmouseleave = function () {
      self.stopScroll();
      this.className = "";
    };
    this.parent.html.groupScrollRight.onmouseenter = function () {
      this.className = "hot";
    };
    this.parent.html.groupScrollRight.onmouseleave = function () {
      self.stopScroll();
      this.className = "";
    };

    this.parent.html.groupScrollLeft.onmousedown = function () {
      self.scrollGroup("left");
    };
    this.parent.html.groupScrollLeft.onmouseup = function () {
      self.stopScroll();
    };
    this.parent.html.groupScrollRight.onmousedown = function () {
      self.scrollGroup("right");
    };
    this.parent.html.groupScrollRight.onmouseup = function () {
      self.stopScroll();
    };
  } catch (err) {}

  this.parent.checkOverflow(); //if needed, the scroll buttons will be displayed

  //var stop = new Date();
  //var diff = stop.getTime() - start.getTime();
  //alert((diff/1000) + " seconds");
}

function RibbonTab_buildUserInterface() {
  try {
    this.html.cell = this.parent.html.tabsRow.insertCell(this.position);
    this.html.cell.itemType = "RBN_TAB";
    this.html.cell.parentObj = this;

    if (this.selected) {
      this.html.cell.className = "selected";
    }

    var span = this.ownerDocument.createElement("SPAN");
    span.isRibbonElem = "true";
    this.html.cell.appendChild(span);

    var self = this;

    var a = this.ownerDocument.createElement("A");
    a.isRibbonElem = "true";
    a.title = this.name;
    a.href = "javascript:void(0)";
    a.innerHTML = this.name;
    a.onclick = function () {
      self.onClick(true);
      return false;
    };
    span.appendChild(a);
  } catch (e) {
    reportError(e);
  }
}

function RibbonTab_createGroupSizeCombinations(_xml) {
  //get the number of groups in current tab
  var count = _xml.selectNodes("tab/group").length;
  var result = [];

  //creating all possible group size combinations
  var i, j, size, n;
  for (size = 3; size > 0; size--) {
    for (n = count; n > 0; n--) {
      if (!(size == 1 && n != count)) {
        var items = [];
        for (i = 0; i < n; i++) {
          items[items.length] = size;
        }

        for (j = i; j < count; j++) {
          items[items.length] = size - 1;
        }

        var sizeObj = new Object();
        sizeObj.items = items;
        sizeObj.width = null;
        result[result.length] = sizeObj;
      } else break;
    }
  }

  return result;
}

//=========================================================================================================
// PUBLIC EVENTS
//=========================================================================================================
function RibbonTab_onSelect() {}
function RibbonTab_onDeselect() {}
function RibbonTab_onClick(_userClick) {
  this.parent.setActiveTab(this, _userClick);
}

function RibbonQATBtn(_parent, _position, _id, _xml, _contextID) {
  //public properties
  this.parent = _parent;
  this.ownerDocument = this.parent.ownerDocument;
  this.position = _position;
  this.contextID = _contextID || null;
  this.id = _id;
  this.name = "";
  this.img = "";
  this.help = "";
  this.disabled = false;
  this.accel = "";
  this.menu = "";
  this.onbuildFn = null;
  this.action = "";
  this.dependencies = "";
  this.actionType = "";

  //private properties
  this.html = new Object();
  this.html.parentCell = null; //pointer to the html cell that holds the current qat button
  this.html.btn = null; //pointer to the html element that defines the current button

  //public methods
  this.setXML = RibbonQATBtn_setXML;
  this.remove = RibbonQATBtn_remove;
  this.render = RibbonQATBtn_render;
  this.enable = RibbonQATBtn_enable;
  this.disable = RibbonQATBtn_disable;

  //private methods
  this.initInterface = RibbonQATBtn_initInterface;

  //private events
  this.onClick = RibbonQATBtn_onClick;

  //everything is initialized. building the user interface

  this.initInterface();
  this.setXML(_xml);
}

function RibbonQATBtn_initInterface() {
  this.html.parentCell = this.parent.html.qatRow.insertCell(this.position);
}

function RibbonQATBtn_onClick(_sender) {
  if (this.action != "") {
    switch (this.actionType) {
      case "framed-link":
        openFramedLink(this.action, this.dependencies, this.name);
        break;
      case "windowed-link":
        openWindowedLink(this.action, this.dependencies, this.name);
        break;
      case "dialog-link":
        openDialoguedLink(
          this.action,
          true,
          null,
          this.dependencies,
          this.name
        );
        break;
      case "modeless-dialog-link":
        openDialoguedLink(
          this.action,
          false,
          null,
          this.dependencies,
          this.name
        );
        break;
      default:
        this.parent.execute(this.contextID, this.action);
        break;
    }
  }

  if (this.menu != "") {
    this.parent.showMenu(_sender, this.menu, this.contextID, this.onbuildFn);
  }
}

function RibbonQATBtn_setXML(_xml) {
  // var doc = new ActiveXObject("Microsoft.XMLDOM");
  // doc.async = false;
  // doc.loadXML(_xml);
  var parser = new DOMParser();
  var doc = parser.parseFromString(_xml, "text/xml");

  var node = doc.documentElement.selectSingleNode("name");
  if (node != null) this.name = node.text;

  node = doc.documentElement.selectSingleNode("icon");
  if (node != null) this.img = node.text;

  node = doc.documentElement.selectSingleNode("help");
  if (node != null) this.help = node.text;

  node = doc.documentElement.selectSingleNode("disabled");
  if (node != null) this.disabled = node.text == "true" ? true : false;

  node = doc.documentElement.selectSingleNode("accel");
  if (node != null) this.accel = node.text;

  node = doc.documentElement.selectSingleNode("src");
  if (node != null) this.action = node.text;

  node = doc.documentElement.selectSingleNode("@dependencies");
  if (node != null) this.dependencies = node.text;

  node = doc.documentElement.selectSingleNode("src/@type");
  if (node != null) this.actionType = node.text;

  //building the menu for the module nodes
  if (doc.documentElement.nodeName == "module") {
    //read the onbuild function
    node = doc.documentElement.selectSingleNode("@onbuild");
    if (node != null) this.onbuildFn = node.text;

    //build the menu
    this.menu = "";
    var menuNodes = doc.documentElement.selectNodes("process|module");
    var menuNode = null;
    while ((menuNode = menuNodes.nextNode()) != null) {
      this.menu += menuNode.xml;
    }
  }

  this.render();
}

function RibbonQATBtn_remove() {
  this.parent.__qat.splice(this.position, 1);
  this.parent.updateQATPositions(this.position);

  this.parent.html.qatRow.deleteCell(this.position);
}

function RibbonQATBtn_render() {
  var self = this;

  if (this.html.btn != null) this.html.parentCell.removeChild(this.html.btn);

  this.html.btn = this.ownerDocument.createElement("TABLE");
  this.html.btn.cellPadding = 0;
  this.html.btn.cellSpacing = 0;
  this.html.btn.className = "rbnSmallButton";
  if (this.disabled == false) {
    this.html.btn.onmouseenter = function () {
      this.className = "rbnSmallButton_hot";
    };
    this.html.btn.onmouseleave = function () {
      this.className = "rbnSmallButton";
    };
    this.html.btn.onmousedown = function () {
      this.className = "rbnSmallButton_down";
    };
    this.html.btn.onmouseup = function () {
      this.className = "rbnSmallButton_hot";
    };
    this.html.btn.onclick = function () {
      self.onClick(this);
    };
  }

  if (this.help != "") {
    this.html.btn.title = this.help;
  } else {
    this.html.btn.title = this.name;
  }

  var row = this.html.btn.insertRow(-1);
  var leftCell = row.insertCell(-1);
  leftCell.className = "rbnSmallButton_left";
  leftCell.innerHTML = "&nbsp;";

  var mainCell = row.insertCell(-1);
  mainCell.className = "rbnSmallButton_content";

  var rightCell = row.insertCell(-1);
  rightCell.className = "rbnSmallButton_right";
  rightCell.innerHTML = "&nbsp;";

  var contentTable = this.ownerDocument.createElement("TABLE");
  contentTable.cellPadding = 0;
  contentTable.cellSpacing = 0;
  mainCell.appendChild(contentTable);

  var contentRow = contentTable.insertRow(-1);
  var contentCell = contentRow.insertCell(-1);
  if (this.disabled) contentCell.className = "disabled";

  var img = this.ownerDocument.createElement("IMG");
  img.style.width = "20px";
  img.style.height = "20px";
  img.src = "graphics/" + this.img + "_small.gif";
  contentCell.appendChild(img);

  if (this.accel != "") {
    var panel = this.ownerDocument.createElement("DIV");
    panel.className = "shortCutPanel";
    var shortcut = this.ownerDocument.createElement("DIV");
    shortcut.className = "shortCut";
    shortcut.innerHTML = this.accel;

    panel.appendChild(shortcut);
    contentCell.appendChild(panel);
  }

  if (this.menu != "") {
    var arrowCell = contentRow.insertCell(-1);
    arrowCell.className = "mediumBtnArrow";
    arrowCell.innerHTML = "&nbsp;";
  }

  this.html.parentCell.appendChild(this.html.btn);
}

function RibbonQATBtn_enable() {
  this.disabled = false;
  this.render();
}

function RibbonQATBtn_disable() {
  this.disabled = true;
  this.render();
}

/*
//---------------------------------------------------------------------------------------------------------

function RibbonGroup(_parent, _contextID, _name, _help, _content) {
    //public properties
    this.parent = _parent; //link to parent tab
    this.contextID = _contextID; //contextID
    this.name = _name; //name of the group (label)
    this.help = help; //text to be displayed when the user moves the mouse above the group
    this.content = _content; //XML representation of the group's contents

    //public methods
    this.insertBox = RibbonGroup_insertBox; //inserts a box in the current group
    this.removeBox = RibbonGroup_removeBox; //removes the specified box from the current group
    this.insertSeparator = RibbonGroup_insertSeparator; //inserts a separator in the current group
    this.removeSeparator = RibbonGroup_removeSeparator; //removes the specified separator from the current group
    this.insertButton = RibbonGroup_insertButton; //inserts a button in the current group
    this.removeButton = RibbonGroup_removeButton; //removes the specified button from the current group
    this.buttons = RibbonGroup_buttons; //returns the button with the specified name from the current group
}

//=========================================================================================================
// PUBLIC METHODS
//=========================================================================================================
function RibbonGroup_insertBox(_position, _contextID, _content) { }
function RibbonGroup_removeBox(_box) { }
function RibbonGroup_insertSeparator(_position, _contextID) { }
function RibbonGroup_removeSeparator(_separator) { } 
function RibbonGroup_insertButton(_position, _contextID, _content) { }
function RibbonGroup_removeButton(_button) { }






//---------------------------------------------------------------------------------------------------------

function RibbonButton(_parent, _contextID, _name, _icon, _help, _menu) {
    //public properties
    this.parent = _parent;
    this.contextID = _contextID;
    this.name = _name;
    this.icon = _icon;
    this.help = _help;
    this.menu = _menu;

    //public methods
    this.enable = RibbonButton_enable;
    this.disable = RibbonButton_disable;
    this.execute = RibbonButton_execute;
}

//=========================================================================================================
// PUBLIC METHODS
//=========================================================================================================
function RibbonButton_enable() { }
function RibbonButton_disable() { }
function RibbonButton_execute() { }






//---------------------------------------------------------------------------------------------------------
/* NOT USED YET 

    // too complex, we'll have 1 box / group created automatically by the group

function RibbonBox() {
    //public methods
    this.insertButton = RibbonBox_insertButton;
    this.removeButton = RibbonBox_removeButton;
}

// PUBLIC METHODS
function RibbonBox_insertButton(_position, _contextID, _content) { }
function RibbonBox_removeButton(_button) { }
*/

//=========================================================================================================
// RibbonControl
//=========================================================================================================
function RibbonControl(_parent, _ctrlNode) {
  //public properties
  this.parent = _parent;
  this.ownerDocument = this.parent.ownerDocument;
  this.id = getAttributeText(_ctrlNode, "id", null);
  this.html = new Object();
  this.html.container = null;
  this.onDrawFn = getAttributeText(_ctrlNode, "onDraw", null);
  this.width = []; //array of width for different group sizes
  this.disabled = false;
  var node = _ctrlNode.selectSingleNode("@disabled");
  if (node != null && node.value == "true") this.disabled = true;

  //public methods
  this.appendChild = RibbonControl_appendChild;
  this.destructor = RibbonControl_destructor;

  //private methods
  this.init = RibbonControl_init;
  this.draw = RibbonControl_draw;
}

//=========================================================================================================
// PUBLIC METHODS
//=========================================================================================================
function RibbonControl_destructor() {
  this.parent = null;
  this.ownerDocument = null;
  this.groupIndex = null;
  this.id = null;
  this.html.container = null;
  this.html = null;
  this.onDrawFn = null;
  this.width = null;
  this.disabled = null;
  this.setWidth = null;
  this.appendChild = null;
  this.setNode = null;
  this.destructor = null;
  this.init = null;
  this.draw = null;
}

function RibbonControl_appendChild(_child, _prerendering) {
  var elem = this.html.container.appendChild(_child);
  //assigning a custom attribute to all the controls added, for the "popup" state of the ribbon

  if (elem != null && !_prerendering) {
    if (elem.itemType == null) {
      elem.itemType = "RBN_CC";
    }
    markElements(elem);
  }
}

function markElements(_elem) {
  //TODO check if null and node type? //if (_elem == null) return; if (_elem.nodeType != 1) return;
  try {
    _elem.isRibbonElem = "true";
  } catch (e) {}

  if (
    _elem.onmouseover != null ||
    _elem.onmouseout != null ||
    _elem.onclick != null ||
    _elem.onmousedown != null ||
    _elem.onmouseup != null
  ) {
    _elem.itemType = "RBN_CC";
  }

  var i;
  for (i = 0; i < _elem.childNodes.length; i++) {
    if (_elem.childNodes[i].nodeType == 1)
      //only element nodes (not text nodes).
      markElements(_elem.childNodes[i]);
  }
}

//=========================================================================================================
// PRIVATE METHODS
//=========================================================================================================
function RibbonControl_init(_document) {
  this.ownerDocument = _document;
  this.html.container = this.ownerDocument.getElementById(this.id);
}

function RibbonControl_draw(_document, _size, _prerendering) {
  this.init(_document);
  if (this.html.container) {
    this.html.container.innerHTML = "";
    var evalFn = this.parent.parent.getEvalFn(this.id);
    evalFn(this.onDrawFn, this, _size, _prerendering);
  }
}

//====================================================================================================
// PUBLIC GLOBALS
//====================================================================================================
var UI = {
  createSmallBtn: UI_createSmallBtn,
};

function UI_createSmallBtn(_document, _icon, _help, _onclickFn, _disabled) {
  var btn = _document.createElement("DIV");
  btn.className = "officeBtnSmall";
  btn.title = _help;

  var img = _document.createElement("IMG");
  img.src = "graphics/" + _icon + ".gif";
  btn.appendChild(img);

  if (_disabled) {
    btn.disabled = true;
  }

  btn.onmouseover = function () {
    if (!this.disabled) this.className = "officeBtnSmall_hot";
  };
  btn.onmouseout = function () {
    if (!this.disabled) this.className = "officeBtnSmall";
  };
  btn.onmousedown = function () {
    if (!this.disabled) this.className = "officeBtnSmall_down";
  };
  btn.onmouseup = function () {
    if (!this.disabled) this.className = "officeBtnSmall_hot";
  };
  btn.onclick = _onclickFn;

  btn.enable = function () {
    this.parentNode.style.display = "block";
    this.disabled = false;
  };

  btn.disable = function () {
    this.parentNode.style.display = "none";
    this.className = "officeBtnSmall";
    this.disabled = true;
  };

  return btn;
}

function RibbonBtn_helpClick() {
  //TODO implement
  //alert('HELP');
}

function RibbonBtn_closeClick() {
  //TODO implement
  var appTabs = getAppTabs();
  appTabs.tabsBar.removeTab(appTabs.tabsBar.currentTab);
}

/*======================================================================================================*/
/* NC 2008-01-23 */
/* ------------- */
/*   RibbonBTN   */
/*======================================================================================================*/
function RibbonBTN(_parent, _id, _view) {
  this.parent = _parent; //reference to the parent ribbon control
  this.id = _id; //the button's ID
  this.view = _view; //reference to the HTML element representing the current state of the button
  //THIS "VIEW" IS TEMPORARY AND WILL CHANGE AT NEXT ribbon.render() CALL
  if (this.view != null) {
    this.size = this.view.getAttributeNode("size").value;
  }

  //public methods
  this.setImage = RibbonBTN_setImage;
}

/**
 * Limitations: the new image is assigned to the current contextID only which means that
 *              setting the image on the default contextID (null) will update all the contextual xml's
 *              because they are merged with the default xml, but changing the image on a contextual xml
 *              will only be changed for that specific contextID
 **/
function RibbonBTN_setImage(_newImage) {
  try {
    //change the image in the internal XML
    //the XML is of type XML2, so to access the real XML document, use the xmlDoc.parser
    var xmlDoc;
    var cachedXML;
    if (this.parent.activeTab.contextID == null) {
      xmlDoc = this.parent.activeTab.defaultContent.xml;

      //if the default XML is set, clear the contextual XMLs because they don't have the new image assigned
      //and they will be rebuild on-demand
      for (i in this.parent.activeTab.contextContent) {
        this.parent.activeTab.contextContent[i].cachedXML = null;
      }
      //TODO replace in all cached XMLs?
    } else {
      xmlDoc =
        this.parent.activeTab.contextContent[this.parent.activeTab.contextID]
          .xml;
      cachedXML =
        this.parent.activeTab.contextContent[this.parent.activeTab.contextID]
          .cachedXML;
    }

    var btnNode = xmlDoc.parser.selectSingleNode(
      '//button[@id="' + this.id + '"]'
    );
    setAttributeText(btnNode, "icon", _newImage);
    btnNode = null;

    if (cachedXML != null) {
      var btnNode = cachedXML.parser.selectSingleNode(
        '//button[@id="' + this.id + '"]'
      );
      setAttributeText(btnNode, "icon", _newImage);
      btnNode = null;
    }

    //visually change the image
    var img = this.parent.ownerDocument.getElementById("rbnIMG_" + this.id);
    var size = "large";
    if (this.size != "large") size = "small";
    img.src = "graphics/" + _newImage + "_" + size + ".gif";
    //try to avoid memory leaks
    img = null;

    return true;
  } catch (e) {
    return false;
  }
}

var cachedRibbon = null;
function getRibbon() {
  if (cachedRibbon == null) cachedRibbon = new Ribbon(document);
  return cachedRibbon;
}

function getProfile() {
  return "";
}

//NC 2007-11-09
var __hkManager = null;
function getHotKeyManager() {
  if (__hkManager == null) __hkManager = new HotKeyManager();
  return __hkManager;
}
