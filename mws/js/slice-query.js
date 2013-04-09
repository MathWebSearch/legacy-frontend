function start_query()
{
  getOMCode();
  fold_interface(true);
  while (results_display.firstChild) results_display.removeChild(results_display.firstChild);
  results_display.className = "loading";
  document.getElementById("search-button").focus();

  var query = document.forms.editor.q.value;
  try {
    var request = new XMLHttpRequest();
    request.onreadystatechange=function() {
      if (request.readyState==4) results_loaded(request.responseXML);
    };
    request.open("POST", mws_settings.url, false);
    request.send(query);
  }
  catch(error) {
      alert("Can't connect to the search engine: " + error);
  }

  return false;// Do not submit the form
}
function goto_page(page_number)
{
  form.start.value = (Number(page_number) - 1) * Number(form.num.value);
  if (form.onsubmit()) form.submit();
}
function results_loaded(result)
{
  results_display.className = "loaded";
  try
    {
      results_transformer.setParameter(null, "start", Number(form.start.value) + 1);
      results_transformer.setParameter(null, "results_per_page", form.num.value);
      results_display.appendChild(results_transformer.transformToFragment(result, results_display.ownerDocument));
    }
  catch (e)
    {
      results_display.appendChild(document.createTextNode(request.responseText));
    }
}
function expand_formula(uri, container)
{
    var formula_id = uri.match(/#([a-zA-Z0-9_\-.]+)$/)[1];
    var request = new XMLHttpRequest();
    request.onreadystatechange=function() {
      if (request.readyState==4)
        {
          container.className = container.className.replace(/ ?\bloading\b/, "");
          var resultDocument = request.responseXML;
          var formula_xpath = '//*[@xml:id="'+formula_id + '"]';
          var formula = xpath(formula_xpath,
                              resultDocument,
                              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE).snapshotItem(0);
          if (!formula)
            {
              message("Error: formula '" + formula_id + "' not found in\n" + uri);
              return;
            }
          container.appendChild(document.createElement("div"));
          container.lastChild.setAttribute("onclick", "window.open('" + uri + "')");
          container.lastChild.setAttribute("class", "matched-formula");
          container.lastChild.appendChild(document.importNode(formula, true));
          var title = formula.parentNode;
          var lastInsertedElement = container.lastChild;
          var title_element_pattern = /h[1-9]/i;
          while (title && title != title.ownerDocument)
            {
              if (title_element_pattern.test(title.localName))
                {
                  container.insertBefore(title.cloneNode(true), lastInsertedElement);
                  lastInsertedElement = lastInsertedElement.previousSibling;
                }
              if (title.previousSibling) title = title.previousSibling;
              else                       title = title.parentNode;
            }
          var substitutions = xpath('following-sibling::*[@class="result-entry-match-info"]/*[@class="result-entry-substitution"]',
                                    container,
                                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
          for (var substitution_index = 0; substitution_index < substitutions.snapshotLength; ++substitution_index)
            {
              var substitution = substitutions.snapshotItem(substitution_index);
              var subexpression = xpath(
                formula_xpath + substitution.getAttribute("xpath"),
                resultDocument,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
              );

              subexpression = subexpression.snapshotItem(0);

              if (subexpression)
                {
                  var replacement = document.createDocumentFragment();
                  replacement.appendChild(document.createElementNS("http://www.w3.org/1998/Math/MathML", "math"));
                  replacement.lastChild.appendChild(subexpression.cloneNode(true));
                  substitution.textContent = substitution.getAttribute("qvar") + " → ";
                  substitution.appendChild(result_cmml_transformer.transformToFragment(replacement, document));
                }
            }
            var metadata = document.createElement("div");
            metadata.setAttribute("class", "metadata");
            var classes = "language class keywords doctype title published reviewer".split(' ');
            classes = classes.map(function (v) { return '.'+v; });
            var entries = [];
            for (var i=0; i<classes.length; ++i) {
                entries.push(resultDocument.querySelector(classes[i]));
            }
            //var entries = xpath('//h:div[@class="RDFa"]',
            //                    resultDocument,
            //                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
            for (var entry_index = 0; entry_index < entries.length;  ++entry_index)
            {
            /*
                var entry = entries.snapshotItem(entry_index);
                var content = entry.getAttribute("content");
                switch (entry.getAttribute("property"))
                {
                case "dct:identifier":
                    metadata.appendChild(document.createElement("span"));
                    metadata.lastChild.appendChild(document.createElement("a"));
                    metadata.lastChild.lastChild.setAttribute("href", "http://arxiv.org/abs/" + content);
                    metadata.lastChild.lastChild.appendChild(document.createTextNode(content));
                    break;
                case "dct:dateSubmitted":
                case "dct:creator":
                case "dct:subject":
                case "arx:comment":
                    metadata.appendChild(document.createElement("span"));
                    metadata.lastChild.appendChild(document.createTextNode(content));
                    break;
                }
            */
                var entry = entries[entry_index];
                if (!entry) continue;

                var content = entry.innerHTML;
                var content_element = document.createElement('span')
                content_element.innerHTML = content;
                switch (entry.getAttribute("class"))
                {
                case 'title':
                    var title = document.createElement('h1');
                    title.className = 'title document-title';
                    title.innerHTML = content;
                    container.insertBefore(title, container.childNodes[0]);
                    //$(container).prepend(
                    //    $(document.createElement('h1')).addClass('title document-title').html(content)
                    // );
                    break;
                default:
                    if (content.length == 0) break;
                    metadata.appendChild(document.createElement("span"));
                    metadata.lastChild.appendChild(document.createTextNode(entry.getAttribute('class')+': '));
                    metadata.lastChild.appendChild(content_element);
                    break;
                }
            }
            container.appendChild(metadata);
        }
    };
    request.open("GET", "./get-formula.php?formula-url=" + encodeURIComponent(uri), true);// Asynchronous
    request.send();
}
function results_node(xpath, entry, tag, class_name)
{
  var node;
  node = document.createElement(tag);
  if (class_name) node.setAttribute("class", class_name);
  if (xpath)
    {
      var target;
      target = entry.getElementsByTagName(xpath)[0];
      if (target.firstChild) node.appendChild(target.firstChild.cloneNode(true));
      else node.innerHTML = target.textContent;
    }

  return node;
}
function change_syntax(select)
{
  switch (select.value)
    {
      case 'mws-string':
  if (form.type.value != 'string') form.q.value = "";
  form.type.value = 'string';
  editor.className = "raw";
  break;
      case 'mws-string-xml':
  if (form.type.value != 'mathml')
    {
      if (form.type.value == 'string') form.type.value = 'mathml';
      getOMCode();
    }
  form.type.value = 'mathml';
  editor.className = "raw";
  break;
      default:
  if (form.type.value != 'openmath') setOMCode();
  form.type.value = 'openmath';
  editor.className = "sentido";
  formula_editor.change_to_context(select.value);
  formula_input.focus();
    }
}

var previous_input;
function input_changed(input)
{
  switch (form.type.value)
    {
    case 'string':
      put_formula_in_title("Raw input string");
      break;
    default:
      if (input.value != previous_input)
  {
    previous_input = input.value;
    formula_editor.linear_to_openmath(input.value);
    put_formula_in_title(input.value);
  }
    }
}

function fold_interface(fold)
{
  var class_name;
  if (fold) class_name = " folded";
  else      class_name = "";
  editor.className = editor.className.replace(/( folded)?$/, class_name);
}

var query_result = null;

function display_query_results(target, direction)
{
  while (target.firstChild) target.removeChild(target.firstChild);
  switch (direction)
  {
  case "forward":
    // Increment "start".
    break;
  case "backward":
    // Decrement "start".
    break;
  default:
    if (query.result) query_result = null;// TODO: Reuse identifier, etc.
  }
}