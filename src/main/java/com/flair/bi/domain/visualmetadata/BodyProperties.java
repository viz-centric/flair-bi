package com.flair.bi.domain.visualmetadata;

import javax.persistence.Embeddable;

/**
 * Body properties of {@link VisualMetadata}
 */
@Embeddable
public class BodyProperties {

	private String backgroundColor;
	private String border;
	private String opacity;

	public String getBackgroundColor() {
		return backgroundColor;
	}

	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
	}

	public String getBorder() {
		return border;
	}

	public void setBorder(String border) {
		this.border = border;
	}

	public String getOpacity() {
		return opacity;
	}

	public void setOpacity(String opacity) {
		this.opacity = opacity;
	}
}
