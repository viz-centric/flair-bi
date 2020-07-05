package com.flair.bi.config.couchdb;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "couchdb", ignoreUnknownFields = false)
@Getter
@Setter
public class CouchDbProperties {

	private String url;
	private String host = "localhost";
	private int port = 5984;
	private int maxConnections = 20;
	private int connectionTimeout = 1000;
	private int socketTimeout = 10000;
	private boolean autoUpdateViewOnChange;
	private String username;
	private String password;
	private boolean testConnectionAtStartup;
	private boolean cleanupIdleConnections = true;
	private boolean enableSSL = false;
	private boolean relaxedSSLSettings;
	private boolean caching = true;
	private int maxCacheEntries = 1000;
	private int maxObjectSizeBytes = 8192;
	private boolean useExpectContinue = true;
	private String databaseName;

	/**
	 * Instance of {@link javax.net.ssl.SSLSocketFactory }
	 */
	private String sslFactory;

	/**
	 * Path of the file that contains {@link javax.net.ssl.SSLSocketFactory}
	 * configuration
	 */
	private String sslFactoryArg;
}
