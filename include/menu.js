//========================================================
// Copyright iBiZa UK Ltd 2000-2001 - www.ibizasoftware.com
// version 1.0
//========================================================

var menu_currentMenu = null;

function menuItem(
  name,
  onclickFn,
  _help,
  _icon,
  _disabled,
  _closeMenuOnClick,
  _evalFn,
  _accel
) {
  this.name = name;
  this.onclickFn = onclickFn;
  this.help = null;
  this.icon = "";
  this.closeMenuOnClick = true; // SL 21-04
  this.onbuild = null;
  if (typeof _help != "undefined") this.help = _help;
  if (typeof _icon != "undefined") this.icon = _icon;
  // SL 21-04
  if (typeof _closeMenuOnClick != "undefined" && _closeMenuOnClick != null)
    //NC 2007-08-14
    this.closeMenuOnClick = _closeMenuOnClick;
  //SL 14-06
  this.evalFn = _evalFn || null;
  this.disabled = false;
  if (typeof _disabled != "undefined") this.disabled = _disabled;
  this.accel = _accel || ""; //NC 2007-11-09
}
menuItem.prototype.onclick = Item_OnClick;

function Item_OnClick() {
  if (this.onclickFn == null) return;

  if (this.disabled) return;

  if (typeof this.onclickFn == "function") this.onclickFn(this);
  else {
    var src = this.onclickFn;
    if (src.indexOf("(") == -1) {
      if (this.evalFn != null)
        //SL 14-06 add evalFn
        this.evalFn(src, this);
      else eval(src + "(this);");
    } else {
      if (this.evalFn != null) this.evalFn(src);
      else eval(src);
    }
  }
}

//===================================================
// PopUp Menu
//===================================================
function popUpMenu(
  _interface,
  _items,
  _left,
  _top,
  callbackFct,
  callbackArgs,
  _evalFn,
  _noCapture
) {
  //NC 2007-05-16
  this.callbackFct = callbackFct;
  this.callbackArgs = callbackArgs;
  this.evalFn = _evalFn;

  if (menu_currentMenu != null) menu_currentMenu.hide();
  menu_currentMenu = this;
  this.menu = new menu(_interface, _items, _interface.body, true);
  this.menu.popUp = true;
  this.popUp = true;
  this.menu.table.style.position = "absolute";
  var scrollDiv = false;
  var top = _top;
  var left = _left;
  var newTop = null;
  var newLeft = null;
  //left
  var winW = _interface.body.clientWidth;
  var tableW = this.menu.table.offsetWidth;
  var wLeft = null;
  if (left + tableW > winW) {
    //left = left - tableW;
    left = left - (left + tableW - winW); //NC 2007-05-14
    if (left < 0) {
      left = _left;
      wLeft = winW - _left;
      scrollDiv = true;
    }
  }

  //top
  var winH = _interface.body.clientHeight;
  var tableH = this.menu.table.offsetHeight;
  var hLeft = null;
  if (top + tableH > winH) {
    top = top - tableH;
    if (top < 0) {
      hLeft = winH - _top;
      if (_top > hLeft) {
        top = 0;
        hLeft = _top;
      } else {
        top = _top;
        hLeft = winH - _top;
      }
      scrollDiv = true;
    }
  }

  if (scrollDiv) {
    this.menu.hasScroll = true;
    var parentMenuDiv = this.menu.div.parentElement;
    if (hLeft != null) {
      parentMenuDiv.style.height = hLeft;
      if (wLeft == null) parentMenuDiv.style.width = tableW;
    }
    if (wLeft != null) {
      parentMenuDiv.style.width = wLeft;
      if (hLeft == null) parentMenuDiv.style.height = tableH;
    }
    this.menu.div.style.overflow = "hidden";
    this.menu.div.style.height = hLeft - 40;
    parentMenuDiv.style.top = top;
    parentMenuDiv.style.left = left;
    parentMenuDiv.style.position = "absolute";

    var navUpElt = _interface.createElement(
      '<TABLE cellspacing="0" cellpadding="0" width="100%"></TABLE>'
    );
    var navUpEltRow = navUpElt.insertRow(-1);
    var navUpEltCell = navUpEltRow.insertCell(-1);
    navUpEltCell.align = "center";
    var navUpEltSpan = _interface.createElement("SPAN");
    navUpEltSpan.className = "menuItemOff";
    navUpEltSpan.style.border = "2px outset #EBEBEB";
    navUpEltSpan.style.width = "100%";
    navUpEltSpan.style.verticalAlign = "middle";
    navUpEltSpan.onmouseover = popUpMenu_scrollUp;
    navUpEltSpan.onmouseout = popupMenu_stop_scroll; //NC 2007-12-11
    navUpEltSpan.scrollUp = true;
    navUpEltSpan.innerHTML =
      '<img scrollUp="true" style="verticalAlign:middle;" src="graphics/up_arrow.gif"/>';
    navUpEltCell.appendChild(navUpEltSpan);

    var navDownElt = _interface.createElement(
      '<TABLE cellspacing="0" cellpadding="0" width="100%"></TABLE>'
    );
    var navDownEltRow = navDownElt.insertRow(-1);
    var navDownEltCell = navDownEltRow.insertCell(-1);
    navDownEltCell.align = "center";
    var navDownEltSpan = _interface.createElement("SPAN");
    navDownEltSpan.style.top = hLeft - 20;
    navDownEltSpan.style.left = 0;
    navDownEltSpan.style.position = "absolute";
    navDownEltSpan.className = "menuItemOff";
    navDownEltSpan.style.border = "2px outset #EBEBEB";
    navDownEltSpan.style.width = "100%";
    navDownEltSpan.style.verticalAlign = "middle";
    navDownEltSpan.scrollDown = true;
    navDownEltSpan.onmouseover = popUpMenu_scrollDown;
    navDownEltSpan.onmouseout = popupMenu_stop_scroll; //NC 2007-12-11
    navDownEltSpan.innerHTML =
      '<img scrollDown="true" style="verticalAlign:middle;" src="graphics/down_arrow.gif"/>';
    navDownEltCell.appendChild(navDownEltSpan);

    this.menu.div.parentElement.insertAdjacentElement("afterBegin", navUpElt);
    this.menu.div.parentElement.insertAdjacentElement("beforeEnd", navDownElt);
  } else {
    this.menu.table.style.left = left;
    this.menu.table.style.top = top;
  }

  this.div = this.menu.div;
  this.div.id = "menu_popUpMenuDivID";

  if (_noCapture != true) {
    this.div.setCapture(true);
  }
}
popUpMenu.prototype.hide = popUpMenu_Hide;
popUpMenu.prototype.build = popUpMenu_Build;

