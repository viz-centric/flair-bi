package com.flair.bi.domain.property;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value = "color_picker")
public class ColorPickerProperty extends Property {

	@Column(name = "color_picker_value")
	private String value;

	public ColorPickerProperty() {
		this.setType("COLOR_PICKER");
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}
