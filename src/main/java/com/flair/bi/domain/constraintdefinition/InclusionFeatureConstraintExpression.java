package com.flair.bi.domain.constraintdefinition;

import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.ContainsConditionExpression;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class InclusionFeatureConstraintExpression extends SimpleFeatureConstraintExpression {


    @Override
    public ConditionExpression build() {
        ContainsConditionExpression expression = new ContainsConditionExpression();
        expression.setFeatureName(getFeatureName());
        expression.setValues(getValues());
        return expression;
    }
}
