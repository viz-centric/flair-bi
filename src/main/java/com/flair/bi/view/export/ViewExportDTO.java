package com.flair.bi.view.export;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.util.Base64Utils;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViewExportDTO {

	private String name;
	private String description;
	private String image;
	private ViewState editState;
	private Set<ViewFeatureCriteriaExportDTO> criterias = new HashSet<>();

	public static ViewExportDTO from(View view) {
		return new ViewExportDTO(view.getViewName(), view.getDescription(),
				Optional.ofNullable(view.getImage()).map(Base64Utils::encodeToString).orElse(null),
				view.getCurrentEditingState(), view.getViewFeatureCriterias().stream()
						.map(ViewFeatureCriteriaExportDTO::from).collect(Collectors.toSet()));
	}
}