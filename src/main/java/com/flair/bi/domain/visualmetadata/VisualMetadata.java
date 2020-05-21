package com.flair.bi.domain.visualmetadata;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.Type;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.enumeration.Constraint;
import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.domain.field.Field;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.property.Property;
import com.flair.bi.web.rest.errors.CustomParameterizedException;
import com.project.bi.query.expression.condition.ConditionExpression;

/**
 * A VisualMetadata.
 */
public class VisualMetadata extends AbstractAuditingEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("id")
	private String id;

	@NotNull
	@Column(name = "height", nullable = false)
	private Integer height;

	@NotNull
	@Column(name = "width", nullable = false)
	private Integer width;

	@NotNull
	@Column(name = "x_position", nullable = false)
	private Integer xPosition;

	@NotNull
	@Column(name = "y_position", nullable = false)
	private Integer yPosition;

	@Type(type = "jsonb")
	@Column(name = "condition_expression", columnDefinition = "jsonb")
	private ConditionExpression conditionExpression;

	/*
	 * Saves SQl query statement
	 */
	@Column(name = "query")
	private String query;

	/*
	 * JSON object representing visual metadata
	 */
	@Column(name = "query_json")
	private String queryJson;

	@Embedded
	@AttributeOverrides(value = {
			@AttributeOverride(name = "backgroundColor", column = @Column(name = "title_background_color")),
			@AttributeOverride(name = "borderBottom", column = @Column(name = "title_bottom_border")),
			@AttributeOverride(name = "color", column = @Column(name = "title_color")),
			@AttributeOverride(name = "titleText", column = @Column(name = "title_text")) })
	private TitleProperties titleProperties;

	@Embedded
	@AttributeOverrides(value = {
			@AttributeOverride(name = "backgroundColor", column = @Column(name = "body_background_color")),
			@AttributeOverride(name = "border", column = @Column(name = "body_border")),
			@AttributeOverride(name = "opacity", column = @Column(name = "body_opacity")) })
	private BodyProperties bodyProperties;

	@NotNull
	private Visualization metadataVisual;

	private Set<Property> properties = new HashSet<>();

	private Set<Field> fields = new HashSet<>();

	private Integer hashcodeValue;

	private Boolean isCardRevealed = true;

	@JsonIgnore
	public String getVisualMetadataId() {
		return getVisualMetadataId(this.id);
	}

	@JsonIgnore
	public String getParentId() {
		return getParentId(this.id);
	}

	@JsonIgnore
	public static String getParentId(String vmId) {
		try {
			return vmId.split("--")[0];
		} catch (Exception e) {
			return null;
		}
	}

	@JsonIgnore
	public static String getVisualMetadataId(String vmId) {
		try {
			return vmId.split("--")[1];
		} catch (Exception e) {
			return null;
		}
	}

	@JsonIgnore
	public static String constructId(String childId, String parentId) {
		return parentId + "--" + childId;
	}

	@JsonIgnore
	public String setCompositeId(String childId, String parentId) {
		String id = constructId(childId, parentId);
		setId(id);
		return id;

	}

	@PreUpdate
	@PrePersist
	public void preInsertUpdate() {

		int numberOfRequiredDimensionFields = 0;
		int numberOfRequiredMeasureFields = 0;
		int totalNumberOfRequiredDimensionFields = 0;
		int totalNumberOfRequiredMeasureFields = 0;

		int numberOfDimensionFields = 0;
		int numberOfMeasureFields = 0;
		int totalNumberOfDimensionFields = 0;
		int totalNumberOfMeasureFields = 0;

		for (Field field : this.fields) {
			if (field.getFeature().getFeatureType().equals(FeatureType.DIMENSION)) {
				if (field.getConstraint().equals(Constraint.REQUIRED)) {
					++numberOfRequiredDimensionFields;
				}
				++numberOfDimensionFields;
			} else {
				if (field.getConstraint().equals(Constraint.REQUIRED)) {
					++numberOfRequiredMeasureFields;
				}
				++numberOfMeasureFields;
			}
		}

		for (FieldType x : this.getMetadataVisual().getFieldTypes()) {
			if (x.getFeatureType().equals(FeatureType.DIMENSION)) {
				if (x.getConstraint().equals(Constraint.REQUIRED)) {
					++totalNumberOfRequiredDimensionFields;
				}
				++totalNumberOfDimensionFields;

			} else {
				if (x.getConstraint().equals(Constraint.REQUIRED)) {
					++totalNumberOfRequiredMeasureFields;
				}

				++totalNumberOfMeasureFields;
			}
		}

		if (numberOfDimensionFields > totalNumberOfDimensionFields) {
			throw new CustomParameterizedException("VisualMetadata has too many dimension fields");
		}

		if (numberOfMeasureFields > totalNumberOfMeasureFields) {
			throw new CustomParameterizedException("VisualMetadata has too many measure fields");
		}

		if (numberOfRequiredDimensionFields < totalNumberOfRequiredDimensionFields) {
			throw new CustomParameterizedException(
					"VisualMetadata must have atleast " + totalNumberOfRequiredDimensionFields + " dimension fields");
		}

		if (numberOfRequiredMeasureFields < totalNumberOfRequiredMeasureFields) {
			throw new CustomParameterizedException(
					"VisualMetadata must have atleast " + totalNumberOfRequiredMeasureFields + " measure fields");
		}

	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public ConditionExpression getConditionExpression() {
		return conditionExpression;
	}

	public void setConditionExpression(ConditionExpression conditionExpression) {
		this.conditionExpression = conditionExpression;
	}

	public VisualMetadata height(Integer height) {
		this.height = height;
		return this;
	}

	public VisualMetadata width(Integer width) {
		this.width = width;
		return this;
	}

	public VisualMetadata xPosition(Integer xPosition) {
		this.xPosition = xPosition;
		return this;
	}

	public VisualMetadata yPosition(Integer yPosition) {
		this.yPosition = yPosition;
		return this;
	}

	public VisualMetadata query(String query) {
		this.query = query;
		return this;
	}

	public VisualMetadata queryJson(String queryJson) {
		this.queryJson = queryJson;
		return this;
	}

	public VisualMetadata metadataVisual(Visualization visualization) {
		this.metadataVisual = visualization;
		return this;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		VisualMetadata visualMetadata = (VisualMetadata) o;
		return !(visualMetadata.id == null || id == null) && Objects.equals(id, visualMetadata.id);
	}

	@Override
	public int hashCode() {
		if (hashcodeValue == null) {
			if (id == null) {
				hashcodeValue = super.hashCode();
			} else {
				hashcodeValue = Objects.hashCode(id);
			}
		}
		return hashcodeValue;
	}

	public Integer getHeight() {
		return height;
	}

	public void setHeight(Integer height) {
		this.height = height;
	}

	public Integer getWidth() {
		return width;
	}

	public void setWidth(Integer width) {
		this.width = width;
	}

	public Integer getxPosition() {
		return xPosition;
	}

	public void setxPosition(Integer xPosition) {
		this.xPosition = xPosition;
	}

	public Integer getyPosition() {
		return yPosition;
	}

	public void setyPosition(Integer yPosition) {
		this.yPosition = yPosition;
	}

	public String getQueryJson() {
		return queryJson;
	}

	public void setQueryJson(String queryJson) {
		this.queryJson = queryJson;
	}

	public TitleProperties getTitleProperties() {
		return titleProperties;
	}

	public void setTitleProperties(TitleProperties titleProperties) {
		this.titleProperties = titleProperties;
	}

	public BodyProperties getBodyProperties() {
		return bodyProperties;
	}

	public void setBodyProperties(BodyProperties bodyProperties) {
		this.bodyProperties = bodyProperties;
	}

	public Visualization getMetadataVisual() {
		return metadataVisual;
	}

	public void setMetadataVisual(Visualization metadataVisual) {
		this.metadataVisual = metadataVisual;
	}

	public Set<Property> getProperties() {
		return properties;
	}

	public void setProperties(Set<Property> properties) {
		this.properties = properties;
	}

	public Set<Field> getFields() {
		return fields;
	}

	public void setFields(Set<Field> fields) {
		this.fields = fields;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public Boolean getIsCardRevealed() {
		return isCardRevealed;
	}

	public void setIsCardRevealed(Boolean isCardRevealed) {
		this.isCardRevealed = isCardRevealed;
	}

}
