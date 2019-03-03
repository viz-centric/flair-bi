package com.flair.bi.service.dto;

import java.io.Serializable;
import java.util.Objects;


/**
 * A DTO for the Functions entity.
 */
public class FunctionsDTO implements Serializable {

    private Long id;

    private String name;

    private String description;

    private String value;

    private Boolean dimensionUse;

    private Boolean measureUse;


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
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
    public Boolean getDimensionUse() {
        return dimensionUse;
    }

    public void setDimensionUse(Boolean dimensionUse) {
        this.dimensionUse = dimensionUse;
    }
    public Boolean getMeasureUse() {
        return measureUse;
    }

    public void setMeasureUse(Boolean measureUse) {
        this.measureUse = measureUse;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        FunctionsDTO functionsDTO = (FunctionsDTO) o;

        if ( ! Objects.equals(id, functionsDTO.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "FunctionsDTO{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", description='" + description + "'" +
            ", value='" + value + "'" +
            ", dimensionUse='" + dimensionUse + "'" +
            ", measureUse='" + measureUse + "'" +
            '}';
    }
}
