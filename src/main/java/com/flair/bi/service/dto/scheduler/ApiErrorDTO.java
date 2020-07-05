package com.flair.bi.service.dto.scheduler;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiErrorDTO {
	private final String message;
}
