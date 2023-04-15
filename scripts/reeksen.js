// handle onreadystatechange event of req object
function processReqChange() {
    // only if req shows "loaded"
    if (req.readyState == 4) {
        // only if "OK"
        if (req.status == 200) {
            insertXMLData();
         } else {
            alert("There was a problem retrieving the XML data:\n" +
                req.statusText);
         }
    }
}

// display details retrieved from XML document
function insertXMLData() {
    var div = document.getElementById("hoofdtekst"); 
    var header = document.createElement("h1");
    var headercontent = document.createTextNode("Reeksen");
    header.appendChild(headercontent);
    div.appendChild(header);
	var hr_elem = document.createElement("hr");
	hr_elem.setAttribute("class","wide");
	div.appendChild(hr_elem);
    var reeksen = req.responseXML.getElementsByTagName("Reeks");
    for (var i = 0; i < reeksen.length; i++) {
	   var reeks_para = document.createElement("p");
	   var reeks_id = getElementTextNS("", "Id", reeksen[i], 0);
	   var reeks_href = 'reeks.html?id=' + reeks_id;
       var reeks_titel = document.createTextNode(getElementTextNS("", "Titel", reeksen[i], 0));
	   var reeks_anchor = document.createElement("a");
	   reeks_anchor.appendChild(reeks_titel);
       reeks_anchor.href = reeks_href;
	   reeks_para.appendChild(reeks_anchor);
       div.appendChild(reeks_para);
    }
    //DEBUG IE
    //var debuginfo = document.createElement("xmp");
    //var debuginfocontent = document.createTextNode("Debuginfo : " + div.innerHTML);
    //debuginfo.appendChild(debuginfocontent);
    // div.appendChild(debuginfo);
    //END DEBUG IE
}

// display details retrieved from XML document
function loadXMLData(doc) {
    try {
       loadXMLDoc(doc);
    }
    catch(e) {
       var msg = (typeof e == "string") ? e : ((e.message) ? e.message : "Unknown Error");
       alert("Unable to get XML data:\n" + msg);
       return;
    }
}
