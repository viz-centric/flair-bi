package com.flair.bi.config.jackson.mixin;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.ZonedDateTime;

public abstract class AbstractAuditingEntityMixin {

    @JsonIgnore
    abstract String getCreatedBy();

    @JsonIgnore
    abstract ZonedDateTime getCreatedDate();

    @JsonIgnore
    abstract String getLastModifiedBy();

    @JsonIgnore
    abstract ZonedDateTime getLastModifiedDate();
}
