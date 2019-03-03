package com.flair.bi.domain;


import com.flair.bi.domain.constraintdefinition.ConstraintDefinition;
import com.project.bi.general.Builder;
import com.project.bi.query.dto.ConditionExpressionDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DatasourceConstraint.
 */
@Entity
@Table(name = "datasource_constraint")
@Getter
@Setter
@EqualsAndHashCode(of = "id", callSuper = false)
public class DatasourceConstraint extends BaseEntity implements Serializable, Builder<ConditionExpressionDTO> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Type(type = "jsonb")
    @Column(name = "constraint_definition", nullable = false, columnDefinition = "jsonb")
    private ConstraintDefinition constraintDefinition;

    @ManyToOne(optional = false)
    @NotNull
    private User user;

    @ManyToOne(optional = false)
    @NotNull
    private Datasource datasource;

    public DatasourceConstraint user(User user) {
        this.user = user;
        return this;
    }


    public DatasourceConstraint datasources(Datasource datasource) {
        this.datasource = datasource;
        return this;
    }

    @Override
    public ConditionExpressionDTO build() {
        ConditionExpressionDTO dto = new ConditionExpressionDTO();
        dto.setConditionExpression(constraintDefinition.build());
        dto.setSourceType(ConditionExpressionDTO.SourceType.REDUCTION);
        return dto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        DatasourceConstraint constraint = (DatasourceConstraint) o;
        return constraint.getId() != null && getId() != null && Objects.equals(getId(), constraint.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
