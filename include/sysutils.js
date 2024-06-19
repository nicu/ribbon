var dirUtils = {}; // new ActiveXObject( "iBiZaFileSystem.FileSystemObject" );
var fso = {}; //new ActiveXObject("Scripting.FileSystemObject");
var shell = {}; // new ActiveXObject("WScript.Shell");

var Config = {
  file: "config.xml",
  rdocFile: "recentDocs.xml",
  dir: "" /*,
    
    /*load: function() {
        try {
            if (fso.FileExists(Config.file)) {
                Config.doc = new ActiveXObject('Microsoft.XMLDOM');
                Config.doc.async = false;
                Config.doc.load(Config.file);
                
                Config.host = Config.doc.selectSingleNode('config/host').text;
                Config.user = Config.doc.selectSingleNode('config/user').text;
                Config.pass = Config.doc.selectSingleNode('config/pass').text;
                Config.db = Config.doc.selectSingleNode('config/db').text;
            }
        }
        catch (e) {
        }
    },
    
    save: function() {
        var xml = '<config>';
            xml += '<host>' + Config.host + '</host>';
            xml += '<user>' + Config.user + '</user>';
            xml += '<pass>' + Config.pass + '</pass>';
            xml += '<db>' + Config.db + '</db>';
        xml += '</config>';
        
        var f = fso.CreateTextFile(Config.file, true);
        f.Write(xml);
        f.Close();
    }*/,
};

Config.dir = "";
//   unescape(
//     fso
//       .GetParentFolderName(this.location.href)
//       .replace(/file:\/\/\//, '')
//       .replace(/\//g, '\\')
//   ) + '\\';
Config.file = Config.dir + Config.file;
Config.rdocFile = Config.dir + Config.rdocFile;

function FindFiles(_dir, _file, _extension) {
  var result = [];

  if (_dir == null || _dir.length == 0 || !fso.FolderExists(_dir)) {
    return result;
  }

  var dirObj = fso.GetFolder(_dir);
  var files = dirObj.Files;
  var FSo = new Enumerator(files);

  for (i = 0; !FSo.atEnd(); FSo.moveNext()) {
    if (
      _file == "*" ||
      FSo.item()
        .name.slice(0, FSo.item().name.lastIndexOf("."))
        .toLowerCase()
        .indexOf(_file) > -1
    )
      if (
        _extension == "*" ||
        FSo.item()
          .name.slice(FSo.item().name.lastIndexOf(".") + 1)
          .toLowerCase()
          .indexOf(_extension) > -1
      ) {
        result[result.length] = FSo.item().name;
        i++;
      }
  }

  return result;
}

var savedFileName = "";
var savedImgFileName = "";
function LoadFile() {
  var fileName = dirUtils.BrowseForOpenFile("html", false);
  return LoadFromFile(fileName);
}

function LoadFromFile(_fileName) {
  if (_fileName != "") {
    savedFileName = "";
    savedImgFileName = "";
    OpenIFrame(_fileName);

    var parts = _fileName.split("\\");
    document.title = parts[parts.length - 1];
    window.status = _fileName;
    saved_fileName = "";
    //btnSelAll.checked = false;

    try {
      document.getElementById("inputID").value = "";
      document.getElementById("formula").value = "";
    } catch (e) {}

    ribbon.setActiveTab(tabEdit);

    //add to recent document
    var sticky = false;
    var rdoc = ribbon.menu.recentDocs.docs(document.title);
    if (rdoc != null) sticky = rdoc.sticky;
    ribbon.menu.recentDocs.insertDoc(
      document.title,
      document.title,
      sticky,
      _fileName
    );

    return true;
  }

  return false;
}

function SaveDocument(_type) {
  try {
    var fName = "";
    switch (_type) {
      case 0:
        if (savedFileName == "") {
          savedFileName = dirUtils.BrowseForSaveFile();
          if (savedFileName == "") {
            //cancel was pressed
            return false;
          }
        }

        fName = savedFileName;
        break; //VML

      case 1:
        if (savedImgFileName == "") {
          savedImgFileName = dirUtils.BrowseForSaveFile();
          if (savedImgFileName == "") {
            //cancel was pressed
            return false;
          }
        }

        fName = savedImgFileName;
        break; //IMG
    }

    var docText = objEditor.getDocumentText();

    // var f = fso.CreateTextFile(fName, true);
    // f.Write(docText);
    // f.Close();
  } catch (e) {
    alert(e.description);
    return false;
  }

  return true;
}

function getAttributeText(_node, _attributeName, _defaultValue) {
  try {
    var attribute = _node.attributes.getNamedItem(_attributeName);
    if (attribute != null) return attribute.value;
    return _defaultValue;
  } catch (exception) {
    debugMessage("caught in : getAttributeText : " + exception.message);
    var contexte = "getAttributeText ";
    try {
      contexte += _attributeName;
    } catch (e) {}
    throw error(exception.number, contexte + exception.message);
  }
}

function setAttributeText(_node, _attributeName, _value) {
  try {
    var attribute = _node.attributes.getNamedItem(_attributeName);
    if (attribute == null) {
      attribute = _node.ownerDocument.createAttribute(_attributeName);
      _node.attributes.setNamedItem(attribute);
    }
    attribute.value = _value;
  } catch (exception) {
    debugMessage("caught in : setAttributeText : " + exception.message);
    broker_reportError(exception);
  }
}

function LoadRecentDocs() {
  // var xml = new ActiveXObject("Microsoft.XMLDOM");
  // xml.async = false;
  // xml.load(Config.rdocFile);
  /*
  var parser = new DOMParser();
  var xml = parser.parseFromString(Config.rdocFile, "text/xml");

  var nodes = xml.selectNodes("//doc");
  for (var i = 0; i < nodes.length; i++) {
    var idNode = nodes[i].selectSingleNode("id");
    var nameNode = nodes[i].selectSingleNode("name");
    var stickyNode = nodes[i].selectSingleNode("sticky");
    var userDataNode = nodes[i].selectSingleNode("path");
    if (
      idNode != null &&
      nameNode != null &&
      stickyNode != null &&
      userDataNode != null
    ) {
      var id = idNode.text;
      var name = nameNode.text;
      var sticky =
        stickyNode.text == "true" || stickyNode.text == "1" ? true : false;
      var userData = userDataNode.text;
      ribbon.menu.recentDocs.insertDoc(id, name, sticky, userData);
    }
  }
  */
}

function SaveRecentDocs() {
  var i;
  var docs = ribbon.menu.recentDocs.docs().reverse();
  var xml = "<recentDocs>";
  for (i = 0; i < docs.length; i++) {
    xml += "<doc>";
    xml += "<name>" + docs[i].name + "</name>";
    xml += "<id>" + docs[i].id + "</id>";
    xml += "<path>" + docs[i].__userData + "</path>";
    xml += "<position>" + docs[i].position + "</position>";
    xml += "<sticky>" + docs[i].sticky + "</sticky>";
    xml += "</doc>";
  }
  xml += "</recentDocs>";

  // var f = fso.CreateTextFile(Config.rdocFile, true);
  // f.Write(xml);
  // f.Close();
}
