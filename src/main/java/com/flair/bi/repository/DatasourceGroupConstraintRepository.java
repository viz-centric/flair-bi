package com.flair.bi.repository;

import com.flair.bi.domain.DatasourceGroupConstraint;
import com.flair.bi.domain.QDatasourceGroupConstraint;
import com.querydsl.core.types.dsl.SimpleExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

@Repository
public interface DatasourceGroupConstraintRepository extends JpaRepository<DatasourceGroupConstraint, Long>,
		QuerydslPredicateExecutor<DatasourceGroupConstraint>, QuerydslBinderCustomizer<QDatasourceGroupConstraint> {

	@Override
	default void customize(QuerydslBindings bindings, QDatasourceGroupConstraint root) {
		bindings.bind(root.datasource.id).first(SimpleExpression::eq);
	}
}
