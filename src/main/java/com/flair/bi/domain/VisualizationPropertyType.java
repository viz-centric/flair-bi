package com.flair.bi.domain;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MapsId;
import javax.persistence.Table;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.propertytype.PropertyType;

/**
 * Class representing join table between {@link Visualization} and
 * {@link com.flair.bi.domain.propertytype.PropertyType}
 */

@Entity(name = "VisualizationPropertyType")
@Table(name = "visualizations_property_types")
public class VisualizationPropertyType {

	@EmbeddedId
	private VisualizationPropertyTypeId id;

	@JsonIgnore
	@MapsId("visualizationId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "visualization_id", foreignKey = @ForeignKey(name = "fk_visualization_id"), referencedColumnName = "id")
	private Visualization visualization;

	@MapsId("propertyTypeId")
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "property_type_id", foreignKey = @ForeignKey(name = "fk_property_type_id"), referencedColumnName = "id")
	private PropertyType propertyType;

	@Column(name = "sequence_number")
	private int order;

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		VisualizationPropertyType that = (VisualizationPropertyType) o;

		return new EqualsBuilder().append(getId(), that.getId()).isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(getId()).toHashCode();
	}

	public VisualizationPropertyTypeId getId() {
		return id;
	}

	public void setId(VisualizationPropertyTypeId id) {
		this.id = id;
	}

	public Visualization getVisualization() {
		return visualization;
	}

	public void setVisualization(Visualization visualization) {
		this.visualization = visualization;
	}

	public PropertyType getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(PropertyType propertyType) {
		this.propertyType = propertyType;
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}
}