//NC 2007-12-11 BEGIN
var menuScrollTimer = null;

function popupMenu_do_scroll_up(_el) {
  _el.scrollTop -= 8;
  if (_el.scrollTop <= 0) popupMenu_stop_scroll();
}

function popupMenu_do_scroll_down(_el) {
  _el.scrollTop += 8;
  if (_el.scrollTop + _el.offsetHeight >= _el.scrollHeight) {
    popupMenu_stop_scroll();
  }
}

function popupMenu_stop_scroll() {
  window.clearInterval(menuScrollTimer);
}
//NC 2007-12-11 END

function popUpMenu_scrollUp() {
  popupMenu_stop_scroll();
  var _event = getEvent();
  if (_event == null) return;
  var elt = _event.srcElement;
  while (elt.tagName != "DIV") elt = elt.parentElement;
  var menuDiv = elt.children[1];
  //menuDiv.scrollTop -= 10;
  menuScrollTimer = window.setInterval(function () {
    popupMenu_do_scroll_up(menuDiv);
  }, 50); //NC 2007-12-11
}

function popUpMenu_scrollDown() {
  popupMenu_stop_scroll();
  var _event = getEvent();
  if (_event == null) return;
  var elt = _event.srcElement;
  while (elt.tagName != "DIV") elt = elt.parentElement;
  var menuDiv = elt.children[1];
  //menuDiv.scrollTop += 10;
  menuScrollTimer = window.setInterval(function () {
    popupMenu_do_scroll_down(menuDiv);
  }, 50); //NC 2007-12-11
}

function popUpMenu_Hide() {
  menu_currentMenu = null;
  if (this.div == null) return;

  this.div.releaseCapture();

  if (this.div.parentNode != null) this.div.parentNode.removeNode(true);

  //NC 2007-05-15
  try {
    this.callbackFct(this.callbackArgs);
  } catch (e) {}
}

function popUpMenu_Build() {
  this.menu.build();
}

