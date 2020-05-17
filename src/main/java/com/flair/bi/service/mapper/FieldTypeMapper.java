package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.dto.FieldTypeDTO;

@Mapper(componentModel = "spring", uses = {})
public interface FieldTypeMapper {

    FieldTypeDTO fieldTypeToFieldTypeDTO(FieldType fieldType);

    FieldType fieldTypeDTOToFieldType(FieldTypeDTO fieldTypeDTO);

    List<FieldType> fieldTypeDTOsToFieldTypes(List<FieldTypeDTO> fieldTypeDTOS);

    List<FieldTypeDTO> fieldTypesToFieldTypeDTOs(List<FieldType> fieldTypes);


}
