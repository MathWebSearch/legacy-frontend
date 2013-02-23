<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:r="http://www.matracas.org/ns/mws-result-0.1"
  xmlns:mws="http://www.mathweb.org/mws/ns"
  xmlns="http://www.w3.org/1999/xhtml"
  version="1.0">

  <xsl:output method="xml"/>
  <xsl:variable name="pager_radius" select="4"/>
  <xsl:param name="start">1</xsl:param>
  <xsl:param name="results_per_page">10</xsl:param>

  <xsl:template match="/">
    <html>
      <body bgcolor="#FFFFFF">
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="mws:answset">
    <div class="statistics">
      <xsl:choose>
        <xsl:when test="@total=0">
          <xsl:text>Found no results</xsl:text>
        </xsl:when>
        <xsl:when test="@total=1">
          <xsl:text>Found </xsl:text><xsl:value-of select="@total"/><xsl:text> result</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>Found </xsl:text><xsl:value-of select="@total"/><xsl:text> results</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </div>
    <xsl:choose>
      <xsl:when test="@total &gt; $results_per_page">
        <xsl:call-template name="pager"/>
        <xsl:apply-templates/>
        <xsl:call-template name="pager"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template name="pager">
    <xsl:variable name="range_begin">
      <xsl:choose>
        <xsl:when test="$start - $pager_radius * $results_per_page &gt; 1">
          <xsl:value-of select="$start - $pager_radius * $results_per_page"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="1"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="range_end">
      <xsl:choose>
        <xsl:when test="$start + $pager_radius * $results_per_page &lt; @total">
          <xsl:value-of select="$start + $pager_radius * $results_per_page - 1"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@total"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <div class="pager">
      <xsl:if test="$range_begin &gt; 1">
        <a href="javascript:goto_page(1)">First</a>
        <xsl:text>...</xsl:text>
      </xsl:if>
      <xsl:call-template name="build_pager_links">
        <xsl:with-param name="range_begin" select="$range_begin"/>
        <xsl:with-param name="range_end"   select="$range_end"/>
        <xsl:with-param name="current_begin" select="$start"/>
      </xsl:call-template>
      <xsl:if test="$range_end &lt; @total">
        <xsl:text>...</xsl:text>
        <a href="javascript:goto_page({ceiling(@total div $results_per_page)})">Last</a>
      </xsl:if>
    </div>
  </xsl:template>
  
  <xsl:template name="build_pager_links">
    <xsl:param name="range_begin"/>
    <xsl:param name="range_end"/>
    <xsl:param name="current_begin"/>
    <xsl:variable name="page_end">
      <xsl:choose>
        <xsl:when test="$range_begin + $results_per_page - 1 &lt;= $range_end">
          <xsl:value-of select="$range_begin + $results_per_page - 1"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$range_end"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$range_end &gt;= $range_begin">
      <xsl:choose>
        <xsl:when test="$range_begin = $current_begin">
          <span><xsl:value-of select="$range_begin"/>-<xsl:value-of select="$page_end"/></span>
        </xsl:when>
        <xsl:otherwise>
          <a href="javascript:goto_page({floor(($range_begin - 1) div $results_per_page + 1)})"><xsl:value-of select="$range_begin"/>-<xsl:value-of select="$page_end"/></a>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:call-template name="build_pager_links">
        <xsl:with-param name="range_begin" select="$range_begin + $results_per_page"/>
        <xsl:with-param name="range_end" select="$range_end"/>
        <xsl:with-param name="current_begin" select="$current_begin"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="r:error">
    <div class="error" code="{@code}">
      <xsl:for-each select="*|text()">
        <xsl:call-template name="copy-verbatim"/>
      </xsl:for-each>
    </div>
  </xsl:template>
  
  <xsl:template match="mws:answ">
    <div class="result-entry">
      <!-- div class="result-entry-rank" style="width:120px; height:12px; text-align:right;" title="Rank {@rank}"><div style="width:{@rank * 120}px; height:12px; margin-left:{(1 - @rank) * 120}px;"> </div></div -->
      <a href="{@uri}"><xsl:value-of select="@uri"/></a>
      <xsl:variable name="id" select="concat('description-', count(preceding-sibling::mws:answ))"/>
      <div class="description loading" id="{$id}"></div>
      <script type="text/javascript">expand_formula('<xsl:value-of select="@uri"/>', document.getElementById('<xsl:value-of select="$id"/>'))</script>
      <div class="result-entry-match-info">
        <xsl:for-each select="mws:substpair">
          <div class="result-entry-substitution" qvar="{@qvar}" xpath="{@xpath}"><xsl:value-of select="@qvar"/> → <xsl:value-of select="@xpath"/></div>
        </xsl:for-each>
      </div>
    </div>
  </xsl:template>
  
  <xsl:template name="copy-verbatim">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:for-each select="*|text()">
        <xsl:call-template name="copy-verbatim"/>
      </xsl:for-each>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>
