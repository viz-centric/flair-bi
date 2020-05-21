package com.flair.bi.web.rest.util;

import org.springframework.http.HttpHeaders;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for HTTP headers creation.
 */
@Slf4j
public final class HeaderUtil {

	private HeaderUtil() {
	}

	public static HttpHeaders createAlert(String message, String param) {
		HttpHeaders headers = new HttpHeaders();
		headers.add("X-flairbiApp-alert", message);
		headers.add("X-flairbiApp-params", param);
		return headers;
	}

	public static HttpHeaders createEntityCreationAlert(String entityName, String param) {
		return createAlert("flairbiApp." + entityName + ".created", param);
	}

	public static HttpHeaders createEntityUpdateAlert(String entityName, String param) {
		return createAlert("flairbiApp." + entityName + ".updated", param);
	}

	public static HttpHeaders createEntityDeletionAlert(String entityName, String param) {
		return createAlert("flairbiApp." + entityName + ".deleted", param);
	}

	public static HttpHeaders createFailureAlert(String entityName, String errorKey, String defaultMessage) {
		log.error("Entity creation failed, {}", defaultMessage);
		HttpHeaders headers = new HttpHeaders();
		headers.add("X-flairbiApp-error", "error." + errorKey);
		headers.add("X-flairbiApp-params", entityName);
		return headers;
	}

	public static HttpHeaders createFailureAlert(String entityName, String errorKey) {
		log.error("Failure alert key {} entity {}", errorKey, entityName);
		HttpHeaders headers = new HttpHeaders();
		headers.add("X-flairbiApp-error", errorKey);
		headers.add("X-flairbiApp-params", entityName);
		return headers;
	}
}
