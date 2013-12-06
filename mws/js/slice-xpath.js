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
