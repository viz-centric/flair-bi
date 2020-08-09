package com.flair.bi.service;

import java.util.Map;

import com.flair.bi.domain.Feature;
import com.flair.bi.service.dto.QueryValidationType;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class QueryValidationParams {
	private final Map<String, Feature> features;
	private final QueryValidationType validationType;
}
