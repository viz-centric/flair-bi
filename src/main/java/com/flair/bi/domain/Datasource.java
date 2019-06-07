package com.flair.bi.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.hierarchy.Drilldown;
import com.flair.bi.domain.hierarchy.Hierarchy;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.PreRemove;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A Datasource.
 */
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "datasources",uniqueConstraints=@UniqueConstraint(columnNames={"name", "connection_name"})
)
public class Datasource implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Size(max = 60)
    @Column(name = "name", length = 60, nullable = false)
    private String name;

    @NotNull
    @Column(name = "last_updated", nullable = false)
    private ZonedDateTime lastUpdated;

    @NotNull
    @Column(name = "connection_name", nullable = false)
    private String connectionName;

    @NotNull
    @Column(name = "query_path", nullable = false)
    private String queryPath;

    @JsonIgnore
    @OneToMany(mappedBy = "dashboardDatasource")
    private Set<Dashboard> dashboardSet = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "datasource", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private Set<Feature> features = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "datasource", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private Set<Hierarchy> hierarchies = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "datasource", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DatasourceConstraint> datasourceConstraints = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private DatasourceStatus status;

    @PreRemove
    public void preRemove() {

        /*
         * This is needed because drilldown has foreign key constraint on features
         * and when datasource is being deleted also drilldowns are deleted but the foreign key constraint
         * must be removed before deleting
         */
        List<Drilldown> drilldownList = this.hierarchies.stream()
            .flatMap(x -> x.getDrilldown().stream())
            .collect(Collectors.toList());
        drilldownList.forEach(x -> x.setFeature(null));
    }

    public Datasource name(String name) {
        this.name = name;
        return this;
    }

    public Datasource lastUpdated(ZonedDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
        return this;
    }

    public Datasource connectionName(String connectionName) {
        this.connectionName = connectionName;
        return this;
    }

    public Datasource queryPath(String queryPath) {
        this.queryPath = queryPath;
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
        Datasource datasource = (Datasource) o;
        return datasource.getId() != null && getId() != null && Objects.equals(getId(), datasource.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

}
