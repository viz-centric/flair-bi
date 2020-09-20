package com.flair.bi.domain.fieldtype;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.enumeration.Constraint;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.domain.field.Field;
import com.flair.bi.domain.propertytype.PropertyType;
import org.apache.commons.lang3.builder.EqualsBuilder;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "field_types")
public class FieldType extends AbstractAuditingEntity implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(name = "const", nullable = false, length = 50)
	private Constraint constraint;

	@NotNull
	@Column(name = "sequence_number", nullable = false)
	private int order;

	@JsonIgnore
	@JoinColumn(name = "visualization_id", foreignKey = @ForeignKey(name = "fk_visualization_id"), referencedColumnName = "id")
	@ManyToOne(fetch = FetchType.LAZY)
	private Visualization visualization;

	@Transient
	private Integer hashcodeValue;

	@JsonIgnore
	@OneToMany(mappedBy = "fieldType", orphanRemoval = true)
	private Set<Field> fields = new HashSet<>();

	@OneToMany(mappedBy = "fieldType", orphanRemoval = true, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	private Set<FieldTypePropertyType> propertyTypes = new HashSet<>();

	@Enumerated(EnumType.STRING)
	@Column(name = "feature_type", length = 255)
	@NotNull
	private FeatureType featureType;

	@ManyToOne
	private Realm realm;

	public FieldType addPropertyType(PropertyType propertyType) {
		final FieldTypePropertyType newPropertyType = new FieldTypePropertyType();
		newPropertyType.setFieldType(this);
		newPropertyType.setFieldTypeId(this.getId());
		newPropertyType.setPropertyType(propertyType);
		newPropertyType.setPropertyTypeId(propertyType.getId());
		newPropertyType.setOrder(this.getPropertyTypes().size());
		this.propertyTypes.add(newPropertyType);
		return this;
	}

	public FieldType removePropertyType(Long propertyTypeId) {
		this.getPropertyTypes().removeIf(x -> x.getPropertyTypeId().equals(propertyTypeId));
		int order = 0;

		// ordering has changed
		for (FieldTypePropertyType fieldTypePropertyType : this.getPropertyTypes()) {
			fieldTypePropertyType.setOrder(order++);
		}

		return this;
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Constraint getConstraint() {
		return constraint;
	}

	public void setConstraint(Constraint constraint) {
		this.constraint = constraint;
	}

	public Visualization getVisualization() {
		return visualization;
	}

	public void setVisualization(Visualization visualization) {
		this.visualization = visualization;
	}

	public Set<Field> getFields() {
		return fields;
	}

	public void setFields(Set<Field> fields) {
		this.fields = fields;
	}

	public Set<FieldTypePropertyType> getPropertyTypes() {
		return propertyTypes;
	}

	public void setPropertyTypes(Set<FieldTypePropertyType> propertyTypes) {
		this.propertyTypes = propertyTypes;
	}

	public FeatureType getFeatureType() {
		return featureType;
	}

	public void setFeatureType(FeatureType featureType) {
		this.featureType = featureType;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		FieldType fieldType = (FieldType) o;

		return new EqualsBuilder().append(getId(), fieldType.getId()).isEquals();
	}

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

	public Realm getRealm() {
		return realm;
	}

	public void setRealm(Realm realm) {
		this.realm = realm;
	}
}
