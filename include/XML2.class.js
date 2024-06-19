/**
 * @author Nicu.Ciocan
 */
function XML2(async) {
  this.__constructor(async);
}

XML2.prototype.__constructor = XML2_Constructor;
XML2.prototype.load = XML2_Load;
XML2.prototype.loadXML = XML2_LoadXML;
XML2.prototype.transformNode = XML2_TransformNode;
XML2.prototype.selectSingleNode = XML2_SelectSingleNode;
XML2.prototype.selectNodes = XML2_SelectNodes;
XML2.prototype.toString = XML2_toString;

function XML2_Constructor(async) {
  var xmlDoc;
  if (window.ActiveXObject) {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = async || false;
    this.browser = "IE";
  } else if (
    document.implementation &&
    document.implementation.createDocument
  ) {
    // xmlDoc = document.implementation.createDocument('', '', null);
    // xmlDoc.async = async || false;
    xmlDoc = new DOMParser();
    this.browser = "FF";
  }
  this.parser = xmlDoc;
}

function XML2_LoadXML(data) {
  switch (this.browser) {
    case "FF":
      var domParser = new DOMParser();
      this.parser = domParser.parseFromString(data, "text/xml");
      break;

    case "IE":
      this.parser.loadXML(data);
      break;
  }
}

function XML2_Load(fileName) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileName, false);
  xhr.send();

  var domParser = new DOMParser();
  this.parser = domParser.parseFromString(xhr.responseText, "text/xml");
}

function XML2_TransformNode(XSLDom) {
  return this.parser.transformNode(XSLDom.parser);
}

function XML2_SelectSingleNode(path) {
  return this.parser.selectSingleNode(path);
}

function XML2_SelectNodes(path) {
  return this.parser.selectNodes(path);
}

function XML2_toString() {
  switch (this.browser) {
    case "FF":
      var s = new XMLSerializer();
      return s.serializeToString(this.parser.documentElement);
      break;

    case "IE":
      return this.parser.xml;
      break;
  }
}

if (document.implementation.hasFeature("XPath", "3.0")) {
  XMLDocument.prototype.selectNodes = function (cXPathString, xNode) {
    if (!xNode) {
      xNode = this;
    }

    var oNSResolver = this.createNSResolver(this.documentElement);
    var aItems = this.evaluate(
      cXPathString,
      xNode,
      oNSResolver,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    var aResult = [];
    for (var i = 0; i < aItems.snapshotLength; i++) {
      aResult[i] = aItems.snapshotItem(i);
    }

    return aResult;
  };
  XMLDocument.prototype.selectSingleNode = function (cXPathString, xNode) {
    if (!xNode) {
      xNode = this;
    }

    var xItems = this.selectNodes(cXPathString, xNode);
    if (xItems.length > 0) {
      xItems[0].text = xItems[0].textContent;
      return xItems[0];
    } else {
      return null;
    }
  };

  Element.prototype.selectNodes = function (cXPathString) {
    if (this.ownerDocument.selectNodes) {
      return this.ownerDocument.selectNodes(cXPathString, this);
    } else {
      throw "For XML Elements Only";
    }
  };

  Element.prototype.selectSingleNode = function (cXPathString) {
    if (this.ownerDocument.selectSingleNode) {
      return this.ownerDocument.selectSingleNode(cXPathString, this);
    } else {
      throw "For XML Elements Only";
    }
  };
}

if (typeof Node != "undefined") {
  Node.prototype.transformNode = function (oXslDom) {
    var oProcessor = new XSLTProcessor();
    oProcessor.importStylesheet(oXslDom);
    var oResultDom = oProcessor.transformToDocument(this);
    var xmls = new XMLSerializer();
    var output = xmls.serializeToString(oResultDom);

    if (output.indexOf("<transformiix:result") > -1) {
      output = output.substring(
        output.indexOf(">") + 1,
        output.lastIndexOf("<")
      );
    }

    return output;
  };

  Node.prototype.text = Node.textContent;
}
