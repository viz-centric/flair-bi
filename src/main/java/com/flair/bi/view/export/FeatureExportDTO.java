package com.flair.bi.view.export;

import com.flair.bi.domain.DateFilterType;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.enumeration.FeatureType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureExportDTO {

	private String name;

	private String type;

	private Long functionId;

	private FeatureType featureType;

	private Boolean favouriteFilter;

	private DateFilterType dateFilter;

	public static FeatureExportDTO from(Feature feature) {
		return new FeatureExportDTO(feature.getName(), feature.getType(), feature.getFunctionId(),
				feature.getFeatureType(), feature.getFavouriteFilter(), feature.getDateFilter());
	}

	public static Feature to(FeatureExportDTO featureExportDTO) {
		Feature feature = new Feature();
		feature.setName(featureExportDTO.getName());
		feature.setType(featureExportDTO.getType());
		feature.setFunctionId(featureExportDTO.getFunctionId());
		feature.setFeatureType(featureExportDTO.getFeatureType());
		feature.setFavouriteFilter(featureExportDTO.getFavouriteFilter());
		feature.setDateFilter(featureExportDTO.getDateFilter());
		return feature;
	}
}
