package com.flair.bi.domain.constraintdefinition;

import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public abstract class SimpleFeatureConstraintExpression extends FeatureConstraintExpression {

	protected String featureName;

	protected List<String> values;

}
