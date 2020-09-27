package com.flair.bi.service.mapper;

import com.flair.bi.domain.Visualization;
import com.flair.bi.service.dto.VisualizationDTO;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Mapper for the entity Visualization and its DTO VisualizationDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface VisualizationMapper {

	VisualizationDTO visualizationToVisualizationDTO(Visualization Visualization);

	List<VisualizationDTO> visualizationToVisualizationDTOs(
			List<Visualization> Visualization);

	Visualization visualizationDTOToVisualization(VisualizationDTO VisualizationDTO);

	List<Visualization> visualizationDTOsToVisualization(
			List<VisualizationDTO> VisualizationDTOs);
}
