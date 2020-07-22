package com.flair.bi.service;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@EqualsAndHashCode(callSuper = true)
@Data
public class ViewExportImportException extends Exception {

    private final String field;
    private final Kind kind;
    private final Type type;

    public ViewExportImportException(String message, String field, Kind kind, Type type) {
        super(message);
        this.field = field;
        this.kind = kind;
        this.type = type;
    }

    @Getter
    public enum Kind {
        FEATURES,
        HIERARCHIES
    }

    @Getter
    public enum Type {
        MULTIPLE,
        NONE
    }
}
