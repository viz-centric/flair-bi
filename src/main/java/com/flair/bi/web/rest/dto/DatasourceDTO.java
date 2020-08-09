package com.flair.bi.web.rest.dto;

import java.time.ZonedDateTime;
import java.util.Set;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.domain.DatasourceStatus;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.hierarchy.Hierarchy;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DatasourceDTO {

    private Long id;
    private String name;
    private ZonedDateTime lastUpdated;
    private String connectionName;
    private String connectionReadableName;
    private Long connectionId;
    private String queryPath;
    private Set<Dashboard> dashboardSet;
    private Set<Feature> features;
    private Set<Hierarchy> hierarchies;
    private Set<DatasourceConstraint> datasourceConstraints;
    private DatasourceStatus status;
    private String sql;

}
