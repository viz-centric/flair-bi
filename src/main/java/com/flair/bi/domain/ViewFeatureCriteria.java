package com.flair.bi.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

@ToString(exclude = {"feature", "view"})
@Data
@Entity
@Table(name = "view_feature_criteria")
public class ViewFeatureCriteria implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String value;

    @Column
    private String tooltip;

    @ManyToOne(optional = false)
    @NotNull
    private Feature feature;

    @ManyToOne
    @NotNull
    @JsonIgnore
    private View view;

    @PreRemove
    public void preRemove() {
        this.feature = null;
    }

}