//===================================================
// Menu
//===================================================
function menu(_interface, _items, _view, _popUp) {
  this.interface = _interface;

  this.div = this.interface.createElement("DIV");
  this.div.onclick = menuClick;
  this.div.onmouseover = menuItemOn;
  this.div.onmouseout = menuItemOff;

  this.popUp = false;
  if (menu.arguments.length > 3) this.popUp = _popUp;

  if (!this.popUp) {
    this.div.style.overflow = "hidden"; //SL 16-12
    this.div.style.height = "100%"; //SL 16-12
    this.div.style.width = "100%"; //SL 16-12
  }

  this.table = this.build(_items, this.div, false);
  this.table.style.display = "block";

  if (this.popUp) {
    var div = this.interface.createElement("DIV");
    div.appendChild(this.div);
    _view.appendChild(div);
  } else _view.appendChild(this.div);
}
menu.prototype.hide = menu_Hide;
menu.prototype.build = menu_Build;
//do not forget to maintain popUpMenu prototype

function menu_Hide() {
  this.table.style.display = "none";
}

function menu_Build(items, view, submenu, parentRow) {
  try {
    //NC 2007-12-06 - adds an empty item if the menu has no items
    if (items.length == 0) {
      items = new Array();
      items[0] = new menuItem(translate("Empty"), "", "", "pixel", true, false);
    }

    var table = this.interface.createElement("TABLE");
    table.style.display = "none";
    table.cellSpacing = 0;
    table.cellPadding = 0;
    table.className = this.popUp ? "popUpMenu" : "menu";
    table.openedMenuRow = null;
    table.currentChildTableItem = null;
    if (typeof parentRow != "undefined") table.parentRow = parentRow;

    view.appendChild(table);
    var isSubmenu = false;
    if (typeof submenu != "undefined") isSubmenu = submenu;

    var nbItem = items.length;
    for (var i = 0; i < nbItem; i++) {
      var curItem = items[i];
      var row = table.insertRow(-1);

      row.item = curItem;
      row.table = table;
      row.childTable = null;
      row.div = view;
      row.menu = this;
      row.childRow = null;
      row.disabled = curItem.disabled; //NC 2007-11-05

      if (isSubmenu) {
        var cellTreeIcon = row.insertCell(-1);
        cellTreeIcon.MenuRow = row;
        cellTreeIcon.id = "cellTreeIconId";
        cellTreeIcon.style.paddingLeft = 5;
        cellTreeIcon.style.paddingTop = 0;
        cellTreeIcon.style.paddingBottom = 0;
        cellTreeIcon.style.paddingRight = 0;
        cellTreeIcon.style.width = 15;
        cellTreeIcon.style.height = 20;
        cellTreeIcon.innerHTML = "&nbsp;";
      }

      var cellIcon = row.insertCell(-1);
      cellIcon.MenuRow = row;
      var cell = row.insertCell(-1);
      cell.MenuRow = row;
      cell.verticalAlign = "top";
      var cellImg = row.insertCell(-1);
      cellImg.MenuRow = row;

      if (curItem.name == "-") {
        row.className = "menuItemSeparator";
        row.height = 20;
        row.onclick = null;

        var line = this.interface.createElement("HR");
        line.MenuRow = row;
        cell.appendChild(line);

        cell.className = "txtCell"; //NC 2007-05-11
        cellIcon.className = "imgCell"; //NC 2007-05-11
        cellIcon.innerHTML = "&nbsp;"; //NC 2007-05-11
      } else {
        row.height = 20;
        row.className = this.popUp ? "popUpMenuItemOff" : "menuItemOff";
        //15-03
        if (isSubmenu) {
          var iconTree = this.interface.createElement("SPAN");
          iconTree.style.padding = 0;
          iconTree.style.height = 20;
          iconTree.style.borderLeft = "1px solid #dedede";
          iconTree.style.width = 10;
          iconTree.style.visibility = "hidden";
          cellTreeIcon.appendChild(iconTree);
          row.iconTree = iconTree;
        }
        if (curItem.icon == "") {
          var iconInCell = this.interface.createElement("SPAN");
          iconInCell.style.width = 19;
          iconInCell.style.height = 19;
          iconInCell.innerHTML = "&nbsp;";
        } else {
          var iconInCell = this.interface.createElement("IMG");
          iconInCell.src = "graphics/" + curItem.icon + ".gif";
          iconInCell.height = 19;
          iconInCell.width = 19;
        }
        iconInCell.MenuRow = row;
        cellIcon.style.align = "top";
        cellIcon.appendChild(iconInCell);

        if (typeof curItem.src != "undefined")
          cell.innerHTML =
            '<a href="javascript:' + curItem.src + '">' + curItem.name + "</a>";
        else cell.innerHTML = curItem.name;
        if (curItem.help != null && curItem.help.length > 0)
          cell.title = curItem.help;
        else cell.title = curItem.name;

        cell.className = "txtCell";
        cellIcon.className = "imgCell";
        cell.noWrap = true;

        if (curItem.length || curItem.onbuild != null) {
          var dropdownImg = this.interface.createElement("IMG");
          dropdownImg.src = "graphics/tree_arrow.gif";
          dropdownImg.MenuRow = row;
          cellImg.appendChild(dropdownImg);

          if (curItem.onbuild == null) {
            if (this.popUp) row.childTable = this.build(curItem, view);
            else row.childTable = this.build(curItem, view, true);
          } else {
            row.onbuild = curItem.onbuild;
            if (!this.popUp) {
              var rowChild = table.insertRow(-1);
              rowChild.style.display = "none";
              if (isSubmenu) cellTreeIcon = rowChild.insertCell(-1); //15-03
              var cellChild = rowChild.insertCell(-1);
              cellChild.colSpan = 3;
              rowChild.cell = cellChild;
              row.childRow = rowChild;
            }
          }
          row.cell = cell;

          row.dropdownImg = dropdownImg;
          if (row.childTable != null) {
            row.childTable.style.display = "none";
            if (!this.popUp) {
              var rowChild = table.insertRow(-1);
              rowChild.style.display = "none";
              if (isSubmenu) cellTreeIcon = rowChild.insertCell(-1); //15-03
              var cellChild = rowChild.insertCell(-1);
              cellChild.colSpan = 3;
              rowChild.cell = cellChild;
              cellChild.appendChild(row.childTable);
              row.childRow = rowChild;
            }
          }
        } else cell.innerHTML += ""; //"..."; //NC 2007-09-20
      }
    }
    return table;
  } catch (exception) {
    reportError(exception);
  }
  return null;
}

