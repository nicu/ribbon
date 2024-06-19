<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ba="urn:schemas-ibizatalk-com:metadata">

	<xsl:output method="xml" omit-xml-declaration="no"/>

	<xsl:template match="/">
		<xsl:element name="tab">
			<xsl:apply-templates/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="/data/module">
		<xsl:if test="(string(@profile) = '') or (contains(@profile, /data/@profile))">
			<xsl:variable name="groupLabel" select="normalize-space(name)"/>
			<xsl:element name="group">
				<xsl:attribute name="label"><xsl:value-of select="$groupLabel"/></xsl:attribute>
				<xsl:element name="box">
					<xsl:attribute name="size"><xsl:value-of select="@size"/></xsl:attribute>
					<xsl:attribute name="maxsize"><xsl:value-of select="@maxsize"/></xsl:attribute>
					<xsl:attribute name="minsize"><xsl:value-of select="@minsize"/></xsl:attribute>
					<xsl:apply-templates select="./process|./module"/>
				</xsl:element>
			</xsl:element>
		</xsl:if>
	</xsl:template>

	<xsl:template match="data/module/process">
		<xsl:if test="(string(@profile) = '') or (contains(@profile, /data/@profile))">
	        <xsl:choose>
	            <xsl:when test="@custom = 'true'">
	                <xsl:call-template name="customControl">
	                    <xsl:with-param name="node" select="."/>
	                </xsl:call-template>
	            </xsl:when>
	            <xsl:otherwise>
	                <xsl:call-template name="button">
	                    <xsl:with-param name="node" select="."/>
	                </xsl:call-template>
	            </xsl:otherwise>
	        </xsl:choose>
		</xsl:if>
	</xsl:template>

	<xsl:template match="data/module/module">
		<xsl:if test="(string(@profile) = '') or (contains(@profile, /data/@profile))">
			<xsl:call-template name="dropDownButton">
				<xsl:with-param name="node" select="."/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>


	<xsl:template name="button">
		<xsl:param name="node"/>
		<xsl:element name="button">
			<xsl:attribute name="label"><xsl:value-of select="normalize-space($node/name)"/></xsl:attribute>
			<xsl:attribute name="help"><xsl:value-of select="normalize-space($node/help)"/></xsl:attribute>
			<xsl:attribute name="icon"><xsl:value-of select="normalize-space($node/icon)"/></xsl:attribute>
			<xsl:attribute name="accel"><xsl:value-of select="normalize-space($node/accel)"/></xsl:attribute>
            <xsl:if test="string-length($node/id) &gt; 0"><xsl:attribute name="id"><xsl:value-of select="normalize-space($node/id)"/></xsl:attribute></xsl:if>
      <xsl:if test="count(data/@contextID)">
        <xsl:attribute name="contextID"><xsl:value-of select="data/@contextID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$node/disabled = 'true'">
          <xsl:attribute name="disabled">true</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="disabled">false</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test="string-length(normalize-space($node/src)) &gt; 0">
        <xsl:element name="action">
          <xsl:attribute name="type"><xsl:value-of select="$node/src/@type"/></xsl:attribute>
					<xsl:attribute name="dependencies"><xsl:value-of select="$node/@dependencies"/></xsl:attribute>
					<xsl:value-of select="normalize-space($node/src)"/>
				</xsl:element>
			</xsl:if>
		</xsl:element>
	</xsl:template>


	<xsl:template name="dropDownButton">
		<xsl:param name="node"/>
		<xsl:element name="button">
			<xsl:attribute name="label"><xsl:value-of select="normalize-space($node/name)"/></xsl:attribute>
			<xsl:attribute name="help"><xsl:value-of select="normalize-space($node/help)"/></xsl:attribute>
			<xsl:attribute name="icon"><xsl:value-of select="normalize-space($node/icon)"/></xsl:attribute>
			<xsl:attribute name="accel"><xsl:value-of select="normalize-space($node/accel)"/></xsl:attribute>
			<xsl:if test="string-length($node/id) &gt; 0"><xsl:attribute name="id"><xsl:value-of select="normalize-space($node/id)"/></xsl:attribute></xsl:if>
              <xsl:if test="count(data/@contextID)">
                <xsl:attribute name="contextID"><xsl:value-of select="data/@contextID"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="count($node/disabled) &gt; 0">
                <xsl:attribute name="disabled">true</xsl:attribute>
              </xsl:if>
            
			<xsl:element name="menu">
                <xsl:if test="$node/@onbuild != ''">
                    <xsl:attribute name="onbuild"><xsl:value-of select="$node/@onbuild"/></xsl:attribute>
					<xsl:attribute name="dependencies"><xsl:value-of select="$node/@dependencies"/></xsl:attribute>
                </xsl:if>
				<xsl:call-template name="dropDownMenu">
					<xsl:with-param name="node" select="process|module"/>
				</xsl:call-template>
			</xsl:element>

		</xsl:element>
	</xsl:template>

	<xsl:template name="dropDownMenu">
		<xsl:param name="node"/>

		<xsl:text disable-output-escaping="yes">&lt;![CDATA[</xsl:text>
		<xsl:copy-of select="$node"/>
		<xsl:text disable-output-escaping="yes">]]&gt;</xsl:text>
	</xsl:template>


    <xsl:template name="customControl">
        <xsl:param name="node"/>
        <xsl:element name="control">
            <xsl:attribute name="id"><xsl:value-of select="$node/id"/></xsl:attribute>
            <xsl:attribute name="onDraw"><xsl:value-of select="$node/@onDraw"/></xsl:attribute>
            <xsl:choose>
                <xsl:when test="$node/disabled = 'true'">
                    <xsl:attribute name="disabled">true</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="disabled">false</xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>

            <xsl:choose>
                <xsl:when test="count($node/@width) = 1">
                    <xsl:attribute name="width"><xsl:value-of select="$node/@width"/></xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="width">10</xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>