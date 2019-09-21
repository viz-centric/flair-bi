package com.flair.bi.web.rest.errors;

import java.io.Serializable;

public class FieldErrorVM implements Serializable {

    private static final long serialVersionUID = 1L;

    private final String objectName;

    private final String field;

    private final String message;

    private final String key;

    public FieldErrorVM(String objectName, String field, String message) {
        this(objectName, field, message, null);
    }

    public FieldErrorVM(String objectName, String field, String message, String key) {
        this.objectName = objectName;
        this.field = field;
        this.message = message;
        this.key = key;
    }

    public String getObjectName() {
        return objectName;
    }

    public String getField() {
        return field;
    }

    public String getMessage() {
        return message;
    }

    public String getKey() {
        return key;
    }
}
