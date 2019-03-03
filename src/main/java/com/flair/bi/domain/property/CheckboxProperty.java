package com.flair.bi.domain.property;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "checkbox")
public class CheckboxProperty extends Property {

    @Column(name = "checkbox_value")
    private boolean value;

    public CheckboxProperty() {
        this.setType("CHECKBOX");
    }

    public boolean isValue() {
        return value;
    }

    public void setValue(boolean value) {
        this.value = value;
    }
}
