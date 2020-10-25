package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Data
public class QueryTransformerPayload {
    private final Map<String, Feature> features;
    private final List<Long> restrictedFeatureIds;
}
