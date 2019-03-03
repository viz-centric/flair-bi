package com.flair.bi.domain.propertytype;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.flair.bi.domain.enumeration.DataType;
import com.flair.bi.domain.value.Value;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import java.util.Optional;
import java.util.Set;

@Entity
@DiscriminatorValue(value = "SELECT")
@JsonTypeName(value = "SELECT")
public class SelectPropertyType extends PropertyType {

    @OneToMany(orphanRemoval = true, mappedBy = "selectPropertyType", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Set<Value> possibleValues;
    @OneToOne(cascade = CascadeType.ALL,
        orphanRemoval = true,
        mappedBy = "defaultSelectPropertyType")
    private Value defaultValue;
    @Enumerated(EnumType.STRING)
    @Column(name = "select_data_type", length = 255)
    private DataType dataType;

    public SelectPropertyType() {
        this.setType("SELECT");
    }

    public SelectPropertyType addDefaultValue(Value value) {
        this.setDefaultValue(value);
        value.setDefaultSelectPropertyType(this);
        return this;
    }

    public SelectPropertyType removeDefaultValue() {
        Optional.ofNullable(this.getDefaultValue())
            .ifPresent(x -> x.setDefaultSelectPropertyType(null));
        this.setDefaultValue(null);
        return this;
    }

    public Set<Value> getPossibleValues() {
        return possibleValues;
    }

    public void setPossibleValues(Set<Value> possibleValues) {
        this.possibleValues = possibleValues;
    }

    public Value getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(Value defaultValue) {
        this.defaultValue = defaultValue;
    }

    public DataType getDataType() {
        return dataType;
    }

    public void setDataType(DataType dataType) {
        this.dataType = dataType;
    }
}
