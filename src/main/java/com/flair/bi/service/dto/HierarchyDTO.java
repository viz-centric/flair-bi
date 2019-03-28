package com.flair.bi.service.dto;

import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

public class HierarchyDTO {

    private Long id;

    @NotNull
    private String name;

    private Set<DrilldownDTO> drilldown = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<DrilldownDTO> getDrilldown() {
        return drilldown;
    }

    public void setDrilldown(Set<DrilldownDTO> drilldown) {
        this.drilldown = drilldown;
    }
}
