package com.flair.bi.domain.constraintdefinition;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
public abstract class SimpleFeatureConstraintExpression extends FeatureConstraintExpression {

    protected String featureName;

    protected List<String> values;

}
