package com.flair.bi.domain.propertytype;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.Size;

@Entity
@DiscriminatorValue(value = "TEXT")
@JsonTypeName(value = "TEXT")
public class TextPropertyType extends PropertyType {

    @Column(name = "text_default_value", length = 255)
    @Size(min = 0, max = 255)
    private String defaultValue;

    public TextPropertyType() {
        this.setType("TEXT");
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
}
