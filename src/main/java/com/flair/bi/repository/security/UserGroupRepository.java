package com.flair.bi.repository.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.flair.bi.domain.security.UserGroup;

public interface UserGroupRepository extends JpaRepository<UserGroup, String>, QuerydslPredicateExecutor<UserGroup> {
}
