package com.flair.bi.service.dto;

import com.flair.bi.domain.enumeration.Constraint;
import com.flair.bi.domain.enumeration.FeatureType;

public class FieldTypeDTO {

	private Long id;
	private Constraint constraint;
	private FeatureType featureType;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Constraint getConstraint() {
		return constraint;
	}

	public void setConstraint(Constraint constraint) {
		this.constraint = constraint;
	}

	public FeatureType getFeatureType() {
		return featureType;
	}

	public void setFeatureType(FeatureType featureType) {
		this.featureType = featureType;
	}
}
