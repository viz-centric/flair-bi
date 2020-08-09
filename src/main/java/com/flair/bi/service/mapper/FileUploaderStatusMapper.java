package com.flair.bi.service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.flair.bi.domain.FileUploaderStatus;
import com.flair.bi.service.dto.FileUploaderStatusDTO;

/**
 * Mapper for the entity FileUploaderStatus and its DTO FileUploaderStatusDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface FileUploaderStatusMapper {

	FileUploaderStatusDTO fileUploaderStatusToFileUploaderStatusDTO(FileUploaderStatus fileUploaderStatus);

	List<FileUploaderStatusDTO> fileUploaderStatusesToFileUploaderStatusDTOs(
			List<FileUploaderStatus> fileUploaderStatuses);

	FileUploaderStatus fileUploaderStatusDTOToFileUploaderStatus(FileUploaderStatusDTO fileUploaderStatusDTO);

	List<FileUploaderStatus> fileUploaderStatusDTOsToFileUploaderStatuses(
			List<FileUploaderStatusDTO> fileUploaderStatusDTOs);
}