function menuItemOn() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  if (typeof _event.srcElement.scrollUp != "undefined") {
    popUpMenu_scrollUp();
    return;
  }
  if (typeof _event.srcElement.scrollDown != "undefined") {
    popUpMenu_scrollDown();
    return;
  }
  var row = _event.srcElement.MenuRow;

  //TODO stop event if item is separator
  if (row == null || row.className == "menuItemSeparator" || row.item.disabled)
    return;

  row.className = row.menu.popUp ? "popUpMenuItemOn" : "menuItemOn";
  //SL 14-04
  if (row.iconTree != null)
    row.iconTree.parentElement.style.backgroundColor = "transparent";

  //keep old mode for popUp menu
  if (row.menu.popUp) {
    var openedRow = row.table.openedMenuRow;
    if (openedRow != null && openedRow.childTable != row.childTable) {
      while (openedRow != null) {
        openedRow.table.openedMenuRow = null;
        openedRow.className = row.menu.popUp
          ? "popUpMenuItemOff"
          : "menuItemOff";
        openedRow.childTable.style.display = "none";
        if (
          typeof row.menu.hasScroll != "undefined" &&
          row.menu.hasScroll != null &&
          row.menu.hasScroll == true
        ) {
          openedRow.menu.div.style.width =
            parseInt(openedRow.menu.div.style.width, 10) -
            openedRow.offsetWidth; //cs 2005-12-07
        }
        openedRow.dropdownImg.src = "graphics/tree_arrow.gif";
        openedRow = openedRow.childTable.openedMenuRow;
      }
      row.table.openedMenuRow = null;
    }

    if (row.onbuild && row.childTable == null) {
      row.menu.interface.body.style.cursor = "wait"; //SL 28-04
      var src = row.onbuild + "(row.item)";
      eval(src);
      if (row.item != null)
        row.childTable = row.menu.build(row.item, row.div, false, row); //SL 21-04
      row.menu.interface.body.style.cursor = "default"; //SL 28-04
    }
    if (row.childTable != null && row.childTable.style.display != "block") {
      var rowPos = compute_element_Coordinates(row);
      //cs 2005-12-07 begin
      var menuDiv = row;
      while (menuDiv.id != "menu_popUpMenuDivID" && menuDiv.tagName != "body") {
        menuDiv = menuDiv.parentElement;
      }

      if (menuDiv.tagName != "body") {
        if (
          typeof row.menu.hasScroll != "undefined" &&
          row.menu.hasScroll != null &&
          row.menu.hasScroll == true
        ) {
          var rowPosDiv = compute_element_Coordinates(row.offsetParent);
          row.childTable.style.left =
            rowPos.x - (rowPosDiv.x - row.offsetParent.offsetWidth);
          row.childTable.style.top =
            rowPos.y -
            (rowPosDiv.y - row.offsetParent.offsetHeight) -
            row.offsetHeight;

          var newWidth = menuDiv.offsetWidth + row.offsetWidth;

          menuDiv.style.width = newWidth;
        } else {
          row.childTable.style.left = rowPos.x;
          row.childTable.style.top = rowPos.y - row.offsetHeight;
        }
        row.childTable.style.display = "block";
      }
      //cs end
      //SL 14-04-03
      row.childTable.className = "popUpChildMenu";
      row.style.display = "block";
      row.table.openedMenuRow = row;
    }
  }
}

