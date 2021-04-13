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
    var headercontent = document.createTextNode("Shortlist");
    header.appendChild(headercontent);
    div.appendChild(header);
	var hr_elem = document.createElement("hr");
	hr_elem.setAttribute("class","wide");
	div.appendChild(hr_elem);
    var reeksen = req.responseXML.getElementsByTagName("Reeks");
    for (var i = 0; i < reeksen.length; i++) {
       var reeks_titel = document.createTextNode(getElementTextNS("", "Titel", reeksen[i], 0));
       var reeksenheader = document.createElement("h2");
	   reeksenheader.setAttribute("class","shortlist");
       reeksenheader.appendChild(reeks_titel);
       var strips = getChildrenByTagName(reeksen[i],"Strip");
	   var p_reeks = document.createElement("p");
	   p_reeks.setAttribute("class","shortlist");
	   var reeks_content = "";
       for (var j = 0; j < strips.length; j++) {         
		  var nummer = getElementTextNS("", "Nummer", strips[j], 0);
		  reeks_content = reeks_content + nummer + " - "; 
       }
	   if (strips.length > 0)
	   {
			reeks_content = reeks_content.substring(0, reeks_content.length - 3);
			div.appendChild(reeksenheader);  
			var p_reeks_content = document.createTextNode(reeks_content);
			p_reeks.appendChild(p_reeks_content)
			div.appendChild(p_reeks);
	   }
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
