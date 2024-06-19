var docUtils = {
    getInputs: function(_doc, _includeExtensions) {
        var result = [];
        try {
            var inputs = _doc.getElementsByTagName('INPUT');
            var i;
            for (i = 0; i < inputs.length; i++) {
                var isExtensionInput = (inputs[i].id.indexOf('*') > -1);
                if (_includeExtensions && isExtensionInput || !isExtensionInput)
                    result[result.length] = inputs[i];
            }
            
            var selects = _doc.getElementsByTagName('SELECT');
            var i;
            for (i = 0; i < selects.length; i++) {
                var isExtensionSelect = (selects[i].id.indexOf('*') > -1);
                if (_includeExtensions && isExtensionSelect || !isExtensionSelect)
                    result[result.length] = selects[i];
            }
        }
        catch (e) {
            //console.writeDocError(_doc, '[ERROR] Converter.GetInputs : ' + e.description);
        }
        
        return result;
    },
    
    getExtensions: function(_doc) {
        var result = [];
        try {
            var tables = _doc.getElementsByTagName('TABLE');
            var i;
            for (i = 0; i < tables.length; i++) {
                if (tables[i].extension == "true")
                    result[result.length] = tables[i];
            }
        }
        catch (e) {
            
        }
        
        return result;
    },
    
    moveStylesToHead: function(_doc) {
        try {
            var styles = _doc.getElementsByTagName('STYLE');
            var links = _doc.getElementsByTagName('LINK');
            var heads = _doc.getElementsByTagName('HEAD');
            var head = heads[0];
            
            var i;
            for (i = 0; i < styles.length; i++) {
                var elem = styles[i].cloneNode(true);
                styles[i].parentElement.removeChild(styles[i]);
                head.appendChild(elem);
            }
            
            for (i = 0; i < links.length; i++) {
                var elem = links[i].cloneNode(true);
                links[i].parentElement.removeChild(links[i]);
                head.appendChild(elem);
            }
        }
        catch (e) {
            alert("Could not correctly move styles to the HEAD section. If you choose to save the file, you may loose the styles!");
            return false;
        }
        
        return true;
    },
    
    appendElements: function(_parent, _elems) {
    try {
        var i; 
        
        var span = _parent.document.createElement('SPAN');
        span.className = 'inputContainer';
        

        for (i = 0; i < _elems.length; i++) {
            span.innerHTML += _elems[i].outerHTML;
        }  
        
        //append elements to main div
        for (i = 0; i < span.childNodes.length; i++) {
            _parent.appendChild(span.childNodes[i].cloneNode(true));
        }
        
        //free memory
        span.innerHTML = '';
        span = null;
    }
    catch (e) {
        alert('Error appending elements into document!');
        return false;
    }
    return true;
}
}