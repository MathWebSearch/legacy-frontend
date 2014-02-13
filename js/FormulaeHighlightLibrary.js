(function(){
	var FHL = {
        "getElementChildNode": function(doc, idx) {
            if ('children' in doc) {
                return doc.children[idx];
            } else {
                var elementCounter = 0;
                for(var i=0;i<doc.childNodes.length;i++) {
                    var curr = doc.childNodes[i];
                    if (curr.nodeType == curr.ELEMENT_NODE) {
                        if (elementCounter == idx) {
                            return curr;
                        }
                        elementCounter++;
                    }
                }
            }
            return undefined;
        },
		"getElementByXMLId": function(id, doc){
			var doc = (typeof doc == "undefined")?document:doc; 

			var items = doc.getElementsByTagName("*");
			for (var i = items.length; i--;) {
			    try{
			    	if(items[i].getAttribute("xml:id") == id){
			    		return items[i]; 
			    	}
			    } catch(e){}; 
			}
			return undefined;
		},
		"getElementBySimpleXPath": function(xpath, doc){
			var doc = (typeof doc == "undefined")?document:doc; 

			xpath = xpath
			.split("/").join("")
			.split("[").join("")
			.split("]").join("")
			.split("*")

			xpath.shift();
			xpath = xpath.map(function(e){
				return parseInt(e) - 1;//xpath is one-based
			})

			while(xpath.length > 0){
				var n = xpath.shift(); 
				try {
					doc = FHL.getElementChildNode(doc, n);
				} catch(e){
					return undefined; 
				}
			}

			return doc;
		},
		"getSemantic": function(xpath, doc){
			var doc = (typeof doc == "undefined")?document:doc;
			var base = doc;
			base = base.getElementsByTagName("m:semantics")[0] || base.getElementsByTagName("semantics")[0];
			base = base.getElementsByTagName("m:annotation-xml")[0] || base.getElementsByTagName("annotation-xml")[0];

			var annottree = base;
			for(var i=0;i<base.length;i++){
				if(base[i].getAttribute("encoding") == "MathML-Content"){
					annottree = base[i];
					break;
				}
			}

			return FHL.getElementBySimpleXPath(xpath, annottree); 
		},
		"getPresentation": function(xpath, doc){
			var doc = (typeof doc == "undefined")?document:doc;
			var semantics = FHL.getSemantic(xpath, doc);
			
			if(typeof semantics == "undefined"){
				return undefined; 
			} else {
				return FHL.getElementByXMLId(semantics.getAttribute("xref"), doc);
			}
		}
	}



	MWS.FHL = FHL; 
})(); 
