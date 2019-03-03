package com.flair.bi.service.mapper;

import com.flair.bi.domain.*;
import com.flair.bi.service.dto.FunctionsDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity Functions and its DTO FunctionsDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface FunctionsMapper {

    FunctionsDTO functionsToFunctionsDTO(Functions functions);

    List<FunctionsDTO> functionsToFunctionsDTOs(List<Functions> functions);

    Functions functionsDTOToFunctions(FunctionsDTO functionsDTO);

    List<Functions> functionsDTOsToFunctions(List<FunctionsDTO> functionsDTOs);
}
