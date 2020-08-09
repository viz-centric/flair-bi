package com.flair.bi.domain.listeners;

import javax.persistence.PreRemove;

import com.flair.bi.domain.Feature;

public class FeatureListener {

	@PreRemove
	public void preDestroy(Feature feature) {
		feature.clearFields();
	}
}
