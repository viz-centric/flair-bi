package com.flair.bi.repository.security;

import com.flair.bi.domain.Realm;
import com.flair.bi.domain.security.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, String>, QuerydslPredicateExecutor<UserGroup> {

    List<UserGroup> findAllByNameAndRealm(String role, Realm realm);

}
