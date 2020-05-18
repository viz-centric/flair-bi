package com.flair.bi.service;

import lombok.Value;

@Value(staticConstructor = "of")
public class QueryValidationError {
    String value;
    String error;
}
