package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.web.rest.dto.ReleaseRequestDTO;

@Mapper(componentModel = "spring", uses = {})
public interface ReleaseRequestMapper {

	ReleaseRequestDTO releaseRequestToReleaseRequestDTO(ReleaseRequest releaseRequest);

	ReleaseRequest releaseRequestDTOToReleaseRequest(ReleaseRequestDTO releaseRequestDTO);

	List<ReleaseRequest> releaseRequestDTOsToReleaseRequests(List<ReleaseRequestDTO> releaseRequestDTOList);

	List<ReleaseRequestDTO> releaseRequestsToReleaseRequestDTOs(List<ReleaseRequest> releaseRequests);

}
