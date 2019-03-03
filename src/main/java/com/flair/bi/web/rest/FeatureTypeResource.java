package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.enumeration.FeatureType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class FeatureTypeResource {

    @GetMapping("/featureTypes")
    @Timed
    public List<String> getAllFeatureTypes() {
        return Arrays.stream(FeatureType.values()).map(FeatureType::getValue).collect(Collectors.toList());
    }
}
