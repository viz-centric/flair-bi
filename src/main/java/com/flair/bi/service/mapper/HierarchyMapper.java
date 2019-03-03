package com.flair.bi.service.mapper;

import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.service.dto.HierarchyDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface HierarchyMapper {

    HierarchyDTO hierarchyToHierarchyDTO(Hierarchy hierarchy);

    Hierarchy hierarchyDTOtoHierarchy(HierarchyDTO hierarchyDTO);

    List<Hierarchy> hierarchyDTOsToHierarchies(List<HierarchyDTO> hierarchyDTOList);

    List<HierarchyDTO> hierarchiesToHierarchyDTOs(List<Hierarchy> hierarchyList);
}
