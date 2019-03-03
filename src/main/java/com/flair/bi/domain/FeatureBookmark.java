package com.flair.bi.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A FeatureBookmark.
 */
@Entity
@Table(name = "feature_bookmark")
public class FeatureBookmark implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Size(min = 0, max = 50)
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @OneToMany(mappedBy = "featureBookmark", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FeatureCriteria> featureCriteria = new HashSet<>();

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    @NotNull
    private Datasource datasource;

    @PreRemove
    public void preRemove() {
        this.datasource = null;
        this.user = null;
    }

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

    public FeatureBookmark name(String name) {
        this.name = name;
        return this;
    }

    public Set<FeatureCriteria> getFeatureCriteria() {
        return featureCriteria;
    }

    public void setFeatureCriteria(Set<FeatureCriteria> featureCriteria) {
        this.featureCriteria = featureCriteria;
    }

    public FeatureBookmark featureCriteria(Set<FeatureCriteria> featureCriteria) {
        this.featureCriteria = featureCriteria;
        return this;
    }

    public FeatureBookmark addFeatureCriteria(FeatureCriteria featureCriteria) {
        this.featureCriteria.add(featureCriteria);
        featureCriteria.setFeatureBookmark(this);
        return this;
    }

    public FeatureBookmark removeFeatureCriteria(FeatureCriteria featureCriteria) {
        featureCriteria.setFeatureBookmark(null);
        this.featureCriteria.remove(featureCriteria);
        return this;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FeatureBookmark user(User user) {
        this.user = user;
        return this;
    }

    public Datasource getDatasource() {
        return datasource;
    }

    public void setDatasource(Datasource datasource) {
        this.datasource = datasource;
    }

    public FeatureBookmark datasources(Datasource datasource) {
        this.datasource = datasource;
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
        FeatureBookmark featureBookmark = (FeatureBookmark) o;
        if (featureBookmark.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), featureBookmark.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "FeatureBookmark{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
