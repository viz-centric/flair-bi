package com.flair.bi.service;

import lombok.Value;

@Value(staticConstructor = "of")
public class QueryValidationError {
    private final String value;
    private final String error;
}
