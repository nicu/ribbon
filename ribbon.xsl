<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>


  <xsl:template match="/">
    <div>
	    <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="/tab">
    <div id="ribbonPageContainer" itemType="RBN_PAGE_CONTAINER">
		<div class="ribbonPage" id="ribbonPage" isRibbonElem="true">
	      <table cellpadding="0" cellspacing="0" class="ribbonPageTbl" id="ribbonPageTbl" isRibbonElem="true">
              <tr isRibbonElem="true">
    			<xsl:apply-templates select="group"/>
			</tr>
	      </table>
	    </div>
	</div>
    <div id="ribbonBarScrollLeft" itemType="RBN_SCROLL_LEFT" isRibbonElem="true">&#160;</div>
    <div id="ribbonBarScrollRight" itemType="RBN_SCROLL_RIGHT" isRibbonElem="true">&#160;</div>
  </xsl:template>



  <xsl:template match="/tab/group">
    <xsl:call-template name="group">
      <xsl:with-param name="size" select="@size"/>
    </xsl:call-template>     
  </xsl:template>

  <xsl:template name="group">
    <xsl:param name="size"/>
      <td isRibbonElem="true">
      <table class="ribbonGroup" cellpadding="0" cellspacing="0" itemType="RBN_GROUP">
        <xsl:attribute name="onmouseenter">this.className = 'ribbonGroup_hot';</xsl:attribute>
        <xsl:attribute name="onmouseleave">this.className = 'ribbonGroup';</xsl:attribute>
          <tr isRibbonElem="true">
          <td class="ribbonGroupLeft" isRibbonElem="true">&#160;</td>
          <td class="ribbonGroupContent" isRibbonElem="true">
            <table width="100%" cellpadding="0" cellspacing="0" class="ribbonGroupTable" isRibbonElem="true">
              <xsl:attribute name="title"><xsl:value-of select="@label"/></xsl:attribute>
                <tr isRibbonElem="true">
                <td class="ribbonGroupTableContent" isRibbonElem="true">
                  <table cellpadding="0" cellspacing="0" width="100%" isRibbonElem="true">
                      <tr isRibbonElem="true">
                      <xsl:for-each select="*">
                        <!-- Butoane / grupuri de butoane -->
                        <xsl:choose>
                          <xsl:when test="name() = 'box'">
                              <td isRibbonElem="true">
                              <xsl:call-template name="getSize">
                                <xsl:with-param name="size" select="$size"/>
                              </xsl:call-template>
                            </td>
                          </xsl:when>
                          <xsl:when test="name() = 'separator'">
                            <td class="rbnSeparator" isRibbonElem="true">&#160;</td>
                          </xsl:when>
                        </xsl:choose>
                      </xsl:for-each>
                    </tr>
                  </table>
                </td>
              </tr>
                <tr isRibbonElem="true">
                <td class="ribbonGroupTableText" isRibbonElem="true">
                  <!--xsl:value-of select="@label"/-->
                  <xsl:choose>
                    <!--xsl:when test="$size &gt; 1"-->
                    <xsl:when test="($size &gt; 1) or (count(box[@minsize &gt; 1]) &gt; 0)">
                      <xsl:value-of select="@label"/>
                    </xsl:when>
                    <xsl:otherwise>
                      &#160;
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </table>
          </td>
          <td class="ribbonGroupRight" isRibbonElem="true">&#160;</td>
        </tr>
      </table>
    </td>
  </xsl:template>


  <xsl:template name="getSize">
    <xsl:param name="size"/>
    <xsl:choose>
      <xsl:when test="$size &lt;= @minsize">
        <xsl:call-template name="box">
          <xsl:with-param name="size" select="@minsize"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$size &gt;= @maxsize">
        <xsl:call-template name="box">
          <xsl:with-param name="size" select="@maxsize"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="box">
          <xsl:with-param name="size" select="$size"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template name="box">
    <xsl:param name="size"/>
	  <!-- <xsl:variable name="profile" select="/ribbon/@profile"/>	 -->
    <!-- <xsl:variable name="nodeList" select="./button[contains(@profile, $profile) or (count(@profile) = 0)]|./control[contains(@profile, $profile) or (count(@profile) = 0)]"/> -->
    <xsl:variable name="nodeList" select="./button|./control"/>

    <xsl:choose>
      <xsl:when test="$size = 3 or $size = ''">
        <xsl:call-template name="largeBox">
          <xsl:with-param name="nodeList" select="$nodeList"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$size = 2">
        <xsl:call-template name="mediumBox">
          <xsl:with-param name="nodeList" select="$nodeList"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$size = 1">
        <xsl:call-template name="smallBox">
          <xsl:with-param name="nodeList" select="$nodeList"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>


    <xsl:template name="control">
        <xsl:param name="node"/>
        <div isRibbonElem="true">
            <xsl:attribute name="id"><xsl:value-of select="$node/@id"/></xsl:attribute>
            <!--<xsl:attribute name="style">width:<xsl:value-of select="$node/@width"/>px; height: 22px; overflow: hidden;</xsl:attribute>-->
        </div>
    </xsl:template>


  <xsl:template name="largeBox">
  	<xsl:param name="nodeList"/>
    <xsl:for-each select="$nodeList">
        <td isRibbonElem="true">
          <xsl:choose>
              <xsl:when test="name() = 'control'">
                  <xsl:call-template name="control">
                      <xsl:with-param name="node" select="."/>
                  </xsl:call-template>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:call-template name="largeButton">
                      <xsl:with-param name="node" select="."/>
                  </xsl:call-template>
              </xsl:otherwise>
          </xsl:choose>
      </td>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="mediumBox">
  	<xsl:param name="nodeList"/>
    <table cellpadding="0" cellspacing="0" border="0" class="rbnGroupX3" width="100%" isRibbonElem="true">
      <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="1"/>
          <xsl:with-param name="groupSize" select="2"/>
        </xsl:call-template>
      </tr>
        <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="2"/>
          <xsl:with-param name="groupSize" select="2"/>
        </xsl:call-template>
      </tr>
        <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="3"/>
          <xsl:with-param name="groupSize" select="2"/>
        </xsl:call-template>
      </tr>
    </table>
  </xsl:template>

  <xsl:template name="smallBox">
  	<xsl:param name="nodeList"/>
    <table cellpadding="0" cellspacing="0" border="0" class="rbnGroupX3" width="100%" isRibbonElem="true">
        <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="1"/>
          <xsl:with-param name="groupSize" select="1"/>
        </xsl:call-template>
      </tr>
        <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="2"/>
          <xsl:with-param name="groupSize" select="1"/>
        </xsl:call-template>
      </tr>
        <tr isRibbonElem="true">
        <xsl:call-template name="verticalGroupCell">
			<xsl:with-param name="nodeList" select="$nodeList"/>
          <xsl:with-param name="currentPos" select="3"/>
          <xsl:with-param name="groupSize" select="1"/>
        </xsl:call-template>
      </tr>
    </table>
  </xsl:template>


  <xsl:template name="btnClick">
    <xsl:param name="node"/>
      <xsl:choose>
          <xsl:when test="$node/@disabled = 'true'"></xsl:when>
          <xsl:otherwise>
            <xsl:if test="count($node/action) &gt; 0">
                    <xsl:variable name="type" select="$node/action/@type"/>
                    <xsl:variable name="dependencies" select="$node/action/@dependencies"/>
                    <xsl:variable name="link" select="$node/action"/>
                    <xsl:choose>
                        <xsl:when test="$type = 'framed-link'">
                            <xsl:attribute name="onclick">openFramedLink('<xsl:value-of select="normalize-space($link)"/>','<xsl:value-of select="normalize-space($dependencies)"/>','<xsl:value-of select="$node/@label"/>', event);</xsl:attribute>
                        </xsl:when>
                        <xsl:when test="$type = 'windowed-link'">
                            <xsl:attribute name="onclick">openWindowedLink('<xsl:value-of select="normalize-space($link)"/>','<xsl:value-of select="normalize-space($dependencies)"/>','<xsl:value-of select="$node/@label"/>', event);</xsl:attribute>
                        </xsl:when>
                        <xsl:when test="$type = 'dialog-link'">
                            <xsl:attribute name="onclick">openDialoguedLink( '<xsl:value-of select="normalize-space($link)"/>', true, null, '<xsl:value-of select="normalize-space($dependencies)"/>','<xsl:value-of select="$node/@label"/>', event);</xsl:attribute>
                        </xsl:when>
                        <xsl:when test="$type = 'modeless-dialog-link'">
                            <xsl:attribute name="onclick">openDialoguedLink( '<xsl:value-of select="normalize-space($link)"/>', false, null, '<xsl:value-of select="normalize-space($dependencies)"/>','<xsl:value-of select="$node/@label"/>', event);</xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="onclick">getRibbon().execute('<xsl:value-of select="$node/@contextID"/>', '<xsl:value-of select="normalize-space($link)"/>', event);</xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
            </xsl:if>
            <xsl:variable name="menu" select="normalize-space($node/menu)"/>
            <xsl:if test="count($node/menu) &gt; 0">
                <xsl:attribute name="isDropDown">true</xsl:attribute>
				<xsl:variable name="onBuildDependencies" select="$node/menu/@dependencies"/>
				  <xsl:attribute name="onclick">ribbon.buildMenu(this, '<xsl:value-of select="$menu"/>', '<xsl:value-of select="$node/@contextID"/>',<xsl:choose><xsl:when test="$node/menu/@onbuild != ''">'<xsl:value-of select="$node/menu/@onbuild"/>'</xsl:when>
				    <xsl:otherwise>''</xsl:otherwise></xsl:choose>,'<xsl:value-of select="$onBuildDependencies"/>');</xsl:attribute>
			</xsl:if>
          </xsl:otherwise>
      </xsl:choose>
  </xsl:template>


  <xsl:template name="btnAccel">
    <xsl:param name="node"/>
    <xsl:variable name="accel" select="$node/@accel"/>
    <xsl:if test="$accel != ''">
      <div class="shortCutPanel" isRibbonElem="true">
        <div class="shortCut" isRibbonElem="true">
          <xsl:value-of select="$accel"/>
        </div>
      </div>
    </xsl:if>
  </xsl:template>
  
  
  
  <xsl:template name="largeButton">
    <xsl:param name="node"/>
    <xsl:variable name="label" select="$node/@label"/>
    <xsl:variable name="help" select="$node/@help"/>
    <xsl:variable name="menu" select="normalize-space($node/menu)"/>
    <table cellpadding="0" cellspacing="0" class="rbnLargeButton" itemType="RBN_BTN_LARGE" size="large">
		<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnBTN_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
      <xsl:choose>
        <xsl:when test="$node/@disabled = 'true'">
            <xsl:attribute name="disabled">true</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
      <xsl:attribute name="onmouseenter">this.className = 'rbnLargeButton_hot'; this.hot = true;</xsl:attribute>
      <xsl:attribute name="onmouseleave">this.className = 'rbnLargeButton'; this.hot = false;</xsl:attribute>
      <xsl:attribute name="onmousedown">this.className = 'rbnLargeButton_down';</xsl:attribute>
      <xsl:attribute name="onmouseup">if (this.hot) this.className = 'rbnLargeButton_hot'; else this.className = 'rbnLargeButton';</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:call-template name="btnClick">
        <xsl:with-param name="node" select="$node"/>
      </xsl:call-template>

      <xsl:choose>
        <xsl:when test="$help != ''">
          <xsl:attribute name="title"><xsl:value-of select="$help"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="title"><xsl:value-of select="$label"/></xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>

      <tr isRibbonElem="true">
        <td class="rbnLargeButton_left" isRibbonElem="true">&#160;</td>
        <td class="rbnLargeButton_content" isRibbonElem="true">
          <div class="rbnLargeButtonImage" isRibbonElem="true">
              <xsl:if test="$node/@disabled = 'true'"><xsl:attribute name="class">disabled</xsl:attribute></xsl:if>
            <img width="32" height="32" isRibbonElem="true">
				<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnIMG_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
              <xsl:attribute name="src">graphics/<xsl:value-of select="$node/@icon"/>_large.gif</xsl:attribute>
            </img>
          </div>
          <xsl:element name="div">
			  <xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnTXT_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
              <xsl:attribute name="isRibbonElem">true</xsl:attribute>
            <xsl:choose>
              <xsl:when test="$node/@disabled = 'true'">
                <xsl:attribute name="class">rbnLargeButtonText disabled</xsl:attribute>
              </xsl:when>
              <xsl:otherwise>
                <xsl:attribute name="class">rbnLargeButtonText</xsl:attribute>
              </xsl:otherwise>
            </xsl:choose>

            <xsl:choose>
              <xsl:when test="count($node/menu) = 1">
                  <span isRibbonElem="true">
                  <xsl:value-of select="$label"/>
                </span>
                  <span isRibbonElem="true">
                  <div class="largeBtnArrow" isRibbonElem="true"/>
                </span>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$label"/>
              </xsl:otherwise>
            </xsl:choose>

            <xsl:call-template name="btnAccel">
              <xsl:with-param name="node" select="$node"/>
            </xsl:call-template>
            </xsl:element>
        </td>
        <td class="rbnLargeButton_right" isRibbonElem="true">&#160;</td>
      </tr>
    </table>
  </xsl:template>

  <xsl:template name="mediumButton">
    <xsl:param name="node"/>
    <xsl:variable name="label" select="$node/@label"/>
    <xsl:variable name="help" select="$node/@help"/>
    <xsl:variable name="menu" select="normalize-space($node/menu)"/>
    <table cellpadding="0" cellspacing="0" class="rbnMediumButton" itemType="RBN_BTN_MEDIUM" size="medium">
		<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnBTN_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
      <xsl:choose>
        <xsl:when test="$node/@disabled = 'true'">
            <xsl:attribute name="disabled">true</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
      <xsl:attribute name="onmouseenter">this.className = 'rbnMediumButton_hot'; this.hot = true;</xsl:attribute>
      <xsl:attribute name="onmouseleave">this.className = 'rbnMediumButton'; this.hot = false;</xsl:attribute>
      <xsl:attribute name="onmousedown">this.className = 'rbnMediumButton_down';</xsl:attribute>
      <xsl:attribute name="onmouseup">if (this.hot) this.className = 'rbnMediumButton_hot'; else this.className = 'rbnMediumButton';</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      
      <xsl:call-template name="btnClick">
        <xsl:with-param name="node" select="$node"/>
      </xsl:call-template>

      <xsl:choose>
        <xsl:when test="$help != ''">
          <xsl:attribute name="title"><xsl:value-of select="$help"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="title"><xsl:value-of select="$label"/></xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>

      <tr isRibbonElem="true">
        <td class="rbnMediumButton_left" isRibbonElem="true">&#160;</td>
        <td class="rbnMediumButton_content" isRibbonElem="true">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" isRibbonElem="true">
              <tr isRibbonElem="true">
              <td class="rbnMediumButtonImage" isRibbonElem="true">
                  <xsl:if test="$node/@disabled = 'true'">
                      <xsl:attribute name="class">disabled</xsl:attribute>
                  </xsl:if>
                <img width="20" height="20" isRibbonElem="true">
					<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnIMG_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
                  <xsl:attribute name="src">graphics/<xsl:value-of select="$node/@icon"/>_small.gif</xsl:attribute>
                </img>
              </td>
                <xsl:element name="td">
					<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnTXT_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
                    <xsl:attribute name="isRibbonElem">true</xsl:attribute>
                  <xsl:choose>
                    <xsl:when test="$node/@disabled = 'true'">
                      <xsl:attribute name="class">rbnMediumButtonText disabled</xsl:attribute>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:attribute name="class">rbnMediumButtonText</xsl:attribute>
                    </xsl:otherwise>
                  </xsl:choose>

                <xsl:value-of select="$label"/>
                <xsl:call-template name="btnAccel">
                  <xsl:with-param name="node" select="$node"/>
                </xsl:call-template>
                </xsl:element>
              <xsl:if test="count($node/menu) = 1">
                <td class="mediumBtnArrow" isRibbonElem="true">&#160;</td>
              </xsl:if>
            </tr>
          </table>
        </td>
        <td class="rbnMediumButton_right" isRibbonElem="true">&#160;</td>
      </tr>
    </table>
  </xsl:template>

  <xsl:template name="smallButton">
    <xsl:param name="node"/>
    <xsl:variable name="label" select="$node/@label"/>
    <xsl:variable name="help" select="$node/@help"/>
    <xsl:variable name="menu" select="normalize-space($node/menu)"/>
    <table cellpadding="0" cellspacing="0" class="rbnSmallButton" itemType="RBN_BTN_SMALL" size="small">
		<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnBTN_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
      <xsl:choose>
        <xsl:when test="$node/@disabled = 'true'">
            <xsl:attribute name="disabled">true</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
      <xsl:attribute name="onmouseenter">this.className = 'rbnSmallButton_hot'; this.hot = true;</xsl:attribute>
      <xsl:attribute name="onmouseleave">this.className = 'rbnSmallButton'; this.hot = false;</xsl:attribute>
      <xsl:attribute name="onmousedown">this.className = 'rbnSmallButton_down';</xsl:attribute>
      <xsl:attribute name="onmouseup">if (this.hot) this.className = 'rbnSmallButton_hot'; else this.className = 'rbnSmallButton';</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
          
      <xsl:call-template name="btnClick">
        <xsl:with-param name="node" select="$node"/>
      </xsl:call-template>

      <xsl:choose>
        <xsl:when test="$help != ''">
          <xsl:attribute name="title"><xsl:value-of select="$help"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="title"><xsl:value-of select="$label"/></xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>

        <tr isRibbonElem="true">
        <td class="rbnSmallButton_left" isRibbonElem="true">&#160;</td>
        <td class="rbnSmallButton_content" isRibbonElem="true">
          <table border="0" cellpadding="0" cellspacing="0" isRibbonElem="true">
              <tr isRibbonElem="true">
                  <td isRibbonElem="true">
                  <xsl:if test="$node/@disabled = 'true'">
                      <xsl:attribute name="class">disabled</xsl:attribute>
                  </xsl:if>
                <img width="20" height="20" isRibbonElem="true">
					<xsl:if test="string-length($node/@id) &gt; 0"><xsl:attribute name="id">rbnIMG_<xsl:value-of select="normalize-space($node/@id)"/></xsl:attribute></xsl:if>
                  <xsl:attribute name="src">graphics/<xsl:value-of select="$node/@icon"/>_small.gif</xsl:attribute>
                </img>
                <xsl:call-template name="btnAccel">
                  <xsl:with-param name="node" select="$node"/>
                </xsl:call-template>
              </td>
              <xsl:if test="count($node/menu) = 1">
                <td class="mediumBtnArrow" isRibbonElem="true">&#160;</td>
              </xsl:if>
            </tr>
          </table>
        </td>
        <td class="rbnSmallButton_right" isRibbonElem="true">&#160;</td>
      </tr>
    </table>
  </xsl:template>


  <!-- Acest template aranjeaza pe 3 randuri butoanele dintr-un grup (mediu sau mic) -->
  <xsl:template name="verticalGroupCell">
    <xsl:param name="currentPos"/>
    <xsl:param name="groupSize"/>
	<xsl:param name="nodeList"/>

    <xsl:if test="$currentPos &lt;= count($nodeList)">

      <td class="rbnGroupX3TD" isRibbonElem="true">
        <xsl:choose>
          <xsl:when test="$groupSize = 2">
              <xsl:choose>
                  <xsl:when test="name($nodeList[position() = $currentPos]) = 'control'">
                      <xsl:call-template name="control">
                        <xsl:with-param name="node" select="$nodeList[position() = $currentPos]"/>
                      </xsl:call-template>
                  </xsl:when>
                  <xsl:otherwise>
                      <xsl:call-template name="mediumButton">
                          <xsl:with-param name="node" select="$nodeList[position() = $currentPos]"/>
                      </xsl:call-template>
                  </xsl:otherwise>
              </xsl:choose>
          </xsl:when>
          <xsl:when test="$groupSize = 1">
              <xsl:choose>
                  <xsl:when test="name($nodeList[position() = $currentPos]) = 'control'">
                      <xsl:call-template name="control">
                          <xsl:with-param name="node" select="$nodeList[position() = $currentPos]"/>
                      </xsl:call-template>
                  </xsl:when>
                  <xsl:otherwise>
                      <xsl:call-template name="smallButton">
                          <xsl:with-param name="node" select="$nodeList[position() = $currentPos]"/>
                      </xsl:call-template>
                  </xsl:otherwise>
              </xsl:choose>
          </xsl:when>
        </xsl:choose>
      </td>

    </xsl:if>

    <xsl:if test="$currentPos + 3 &lt;= count($nodeList)">
      <xsl:call-template name="verticalGroupCell">
        <xsl:with-param name="currentPos" select="$currentPos+3"/>
        <xsl:with-param name="groupSize" select="$groupSize"/>
		<xsl:with-param name="nodeList" select="$nodeList"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>


</xsl:stylesheet>