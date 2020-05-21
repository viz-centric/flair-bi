package com.flair.bi.domain.propertytype;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonTypeName;

@Entity
@DiscriminatorValue(value = "COLOR_PICKER")
@JsonTypeName(value = "COLOR_PICKER")
public class ColorPickerPropertyType extends PropertyType {

	@Column(name = "color_picker_default_value", length = 50)
	@Size(min = 0, max = 50)
	private String defaultValue;

	public ColorPickerPropertyType() {
		this.setType("COLOR_PICKER");
	}

	public String getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}
}
