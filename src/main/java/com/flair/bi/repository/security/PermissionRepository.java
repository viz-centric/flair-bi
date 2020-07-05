package com.flair.bi.repository.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;

public interface PermissionRepository
		extends JpaRepository<Permission, PermissionKey>, QuerydslPredicateExecutor<Permission> {

}
