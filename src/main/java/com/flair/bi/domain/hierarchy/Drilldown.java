package com.flair.bi.domain.hierarchy;


import com.flair.bi.domain.Feature;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * A Drilldown.
 */
@Embeddable
public class Drilldown implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "sequence_number")
    private int order;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "feature_id", foreignKey = @ForeignKey(name = "fk_feature_id"),
        referencedColumnName = "id", nullable = false)
    private Feature feature;

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public Feature getFeature() {
        return feature;
    }

    public void setFeature(Feature feature) {
        this.feature = feature;
    }

    @PreRemove
    public void preRemove() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (o == null || getClass() != o.getClass()) return false;

        Drilldown drilldown = (Drilldown) o;

        return new EqualsBuilder()
            .append(getOrder(), drilldown.getOrder())
            .append(getFeature(), drilldown.getFeature())
            .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
            .append(getOrder())
            .append(getFeature())
            .toHashCode();
    }
}
