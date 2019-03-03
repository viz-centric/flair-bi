package com.flair.bi.repository;

import com.flair.bi.domain.viewwatch.QViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.domain.viewwatch.ViewWatchId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

public interface ViewWatchRepository extends JpaRepository<ViewWatch, ViewWatchId>,
    QueryDslPredicateExecutor<ViewWatch>,
    QuerydslBinderCustomizer<QViewWatch> {

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    @Override
    default void customize(QuerydslBindings bindings, QViewWatch root) {
        bindings.bind(root.view).first((path, value) -> path.id.eq(value.getId()));
        bindings.excluding(root.user);
    }
}
