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

import static java.util.Arrays.asList;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshFeatureCacheService {

    private final GrpcQueryService grpcQueryService;
    private final FeatureService featureService;

    public void refresh() {
        List<Feature> cacheableFeatures = featureService.getCacheableFeatures();
        cacheableFeatures.forEach(feature -> queryFeaturesForDatasource(feature.getDatasource(), feature));
    }

    private void queryFeaturesForDatasource(Datasource datasource, Feature feature) {
        QueryDTO queryDTO = new QueryDTO();
        queryDTO.setFields(asList(new FieldDTO(feature.getName())));
        queryDTO.setDistinct(true);
        grpcQueryService.sendRunQuery(queryDTO, datasource);
    }

}
