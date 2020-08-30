package com.flair.bi.repository;

import com.flair.bi.domain.QReleaseRequest;
import com.flair.bi.domain.ReleaseRequest;
import com.querydsl.core.types.dsl.SimpleExpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import java.util.Collection;

public interface ReleaseRequestRepository extends JpaRepository<ReleaseRequest, Long>,
		QuerydslPredicateExecutor<ReleaseRequest>,
		QuerydslBinderCustomizer<QReleaseRequest> {

	Collection<ReleaseRequest> findByReleaseId(Long releaseId);

	default void customize(QuerydslBindings bindings, QReleaseRequest root) {
		bindings.bind(root.id).first(SimpleExpression::eq);
	}
}
