package com.flair.bi.domain.property;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.flair.bi.domain.value.Value;

@Entity
@DiscriminatorValue(value = "select")
public class SelectProperty extends Property {

	@ManyToOne
	@JoinColumn(name = "value_id", foreignKey = @ForeignKey(name = "fk_value_id"), referencedColumnName = "id")
	private Value value;

	public SelectProperty() {
		this.setType("SELECT");
	}

	public Value getValue() {
		return value;
	}

	public void setValue(Value value) {
		this.value = value;
	}
}
