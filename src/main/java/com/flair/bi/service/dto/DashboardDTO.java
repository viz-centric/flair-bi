package com.flair.bi.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.domain.DashboardRelease;
import com.flair.bi.domain.Datasource;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Data
public class DashboardDTO {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String dashboardName;

    @NotNull
    @Size(max = 20)
    private String category;

    @Size(max = 100)
    private String description;

    @NotNull
    private boolean published;

    @JsonProperty
    private byte[] image;

    private String imageLocation;

    private String imageContentType;

    @NotNull
    private Datasource dashboardDatasource;

    private Set<DashboardRelease> dashboardReleases = new HashSet<>();

    private DashboardRelease currentRelease;

}
