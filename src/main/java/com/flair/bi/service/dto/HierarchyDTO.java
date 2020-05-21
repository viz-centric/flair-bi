package com.flair.bi.service.dto;

import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.NotNull;

import com.flair.bi.domain.hierarchy.Drilldown;

public class HierarchyDTO {

	private Long id;

	@NotNull
	private String name;

	private Set<Drilldown> drilldown = new HashSet<>();

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

	public Set<Drilldown> getDrilldown() {
		return drilldown;
	}

	public void setDrilldown(Set<Drilldown> drilldown) {
		this.drilldown = drilldown;
	}
}
