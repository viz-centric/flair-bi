package com.flair.bi.domain;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class VisualizationPropertyTypeId implements Serializable {

    @Column(name = "visualization_id")
    private Long visualizationId;

    @Column(name = "property_type_id")
    private Long propertyTypeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        VisualizationPropertyTypeId that = (VisualizationPropertyTypeId) o;

        return new EqualsBuilder()
            .append(getVisualizationId(), that.getVisualizationId())
            .append(getPropertyTypeId(), that.getPropertyTypeId())
            .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
            .append(getVisualizationId())
            .append(getPropertyTypeId())
            .toHashCode();
    }

    public Long getVisualizationId() {
        return visualizationId;
    }

    public void setVisualizationId(Long visualizationId) {
        this.visualizationId = visualizationId;
    }

    public Long getPropertyTypeId() {
        return propertyTypeId;
    }

    public void setPropertyTypeId(Long propertyTypeId) {
        this.propertyTypeId = propertyTypeId;
    }
}
