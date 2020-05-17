package com.flair.bi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.QFeatureBookmark;
import com.querydsl.core.types.dsl.SimpleExpression;

/**
 * Spring Data JPA repository for the FeatureBookmark entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FeatureBookmarkRepository extends JpaRepository<FeatureBookmark, Long>,
    QuerydslPredicateExecutor<FeatureBookmark>,
    QuerydslBinderCustomizer<QFeatureBookmark> {

    @Query("select feature_bookmark from FeatureBookmark feature_bookmark where feature_bookmark.user.login = ?#{principal.username}")
    List<FeatureBookmark> findByUserIsCurrentUser();

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    @Override
    default void customize(QuerydslBindings bindings, QFeatureBookmark root) {
        bindings.bind(root.datasource.id).first(SimpleExpression::eq);
        bindings.bind(root.name).first(SimpleExpression::eq);
        bindings.excluding(root.user);
    }
}
