package com.flair.bi.web.rest.vm;

import com.fasterxml.jackson.annotation.JsonCreator;

import ch.qos.logback.classic.Logger;

/**
 * View Model object for storing a Logback logger.
 */
public class LoggerVM {

	private String name;

	private String level;

	public LoggerVM(Logger logger) {
		this.name = logger.getName();
		this.level = logger.getEffectiveLevel().toString();
	}

	@JsonCreator
	public LoggerVM() {
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	@Override
	public String toString() {
		return "LoggerVM{" + "name='" + name + '\'' + ", level='" + level + '\'' + '}';
	}
}
