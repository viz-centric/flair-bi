package com.flair.bi.domain.enumeration;

public enum Constraint {

    REQUIRED("REQUIRED"),
    OPTIONAL("OPTIONAL");


    private final String value;

    Constraint(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
