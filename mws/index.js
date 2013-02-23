// These functions are adapted from Sentido:
// http://www.matracas.org/sentido/
// Sentido is distributed under the General Public Licence, version 2 or,
// at your option, any later version.
// See the project web site for details.

var formula_editor;
formula_editor = null;
var formula_omobj;
formula_omobj = null;

var form, formula_input, editor, results, results_display;
form          = document.getElementById('editor');
formula_input = document.getElementById('sentido-embedded-input-editor-textarea');
editor        = document.getElementById('editor');
results       = document.getElementById('results');
results_display = document.getElementById('results-display');
var query_translator_om_to_cmml, query_translator_cmml_to_om;
var formula_transformer, results_transformer, result_cmml_transformer;
//query_translator_om_to_cmml = build_transformer("sentido/om_to_cmml.xsl");
query_translator_om_to_cmml = build_transformer("sentido/om_to_cmml_mws_query.xsl");
query_translator_cmml_to_om = build_transformer("sentido/cmml_to_om_mws_query.xsl");
formula_transformer = build_transformer("sentido/om_to_pmml.xsl");
results_transformer = build_transformer("results_to_pmml.xsl");
result_cmml_transformer = build_transformer("sentido/cmml_to_pmml.xsl");
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
    request.open("POST", "http://search.mathweb.org:9090/", false);
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
    var formula_id = uri.match(/#([a-zA-Z0-9_-]+)$/)[1];
    var request = new XMLHttpRequest();
    request.onreadystatechange=function() {
      if (request.readyState==4)
        {
          container.className = container.className.replace(/ ?\bloading\b/, "");
          var resultDocument = request.responseXML;
          var formula = resultDocument.getElementById(formula_id);
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
                '//*[@id="'+formula_id+'"]'+substitution.getAttribute("xpath"),
                document.getElementById(formula_id),
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
            var entries = xpath('//h:div[@class="RDFa"]',
                                resultDocument,
                                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
            for (var entry_index = 0; entry_index < entries.snapshotLength; ++entry_index)
            {
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
            }
            container.appendChild(metadata);
        }
    };
    request.open("GET", "http://search.mathweb.org/get-formula.php?formula-url=" + encodeURIComponent(uri), true);// Asynchronous
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

// Define standard functions for defective browsers like IE 5:
if (! Array.prototype.push)
  {
    Array.prototype.push = function()
      {
        for (var i in arguments) this[this.length] = arguments[i];

        return this.length;
      };
  }


var mq_ns = "http://mathweb.org/MathQuery";
var formula_search_variables;
formula_search_variables = { free:{}, bound:{} };
var formula_search_variables_header;
function formula_changed(omobj)
{
  // This code is copied from Sentido, and modified a bit afterwards to
  // account for the small differences in the UI: XUL vs. HTML.
  var formula_display;
  formula_display = document.getElementById("formula-display-mathml");
  if (formula_display)
    {
      var node;
      node = formula_transformer.transformToFragment(omobj, document);
      node = node.firstChild;
      while (node && node.nodeType != Node.ELEMENT_NODE)
        {
          node = node.nextSibling;
        }
      if (node.firstChild && "math" == node.firstChild.localName)
        {
          // There is a span element around the math element.
          node.firstChild.setAttribute("mode", "display");
        }
      formula_display.replaceChild(node, formula_display.firstChild);
    }

  formula_omobj = omobj;

  var variable_types_tbody;
  variable_types_tbody = document.getElementById("formula-search-variable-types");
  var variables;
  variables = formula_editor.get_variables();
  var i;
  for (i = variable_types_tbody.childNodes.length; i > 2; --i)
    {
      variable_types_tbody.removeChild(variable_types_tbody.lastChild);
    }

  var variable_name;
  var variable_row;
  var previous_variable_row;
  var row_item;
  var input;

  previous_variable_row = null;
  for (i in variables.free)
    {
      variable_name = variables.free[i].getAttribute("name");
      variable_row = formula_search_variables.free[variable_name];
      if (!variable_row)
        {
          variable_row = document.createElement("tr");
          variable_row.setAttribute("class", "symbol-row");
          variable_row.generic  = variables.free[i].hasAttributeNS(mq_ns, "generic");

          row_item = document.createElement("th");
          row_item.appendChild(document.createTextNode(variable_name));
          variable_row.appendChild(row_item);

          row_item = document.createElement("th");
          input = document.createElement("input");
          input.setAttribute("type", "checkbox");
	  if (variable_row.generic) input.setAttribute("checked", "checked");
          input.setAttribute("name", "formula-search-free-variable-generic-" + variable_name);
          input.setAttribute("onchange", "formula_search_variable_event(event)");
          row_item.appendChild(input);
          variable_row.appendChild(row_item);

          row_item = document.createElement("th");
          input = document.createElement("input");
          input.setAttribute("type", "checkbox");
          input.setAttribute("name", "formula-search-free-variable-function-" + variable_name);
          input.setAttribute("onchange", "formula_search_variable_event(event)");
          row_item.appendChild(input);
          variable_row.appendChild(row_item);

          formula_search_variables.free[variable_name] = variable_row;
        }

      variable_types_tbody.insertBefore(variable_row, previous_variable_row);
      previous_variable_row = variable_row;
    }
  var separator;
  variable_row = document.createElement("tr");
  variable_row.setAttribute("class", "symbol-row");
  row_item = document.createElement("th");
  row_item.setAttribute("colspan", "4");
  separator = document.createElement("hr");
  separator.setAttribute("style", "padding:0; margin:0");
  row_item.appendChild(separator);
  variable_row.appendChild(row_item);
  variable_types_tbody.appendChild(variable_row);
  previous_variable_row = null;
  for (i in variables.bound)
    {
      variable_name = variables.bound[i].getAttribute("name");
      variable_row = formula_search_variables.bound[variable_name];
      if (!variable_row)
        {
          variable_row = document.createElement("tr");
          variable_row.setAttribute("class", "symbol-row");
          variable_row.generic  = true;

          row_item = document.createElement("th");
          row_item.appendChild(document.createTextNode(variable_name));
          variable_row.appendChild(row_item);

          row_item = document.createElement("th");
          input = document.createElement("input");
          input.setAttribute("type", "checkbox");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "formula-search-bound-variable-generic-" + variable_name);
          input.setAttribute("onchange", "formula_search_variable_event(event)");
          row_item.appendChild(input);
          variable_row.appendChild(row_item);

          row_item = document.createElement("th");
          input = document.createElement("input");
          input.setAttribute("type", "checkbox");
          input.setAttribute("name", "formula-search-bound-variable-function-" + variable_name);
          input.setAttribute("onchange", "formula_search_variable_event(event)");
          row_item.appendChild(input);
          variable_row.appendChild(row_item);

          formula_search_variables.bound[variable_name] = variable_row;
        }

      variable_types_tbody.insertBefore(variable_row, previous_variable_row);
      previous_variable_row = variable_row;
    }

  form.identifier.value = "";
  form.start.value = "0";
}

function formula_search_variable_event(event)
{
  var name;
  name = event.target.getAttribute("name");
  var property;
  property = name.replace(/.*-([^-]*)-[^-]*$/, "$1");
  var variable_name;
  variable_name = name.replace(/.*-([^-]*)$/, "$1");
  var value;
  value = event.target.checked;
  var variable_row;
  variable_row = event.target.parentNode.parentNode;

  switch (property)
    {
    case "generic":
      if (value) variable_row.generic = true;
      else       variable_row.generic = false;
      break;
    case "function":
      if (value) formula_editor.declare_variable(variable_name, "morphism");
      else       formula_editor.declare_variable(variable_name, "object");
      break;
    default:
      message("Error: property="+property+", name="+name);
    }

  form.start.value = "0";
}

function init()
{
  if (!formula_editor)
    {
      formula_editor = new Formula_editor(formula_input);
      formula_editor.init("sentido", "sentido/contexts");
      formula_editor.onchange = formula_changed;
      formula_editor.enable_edit(true);
    }
  formula_editor.change_to_context(document.getElementById('sentido-embedded-input-editor-syntax').value);

  if (!form.q.value && formula_input.value) formula_editor.linear_to_openmath(formula_input.value);

  formula_input.focus();

  setOMCode();
  switch (results.contentDocument.documentElement.nodeName)
  {
  case "success":
  case "error":
    results_loaded(results);
    break;
  default:
  }
  results.setAttribute("onload", "results_loaded(this)");
}

function getOMCode()
{
  switch (form.type.value)
  {
  case "string":
    break;
  case "mathml":
  case "openmath":
    form.q.value = sentido.getSerializedXmlFormula();
    break;
  default:
    alert("Unknown query type '" + form.type.value + "'");
  }
}
function setOMCode()
{
  if (!form.q.value) return;

  switch (form.type.value)
  {
  case "string":
    break;
  case "mathml":
  case "openmath":
    sentido.setSerializedXmlFormula(form.q.value);
    break;
  default:
    alert("Unknown query type '" + form.type.value + "'");
  }
}

function put_formula_in_title(linear_formula)
{
  if ("undefined" == typeof linear_formula)
    {
      linear_formula = document.getElementById("sentido-embedded-input-editor-textarea").value;
    }
  document.title = "MathWeb Search: " + linear_formula;
}

function toggle_palette(palette_item)
{
  var palette_table = palette_item;
  while (palette_table.parentNode && palette_table.localName != 'table') palette_table = palette_table.parentNode;
  var class_name = 'symbol-palette';
  if (class_name == palette_table.getAttribute('class')) class_name = 'symbol-palette-folded';
  palette_table.setAttribute('class', class_name);
}

var message_count;
message_count = 0;
function message(text)
{
  // Avoid annoying the user if we get a cascade of error messages.
  if (++message_count < 10) alert(text);
}

var sentido =
  {
    serializer: new XMLSerializer(),
    parser: new DOMParser(),
    getSerializedXmlFormula: function ()
    {
      if (!formula_omobj) return '<mws:query xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:mws="http://www.mathweb.org/mws/ns" limitmin="0" answsize="3"></mws:expr></mws:query>';

      var variables;
      variables = formula_editor.get_variables();
      var variable;
      var variable_name;
      var variable_row;
      var i;

      for (i in variables.free)
        {
          variable = variables.free[i];
          variable_name = variable.getAttribute("name");
          variable_row = formula_search_variables.free[variable_name];
          if (variable_row.generic)
            {
              variable.setAttributeNS(mq_ns, "generic", variable_name);
            }
          else
            {
              variable.removeAttributeNS(mq_ns, "generic");
            }
        }
      for (i in variables.bound)
        {
          variable = variables.bound[i];
          variable_name = variable.getAttribute("name");
          variable_row = formula_search_variables.bound[variable_name];
          if (variable_row.generic)
            {
              variable.setAttributeNS(mq_ns, "generic", variable_name);
            }
          else
            {
              variable.removeAttribute(mq_ns, "generic");
            }
        }

      var query = formula_omobj;
      query = query_translator_om_to_cmml.transformToFragment(query, query.ownerDocument);
      query.firstChild.setAttribute("limitmin", document.forms.editor.start.value);
      query.firstChild.setAttribute("answsize", document.forms.editor.num.value);

      return this.serializer.serializeToString(query);
    },
    setSerializedXmlFormula: function (serialized_XML_formula)
    {
      var xml_document;
      xml_document = this.parser.parseFromString(serialized_XML_formula, "text/xml");
      if ("math" == xml_document.documentElement.localName || "query" == xml_document.documentElement.localName)
	    {
	        xml_document = query_translator_cmml_to_om.transformToDocument(xml_document);
	    }
      if ("OMOBJ" == xml_document.documentElement.localName)
        {
          formula_omobj = xml_document.documentElement;
          formula_editor.select_node(formula_omobj);
	      formula_changed(formula_omobj);
        }
      else
	    {
	        alert("Error: the formula root node is '" + xml_document.documentElement.nodeName + "'\n" + this.serializer.serializeToString(xml_document));
	    }
    }
  };

function build_transformer(stylesheet_url)
{
  var request, transformer;
  try
    {
      request = new XMLHttpRequest();
      request.open("GET", stylesheet_url, false);
      request.send(null);
      transformer = new XSLTProcessor();
      transformer.importStylesheet(request.responseXML);
    }
  catch (error)
    {
      alert("Error when loading the XSL stylesheet '"
	    + stylesheet_url + "'\n" + error);
    }
  request = null;

  return transformer;
}

///////////////////////////////////////////////////////////////////////////
//
//   Copyright 2004,2005,2007 Alberto González Palomo
//   Author: Alberto González Palomo <http://www.matracas.org>
//
//   This program is free software; you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation; either version 2 of the License, or
//   (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with this program; if not, write to the Free Software
//   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
/////////////////////////////////////////////////////////////////////////////

var namespace_map = {};

function register_namespace_map(additional_namespace_map)
{
  var prefix;
  var uri;
  for (var i in additional_namespace_map)
    {
      prefix = i;
      uri = additional_namespace_map[i];
      if (prefix in namespace_map
          && namespace_map[prefix] != uri)
        {
          message("Error: namespace declaration clash:\n"
                  + prefix + ": " + namespace_map[prefix] + "\n"
                  + prefix + ": " + uri);
        }
      if (uri in namespace_map
          && namespace_map[uri] != prefix
          // The default prefix can have the same URI as a named one:
          && (namespace_map[uri] && prefix))
        {
          message("Error: namespace declaration clash:\n"
                  + namespace_map[uri] + ": " + uri + "\n"
                  + prefix                    + ": " + uri);
        }
      namespace_map[prefix] = uri;
      namespace_map[uri] = prefix;
    }
}

function namespace_resolver(prefix)
{
  var uri;
  uri = namespace_map[prefix];
  if (undefined === uri)
    {
      message("Warning: " + document.title + ": Unhandled namespace prefix: "
              + prefix);
    }

  return uri;
}

function namespace_URI_resolver(uri)
{
  var prefix;
  prefix = namespace_map[uri];
  if (undefined === prefix)
    {
      message("Warning: " + document.title + ": Unhandled namespace URI: "
              + uri);
    }

  return prefix;
}

function xpath_first(expression, node)
{
  var result;
  try
    {
      result = xpath(expression, node, XPathResult.FIRST_ORDERED_NODE_TYPE);
      if (result) result = result.singleNodeValue;
      else        result = null;
    }
  catch (exception)
    {
      message("Error: expression = \"" + expression + "\", node = " + node
              + ": " + exception);
      result = null;
    }

  return result;
}

function xpath_number(expression, node)
{
  var result;
  try
    {
      result = xpath(expression, node, XPathResult.NUMBER_TYPE);
      if (result) result = result.numberValue;
      else        result = undefined;
    }
  catch (exception)
    {
      message("Error: expression = \"" + expression + "\", node = " + node
              + ": " + exception);
      result = undefined;
    }

  return result;
}

function xpath_boolean(expression, node)
{
  var result;
  try
    {
      result = xpath(expression, node, XPathResult.BOOLEAN_TYPE);
      if (result) result = result.booleanValue;
      else        result = undefined;
    }
  catch (exception)
    {
      message("Error: expression = \"" + expression + "\", node = " + node
              + ": " + exception);
      result = undefined;
    }

  return result;
}

function xpath_string(expression, node)
{
  var result;
  try
    {
      result = xpath(expression, node, XPathResult.STRING_TYPE);
      if (result) result = result.stringValue;
      else        result = null;
    }
  catch (exception)
    {
      message("Error: expression = \"" + expression + "\", node = " + node
              + ": " + exception);
      result = null;
    }

  return result;
}

function xpath(expression, node, result_type)
{
  var document_node;
  if (document.DOCUMENT_NODE == node.nodeType) document_node = node;
  else if ("ownerDocument" in node) document_node = node.ownerDocument;
  else message("Error: can't get document for " + node);

  if ("[DocumentFragment]" == node.constructor)
    {
      // When the node is a DocumentFragment, the evaluate() function throws
      // the following exception:
      // "Object cannot be created in this context" code:"9"
      // nsresult:"0x80530009 (NS_ERROR_DOM_NOT_SUPPORTED_ERR)"
      message("Error: Element.evaluate(xpath, node, nsres, type, result) does not accept DocumentFragment as root.");
    }

  var result;
  try
    {
      result = document_node.evaluate(expression, node,
                                      namespace_resolver,
                                      result_type, null);
    }
  catch (exception)
    {
      message("Error: expression = \"" + expression + "\", node = " + node
              + ", result_type = " + result_type
              + ": " + exception);
      result = null;
    }

  return result;
}

function build_xpath(element)
{
  var path;
  if (element && document.ELEMENT_NODE == element.nodeType)
    {
      var e = element;
      path = path_node(e);
      while ((e = e.parentNode))
        {
          if (document.ELEMENT_NODE == e.nodeType)
            {
              path = path_node(e) + "/" + path;
            }
        }
      path = "/" + path;
    }
  else
    {
      path = "/";
    }

  return path;
}

function path_node(element)
{
  var full_name;
  if (element.prefix)
    {
      full_name = element.prefix + ":" + element.localName;
    }
  else if (false && element.namespaceURI)
    {
      full_name = namespace_URI_resolver(element.namespaceURI) + ":" + element.localName;
    }
  else
    {
      full_name = element.nodeName;
    }

  var selector;
  if (element.hasAttribute("xml:id"))
    {
      selector = full_name + "[@xml:id='" + element.getAttribute("xml:id") + "']";
    }
  else
    {
      var siblings_count;
      siblings_count = xpath_number("count(preceding-sibling::"
                                    + full_name
                                    + ")+count(following-sibling::"
                                    + full_name
                                    + ")",
                                    element
                                    );
      if (true || siblings_count > 0)// FIXME: for debugging.
        {
          var index;
          index = xpath_number("count(preceding-sibling::"
                               + full_name
                               + ")",
                               element
                               ) + 1;// XPath indexes are 1-based.
          selector = full_name + "[" + index + "]";
        }
      else
        {
          selector = full_name;
        }
    }

  return selector;
}
///////////////////////////////////////////////////////////////////////////
//
//   Copyright 2005,2006,2007,2008,2009 Alberto González Palomo
//   Author: Alberto González Palomo <http://www.matracas.org>
//
//   This program is free software; you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation; either version 2 of the License, or
//   (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with this program; if not, write to the Free Software
//   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
/////////////////////////////////////////////////////////////////////////////

// Notes:
// 2005-05-08 23:06: I've just found about a previous implementation of the
//   idea of a cascaded parser:
//    http://www.ai.sri.com/%7Eappelt/fastus-schabes.html
// 2006-11-12 11:24: There was a paper published in 1996 describing
//   cascade parsers: http://citeseer.ist.psu.edu/abney96partial.html

var parser_namespace = "http://www.matracas.org/ns/cascada";

function Ternary_tree()
{
  var self = this;

  function get_tree() { return tree; }

  function Entry(code_point)
  {
    this.code_point = code_point;
    //this.data = undefined;
    this.smaller = undefined;
    this.same = undefined;
    this.bigger = undefined;
  }

  function add_entry(pattern, data)
  {
    var entry;

    var match;
    match = search(pattern);

    var code_point;
    if (!tree)
      {
        code_point = pattern.charCodeAt(0);
        entry = new Entry(code_point);
        match.last_tested_entry  = entry;
        match.last_matched_entry = entry;
        match.length = 0;
        match.index = 1;
        tree = entry;
      }
    else if (match.last_matched_entry != match.last_tested_entry)
      {
        var parent;
        code_point = pattern.charCodeAt(match.index);
        entry = new Entry(code_point);
        parent = match.last_tested_entry;
        if      (code_point < parent.code_point) parent.smaller = entry;
        else if (code_point > parent.code_point) parent.bigger  = entry;
        ++match.index;
        match.last_tested_entry = entry;
      }

    while (match.index < pattern.length)
      {
        code_point = pattern.charCodeAt(match.index);
        entry = new Entry(code_point);
        match.last_tested_entry.same = entry;

        // From now on, we are matching as we go.
        ++match.index;
        match.last_tested_entry = entry;
      }

    match.length = match.index;

    // Now we have a complete match, so we store the associated data.
    // TODO: handle the case where this entry already had data. Should we
    //       at least issue a warning before overwriting the old data?
    //       Currently it's just overwritten.
    match.last_tested_entry.data = data;
  }

  function search(string, begin)
  {
    var match;
    match = {"length":0,
             "last_tested_entry":undefined, "last_matched_entry":undefined};

    if (!begin) begin = 0;

    match.index = begin;

    var node;
    node = tree;
    var string_length;
    string_length = string.length;
    var code_point;
    if (match.index < string_length) code_point = string.charCodeAt(match.index);
    while (node && match.index < string_length)
      {
        match.last_tested_entry = node;
        if (code_point == node.code_point)
          {
            ++match.index;
            code_point = string.charCodeAt(match.index);
            if ("data" in node)
              {
                // We take the longest (latest) match.
                // This could be extended easily to return an array with
                // all matches.
                match.length = match.index - begin;
                match.data = node.data;
              }
            node = node.same;
            match.last_matched_entry = match.last_tested_entry;
          }
        else if (code_point < node.code_point)
          {
            node = node.smaller;
          }
        else
          {
            node = node.bigger;
          }
      }

    return match;
  }

  // Constructor:
  var tree;

  // Public functions:
  this.get_tree = get_tree;
  this.Entry = Entry;
  this.add_entry = add_entry;
  this.search = search;
}

function Symbol(parser, replacement, identifier)
{
  var self = this;
  this.replacement = replacement;
  this.identifier = identifier;
}

function Term_class(parser, subclasses, replacement, identifier, complement)
{
  var self = this;

  function add(subclasses)
  {
    if (!subclasses) return;

    for (var c in subclasses)
      {
        if (!subclasses[c]) alert("Undefined tokens in class "
                                  + self.identifier + ":\n"
                                  + subclasses.toSource());
        if (parser.is_token(subclasses[c]))
          {
            self.subclasses.push(subclasses[c]);
            var term_subclass;
            term_subclass = parser.get_class(subclasses[c]);
            if (term_subclass) term_subclass.superclasses[identifier] = self;
          }
        else
          {
            self.subclasses.push(parser.symbol(subclasses[c]));
          }
      }

    recompile_dependent_rules();
  }

  function recompile_dependent_rules()
  {
    for (var r in self.rules) self.rules[r].compile();
    for (var s in self.superclasses)
      {
        self.superclasses[s].recompile_dependent_rules();
      }
  }

  // Constructor:
  this.replacement = replacement;
  this.identifier = identifier;
  this.complement = (complement?true:false);// Normalize to true/false.
  this.rules = {};// Rules that mention this class.
  this.superclasses = {};// Classes that contain this one as subclass.
  this.subclasses = [];
  add(subclasses);

  // Public functions:
  this.add = add;
  this.recompile_dependent_rules = recompile_dependent_rules;
}

function Rule(parser, unexpanded_pattern, replacement, identifier, context)
{
  var self = this;

  function expand_pattern(pattern, pattern_chars)
  {
    var token;
    var i;
    for (i in pattern)
      {
        token = pattern[i];
        var subclass;
        subclass = parser.get_class(token);
        if (subclass)
          {
            subclass.rules[replacement] = self;
            var subclass_tokens;
            subclass_tokens = [];
            parser.expand_subclasses(subclass, subclass_tokens);
            pattern_chars.push("[");
            if (subclass.complement) pattern_chars.push("^");
            pattern_chars.push(subclass_tokens.join(""));
            pattern_chars.push("]");
          }
        else
          {
            pattern_chars.push(token);
          }
      }
  }

  function compile()
  {
    var pattern_chars;
    pattern_chars = [];
    var expanded_pattern;
    var context_before;
    var context_after;

    pattern_chars.length = 0;// Redundant, just in case we reuse the array.
    expand_pattern(unexpanded_pattern, pattern_chars);
    expanded_pattern = pattern_chars.join("");

    if (context)
      {
        // Add the context patterns to "expanded_pattern".
        if (context[0] instanceof Array)
          {
            pattern_chars.length = 0;
            expand_pattern(context[0].join("|"), pattern_chars);
            context_before = pattern_chars.join("");
          }
        else
          {
            pattern_chars.length = 0;
            expand_pattern(context[0], pattern_chars);
            context_before = pattern_chars.join("");
          }
        if (context[1] instanceof Array)
          {
            pattern_chars.length = 0;
            expand_pattern(context[1].join("|"), pattern_chars);
            context_after = pattern_chars.join("");
          }
        else
          {
            pattern_chars.length = 0;
            expand_pattern(context[1], pattern_chars);
            context_after = pattern_chars.join("");
          }
        expanded_pattern
          = "(" + context_before + ")"
          + expanded_pattern
          + "(" + context_after + ")";
      }

    self.pattern = new RegExp(expanded_pattern, "g");
  }

  function match(string)         { return self.pattern.exec(string); }

  function last_index()          { return self.pattern.lastIndex; }

  function set_last_index(index) { self.pattern.lastIndex = index; }

  // Constructor:
  this.pattern = null;
  this.context = context;
  this.replacement = replacement;
  this.identifier = identifier;
  compile();

  // Public functions:
  this.compile = compile;
  this.match = match;
  this.last_index = last_index;
  this.set_last_index = set_last_index;
}

Rule.util =
  {
    any: function (pattern)
    {
      if (pattern.length > 1) return "(?:" + pattern + ")+";
      else                    return pattern + "+";
    },

    star: function (pattern)
    {
      if (pattern.length > 1) return "(?:" + pattern + ")*";
      else                    return pattern + "*";
    },

    or: function (patterns)
    {
      if (patterns instanceof Array) return "(?:" + patterns.join("|") + ")";
      else alert("Parser.or(patterns): patterns is not an array.");
      return patterns.toString();
    },

    opt: function (pattern)
    {
      if (pattern.length > 1) return "(?:" + pattern + ")?";
      else                    return pattern + "?";
    },

    not: function (patterns)
    {
      if (patterns instanceof Array) return "[^" + patterns.join("") + "]";
      else alert("Parser.not(patterns): patterns is not an array.");
      return patterns.toString();
    },

    literal: function (text)
    {
      return text.replace(/(\.|\?|\||\+|\*|\(|\)|\[|\]|\{|\}|\\|\^|\$)/g,
                          "\\$1");
    },

    input_begin: function ()
    {
      return "^";
    },

    input_end: function ()
    {
      return "$";
    }

  };

function Stage(model)
{
  if (model)
    {
      this.string = model.string;
      this.data = model.data.slice(0);
    }
  else
    {
      this.string = "";
      this.data  = [];
    }
}

function Parser()
{
  var self = this;

  function is_token(token)
  {
    return unicode_private_area_regexp.test(token);
  }

  function get_classes_with(token)
  {
    var classes;
    classes = [];
    var subclass;
    var term;
    term = get_term(token);

    for (var c in term_classes)
      {
        subclass = term_classes[c];
        for (var i in subclass.subclasses)
          if (token == subclass.subclasses[i])
            {
              classes.push(subclass.identifier);
              break;
            }
      }

    return classes;
  }

  function symbol_with_substring_comparison(identifier, is_regexp)
  {
    if (!identifier) throw "Parser.symbol(): no token given.";

    if (identifier in symbols) return symbols[identifier].replacement;

    ++last_term_index_assigned;
    var replacement;
    replacement = String.fromCharCode(last_term_index_assigned);
    var new_symbol;
    new_symbol = new Symbol(self, replacement, identifier);
    symbols[identifier] = new_symbol;
    terms_back[replacement] = new_symbol;

    if (identifier.length > longest_symbol_length)
      {
        longest_symbol_length = identifier.length;
      }

    token_table[identifier] = replacement;

    return replacement;
  }

  function symbol_with_ternary_tree(identifier, is_regexp)
  {
    if (!identifier) throw "Parser.symbol(): no token given.";

    if (identifier in symbols) return symbols[identifier].replacement;

    var match;
    match = ternary_tree.search(identifier);
    if (match.length == identifier.length) return match.data.replacement;

    ++last_term_index_assigned;
    var replacement;
    replacement = String.fromCharCode(last_term_index_assigned);
    var new_symbol;
    new_symbol = new Symbol(self, replacement, identifier);
    symbols[identifier] = new_symbol;
    ternary_tree.add_entry(identifier, new_symbol);
    terms_back[replacement] = new_symbol;

    token_table[identifier] = replacement;

    return replacement;
  }

  function symbol_with_rules(identifier, is_regexp)
  {
    var pattern;
    if (is_regexp) pattern = identifier;
    else           pattern = Rule.util.literal(identifier);

    var replacement;
    if (identifier in token_table) replacement = token_table[identifier];
    if (!replacement)
      {
        ++last_term_index_assigned;
        replacement = String.fromCharCode(last_term_index_assigned);
      }

    var new_rule;
    new_rule = new Rule(self, pattern, replacement, identifier, null);
    symbol_rules.push(new_rule);
    terms_back[replacement] = new_rule;

    token_table[identifier] = replacement;
    return replacement;
  }

  function term_class(identifier, subclasses)
  {
    return term_class_generic(identifier, subclasses, false);
  }

  function complement_term_class(identifier, subclasses)
  {
    return term_class_generic(identifier, subclasses, true);
  }

  function term_class_generic(identifier, subclasses, complement)
  {
    var replacement;
    if (identifier in token_table) replacement = token_table[identifier];
    if (!replacement)
      {
        ++last_term_index_assigned;
        replacement = String.fromCharCode(last_term_index_assigned);
      }
    var new_term_class;
    if (replacement in term_classes)
      {
        new_term_class = term_classes[replacement];
        if (new_term_class.complement != complement)
          {
            message("Error: new_term_class.complement != complement");
          }
        new_term_class.add(subclasses);
      }
    else
      {
        new_term_class = new Term_class(self,
                                        subclasses, replacement, identifier,
                                        complement);
        term_classes[replacement] = new_term_class;
      }

    token_table[identifier] = replacement;
    return replacement;
  }

  function rule(identifier, pattern, context)
  {
    var replacement;
    if (identifier in token_table) replacement = token_table[identifier];
    if (!replacement)
      {
        ++last_term_index_assigned;
        replacement = String.fromCharCode(last_term_index_assigned);
      }

    var new_rule;
    new_rule = new Rule(self, pattern, replacement, identifier, context);
    rules.push(new_rule);
    terms_back[replacement] = new_rule;

    token_table[identifier] = replacement;
    return replacement;
  }

  function action_rule(action, pattern, context)
  {
    var new_rule;
    new_rule = new Rule(self, pattern, action, action.name, context);
    rules.push(new_rule);

    return null;
  }

  function expand_subclasses(subclass, subclass_tokens)
  {
    var tokens;
    tokens = subclass.subclasses;
    subclass_tokens.push(tokens.join(""));
    var i;
    var token;
    for (i in tokens)
      {
        token = tokens[i];
        if (token in term_classes)
          {
            subclass = term_classes[token];
            if (subclass) expand_subclasses(subclass, subclass_tokens);
          }
      }
  }

  function current()
  {
    return String.fromCharCode(last_term_index_assigned + 1);
  }

  function reserve(identifier)
  {
    var replacement;
    replacement = String.fromCharCode(++last_term_index_assigned);
    if (identifier) token_table[identifier] = replacement;
    return replacement;
  }

  function get_term(token)
  {
    if (token in terms_back) return terms_back[token];
    else                     return null;
  }

  function get_class(token)
  {
    if (token in term_classes) return term_classes[token];
    else                       return null;
  }

  function parse(text)
  {
    var stage_stack;
    stage_stack = [];
    var last_stage;
    last_stage = tokenize(text);
    stage_stack.push(last_stage);
    var fence_match;
    do
      {
        last_stage = stage_stack[stage_stack.length - 1];
        fence_match = fence_regexp.exec(last_stage.string);
        if (fence_match && fence_match.index >= 0)
          {
            if (apply_rules(stage_stack, fence_match.index, fence_regexp.lastIndex))
              {
                fence_regexp.lastIndex = 0;
              }
          }
        else
          {
            apply_rules(stage_stack);
          }
      }
    while (fence_match && fence_match.index >= 0);

    return stage_stack;
  }

  function parse_to_XML(text)
  {
    var result;
    result = parse(text);
    //if ("application" in window) application.dump_properties(result[0]);
    var stage;
    stage = result[result.length - 1];
    var container_document_fragment;
    container_document_fragment = document.createDocumentFragment();
    var container;
    container = document.createElementNS(parser_namespace, "result");
    container_document_fragment.appendChild(container);

    for (var i in stage.string)
      {
        append_XML_node(container, stage.data[i], 1);
      }

    return container_document_fragment;
  }

  function append_XML_node(parent, data, level)
  {
    if (!data || level > 100)
      {
        parent.appendChild(document.createTextNode("[NO DATA]"));
        return;
      }

    var max_level;
    max_level = 8;
    var node;
    if (data.stage_index > 0)
      {
        node = document.createElementNS(parser_namespace, data.identifier);
      }
    else
      {
        if (data.identifier)
          {
            node = document.createElementNS(parser_namespace, "token");
            node.setAttribute("literal", data.identifier);
          }
        else
          {
            node = document.createElementNS(parser_namespace, "text");
            node.setAttribute("literal", data.token);
          }
      }
    if ("children" in data)
      {
        for (var i in data.children)
          {
            append_XML_node(node, data.children[i], level + 1);
          }
        node.setAttribute("begin", node.firstChild.getAttribute("begin"));
        node.setAttribute("end",   node.lastChild.getAttribute("end"));
      }
    else
      {
	node.setAttribute("begin", data.begin);
	node.setAttribute("end",   data.end);
      }
    parent.appendChild(node);
  }

  function unparse_from_XML(parse_tree)
  {
    // The parse tree can be either a document fragment (as produced by
    // parse_to_XML), or a DOM node.
    var linear_content;
    linear_content = "";
    var tokens;
    tokens = [];
    collect_tokens_from_parse_tree(parse_tree, tokens);
    if (tokens.length)
      {
        var tentative_linear_content;
        tentative_linear_content = tokens.join("");
        var recognized_tokens;
        recognized_tokens = tokenize_as_strings(tentative_linear_content);
	//alert("tokens.length: " + tokens.length + ", recognized_tokens.length:" + recognized_tokens.length + "\n" + tokens.toSource() + "\n" + recognized_tokens.toSource());
        var i;
	var last_correct_token;
	last_correct_token = -1;
	linear_content = "";
	while ((last_correct_token + 1) < tokens.length)
	  {
	    for (i = last_correct_token + 1; i < recognized_tokens.length; ++i)
	      {
		linear_content += tokens[i];
		if (recognized_tokens[i] != tokens[i])
		  {
		    linear_content += " ";
		    tentative_linear_content = linear_content + tokens.slice(i+1).join("");
		    recognized_tokens = tokenize_as_strings(tentative_linear_content);
		    break;
		  }
	      }
	    last_correct_token = i;
	  }
        if (tokens.length != recognized_tokens.length)
          {
            var powerful_message;
            powerful_message = "\nafter '";
	    for (i = 0; i < tokens.length && i < recognized_tokens.length; ++i)
	      if (tokens[i] == recognized_tokens[i])
		{
		  powerful_message += tokens[i];
		}
	      else
		{
		  powerful_message += "'\n" + i + " [" + tokens[i] + "] != [" + recognized_tokens[i].token + "]\n";
		  break;
		}
            message("Error: the given parse tree contains tokens that would not be recognized by the parser." + powerful_message);
          }
      }

    return linear_content;
  }
  function collect_tokens_from_parse_tree(parse_tree, tokens)
  {
    var child;
    child = parse_tree.firstChild;
    while (child)
      {
        switch (child.localName)
          {
          case "token":
          case "text":
            tokens.push(child.getAttribute("literal"));
            break;
          default:
            collect_tokens_from_parse_tree(child, tokens);
            break;
          }

        child = child.nextSibling;
      }
  }
  function tokenize_as_strings(string)
  {
    var s = [];
    var tokens;
    tokens = tokenize(string).data;

    for (var i = 0; i < tokens.length; ++i)
      {
	s.push(string.substring(tokens[i].begin, tokens[i].end));
      }

    return s;
  }

  // Returns whether some rule matched or not.
  // Begin and end are optional, and ignored unless both are distinct from 0.
  function apply_rules(stage_stack, begin, end)
  {
    var at_least_one_rule_applied;
    at_least_one_rule_applied = false;

    var stage;
    var stage_index;
    stage = new Stage();
    stage_index = stage_stack.length;
    var last_stage;
    var string;
    last_stage = stage_stack[stage_stack.length - 1];
    string = last_stage.string;
    var initial_string_length;
    initial_string_length = string.length;

    if (!begin) begin = 0;
    if (!end)   end   = 0;
    var rules_applied_in_iteration;
    do
      {
        var match_begin;
        var match_end;
        var substring_to_match;
        if (begin >= 0 && end > begin)
          {
            match_begin        = begin;
            match_end          = end - (initial_string_length - string.length);
            substring_to_match = string.substring(0, match_end);
          }
        else
          {
            match_begin        = 0;
            match_end          = string.length;
            substring_to_match = string;
          }

        var r;
        for (r = 0; r < rules.length; ++r)
          {
            rules[r].set_last_index(match_begin);
          }
        rules_applied_in_iteration = 0;
        for (r = 0; r < rules.length; ++r)
          {
            var rule;
            var data;

            var match;
            var p;

            // The first version of the rest of this block was the following
            // line, but we need to keep track of how many tokens are matched
            // by each rule, not just replace them.
            //stage = stage.replace(rules[r].pattern, rules[r].replacement);
            rule = rules[r];

            if ((match = rule.match(substring_to_match)))
              {
                if (rule.context)
                  {
                    var last_group_index;
                    last_group_index = match.length - 1;
                    if (!match[1] && !match[last_group_index])
                      {
                        message("Warning: there is a null context match in " + rule.identifier + ":\n"
                                + match.toSource()
                                );
                      }
                    // Check the context, and discard the match if it's not
                    // there.
                    if (match[1]) match.index += match[1].length;
                    if (match[last_group_index]) rule.set_last_index(rule.last_index() - match[last_group_index].length);
                    // The following shouldn't happen with sane rules, but
                    // this way we avoid the program from blocking in such
                    // a happenstance.
                    if (match.index == rule.last_index())
                      {
                        alert("The rule " + rule.identifier +
                              " has a context match, but its own match is void:\n"
                              + rule);
                        rule.set_last_index(match.index + 1);
                        continue;// for (r in rules)
                      }
                  }

                var replacement;
                replacement = rule.replacement;
                if ("function" == typeof(replacement))
                  {
                    message("Matched function rule " + rule.identifier);
                    // If the action function returns false, it means that
                    // there should not be any replacement of the matched
                    // input. For instance, when declaring variables.
                    replacement = rule.replacement(self, rule, substring_to_match.substring(match.index, rule.last_index()));
                    if (!replacement)
                      {
                        r = 0;
                        continue;
                      }
                  }

                // We only count rules that cause changes in the stage.
                at_least_one_rule_applied = true;
                ++rules_applied_in_iteration;

                data = {};
                data.token = replacement;
                data.identifier = rule.identifier;
                data.begin = match.index;
                data.end   = rule.last_index();
                data.stage_index = stage_index;
                data.children = [];
                var is_mergeable;
                is_mergeable = self.merge_stages;
                var last_stage_data;
                for (p = data.begin; p < data.end; ++p)
                  {
                    last_stage_data = last_stage.data[p];
                    data.children.push(last_stage_data);
                    is_mergeable &= (last_stage_data.stage_index + 1
                                     < stage_index);
                  }
                var replacement_count;
                replacement_count = data.end - data.begin;
                if (is_mergeable)
                  {
                    // Assuming replacement.length = 1:
                    last_stage.data.splice(data.begin,
                                           replacement_count, data);

                    last_stage.string
                      = string.substring(0, data.begin)
                      + data.token
                      + string.substring(data.end);
                    string = last_stage.string;
                  }
                else
                  {
                    // Assuming replacement.length = 1:
                    stage.data  = last_stage.data.slice(0);// Shallow copy.
                    stage.data.splice(data.begin, replacement_count, data);

                    stage.string
                      = string.substring(0, data.begin)
                      + data.token
                      + string.substring(data.end);

                    stage_stack.push(stage);

                    stage = new Stage();
                    stage_index = stage_stack.length;
                    last_stage = stage_stack[stage_stack.length - 1];
                    string = last_stage.string;
                  }

                break;// for (r in rules): Apply only one rule per iteration.
              }
          }
      }
    while (rules_applied_in_iteration > 0);

    return at_least_one_rule_applied;
  }

  function tokenize_with_ternary_tree(text)
  {
    var tokens = new Stage();
    var cursor = 0;
    var literal_mode = false;
    var test_string;
    var test_length;

    var symbol;
    var data;
    while (cursor < text.length)
      {
        symbol = null;
	if (!literal_mode || '"' == text[cursor])
	  {
        var match;
        match = ternary_tree.search(text, cursor);
        if ("data" in match) symbol = match.data;
        if (implicit_variable_name_regexp)
          {
            test_string = text.substr(cursor);
            var variable_name_match;
            variable_name_match = implicit_variable_name_regexp.exec(test_string);
            if (variable_name_match
                && variable_name_match[0].length > match.length)
              {
                match = variable_name_match[0];
                test_string = test_string.substr(0, match.length);
                self.term_class("object_variable", self.symbol(test_string));
                symbol = symbols[test_string];
              }
          }
	    if ('"' == text[cursor]) literal_mode = !literal_mode;
	  }
        if (symbol)
          {
            // The actual match can be shorter than the test length if
            // there are not so many characters left in "text". Therefore,
            // we correct the test_length variable to reflect the actual
            // length matched.
            test_length = match.length;
            data = {};
            data.token = symbol.replacement;
            data.identifier = symbol.identifier;
            data.begin = cursor;
            data.end   = cursor + match.length;
            data.stage_index = 0;
            tokens.data.push(data);
            tokens.string += data.token;
            cursor += test_length;
          }
        else
          {
            if (self.ignore_space && text[cursor].match(/\$|\s/))
              {
                cursor += 1;
              }
            else
              {
                data = {};
                data.token = text[cursor];
                data.identifier = null;
                data.begin = cursor;
                data.end   = cursor + 1;
                data.stage_index = 0;
                tokens.data.push(data);
                tokens.string += data.token;
                cursor += 1;
              }
          }
      }

    return tokens;
  }

  function tokenize_with_substring_comparison(text)
  {
    var tokens;
    tokens = new Stage();
    var cursor;
    cursor = 0;
    var test_string;
    var test_length;

    var symbol;
    var data;
    while (cursor < text.length)
      {
        test_length = longest_symbol_length;
        if (cursor+test_length > text.length) test_length = text.length-cursor;
        symbol = null;
        while (!symbol && test_length > 0)
          {
            test_string = text.substr(cursor, test_length--);
            symbol = symbols[test_string];
            if (!symbol && implicit_variable_name_regexp)
              {
                var variable_name_match;
                variable_name_match = implicit_variable_name_regexp.exec(test_string);
                if (variable_name_match && variable_name_match[0].length == test_length)
                  {
                    // This is wasteful as it creates symbols for each
                    // intermediate string made while typing, but it does so
                    // only if they are not already defined, so in practice
                    // it's not so bad. It would be nice though to optimize it.
                    self.term_class("object_variable", self.symbol(test_string));
                    symbol = symbols[test_string];
                  }
              }
          }
        if (symbol)
          {
            // The actual match can be shorter than the test length if
            // there are not so many characters left in "text". Therefore,
            // we correct the test_length variable to reflect the actual
            // length matched.
            test_length = test_string.length;
            data = {};
            data.token = symbol.replacement;
            data.identifier = symbol.identifier;
            data.begin = cursor;
            data.end   = cursor + test_length;
            data.stage_index = 0;
            tokens.data.push(data);
            tokens.string += symbol.replacement;
            cursor += test_length;
          }
        else
          {
            if (self.ignore_space && text[cursor].match(/\$|\s/))
              {
                cursor += 1;
              }
            else
              {
                data = {};
                data.token = text[cursor];
                data.identifier = null;
                data.begin = cursor;
                data.end   = cursor + 1;
                data.stage_index = 0;
                tokens.data.push(data);
                tokens.string += text[cursor];
                cursor += 1;
              }
          }
      }

    return tokens;
  }

  // Constructor:
  // Implementation switches, until we can settle on the ternary tree one.
  //var implementation = "substring_comparison";// 122 ms
  var implementation = "ternary_tree";// 120 ms
  var symbol;
  var tokenize;
  switch (implementation)
    {
    case "substring_comparison":
      symbol = symbol_with_substring_comparison;
      tokenize = tokenize_with_substring_comparison;
      // apply_rules
      break;
    case "ternary_tree":
      symbol = symbol_with_ternary_tree;
      tokenize = tokenize_with_ternary_tree;
      // apply_rules
      break;
    case "symbols_as_rules":
      symbol = symbol_with_rules;
      tokenize = tokenize_with_rules;
      // apply_rules
      break;
    default:
      message("Unknown implementation: " + implementation);
      symbol = symbol_with_substring_comparison;
      tokenize = tokenize_with_strings;
      // apply_rules
    }

  var implicit_variable_name_regexp = null;
  if ("watch" in this)
    {
      // this.watch is not defined in KHTML, and this code is currently not
      // needed anyway.
      this.watch("implicit_variable_name_pattern", function (property, oldValue, newValue)
                 {
                   try
                     {
                       if (newValue) implicit_variable_name_regexp = new RegExp("^" + newValue);
                       else          implicit_variable_name_regexp = null;
                     }
                   catch (exception)
                     {
                       message("Error: implicit_variable_name_pattern: " + exception);
                       newValue = oldValue;
                     }

                   return newValue;
                 }
                 );
    }

  var token_table = {};
  this.token_table = token_table;

  // Only needed if tokenizing with substrings.
  var symbols = {};
  var longest_symbol_length = 0;

  // Only needed if tokenizing with the ternary tree.
  var ternary_tree = new Ternary_tree();

  // Only needed if tokenizing with rules.
  var symbol_rules = [];

  var rules = [];
  var terms_back = {};
  var term_classes = {};
  var unicode_private_area_begin = 0xE000;
  var unicode_private_area_end   = 0xF8FF;
  var unicode_private_area_regexp = /[\uE000-\uF8FF]/;
  var last_term_index_assigned = unicode_private_area_begin - 1;

  // TODO: make the fence characters configurable
  var fence_regexp;
  fence_regexp = new RegExp
    (symbol("(")+"[^"+symbol("(")+symbol(")")+"]+"+symbol(")") + "|" +
     symbol("[")+"[^"+symbol("[")+symbol("]")+"]+"+symbol("]") + "|" +
     symbol("{")+"[^"+symbol("{")+symbol("}")+"]+"+symbol("}") + "|" +
     "^"        +"[^"+symbol("(")+symbol(")")+"]+"+symbol(")") + "|" +
     "^"        +"[^"+symbol("[")+symbol("]")+"]+"+symbol("]") + "|" +
     "^"        +"[^"+symbol("{")+symbol("}")+"]+"+symbol("}") + "|" +
     symbol("(")+"[^"+symbol("(")+symbol(")")+"]+"+        "$" + "|" +
     symbol("[")+"[^"+symbol("[")+symbol("]")+"]+"+        "$" + "|" +
     symbol("{")+"[^"+symbol("{")+symbol("}")+"]+"+        "$",
     "g"// Important! Otherwise fence_regexp.lastIndex is not set.
     );// /\([^\)]*\)|\[[^\]]*\]|\{[^\}]*\}/g;
  //message("Fence regexp = " + fence_regexp.toString().replace(symbol("("), "\\(", "g").replace(symbol(")"), "\\)", "g").replace(symbol("["), "\\[", "g").replace(symbol("]"), "\\]", "g").replace(symbol("{"), "\\{", "g").replace(symbol("}"), "\\}", "g"));

  // Public functions:
  this.is_token    = is_token;
  this.get_classes_with = get_classes_with;
  this.symbol      = symbol;
  this.term_class  = term_class;
  this.complement_term_class = complement_term_class;
  this.rule        = rule;
  this.action_rule = action_rule;
  this.any         = Rule.util.any;
  this["+"]        = Rule.util.any;
  this.star        = Rule.util.star;
  this.opt_any     = Rule.util.star;
  this["*"]        = Rule.util.star;
  this.or          = Rule.util.or;
  this["|"]        = Rule.util.or;
  this.opt         = Rule.util.opt;
  this["?"]        = Rule.util.opt;
  this.not         = Rule.util.not;
  this.input_begin = Rule.util.input_begin;
  this.input_end   = Rule.util.input_end;
  this.current = current;
  this.reserve = reserve;
  this.get_term = get_term;
  this.get_class = get_class;
  this.expand_subclasses = expand_subclasses;
  this.parse = parse;
  this.parse_to_XML = parse_to_XML;
  this.unparse_from_XML = unparse_from_XML;
  // Public properties:
  this.ignore_space = false;
  this.merge_stages = true;
  this.implicit_variable_name_pattern = null;
}
///////////////////////////////////////////////////////////////////////////
//
//   Copyright 2004,2005,2006,2007,2008,2009 Alberto González Palomo
//   Author: Alberto González Palomo <http://www.matracas.org>
//
//   This program is free software; you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation; either version 2 of the License, or
//   (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with this program; if not, write to the Free Software
//   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
/////////////////////////////////////////////////////////////////////////////

var timer =
  {
  ms: 0,
  start_ms: 0,
  start: function() { this.start_ms = (new Date()).getTime(); },
  stop: function() { this.ms = (new Date()).getTime() - this.start_ms; }
  };

function QMath(base_url)
{
  var self = this;
  // Public functions:
  this.rebuild_context = rebuild_context;
  this.declare_variable = declare_variable;
  this.linear_to_openmath = linear_to_openmath;
  this.linear_to_parse_tree = linear_to_parse_tree;
  this.parse_tree_to_openmath = parse_tree_to_openmath;
  this.openmath_to_linear = openmath_to_linear;
  this.openmath_to_parse_tree = openmath_to_parse_tree;
  this.parse_tree_to_linear = parse_tree_to_linear;
  this.measure_performance = measure_performance;

  var openmath_namespace = "http://www.openmath.org/OpenMath";
  var    qmath_namespace = "http://www.matracas.org/ns/qmath";
  var   mathml_namespace = "http://www.w3.org/1998/Math/MathML";
  var    xhtml_namespace = "http://www.w3.org/1999/xhtml";

  var namespace_prefix_map =
    {
      "om"  : openmath_namespace,
      "q"   :    qmath_namespace,
      "m"   :   mathml_namespace,
      "h"   :    xhtml_namespace
    };

  var xml_serializer = new XMLSerializer();
  var gClipboardHelper;
  if ("Components" in window)
    {
      try
        {
          gClipboardHelper =
            Components.classes["@mozilla.org/widget/clipboardhelper;1"]
            .getService(Components.interfaces.nsIClipboardHelper);
        }
      catch (exception)
        {
          // This happens when using QMath in a web page, outside Sentido.
          // We just don't copy anything to the clipboard in that case.
          gClipboardHelper = null;
        }
    }

  var parser;
  var transformer_parse;
  var transformer_unparse;
  var stylesheet_unparse;
  var stylesheet_parse;
  var linear_as_xml;

  var transformer_build_stylesheet_parse;
  var debug = false;

  // Constructor code:
  if (! base_url) base_url = "";// Make sure it's a string, not "undefined".
  else if (! base_url.match(/\/$/)) base_url += "/";
  linear_as_xml = false;
  //parser = new Parser();
  //initialize_parser(parser);
  register_namespace_map(namespace_prefix_map);
  transformer_build_stylesheet_parse = new XSLTProcessor();
  var stylesheet;
  stylesheet = load_xml(base_url + "context_to_parse_stylesheet.xsl");
  if (!stylesheet) message("Can't load file: " + base_url + "context_to_parse_stylesheet.xsl");
  transformer_build_stylesheet_parse.importStylesheet(stylesheet);

  function grammar_action_declare_variable(parser, rule, matched_input)
  {
    parser.term_class("object_variable", [matched_input]);
    // TODO: We need to tell the parser to re-tokenize.

    return parser.symbol(matched_input);
  }

  function initialize_parser(p)
  {
    var t = p.token_table;
    var symbol = p.symbol;
    var rule = p.rule;
    var action_rule = p.action_rule;
    var term_class = p.term_class;
    var complement_term_class = p.complement_term_class;
    var reserve = p.reserve;

    var space = "(\\$|\\s)*";
    //p.ignore_space = true;
    rule("line_separator", ";");
    term_class("string_open",  ['"']);
    term_class("string_close", ['"']);
    complement_term_class("string_content", [t.string_close]);
    rule("string", t.string_open + p.any(t.string_content) + t.string_close);

    reserve("num_dec");
    reserve("num_int");
    reserve("num_rat");
    reserve("num_com");
    reserve("group_object");
    reserve("tuple_object");
    reserve("juxt_app_type_oo_o");
    reserve("juxt_app_type_mm_m");
    reserve("op_fact_app");
    reserve("op_exp_app");
    reserve("op_not_app");
    reserve("op_prod_app");
    reserve("op_plus_app");
    reserve("op_plus_app_unary");
    reserve("op_func_app");
    reserve("op_interval_app");
    reserve("op_eq_app");
    reserve("op_and_app");
    reserve("op_or_app");
    reserve("op_impl_app");
    reserve("binding_app");
    reserve("openmath_OMA");
    reserve("openmath_OMS");
    reserve("openmath_OMR");
    reserve("openmath_OMATTR");
    reserve("openmath_OMATP");

    /////////////////////////////////////////////////////////////////////
    // Classes:

    term_class("object", []);
    term_class("object_morphism", []);
    term_class("object_morphism_morphism", []);
    term_class("object_variable", []);
    term_class("object_morphism_variable", []);
    term_class("object_morphism_morphism_variable", []);
    term_class("op_fact", []);
    term_class("op_exp", []);
    term_class("op_prod", []);
    term_class("op_plus", []);
    term_class("op_interval", []);
    term_class("op_eq", []);
    term_class("op_not", []);
    term_class("op_and", []);
    term_class("op_or", []);
    term_class("op_impl", []);
    term_class("binding", []);

    term_class("morphism_app",
               [t.op_fact_app,
                t.op_exp_app,
                t.op_not_app,
                t.op_prod_app,
                t.juxt_app_type_oo_o,
                t.juxt_app_type_mm_m,
                t.op_plus_app,
                t.op_func_app,// This is the same as juxt_app_type_mo_o
                t.op_interval_app,
                t.op_eq_app,
                t.op_and_app,
                t.op_or_app,
                t.op_impl_app]
               );
    term_class("object",
               [t.string,
                t.num_int, t.num_dec, t.num_rat, t.num_com,
                t.tuple_object,
                t.group_object,
                t.morphism_app,
                //t.op_plus_app_unary,
                t.binding_app,
                t.object_variable,
                t.object_morphism_variable,
                t.object_morphism_morphism_variable,
		t.openmath_OMA, t.openmath_OMS, t.openmath_OMR, t.openmath_OMATTR, t.openmath_OMATP]
               );

    /////////////////////////////////////////////////////////////////////
    // Rules:

    ////////// Mathematics:
    //term_class("digit", ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    term_class("decimal_separator", ["."]);
    term_class("list_separator", [","]);
    //rule("num_dec", p.any(t.digit) + t.decimal_separator + p.any(t.digit)    );
    //rule("num_rat", p.any(t.digit) + symbol("/") + p.any(t.digit)            );
    //rule("num_com", p.any(t.digit) + t.op_plus + p.any(t.digit) + symbol("i"));
    //rule("num_int", p.any(t.digit)                                           );
    rule("num_dec", "[0-9][0-9 ]*" + t.decimal_separator + "[0-9][0-9 ]*");
    //rule("num_rat", "[0-9][0-9 ]*" + symbol("/") + "[0-9][0-9 ]*");
    //rule("num_com", "[0-9][0-9 ]*" + t.op_plus + "[0-9][0-9 ]*" + symbol("i"));
    rule("num_int", "[0-9][0-9 ]*");

    rule("group_object_parenthesis",
         p.or([symbol("(") + space + t.object + space + symbol(")"),
               p.input_begin() + space + t.object + space + symbol(")"),
               symbol("(")     + space + t.object + space + p.input_end()])
         );
    rule("group_object_brackets",
         p.or([symbol("[") + space + t.object + space + symbol("]"),
               p.input_begin() + space + t.object + space + symbol("]"),
               symbol("[")     + space + t.object + space + p.input_end()])
         );
    rule("group_object_braces",
         p.or([symbol("{") + space + t.object + space + symbol("}"),
               p.input_begin() + space + t.object + space + symbol("}"),
               symbol("{")     + space + t.object + space + p.input_end()])
         );

    p.term_class("group_object",
                 [t["group_object_parenthesis"],
                  t["group_object_brackets"],
                  t["group_object_braces"]
                  ]);

    rule("openmath_OMA",
	 symbol("OMA") + t["group_object_parenthesis"]
	 );
    rule("openmath_OMS",
	 symbol("OMS") + t["group_object_parenthesis"]
	 );
    rule("openmath_OMR",
	 symbol("OMR") + t["group_object_parenthesis"]
	 );
    rule("openmath_OMATTR",
	 symbol("OMATTR") + t["group_object_parenthesis"]
	 );
    rule("openmath_OMATP",
	 symbol("OMATP") + t["group_object_parenthesis"]
	 );
    rule("op_func_app",
         p.or([t.object_morphism_variable + t.object,
               t.object_morphism + space + t.object
               ])
         );
    rule("op_fact_app",
         p.any(space + t.object + space + t.op_fact));
    rule("op_plus_app_unary_in_exponent",
         t.op_plus + t.object, [t.op_exp, ""]);
    rule("op_exp_app",
         t.object + p.any(space + t.op_exp + space + p.or([t.object, t.op_plus_app_unary_in_exponent])));
    rule("op_not_app",
         space + t.op_not + space + t.object);
    rule("op_prod_app",
         p.or([t.object + p.any(space + t.op_prod + space + t.object)])
         );
    term_class("multiplicative_object",
               [t.string,
                t.num_int, t.num_dec, t.num_rat, t.num_com,
                t.tuple_object,
                t.group_object,
                t.morphism_app,
                // In contrast to object, no op_plus_app_unary
                t.binding_app,
                t.object_variable,
                t.object_morphism_variable,
                t.object_morphism_morphism_variable]
               );
    rule("juxt_app_type_oo_o",
         t.object + p.any(space + t.object));
    rule("juxt_app_type_mm_m",
         t.morphism_app + p.any(space + t.morphism_app));
    rule("op_plus_app_unary",
         t.op_plus + t.object);
    rule("op_plus_app",// This is a special case: both prefix and infix.
         p.opt(t.object) + p.any(t.op_plus_app_unary));
    rule("op_interval_app",
         t.object + p.any(space + t.op_interval + space + t.object));
    rule("op_eq_app",
         t.object + p.any(space + t.op_eq + space + t.object));
    rule("op_and_app",
         t.object + p.any(space + t.op_and + space + t.object));
    rule("op_or_app",
         t.object + p.any(space + t.op_or + space + t.object));
    rule("op_impl_app",
         t.object + p.any(space + t.op_impl + space + t.object));
    rule("binding_app",
         t.binding + space + t.object + space + p.or([".", symbol("such that")]) + space + t.object);
    //action_rule(grammar_action_declare_variable, "x", [t.binding, "."]);

    rule("tuple_object",
         t.object + space + p.any(symbol(",") + space + t.object)
         );
  }

  // context_url_array can be an array, or a single string.
  var current_context_url_array;
  function rebuild_context(context_url_array)
  {
    if (context_url_array) current_context_url_array = context_url_array;
    else                   context_url_array = current_context_url_array;

    try
      {
        parser = new Parser();
        initialize_parser(parser);
        stylesheet_parse = load_xml(base_url + "parse_tree_to_openmath.xsl");

        linear_as_xml = false;
        //stylesheet_unparse = load_xml(base_url + "openmath_to_linear.xsl");
        stylesheet_unparse = stylesheet_parse;

        if ("string" == typeof context_url_array)
          {
            load_context(parser,
                         stylesheet_parse, stylesheet_unparse,
                         context_url_array);
          }
        else
          {
            for (var i in context_url_array) load_context(parser,
                                                          stylesheet_parse,
                                                          stylesheet_unparse,
                                                          context_url_array[i]);
          }

        if (debug)
          {
            if (copy_to_clipboard(serialize_to_string(stylesheet_parse)))
	      {
		alert("templates from context copied to the clipboard");
	      }
          }
        //copy_to_clipboard(serialize_to_string(stylesheet_parse));
      }
    catch (exception)
      {
        message("Error: " + exception);
        stylesheet_parse   = null;
        stylesheet_unparse = null;
      }

    transformer_parse   = null;
    transformer_unparse = null;
    if (!stylesheet_parse || !stylesheet_unparse)
      {
        message("Error: could not build the stylesheet.");
        return;
      }

    try
      {
        transformer_parse = new XSLTProcessor();
        transformer_parse.importStylesheet(stylesheet_parse);
        transformer_unparse = transformer_parse;//new XSLTProcessor();
        //transformer_unparse.importStylesheet(stylesheet_unparse);
        //transformer_unparse = transformer_parse;
      }
    catch (exception)
      {
        message("Error: " + exception);
        copy_to_clipboard(serialize_to_string(stylesheet_parse));
      }
  }

  function declare_variable(name, type)
  {
    var symbol;
    symbol = parser.symbol(name);

    switch (type)
      {
      case "object":
        parser.term_class("object_variable", symbol);
        break;
      case "morphism":
        parser.term_class("object_morphism_variable", symbol);
        break;
      case "morphism_morphism":
        parser.term_class("object_morphism_morphism_variable", symbol);
        break;
      default:
        message("Unknown variable type: " + type);
      }
  }

  function linear_to_openmath(text)
  {
    var parse_tree;
    var omobj;
    parse_tree = linear_to_parse_tree(text);
    if (!parse_tree)
      {
        if (parser)
          {
            message("QMath::linear_to_openmath(" + text
                    + "): no result from parser");
          }
        else
          {
            message("QMath::linear_to_openmath(" + text + "): no parser");
          }
        omobj = null;
      }
    else
      {
        omobj = parse_tree_to_openmath(parse_tree);
        //var omobj;
        //if (xslt_result) omobj = xslt_result.documentElement;
        //else             omobj = null;
      }

    if (!omobj)
      {
        message("QMath::linear_to_openmath(" + text
                + "): no result from apply_transformer(transformer_parse, result)");
        omobj = document.createElementNS(openmath_namespace, "OMOBJ");
      }

    return omobj;
  }

  function linear_to_parse_tree(text)
  {
    var parse_tree;
    if (parser) parse_tree = parser.parse_to_XML(text);
    else        parse_tree = null;

    //if (parse_tree) message(serialize_to_string(parse_tree));
    //else            message("parse(" + text + "): there is no parse tree.");

    return parse_tree;
  }

  function parse_tree_to_openmath(parse_tree)
  {
    var omobj;
    omobj = apply_transformer(transformer_parse, parse_tree);
    move_range_attributes_to_properties(omobj);

    return omobj;
  }
  function move_range_attributes_to_properties(node)
  {
    if (node.nodeType != 1) return;
    if (node.hasAttribute("begin"))
      {
	node.begin = Number(node.getAttribute("begin"));
	node.removeAttribute("begin");
      }
    if (node.hasAttribute("end"))
      {
	node.end = Number(node.getAttribute("end"));
	node.removeAttribute("end");
      }
    node = node.firstChild;
    while (node)
      {
	move_range_attributes_to_properties(node);
	node = node.nextSibling;
      }
  }

  function openmath_to_linear(omobj)
  {
    return parse_tree_to_linear(openmath_to_parse_tree(omobj));
  }

  function openmath_to_parse_tree(omobj)
  {
    if (!omobj)
      {
        message("Warning: omobj is null.");
        return null;
      }

    var parse_tree;
    parse_tree = apply_transformer(transformer_unparse, omobj);
    /////copy_to_clipboard(serialize_to_string(stylesheet_unparse));
    /////message("XSLT unparse copied to clipboard!");
    //message(serialize_to_string(parse_tree));

    return parse_tree;
  }

  function parse_tree_to_linear(parse_tree)
  {
    return parser.unparse_from_XML(parse_tree);
  }

  function apply_transformer(transformer, tree)
  {
    var xslt_result;
    try
      {
        xslt_result = transformer.transformToDocument(tree).documentElement;
        xslt_result.nodeName;// To check that it's not null.
      }
    catch (exception)
      {
        var name;
        var stylesheet;
        if (transformer == transformer_parse)
          {
            name = "transformer_parse";
            stylesheet = stylesheet_parse;
          }
        else
          {
            name = "transformer_unparse";
            stylesheet = stylesheet_unparse;
          }
        message("Error: name = " + name + ": " + exception);
        xslt_result = null;

        var xml_content;
        xml_content = serialize_to_string(stylesheet);
        if (copy_to_clipboard(xml_content))
	  {
            message("Faulty XSLT stylesheet copied to clipboard.");
	  }
      }

    return xslt_result;
  }

  function load_xml(url)
  {
    var result;
    try
      {
        var request;
        request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);
        result = request.responseXML;
      }
    catch (exception)
      {
        message("Error: " + url + ":\n" + exception);
      }

    return result;
  }

  function serialize_to_string(node)
  {
    return xml_serializer.serializeToString(node);
  }

  function copy_to_clipboard(text)
  {
    if (!gClipboardHelper) return false;
    gClipboardHelper.copyString(text);
    return true;
  }

  function load_context(parser, stylesheet_parse, stylesheet_unparse, url)
  {
    try
      {
        var context_document;
        context_document = load_xml(url);
        var templates_from_context;
        templates_from_context = transformer_build_stylesheet_parse.transformToFragment(context_document.documentElement, stylesheet_parse);
	//alert("Stylesheet from context:\n" + serialize_to_string(templates_from_context));
        stylesheet_parse.documentElement.appendChild(templates_from_context);
        var settings_iterator;
        settings_iterator = xpath('q:document/q:tokenizer-settings/@*',
                                  context_document,
                                  XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        if (settings_iterator)
          {
            var tokenizer_setting;
            while ((tokenizer_setting = settings_iterator.iterateNext()))
              {
                switch (tokenizer_setting.name)
                  {
                  case "ignore-space":
                    parser.ignore_space = ("true" == tokenizer_setting.value);
                    break;
                  case "implicit-variable-name-pattern":
                    parser.implicit_variable_name_pattern = tokenizer_setting.value;
                    if (parser.implicit_variable_name_pattern
                        && '^' != parser.implicit_variable_name_pattern[0])
                      {
                        parser.implicit_variable_name_pattern =
                          "^(?:"
                          + parser.implicit_variable_name_pattern
                          + ")";
                      }
                    break;
                  default:
                    message("Error: unknown tokenizer setting '"
                            + tokenizer_setting.name + "'");
                  }
              }
          }

        var symbol_iterator;
        symbol_iterator = xpath('//q:symbol',
                                context_document,
                                XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        if (symbol_iterator)
          {
            var term_classes;
            term_classes = {};
            var attributes;
            attributes = {};
            var attribute_names;
            attribute_names = ["token", "type", "cd", "name"];
            var op_plus_implicit_symbol_token;

            var symbol;
            while ((symbol = symbol_iterator.iterateNext()))
              {
                for (var i in attribute_names)
                  {
                    var name;
                    name = attribute_names[i];
                    if (symbol.hasAttribute(name))
                      {
                        attributes[name] = symbol.getAttribute(name);
                      }
                    else
                      {
                        var attribute_node;
                        attribute_node =
                          xpath_first("ancestor::q:group/@" + name, symbol);
                        if (attribute_node)
                          {
                            attributes[name] = attribute_node.value;
                          }
                        else switch (attributes["type"])
                          {
                          case "object_variable":
                          case "object_morphism_variable":
                          case "object_morphism_morphism_variable":
                            if ("cd" == name || "name" == name) break;
                            // Otherwise fall through:
                          default:
                            message("Error: " + url + ": missing attribute '"
                                    + name + "' at "
                                    + build_xpath(symbol)
                                    );
                          }
                      }
                  }

                if ("op_plus" == attributes.type
                    && (! (symbol.hasAttribute("unary_cd")
                           && symbol.hasAttribute("unary_name")
                           )
                        )
                    )
                  {
                    if (op_plus_implicit_symbol_token)
                      {
                        message("Error in context: " + url + "\n"
                                + "The symbol '" + attributes.token
                                + "' does not have an explicit unary variant, and there is already a symbol with an implicit unary variant: '"
                                + op_plus_implicit_symbol_token + "'");
                      }
                    else
                      {
                        op_plus_implicit_symbol_token = attributes.token;
                      }
                  }

                var token_array;
                token_array = term_classes[attributes.type];
                if (!token_array)
                  {
                    token_array = new Array();
                    term_classes[attributes.type] = token_array;
                  }
                token_array.push(attributes.token);
                // It's faster to collect all the tokens in each term class
                // and compile them together, because otherwise the rule
                // dependencies have to be recomputed each time, and the
                // affected rules re-compiled.
                //parser.term_class(attributes.type, [attributes.token]);
              }

            for (var type in term_classes)
              {
                parser.term_class(type, term_classes[type]);
              }
          }
      }
    catch (exception)
      {
        message("Error: url = '" + url + "': "
                + exception);
      }
  }

  function measure_performance(text)
  {
    if (!text) text = "413x^7-11x^6+8172x^5-311x^4+8873x^3-12x^2+1132x+892/112+(124/pi^66)+413x^7-11x^6+8172x^5-311x^4+8873x^3-12x^2+1132x+892/112+(124/pi^66)+413x^7-11x^6+8172x^5-311x^4+8873x^3-12x^2+1132x+892/112+(124/pi^66)+413x^7-11x^6+8172x^5-311x^4+8873x^3-12x^2+1132x+892/112+(124/pi^66)";
    var results;
    results = [];
    var timer;
    timer = new Progress_reporter();
    timer.begin_wait();
    var parse_tree;
    parse_tree = linear_to_parse_tree(text);
    timer.end_wait();
    results.push("linear_to_parse_tree(): " + timer.get_wait_length() + "ms");
    var new_omobj;
    timer.begin_wait();
    new_omobj = parse_tree_to_openmath(parse_tree);
    timer.end_wait();
    results.push("parse_tree_to_openmath(): " + timer.get_wait_length() + "ms");

    return results;
  }

}
///////////////////////////////////////////////////////////////////////////
//
//   Copyright 2005,2006,2007,2008,2009 Alberto González Palomo
//   Author: Alberto González Palomo <http://www.matracas.org>
//
//   This program is free software; you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation; either version 2 of the License, or
//   (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with this program; if not, write to the Free Software
//   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
/////////////////////////////////////////////////////////////////////////////

function Formula_editor(formula_field)
  {
    var self = this;
    this.init = init;
    this.select_node = select_node;
    this.change_to_context = change_to_context;
    this.get_variables = get_variables;
    this.declare_variable = declare_variable;
    this.linear_to_openmath = linear_to_openmath;
    this.enable_edit = enable_edit;
    this.set_visibility = set_visibility;
    this.insert = insert;
    this.key_down = key_down;
    this.key_press = key_press;
    this.set_parse_tree_display = set_parse_tree_display;
    this.set_zoom = set_zoom;
    this.resize_to_fit_formula = resize_to_fit_formula;
    this.focus = focus;

    this.onchange = null;// Called when the equation changes.
    this.exit_start = null;
    this.exit_end = null;

    var xul_namespace = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var openmath_namespace = "http://www.openmath.org/OpenMath";
    var    qmath_namespace = "http://www.matracas.org/ns/qmath";
    var   mathml_namespace = "http://www.w3.org/1998/Math/MathML";
    var    xhtml_namespace = "http://www.w3.org/1999/xhtml";

    var namespace_prefix_map =
    {
      "xul" :      xul_namespace,
      "om"  : openmath_namespace,
      "q"   :    qmath_namespace,
      "m"   :   mathml_namespace,
      "h"   :    xhtml_namespace
    };
    // The following is only necessary if using the XPath functions from
    // the main application.
    //register_namespace_map(namespace_prefix_map);

    var omobj;
    var linear;
    var linear_is_plain_text_field;
    var editable;
    var contexts_directory_url;
    var qmath;
    var declared_variables;

    var parse_tree_visualization;

    var resize_threshold = 2;// In pixels.
    var scrollbar_height = 14;
    var minimum_formula_height = scrollbar_height * 6;
    var margin = 0;

    function init(parser_path, contexts_path)
    {
      //var base_location;
      //base_location = window.location.href.replace(/[^/]*$/, "");
      qmath = new QMath(parser_path);
      declared_variables = {};
      contexts_directory_url = contexts_path;
      // If contexts_directory_url.lengt is less than 1, we have some
      // more serious problem.
      if (contexts_directory_url[contexts_directory_url.length - 1] != "/")
        {
          contexts_directory_url += "/";
        }
      get_linear();// Called here to set "linear_is_plain_text_field".
    }

    function get_linear()
    {
      if (!linear)
        {
          switch (formula_field.localName)
            {
            case "iframe":
            case "browser":
            case "editor":
              formula_field = formula_field.contentDocument;
              linear = formula_field.documentElement;
              linear_is_plain_text_field = false;
              break;
            case "textbox":
            case "textarea":
            case "input":
            case "searchbox":
              linear = formula_field;
              linear_is_plain_text_field = true;
              break;
            default:
              message("Error: linear input element is a '"
                      + formula_field.nodeName + "'");
              break;
            }
        }

      return linear;
    }

    function changed()
    {
      if (self.onchange) self.onchange(omobj);
    }

    function linear_to_openmath(text)
    {
      self.parse_tree = qmath.linear_to_parse_tree(text);
      build_parse_tree_visualization(self.parse_tree, parse_tree_visualization);
      var new_omobj;
      new_omobj = qmath.parse_tree_to_openmath(self.parse_tree);
      if (editable)
        {
          var input_field;
          if ("mInputField" in formula_field) input_field = formula_field.mInputField;
          else                                input_field = formula_field;

          if ("result" == new_omobj.localName)
            {
              //new_omobj = result.firstChild;
              //while (new_omobj && new_omobj.localName != "OMOBJ")
              //  {
              //    new_omobj = new_omobj.nextSibling;
              //  }
              // The above produces in most cases the same effect as the
              // following, that is, not changing anything, so we just avoid
              // updating until the expression is fully parsed:
              new_omobj = null;
              input_field.style.backgroundColor = "#FFCCCC";
            }
          else
            {
              input_field.style.backgroundColor = "transparent";
            }

          if (new_omobj)
            {
              omobj = new_omobj;
	      changed();
            }
        }
      else
        {
          message(omobj);
        }

      resize_to_fit_formula();

      return omobj;
    }

    function set_zoom(factor)
    {
      if (! linear_is_plain_text_field)
        {
          formula_field.markupDocumentViewer.textZoom = factor;
        }
    }

    function key_press(event)
    {
      //message("key press in formula: " + event);
      //message("event target: " + event.target + ", cw: " + event.target.clientWidth + ", ch: " + event.target.clientHeight + ", sw: " + event.target.scrollWidth + ", sh: " + event.target.scrollHeight);
      //resize_to_fit_formula();

      //event.preventBubble();// Deprecated. Use W3C standard stopPropagation().
      event.stopPropagation();

      switch (event.charCode)
        {
        case 0:
          switch (event.keyCode)
            {
            case event.DOM_VK_RETURN:
            case event.DOM_VK_ENTER:
              message("TODO: break the equation here. It's not trivial.");
              //event.preventDefault();
              break;
            }
          break;
        case 36:// Dollar sign "$".
          self.exit_end();
          event.preventDefault();
          break;
        }

      return false;
    }

    function key_down(event)
    {
      var input;
      var start;
      var end;
      input = get_linear();
      start = input.selectionStart;
      end   = input.selectionEnd;

      switch (event.keyCode)
        {
        case event.DOM_VK_RIGHT:
          if (start == end)
            {
              if (start == input.value.length)
                {
                  self.exit_end();
                  event.preventDefault();
                }
            }
          break;
        case event.DOM_VK_LEFT:
          if (start == end)
            {
              if (start == 0)
                {
                  self.exit_start();
                  event.preventDefault();
                }
            }
          break;
        }

      return false;
    }

    function resize_to_fit_formula()
    {
      if (linear_is_plain_text_field)
        {
          if ("inputField" in formula_field && formula_field.multiline)
            {
              if (margin < 1) margin = formula_field.boxObject.height - formula_field.inputField.scrollHeight;
              formula_field.height = formula_field.inputField.scrollHeight + margin;
            }
        }
      else
        {
          if ("true" == window.frameElement.getAttribute("collapsed")) return;

          var formula;
          formula = get_linear();
          if (!formula) {message("Error: formula="+formula);return;}

          var qmath_frame;
          qmath_frame = window.frameElement;
          var formula_height;
          formula_height = formula.clientHeight + scrollbar_height;
          if (formula_height < minimum_formula_height)
            {
              formula_height = minimum_formula_height;
            }
          var qmath_frame_height;
          qmath_frame_height = qmath_frame.clientHeight;
          var qmath_frame_overhead;
          qmath_frame_overhead = qmath_frame_height - formula.parentNode.clientHeight;
          var size_delta;
          size_delta = formula_height - formula.parentNode.clientHeight;
          var size_delta_ems;
          size_delta_ems = formula_height * parseFloat(window.getComputedStyle(qmath_frame, null).getPropertyValue("height")) / size_delta;
          message("resize_to_fit_formula(): size_delta = " + size_delta + ", resize_threshold = " + resize_threshold);
          if (Math.abs(size_delta) > resize_threshold)
            {
              message("resize(), qmath_frame = " + qmath_frame.nodeName);
              resize(qmath_frame, size_delta);
            }
        }
    }

    function resize(element, delta)
    {
      element.style.height = (element.boxObject.height + delta).toString() + "px";
    }

    function select_node(new_omobj)
    {
      if (new_omobj != omobj)
        {
          omobj = new_omobj;
          // Using one context per notation, we don't need to switch when
          // selecting another node.
          //qmath.rebuild_context(get_context_array(contexts_directory_url));
	  //declare_variable(variable_name, "morphism");
	  //declare_variable(variable_name, "object");
          update_linear();
        }
    }

    function change_to_context(context)
    {
      qmath.rebuild_context(contexts_directory_url + context + ".xml");
      for (v in declared_variables)
        {
          qmath.declare_variable(v, declared_variables[v]);
        }

      if (omobj) update_linear();
    }

    function get_variables()
    {
      var result;
      result = { free:[], bound:[] };
      if (!omobj) return result;

      var variable_iterator;
      variable_iterator = xpath("descendant::om:OMV", omobj);
      var variable;
      while ((variable = variable_iterator.iterateNext()))
        {
          if (xpath_boolean("ancestor::om:OMBIND/om:OMBVAR/om:OMV[@name='" + variable.getAttribute("name") + "']", variable))
            {
              result.bound.push(variable);
            }
          else
            {
              result.free.push(variable);
            }
        }

      return result;
    }

    function declare_variable(name, type)
    {
      if (name in declared_variables)
        {
          if (declared_variables[name] != type)
            {
              declared_variables[name] = type;
              qmath.rebuild_context();
              for (v in declared_variables)
                {
                  qmath.declare_variable(v, declared_variables[v]);
                }
            }
        }
      else
        {
          declared_variables[name] = type;
          qmath.declare_variable(name, type);
        }

      linear_to_openmath(formula_field.value);
    }

    function update_linear()
    {
      if (!get_linear())
        {
          message("Error: QMath: no linear container available.");
          return;
        }

      // This works also in the "textbox" case, since there are no children.
      while (linear.lastChild) linear.removeChild(linear.lastChild);

      if (omobj)
        {
          var new_content;
          if (linear_is_plain_text_field)
            {
              self.parse_tree = qmath.openmath_to_parse_tree(omobj);
              new_content = qmath.parse_tree_to_linear(self.parse_tree);
              linear.value = new_content;
              //linear.setAttribute("cols", new_content.length + 2);
            }
          else
            {
              new_content = qmath.openmath_to_parse_tree(omobj);
              if (new_content)
                {
                  linear.appendChild(new_content);
                }
              else
                {
                  message("Error: no new_content.");
                }
            }
        }
      else
        {
          message("Error: no omobj.");
        }

      resize_to_fit_formula();
    }

    function enable_edit(value)
    {
      editable = value;

      if (editable)
        {
          if ("textbox" == formula_field.localName)
            {
              formula_field.removeAttribute("readonly");
            }
        }
    }

    function set_visibility(visible)
    {
      document.getElementById("formula-editor-container").hidden = !visible;
      document.getElementById("qmath-formula-field").hidden = !visible;
      //document.getElementById("formula-editor-composer").makeEditable();
    }

    function find_subtree_at(node, begin, end)
    {
      if (!node)
	{
	  alert("find_subtree_at(null) called from " + find_subtree_at.caller.prototype.constructor.name);
	  return node;
	}
      var subtree, child;
      child = node.firstChild;
      while (child)
      {
	subtree = find_subtree_at(child, begin, end);
	if (subtree) return subtree;
	child = child.nextSibling;
      }
      if (node.begin != undefined && node.end != undefined
	  && (begin >= node.begin && end <= node.end)
	 ) return node;
      else return null;
    }
    // Find <OMV name="&#xEEEE;*"/> in template.
    // Replace all of them by copies of selected_subexpression.
    function replace_placeholders(template, selected_subexpression)
    {
      var node;
      node = template.firstChild;
      while (node)
	{
	  if (node.nodeType == 1)
	    {
	      if (node.localName == "OMV" && node.getAttribute("name").match(/\uEEEE[a-z]*/))
		{
		  if (selected_subexpression) node = template.replaceChild(selected_subexpression.cloneNode(true), node);
		  else node.setAttribute("name", node.getAttribute("name").replace(/\uEEEE/g, ""));
		}
	      else replace_placeholders(node, selected_subexpression);
	    }
	  node = node.nextSibling;
	}
    }
    function insert(template)
    {
      if (typeof(template) == 'string')
	{
	  alert("String template:\n" + template);
	  return;
	}
      if (!template)
	{
	  alert("No template: " + template + "\nCalled from: " + insert.caller.prototype.constructor.name);
	  return;
	}
      if ("OMOBJ" == template.localName) template = template.firstChild;
      if (!template) {
	alert("No template content inside OMOBJ: " + template + "\nCalled from: " + insert.caller.prototype.constructor.name);
	return;
      }
      var start, end, length;
      start  = formula_field.selectionStart;
      end    = formula_field.selectionEnd;
      length = formula_field.value.length;

      linear_to_openmath(formula_field.value);
      var selected_subexpression = find_subtree_at(omobj, start, end);
      if (!selected_subexpression) selected_subexpression = omobj.firstChild;
      if (selected_subexpression)
	{
	  var new_start, new_end;
	  new_start = selected_subexpression.begin;
	  new_end   = selected_subexpression.end;
	  // Find <OMV name="&#xEEEE;*"/> in template.
	  // Replace all of them by copies of selected_subexpression.
	  template = template.cloneNode(true);
	  replace_placeholders(template, selected_subexpression);
	  // Replace the selected_subexpression by template.
	  selected_subexpression.parentNode.replaceChild(template, selected_subexpression);
	  update_linear();
	  new_end = linear.value.length - (length - new_end);
	  if (new_end < new_start) new_end = new_start;
	  formula_field.setSelectionRange(new_start, new_end);
	}
      else
	{
	  template = template.cloneNode(true);
	  replace_placeholders(template, null);
	  if (!template) alert("teplate lost at replace_placeholders()");
	  omobj.appendChild(template);
	  update_linear();
	  formula_field.setSelectionRange(0, linear.value.length);
	}
      changed();

      formula_field.focus();
    }

    function focus()
    {
      formula_field.focus();
    }

    function add_context(context_path)
    {
      var contexts;
      contexts = context_path.split(",");
      var context_list;
      context_list = document.getElementById('document-context-list');
      var i;
      for (i = 0; i < contexts.length; ++i)
        {
          context_list.appendItem(contexts[i]);
          // The "label" property is not set if the list item is not visible.
          context_list.getItemAtIndex(context_list.getRowCount() - 1).label = contexts[i];
        }

      qmath.rebuild_context(get_context_array(contexts_directory_url));
      update_linear();
    }

    function remove_context(item)
    {
      var list;
      list = item.parentNode;
      list.removeItemAt(list.getIndexOfItem(item));

      qmath.rebuild_context(get_context_array(contexts_directory_url));
      update_linear();
    }

    function get_context_array(prefix)
    {
      var notation_menu;
      notation_menu = document.getElementById("notation-menu-button");
      // TODO: give the notation to qmath.rebuild_context so that it can fall
      //       back to another related notation in some reasonable way, such as
      //       having the language separated and going back to another language
      //       as necessary.
      prefix += notation_menu.value + "/";

      return application.get_context_array(prefix, omobj);
    }

    function set_parse_tree_display(display)
    {
      if (display)
        {
          if (! parse_tree_visualization)
            {
	      parse_tree_visualization = document.getElementById("parse-tree-visualization");

              document.getElementById("qmath-formula-field").doCommand();
            }
        }
      else
        {
          parse_tree_visualization = null;
        }
    }

    function build_parse_tree_visualization(parse_tree, parse_tree_visualization)
    {
      if (!parse_tree_visualization) return;

      while (parse_tree_visualization.lastChild)
        {
          parse_tree_visualization.removeChild(parse_tree_visualization.lastChild);
        }
      for (var i in parse_tree.childNodes)
        {
          var parseNode;
          parseNode = parse_tree.childNodes[i];
          if (Node.ELEMENT_NODE != parseNode.nodeType) continue;

          var visualizationNode;
          var label;
          var content;
          switch (parseNode.localName)
            {
            case "token":
            case "text":
              visualizationNode = document.createElementNS(xul_namespace, "label");
              visualizationNode.setAttribute("class", "token");
              visualizationNode.setAttribute("value", parseNode.getAttribute("literal"));
              visualizationNode.setAttribute("tooltiptext", parseNode.localName + " @literal=" + parseNode.getAttribute("literal"));
              parse_tree_visualization.appendChild(visualizationNode);
              break;
            case "string":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "string");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "num_dec":
            case "num_int":
            case "num_rat":
            case "num_com":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "number");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "group_object_parenthesis":
            case "group_object_brackets":
            case "group_object_braces":
            case "tuple_object_parenthesis":
            case "tuple_object_brackets":
            case "tuple_object_braces":
            case "tuple_object":
            case "unfenced_tuple_object":
            case "juxt_app_type_oo_o":
            case "juxt_app_type_mm_m":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "grouping");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "op_fact_app":
            case "op_exp_app":
            case "op_not_app":
            case "op_prod_app":
            case "op_plus_app":
            case "op_plus_app_unary":
            case "op_func_app":
            case "op_interval_app":
            case "op_eq_app":
            case "op_and_app":
            case "op_or_app":
            case "op_impl_app":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "application");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "binding_app":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "binding");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "openmath_OMA":
            case "openmath_OMS":
            case "openmath_OMR":
            case "openmath_OMBIND":
            case "openmath_OMBVAR":
	    case "openmath_OMATTR":
	    case "openmath_OMATP":
              visualizationNode = document.createElementNS(xul_namespace, "vbox");
              visualizationNode.setAttribute("class", "openmath-literal");
              label = document.createElementNS(xul_namespace, "label");
              label.setAttribute("value", parseNode.localName);
              content = document.createElementNS(xul_namespace, "hbox");
              content.setAttribute("class", "content");
              visualizationNode.appendChild(label);
              visualizationNode.appendChild(content);
              build_parse_tree_visualization(parseNode, content);
              break;
            case "result":
              visualizationNode = null;
              build_parse_tree_visualization(parseNode, parse_tree_visualization);
              break;
            default:
              if (parseNode && parseNode["childNodes"])
                {
                  visualizationNode = document.createElementNS(xul_namespace, "hbox");
                  visualizationNode.setAttribute("class", "unknown");
                  build_parse_tree_visualization(parseNode, visualizationNode);
                }
              else
                {
                  visualizationNode = document.createElementNS(xul_namespace, "label");
                  visualizationNode.setAttribute("class", "unknown");
                  visualizationNode.appendChild(document.createTextNode(parseNode.nodeName));
                }
            }
          if (visualizationNode)
            {
              parse_tree_visualization.appendChild(visualizationNode);
            }
        }
    }

    function build_parse_tree_visualization_boxes(parse_tree, parse_tree_visualization)
    {
      while (parse_tree_visualization.lastChild)
        {
          parse_tree_visualization.removeChild(parse_tree_visualization.lastChild);
        }
      for (var i in parse_tree.childNodes)
        {
          var parseNode;
          parseNode = parse_tree.childNodes[i];
          if (Node.ELEMENT_NODE != parseNode.nodeType) continue;

          var visualizationNode;
          var auxNode;
          switch (parseNode.localName)
            {
            case "token":
              visualizationNode = document.createElementNS(xul_namespace, "label");
              visualizationNode.setAttribute("class", "token");
              visualizationNode.appendChild(document.createTextNode(parseNode.getAttribute("literal")));
              parse_tree_visualization.appendChild(visualizationNode);
              break;
            case "num_dec":
            case "num_int":
            case "num_rat":
            case "num_com":
              visualizationNode = document.createElementNS(xul_namespace, "hbox");
              visualizationNode.setAttribute("class", "number");
              build_parse_tree_visualization_boxes(parseNode, visualizationNode);
              break;
            case "group_object":
            case "set_object":
            case "tuple_object":
            case "unfenced_tuple_object":
            case "juxt_app_type_oo_o":
            case "juxt_app_type_mm_m":
              visualizationNode = document.createElementNS(xul_namespace, "hbox");
              visualizationNode.setAttribute("class", "grouping");
              build_parse_tree_visualization_boxes(parseNode, visualizationNode);
              break;
            case "op_fact_app":
            case "op_exp_app":
            case "op_not_app":
            case "op_prod_app":
            case "op_plus_app":
            case "op_plus_app_unary":
            case "op_func_app":
            case "op_interval_app":
            case "op_eq_app":
            case "op_and_app":
            case "op_or_app":
            case "op_impl_app":
              visualizationNode = document.createElementNS(xul_namespace, "hbox");
              visualizationNode.setAttribute("class", "application");
              build_parse_tree_visualization_boxes(parseNode, visualizationNode);
              break;
            case "binding_app":
              visualizationNode = document.createElementNS(xul_namespace, "hbox");
              visualizationNode.setAttribute("class", "binding");
              build_parse_tree_visualization_boxes(parseNode, visualizationNode);
              break;
            case "result":
              visualizationNode = null;
              build_parse_tree_visualization_boxes(parseNode, parse_tree_visualization);
              break;
            default:
              if (parseNode && parseNode["childNodes"])
                {
                  visualizationNode = document.createElementNS(xul_namespace, "hbox");
                  visualizationNode.setAttribute("class", "unknown");
                  build_parse_tree_visualization_boxes(parseNode, visualizationNode);
                }
              else
                {
                  visualizationNode = document.createElementNS(xul_namespace, "label");
                  visualizationNode.setAttribute("class", "unknown");
                  visualizationNode.appendChild(document.createTextNode(parseNode.nodeName));
                }
            }
          if (visualizationNode)
            {
              parse_tree_visualization.appendChild(visualizationNode);
            }
        }
    }

    this.measure_performance = measure_performance;
    function measure_performance()
    {
      message("Measuring performace when parsing " + formula_field.value);
      var results;
      results = qmath.measure_performance(formula_field.value);
      for (var i = 0; i < results.length; ++i) message(results[i]);
    }
  }


if (!"message" in window || !window.message) window.message = alert;
