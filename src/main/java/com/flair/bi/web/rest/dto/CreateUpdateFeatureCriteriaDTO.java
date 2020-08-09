package com.flair.bi.web.rest.dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data transfer object used to transfer
 * {@link com.flair.bi.domain.FeatureCriteria} data when creating new
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUpdateFeatureCriteriaDTO {

	private Long id;

	@NotNull
	private String value;

	@NotNull
	private FeatureDTO feature;

	@NotNull
	private FeatureBookmarkDTO featureBookmark;

	@AllArgsConstructor
	@NoArgsConstructor
	@Data
	public static class FeatureDTO {

		private Long id;
	}

	@AllArgsConstructor
	@NoArgsConstructor
	@Data
	public static class FeatureBookmarkDTO {
		private Long id;
	}
}
