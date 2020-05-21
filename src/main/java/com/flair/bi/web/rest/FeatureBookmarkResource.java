package com.flair.bi.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.service.FeatureBookmarkService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.querydsl.core.types.Predicate;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing FeatureBookmark.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class FeatureBookmarkResource {

	private static final String ENTITY_NAME = "featureBookmark";
	private final FeatureBookmarkService featureBookmarkService;

	/**
	 * POST /feature-bookmarks : Create a new featureBookmark.
	 *
	 * @param featureBookmark the featureBookmark to create
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         featureBookmark, or with status 400 (Bad Request) if the
	 *         featureBookmark has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/feature-bookmarks")
	@Timed
	public ResponseEntity<FeatureBookmark> createFeatureBookmark(@Valid @RequestBody FeatureBookmark featureBookmark)
			throws URISyntaxException {
		log.debug("REST request to save FeatureBookmark : {}", featureBookmark);
		if (featureBookmark.getId() != null) {
			return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists",
					"A new featureBookmark cannot already have an ID")).body(null);
		}
		FeatureBookmark result = featureBookmarkService.save(featureBookmark);
		return ResponseEntity.created(new URI("/api/feature-bookmarks/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
	}

	/**
	 * PUT /feature-bookmarks : Updates an existing featureBookmark.
	 *
	 * @param featureBookmark the featureBookmark to update
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         featureBookmark, or with status 400 (Bad Request) if the
	 *         featureBookmark is not valid, or with status 500 (Internal Server
	 *         Error) if the featureBookmark couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/feature-bookmarks")
	@Timed
	public ResponseEntity<FeatureBookmark> updateFeatureBookmark(@Valid @RequestBody FeatureBookmark featureBookmark)
			throws URISyntaxException {
		log.debug("REST request to update FeatureBookmark : {}", featureBookmark);
		if (featureBookmark.getId() == null) {
			return createFeatureBookmark(featureBookmark);
		}
		FeatureBookmark result = featureBookmarkService.save(featureBookmark);
		return ResponseEntity.ok()
				.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, featureBookmark.getId().toString()))
				.body(result);
	}

	/**
	 * GET /feature-bookmarks : get all the featureBookmarks.
	 *
	 * @param predicate predicate
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         featureBookmarks in body
	 */
	@GetMapping("/feature-bookmarks")
	@Timed
	public List<FeatureBookmark> getAllFeatureBookmarks(
			@QuerydslPredicate(root = FeatureBookmark.class) Predicate predicate) {
		log.debug("REST request to get all FeatureBookmarks");
		return featureBookmarkService.findAll(predicate);
	}

	/**
	 * GET /feature-bookmarks/:id : get the "id" featureBookmark.
	 *
	 * @param id the id of the featureBookmark to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         featureBookmark, or with status 404 (Not Found)
	 */
	@GetMapping("/feature-bookmarks/{id}")
	@Timed
	public ResponseEntity<FeatureBookmark> getFeatureBookmark(@PathVariable Long id) {
		log.debug("REST request to get FeatureBookmark : {}", id);
		FeatureBookmark featureBookmark = featureBookmarkService.findOne(id);
		return ResponseUtil.wrapOrNotFound(Optional.ofNullable(featureBookmark));
	}

	/**
	 * DELETE /feature-bookmarks/:id : delete the "id" featureBookmark.
	 *
	 * @param id the id of the featureBookmark to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/feature-bookmarks/{id}")
	@Timed
	public ResponseEntity<Void> deleteFeatureBookmark(@PathVariable Long id) {
		log.debug("REST request to delete FeatureBookmark : {}", id);
		featureBookmarkService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
	}
}
