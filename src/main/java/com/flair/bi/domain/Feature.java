package com.flair.bi.domain;

import com.flair.bi.domain.enumeration.FeatureType;
import com.flair.bi.domain.field.Field;
import com.flair.bi.domain.listeners.FeatureListener;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents type of data being retrieved from {@link Datasource}
 */
@Getter
@Setter
@EqualsAndHashCode(of = "id", callSuper = false)
@Entity
@EntityListeners(value = {FeatureListener.class})
@Table(name = "features")
@ToString
public class Feature extends AbstractAuditingEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Size(max = 40)
    @Pattern(regexp = "[a-z_0-9]+")
    @Column(name = "name", length = 40, nullable = false)
    private String name;

    @NotNull
    @Size(max = 40)
    @Column(name = "type", length = 40, nullable = false)
    private String type;

    private Long functionId;

    @NotNull
    @Column(name = "feature_definition", nullable = false)
    private String definition;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "datasource_id",
        foreignKey = @ForeignKey(name = "fk_datasource_id"),
        referencedColumnName = "id")
    private Datasource datasource;

    @Enumerated(EnumType.STRING)
    @Column(name = "feature_type")
    @NotNull
    private FeatureType featureType;

    @OneToMany(mappedBy = "feature")
    private Set<Field> fields = new HashSet<>();

    public void clearFields() {
        getFields().forEach(x -> x.setFeature(null));
        getFields().clear();
    }

}
