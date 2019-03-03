package com.flair.bi.domain.propertytype;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "CHECKBOX")
@JsonTypeName(value = "CHECKBOX")
public class CheckboxPropertyType extends PropertyType {

    @Column(name = "checkbox_default_value")
    private boolean defaultValue;

    public CheckboxPropertyType() {
        this.setType("CHECKBOX");
    }

    public boolean isDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(boolean defaultValue) {
        this.defaultValue = defaultValue;
    }
}
