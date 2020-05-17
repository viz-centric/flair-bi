package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.flair.bi.domain.Feature;
import com.flair.bi.service.dto.FeatureDTO;

@Mapper(componentModel = "spring", uses = {})
public interface FeatureMapper {

    FeatureDTO featureToFeatureDTO(Feature feature);

    Feature featureDTOtoFeature(FeatureDTO featureDTO);

    List<Feature> featureDTOsToFeatures(List<FeatureDTO> featureDTOS);

    List<FeatureDTO> featuresToFeatureDTOs(List<Feature> fieldTypes);
}
