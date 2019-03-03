package com.flair.bi.domain.value;


import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "INTEGER")
@JsonTypeName(value = "INTEGER")
public class IntegerValue extends Value {

    @Column(name = "integer_value")
    private int value;


    public IntegerValue() {
        this.setType("INTEGER");
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    @Override
    public boolean equalValue(Value value) {
        if (value instanceof IntegerValue) {
            IntegerValue integerValue = (IntegerValue) value;
            return integerValue.getValue() == this.value;
        } else {
            return false;
        }
    }
}
