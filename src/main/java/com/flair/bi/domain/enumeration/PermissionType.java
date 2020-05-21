package com.flair.bi.domain.enumeration;

import org.apache.commons.lang3.builder.ToStringBuilder;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.View;
import com.flair.bi.domain.visualmetadata.VisualMetadata;

public enum PermissionType {

	/**
	 * This type of permission is related to application itself and it is statically
	 * created.
	 */
	APPLICATION("APPLICATION"),
	/**
	 * This type of permission is related to {@link Dashboard} and it is dynamically
	 * created.
	 */
	DASHBOARD("DASHBOARD"),
	/**
	 * This type of permission is related to {@link View} and it is dynamically
	 * created.
	 */
	VIEW("VIEW"),
	/**
	 * Permission type related to {@link VisualMetadata} and it is dynamically
	 * created
	 */
	VISUAL_METADATA("VISUAL_METADATA");

	private final String type;

	private PermissionType(String type) {
		this.type = type;
	}

	public String toString() {
		return (new ToStringBuilder(this)).append("type", this.type).toString();
	}

	public String getType() {
		return this.type;
	}
}
