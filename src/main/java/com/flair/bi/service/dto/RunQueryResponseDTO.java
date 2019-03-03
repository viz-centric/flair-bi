package com.flair.bi.service.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Map;

@Data
@Accessors(chain = true)
public class RunQueryResponseDTO {

    private Map<String, Object> result;

}
