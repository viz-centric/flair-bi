package com.flair.bi.config.jackson;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;

import java.io.IOException;

/**
 * Utility method for serializing and deserializing JSON data
 */
public class JacksonUtil {

	public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
			.registerModule(new Jdk8Module())
			.registerModule(new ParameterNamesModule())
			.registerModule(new JavaTimeModule())
			.setSerializationInclusion(JsonInclude.Include.NON_NULL)
			.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
			.disable(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS)
			.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

	public static <T> T fromString(String string, Class<T> clazz) {
		try {
			return OBJECT_MAPPER.readValue(string, clazz);
		} catch (IOException e) {
			throw new IllegalArgumentException(
					"The given string value: " + string.length() + " cannot be transformed to Json object", e);
		}
	}

	public static String toString(Object value) {
		try {
			return OBJECT_MAPPER.writeValueAsString(value);
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException(
					"The given Json object value: " + value + " cannot be transformed to a String", e);
		}
	}

	public static JsonNode toJsonNode(String value) {
		try {
			return OBJECT_MAPPER.readTree(value);
		} catch (IOException e) {
			throw new IllegalArgumentException(e);
		}
	}

	public static <T> T clone(T value) {
		return fromString(toString(value), (Class<T>) value.getClass());
	}
}
