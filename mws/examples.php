<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>MathWeb Search - A Semantic Search Engine - Examples</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Language" content="en" />
	<link rel="stylesheet" type="text/css" href="general.css" />
	<link rel="start up" href="index.php" />
	<!--[if IE]>
	<link rel="stylesheet" type="text/css" href="ie_love.css" />
	<![endif]-->
</head>

<body>

<div id="header">
	<a href="http://www.jacobs-university.de"><img alt="Jacobs University Bremen" src="jacobs_logo.gif" /></a>
	<p>[ <a href=".">Back to main page</a> ]</p>
</div>

<h1 id="examples"><a href="#examples">Examples</a></h1>
<br />
<p>
Simple MathML example. Search for the integral of a squared function:
</p>

<?php
$example = file_get_contents('examples/1.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
Equivalent string representation is: int(bvarset(bvar(@t)),@domain,power(@fun(@t),@pow))
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('1.xml').'">[search]</a>';
?>
</p>

<!--  
<p>
Simple OpenMath example. Search for addition with 0:
</p>

<?php
$example = file_get_contents('examples/2.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
Equivalent string representation is: OMBIND(id(quant1.forall), OMBVAR(@a), OMA(id(relation1.eq), OMA(id(arith1.plus), @a, id(alg1.zero)), @a))
<?php
echo '<a href="search.php?type=openmath&amp;ex='.urlencode('2.xml').'">[search]</a>';
?>
</p>
-->

<p>
Search for mathematical objects showing commutativity for multiplication:
</p>

<?php
$example = file_get_contents('examples/3.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
Equivalent string representation is: eq(times(@1,@2),times(@2,@1))
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('3.xml').'">[search]</a>';
?>
</p>

<p>
Search for mathematical objects showing the property of distributivity:
</p>

<?php
$example = file_get_contents('examples/4.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
There is no equivalent string representation for this query.
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('4.xml').'">[search]</a>';
?>
</p>

<h2 id="ex-generic"><a href="#ex-generic">Examples using the <em>generic</em> attribute</a></h2>

<?php
$example = file_get_contents('examples/5.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
This is equivalent to the string query f(@1,id(x)) and it will match terms like f(id(x),id(x)), f(y,id(x)), f(g(h),id(x)), ...
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('5.xml').'">[search]</a>';
?>
</p>

<?php
$example = file_get_contents('examples/6.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
This is equivalent to the string query f(@1,@2) and it will match terms like f(x,x), f(y,a), f(g(h),diff(...)), ...
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('6.xml').'">[search]</a>';
?>
</p>

<?php
$example = file_get_contents('examples/7.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
This is equivalent to the string query f(@1,@1) and it will match terms like f(x,x), f(y,y), f(g(h),g(h)), ...
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('7.xml').'">[search]</a>';
?>
</p>

<?php
$example = file_get_contents('examples/8.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
This is equivalent to the string query @1(id(x),@1) and it will match terms like f(id(x),id(x)), f(id(x),y), t(id(x),g(h)), M(id(x),tau), ...
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('8.xml').'">[search]</a>';
?>
<br/>
Notice here that generic function names are disjoint from generic terms even if they use the same number.
</p>

<h2 id="ex-anyorder"><a href="#ex-anyorder">Examples using the <em>anyorder</em> attribute</a></h2>

<?php
$example = file_get_contents('examples/9.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
For the MathML+ query above, the equivalent strings are eq(id(x),id(y)) and eq(id(y),id(x)). However, a more compact way of specifying this is:
</p>

<?php
$example = file_get_contents('examples/10.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>
<p>
There is no equivalent string for this query.
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('10.xml').'">[search]</a>';
?>
</p>

<h2 id="ex-connective"><a href="#ex-connective">Examples using logical operators</a></h2>

<?php
$example = file_get_contents('examples/11.xml');
echo '<pre>'.htmlspecialchars($example, ENT_QUOTES, 'utf-8').'</pre>';
?>

<p>
The MathML+ query above does not have an equivalent string query. It defines a search for the documents that contain both the terms f(id(x)) and id(y). In order to change the search such that we find documents containing either of the two terms, we simply have to change the value of the <em>connective</em> attribute to <strong>or</strong>. More than two terms can be used in a search.
<?php
echo '<a href="search.php?type=mathml&amp;ex='.urlencode('11.xml').'">[search]</a>';
?>
</p>

<div id="footer">[ <a href="#examples">Back to top</a> | <a href="index.php">Back to main page</a> ]</div>

<div id="copyright">
		<!--Creative Commons License-->
		<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/2.5/"><img
			alt="Creative Commons License"
			src="http://creativecommons.org/images/public/somerights20.png" /></a>
		<br />
		This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/2.5/">Creative Commons Attribution-NonCommercial-ShareAlike 2.5 License</a>.
		<!--/Creative Commons License-->
</div>

</body>
</html>
