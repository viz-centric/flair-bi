package com.flair.bi.service.dto;

import com.flair.bi.domain.VisualizationPropertyType;
import com.flair.bi.domain.fieldtype.FieldType;
import lombok.Data;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Data
public class VisualizationDTO implements Serializable {

	private Long id;

	private String name;

	private String icon;

	private Integer customId;

	private String functionname;

	private Set<FieldType> fieldTypes = new HashSet<>();

	private Set<VisualizationPropertyType> propertyTypes = new HashSet<>();

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}

		VisualizationDTO dto = (VisualizationDTO) o;

		if (!Objects.equals(id, dto.id))
			return false;

		return true;
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

}
