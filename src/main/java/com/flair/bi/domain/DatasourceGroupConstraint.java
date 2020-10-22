package com.flair.bi.domain;

import com.flair.bi.domain.constraintdefinition.ConstraintDefinition;
import com.project.bi.general.Builder;
import com.project.bi.query.dto.ConditionExpressionDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * A DatasourceConstraint.
 */
@Entity
@Table(name = "datasource_group_constraint")
@Getter
@Setter
@EqualsAndHashCode(of = "id", callSuper = false)
public class DatasourceGroupConstraint extends BaseEntity implements Builder<ConditionExpressionDTO> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Type(type = "jsonb")
	@Column(name = "constraint_definition", nullable = false, columnDefinition = "jsonb")
	private ConstraintDefinition constraintDefinition;

	@ManyToOne(optional = false)
	@NotNull
	private Datasource datasource;

	@Override
	public ConditionExpressionDTO build() {
		ConditionExpressionDTO dto = new ConditionExpressionDTO();
		dto.setConditionExpression(constraintDefinition.build());
		dto.setSourceType(ConditionExpressionDTO.SourceType.REDUCTION);
		return dto;
	}

}
