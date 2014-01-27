/*

highlight v4

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>

*/

jQuery.fn.highlight = function(pat) {

  function isWordEnd(c){
    return !(c?c:"").match(/[a-zA-Z]/g); 
  }

  function innerHighlight(node, pat) {
    var skip = 0;
    if (node.nodeType == 3) {
     var pos = node.data.toUpperCase().indexOf(pat);

     if (pos >= 0 && isWordEnd(node.data[pos-1]) && isWordEnd(node.data[pos+pat.length])) {
      var spannode = document.createElement('span');
      spannode.className = 'text-highlight';
      var middlebit = node.splitText(pos);
      var endbit = middlebit.splitText(pat.length);
      var middleclone = middlebit.cloneNode(true);
      spannode.appendChild(middleclone);
      middlebit.parentNode.replaceChild(spannode, middlebit);
      skip = 1;
    }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style|m\:math)/i.test(node.tagName) && !$(node).hasClass("thema-ignore")) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat);
  }
}
return skip;
}
return this.length && pat && pat.length ? this.each(function() {
  innerHighlight(this, pat.toUpperCase());
}) : this;
};

jQuery.fn.removeHighlight = function() {
 return this.find("span.highlight").each(function() {
  this.parentNode.firstChild.nodeName;
  with (this.parentNode) {
   replaceChild(this.firstChild, this);
   normalize();
 }
}).end();
};