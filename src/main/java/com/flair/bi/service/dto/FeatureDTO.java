package com.flair.bi.service.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.flair.bi.domain.DateFilterType;
import com.flair.bi.domain.enumeration.FeatureType;

import lombok.Data;

@Data
public class FeatureDTO {

	private Long id;

	@NotNull
	@Size(max = 40)
	@Pattern(regexp = "[a-zA-Z_0-9]+")
	private String name;

	@NotNull
	@Size(max = 40)
	private String type;

	@NotNull
	private String definition;
	@NotNull
	private FeatureType featureType;

	private Boolean isSelected;

	private Long functionId;

	private Boolean favouriteFilter;

	private DateFilterType dateFilter;

}
