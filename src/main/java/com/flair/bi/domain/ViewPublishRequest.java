package com.flair.bi.domain;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ViewPublishRequest {

	@NotNull
	@ManyToOne
	private User requestedBy;

	@Embedded
	@AttributeOverrides(value = { @AttributeOverride(name = "id", column = @Column(name = "request_publish_state_id")),
			@AttributeOverride(name = "readOnly", column = @Column(name = "request_publish_read_only")) })
	private ViewState viewState;

	@Column(name = "publish_request_comment")
	private String comment;
}
