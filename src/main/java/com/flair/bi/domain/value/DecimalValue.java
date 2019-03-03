package com.flair.bi.domain.value;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "DECIMAL")
@JsonTypeName(value = "DECIMAL")
public class DecimalValue extends Value {

    @Column(name = "decimal_value")
    private double value;

    public DecimalValue() {
        this.setType("DECIMAL");
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    @Override
    public boolean equalValue(Value value) {
        if (value instanceof DecimalValue) {
            DecimalValue decimalValue = (DecimalValue) value;
            return decimalValue.getValue() == this.value;
        }
        return false;
    }
}
