package com.flair.bi.service.cache;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Feature;
import com.flair.bi.service.FeatureService;
import com.flair.bi.service.GrpcQueryService;
import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.QueryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshFeatureCacheService {

    private final GrpcQueryService grpcQueryService;
    private final FeatureService featureService;

    public void refresh() {
        List<Feature> cacheableFeatures = featureService.getCacheableFeatures();
        Map<Datasource, List<Feature>> featureMap = cacheableFeatures
                .stream()
                .collect(Collectors.groupingBy(feature -> feature.getDatasource()));

        featureMap
                .forEach((datasource, featureList)  -> queryFeaturesForDatasource(datasource, featureList));
    }

    private void queryFeaturesForDatasource(Datasource datasource, List<Feature> featureList) {
        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setFields(featureList.stream().map(f -> new FieldDTO(f.getName())).collect(Collectors.toList()));
        queryDTO.setDistinct(true);
        grpcQueryService.sendRunQuery(queryDTO, datasource);
    }

}
