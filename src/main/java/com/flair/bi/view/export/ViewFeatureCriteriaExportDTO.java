package com.flair.bi.view.export;

import com.flair.bi.domain.ViewFeatureCriteria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViewFeatureCriteriaExportDTO {

	private String value;
	private String metadata;
	private FeatureExportDTO feature;

	public static ViewFeatureCriteriaExportDTO from(ViewFeatureCriteria criteria) {
		return new ViewFeatureCriteriaExportDTO(criteria.getValue(), criteria.getMetadata(),
				FeatureExportDTO.from(criteria.getFeature()));
	}

	public static ViewFeatureCriteria to(ViewFeatureCriteriaExportDTO criteria) {
		ViewFeatureCriteria viewFeatureCriteria = new ViewFeatureCriteria();
		viewFeatureCriteria.setValue(criteria.getValue());
		viewFeatureCriteria.setMetadata(criteria.getMetadata());
		viewFeatureCriteria.setFeature(Optional.ofNullable(criteria.getFeature()).map(FeatureExportDTO::to).orElse(null));
		return viewFeatureCriteria;
	}

}
