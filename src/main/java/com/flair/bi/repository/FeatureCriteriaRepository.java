package com.flair.bi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.domain.QFeatureCriteria;
import com.querydsl.core.types.dsl.SimpleExpression;

/**
 * Spring Data JPA repository for the FeatureCriteria entity.
 */
@Repository
public interface FeatureCriteriaRepository extends JpaRepository<FeatureCriteria, Long>,
		QuerydslPredicateExecutor<FeatureCriteria>, QuerydslBinderCustomizer<QFeatureCriteria> {

	/**
	 * Customize the {@link QuerydslBindings} for the given root.
	 *
	 * @param bindings the {@link QuerydslBindings} to customize, will never be
	 *                 {@literal null}.
	 * @param root     the entity root, will never be {@literal null}.
	 */
	@Override
	default void customize(QuerydslBindings bindings, QFeatureCriteria root) {
		bindings.bind(root.featureBookmark.id).first(SimpleExpression::eq);
	}
}
