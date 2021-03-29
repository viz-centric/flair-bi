package com.flair.bi.config.couchdb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.flair.bi.config.jackson.mixin.AbstractAuditingEntityMixin;
import com.flair.bi.config.jackson.mixin.ViewMixin;
import com.flair.bi.config.jackson.mixin.VisualMetadataMixin;
import com.flair.bi.domain.AbstractAuditingEntity;
import com.flair.bi.domain.View;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.view.IViewStateRepository;
import com.flair.bi.view.ViewStateCouchDbRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ektorp.http.HttpClient;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.impl.StdCouchDbInstance;
import org.ektorp.spring.HttpClientFactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLSocketFactory;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Optional;

import static org.apache.http.conn.ssl.SSLSocketFactory.BROWSER_COMPATIBLE_HOSTNAME_VERIFIER;

/**
 * Couch Db configuration
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class CouchDbConfiguration {

	private final CouchDbProperties couchDbProperties;

	@ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "false")
	@Bean
	public HttpClientFactoryBean httpClientFactoryBean() {

		HttpClientFactoryBean bean = new HttpClientFactoryBean();

		if (couchDbProperties.getUrl() != null) {
			bean.setUrl(couchDbProperties.getUrl());
		} else {
			bean.setHost(couchDbProperties.getHost());
			bean.setPort(couchDbProperties.getPort());
		}
		bean.setMaxConnections(couchDbProperties.getMaxConnections());
		bean.setConnectionTimeout(couchDbProperties.getConnectionTimeout());
		bean.setSocketTimeout(couchDbProperties.getSocketTimeout());
		bean.setAutoUpdateViewOnChange(couchDbProperties.isAutoUpdateViewOnChange());
		Optional.ofNullable(couchDbProperties.getUsername()).ifPresent(bean::setUsername);
		Optional.ofNullable(couchDbProperties.getPassword()).ifPresent(bean::setPassword);

		bean.setTestConnectionAtStartup(couchDbProperties.isTestConnectionAtStartup());
		bean.setCleanupIdleConnections(couchDbProperties.isCleanupIdleConnections());
		bean.setEnableSSL(couchDbProperties.isEnableSSL());
		bean.setRelaxedSSLSettings(couchDbProperties.isRelaxedSSLSettings());
		bean.setCaching(couchDbProperties.isCaching());
		bean.setMaxCacheEntries(couchDbProperties.getMaxCacheEntries());
		bean.setMaxObjectSizeBytes(couchDbProperties.getMaxObjectSizeBytes());
		bean.setUseExpectContinue(couchDbProperties.isUseExpectContinue());

		if (couchDbProperties.isEnableSSL()) {

			try {
				Class<?> clazz = Class.forName(couchDbProperties.getSslFactory());
				Constructor<?> constructor = clazz.getConstructor(String.class);

				SSLSocketFactory sslSocketFactory = (SSLSocketFactory) constructor
						.newInstance(couchDbProperties.getSslFactoryArg());

				bean.setSslSocketFactory(new org.apache.http.conn.ssl.SSLSocketFactory(sslSocketFactory,
						BROWSER_COMPATIBLE_HOSTNAME_VERIFIER));
			} catch (ClassNotFoundException | NoSuchMethodException | InstantiationException | IllegalAccessException
					| InvocationTargetException e) {
				log.error("Error setting ssl socket factory", e);
			}
		}

		return bean;

	}

	@ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "false")
	@Bean
	public StdCouchDbInstance dbInstance(@Autowired HttpClient client) {
		return new StdCouchDbInstance(client);
	}

	@ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "false")
	@Bean
	public StdCouchDbConnector couchDbConnector(@Autowired StdCouchDbInstance instance) {
		CouchDbObjectMapperFactory factory = new CouchDbObjectMapperFactory();

		factory.registerObjectMapperConsumer(x -> x.registerModule(new JavaTimeModule()));
		factory.registerObjectMapperConsumer(y -> y.addMixIn(View.class, ViewMixin.class));
		factory.registerObjectMapperConsumer(
				x -> x.addMixIn(AbstractAuditingEntity.class, AbstractAuditingEntityMixin.class));
		factory.registerObjectMapperConsumer(x -> x.addMixIn(VisualMetadata.class, VisualMetadataMixin.class));
		factory.registerObjectMapperConsumer(x -> x.setSerializationInclusion(JsonInclude.Include.NON_NULL));

		StdCouchDbConnector connector = new StdCouchDbConnector(couchDbProperties.getDatabaseName(), instance, factory);
		connector.createDatabaseIfNotExists();

		StdCouchDbConnector users = new StdCouchDbConnector("_users", instance, factory);
		users.createDatabaseIfNotExists();
		StdCouchDbConnector replicator = new StdCouchDbConnector("_replicator", instance, factory);
		replicator.createDatabaseIfNotExists();
		StdCouchDbConnector globalChanges = new StdCouchDbConnector("_global_changes", instance, factory);
		globalChanges.createDatabaseIfNotExists();

		return connector;
	}

	@ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "false")
	@Bean
	public IViewStateRepository viewStateRepository(StdCouchDbConnector couchDbConnector) {
		return new ViewStateCouchDbRepository(couchDbConnector);
	}

}
