package com.flair.bi.repository;

import com.flair.bi.config.audit.AuditEventConverter;
import com.flair.bi.domain.PersistentAuditEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

/**
 * An implementation of Spring Boot's AuditEventRepository.
 */
@Repository
@RequiredArgsConstructor
public class CustomAuditEventRepository implements AuditEventRepository {

	private static final String AUTHORIZATION_FAILURE = "AUTHORIZATION_FAILURE";

	private static final String ANONYMOUS_USER = "anonymoususer";

	private final PersistenceAuditEventRepository persistenceAuditEventRepository;

	private final AuditEventConverter auditEventConverter;

	@Override
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void add(AuditEvent event) {
		if (!AUTHORIZATION_FAILURE.equals(event.getType()) && !ANONYMOUS_USER.equals(event.getPrincipal())) {

			PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
			persistentAuditEvent.setPrincipal(event.getPrincipal());
			persistentAuditEvent.setAuditEventType(event.getType());
			Instant instant = event.getTimestamp();
			persistentAuditEvent.setAuditEventDate(LocalDateTime.ofInstant(instant, ZoneId.systemDefault()));
			persistentAuditEvent.setData(auditEventConverter.convertDataToStrings(event.getData()));
			persistenceAuditEventRepository.save(persistentAuditEvent);
		}
	}

	@Override
	public List<AuditEvent> find(String principal, Instant after, String type) {
		Iterable<PersistentAuditEvent> persistentAuditEvents = persistenceAuditEventRepository
				.findByPrincipalAndAuditEventDateAfterAndAuditEventType(principal, LocalDateTime.from(after), type);
		return auditEventConverter.convertToAuditEvent(persistentAuditEvents);
	}
}
