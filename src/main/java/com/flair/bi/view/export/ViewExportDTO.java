package com.flair.bi.view.export;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.Base64Utils;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

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
						.map(ViewFeatureCriteriaExportDTO::from).collect(toSet()));
	}

	public static View to(ViewExportDTO viewExportDTO) {
		View view = new View();
		view.setViewName(viewExportDTO.getName());
		view.setDescription(viewExportDTO.getDescription());
		view.setImage(Optional.ofNullable(viewExportDTO.getImage()).map(Base64Utils::decodeFromString).orElse(null));
		view.setCurrentEditingState(viewExportDTO.getEditState());
		view.setViewFeatureCriterias(Optional.ofNullable(viewExportDTO.getCriterias())
				.map(criterias -> criterias.stream().map(ViewFeatureCriteriaExportDTO::to).collect(toSet()))
				.orElse(null));
		return view;
	}
}