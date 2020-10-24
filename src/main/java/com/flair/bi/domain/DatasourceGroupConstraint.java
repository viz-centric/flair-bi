package com.flair.bi.domain;

import com.flair.bi.domain.constraintdefinition.ConstraintGroupDefinition;
import com.flair.bi.domain.security.UserGroup;
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
public class DatasourceGroupConstraint extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Type(type = "jsonb")
	@Column(name = "constraint_definition", nullable = false, columnDefinition = "jsonb")
	private ConstraintGroupDefinition constraintDefinition;

	@ManyToOne(optional = false)
	@NotNull
	private Datasource datasource;

	@ManyToOne
	@NotNull
	private UserGroup userGroup;

}