function menuItemOff() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  if (
    typeof _event.srcElement.scrollUp != "undefined" ||
    typeof _event.srcElement.scrollDown != "undefined"
  ) {
    popupMenu_stop_scroll();
    return;
  }

  var row = _event.srcElement.MenuRow;

  //TODO stop event if item is separator
  if (row == null || row.className == "menuItemSeparator" || row.item.disabled)
    return;

  if (row.table.openedMenuRow != row) {
    row.className = row.menu.popUp ? "popUpMenuItemOff" : "menuItemOff";
    //SL 14-04
    if (row.iconTree != null)
      row.iconTree.parentElement.style.backgroundColor = "";
  }
  if (
    row.childTable != null &&
    row.childTable.style.display == "none" &&
    !row.menu.popUp
  ) {
    row.className = "menuItemOff";
    //SL 14-04
    if (row.iconTree != null)
      row.iconTree.parentElement.style.backgroundColor = "";
  }
}

function menuClick() {
  var _event = getEvent();
  if (_event == null || _event.srcElement == null) return;

  var row = _event.srcElement.MenuRow;
  if (row != null) {
    if (!row.menu.popUp) {
      var openedRow = row.table.openedMenuRow;
      if (openedRow != null && openedRow.childTable != row.childTable) {
        while (openedRow != null) {
          openedRow.className = row.menu.popUp
            ? "popUpMenuItemOff"
            : "menuItemOff";
          openedRow.childTable.style.display = "none";
          menu_treeImgHide(openedRow); //SL 17-03

          if (openedRow.childRow != null)
            openedRow.childRow.style.display = "none"; //SL 17-03

          openedRow.dropdownImg.src = "graphics/tree_arrow.gif";
          openedRow = openedRow.childTable.openedMenuRow;
        }
        row.table.openedMenuRow = null;
      }

      //SL 02-07
      if (
        row.onbuild &&
        (row.childTable == null ||
          (row.childTable != null && row.childTable.style.display != "block"))
      ) {
        var oldChildTable = null;
        if (row.childTable != null) oldChildTable = row.childTable;

        var currentTable = row.offsetParent;
        menu_treeImgHide(row, currentTable);
        if (row.item != null) {
          while (row.item.length > 0) row.item.pop();
        }
        //SL 1-11
        var rebuild = null;
        if (typeof row.onbuild == "function") rebuild = row.onbuild(row.item);
        else {
          var src = row.onbuild + "(row.item)"; //SL 10-02-03;
          rebuild = eval(src);
        }
        //SL end
        if (typeof rebuild == "undefined") rebuild = true;
        if (rebuild && row.item != null) {
          row.childTable = row.menu.build(row.item, row.div, true); //SL 17-03
          if (row.childTable != null) {
            if (oldChildTable != null)
              oldChildTable.replaceNode(row.childTable);
            else row.childRow.cell.appendChild(row.childTable);
          }
        }
      }

      if (row.childTable != null && row.childTable.style.display != "block") {
        //SL 17-03
        if (row.iconTree != null) {
          var parentElt = row.table;
          menu_treeImgShow(row, parentElt);
        }

        var tabRow = row.childRow;
        if (tabRow != null) {
          if (tabRow.style.display == "none") tabRow.style.display = "block";
          tabRow.height = row.offsetHeight + row.childTable.offsetHeight;
          tabRow.cell.appendChild(row.childTable);
          row.className = "menuItemOn";
          //SL 14-04
          if (row.iconTree != null)
            row.iconTree.parentElement.style.backgroundColor = "transparent";
        }

        row.childTable.style.position = "relative";
        row.dropdownImg.src = "graphics/tree_arrow_open.gif";
        row.childTable.className = "childMenu";
        row.childTable.style.display = "block";
        row.table.openedMenuRow = row;
      } else {
        if (row.childTable != null && row.childTable.style.display == "block") {
          row.childTable.style.display = "none";

          menu_treeImgHide(row); //SL 17-03

          var tabRow = row.childRow;
          if (tabRow != null) tabRow.style.display = "none";
          row.dropdownImg.src = "graphics/tree_arrow.gif";
        }
      }
    }

    //TODO stop event if item is separator. close menu if user clicks outside.

    if (row.className == "menuItemSeparator" || row.childTable != null) return;

    //SL 17-03
    if (!row.menu.popUp) menu_treeImgShow(row, row.table);

    var item = row.item;
    if (item != null && !item.disabled) item.onclick(item); //SL 3-11

    //SL 21-04

    if (row.menu.popUp) {
      if (!item.closeMenuOnClick) {
        var table = row.offsetParent;
        var parentRow = table.parentRow;
        if (typeof parentRow != "undefined") {
          if (parentRow.childTable != null)
            parentRow.childTable.style.display = "none";
          parentRow.childTable = null;
          parentRow.childTable = parentRow.menu.build(
            parentRow.item,
            parentRow.div,
            false,
            parentRow
          ); //SL 17-03
          if (parentRow.childTable != null) {
            var rowPos = compute_element_Coordinates(parentRow);
            parentRow.childTable.style.left = rowPos.x;
            parentRow.childTable.style.top = rowPos.y - parentRow.offsetHeight;
            parentRow.childTable.className = "popUpChildMenu";
            parentRow.childTable.style.display = "block";
            parentRow.table.openedMenuRow = parentRow;
          }
        }
      }
    }
  }

  if (menu_currentMenu != null && menu_currentMenu.popUp) {
    if (row != null && row.item != null) {
      if (row.item.closeMenuOnClick) menu_currentMenu.hide();
    } else menu_currentMenu.hide();
  }
}

