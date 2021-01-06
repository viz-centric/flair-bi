package com.flair.bi.repository;

import com.flair.bi.domain.EmailConfirmationToken;
import com.flair.bi.domain.QEmailConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

public interface EmailConfirmationTokenRepository
		extends JpaRepository<EmailConfirmationToken, Long>, QuerydslPredicateExecutor<EmailConfirmationToken>, QuerydslBinderCustomizer<QEmailConfirmationToken> {

	EmailConfirmationToken findByToken(String token);

	default void customize(QuerydslBindings querydslBindings, QEmailConfirmationToken qUser) {

	}
}
