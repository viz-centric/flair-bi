package com.flair.bi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.QDatasourceConstraint;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;

/**
 * Spring Data JPA repository for the DatasourceConstraint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DatasourceConstraintRepository extends JpaRepository<DatasourceConstraint, Long>,
		QuerydslPredicateExecutor<DatasourceConstraint>, QuerydslBinderCustomizer<QDatasourceConstraint> {

	@Query("select datasource_constraint from DatasourceConstraint datasource_constraint where datasource_constraint.user.login = ?#{principal.username}")
	List<DatasourceConstraint> findByUserIsCurrentUser();

	DatasourceConstraint findByUserLoginAndDatasourceId(String login, Long datasourceId);

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	@Override
	default void customize(QuerydslBindings bindings, QDatasourceConstraint root) {
		bindings.bind(root.user.login).first(StringExpression::equalsIgnoreCase);
		bindings.bind(root.datasource.id).first(SimpleExpression::eq);
	}
}
