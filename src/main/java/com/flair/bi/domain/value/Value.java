package com.flair.bi.domain.value;

import java.io.Serializable;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.hibernate.annotations.Immutable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.flair.bi.domain.property.SelectProperty;
import com.flair.bi.domain.propertytype.SelectPropertyType;

import lombok.Getter;
import lombok.Setter;

@Entity
@Immutable
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "d_type")
@Table(name = "values")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({ @JsonSubTypes.Type(value = IntegerValue.class, name = "INTEGER"),
		@JsonSubTypes.Type(value = StringValue.class, name = "STRING"),
		@JsonSubTypes.Type(value = DecimalValue.class, name = "DECIMAL") })

@Getter
@Setter
public abstract class Value implements Serializable {

	@Id
	@GeneratedValue
	private Long id;

	@JsonIgnore
	@OneToMany(mappedBy = "value")
	private Set<SelectProperty> selectProperty;

	@JsonIgnore
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "default_select_property_type_id")
	private SelectPropertyType defaultSelectPropertyType;

	@NotNull(message = "Select property type must not be null")
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "property_type_id", foreignKey = @ForeignKey(name = "fk_property_type_id"), referencedColumnName = "id", nullable = false)
	private SelectPropertyType selectPropertyType;

	@Column(name = "d_type", insertable = false, updatable = false, nullable = false)
	private String type;

	@Transient
	private Integer hashcodeValue = null;

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		Value value = (Value) o;

		return new EqualsBuilder().append(getId(), value.getId()).isEquals();
	}

	public abstract boolean equalValue(Value value);

	@Override
	public int hashCode() {
		if (hashcodeValue == null) {
			if (id == null) {
				hashcodeValue = super.hashCode();
			} else {
				hashcodeValue = Math.toIntExact(id);
			}
		}

		return hashcodeValue;
	}
}
