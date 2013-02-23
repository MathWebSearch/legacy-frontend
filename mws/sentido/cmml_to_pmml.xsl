<?xml version="1.0" encoding="utf-8"?>
<!-- This file is part of Sentido: http://www.matracas.org/sentido/
     Author: Alberto González Palomo
     © 2012 Alberto González Palomo
     -->
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1998/Math/MathML" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:include href="om_to_pmml.xsl"/>
  
  <xsl:output method="xml"/>

  <xsl:template match="m:*">
    <xsl:message>ERROR: unhandled tag <xsl:value-of select="name(.)"/></xsl:message>
    <xsl:value-of select="name()"/>
  </xsl:template>
  
  <xsl:template match="@*|node()" mode="copy">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" mode="copy"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="m:math">
    <m:math>
      <xsl:apply-templates/>
      <!-- m:semantics>
        <xsl:apply-templates mode="copy"/>
      </m:semantics -->
    </m:math>
  </xsl:template>
  <xsl:template match="m:semantics">
    <xsl:apply-templates select="m:annotation[@encoding='MathML-Content'][1]"/>
  </xsl:template>
  
  <xsl:template match="m:annotation-xml">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="m:ci">
    <m:mi><xsl:apply-templates/></m:mi>
  </xsl:template>
  
  <xsl:template match="m:cn">
    <m:mn><xsl:apply-templates/></m:mn>
  </xsl:template>
  
  <xsl:template match="m:msub|m:msup|m:mover|m:fenced|m:mtable">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="m:apply">
    <xsl:param name="parent_precedence">0</xsl:param>
    <xsl:variable name="name" select="local-name(*[1])"/>
    <xsl:choose>
      <xsl:when test="$name='eq' or $name='neq' or $name='leq' or $name='geq' or $name='lt' or $name='gt' or $name='in' or $name='notin' or $name='subset' or $name='notsubset' or $name='union' or $name='intersect'">
        <xsl:call-template name="infix_notation">
          <xsl:with-param name="precedence">5</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='divide'">
        <xsl:call-template name="fraction_notation">
          <xsl:with-param name="precedence">60</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='times'">
        <xsl:call-template name="infix_notation">
          <xsl:with-param name="precedence">60</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='plus' and count(*) &gt; 2">
        <xsl:call-template name="infix_notation_breakable">
          <xsl:with-param name="precedence">50</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='plus'">
        <xsl:call-template name="prefix_notation">
          <xsl:with-param name="precedence">80</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='minus' and count(*) &gt; 2">
        <xsl:call-template name="infix_notation_breakable">
          <xsl:with-param name="precedence">50</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='minus'">
        <xsl:call-template name="prefix_notation">
          <xsl:with-param name="precedence">80</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='int'">
        <xsl:call-template name="integral_notation_cmml"/>
      </xsl:when>
      <xsl:when test="$name='interval'">
        <xsl:variable name="open">
          <xsl:choose>
            <xsl:when test="@closure='open' or @closure='open-close'">(</xsl:when>
            <xsl:otherwise>[</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="close">
          <xsl:choose>
            <xsl:when test="@closure='open' or @closure='close-open'">)</xsl:when>
            <xsl:otherwise>]</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <m:mfenced open="{$open}" close="{$close}"><xsl:apply-templates select="*[position()!=1]"/></m:mfenced>
      </xsl:when>
      <xsl:when test="$name='abs'">
        <m:mfenced open="|" close="|"><xsl:apply-templates select="*[position()!=1]"/></m:mfenced>
      </xsl:when>
      <xsl:when test="$name='power'">
        <xsl:call-template name="superindex_notation">
          <xsl:with-param name="precedence">70</xsl:with-param>
          <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$name='root'">
        <xsl:choose>
          <xsl:when test="*[3][self::m:cn]='2'">
            <xsl:element name="m:msqrt">
              <xsl:attribute name="degree"><xsl:value-of select="string(*[3])"/></xsl:attribute>
              <xsl:apply-templates select="*[2]"/>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:element name="m:mroot">
              <m:mrow><xsl:apply-templates select="*[2]"><xsl:with-param name="parent_precedence" select="$precedence"/></xsl:apply-templates></m:mrow>
              <m:mrow><xsl:apply-templates select="*[3]"/></m:mrow>
            </xsl:element>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$name='exp'">
        <m:msup>
          <xsl:apply-templates select="*[1]"/>
          <m:mrow>
            <xsl:apply-templates select="*[position()!=1]">
              <xsl:with-param name="parent_precedence">70</xsl:with-param>
            </xsl:apply-templates>
          </m:mrow>
        </m:msup>
      </xsl:when>
      <xsl:otherwise>
        <m:mrow><xsl:call-template name="function_notation"/></m:mrow>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="m:eq"><m:mo>=</m:mo></xsl:template>
  <xsl:template match="m:neq"><m:mo>≠</m:mo></xsl:template>
  <xsl:template match="m:leq"><m:mo>≤</m:mo></xsl:template>
  <xsl:template match="m:geq"><m:mo>≥</m:mo></xsl:template>
  <xsl:template match="m:lt"><m:mo>&lt;</m:mo></xsl:template>
  <xsl:template match="m:gt"><m:mo>&gt;</m:mo></xsl:template>
  <xsl:template match="m:divide"><m:mo>/</m:mo></xsl:template>
  <xsl:template match="m:times"><m:mo>×</m:mo></xsl:template>
  <xsl:template match="m:plus"><m:mo>+</m:mo></xsl:template>
  <xsl:template match="m:minus"><m:mo>-</m:mo></xsl:template>
  
  <xsl:template match="m:apply[m:csymbol]">
    <xsl:param name="parent_precedence">0</xsl:param>
    <xsl:call-template name="function_notation">
      <xsl:with-param name="precedence">0</xsl:with-param>
      <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
    </xsl:call-template>
  </xsl:template>
  
  <xsl:template match="m:apply[m:csymbol[@cd='ambiguous'][text()='superscript']]">
    <xsl:param name="parent_precedence">0</xsl:param>
    <xsl:call-template name="superindex_notation">
      <xsl:with-param name="precedence">70</xsl:with-param>
      <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
    </xsl:call-template>
  </xsl:template>
  
  <xsl:template match="m:apply[m:csymbol[@cd='ambiguous'][text()='subscript']]">
    <xsl:param name="parent_precedence">0</xsl:param>
    <xsl:call-template name="subindex_notation">
      <xsl:with-param name="precedence">70</xsl:with-param>
      <xsl:with-param name="parent_precedence" select="$parent_precedence"/>
    </xsl:call-template>
  </xsl:template>
  
  <xsl:template match="m:partialdiff"><m:mo>∂</m:mo></xsl:template>
  <xsl:template match="m:sin"><m:mo>sin</m:mo></xsl:template>
  <xsl:template match="m:cos"><m:mo>cos</m:mo></xsl:template>
  <xsl:template match="m:tan"><m:mo>tan</m:mo></xsl:template>
  <xsl:template match="m:cot"><m:mo>cot</m:mo></xsl:template>
  <xsl:template match="m:ln"><m:mo>ln</m:mo></xsl:template>
  <xsl:template match="m:log"><m:mo>log</m:mo></xsl:template>
  <xsl:template match="m:lim"><m:mo>lim</m:mo></xsl:template>
  <xsl:template match="m:int"><m:mo>∫</m:mo></xsl:template>
  <xsl:template match="m:sum"><m:mo>∑</m:mo></xsl:template>
  <xsl:template match="m:prod"><m:mo>∏</m:mo></xsl:template>
  
  <xsl:template match="m:in"><m:mo>∈</m:mo></xsl:template>
  <xsl:template match="m:notin"><m:mo>∉</m:mo></xsl:template>
  <xsl:template match="m:subset"><m:mo>⊂</m:mo></xsl:template>
  <xsl:template match="m:notsubset"><m:mo>⊄</m:mo></xsl:template>
  <xsl:template match="m:emptyset"><m:mi>∅</m:mi></xsl:template>
  <xsl:template match="m:union"><m:mo>∪</m:mo></xsl:template>
  <xsl:template match="m:intersect"><m:mo>∩</m:mo></xsl:template>
  
  <xsl:template match="m:infinity"><m:mi>∞</m:mi></xsl:template>
  <xsl:template match="m:pi"><m:mn>π</m:mn></xsl:template>
  <xsl:template match="m:exponentiale"><m:mn>ⅇ</m:mn></xsl:template>
  <xsl:template match="m:exp"><m:mn>ⅇ</m:mn></xsl:template>
  <xsl:template match="m:imaginaryi"><m:mn>ⅈ</m:mn></xsl:template>
  <xsl:template match="m:grad"><m:mo>∇</m:mo></xsl:template>
  <xsl:template match="m:laplacian"><m:mo><m:msup><m:mo>∇</m:mo><m:mn>2</m:mn></m:msup></m:mo></xsl:template>
  
  <xsl:template match="m:moment"><m:mo>µ</m:mo></xsl:template>
  <xsl:template match="m:sdev"><m:mo>σ</m:mo></xsl:template>
  
</xsl:stylesheet>
