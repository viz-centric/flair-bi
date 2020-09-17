package com.flair.bi.repository;

import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.QDatasourceConstraint;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DatasourceConstraint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DatasourceConstraintRepository extends JpaRepository<DatasourceConstraint, Long>,
		QuerydslPredicateExecutor<DatasourceConstraint>, QuerydslBinderCustomizer<QDatasourceConstraint> {

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
