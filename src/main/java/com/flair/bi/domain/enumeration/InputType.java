package com.flair.bi.domain.enumeration;

public enum InputType {
	TEXT("TEXT"), NUMBER("NUMBER"), COLOR_PICKER("COLOR_PICKER"), CHECKBOX("CHECKBOX"), SELECT("SELECT");

	private final String value;

	InputType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
