package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.flair.bi.domain.enumeration.InputType;
import com.flair.bi.domain.propertytype.CheckboxPropertyType;
import com.flair.bi.domain.propertytype.ColorPickerPropertyType;
import com.flair.bi.domain.propertytype.NumberPropertyType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.propertytype.SelectPropertyType;
import com.flair.bi.domain.propertytype.TextPropertyType;
import com.flair.bi.service.dto.PropertyTypeDTO;

@Mapper(componentModel = "spring", uses = {})
public interface PropertyTypeMapper {

	@Mapping(source = "type", target = "inputType")
	PropertyTypeDTO propertyTypeToPropertyTypeDTO(PropertyType propertyType);

	List<PropertyTypeDTO> propertyTypesToPropertyTypeDTOs(List<PropertyType> propertyTypes);

	default PropertyType propertyTypeDTOToPropertyType(PropertyTypeDTO propertyTypeDTO) {
		PropertyType propertyType;

		switch (InputType.valueOf(propertyTypeDTO.getInputType())) {
		case TEXT:
			propertyType = new TextPropertyType();
			break;
		case NUMBER:
			propertyType = new NumberPropertyType();
			break;
		case COLOR_PICKER:
			propertyType = new ColorPickerPropertyType();
			break;
		case SELECT:
			propertyType = new SelectPropertyType();
			break;
		case CHECKBOX:
			propertyType = new CheckboxPropertyType();
		default:
			throw new IllegalArgumentException();
		}

		propertyType.setDescription(propertyTypeDTO.getDescription());
		propertyType.setId(propertyTypeDTO.getId());
		propertyType.setName(propertyTypeDTO.getName());
		propertyType.setType(propertyTypeDTO.getInputType());

		return propertyType;
	}

	List<PropertyType> propertyTypeDTOsToPropertyTypes(List<PropertyTypeDTO> propertyTypeDTOS);

}
