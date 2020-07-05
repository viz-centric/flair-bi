package com.flair.bi.domain.constraintdefinition;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.project.bi.general.Builder;
import com.project.bi.query.expression.condition.ConditionExpression;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY)
@JsonSubTypes({ @JsonSubTypes.Type(value = ExclusionFeatureConstraintExpression.class, name = "Exclusion"),
		@JsonSubTypes.Type(value = InclusionFeatureConstraintExpression.class, name = "Inclusion") })
public abstract class FeatureConstraintExpression implements Builder<ConditionExpression>, Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1638952283475523953L;

}
