package com.flair.bi.repository.security;

import com.flair.bi.domain.security.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;

public interface UserGroupRepository extends JpaRepository<UserGroup, String>,
    QueryDslPredicateExecutor<UserGroup> {
}
