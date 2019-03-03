package com.flair.bi.web.rest.vm;

import javax.validation.constraints.NotNull;
import java.time.ZonedDateTime;

public class DatasourceVM {

    @NotNull
    private String name;

    @NotNull
    private String queryPath;

    @NotNull
    private ZonedDateTime lastUpdated;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getQueryPath() {
        return queryPath;
    }

    public void setQueryPath(String queryPath) {
        this.queryPath = queryPath;
    }

    public ZonedDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(ZonedDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
