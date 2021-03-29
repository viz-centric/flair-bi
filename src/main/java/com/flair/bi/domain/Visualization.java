package com.flair.bi.domain;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A Visualization.
 */
@Entity
@Table(name = "visualizations")
public class Visualization implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Size(max = 60)
	@Column(name = "name", length = 60, nullable = false)
	private String name;

	@Column(name = "icon")
	private String icon;

	@Column(name = "custom_id")
	private Integer customId;

	@NotNull
	@Column(name = "function_name", nullable = false)
	private String functionname;

	@OneToMany(mappedBy = "visualization", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private Set<FieldType> fieldTypes = new HashSet<>();

	@OneToMany(mappedBy = "visualization", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private Set<VisualizationPropertyType> propertyTypes = new HashSet<>();

	public Visualization addFieldType(FieldType fieldType) {
		fieldType.setOrder(this.fieldTypes.size());
		fieldTypes.add(fieldType);
		fieldType.setVisualization(this);

		return this;
	}

	public Visualization removeFieldType(Long fieldTypeId) {
		this.getFieldTypes().removeIf(x -> x.getId().equals(fieldTypeId));
		int order = 0;

		// ordering has changed
		for (FieldType fieldType : this.getFieldTypes()) {
			fieldType.setOrder(order++);
		}

		return this;
	}

	public Visualization addPropertyType(PropertyType propertyType) {
		VisualizationPropertyType visualizationPropertyType = new VisualizationPropertyType();
		visualizationPropertyType.setOrder(this.getPropertyTypes().size());
		visualizationPropertyType.setPropertyType(propertyType);
		visualizationPropertyType.setVisualization(this);
		VisualizationPropertyTypeId id = new VisualizationPropertyTypeId();
		id.setPropertyTypeId(propertyType.getId());
		id.setVisualizationId(this.getId());
		visualizationPropertyType.setId(id);

		this.getPropertyTypes().add(visualizationPropertyType);
		return this;
	}

	public Visualization removePropertyType(Long propertyTypeId) {
		this.getPropertyTypes().removeIf(x -> x.getId().getPropertyTypeId().equals(propertyTypeId));
		int order = 0;
		for (VisualizationPropertyType p : this.getPropertyTypes()) {
			p.setOrder(order++);
		}
		return this;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Visualization name(String name) {
		this.name = name;
		return this;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public Visualization icon(String icon) {
		this.icon = icon;
		return this;
	}

	public Integer getCustomId() {
		return customId;
	}

	public void setCustomId(Integer customId) {
		this.customId = customId;
	}

	public Visualization customId(Integer customId) {
		this.customId = customId;
		return this;
	}

	public String getFunctionname() {
		return functionname;
	}

	public void setFunctionname(String functionname) {
		this.functionname = functionname;
	}

	public Visualization functionname(String functionname) {
		this.functionname = functionname;
		return this;
	}

	public Set<FieldType> getFieldTypes() {
		return fieldTypes;
	}

	public void setFieldTypes(Set<FieldType> fieldTypes) {
		this.fieldTypes = fieldTypes;
	}

	public Set<VisualizationPropertyType> getPropertyTypes() {
		return propertyTypes;
	}

	public void setPropertyTypes(Set<VisualizationPropertyType> propertyTypes) {
		this.propertyTypes = propertyTypes;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		Visualization visualization = (Visualization) o;
		return !(visualization.id == null || id == null) && Objects.equals(id, visualization.id);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

	@Override
	public String toString() {
		return "Visualization{" + "id=" + id + ", name='" + name + "'" + ", icon='" + icon + "'" + ", customId='"
				+ customId + "'" + ", functionname='" + functionname + "'" + '}';
	}
}
