package com.flair.bi.domain.value;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.Size;

@Entity
@DiscriminatorValue(value = "STRING")
@JsonTypeName(value = "STRING")
public class StringValue extends Value {

    @Column(name = "string_value", length = 255)
    @Size(min = 0, max = 255)
    private String value;

    public StringValue() {
        this.setType("STRING");
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public boolean equalValue(Value value) {
        if (value instanceof StringValue) {
            StringValue stringValue = (StringValue) value;
            return stringValue.value.equals(this.value);
        } else {
            return false;
        }
    }
}
