<?xml version="1.0" encoding="utf-8"?><xsl:stylesheet c:namespace-holder="keep-this-namespace" m:namespace-holder="keep-this-namespace" mq:namespace-holder="keep-this-namespace" om:namespace-holder="keep-this-namespace" version="1.0" xmlns:c="http://www.matracas.org/ns/cascada" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:mq="http://mathweb.org/MathQuery" xmlns:om="http://www.openmath.org/OpenMath" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:strip-space elements="*"/>
  <xsl:output indent="yes" method="xml"/>
  <xsl:template match="*|text()">
    <xsl:copy>
      <xsl:for-each select="@*">
        <xsl:copy/>
      </xsl:for-each>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
  <xsl:template match="m:math">
    <xsl:variable name="expression" select="*[1]"/>
    <om:OMOBJ>
      <xsl:apply-templates select="$expression"/>
    </om:OMOBJ>
  </xsl:template>
  <xsl:template match="m:cn[@type='integer']">
    <xsl:variable name="d" select="text()"/>
    <om:OMI>
      <xsl:apply-templates select="$d"/>
    </om:OMI>
  </xsl:template>
  <xsl:template match="m:cn[@type='real']">
    <xsl:variable name="d" select="text()"/>
    <om:OMF>
      <xsl:attribute name="dec">
        <xsl:value-of select="$d"/>
      </xsl:attribute>
    </om:OMF>
  </xsl:template>
  <xsl:template match="m:ci">
    <xsl:variable name="v" select="text()"/>
    <xsl:variable name="pattern-name" select="@mq:generic"/>
    <xsl:variable name="anycount" select="@mq:anycount"/>
    <om:OMV>
      <xsl:attribute name="name">
        <xsl:value-of select="$v"/>
      </xsl:attribute>
      <xsl:if test="$pattern-name != ''">
        <xsl:attribute name="mq:generic">
          <xsl:value-of select="$pattern-name"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="mq:anycount">
        <xsl:value-of select="$anycount"/>
      </xsl:attribute>
    </om:OMV>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:abs]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="abs"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:divide]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="divide"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:minus]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="minus"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:plus]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="plus"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:power]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="power"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=5 and *[1][self::m:product] and *[2][self::m:bvar[count(*)&gt;=1]] and *[3][self::m:lowlimit[count(*)=1]] and *[4][self::m:uplimit[count(*)=1]]]">
    <xsl:variable name="i" select="*[2]/*[1]"/>
    <xsl:variable name="a" select="*[3]/*[1]"/>
    <xsl:variable name="b" select="*[4]/*[1]"/>
    <xsl:variable name="f" select="*[5]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="product"/>
      <om:OMA>
        <om:OMS cd="interval1" name="integer_interval"/>
        <xsl:apply-templates select="$a"/>
        <xsl:apply-templates select="$b"/>
      </om:OMA>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$i"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:root] and *[2][self::m:degree[count(*)=1]]]">
    <xsl:variable name="n" select="*[2]/*[1]"/>
    <xsl:variable name="a" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="root"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$n"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:root] and *[2][self::m:degree[count(*)=1 and *[1][self::m:ci[@type='integer']]]]]">
    <xsl:variable name="a" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="root"/>
      <xsl:apply-templates select="$a"/>
      <om:OMI>2</om:OMI>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=5 and *[1][self::m:sum] and *[2][self::m:bvar[count(*)&gt;=1]] and *[3][self::m:lowlimit[count(*)=1]] and *[4][self::m:uplimit[count(*)=1]]]">
    <xsl:variable name="i" select="*[2]/*[1]"/>
    <xsl:variable name="a" select="*[3]/*[1]"/>
    <xsl:variable name="b" select="*[4]/*[1]"/>
    <xsl:variable name="f" select="*[5]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="sum"/>
      <om:OMA>
        <om:OMS cd="interval1" name="integer_interval"/>
        <xsl:apply-templates select="$a"/>
        <xsl:apply-templates select="$b"/>
      </om:OMA>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$i"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:times]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="times"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:minus]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="arith1" name="unary_minus"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=5 and *[1][self::m:int] and *[2][self::m:bvar[count(*)=1]] and *[3][self::m:lowlimit[count(*)=1 and *[1][self::m:bvar[count(*)=1]]]] and *[4][self::m:uplimit[count(*)=1 and *[1][self::m:bvar[count(*)=1]]]]]">
    <xsl:variable name="x" select="*[2]/*[1]"/>
    <xsl:variable name="a" select="*[3]/*[1]/*[1]"/>
    <xsl:variable name="b" select="*[4]/*[1]/*[1]"/>
    <xsl:variable name="f" select="*[5]"/>
    <om:OMA>
      <om:OMS cd="calculus1" name="defint"/>
      <om:OMA>
        <om:OMS cd="interval1" name="interval_cc"/>
        <xsl:apply-templates select="$a"/>
        <xsl:apply-templates select="$b"/>
      </om:OMA>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:int] and *[2][self::m:bvar[count(*)=1]]]">
    <xsl:variable name="x" select="*[2]/*[1]"/>
    <xsl:variable name="f" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="calculus1" name="int"/>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arg]]">
    <xsl:variable name="z" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="complex1" name="argument"/>
      <xsl:apply-templates select="$z"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:conjugate]]">
    <xsl:variable name="z" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="complex1" name="conjugate"/>
      <xsl:apply-templates select="$z"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:imaginary]]">
    <xsl:variable name="z" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="complex1" name="imaginary"/>
      <xsl:apply-templates select="$z"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:imaginary]]">
    <xsl:variable name="z" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="complex1" name="real"/>
      <xsl:apply-templates select="$z"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:domain]]">
    <xsl:variable name="f" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="domain"/>
      <xsl:apply-templates select="$f"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:domainofapplication[count(*)=1]">
    <xsl:variable name="D" select="*[1]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="domainofapplication"/>
      <xsl:apply-templates select="$D"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:ident">
    <om:OMS cd="fns1" name="identity"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:image]]">
    <xsl:variable name="f" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="image"/>
      <xsl:apply-templates select="$f"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:inverse]]">
    <xsl:variable name="f" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="inverse"/>
      <xsl:apply-templates select="$f"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:lambda[count(*)=2 and *[1][self::m:bvar[count(*)&gt;=1]]]">
    <xsl:variable name="variable" select="*[1]/*[1]"/>
    <xsl:variable name="expression" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="lambda"/>
      <om:OMBVAR>
        <xsl:apply-templates select="$variable"/>
      </om:OMBVAR>
      <xsl:apply-templates select="$expression"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:compose]]">
    <xsl:variable name="f" select="*[2]"/>
    <xsl:variable name="g" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="left_compose"/>
      <xsl:apply-templates select="$f"/>
      <xsl:apply-templates select="$g"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:codomain]]">
    <xsl:variable name="f" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="fns1" name="range"/>
      <xsl:apply-templates select="$f"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:factorial]]">
    <xsl:variable name="n" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="integer1" name="factorial"/>
      <xsl:apply-templates select="$n"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:factorof]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="integer1" name="factorof"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:quotient]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="integer1" name="quotient"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:rem]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="integer1" name="remainder"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:interval[count(*)=2]">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="interval1" name="integer_interval"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:interval[count(*)=2 and @closure='closed']">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="interval1" name="interval_cc"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:interval[count(*)=2 and @closure='closed-open']">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="interval1" name="interval_co"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:interval[count(*)=2 and @closure='open-closed']">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="interval1" name="interval_oc"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:interval[count(*)=2 and @closure='open']">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="interval1" name="interval_oo"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:determinant]]">
    <xsl:variable name="M" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="determinant"/>
      <xsl:apply-templates select="$M"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=4 and *[1][self::m:selector]]">
    <xsl:variable name="M" select="*[2]"/>
    <xsl:variable name="r" select="*[3]"/>
    <xsl:variable name="c" select="*[4]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="matrix_selector"/>
      <xsl:apply-templates select="$r"/>
      <xsl:apply-templates select="$c"/>
      <xsl:apply-templates select="$M"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:outerproduct]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="outerproduct"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:scalarproduct]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="scalarproduct"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:transpose]]">
    <xsl:variable name="M" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="transpose"/>
      <xsl:apply-templates select="$M"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:selector]]">
    <xsl:variable name="v" select="*[2]"/>
    <xsl:variable name="i" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="vector_selector"/>
      <xsl:apply-templates select="$i"/>
      <xsl:apply-templates select="$v"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:vectorproduct]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="linalg1" name="vectorproduct"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=1 and *[1][self::m:matrix]]">
    <xsl:variable name="row" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="linalg2" name="matrix"/>
      <xsl:apply-templates select="$row"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=1 and *[1][self::m:matrixrow]]">
    <xsl:variable name="cell" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="linalg2" name="matrixrow"/>
      <xsl:apply-templates select="$cell"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=1 and *[1][self::m:vector]]">
    <xsl:variable name="cell" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="linalg2" name="vector"/>
      <xsl:apply-templates select="$cell"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:tendsto[@type='above']">
    <om:OMS cd="limit1" name="above"/>
  </xsl:template>
  <xsl:template match="m:tendsto[@type='below']">
    <om:OMS cd="limit1" name="below"/>
  </xsl:template>
  <xsl:template match="m:tendsto[@type='both_sides']">
    <om:OMS cd="limit1" name="both_sides"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=4 and *[1][self::m:limit] and *[2][self::m:bvar[count(*)=1]] and *[3][self::m:lowlimit[count(*)=1]]]">
    <xsl:variable name="x" select="*[2]/*[1]"/>
    <xsl:variable name="a" select="*[3]/*[1]"/>
    <xsl:variable name="f" select="*[4]"/>
    <om:OMA>
      <om:OMS cd="limit1" name="limit"/>
      <xsl:apply-templates select="$x0"/>
      <om:OMS cd="limit1" name="both_sides"/>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:tendsto">
    <om:OMS cd="limit1" name="null"/>
  </xsl:template>
  <xsl:template match="m:list[count(*)=3]">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <xsl:variable name="c" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="list1" name="list"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
      <xsl:apply-templates select="$c"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:list[count(*)=2 and *[1][self::m:bvar[count(*)=1]] and *[2][self::m:condition[count(*)=1 and *[1][self::m:apply[count(*)=3 and *[1][self::m:in] and *[3][self::m:interval[count(*)=2]]]]]]]">
    <xsl:variable name="x" select="*[1]/*[1]/*[2]/*[1]/*[2]"/>
    <xsl:variable name="x" select="*[1]/*[1]/*[2]/*[1]/*[2]"/>
    <xsl:variable name="a" select="*[2]/*[1]/*[3]/*[1]"/>
    <xsl:variable name="b" select="*[2]/*[1]/*[3]/*[2]"/>
    <om:OMA>
      <om:OMS cd="list1" name="map"/>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
      <om:OMA>
        <om:OMS cd="interval1" name="integer_interval"/>
        <xsl:apply-templates select="$a"/>
        <xsl:apply-templates select="$b"/>
      </om:OMA>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:list[count(*)=3 and *[1][self::m:bvar[count(*)=1]] and *[2][self::m:condition[count(*)=1 and *[1][self::m:apply[count(*)=1 and *[1][self::m:in[count(*)=2 and *[2][self::m:list[count(*)=3]]]]]]]]]">
    <xsl:variable name="x" select="*[1]/*[1]/*[2]/*[1]/*[1]/*[1]"/>
    <xsl:variable name="x" select="*[1]/*[1]/*[2]/*[1]/*[1]/*[1]"/>
    <xsl:variable name="x1" select="*[2]/*[1]/*[1]/*[2]/*[1]"/>
    <xsl:variable name="x2" select="*[2]/*[1]/*[1]/*[2]/*[2]"/>
    <xsl:variable name="x3" select="*[2]/*[1]/*[1]/*[2]/*[3]"/>
    <xsl:variable name="l" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="list1" name="map"/>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$f"/>
      </om:OMBIND>
      <om:OMA>
        <om:OMS cd="set1" name="set"/>
        <xsl:apply-templates select="$x1"/>
        <xsl:apply-templates select="$x2"/>
        <xsl:apply-templates select="$x3"/>
      </om:OMA>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:and]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="logic1" name="and"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:equivalent]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="logic1" name="equivalent"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:false">
    <om:OMS cd="logic1" name="false"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:implies]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="logic1" name="implies"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:or]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="logic1" name="or"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:true">
    <om:OMS cd="logic1" name="true"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:xor]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="logic1" name="xor"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:max]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="minmax1" name="max"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:min]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="minmax1" name="min"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_cart_prod]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_cart_prod"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_empty]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_empty"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_in]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_in"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_intersect]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_intersect"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:multiset]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="multiset"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_notin]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_notin"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_notprsubset]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_notprsubset"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_notsubset]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_notsubset"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_prsubset]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_prsubset"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_setdiff]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_setdiff"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_size]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_size"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_card]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_card"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_subset]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_subset"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:ms_union]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="multiset1" name="ms_union"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:cn[count(*)=1 and @type='integer' and @base='b']">
    <xsl:variable name="n" select="*[1]"/>
    <om:OMA>
      <om:OMS cd="nums1" name="based_integer"/>
      <xsl:apply-templates select="$b"/>
      <om:OMSTR>
        <xsl:apply-templates select="$n"/>
      </om:OMSTR>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:exponentiale">
    <om:OMS cd="nums1" name="e"/>
  </xsl:template>
  <xsl:template match="m:eulergamma">
    <om:OMS cd="nums1" name="gamma"/>
  </xsl:template>
  <xsl:template match="m:cn">
    <om:OMS cd="nums1" name="i"/>
  </xsl:template>
  <xsl:template match="m:infinity">
    <om:OMS cd="nums1" name="inf"/>
  </xsl:template>
  <xsl:template match="m:notanumber">
    <om:OMS cd="nums1" name="NaN"/>
  </xsl:template>
  <xsl:template match="m:pi">
    <om:OMS cd="nums1" name="pi"/>
  </xsl:template>
  <xsl:template match="m:cn[count(*)=3 and @type='rational' and *[2][self::m:sep]]">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="nums1" name="rational"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:otherwise[count(*)=1]">
    <xsl:variable name="a" select="*[1]"/>
    <om:OMA>
      <om:OMS cd="piece1" name="otherwise"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:piece[count(*)=2]">
    <xsl:variable name="c" select="*[1]"/>
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="piece1" name="otherwise"/>
      <xsl:apply-templates select="$c"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:piecewise[count(*)&gt;=1]">
    <xsl:variable name="a" select="*[1]"/>
    <om:OMA>
      <om:OMS cd="piece1" name="piecewise"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:exists] and *[2][self::m:bvar[count(*)&gt;=1]]]">
    <xsl:variable name="variable" select="*[2]/*[1]"/>
    <xsl:variable name="expression" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="quant1" name="exists"/>
      <om:OMBVAR>
        <xsl:apply-templates select="$variable"/>
      </om:OMBVAR>
      <xsl:apply-templates select="$expression"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:forall] and *[2][self::m:bvar[count(*)&gt;=1]]]">
    <xsl:variable name="variable" select="*[2]/*[1]"/>
    <xsl:variable name="expression" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="quant1" name="forall"/>
      <om:OMBVAR>
        <xsl:apply-templates select="$variable"/>
      </om:OMBVAR>
      <xsl:apply-templates select="$expression"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:approx]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="approx"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:eq]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="eq"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:geq]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="geq"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:gt]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="gt"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:leq]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="leq"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:lt]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="lt"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:neq]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="b" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="relation1" name="neq"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:complexes">
    <om:OMS cd="setname1" name="C"/>
  </xsl:template>
  <xsl:template match="m:naturalnumbers">
    <om:OMS cd="setname1" name="N"/>
  </xsl:template>
  <xsl:template match="m:primes">
    <om:OMS cd="setname1" name="P"/>
  </xsl:template>
  <xsl:template match="m:rationals">
    <om:OMS cd="setname1" name="Q"/>
  </xsl:template>
  <xsl:template match="m:reals">
    <om:OMS cd="setname1" name="R"/>
  </xsl:template>
  <xsl:template match="m:integers">
    <om:OMS cd="setname1" name="Z"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:ceiling]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="rounding1" name="ceiling"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:floor]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="rounding1" name="floor"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:setdiff]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="setdiff"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:union]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="union"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:intersect]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="intersect"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:cartesianproduct]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="cartesian_product"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:emptyset">
    <om:OMS cd="set1" name="emptyset"/>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:in]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="A" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="in"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$A"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:notin]]">
    <xsl:variable name="a" select="*[2]"/>
    <xsl:variable name="A" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="notin"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$A"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:notprsubset]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="notprsubset"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:notsubset]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="notsubset"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:prsubset]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="prsubset"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:subset]]">
    <xsl:variable name="A" select="*[2]"/>
    <xsl:variable name="B" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="subset"/>
      <xsl:apply-templates select="$A"/>
      <xsl:apply-templates select="$B"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:set[count(*)=3]">
    <xsl:variable name="a" select="*[1]"/>
    <xsl:variable name="b" select="*[2]"/>
    <xsl:variable name="c" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="set"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$b"/>
      <xsl:apply-templates select="$c"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:card]]">
    <xsl:variable name="A" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="set1" name="size"/>
      <xsl:apply-templates select="$A"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:set[count(*)=3 and *[1][self::m:bvar[count(*)=1]] and *[2][self::m:condition[count(*)=1]]]">
    <xsl:variable name="x" select="*[1]/*[1]/*[3]"/>
    <xsl:variable name="c" select="*[2]/*[1]"/>
    <xsl:variable name="x" select="*[1]/*[1]/*[3]"/>
    <om:OMA>
      <om:OMS cd="set1" name="suchthat"/>
      <xsl:apply-templates select="$X"/>
      <om:OMBIND>
        <om:OMS cd="fns1" name="lambda"/>
        <om:OMBVAR>
          <xsl:apply-templates select="$x"/>
        </om:OMBVAR>
        <xsl:apply-templates select="$c"/>
      </om:OMBIND>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:mean]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="mean"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:median]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="median"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:mode]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="mode"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=4 and *[1][self::m:moment] and *[2][self::m:degree[count(*)=1]] and *[3][self::m:momentabout[count(*)=1]]]">
    <xsl:variable name="k" select="*[2]/*[1]"/>
    <xsl:variable name="c" select="*[3]/*[1]"/>
    <xsl:variable name="a" select="*[4]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="moment"/>
      <xsl:apply-templates select="$k"/>
      <xsl:apply-templates select="$c"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sdev]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="sdev"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)&gt;=2 and *[1][self::m:variance]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="variance"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:mean]]">
    <xsl:variable name="X" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="mean"/>
      <xsl:apply-templates select="$X"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=4 and *[1][self::m:moment] and *[2][self::m:degree[count(*)=1]] and *[3][self::m:momentabout[count(*)=1]]]">
    <xsl:variable name="k" select="*[2]/*[1]"/>
    <xsl:variable name="c" select="*[3]/*[1]"/>
    <xsl:variable name="X" select="*[4]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="moment"/>
      <xsl:apply-templates select="$k"/>
      <xsl:apply-templates select="$c"/>
      <xsl:apply-templates select="$X"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sdev]]">
    <xsl:variable name="a" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="sdev"/>
      <xsl:apply-templates select="$a"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:variance]]">
    <xsl:variable name="X" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="s_data1" name="variance"/>
      <xsl:apply-templates select="$X"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccos]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccos"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccosh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccosh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccot]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccot"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccoth]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccoth"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccsc]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccsc"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arccsch]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arccsch"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arcsec]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arcsec"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arcsech]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arcsech"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arcsin]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arcsin"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arcsinh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arcsinh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arctan]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arctan"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:arctanh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="arctanh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:cos]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="cos"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:cosh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="cosh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:cot]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="cot"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:coth]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="coth"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:csc]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="csc"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:csch]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="csch"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:exp]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="exp"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:ln]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="ln"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=3 and *[1][self::m:log] and *[2][self::m:logbase[count(*)=1]]]">
    <xsl:variable name="a" select="*[2]/*[1]"/>
    <xsl:variable name="x" select="*[3]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="log"/>
      <xsl:apply-templates select="$a"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sec]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="sec"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sech]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="sech"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sin]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="sin"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:sinh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="sinh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:tan]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="tan"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:tanh]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="transc1" name="tanh"/>
      <xsl:apply-templates select="$x"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:curl]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="veccalc1" name="curl"/>
      <xsl:apply-templates select="$v"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:divergence]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="veccalc1" name="divergence"/>
      <xsl:apply-templates select="$v"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:divergence]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="veccalc1" name="grad"/>
      <xsl:apply-templates select="$v"/>
    </om:OMA>
  </xsl:template>
  <xsl:template match="m:apply[count(*)=2 and *[1][self::m:laplacian]]">
    <xsl:variable name="x" select="*[2]"/>
    <om:OMA>
      <om:OMS cd="veccalc1" name="Laplacian"/>
      <xsl:apply-templates select="$v"/>
    </om:OMA>
  </xsl:template>
</xsl:stylesheet>
