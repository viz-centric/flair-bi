package com.flair.bi.domain.property;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "text")
public class TextProperty extends Property {

    @Column(name = "text_value")
    private String value;

    public TextProperty() {
        this.setType("TEXT");
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
