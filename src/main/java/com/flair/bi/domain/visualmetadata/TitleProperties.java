package com.flair.bi.domain.visualmetadata;

import javax.persistence.Embeddable;

/**
 * Title properties of {@link VisualMetadata}
 */
@Embeddable
public class TitleProperties {

	private String titleText;
	private String backgroundColor;
	private String borderBottom;
	private String color;

	public String getTitleText() {
		return titleText;
	}

	public void setTitleText(String titleText) {
		this.titleText = titleText;
	}

	public String getBackgroundColor() {
		return backgroundColor;
	}

	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
	}

	public String getBorderBottom() {
		return borderBottom;
	}

	public void setBorderBottom(String borderBottom) {
		this.borderBottom = borderBottom;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}
}
