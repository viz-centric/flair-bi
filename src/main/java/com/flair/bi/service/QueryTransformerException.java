package com.flair.bi.service;

import java.util.stream.Collectors;

import lombok.Data;

@Data
public class QueryTransformerException extends Exception {

	private final QueryValidationResult validationResult;

	public QueryTransformerException(String message, QueryValidationResult validationResult) {
		super(message);
		this.validationResult = validationResult;
	}

	public String getValidationMessage() {
		return validationResult.getGroup() + "(" + validationResult.getErrors().stream()
				.map(error -> error.getError() + ":" + error.getValue()).collect(Collectors.joining(",")) + ")";
	}
}
