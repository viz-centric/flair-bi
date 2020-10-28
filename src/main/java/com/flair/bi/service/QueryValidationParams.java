package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.service.dto.QueryValidationType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Builder
@Data
public class QueryValidationParams {
	private final Map<String, Feature> features;
	private final QueryValidationType validationType;
	private final List<Long> restrictedFeatureIds;
}
