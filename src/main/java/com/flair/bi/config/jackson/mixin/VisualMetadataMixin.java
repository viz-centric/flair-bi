package com.flair.bi.config.jackson.mixin;

import com.fasterxml.jackson.annotation.JsonIgnore;

public abstract class VisualMetadataMixin {

	@JsonIgnore
	abstract String getPermissionResourceName();

	@JsonIgnore
	abstract String getPermissionType();

	@JsonIgnore
	abstract Integer getHashcodeValue();
}
