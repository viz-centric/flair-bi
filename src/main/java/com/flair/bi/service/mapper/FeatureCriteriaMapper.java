package com.flair.bi.service.mapper;

import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.web.rest.dto.CreateUpdateFeatureCriteriaDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface FeatureCriteriaMapper {

    CreateUpdateFeatureCriteriaDTO featureCriteriaToFeatureCriteriaDTO(FeatureCriteria feature);

    FeatureCriteria featureCriteriaDTOToFeatureCriteria(CreateUpdateFeatureCriteriaDTO featureDTO);

    List<FeatureCriteria> featureCriteriaDTOToFeatureCriteria(List<CreateUpdateFeatureCriteriaDTO> featureDTOS);

    List<CreateUpdateFeatureCriteriaDTO> featureCriteriaToFeatureCriteriaDTO(List<FeatureCriteria> fieldTypes);
}
