package com.flair.bi.config.jackson.mixin;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

public abstract class AbstractAuditingEntityMixin {

	@JsonIgnore
	abstract String getCreatedBy();

	@JsonIgnore
	abstract ZonedDateTime getCreatedDate();

	@JsonIgnore
	abstract String getLastModifiedBy();

	@JsonIgnore
	abstract ZonedDateTime getLastModifiedDate();
}
