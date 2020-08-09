package com.flair.bi.config.audit;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class EntityAuditEventListener extends AuditingEntityListener {

	private static BeanFactory beanFactory;

	static void setBeanFactory(BeanFactory beanFactory) {
		EntityAuditEventListener.beanFactory = beanFactory;
	}

	@PostPersist
	public void onPostCreate(Object target) {
		try {
			AsyncEntityAuditEventWriter asyncEntityAuditEventWriter = beanFactory
					.getBean(AsyncEntityAuditEventWriter.class);
			asyncEntityAuditEventWriter.writeAuditEvent(target, EntityAuditAction.CREATE);
		} catch (NoSuchBeanDefinitionException e) {
			log.error("No bean found for AsyncEntityAuditEventWriter");
		} catch (Exception e) {
			log.error("Exception while persisting create audit entity", e);
		}
	}

	@PostUpdate
	public void onPostUpdate(Object target) {
		try {
			AsyncEntityAuditEventWriter asyncEntityAuditEventWriter = beanFactory
					.getBean(AsyncEntityAuditEventWriter.class);
			asyncEntityAuditEventWriter.writeAuditEvent(target, EntityAuditAction.UPDATE);
		} catch (NoSuchBeanDefinitionException e) {
			log.error("No bean found for AsyncEntityAuditEventWriter");
		} catch (Exception e) {
			log.error("Exception while persisting update audit entity", e);
		}
	}

	@PostRemove
	public void onPostRemove(Object target) {
		try {
			AsyncEntityAuditEventWriter asyncEntityAuditEventWriter = beanFactory
					.getBean(AsyncEntityAuditEventWriter.class);
			asyncEntityAuditEventWriter.writeAuditEvent(target, EntityAuditAction.DELETE);
		} catch (NoSuchBeanDefinitionException e) {
			log.error("No bean found for AsyncEntityAuditEventWriter");
		} catch (Exception e) {
			log.error("Exception while persisting delete audit entity", e);
		}
	}

}
