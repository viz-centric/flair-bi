package com.flair.bi.domain.property;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "condition")
public class ConditionProperty extends Property{

    @Column(name = "condition_value")
    private String value;

    public ConditionProperty() {
        this.setType("CONDITION");
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
