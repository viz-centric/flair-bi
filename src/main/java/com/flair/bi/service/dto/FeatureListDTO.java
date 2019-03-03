/**
 * 
 */
package com.flair.bi.service.dto;

import java.util.List;

public class FeatureListDTO {
	
	private Long datasourceId;
	private List<FeatureDTO> featureList;
	
	public FeatureListDTO(){}

	public Long getDatasourceId() {
		return datasourceId;
	}

	public void setDatasourceId(Long datasourceId) {
		this.datasourceId = datasourceId;
	}

	public List<FeatureDTO> getFeatureList() {
		return featureList;
	}

	public void setFeatureList(List<FeatureDTO> featureList) {
		this.featureList = featureList;
	}

	@Override
	public String toString() {
		return "FeatureListDTO [datasourceId=" + datasourceId + ", featureList=" + featureList + "]";
	}
	
	
	
	

}
