package com.flair.bi.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import com.flair.bi.domain.QUser;
import com.flair.bi.domain.User;
import com.querydsl.core.types.dsl.StringExpression;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository
		extends JpaRepository<User, Long>, QuerydslPredicateExecutor<User>, QuerydslBinderCustomizer<QUser> {

	Optional<User> findOneByActivationKey(String activationKey);

	List<User> findAllByActivatedIsFalseAndCreatedDateBefore(ZonedDateTime dateTime);

	Optional<User> findOneByResetKey(String resetKey);

	Optional<User> findOneByEmail(String email);

	Optional<User> findOneByLogin(String login);

	default void customize(QuerydslBindings querydslBindings, QUser qUser) {
		querydslBindings.bind(qUser.login).first(StringExpression::containsIgnoreCase);
	}
}
