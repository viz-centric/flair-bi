package com.flair.bi.service.dto;

import com.flair.bi.domain.enumeration.FeatureType;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class FeatureDTO {

    private Long id;

    @NotNull
    @Size(max = 40)
    private String name;

    @NotNull
    @Size(max = 40)
    private String type;

    @NotNull
    private String definition;
    @NotNull
    private FeatureType featureType;
    
    private Boolean isSelected;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public FeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(FeatureType featureType) {
        this.featureType = featureType;
    }

	public Boolean getIsSelected() {
		return isSelected;
	}

	public void setIsSelected(Boolean isSelected) {
		this.isSelected = isSelected;
	}

	@Override
	public String toString() {
		return "FeatureDTO [id=" + id + ", name=" + name + ", type=" + type + ", definition=" + definition
				+ ", featureType=" + featureType + ", isSelected=" + isSelected + "]";
	}
    
	
    
}
