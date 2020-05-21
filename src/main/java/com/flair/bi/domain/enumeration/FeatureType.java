package com.flair.bi.domain.enumeration;

public enum FeatureType {
	DIMENSION("DIMENSION"), MEASURE("MEASURE");

	private final String value;

	FeatureType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
