package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QDashboard;
import com.flair.bi.domain.QFeature;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.FeatureService;
import com.flair.bi.service.FeatureValidationResult;
import com.flair.bi.service.dto.FeatureDTO;
import com.flair.bi.service.dto.FeatureListDTO;
import com.flair.bi.service.mapper.FeatureMapper;
import com.flair.bi.web.rest.params.FeatureRequestParams;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.querydsl.core.types.Predicate;
import com.querydsl.jpa.JPAExpressions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class FeatureResource {

    private final FeatureService featureService;
    private final FeatureMapper featureMapper;
    private final DatasourceService datasourceService;

    @GetMapping("/features")
    @Timed
    public ResponseEntity<List<FeatureDTO>> getFeatures(@QuerydslPredicate(root = Feature.class) Predicate predicate, FeatureRequestParams featureRequestParams) {
        Predicate pred = Optional.ofNullable(featureRequestParams.getView())
                .map(x -> QFeature.feature.datasource.eqAny(JPAExpressions.select(QDashboard.dashboard.dashboardDatasource).from(QDashboard.dashboard)
                        .where(QDashboard.dashboard.dashboardViews.any().id.eq(x))))
                .map(y -> (Predicate) y.and(predicate))
                .orElse(predicate
                );
        return ResponseEntity.ok(featureMapper.featuresToFeatureDTOs(featureService.getFeatures(pred)));
    }

    /**
     * PUT  /feature : Updates an existing feature.
     *
     * @param feature the feature to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated feature,
     * or with status 400 (Bad Request) if the feature is not valid,
     * or with status 500 (Internal Server Error) if the feature couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/features")
    @Timed
    public ResponseEntity<?> updateFeature(@Valid @RequestBody FeatureDTO feature) throws URISyntaxException {
        log.debug("REST request to update Feature : {}", feature);
        if (feature.getId() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Feature result = featureService.getOne(feature.getId());

        if (null == result) {
            return ResponseEntity.notFound().build();
        }

        result.setDefinition(feature.getDefinition());
        result.setFeatureType(feature.getFeatureType());
        result.setType(feature.getType());
        result.setName(feature.getName());
        result.setFunctionId(feature.getFunctionId());

        FeatureValidationResult validate = featureService.validate(result);
        if (validate != FeatureValidationResult.OK) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert("feature", "feature." + validate.name().toLowerCase(), "Error"))
                    .body(validate);
        }

        result = featureService.save(result);

        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("features", feature.getId().toString()))
                .body(result);
    }

    /**
     * DELETE  /features/:id : delete the "id" feature.
     *
     * @param id the id of the feature to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/features/{id}")
    @Timed
    public ResponseEntity<Void> deleteFeature(@PathVariable Long id) {
        log.debug("REST request to delete Feature : {}", id);
        featureService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("features", id.toString())).build();
    }

    /**
     * POST  /features : Create a new features.
     *
     * @param feature the features to create
     * @return the ResponseEntity with status 201 (Created) and with body the new features, or with status 400 (Bad Request) if the features has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/features")
    @Timed
    public ResponseEntity<?> createFeatures(@Valid @RequestBody Feature feature) throws URISyntaxException {
        log.debug("REST request to save feature : {}", feature);
        if (feature.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("features  ", "idexists", "A new features cannot already have an ID")).body(null);
        }
        FeatureValidationResult validate = featureService.validate(feature);
        if (validate != FeatureValidationResult.OK) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert("feature", "feature." + validate.name().toLowerCase(), "Error"))
                    .body(validate);
        }
        Feature result = featureService.save(feature);
        return ResponseEntity.created(new URI("/api/features/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("features", result.getId().toString()))
                .body(result);
    }

    /**
     * POST  /features/list : Create a new features.
     *
     * @param featureListDTO the features to create in bulk
     * @return the ResponseEntity with status 201 (Created) and with body the new features
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/features/list")
    @Timed
    public ResponseEntity<?> createFeatures(@Valid @RequestBody FeatureListDTO featureListDTO) throws URISyntaxException {
        log.debug("REST request to save feature : {}", featureListDTO);
        Datasource datasource = datasourceService.findOne(featureListDTO.getDatasourceId());
        Set<String> existingFeatureNames = featureService.getFeatures(QFeature.feature.datasource.eq(datasource))
                .stream()
                .map(f -> f.getName())
                .collect(Collectors.toSet());
        List<Feature> features = featureListDTO.getFeatureList()
                .stream()
                .filter(item -> item.getIsSelected())
                .filter(item -> !existingFeatureNames.contains(item.getName()))
                .map(featureDTO -> {
                    Feature feature = new Feature();
                    feature.setFeatureType(featureDTO.getFeatureType());
                    feature.setDefinition(featureDTO.getName());
                    feature.setName(featureDTO.getName());
                    feature.setType(featureDTO.getType());
                    feature.setFunctionId(featureDTO.getFunctionId());
                    feature.setDatasource(datasource);
                    return feature;
                })
                .collect(toList());
        List<FeatureValidationResult> validate = featureService.validate(features);
        List<FeatureValidationResult> errorFeatures = validate.stream()
                .filter(r -> r != FeatureValidationResult.OK)
                .collect(toList());
        if (errorFeatures.size() > 0) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert("feature", "feature." + errorFeatures.get(0).name().toLowerCase(), "Error"))
                    .body(validate);
        }
        featureService.save(features);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    /**
     * PUT  /feature : Updates an existing feature.
     *
     * @param markFavouriteFilter,id the feature to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated feature,
     * or with status 400 (Bad Request) if the feature is not valid,
     * or with status 500 (Internal Server Error) if the feature couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/features/markFavouriteFilter/")
    @Timed
    public ResponseEntity<?> markFavouriteFilter(@RequestParam  Boolean favouriteFilter, @RequestParam Long id) throws URISyntaxException {
        log.debug("REST request to mark favourite filter : {}", favouriteFilter,id);
        featureService.markFavouriteFilter(favouriteFilter,id);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("features", id.toString()))
                .body(null);
    }

}
