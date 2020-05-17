package com.flair.bi.config;

import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.EnumSet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.web.filter.CachingHttpHeadersFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebConfigurer
		implements ServletContextInitializer, WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

	private final Environment env;

	private final JHipsterProperties jHipsterProperties;

	@Override
	public void onStartup(ServletContext servletContext) throws ServletException {
		if (env.getActiveProfiles().length != 0) {
			log.info("Web application configuration, using profiles: {}", Arrays.toString(env.getActiveProfiles()));
		}
		EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD,
				DispatcherType.ASYNC);

		if (env.acceptsProfiles(Profiles.of(Constants.SPRING_PROFILE_PRODUCTION))) {
			initCachingHttpHeadersFilter(servletContext, disps);
		}
		log.info("Web application fully configured");
	}

	@Override
	public void customize(TomcatServletWebServerFactory container) {
		MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
		// IE issue, see https://github.com/jhipster/generator-jhipster/pull/711
		mappings.add("html", "text/html;charset=utf-8");
		// CloudFoundry issue, see https://github.com/cloudfoundry/gorouter/issues/64
		mappings.add("json", "text/html;charset=utf-8");
		container.setMimeMappings(mappings);
		// When running in an IDE or with ./mvnw spring-boot:run, set location of the
		// static web assets.
		setLocationForStaticAssets(container);

	}

	private void setLocationForStaticAssets(TomcatServletWebServerFactory container) {
		File root;
		String prefixPath = resolvePathPrefix();
		if (env.acceptsProfiles(Profiles.of(Constants.SPRING_PROFILE_PRODUCTION))) {
			root = new File(prefixPath + "target/www/");
		} else {
			root = new File(prefixPath + "src/main/webapp/");
		}
		if (root.exists() && root.isDirectory()) {
			container.setDocumentRoot(root);
		}
	}

	/**
	 * Resolve path prefix to static resources.
	 */
	private String resolvePathPrefix() {
		String fullExecutablePath = this.getClass().getResource("").getPath();
		String rootPath = Paths.get(".").toUri().normalize().getPath();
		String extractedPath = fullExecutablePath.replace(rootPath, "");
		int extractionEndIndex = extractedPath.indexOf("target/");
		if (extractionEndIndex <= 0) {
			return "";
		}
		return extractedPath.substring(0, extractionEndIndex);
	}

	/**
	 * Initializes the caching HTTP Headers Filter.
	 */
	private void initCachingHttpHeadersFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
		log.debug("Registering Caching HTTP Headers Filter");
		FilterRegistration.Dynamic cachingHttpHeadersFilter = servletContext.addFilter("cachingHttpHeadersFilter",
				new CachingHttpHeadersFilter(jHipsterProperties));

		cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/content/*");
		cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/app/*");
		cachingHttpHeadersFilter.setAsyncSupported(true);
	}

	@Bean
	@ConditionalOnProperty(name = "jhipster.cors.allowed-origins")
	public CorsFilter corsFilter() {
		log.debug("Registering CORS filter");
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = jHipsterProperties.getCors();
		source.registerCorsConfiguration("/api/**", config);
		source.registerCorsConfiguration("/v2/api-docs", config);
		source.registerCorsConfiguration("/oauth/**", config);
		return new CorsFilter(source);
	}

}
