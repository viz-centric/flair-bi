package com.flair.bi.repository.security;

import com.flair.bi.domain.security.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Set;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long>, QuerydslPredicateExecutor<UserGroup> {

    boolean existsByName(String name);

    UserGroup findByNameAndRealmId(String groupName, Long realmId);

    List<UserGroup> findAllByNameInAndRealmId(Set<String> groupName, Long realmId);

    @Modifying
    void deleteAllByNameAndRealmId(String groupName, Long realmId);
}
