package com.flair.bi.domain.fieldtype;

import java.util.Objects;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.builder.EqualsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.propertytype.PropertyType;

@Entity
@Table(name = "field_types_property_types")
@IdClass(FieldTypePropertyTypeId.class)
public class FieldTypePropertyType {

	@Id
	@Column(name = "field_type_id")
	private Long fieldTypeId;
	@Id
	@Column(name = "property_type_id")
	private Long propertyTypeId;

	@NotNull
	@Column(name = "sequence_number", nullable = false)
	private int order;

	@Transient
	private Integer hashcodeValue;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "field_type_id", updatable = false, insertable = false, referencedColumnName = "id")
	private FieldType fieldType;

	@ManyToOne
	@JoinColumn(name = "property_type_id", updatable = false, insertable = false, referencedColumnName = "id")
	private PropertyType propertyType;

	public Long getFieldTypeId() {
		return fieldTypeId;
	}

	public void setFieldTypeId(Long fieldTypeId) {
		this.fieldTypeId = fieldTypeId;
	}

	public Long getPropertyTypeId() {
		return propertyTypeId;
	}

	public void setPropertyTypeId(Long propertyTypeId) {
		this.propertyTypeId = propertyTypeId;
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public FieldType getFieldType() {
		return fieldType;
	}

	public void setFieldType(FieldType fieldType) {
		this.fieldType = fieldType;
	}

	public PropertyType getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(PropertyType propertyType) {
		this.propertyType = propertyType;
	}

	@PreRemove
	public void preRemove() {
		this.setFieldType(null);
		this.setPropertyType(null);
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		FieldTypePropertyType that = (FieldTypePropertyType) o;

		return new EqualsBuilder().append(getFieldTypeId(), that.getFieldTypeId())
				.append(getPropertyTypeId(), that.getPropertyTypeId()).isEquals();
	}

	@Override
	public int hashCode() {
		if (hashcodeValue == null) {
			if (propertyTypeId == null || fieldTypeId == null) {
				hashcodeValue = super.hashCode();
			} else {
				hashcodeValue = Objects.hash(propertyTypeId, fieldTypeId);
			}
		}

		return hashcodeValue;
	}
}
