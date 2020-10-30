package com.flair.bi.domain.constraintdefinition;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ConstraintGroupDefinition  {

	private List<ConstraintGroupExpression> featureConstraints = new ArrayList<>();

}
