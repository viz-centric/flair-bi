package com.flair.bi.repository.security;

import com.flair.bi.domain.security.PermissionEdge;
import com.flair.bi.domain.security.PermissionEdgeKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;

public interface PermissionEdgeRepository extends JpaRepository<PermissionEdge, PermissionEdgeKey>,
    QueryDslPredicateExecutor<PermissionEdge> {
}
