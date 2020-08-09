package com.flair.bi.config.jackson.mixin;

import java.time.ZonedDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewPublishRequest;
import com.flair.bi.domain.ViewRelease;
import com.flair.bi.domain.enumeration.PermissionType;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.domain.visualmetadata.VisualMetadata;

/**
 * Jackson mixin for {@link View} that describes which of the attributes will be
 * serialized in NoSQL persistence CouchDB
 */
public abstract class ViewMixin {

	@JsonIgnore
	abstract String getCreatedBy();

	@JsonIgnore
	abstract ZonedDateTime getCreatedDate();

	@JsonIgnore
	abstract String getLastModifiedBy();

	@JsonIgnore
	abstract ZonedDateTime getLastModifiedDate();

	@JsonIgnore
	abstract Long getId();

	@JsonProperty(value = "_id")
	abstract String getLinkId();

	@JsonProperty(value = "_rev")
	abstract String getRev();

	@JsonIgnore
	abstract String getViewName();

	@JsonIgnore
	abstract String getDescription();

	@JsonIgnore
	abstract boolean isPublished();

	@JsonIgnore
	abstract byte[] getImage();

	@JsonIgnore
	abstract String getImageContentType();

	@JsonIgnore
	abstract Dashboard getViewDashboard();

	@JsonProperty
	abstract Set<VisualMetadata> getVisualMetadata();

	@JsonIgnore
	abstract Set<ViewWatch> getViewWatches();

	@JsonIgnore
	abstract int getWatchCount();

	@JsonIgnore
	abstract String getPermissionResourceName();

	@JsonIgnore
	abstract PermissionType getPermissionType();

	@JsonIgnore
	abstract ViewRelease getViewPublishMetadata();

	@JsonIgnore
	abstract Set<ViewPublishRequest> getViewPublishRequestSet();

	@JsonIgnore
	abstract Set<ViewRelease> getViewPublishMetadataSet();
}
