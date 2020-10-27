package com.flair.bi.service;

import com.project.bi.query.dto.FieldDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@Builder
public class QueryValidationResult {
	private final Group group;
	private final List<QueryValidationError> errors;
	private Set<String> restrictedFieldNames;
	private List<FieldDTO> newSelectFields;
	private List<FieldDTO> newGroupByFields;

	public enum Group {
		SELECT, GROUP_BY, ORDER_BY, HAVING, CONDITIONS
	}

	public boolean success() {
		return errors == null;
	}

	public boolean isFatal() {
		return errors != null;
	}

	public boolean hasModifications() {
		return newSelectFields != null || newGroupByFields != null;
	}

}
