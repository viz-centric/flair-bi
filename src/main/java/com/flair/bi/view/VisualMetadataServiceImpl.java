package com.flair.bi.view;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import com.flair.bi.domain.listeners.VisualMetadataListener;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing VisualMetadata.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
class VisualMetadataServiceImpl implements VisualMetadataService {

	private final ViewService viewService;

	private final IViewStateRepository viewStateCouchDbRepository;

	/**
	 * Save a visualMetadata.
	 *
	 * @param visualMetadata the entity to save
	 * @return the persisted entity
	 */
	@Override
	public VisualMetadata save(Long viewId, VisualMetadata visualMetadata) {
		log.debug("Request to save VisualMetadata : {}", visualMetadata);
		boolean create = null == visualMetadata.getId();
		VisualMetadataListener.addParents(visualMetadata);

		View view = viewService.findOne(viewId);

		ViewState currentEditingViewState = viewStateCouchDbRepository.get(view.getCurrentEditingState().getId());
		view.setCurrentEditingState(currentEditingViewState);

		if (create) {
			// we want to append parents id to visualMetadata for faster lookup
			visualMetadata.setId(
					VisualMetadata.constructId(UUID.randomUUID().toString(), view.getCurrentEditingState().getId()));
			view.getCurrentEditingState().getVisualMetadataSet().add(visualMetadata);
			viewStateCouchDbRepository.update(view.getCurrentEditingState());
		} else {
			// remove from list and add again
			Set<VisualMetadata> vm = view.getCurrentEditingState().getVisualMetadataSet().stream()
					.filter(x -> !x.getId().equalsIgnoreCase(visualMetadata.getId())).collect(Collectors.toSet());

			vm.add(visualMetadata);
			view.getCurrentEditingState().setVisualMetadataSet(vm);
			viewStateCouchDbRepository.update(view.getCurrentEditingState());
		}

		return visualMetadata;
	}

	/**
	 * Retrieve all visual metadata that user has an access to
	 *
	 * @param viewId identifier of the view
	 * @return collection of visual metadata
	 */
	@Override
	public List<VisualMetadata> findAllByPrincipalPermissionsByViewId(Serializable viewId) {
		View view = viewService.findOne(Long.parseLong(viewId.toString()));
		return new ArrayList<>(
				viewStateCouchDbRepository.get(view.getCurrentEditingState().getId()).getVisualMetadataSet());
	}

	/**
	 * Get one visualmetadata by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Override
	public VisualMetadata findOne(String id) {
		String parentId = VisualMetadata.getParentId(id);
		ViewState viewState = viewStateCouchDbRepository.get(parentId);

		List<VisualMetadata> vm = viewState.getVisualMetadataSet().stream().filter(x -> x.getId().equalsIgnoreCase(id))
				.collect(Collectors.toList());

		if (vm.size() == 1) {
			return vm.get(0);
		} else {
			throw new EntityNotFoundException("Does not exists");
		}
	}

	/**
	 * Delete the visualmetadata by id.
	 *
	 * @param id the id of the entity
	 */
	@Override
	public void delete(String id) {
		String parentId = VisualMetadata.getParentId(id);

		ViewState viewState = viewStateCouchDbRepository.get(parentId);

		final Optional<View> viewOpt = viewService.findViewCurrentEditingStateId(viewState.getId());
		viewOpt.ifPresent(view -> {
			view.setCurrentEditingState(viewState);

			Set<VisualMetadata> vm = view.getCurrentEditingState().getVisualMetadataSet().stream()
					.filter(x -> !x.getId().equalsIgnoreCase(id)).collect(Collectors.toSet());
			view.getCurrentEditingState().setVisualMetadataSet(vm);
			viewStateCouchDbRepository.update(view.getCurrentEditingState());
		});
	}

}
