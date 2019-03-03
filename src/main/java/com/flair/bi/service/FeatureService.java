package com.flair.bi.service;

import com.flair.bi.domain.Feature;
import com.flair.bi.repository.FeatureRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureService {

    private final FeatureRepository featureRepository;

    @Transactional(readOnly = true)
    public List<Feature> getFeatures(Predicate predicate) {
        log.debug("Attempt to retrieve features with predicate {}", predicate);
        return (List<Feature>) featureRepository.findAll(predicate);
    }

    @Transactional(readOnly = true)
    public Feature getOne(Long id) {
        log.debug("Attempt to retrieve feature with id: {}", id);
        return featureRepository.getOne(id);
    }

    public Feature save(Feature feature) {
        log.debug("Saving feature {}", feature);
        return featureRepository.save(feature);
    }

    public void delete(Long id) {
        log.debug("Attempt to delete feature with id {}", id);
        featureRepository.delete(id);
    }
    
    
    public void save(List<Feature> features) {
        log.debug("Saving feature {}", features);
    	featureRepository.save(features);
   }


}
