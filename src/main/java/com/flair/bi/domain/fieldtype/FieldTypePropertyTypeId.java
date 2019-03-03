package com.flair.bi.domain.fieldtype;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import java.io.Serializable;

public class FieldTypePropertyTypeId implements Serializable {

    private long fieldTypeId;

    private long propertyTypeId;

    public long getFieldTypeId() {
        return fieldTypeId;
    }

    public void setFieldTypeId(long fieldTypeId) {
        this.fieldTypeId = fieldTypeId;
    }

    public long getPropertyTypeId() {
        return propertyTypeId;
    }

    public void setPropertyTypeId(long propertyTypeId) {
        this.propertyTypeId = propertyTypeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        FieldTypePropertyTypeId that = (FieldTypePropertyTypeId) o;

        return new EqualsBuilder()
            .append(getFieldTypeId(), that.getFieldTypeId())
            .append(getPropertyTypeId(), that.getPropertyTypeId())
            .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
            .append(getFieldTypeId())
            .append(getPropertyTypeId())
            .toHashCode();
    }
}
