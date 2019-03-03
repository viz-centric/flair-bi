package com.flair.bi.domain.hierarchy;

import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.field.Field;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.PreRemove;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hierarchies")
public class Hierarchy extends AbstractAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(name = "hierarchy_name", nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "drilldown",
        joinColumns = @JoinColumn(name = "hierarchy_id", foreignKey = @ForeignKey(name = "fk_hierarchy_id")))
    private Set<Drilldown> drilldown = new HashSet<>();

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Datasource datasource;

    @OneToMany(mappedBy = "hierarchy")
    private Set<Field> fields = new HashSet<>();

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

    public Set<Drilldown> getDrilldown() {
        return drilldown;
    }

    public void setDrilldown(Set<Drilldown> drilldown) {
        this.drilldown = drilldown;
    }

    public Datasource getDatasource() {
        return datasource;
    }

    public void setDatasource(Datasource datasource) {
        this.datasource = datasource;
    }

    @PreRemove
    public void preDestroy() {
        drilldown.forEach(x -> {
            x.setFeature(null);
        });
        drilldown.clear();

        getFields().forEach(x -> {
            x.setHierarchy(null);
        });
        getFields().clear();

    }

    public Set<Field> getFields() {
        return fields;
    }

    public void setFields(Set<Field> fields) {
        this.fields = fields;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        Hierarchy hierarchy = (Hierarchy) o;

        return new EqualsBuilder()
            .append(getId(), hierarchy.getId())
            .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
            .append(getId())
            .toHashCode();
    }
}
