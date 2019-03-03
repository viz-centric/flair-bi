package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.FeatureCriteria;
import com.flair.bi.domain.View;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.FeatureCriteriaService;
import com.flair.bi.service.mapper.FeatureCriteriaMapper;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.dto.CreateUpdateFeatureCriteriaDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing FeatureCriteria.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class FeatureCriteriaResource {

    private static final String ENTITY_NAME = "featureCriteria";
    private final FeatureCriteriaService featureCriteriaService;
    private final FeatureCriteriaMapper featureCriteriaMapper;
    private final BookMarkWatchService bookMarkWatchService;
    private final ViewService viewService;

    /**
     * POST  /feature-criteria : Create a new featureCriteria.
     *
     * @param featureCriteria the featureCriteria to create
     * @return the ResponseEntity with status 201 (Created) and with body the new featureCriteria, or with status 400 (Bad Request) if the featureCriteria has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/feature-criteria")
    @Timed
    public ResponseEntity<FeatureCriteria> createFeatureCriteria(@Valid @RequestBody CreateUpdateFeatureCriteriaDTO featureCriteria) throws URISyntaxException {
        log.debug("REST request to save FeatureCriteria : {}", featureCriteria);
        if (featureCriteria.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new featureCriteria cannot already have an ID")).body(null);
        }
        FeatureCriteria result = featureCriteriaService.save(featureCriteriaMapper.featureCriteriaDTOToFeatureCriteria(featureCriteria));
        return ResponseEntity.created(new URI("/api/feature-criteria/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /feature-criteria : Updates an existing featureCriteria.
     *
     * @param featureCriteria the featureCriteria to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated featureCriteria,
     * or with status 400 (Bad Request) if the featureCriteria is not valid,
     * or with status 500 (Internal Server Error) if the featureCriteria couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/feature-criteria")
    @Timed
    public ResponseEntity<FeatureCriteria> updateFeatureCriteria(@Valid @RequestBody CreateUpdateFeatureCriteriaDTO featureCriteria) throws URISyntaxException {
        log.debug("REST request to update FeatureCriteria : {}", featureCriteria);
        if (featureCriteria.getId() == null) {
            return createFeatureCriteria(featureCriteria);
        }
        FeatureCriteria result = featureCriteriaService.save(featureCriteriaMapper.featureCriteriaDTOToFeatureCriteria(featureCriteria));
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, featureCriteria.getId().toString()))
            .body(result);
    }

    /**
     * GET  /feature-criteria : get all the featureCriteria.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of featureCriteria in body
     */
    @GetMapping("/feature-criteria")
    @Timed
    public List<FeatureCriteria> getAllFeatureCriteria(@QuerydslPredicate(root = FeatureCriteria.class) Predicate predicate) {
        log.debug("REST request to get all FeatureCriteria");
        return featureCriteriaService.findAll(predicate);
    }

    /**
     * GET  /feature-criteria/:id : get the "id" featureCriteria.
     *
     * @param id the id of the featureCriteria to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the featureCriteria, or with status 404 (Not Found)
     */
    @GetMapping("/feature-criteria/{id}")
    @Timed
    public ResponseEntity<FeatureCriteria> getFeatureCriteria(@PathVariable Long id) {
        log.debug("REST request to get FeatureCriteria : {}", id);
        FeatureCriteria featureCriteria = featureCriteriaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(featureCriteria));
    }

    /**
     * DELETE  /feature-criteria/:id : delete the "id" featureCriteria.
     *
     * @param id the id of the featureCriteria to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/feature-criteria/{id}")
    @Timed
    public ResponseEntity<Void> deleteFeatureCriteria(@PathVariable Long id) {
        log.debug("REST request to delete FeatureCriteria : {}", id);
        featureCriteriaService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
    @GetMapping("/save-recent-bookmark/{bookmarkId}/{viewId}")
    @Timed
    public void saveRecentBookmark(@PathVariable Long bookmarkId,@PathVariable Long viewId) {
        log.debug("REST request to get FeatureCriteria : {}", bookmarkId);
        View view = viewService.findOne(viewId);
        bookMarkWatchService.saveBookmarkWatchAsync(bookmarkId, viewId,SecurityUtils.getCurrentUserLogin(),view);
    }
}
