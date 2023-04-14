// global flag
var isIE = false;

// global request and XML document objects
var req;

// retrieve XML document (reusable generic function);
// parameter is URL string (relative or complete) to
// an .xml file whose Content-Type is a valid XML
// type, such as text/xml; XML source must be from
// same domain as HTML file
function loadXMLDoc(url) {
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
        req.onreadystatechange = processReqChange;
        req.open("GET", url, true);
        req.send(null);
    // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        isIE = true;
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) {
            req.onreadystatechange = processReqChange;
            req.open("GET", url, true);
            req.send();
        }
    }
}

// retrieve text of an XML document element, including
// elements using namespaces
function getElementTextNS(prefix, local, parentElem, index) {
    var result = "";
    if (prefix && isIE) {
        // IE/Windows way of handling namespaces
        result = parentElem.getElementsByTagName(prefix + ":" + local)[index];
    } else {
        // the namespace versions of this method 
        // (getElementsByTagNameNS()) operate
        // differently in Safari and Mozilla, but both
        // return value with just local name, provided 
        // there aren't conflicts with non-namespace element
        // names
        result = parentElem.getElementsByTagName(local)[index];
    }
    if (result) {
        // get text, accounting for possible
        // whitespace (carriage return) text nodes 
        if (result.childNodes.length > 1) {
            return result.childNodes[1].nodeValue;
        } else if (result.childNodes.length == 1) {
            return result.firstChild.nodeValue;    		
        } else {
			return "";
		}
    } else {
        return "";
    }
}

function getText(Elem) {
    var result = "";
    if (isIE) {
        result = "test"; //Elem.innerText;
    } else {
        result = Elem.firstChild.nodeValue; //Elem.textContent
    }
    return result;
}

function getChildrenByTagName(root_element, tag) {
  var kids = root_element.childNodes;
  var kids_w_tag = new Array();
  for (var i=0; i<kids.length; i++) {
     var e = kids.item(i).tagName;
     if ((typeof e == "string") && (e.toUpperCase() == tag.toUpperCase())) {
        kids_w_tag.push(kids.item(i));
     }
  }
  return kids_w_tag;
}
