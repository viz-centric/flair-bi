package com.flair.bi.service.dto;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A DTO for the VisualizationColors entity.
 */
public class VisualizationColorsDTO implements Serializable {

    private Long id;

    @NotNull
    private String code;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        VisualizationColorsDTO visualizationColorsDTO = (VisualizationColorsDTO) o;

        if ( ! Objects.equals(id, visualizationColorsDTO.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "VisualizationColorsDTO{" +
            "id=" + id +
            ", code='" + code + "'" +
            '}';
    }
}
