MWS.MMT = function(input, result_callback, error_callback){
	try {
		$.ajax({
			url :"http://localhost:8081/:mwsq",
			type:'POST',
			data : '{' + 
				'"mpath": "http://latin.omdoc.org/math/equal.omdoc?equal", \n' +
				'"input": "' + input + '"' +
			"}",
			processData:false,
			dataType : 'text',
			contentType:'text/plain',
			success: function (data) {
				var content = MWS.MMT.get_content_mathml(data);
				console.log(content);
				var presentation = MWS.MMT.get_presentation_mathml(data);
				console.log(presentation);
				if (content && presentation) {
					result_callback(presentation, content, $(data));
				} else {
					error_callback('No MathML returned. ', data);
				}
			} 
		}).fail(function() {
		    	error_callback("Unable to query server. ");
			}
		);
	} catch(e){
		error_callback("Unable to query server. ");
	}
}


MWS.MMT.get_content_mathml = function(mmt_response) {
	var hasContent = /<annotation-xml[^>]*>([\s\S]*)<\/annotation-xml>/;
	var m = hasContent.exec(mmt_response);
	var content = null;
	if (m!= null) {
		content = m[1];
	}
	return content;
};

MWS.MMT.get_presentation_mathml = function(mmt_response) {
 	var hasPresentation = /semantics[^>]*>([\s\S]*)<annotation-xml/;
 	var m = hasPresentation.exec(mmt_response);
 	var presentation = null;
 	if (m!= null) {
 		presentation = m[1];
 	}
 	return presentation;
}
