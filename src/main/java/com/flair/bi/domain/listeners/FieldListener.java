package com.flair.bi.domain.listeners;

import com.flair.bi.domain.field.Field;

import javax.persistence.PrePersist;

public class FieldListener {

    @PrePersist
    public void prePersist(Field field) {
        field.setConstraint(field.getFieldType().getConstraint());
    }
}
