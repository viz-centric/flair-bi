package com.flair.bi.repository;

import com.flair.bi.domain.DatasourceGroupConstraint;
import com.flair.bi.domain.QDatasourceGroupConstraint;
import com.querydsl.core.types.dsl.SimpleExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DatasourceGroupConstraintRepository extends JpaRepository<DatasourceGroupConstraint, Long>,
		QuerydslPredicateExecutor<DatasourceGroupConstraint>, QuerydslBinderCustomizer<QDatasourceGroupConstraint> {

	List<DatasourceGroupConstraint> findByUserIsCurrentUser();

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	@Override
	default void customize(QuerydslBindings bindings, QDatasourceGroupConstraint root) {
		bindings.bind(root.datasource.id).first(SimpleExpression::eq);
	}
}
