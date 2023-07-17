// global queryparametersmap
var param_list;

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
    var headercontent = document.createTextNode("Comics Info");
    header.appendChild(headercontent);
    div.appendChild(header);
    var reeksen = req.responseXML.getElementsByTagName("Reeks");
    for (var i = 0; i < reeksen.length; i++) {
       var reeks_titel = document.createTextNode(getElementTextNS("", "Titel", reeksen[i], 0));
       var reeksenheader = document.createElement("h2");
       reeksenheader.appendChild(reeks_titel);
       div.appendChild(reeksenheader);
	   var stripcollection = getChildrenByTagName(reeksen[i],"Strips");
       var strips = getChildrenByTagName(stripcollection[0],"Strip");
	   var table = document.createElement("table");
       for (var j = 0; j < strips.length; j++) {         
          var tr = document.createElement("tr");
		  var nummer = document.createTextNode(getElementTextNS("", "Nummer", strips[j], 0));
		  var subnummer = document.createTextNode(getElementTextNS("", "Subnummer", strips[j], 0));
		  var td_nummer = document.createElement("td");
		  td_nummer.setAttribute("class","stripnumber");
		  td_nummer.appendChild(nummer);
		  var titel  = document.createTextNode(getElementTextNS("", "Titel", strips[j], 0));
		  var td_titel = document.createElement("td");
		  td_titel.appendChild(titel);
		  var aanwezig = getElementTextNS("", "Aanwezig", strips[j], 0);
		  var td_aanwezig = document.createElement("td");
		  td_aanwezig.setAttribute("class","boolean");
		  if (aanwezig == "true") {
		    var img_green = document.createElement('img'); 
			img_green.src = 'images/green.png';
			img_green.alt = 'x';
			img_green.setAttribute("class","boolean");
			td_aanwezig.appendChild(img_green);
		  } else {
			var img_red = document.createElement('img'); 
			img_red.src = 'images/red.png';
			img_red.alt = 'x';
			img_red.setAttribute("class","boolean");
			td_aanwezig.appendChild(img_red);
		  }
		  var gelezen = getElementTextNS("", "Gelezen", strips[j], 0);
		  var td_gelezen = document.createElement("td");
		  td_gelezen.setAttribute("class","boolean");
		  if (gelezen == "true") {
		    var img_green = document.createElement('img'); 
			img_green.src = 'images/green.png';
			img_green.alt = 'x';
			img_green.setAttribute("class","boolean");
			td_gelezen.appendChild(img_green);
		  } else {
			var img_red = document.createElement('img'); 
			img_red.src = 'images/red.png';
			img_red.alt = 'x';
			img_red.setAttribute("class","boolean");
			td_gelezen.appendChild(img_red);
		  }
		  tr.appendChild(td_nummer);
		  tr.appendChild(td_titel);
		  tr.appendChild(td_aanwezig);
		  tr.appendChild(td_gelezen);
		  table.appendChild(tr);
          div.appendChild(table);
       }  
    }
    //DEBUG IE
    var debuginfo = document.createElement("xmp");
    var debuginfocontent = document.createTextNode("Debuginfo : " + div.innerHTML);
    debuginfo.appendChild(debuginfocontent);
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
