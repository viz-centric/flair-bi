package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.domain.hierarchy.QHierarchy;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;

public interface HierarchyRepository extends JpaRepository<Hierarchy, Long>, QuerydslPredicateExecutor<Hierarchy>,
		QuerydslBinderCustomizer<QHierarchy> {

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	@Override
	default void customize(QuerydslBindings bindings, QHierarchy root) {
		bindings.bind(root.id).first(SimpleExpression::eq);
		bindings.bind(root.drilldown).first((path, value) -> path.any().in(value));
		bindings.bind(root.name).first(StringExpression::containsIgnoreCase);
		bindings.bind(root.datasource).first((path, value) -> path.id.eq(value.getId()));
	}
}
