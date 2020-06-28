package com.flair.bi.domain.listeners;

import javax.persistence.PrePersist;

import com.flair.bi.domain.field.Field;

public class FieldListener {

	@PrePersist
	public void prePersist(Field field) {
		field.setConstraint(field.getFieldType().getConstraint());
	}
}
