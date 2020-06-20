package com.flair.bi.domain.field;

import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.enumeration.Constraint;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.domain.listeners.FieldListener;
import com.flair.bi.domain.property.Property;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@EntityListeners(value = {FieldListener.class})
@Table(name = "fields")
public class Field extends AbstractAuditingEntity implements Serializable {

    @Id
    @GeneratedValue
    protected long id;

    @OneToMany(mappedBy = "field", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Property> properties = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "field_type_id",
        foreignKey = @ForeignKey(name = "fk_field_type_id"),
        referencedColumnName = "id")
    private FieldType fieldType;

    @ManyToOne
    @JoinColumn(name = "feature_id",
        foreignKey = @ForeignKey(name = "fk_feature_id"),
        referencedColumnName = "id")
    private Feature feature;

    @ManyToOne
    private Hierarchy hierarchy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "const", updatable = false, nullable = false)
    private Constraint constraint;

}