package com.flair.bi.service.impl;

import com.flair.bi.domain.Functions;
import com.flair.bi.domain.QFunctions;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FunctionsRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.FunctionsService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.dto.FunctionsDTO;
import com.flair.bi.service.mapper.FunctionsMapper;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Functions.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FunctionsServiceImpl implements FunctionsService {

	private final FunctionsRepository functionsRepository;

	private final FunctionsMapper functionsMapper;

	private final UserService userService;

	/**
	 * Save a functions.
	 *
	 * @param functionsDTO the entity to save
	 * @return the persisted entity
	 */
	public FunctionsDTO save(FunctionsDTO functionsDTO) {
		log.debug("Request to save Functions : {}", functionsDTO);
		Functions functions = functionsMapper.functionsDTOToFunctions(functionsDTO);
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		if (functions.getId() == null) {
			functions.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
		} else {
			if (!Objects.equals(functions.getRealm().getId(), SecurityUtils.getUserAuth().getRealmId())) {
				throw new IllegalStateException("Cannot save function for realm " + functions.getRealm().getId());
			}
		}
		functions = functionsRepository.save(functions);
		return functionsMapper.functionsToFunctionsDTO(functions);
	}

	/**
	 * Get all the functions.
	 * 
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<FunctionsDTO> findAll() {
		log.debug("Request to get all Functions");
		List<FunctionsDTO> result = ImmutableList.copyOf(functionsRepository.findAll(hasUserRealmAccess()))
				.stream()
				.map(functionsMapper::functionsToFunctionsDTO)
				.collect(Collectors.toCollection(LinkedList::new));

		return result;
	}

	/**
	 * Get one functions by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public FunctionsDTO findOne(Long id) {
		log.debug("Request to get Functions : {}", id);
		Functions functions = findById(id);
		return functionsMapper.functionsToFunctionsDTO(functions);
	}

	private Functions findById(Long id) {
		return functionsRepository.findOne(QFunctions.functions.id.eq(id).and(hasUserRealmAccess())).orElseThrow();
	}

	/**
	 * Delete the functions by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete Functions : {}", id);
		Functions functions = findById(id);
		functionsRepository.delete(functions);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
	@Override
	public void saveAll(List<Functions> functions) {
		functionsRepository.saveAll(functions);
	}

	@Override
	public void deleteAllByRealmId(Long realmId) {
		functionsRepository.deleteAllByRealmId(realmId);
	}

	@Transactional(readOnly = true)
	@Override
	public List<Functions> findByRealmId(Long realmId) {
		if (!Objects.equals(realmId, SecurityUtils.getUserAuth().getRealmId())) {
			throw new IllegalStateException("Cannot access realm " + realmId + " from realm " + SecurityUtils.getUserAuth().getRealmId());
		}
		return functionsRepository.findByRealmId(realmId);
	}

	@PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'READ', 'APPLICATION')")
	@Transactional(readOnly = true)
	public List<Functions> findByRealmIdAsRealmManager(Long realmId) {
		return functionsRepository.findByRealmId(realmId);
	}

	private BooleanExpression hasUserRealmAccess() {
		return QFunctions.functions.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
	}
}
