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
	var form = document.createElement("form");
    var reeksen = req.responseXML.getElementsByTagName("Reeks");
    for (var i = 0; i < reeksen.length; i++) {
       var reeks_titel = document.createTextNode(getElementTextNS("", "Titel", reeksen[i], 0));
       var reeksenheader = document.createElement("h2");
	   reeksenheader.setAttribute("class","shortlist");
       reeksenheader.appendChild(reeks_titel);
	   div.appendChild(reeksenheader);
	   var striplist = getChildrenByTagName(reeksen[i],"Strips");
       var strips = getChildrenByTagName(striplist[0],"Strip");
	   for (var j = 0; j < strips.length; j++) {
		  var p_strip = document.createElement("p");
		  var a_strip = document.createElement("a");
		  var cb_strip = document.createElement("input");
		  cb_strip.setAttribute("type","checkbox");
		  var stripnummer = getElementTextNS("", "Nummer", strips[j], 0);
		  var stripsubnummer = getElementTextNS("", "Subnummer", strips[j], 0);
		  var striptitel = getElementTextNS("", "Titel", strips[j], 0);
		  var stripafbeelding = "images/covers/" + getElementTextNS("", "Afbeelding", strips[j], 0);
		  if (striptitel == "")
		  {
			  striptitel = "...";
		  }
	      var stripdata_content = stripnummer + " - " + striptitel;
		  if (stripnummer == "0" || stripnummer >= 1000)
		  {
			  stripdata_content = stripsubnummer + " - " + striptitel;
		  }
		  if (stripafbeelding != "images/covers/")
		  {
			  stripdata_content = stripdata_content + " #";
		  }
		  else
		  {
			  stripdata_content = " " + stripdata_content;
		  }
		  var stripdata = document.createTextNode(stripdata_content);
		  p_strip.appendChild(cb_strip);
		  if (stripafbeelding == "images/covers/")
		  {
			  p_strip.appendChild(stripdata);
		  } else {
			  var a_strip = document.createElement("a");
			  a_strip.appendChild(stripdata);
		      a_strip.setAttribute("href",stripafbeelding);
		      p_strip.appendChild(a_strip);
		  }
		  div.appendChild(p_strip);
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
