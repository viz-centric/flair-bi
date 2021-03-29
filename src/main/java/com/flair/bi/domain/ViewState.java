package com.flair.bi.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import lombok.EqualsAndHashCode;
import lombok.Setter;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Basic;
import javax.persistence.Embeddable;
import javax.persistence.Transient;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Setter
@EqualsAndHashCode(of = "id")
@Embeddable
@Access(value = AccessType.PROPERTY)
public class ViewState {

	@JsonProperty("_id")
	private String id;

	@JsonProperty("_rev")
	private String revision;

	private boolean readOnly = false;

	@JsonProperty("visualMetadataSet")
	private Set<VisualMetadata> visualMetadataSet = new HashSet<>();

	@Basic
	public String getId() {
		return id;
	}

	@Transient
	public String getRevision() {
		return revision;
	}

	@Transient
	public Set<VisualMetadata> getVisualMetadataSet() {
		return visualMetadataSet;
	}

	@Basic
	public boolean isReadOnly() {
		return readOnly;
	}

	public void addVisualMetadata(VisualMetadata vm) {
		String vmId = vm.getVisualMetadataId();

		if (null == vmId) {
			vm.setCompositeId(UUID.randomUUID().toString(), id);
		} else {
			vm.setCompositeId(vmId, id);
		}

		getVisualMetadataSet().add(vm);
	}
}
