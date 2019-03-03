package com.flair.bi.repository.security;

import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;

public interface PermissionRepository extends JpaRepository<Permission, PermissionKey>, QueryDslPredicateExecutor<Permission> {


}
