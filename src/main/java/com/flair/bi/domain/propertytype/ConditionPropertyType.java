package com.flair.bi.domain.propertytype;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.Size;

@Entity
@DiscriminatorValue(value = "CONDITION")
@JsonTypeName(value = "CONDITION")
public class ConditionPropertyType extends PropertyType {

    @Column(name = "condition_default_value", length = 50)
    @Size(min = 0, max = 50)
    private String defaultValue;

    public ConditionPropertyType() {
        this.setType("CONDITION");
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
}
