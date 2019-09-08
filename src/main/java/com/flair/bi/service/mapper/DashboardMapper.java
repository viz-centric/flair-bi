package com.flair.bi.service.mapper;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.service.dto.DashboardDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface DashboardMapper {

    DashboardDTO dashboardToDashboardDTO(Dashboard dashboard);

    Dashboard dashboardDTOtoDashboard(DashboardDTO dashboardDTO);

    List<Dashboard> dashboardDTOsToDashboards(List<DashboardDTO> dashboardDTOS);

    List<DashboardDTO> dashboardsToDashboardDTOs(List<Dashboard> fieldTypes);
}
