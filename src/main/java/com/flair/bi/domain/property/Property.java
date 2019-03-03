package com.flair.bi.domain.property;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.field.Field;
import com.flair.bi.domain.propertytype.PropertyType;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.EqualsBuilder;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.io.Serializable;

@Entity
@Table(name = "properties")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "d_type")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type")
@JsonSubTypes(
    {@JsonSubTypes.Type(value = CheckboxProperty.class, name = "CHECKBOX"),
        @JsonSubTypes.Type(value = ColorPickerProperty.class, name = "COLOR_PICKER"),
        @JsonSubTypes.Type(value = NumberProperty.class, name = "NUMBER"),
        @JsonSubTypes.Type(value = SelectProperty.class, name = "SELECT"),
        @JsonSubTypes.Type(value = TextProperty.class, name = "TEXT")})

@Getter
@Setter
public abstract class Property extends AbstractAuditingEntity implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_type_id",
        foreignKey = @ForeignKey(name = "fk_property_type_id"),
        referencedColumnName = "id")
    private PropertyType propertyType;

    @JsonIgnore
    @JoinColumn(name = "field_id",
        foreignKey = @ForeignKey(name = "fk_field_id"),
        referencedColumnName = "id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Field field;

    @Column(name = "d_type", nullable = false, insertable = false, updatable = false)
    private String type;

    @Column(name = "sequence_number")
    private int order;

    @Transient
    private Integer hashcodeValue;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        Property property = (Property) o;

        return new EqualsBuilder()
            .append(getId(), property.getId())
            .isEquals();
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
}
