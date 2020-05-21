package com.flair.bi.service;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QueryValidationResult {
	private final Group group;
	private final List<QueryValidationError> errors;

	public enum Group {
		SELECT, GROUP_BY, ORDER_BY, HAVING, CONDITIONS
	}

	public boolean success() {
		return errors == null;
	}
}
