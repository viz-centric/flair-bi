package com.flair.bi.config.couchdb;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import org.ektorp.CouchDbConnector;
import org.ektorp.impl.StdObjectMapperFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Custom {@link org.ektorp.impl.ObjectMapperFactory} where application-specific
 * JSON Jackson configuration is added
 */
public class CouchDbObjectMapperFactory extends StdObjectMapperFactory {

	private List<Consumer<ObjectMapper>> consumers = new ArrayList<>();

	public synchronized void registerObjectMapperConsumer(Consumer<ObjectMapper> consumer) {
		consumers.add(consumer);
	}

	@Override
	public synchronized ObjectMapper createObjectMapper() {
		ObjectMapper mapper = super.createObjectMapper();
		consumers.forEach(x -> x.accept(mapper));
		return mapper;
	}

	@Override
	public ObjectMapper createObjectMapper(CouchDbConnector connector) {
		ObjectMapper mapper = super.createObjectMapper(connector);
		consumers.forEach(x -> x.accept(mapper));
		return mapper;
	}
}
