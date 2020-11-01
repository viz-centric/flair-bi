package com.flair.bi.repository;

import com.flair.bi.domain.*;
import com.querydsl.core.types.dsl.SimpleExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.querydsl.binding.SingleValueBinding;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the VisualizationColors entity.
 */
@SuppressWarnings("unused")
public interface VisualizationColorsRepository extends JpaRepository<VisualizationColors, Long>, QuerydslPredicateExecutor<VisualizationColors>,
        QuerydslBinderCustomizer<QVisualizationColors> {


    @Query(value = "select visualizationColors from VisualizationColors visualizationColors where visualizationColors.realm.id = :id")
    List<VisualizationColors> findByRealmId(@Param("id") Long id);

    @Modifying
    @Query("delete from VisualizationColors v where v.realm.id = :id")
    void deleteAllByRealmId(@Param("id") Long id);

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    default void customize(QuerydslBindings bindings, QVisualizationColors root) {
        bindings.bind(String.class)
                .first((SingleValueBinding<StringPath, String>) StringExpression::containsIgnoreCase);
        bindings.bind(root.code).first(SimpleExpression::eq);
        bindings.bind(root.id).first(SimpleExpression::eq);
    }
}
