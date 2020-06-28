package com.flair.bi.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import com.flair.bi.domain.PersistentAuditEvent;

/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */
public interface PersistenceAuditEventRepository
		extends JpaRepository<PersistentAuditEvent, Long>, QuerydslPredicateExecutor<PersistentAuditEvent> {

	List<PersistentAuditEvent> findByPrincipal(String principal);

	List<PersistentAuditEvent> findByAuditEventDateAfter(LocalDateTime after);

	List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfter(String principal, LocalDateTime after);

	List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfterAndAuditEventType(String principle,
			LocalDateTime after, String type);

	Page<PersistentAuditEvent> findAllByAuditEventDateBetweenAndPrincipal(LocalDateTime fromDate, LocalDateTime toDate,
			String principal, Pageable pageable);

	Page<PersistentAuditEvent> findAllByAuditEventDateBetween(LocalDateTime fromDate, LocalDateTime toDate,
			Pageable pageable);
}
