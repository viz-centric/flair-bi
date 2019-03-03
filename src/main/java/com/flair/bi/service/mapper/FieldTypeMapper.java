package com.flair.bi.service.mapper;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.dto.FieldTypeDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface FieldTypeMapper {

    FieldTypeDTO fieldTypeToFieldTypeDTO(FieldType fieldType);

    FieldType fieldTypeDTOToFieldType(FieldTypeDTO fieldTypeDTO);

    List<FieldType> fieldTypeDTOsToFieldTypes(List<FieldTypeDTO> fieldTypeDTOS);

    List<FieldTypeDTO> fieldTypesToFieldTypeDTOs(List<FieldType> fieldTypes);


}
