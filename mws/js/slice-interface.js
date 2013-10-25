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
  var namespace_prefix_map =
  {
    'h'   :   'http://www.w3.org/1999/xhtml',
    'm'   :   'http://www.w3.org/1998/Math/MathML',
    'xml' :   'http://www.w3.org/XML/1998/namespace',
    'xsl' :   'http://www.w3.org/1999/XSL/Transform'
  };
  // The following is only necessary if using the XPath functions from
  // the main application.
  register_namespace_map(namespace_prefix_map);
/*
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
*/
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

function fixWebKitStylesheet(doc)
{
  // ensure output method = html:
  var node = xpath_first("/xsl:stylesheet/xsl:output", doc);
  if (node && node.getAttribute("method")=="xml")
    node.setAttribute("method", "html");

  // gut out document node template to deal with Webkit bug
  // Google: webkit bug 28744 "root one"
  if ((node= xpath_first("/xsl:stylesheet/xsl:template[@match='/']", doc)))
  {
    var child;
    while ((child=node.lastChild))
      node.removeChild(child);
    child = node.appendChild(doc.createElement("xsl:apply-templates"));
    child.setAttribute("select", "*");
  }
}

function getProcessor(doc)
{
  // detect WebKit implementation (incomplete example pulled out
  // of other code that handles cross-browser XMLDOM differences):
  var d = document.implementation.createDocument("","",null);
  var isWebKit = !(d.load);

  var proc = new XSLTProcessor();
  if (isWebKit)
    fixWebKitStylesheet(doc);

  proc.importStylesheet(doc);

  return proc;
}

function build_transformer(stylesheet_url)
{
  var request, transformer;
  try
    {
      request = new XMLHttpRequest();
      request.open("GET", stylesheet_url, false);
      request.send(null);
      transformer = getProcessor(request.responseXML);
    }
  catch (error)
    {
      alert("Error when loading the XSL stylesheet '"
      + stylesheet_url + "'\n" + error);
    }
  request = null;

  return transformer;
}

