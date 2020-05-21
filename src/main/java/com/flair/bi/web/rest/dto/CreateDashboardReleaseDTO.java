package com.flair.bi.web.rest.dto;

import java.util.List;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

import lombok.Data;

@Data
public class CreateDashboardReleaseDTO {

	private String comment;

	@NotEmpty
	@NotNull
	private List<Long> viewIds;
}
