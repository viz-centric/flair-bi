package com.flair.bi.domain;


import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A Functions.
 */
@Entity
@Table(name = "functions")
public class Functions implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "value")
    private String value;

    @Column(name = "dimension_use")
    private Boolean dimensionUse;

    @Column(name = "measure_use")
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

    public Functions name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public Functions description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public Functions value(String value) {
        this.value = value;
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Boolean isDimensionUse() {
        return dimensionUse;
    }

    public Functions dimensionUse(Boolean dimensionUse) {
        this.dimensionUse = dimensionUse;
        return this;
    }

    public void setDimensionUse(Boolean dimensionUse) {
        this.dimensionUse = dimensionUse;
    }

    public Boolean isMeasureUse() {
        return measureUse;
    }

    public Functions measureUse(Boolean measureUse) {
        this.measureUse = measureUse;
        return this;
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
        Functions functions = (Functions) o;
        if (functions.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, functions.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Functions{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", description='" + description + "'" +
            ", value='" + value + "'" +
            ", dimensionUse='" + dimensionUse + "'" +
            ", measureUse='" + measureUse + "'" +
            '}';
    }
}
