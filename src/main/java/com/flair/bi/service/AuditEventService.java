package com.flair.bi.service;

import com.flair.bi.config.audit.AuditEventConverter;
import com.flair.bi.domain.QPersistentAuditEvent;
import com.flair.bi.repository.PersistenceAuditEventRepository;
import com.flair.bi.security.SecurityUtils;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing audit events.
 * <p>
 * This is the default implementation to support SpringBoot Actuator AuditEventRepository
 * </p>
 */
@Service
@Transactional
@RequiredArgsConstructor
public class AuditEventService {

    private final PersistenceAuditEventRepository persistenceAuditEventRepository;

    private final AuditEventConverter auditEventConverter;

    public Page<AuditEvent> findAll(Pageable pageable) {
        return persistenceAuditEventRepository.findAll(pageable)
            .map(auditEventConverter::convertToAuditEvent);
    }

	public Page<AuditEvent> findByDatesAndPrincipal(LocalDateTime fromDate, LocalDateTime toDate, String principal,
			Pageable pageable) {
		return persistenceAuditEventRepository
				.findAllByAuditEventDateBetweenAndPrincipal(fromDate, toDate, principal, pageable)
				.map(auditEventConverter::convertToAuditEvent);
	}

	public Page<AuditEvent> findByDates(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
		return persistenceAuditEventRepository.findAllByAuditEventDateBetween(fromDate, toDate, pageable)
				.map(auditEventConverter::convertToAuditEvent);
	}

    public Optional<AuditEvent> find(Long id) {
        return Optional.ofNullable(persistenceAuditEventRepository.findOne(id)).map
            (auditEventConverter::convertToAuditEvent);
    }

    @Transactional(readOnly = true)
    public Long authenticationSuccessCount() {
        BooleanExpression type = QPersistentAuditEvent.persistentAuditEvent.auditEventType.eq("AUTHENTICATION_SUCCESS");
        BooleanExpression principal =
            QPersistentAuditEvent.persistentAuditEvent.principal.eq(SecurityUtils.getCurrentUserLogin());
        return persistenceAuditEventRepository.count(type.and(principal));
    }
}
