package com.flair.bi.domain.property;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "number")
public class NumberProperty extends Property {

	@Column(name = "number_value")
	private int value;

	public NumberProperty() {
		this.setType("NUMBER");
	}

	public int getValue() {
		return value;
	}

	public void setValue(int value) {
		this.value = value;
	}
}
