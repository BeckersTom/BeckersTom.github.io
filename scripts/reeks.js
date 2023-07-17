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
    //var header = document.createElement("h1");
    //var headercontent = document.createTextNode("Strip Info");
    //header.appendChild(headercontent);
    //div.appendChild(header);
    var reeksen = req.responseXML.getElementsByTagName("Reeks");
    for (var i = 0; i < reeksen.length; i++) {
       var reeks_titel = document.createTextNode(getElementTextNS("", "Titel", reeksen[i], 0));
       var reeksenheader = document.createElement("h2");
       reeksenheader.appendChild(reeks_titel);
       div.appendChild(reeksenheader);
	   var striplist = getChildrenByTagName(reeksen[i],"Strips");
       var strips = getChildrenByTagName(striplist[0],"Strip");
	   var table = document.createElement("table");
       for (var j = 0; j < strips.length; j++) {         
          var tr = document.createElement("tr");
		  var td_nummer = document.createElement("td");
		  var nummer = getElementTextNS("", "Nummer", strips[j], 0);
		  if (nummer == "0" || nummer >= 1000)
		  {
			  nummer = getElementTextNS("", "Subnummer", strips[j], 0);
		  }
		  td_nummer.setAttribute("class","stripnumber");
		  td_nummer.appendChild(document.createTextNode(nummer));
		  var titel  = document.createTextNode(getElementTextNS("", "Titel", strips[j], 0));
		  var stripafbeelding = "images/covers/" + getElementTextNS("", "Afbeelding", strips[j], 0);
		  var td_titel = document.createElement("td");
		  if (stripafbeelding == "images/covers/")
		  {
			  td_titel.appendChild(titel);
		  } else {
			  var a_strip = document.createElement("a");
			  a_strip.appendChild(titel);
		      a_strip.setAttribute("href",stripafbeelding);
		      td_titel.appendChild(a_strip);
		  }
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
		  var id = document.createTextNode(getElementTextNS("", "Id", strips[j], 0));
		  var td_id = document.createElement("td");
		  td_id.setAttribute("class","stripid");
		  td_id.appendChild(id);
		  tr.appendChild(td_nummer);
		  tr.appendChild(td_titel);
		  tr.appendChild(td_aanwezig);
		  tr.appendChild(td_gelezen);
		  tr.appendChild(td_id);
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

function loadXMLDataForReeks() {
	var id = '19';
	var url = window.location.toString();
	var query_string = url.split("?");
	var params = query_string[1].split("&");
	for (var i = 0; i < params.length; i++) {	
		var param_item = params[0].split("=");
		if (param_item[0] == 'id')
		{
			id = param_item[1];
		}
	}
	var reeks_xml = 'xml/reeks_' + id + '.xml';
	loadXMLData(reeks_xml);
}
