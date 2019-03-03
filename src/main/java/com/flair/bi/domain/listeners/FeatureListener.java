package com.flair.bi.domain.listeners;

import com.flair.bi.domain.Feature;

import javax.persistence.PreRemove;

public class FeatureListener {

    @PreRemove
    public void preDestroy(Feature feature) {
        feature.clearFields();
    }
}