//===================================================
// ContextMenu
//===================================================
function buildContextMenu(_event, _eltItems, _includeStdItems, _pos) {
  try {
    var elt = _event.srcElement;

    var posX = _event.clientX + elt.document.body.scrollLeft;
    var posY = _event.clientY + elt.document.body.scrollTop;
    if (typeof _pos != "undefined" && _pos != null) {
      //SL 20070411
      posX = _pos.x;
      posY = _pos.y;
    }

    var menuItems = null;
    if (typeof _eltItems != "undefined")
      //NC 2007-09-24 //if(typeof(_eltItems != "undefined"))
      menuItems = _eltItems;
    var includeStdItems = true;
    if (typeof _includeStdItems != "undefined")
      includeStdItems = _includeStdItems;

    if (typeof elt.getContextMenuItems != "undefined" && includeStdItems) {
      //sub-object
      if (typeof elt.getContextMenuItems == "string")
        menuItems = eval(elt.getContextMenuItems); //SL
      else menuItems = elt.getContextMenuItems(elt);
    }

    var tableItems = null;
    while (
      typeof elt != "undefined" &&
      elt.tagName != "TABLE" &&
      elt.tagName != "BODY"
    )
      elt = elt.parentNode;
    var includeDefaults = false;
    if (!includeStdItems) includeDefaults = true;
    if (typeof elt.getContextMenuItems != "undefined")
      //table
      tableItems = elt.getContextMenuItems(elt, includeDefaults);
    if (tableItems != null && tableItems.length > 0) {
      if (menuItems != null) {
        menuItems[menuItems.length] = new menuItem("-", "");
        for (var i = 0; i < tableItems.length; i++)
          menuItems[menuItems.length] = tableItems[i];
      } else menuItems = tableItems;
    }

    var doc = elt.document.parentWindow; //page
    if (typeof doc.getContextMenuItems != "undefined" && includeStdItems) {
      var docItems = doc.getContextMenuItems();
      if (docItems != null) {
        if (menuItems != null) {
          menuItems[menuItems.length] = new menuItem("-", "");
          for (var i = 0; i < docItems.length; i++)
            menuItems[menuItems.length] = docItems[i];
        } else menuItems = docItems;
      }
    }
    if (typeof getContextMenu != "undefined" && includeStdItems) {
      var frameworkItems = getContextMenu();
      if (frameworkItems != null && frameworkItems.length > 0) {
        if (menuItems != null) {
          menuItems[menuItems.length] = new menuItem("-", "");
          for (
            var i = 0;
            i < frameworkItems.length;
            i++ //SL 7-11
          )
            menuItems[menuItems.length] = frameworkItems[i];
        } else menuItems = frameworkItems;
      }
    }

    if (menuItems == null) return false;
    else _event.returnValue = false;
    new popUpMenu(elt.document, menuItems, posX, posY);
  } catch (exception) {
    reportError(exception);
  }
}

