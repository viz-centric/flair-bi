package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.service.dto.HierarchyDTO;

@Mapper(componentModel = "spring", uses = {})
public interface HierarchyMapper {

    HierarchyDTO hierarchyToHierarchyDTO(Hierarchy hierarchy);

    Hierarchy hierarchyDTOtoHierarchy(HierarchyDTO hierarchyDTO);

    List<Hierarchy> hierarchyDTOsToHierarchies(List<HierarchyDTO> hierarchyDTOList);

    List<HierarchyDTO> hierarchiesToHierarchyDTOs(List<Hierarchy> hierarchyList);
}
