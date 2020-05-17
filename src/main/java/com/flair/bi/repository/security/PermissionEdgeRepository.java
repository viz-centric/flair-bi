package com.flair.bi.repository.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.flair.bi.domain.security.PermissionEdge;
import com.flair.bi.domain.security.PermissionEdgeKey;

public interface PermissionEdgeRepository extends JpaRepository<PermissionEdge, PermissionEdgeKey>,
    QuerydslPredicateExecutor<PermissionEdge> {
}
