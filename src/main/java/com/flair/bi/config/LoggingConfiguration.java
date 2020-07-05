package com.flair.bi.config;

import static io.github.jhipster.config.logging.LoggingUtils.addContextListener;
import static io.github.jhipster.config.logging.LoggingUtils.addJsonConsoleAppender;
import static io.github.jhipster.config.logging.LoggingUtils.addLogstashTcpSocketAppender;
import static io.github.jhipster.config.logging.LoggingUtils.setMetricsMarkerLogbackFilter;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ch.qos.logback.classic.LoggerContext;
import io.github.jhipster.config.JHipsterProperties;

@Configuration
@RefreshScope
public class LoggingConfiguration {

	public LoggingConfiguration(@Value("${spring.application.name}") final String appName,
			@Value("${server.port}") final String serverPort, final JHipsterProperties jHipsterProperties,
			final ObjectProvider<BuildProperties> buildProperties, final ObjectMapper mapper)
			throws JsonProcessingException {

		final LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();

		final Map<String, String> map = new HashMap<>();
		map.put("app_name", appName);
		map.put("app_port", serverPort);
		buildProperties.ifAvailable(it -> map.put("version", it.getVersion()));
		final String customFields = mapper.writeValueAsString(map);

		final JHipsterProperties.Logging loggingProperties = jHipsterProperties.getLogging();
		final JHipsterProperties.Logging.Logstash logstashProperties = loggingProperties.getLogstash();

		if (loggingProperties.isUseJsonFormat()) {
			addJsonConsoleAppender(context, customFields);
		}
		if (logstashProperties.isEnabled()) {
			addLogstashTcpSocketAppender(context, customFields, logstashProperties);
		}
		if (loggingProperties.isUseJsonFormat() || logstashProperties.isEnabled()) {
			addContextListener(context, customFields, loggingProperties);
		}
		if (jHipsterProperties.getMetrics().getLogs().isEnabled()) {
			setMetricsMarkerLogbackFilter(context, loggingProperties.isUseJsonFormat());
		}
	}
}
