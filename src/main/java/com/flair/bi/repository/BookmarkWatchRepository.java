package com.flair.bi.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatchId;
import com.flair.bi.domain.bookmarkwatch.QBookmarkWatch;


public interface BookmarkWatchRepository extends JpaRepository<BookmarkWatch, BookmarkWatchId>,
    QueryDslPredicateExecutor<BookmarkWatch>,
    QuerydslBinderCustomizer<QBookmarkWatch> {

    /**
     * Customize the {@link QuerydslBindings} for the given root.
     *
     * @param bindings the {@link QuerydslBindings} to customize, will never be {@literal null}.
     * @param root     the entity root, will never be {@literal null}.
     */
    @Override
    default void customize(QuerydslBindings bindings, QBookmarkWatch root) {
        bindings.bind(root.view).first((path, value) -> path.id.eq(value.getId()));
        bindings.excluding(root.user);
        bindings.excluding(root.featureBookmark);
    }
}