function menu_treeImgHide(_row, _table) {
  if (_row.iconTree != null) {
    _row.iconTree.style.borderBottom = "";
    _row.iconTree.parentElement.style.paddingBottom = 0;
    _row.iconTree.style.height = 20;
    _row.iconTree.style.visibility = "hidden";
  }
  var tablesArray = new Array();
  if (typeof _table == "undefined") {
    tablesArray[tablesArray.length] = _row.table;
    if (_row.childTable != null)
      tablesArray[tablesArray.length] = _row.childTable;
  } else tablesArray[tablesArray.length] = _table;

  for (var i = 0; i < tablesArray.length; i++) {
    var currentTable = tablesArray[i];
    var currentTreeImg = null;
    for (var j = 0; j < currentTable.rows.length; j++) {
      currentTreeImg = currentTable.rows[j].iconTree;
      if (currentTreeImg != null) {
        currentTreeImg.style.borderBottom = "";
        currentTreeImg.parentElement.style.paddingBottom = 0;
        currentTreeImg.style.height = 20;
        currentTreeImg.style.visibility = "hidden";
      }
    }
  }
}

function menu_treeImgShow(_row, _table) {
  var menuRows = _table.rows;
  var prevRows = true;
  for (var i = 0; i < menuRows.length; i++) {
    if (menuRows[i].iconTree != null) {
      if (prevRows) {
        menuRows[i].iconTree.style.borderBottom = "";
        menuRows[i].iconTree.style.height = 20;
        menuRows[i].iconTree.parentElement.style.paddingBottom = 0;
        menuRows[i].iconTree.style.visibility = "visible";
      } else menuRows[i].iconTree.style.visibility = "hidden";
    }
    if (menuRows[i] == _row) prevRows = false;
  }
  if (_row.iconTree != null) {
    _row.iconTree.style.borderBottom = "1px solid #dedede";
    _row.iconTree.style.height = 10;
    _row.iconTree.parentElement.style.paddingBottom = 5;
    _row.iconTree.style.visibility = "visible";
  }
}

