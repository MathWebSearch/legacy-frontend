MWS.query = function(text, math){
	var me = this; 

	//store parameters for query
	this._text = text; 
	this._math = math; 

	this._cached = false; 

	var get = function(start, size, callback){
		if(arguments.length == 1){
			var callback = start; 
			var start = 0; 
			var size = 5; 
		}

		if(typeof callback !== "function"){
			var callback = function(){}; //Nothing
		}

		var data = {
			"text": me._text, 
			"math": me._math, 
			"from": start, 
			"size": 5
		}; 

		$.ajax({
		    type: 'GET',
		    url: "http://opal.eecs.jacobs-university.de:8888/",
		    data: data
		}).done(function(data) {
		    callback.call(me, data); 
		})
	}

	var split_xhtml = function(node){
		var res = []; 

		$(node).contents().each(function(){
			if(this.nodeType == 3){
				//text node
				res = res.concat(
						$(this)
						.text().split("; ")
						.filter(function(e){return e?true:false;})
				);
			} else {
				res.push(this);
			}
		}); 

		return res; 
	}

	this.getAll = function(callback){
		var callback = (typeof callback == "function")?callback:function(d){console.log(d); }; 


		get(0, 0, function(data){
			var count = data.hits.total || 0; 
			get(0, count, function(data){
				var res = []; 
				var hits = data.hits.hits; 
				for(var i=0;i<hits.length;i++){
					var hit = hits[i]; 
					
					//split xhtml
					var xhtml = $(jQuery.parseXML(hit._source.xhtml)); 

					res.push({
						"id": hit._id, 
						"index": hit._index, 
						"score": hit._score, 
						"type": hit.type, 
						"data": {
							"language": xhtml.find(".language").text(), 
							"class": xhtml.find(".class").text(), 
							"keywords": split_xhtml(xhtml.find(".keywords")), 
							"doctype": xhtml.find(".doctype").text(), 
							"review": {
								"aunot": {
									"author": split_xhtml(xhtml.find(".review > .aunot > .author")), 
									"number": parseInt(xhtml.find(".review > .aunot > .number").text()), 
								}, 
								
								"title": xhtml.find(".review > .title").get(0), 
								"body": xhtml.find(".review > .review-body").get(0), 
								"reviewer": split_xhtml(xhtml.find(".review > .reviewer")), 
								"published": parseInt(xhtml.find(".review > .published").text()),
							}, 
						}, 
						//"raw_result": xhtml.get(0) //the raw result; disabled
					}); 
				}

				callback(res); 
			}); 
		}); 
	}
}