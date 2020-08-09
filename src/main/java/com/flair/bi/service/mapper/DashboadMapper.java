package com.flair.bi.service.mapper;

import org.mapstruct.Mapper;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.web.rest.dto.DashboardDTO;

@Mapper(componentModel = "spring", uses = {})
public interface DashboadMapper extends BaseMapper<DashboardDTO, Dashboard> {

}
