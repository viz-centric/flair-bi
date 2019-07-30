package com.flair.bi.domain.propertytype;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.listeners.PropertyTypeListener;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.EqualsBuilder;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "property_types")
@EntityListeners({PropertyTypeListener.class})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "d_type")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type")
@JsonSubTypes(
    {@JsonSubTypes.Type(value = CheckboxPropertyType.class, name = "CHECKBOX"),
        @JsonSubTypes.Type(value = ColorPickerPropertyType.class, name = "COLOR_PICKER"),
        @JsonSubTypes.Type(value = NumberPropertyType.class, name = "NUMBER"),
        @JsonSubTypes.Type(value = SelectPropertyType.class, name = "SELECT"),
        @JsonSubTypes.Type(value = TextPropertyType.class, name = "TEXT"),
        @JsonSubTypes.Type(value = TextPropertyType.class, name = "CONDITION")})
public abstract class PropertyType extends AbstractAuditingEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    protected Long id;

    @NotNull
    @Size(min = 0, max = 50)
    @Column(name = "property_type_name", length = 50)
    protected String name;

    @Column(name = "property_type_description")
    protected String description;

    @Column(name = "d_type", insertable = false, updatable = false, nullable = false)
    protected String type;

    @Transient
    private Integer hashcodeValue;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        PropertyType that = (PropertyType) o;

        return new EqualsBuilder()
            .append(getId(), that.getId())
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
