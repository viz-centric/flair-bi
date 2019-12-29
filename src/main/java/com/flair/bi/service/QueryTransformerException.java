package com.flair.bi.service;

import lombok.Data;

import java.util.stream.Collectors;

@Data
public class QueryTransformerException extends Exception {

    private final QueryValidationResult validationResult;

    public QueryTransformerException(String message, QueryValidationResult validationResult) {
        super(message);
        this.validationResult = validationResult;
    }

    public String getValidationMessage() {
        return validationResult.getGroup() + "(" + validationResult.getErrors()
                .stream()
                .map(error -> error.getError() + ":" + error.getField())
                .collect(Collectors.joining(",")) + ")";
    }
}
