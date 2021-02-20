package com.flair.bi.repository;

import com.flair.bi.domain.QUser;
import com.flair.bi.domain.User;
import com.querydsl.core.types.dsl.StringExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository
		extends JpaRepository<User, Long>, QuerydslPredicateExecutor<User>, QuerydslBinderCustomizer<QUser> {

	Optional<User> findOneByActivationKey(String activationKey);

	Optional<User> findOneByIdAndRealmsId(Long id, Long realmId);

	List<User> findAllByActivatedIsFalseAndCreatedDateBefore(ZonedDateTime dateTime);

	Optional<User> findOneByResetKey(String resetKey);

	Optional<User> findOneByEmailAndRealmsId(String email, Long realmId);

	Optional<User> findOneByEmail(String email);

	Optional<User> findOneByLogin(String login);

	Optional<User> findOneByLoginAndRealmsId(String login, Long realmId);

	@Modifying
	void deleteAllByRealmsId(Long realmId);

	default void customize(QuerydslBindings querydslBindings, QUser qUser) {
		querydslBindings.bind(qUser.login).first(StringExpression::containsIgnoreCase);
	}
}
