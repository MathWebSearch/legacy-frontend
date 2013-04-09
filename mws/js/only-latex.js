(function () {
  var ac_counter = 0;
  var send_called = 0;
  var mouse_pressed = 0;
  var timeout = null;
  var hasFatal = /fatal error/;
  var hasPres = /semantics[^>]*>([\s\S]*)<annotation-xml/;
  var hasContent = /\"MathML-Content\"[^>]*>([\s\S]*)<\/annotation-xml>/;

  var results_per_page = 5;

  var $result;
  var $math_output;
  var $form;
  var $textarea;

  var last_query = '';

  $(function set_only_latex_ui () {
    $result = $(mws_settings.elements.results_display);
    $textarea = $('textarea[name="q"]');
    $result.show();

    // pagination HACK
    $(document).on('click', '.pager a', function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var page = Number($(this).attr('href').match(/goto_page\(([0-9]*)\)/i)[1]);
      var start = (page-1) * results_per_page;
      $('input[name="start"]').val(start);
      last_query = last_query.replace(/(limitmin=")[0-9]*"/, '$1'+start+'"');
      mws_search(last_query);
    });

    $form = $(document.createElement('form'));
    $form.
      append($(document.createElement('input')).attr('name', 'query')).
      append(
        $(document.createElement('input')).
          attr('type', 'submit').
          val('Submit')
      ).
      insertBefore($result).
      on('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        last_query = wrap_query($textarea.val());
        $('input[name="start"]').val(0);
        mws_search(last_query);
    });

    $math_output = $(document.createElement('div'));
    $math_output.attr('id', 'math-output').insertBefore($result);

  });
  
  function mws_search (query) {
    $result.empty();
    var request = new XMLHttpRequest();
    request.onreadystatechange=function() {
      if (request.readyState==4) results_loaded(request.responseXML);
    };
    request.open("POST", mws_settings.url, false);
    request.send(query);
  }

  function send_request (tex, my_counter) {
    if (my_counter == ac_counter) {
      $("body").css("cursor","progress");
      if (ac_counter == 1) send_called = 0;
      send_called++;
      $.post('latexml-proxy.php', {
          profile: 'math',
          tex: tex
        }, function (data) {
          $('body').css('cursor', 'auto');
          if (!hasFatal.test(data.status)) {
            if ((data.result != '') && (my_counter <= ac_counter)) { 
              // 1. Get pres mathml and content mathml out!
              var m = null;
              m = hasPres.exec(data.result);
              var pres = null;
              if (m!= null) {
                pres = m[1];
              }
              m = hasContent.exec(data.result);
              var content = null;
              if (m!= null) {
                content = m[1];
                content = content.replace(/<csymbol(\s+)cd=\"mws\"(\s+)name=\"qvar\"[^>]*>(\s*)([a-zA-Z0-9]*)(\s*)<\/csymbol>/g, "<mws:qvar>$4</mws:qvar>");
                content = content.replace(/<csymbol(\s+)cd=\"mws\"(\s+)name=\"qvar\"[^>]*\/>/g, "<mws:qvar/>");
                content = content.replace(/^\s+|\s+$/g,'');
                // content = content.replace(/<(\/?)([^:></]+?)(\/?)>/g, "<$1m:$2$3>");
              }                
              // 2. Turn content mathml into query
              $math_output.html("<math xmlns='http://www.w3.org/1998/Math/MathML' display='inline'>"+pres+"</math>");
              $textarea.val(content);
            }
          } else {
            $form.find('[name="mws-query"]').val('');
          }
      });
    }
  }

  function do_convert_on_the_fly (e) {
    if (e) { 
      var key = e.keyCode;
      if (!key) key = 0;
    } else {
      var key = 0;
    }
    
    ac_counter++;
    if (((key < 37 || key > 40) && key > 32 && key <= 250) || key == 8 || key == 0){
      // immediately cancel outstanding requests
      if (timeout) {
        clearTimeout(timeout);
        ac_counter--;
      }
      var tex = $form.find('[name="query"]').val();
      if (!tex) {
        ac_counter = 0;
        $result.html(' ');
        $form.find('[name="mws-query"]').val('');
        return;
      }
      // call erst nach 300ms
      timeout = setTimeout(function(){send_request(tex, ac_counter)}, 300);
    }
  } 

  $(document).ready(function(){
    $('#preset').hide();
    $('.edit_area').editable(do_convert_on_the_fly, { 
      data  :  function(value, settings) {
        setTimeout(do_convert_on_the_fly, 300);
        return $('#preset').text();
      },
      type: 'textarea',
      loadtext: 'Converting...',
      onblur: 'submit',
      placeholder: 'Enter LaTeX Formula'
    });
    $form.on('keyup', '[name="query"]', do_convert_on_the_fly);
    $('.examples pre')
       .hide()
       .prepend( $(document.createElement('a')).html('Load Example').attr({href:'javascript:void(0)', 'class':'loadExample'}) )
       .each(function(){
          var handle = $(document.createElement('a'));
          handle
            .html($(this).attr("title"))
            .attr({
               'class'  : 'exampleHandle',
               'href'   : 'javascript:void(0)',
               'style'  : 'display:block'
            })
            .data('target', $(this))
            .insertBefore( $(this) )
            .bind('click.toggleExample', function( e ){
               $('.exampleHandle').not($(this)).each(function(){ $(this).data('target').slideUp(); });
               $(this).data('target').slideToggle();
            });
          $(this).hide();
       });
        
     $('.loadExample').bind('click.loadExample', function(){
         var clone = $(this).parent().clone();
         clone.children().eq(0).remove();
         $('#preset').text(clone.text());
         $('.edit_area').click();
         $('.edit_area').blur();
     });
  });
  
  function wrap_query (query, page, size) {
    page = page || 1;
    size = size || results_per_page;
    return '<mws:query limitmin="'+((page-1) * size)+'" answsize="'+size+'"><mws:expr>'+query+'</mws:expr></mws:query>';
  }

})();