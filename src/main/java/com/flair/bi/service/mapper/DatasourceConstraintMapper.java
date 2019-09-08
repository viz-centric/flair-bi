package com.flair.bi.service.mapper;

import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.service.dto.DatasourceConstraintDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface DatasourceConstraintMapper {

    DatasourceConstraintDTO datasourceConstraintToDatasourceConstraintDTO(DatasourceConstraint datasourceConstraint);

    DatasourceConstraint datasourceConstraintDTOtoDatasourceConstraint(DatasourceConstraintDTO datasourceConstraintDTO);

    List<DatasourceConstraint> datasourceConstraintDTOsToDatasourceConstraints(List<DatasourceConstraintDTO> datasourceConstraintDTOS);

    List<DatasourceConstraintDTO> datasourceConstraintsToDatasourceConstraintDTOs(List<DatasourceConstraint> fieldTypes);

}
