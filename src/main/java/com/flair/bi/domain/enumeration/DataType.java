package com.flair.bi.domain.enumeration;

public enum DataType {
    BOOLEAN("BOOLEAN"),
    INTEGER("INTEGER"),
    STRING("STRING");

    private final String value;

    DataType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

}
