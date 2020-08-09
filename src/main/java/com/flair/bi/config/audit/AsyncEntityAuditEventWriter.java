package com.flair.bi.config.audit;

import java.io.IOException;
import java.lang.reflect.Method;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.EntityAuditEvent;
import com.flair.bi.repository.EntityAuditEventRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Async Entity Audit Event writer This is invoked by Hibernate entity listeners
 * to write audit event for entitities
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AsyncEntityAuditEventWriter {

	private final EntityAuditEventRepository auditingEntityRepository;

	private final ObjectMapper objectMapper; // Jackson object mapper

	/**
	 * Writes audit events to DB asynchronously in a new thread
	 * 
	 * @param target target
	 * @param action action
	 */
	@Async
	public void writeAuditEvent(Object target, EntityAuditAction action) {
		log.debug("-------------- Post {} audit  --------------", action.value());
		try {
			EntityAuditEvent auditedEntity = prepareAuditEntity(target, action);

			if (auditedEntity != null) {
				auditingEntityRepository.save(auditedEntity);
			}
		} catch (Exception e) {
			log.error("Exception while persisting audit entity for {} error: {}", target, e);
		}
	}

	/**
	 * Method to prepare auditing entity
	 *
	 * @param entity
	 * @param action
	 * @return
	 */
	private EntityAuditEvent prepareAuditEntity(final Object entity, EntityAuditAction action) {
		EntityAuditEvent auditedEntity = new EntityAuditEvent();
		Class<?> entityClass = entity.getClass(); // Retrieve entity class with reflection
		auditedEntity.setAction(action.value());
		auditedEntity.setEntityType(entityClass.getName());
		Long entityId;
		String entityData;

		log.trace("Getting Entity Id and Content");
		try {
			final Method method = ReflectionUtils.findMethod(entityClass, "getId");
			entityId = (Long) ReflectionUtils.invokeMethod(method, entity);
			entityData = objectMapper.writeValueAsString(entity);
		} catch (IllegalArgumentException | SecurityException | IOException e) {
			log.error("Exception while getting entity ID and content", e);
			// returning null as we dont want to raise an application exception here
			return null;
		}
		auditedEntity.setEntityId(entityId);
		auditedEntity.setEntityValue(entityData);
		final AbstractAuditingEntity abstractAuditEntity = (AbstractAuditingEntity) entity;
		if (EntityAuditAction.CREATE.equals(action)) {
			auditedEntity.setModifiedBy(abstractAuditEntity.getCreatedBy());
			auditedEntity.setModifiedDate(abstractAuditEntity.getCreatedDate());
			auditedEntity.setCommitVersion(1);
		} else {
			if (abstractAuditEntity.getLastModifiedBy() == null) {
				auditedEntity.setModifiedBy(abstractAuditEntity.getCreatedBy());
			} else {
				auditedEntity.setModifiedBy(abstractAuditEntity.getLastModifiedBy());
			}

			if (abstractAuditEntity.getCreatedDate() != null) {
				auditedEntity.setModifiedDate(abstractAuditEntity.getCreatedDate());
			} else {
				auditedEntity.setModifiedDate(abstractAuditEntity.getLastModifiedDate());
			}
			calculateVersion(auditedEntity);
		}
		log.trace("Audit Entity --> {} ", auditedEntity.toString());
		return auditedEntity;
	}

	private void calculateVersion(EntityAuditEvent auditedEntity) {
		log.trace("Version calculation. for update/remove");
		Integer lastCommitVersion = auditingEntityRepository.findMaxCommitVersion(auditedEntity.getEntityType(),
				auditedEntity.getEntityId());
		log.trace("Last commit version of entity => {}", lastCommitVersion);
		if (lastCommitVersion != null && lastCommitVersion != 0) {
			log.trace("Present. Adding version..");
			auditedEntity.setCommitVersion(lastCommitVersion + 1);
		} else {
			log.trace("No entities.. Adding new version 1");
			auditedEntity.setCommitVersion(1);
		}
	}
}
