package com.flair.bi.domain;

import com.flair.bi.domain.visualmetadata.VisualMetadata;

import javax.persistence.Embeddable;

/**
 * Dashboard properties of {@link VisualMetadata}
 */
@Embeddable
public class DashboardProperties {

    private String dashboardName;
    private String viewName;
    private String buildUrl;

    public String getDashboardName() {
        return dashboardName;
    }

    public void setDashboardName(String dashboardName) {
        this.dashboardName = dashboardName;
    }

    public String getViewName() {
        return viewName;
    }

    public void setViewName(String viewName) {
        this.viewName = viewName;
    }

    public String getBuildUrl() {
        return buildUrl;
    }

    public void setBuildUrl(String buildUrl) {
        this.buildUrl = buildUrl;
    }
}