function modulesAndProcessToItems(_moduleNode, _profile, _evalFn) {
  try {
    var profile = null;
    if (_profile) profile = _profile.toString();
    var menuItems = new Array();

    if (typeof _moduleNode == "string") {
      // var parser = new ActiveXObject('Microsoft.XMLDOM');
      // parser.async = false;
      // parser.loadXML(_moduleNode);

      var parser = new DOMParser();
      var doc = parser.parseFromString(_moduleNode, "text/xml");

      _moduleNode = doc.documentElement;
      parser = null;
    }

    var nodes = _moduleNode.selectNodes("*");
    // var currentNode = nodes.nextNode();
    for (let i = 0; i < nodes.length; ++i) {
      const currentNode = nodes[i];
      // while (currentNode != null) {
      if (profile != null) {
        var profAtt = currentNode.attributes.getNamedItem("profile");
        if (profAtt != null) {
          var profiles = profAtt.text;
          if (profiles.indexOf(profile) == -1) {
            currentNode = nodes.nextNode();
            continue;
          }
        }
      }
      var nameNode = currentNode.selectSingleNode("name");

      //SL TODO check var depAtt = currentNode.attributes.getNamedItem("ba:dependencies");
      var depAtt = currentNode.attributes.getNamedItem("dependencies");
      var dependencies = "";
      if (depAtt != null) dependencies = depAtt.text;

      var helpNode = currentNode.selectSingleNode("help");
      var help = "";
      if (helpNode != null) help = helpNode.text;

      var iconNode = currentNode.selectSingleNode("icon");
      var iconStr = "";
      if (iconNode != null) iconStr = iconNode.text;

      var stateNode = currentNode.selectSingleNode("disabled");
      var state = false;
      if (stateNode != null && stateNode.text == "true") state = true;

      //NC 2007-11-09
      var accelNode = currentNode.selectSingleNode("accel");
      var accel = "";
      if (accelNode != null) accel = accelNode.text;

      switch (currentNode.nodeName) {
        case "process":
          {
            var src = 'reportError(new Error(-1, "bad command"));';
            var srcNode = currentNode.selectSingleNode("src");
            if (srcNode != null) {
              src = srcNode.text;
              var srcTypeAtt = srcNode.attributes.getNamedItem("type");
              var porcessName = currentNode.selectSingleNode("name").text;
              if (srcTypeAtt != null) {
                var srcType = srcTypeAtt.text;
                switch (srcType) {
                  case "framed-link":
                    src =
                      'openFramedLink("' +
                      srcNode.text +
                      '","' +
                      dependencies +
                      '", "' +
                      porcessName +
                      '")';
                    break;

                  case "windowed-link":
                    src =
                      'openWindowedLink("' +
                      srcNode.text +
                      '","' +
                      dependencies +
                      '", "' +
                      porcessName +
                      '")';
                    break;

                  case "dialog-link":
                    src =
                      'openDialoguedLink("' +
                      srcNode.text +
                      '", true, null, "' +
                      dependencies +
                      '", "' +
                      porcessName +
                      '")';
                    break;

                  case "modeless-dialog-link":
                    src =
                      'openDialoguedLink("' +
                      srcNode.text +
                      '", false, null, "' +
                      dependencies +
                      '", "' +
                      porcessName +
                      '")';
                    break;
                }
              }
            }
            menuItems[menuItems.length] = new menuItem(
              nameNode.text,
              src,
              help,
              iconStr,
              state,
              null,
              _evalFn,
              accel
            ); //NC 2007-11-09
          }
          break;

        case "module":
          {
            var index = menuItems.length;
            menuItems[index] = modulesAndProcessToItems(
              currentNode,
              _profile,
              _evalFn
            );
            menuItems[index].name = nameNode.text;
            menuItems[index].help = help;
            menuItems[index].icon = iconStr;
            menuItems[index].disabled = state; //NC 2007-08-22
            menuItems[index].isModule = true; //NC 2007-08-22
            menuItems[index].accel = accel; //NC 2007-11-09

            //SL 20071108 - module deps - TODO check !!
            var moduleDeps = "";
            var moduleDepsAtt =
              currentNode.attributes.getNamedItem("dependencies");
            if (moduleDepsAtt != null)
              moduleDeps = 'loadPrototypes("' + moduleDepsAtt.text + '");';

            var onbuildAtt = currentNode.attributes.getNamedItem("onbuild");
            if (onbuildAtt != null)
              menuItems[index].onbuild = moduleDeps + onbuildAtt.text;

            //SL 3-11
            var queryAtt = currentNode.attributes.getNamedItem("query");
            if (queryAtt != null) menuItems[index].query = queryAtt.text;
            var schemaAtt = currentNode.attributes.getNamedItem("schema");
            if (schemaAtt != null) menuItems[index].schema = schemaAtt.text;
            //FM 16-12
            var stateAtt = currentNode.attributes.getNamedItem("state");
            if (stateAtt != null) menuItems[index].state = stateAtt.text;
            var parentIDAtt = currentNode.attributes.getNamedItem("parentID");
            if (parentIDAtt != null)
              menuItems[index].parentID = parentIDAtt.text;
            //FM29-01-2004
            var readonlyAtt = currentNode.attributes.getNamedItem("readonly");
            if (readonlyAtt != null)
              menuItems[index].readonly = readonlyAtt.text;
            //--------------
          }
          break;
      }
      // currentNode = nodes.nextNode();
    }
    return menuItems;
  } catch (exception) {
    reportError(exception);
  }
}

function point(_x, _y) {
  var nbArg = point.arguments.length;

  this.x = 0;
  if (nbArg > 0) this.x = _x;

  this.y = 0;
  if (nbArg > 1) this.y = _y;
}

function compute_element_Coordinates(_el, _all) {
  var el = _el;
  var currentParent = null;
  var lastParent = null;
  var x = 0;
  var y = 0;

  if (_all) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
  } else {
    x += el.offsetLeft + el.offsetWidth - el.scrollLeft;
    y += el.offsetTop + el.offsetHeight - el.scrollTop;
  }

  currentParent = el.offsetParent;
  while (currentParent != null) {
    x += currentParent.offsetLeft - currentParent.scrollLeft;
    y += currentParent.offsetTop - currentParent.scrollTop;

    if (
      (!_all &&
        (currentParent.tagName == "DIV" ||
          currentParent.tagName == "SPAN" ||
          currentParent.tagName == "TD")) ||
      _all
    ) {
      var leftBorder = parseInt(currentParent.currentStyle.borderLeftWidth);
      if (!isNaN(leftBorder)) x += leftBorder;

      var topBorder = parseInt(currentParent.currentStyle.borderTopWidth);
      if (!isNaN(topBorder)) y += topBorder;
    }

    lastParent = currentParent;
    currentParent = currentParent.offsetParent;
  }
  if (lastParent != null) {
    x += lastParent.scrollLeft;
    y += lastParent.scrollTop;
  }

  return new point(x, y);
}

function getEvent() {
  if (iFr.contentWindow.event != null) {
    return iFr.contentWindow.event;
  }
  return window.event;
}
