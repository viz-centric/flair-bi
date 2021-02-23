package com.flair.bi.service;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.QFeatureBookmark;
import com.flair.bi.domain.User;
import com.flair.bi.repository.FeatureBookmarkRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing FeatureBookmark.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FeatureBookmarkService {

	private final FeatureBookmarkRepository featureBookmarkRepository;

	private final UserService userService;

	private final BookMarkWatchService bookMarkWatchService;

	/**
	 * Save a featureBookmark.
	 *
	 * @param featureBookmark the entity to save
	 * @return the persisted entity
	 */
	public FeatureBookmark save(FeatureBookmark featureBookmark) {
		log.debug("Request to save FeatureBookmark : {}", featureBookmark);

		if (featureBookmark.getId() != null) {
			// so we want only to be able to update name on update
			return Optional.ofNullable(findOne(featureBookmark.getId())).map(x -> {
				x.setName(featureBookmark.getName());
				return x;
			}).map(featureBookmarkRepository::save).orElseThrow(EntityNotFoundException::new);
		} else {
			return userService.getUserByLogin(SecurityUtils.getCurrentUserLogin()).map(x -> {
				featureBookmark.setUser(x);
				if (featureBookmark.getFeatureCriteria() != null) {
					featureBookmark.getFeatureCriteria().forEach(y -> y.setFeatureBookmark(featureBookmark));
				}
				return featureBookmark;
			}).map(featureBookmarkRepository::save).orElseThrow(EntityNotFoundException::new);
		}

	}

	/**
	 * Get all the featureBookmarks.
	 *
	 * @param predicate predicate
	 * @return the list of entities
	 */
	@Transactional(readOnly = true)
	public List<FeatureBookmark> findAll(Predicate predicate) {
		log.debug("Request to get all FeatureBookmarks");
		return (List<FeatureBookmark>) featureBookmarkRepository.findAll(new BooleanBuilder(predicate)
				.and(QFeatureBookmark.featureBookmark.user.login.eq(SecurityUtils.getCurrentUserLogin()))
				.and(hasRealmPermissions()));
	}

	/**
	 * Get one featureBookmark by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	@Transactional(readOnly = true)
	public FeatureBookmark findOne(Long id) {
		log.debug("Request to get FeatureBookmark : {}", id);
		return featureBookmarkRepository.findOne(hasRealmPermissions().and(QFeatureBookmark.featureBookmark.id.eq(id))).orElseThrow();
	}

	/**
	 * Delete the featureBookmark by id.
	 *
	 * @param id the id of the entity
	 */
	public void delete(Long id) {
		log.debug("Request to delete FeatureBookmark : {}", id);
		FeatureBookmark bookmark = findOne(id);
		bookMarkWatchService.deleteBookmarkWatchesByBookmarkId(id);
		featureBookmarkRepository.delete(bookmark);
	}

	private BooleanExpression hasRealmPermissions() {
		User user = userService.getUserWithAuthoritiesByLoginOrError();
		return QFeatureBookmark.featureBookmark.user.realms.contains(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
	}

}
