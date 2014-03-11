MWS.LaTexML = function(tex, result_callback, error_callback){
	var latexml_error = '';

	try{
		$.post(MWS.config.latexml_url, {
			profile: 'mwsq',
			tex: tex
		}, function (data) {
			if (data.status_code == 0) {
				var content = MWS.LaTexML.get_content_mathml(data.result);
				var presentation = MWS.LaTexML.get_presentation_mathml(data.result);
				if (content && presentation) {
					result_callback(presentation, content, $(data.result));
					return;
				} else {
					latexml_error = 'No MathML returned. ';
				}
			} else {
				latexml_error = data.status;
			}
			error_callback(latexml_error, data);
		}).fail(function() {
		    error_callback("Unable to query server. ");
		});
	} catch(e){
		error_callback("Unable to query server. ");
	}
}


MWS.LaTexML.get_content_mathml = function(latexml_response) {
	var hasContent = /<annotation-xml[^>]*\"MWS\-Query\"[^>]*>([\s\S]*)<\/annotation-xml>/;
	var m = hasContent.exec(latexml_response);
	var content = null;
	if (m!= null) {
		content = m[1];
	}

	return content;
}; 

MWS.LaTexML.get_presentation_mathml = function(latexml_response) {
 	var hasPresentation = /semantics[^>]*>([\s\S]*)<annotation-xml/;
 	var m = hasPresentation.exec(latexml_response);
 	var presentation = null;
 	if (m!= null) {
 		presentation = m[1];
 	}

 	return presentation;
}
