package com.flair.bi.domain.constraintdefinition;

import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.NotContainsConditionExpression;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExclusionFeatureConstraintExpression extends SimpleFeatureConstraintExpression {

    @Override
    public ConditionExpression build() {
        NotContainsConditionExpression expression = new NotContainsConditionExpression();
        expression.setValues(getValues());
        expression.setFeatureName(getFeatureName());
        return expression;
    }
}
