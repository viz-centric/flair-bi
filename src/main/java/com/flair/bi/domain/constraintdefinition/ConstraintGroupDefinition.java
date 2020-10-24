package com.flair.bi.domain.constraintdefinition;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "featureConstraints")
public class ConstraintGroupDefinition  {

	private List<ConstraintGroupExpression> featureConstraints = new ArrayList<>();

}
