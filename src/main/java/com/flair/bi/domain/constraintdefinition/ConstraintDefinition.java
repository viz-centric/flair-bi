package com.flair.bi.domain.constraintdefinition;

import com.project.bi.general.Builder;
import com.project.bi.query.expression.condition.ConditionExpression;
import com.project.bi.query.expression.condition.impl.AndConditionExpression;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "featureConstraints")
public class ConstraintDefinition implements Builder<ConditionExpression>, Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2346593849803937348L;
	private List<FeatureConstraintExpression> featureConstraints = new ArrayList<>();

	@Override
	public ConditionExpression build() {

		ConditionExpression conditionExpression = null;

		boolean first = true;
		for (FeatureConstraintExpression constraintExpression : featureConstraints) {

			if (first) {
				conditionExpression = constraintExpression.build();
				first = false;
			} else {
				AndConditionExpression composite = new AndConditionExpression();
				composite.setFirstExpression(conditionExpression);
				composite.setSecondExpression(constraintExpression.build());
				conditionExpression = composite;
			}
		}

		return conditionExpression;

	}
}
