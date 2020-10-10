package com.flair.bi.service.mapper;

import com.flair.bi.domain.Feature;
import com.flair.bi.service.dto.FeatureDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface FeatureMapper {

	@Mapping(target = "datasourceId", source = "datasource.id")
	FeatureDTO featureToFeatureDTO(Feature feature);

	Feature featureDTOtoFeature(FeatureDTO featureDTO);

	List<Feature> featureDTOsToFeatures(List<FeatureDTO> featureDTOS);

	List<FeatureDTO> featuresToFeatureDTOs(List<Feature> fieldTypes);
}
