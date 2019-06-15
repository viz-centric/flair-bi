package com.flair.bi.repository;

import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.querydsl.binding.SingleValueBinding;

public interface FeatureRepository extends JpaRepository<Feature, Long>,
    QueryDslPredicateExecutor<Feature>,
    QuerydslBinderCustomizer<QFeature> {

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    @Override
    default void customize(QuerydslBindings bindings, QFeature root) {
        bindings.bind(String.class)
            .first((SingleValueBinding<StringPath, String>) StringExpression::containsIgnoreCase);
        bindings.bind(root.featureType).first(SimpleExpression::eq);
        bindings.bind(root.type).first((StringExpression::contains));
        bindings.bind(root.functionId).first((SimpleExpression::eq));
        bindings.bind(root.id).first(SimpleExpression::eq);
        bindings.bind(root.featureType).first(SimpleExpression::eq);
        bindings.bind(root.datasource).first((path, value) -> path.id.eq(value.getId()));
    }
}
