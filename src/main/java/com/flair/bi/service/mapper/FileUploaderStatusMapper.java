package com.flair.bi.service.mapper;

import com.flair.bi.domain.*;
import com.flair.bi.service.dto.FileUploaderStatusDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity FileUploaderStatus and its DTO FileUploaderStatusDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface FileUploaderStatusMapper {

    FileUploaderStatusDTO fileUploaderStatusToFileUploaderStatusDTO(FileUploaderStatus fileUploaderStatus);

    List<FileUploaderStatusDTO> fileUploaderStatusesToFileUploaderStatusDTOs(List<FileUploaderStatus> fileUploaderStatuses);

    FileUploaderStatus fileUploaderStatusDTOToFileUploaderStatus(FileUploaderStatusDTO fileUploaderStatusDTO);

    List<FileUploaderStatus> fileUploaderStatusDTOsToFileUploaderStatuses(List<FileUploaderStatusDTO> fileUploaderStatusDTOs);
}
