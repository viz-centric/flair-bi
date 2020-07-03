package com.flair.bi.service.dto;

import com.flair.bi.web.rest.dto.RealmDTO;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
public class FunctionsDTO implements Serializable {

	private Long id;

	private String name;

	private String description;

	private String value;

	private Boolean dimensionUse;

	private Boolean measureUse;

	private String validation;

    private RealmDTO real;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

		FunctionsDTO functionsDTO = (FunctionsDTO) o;

		if (!Objects.equals(id, functionsDTO.id))
			return false;

		return true;
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(id);
	}

}
