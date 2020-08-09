package com.flair.bi.config;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableJpaRepositories("com.flair.bi.repository")
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware", dateTimeProviderRef = "auditingDateTimeProvider")
@EnableTransactionManagement
@RequiredArgsConstructor

public class DatabaseConfiguration {

	@Bean(name = "auditingDateTimeProvider")
	public DateTimeProvider dateTimeProvider() {
		return () -> Optional.of(OffsetDateTime.now());
	}

}
