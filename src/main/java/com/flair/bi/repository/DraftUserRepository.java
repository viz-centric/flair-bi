package com.flair.bi.repository;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.domain.QDraftUser;
import com.querydsl.core.types.dsl.StringExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface DraftUserRepository
		extends JpaRepository<DraftUser, Long>, QuerydslPredicateExecutor<DraftUser>, QuerydslBinderCustomizer<QDraftUser> {

	default void customize(QuerydslBindings querydslBindings, QDraftUser qUser) {
		querydslBindings.bind(qUser.username).first(StringExpression::containsIgnoreCase);
	}
}
