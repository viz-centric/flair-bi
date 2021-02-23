package com.flair.bi.service.impl;

import com.flair.bi.domain.QVisualizationColors;
import com.flair.bi.domain.User;
import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.repository.VisualizationColorsRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.service.VisualizationColorsService;
import com.flair.bi.service.dto.VisualizationColorsDTO;
import com.flair.bi.service.mapper.VisualizationColorsMapper;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing VisualizationColors.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VisualizationColorsServiceImpl implements VisualizationColorsService {

	private final VisualizationColorsRepository visualizationColorsRepository;

	private final VisualizationColorsMapper visualizationColorsMapper;

	private final UserService userService;

	/**
	 * Save a visualizationColors.
	 *
	 * @param visualizationColorsDTO the entity to save
	 * @return the persisted entity
	 */
	public VisualizationColorsDTO save(VisualizationColorsDTO visualizationColorsDTO) {
		log.debug("Request to save VisualizationColors : {}", visualizationColorsDTO);
		VisualizationColors visualizationColors = visualizationColorsMapper
				.visualizationColorsDTOToVisualizationColors(visualizationColorsDTO);
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		if (visualizationColors.getId() == null) {
			visualizationColors.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
		} else {
			if (!Objects.equals(visualizationColors.getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
				throw new IllegalStateException("Cannot save visualization colors for realm " + visualizationColors.getRealm().getId());
			}
		}
		visualizationColors = visualizationColorsRepository.save(visualizationColors);
		VisualizationColorsDTO result = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(visualizationColors);
		return result;
	}

	/**
	 * Get all the visualizationColors.
	 * 
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<VisualizationColorsDTO> findAll() {
		log.debug("Request to get all VisualizationColors");
		final Sort sort = Sort.by(Sort.Direction.ASC, "id");
		List<VisualizationColorsDTO> result = ImmutableList.copyOf(visualizationColorsRepository.findAll(hasUserRealmAccess(), sort))
				.stream()
				.map(visualizationColorsMapper::visualizationColorsToVisualizationColorsDTO)
				.collect(Collectors.toCollection(LinkedList::new));

		return result;
	}

	/**
	 * Get one visualizationColors by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public VisualizationColorsDTO findOne(Long id) {
		log.debug("Request to get VisualizationColors : {}", id);
		VisualizationColors visualizationColors = findById(id);
		VisualizationColorsDTO visualizationColorsDTO = visualizationColorsMapper
				.visualizationColorsToVisualizationColorsDTO(visualizationColors);
		return visualizationColorsDTO;
	}

	private VisualizationColors findById(Long id) {
		return visualizationColorsRepository.findOne(hasUserRealmAccess().eq(QVisualizationColors.visualizationColors.id.eq(id)))
				.orElseThrow();
	}

	/**
	 * Delete the visualizationColors by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete VisualizationColors : {}", id);
		VisualizationColors visualizationColors = findById(id);
		visualizationColorsRepository.delete(visualizationColors);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	@Override
	public void saveAll(List<VisualizationColors> colors) {
		visualizationColorsRepository.saveAll(colors);
	}

	@Override
	public void deleteAllByRealmId(Long realmId) {
		visualizationColorsRepository.deleteAllByRealmId(realmId);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'READ', 'APPLICATION')")
	@Transactional(readOnly = true)
	@Override
	public List<VisualizationColors> findByRealmId(Long realmId) {
		return visualizationColorsRepository.findByRealmId(realmId);
	}

	private BooleanExpression hasUserRealmAccess() {
		return QVisualizationColors.visualizationColors.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
