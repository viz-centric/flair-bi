package com.flair.bi.service.mapper;

import com.flair.bi.domain.*;
import com.flair.bi.service.dto.VisualizationColorsDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity VisualizationColors and its DTO VisualizationColorsDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface VisualizationColorsMapper {

    VisualizationColorsDTO visualizationColorsToVisualizationColorsDTO(VisualizationColors visualizationColors);

    List<VisualizationColorsDTO> visualizationColorsToVisualizationColorsDTOs(List<VisualizationColors> visualizationColors);

    VisualizationColors visualizationColorsDTOToVisualizationColors(VisualizationColorsDTO visualizationColorsDTO);

    List<VisualizationColors> visualizationColorsDTOsToVisualizationColors(List<VisualizationColorsDTO> visualizationColorsDTOs);
}
