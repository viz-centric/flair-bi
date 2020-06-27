package com.flair.bi.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.authorization.DashboardGranteePermissionReport;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.authorization.PermissionReport;
import com.flair.bi.authorization.SecuredEntity;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.hierarchy.Drilldown;
import com.flair.bi.domain.hierarchy.Hierarchy;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

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
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
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
@ToString(exclude = { "dashboardSet", "features", "hierarchies", "datasourceConstraints" })
@Table(name = "datasources")
public class Datasource implements Serializable, SecuredEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Size(max = 60)
    @Column(name = "name", length = 60, nullable = false,unique=true)
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

    @Column(name = "sql")
    private String sql;

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

    /**
     * Get the entity identifiers
     *
     * @return collection of entity resources
     */
    @Override
    @JsonIgnore
    public List<String> getResources() {
        return Collections.singletonList(this.id.toString());
    }

    /**
     * List of available actions that can be performed against secured entity
     *
     * @return collection of {@link Action}
     */
    @Override
    @JsonIgnore
    public List<Action> getActions() {
        return Arrays.asList(Action.READ,
                Action.WRITE,
                Action.UPDATE,
                Action.DELETE);
    }

    /**
     * Under which scope is this entity being protected
     *
     * @return scope or realm
     */
    @Override
    @JsonIgnore
    public String getScope() {
        return "DATASOURCE";
    }

    @Override
    public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
        GranteePermissionReport<T> granteePermissionReport = new GranteePermissionReport<>();
        granteePermissionReport.setGrantee(grantee);
        granteePermissionReport.getInfo().put("resourceName", this.name);
        granteePermissionReport.getInfo().put("id", this.id);
        granteePermissionReport.getInfo().put("permissionMetadata", this.getPermissions()
                .stream()
                .map(y -> new PermissionReport(y, grantee.getAvailablePermissions().contains(y)))
                .collect(Collectors.toCollection(LinkedHashSet::new)));

        return granteePermissionReport;
    }

    @Override
    public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
        return null;
    }

}
