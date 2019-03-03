package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.DatasourceConstraint;
import com.flair.bi.service.DatasourceConstraintService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing DatasourceConstraint.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class DatasourceConstraintResource {

    private static final String ENTITY_NAME = "datasourceConstraint";
    private final DatasourceConstraintService datasourceConstraintService;

    /**
     * POST  /datasource-constraints : Create a new datasourceConstraint.
     *
     * @param datasourceConstraint the datasourceConstraint to create
     * @return the ResponseEntity with status 201 (Created) and with body the new datasourceConstraint, or with status 400 (Bad Request) if the datasourceConstraint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/datasource-constraints")
    @Timed
    public ResponseEntity<DatasourceConstraint> createDatasourceConstraint(@Valid @RequestBody DatasourceConstraint datasourceConstraint) throws URISyntaxException {
        log.debug("REST request to save DatasourceConstraint : {}", datasourceConstraint);
        if (datasourceConstraint.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new datasourceConstraint cannot already have an ID")).body(null);
        }
        DatasourceConstraint result = datasourceConstraintService.save(datasourceConstraint);
        return ResponseEntity.created(new URI("/api/datasource-constraints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /datasource-constraints : Updates an existing datasourceConstraint.
     *
     * @param datasourceConstraint the datasourceConstraint to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated datasourceConstraint,
     * or with status 400 (Bad Request) if the datasourceConstraint is not valid,
     * or with status 500 (Internal Server Error) if the datasourceConstraint couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/datasource-constraints")
    @Timed
    public ResponseEntity<DatasourceConstraint> updateDatasourceConstraint(@Valid @RequestBody DatasourceConstraint datasourceConstraint) throws URISyntaxException {
        log.debug("REST request to update DatasourceConstraint : {}", datasourceConstraint);
        if (datasourceConstraint.getId() == null) {
            return createDatasourceConstraint(datasourceConstraint);
        }
        DatasourceConstraint result = datasourceConstraintService.save(datasourceConstraint);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, datasourceConstraint.getId().toString()))
            .body(result);
    }

    /**
     * GET  /datasource-constraints : get all the datasourceConstraints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of datasourceConstraints in body
     */
    @GetMapping("/datasource-constraints")
    @Timed
    public List<DatasourceConstraint> getAllDatasourceConstraints(@QuerydslPredicate(root = DatasourceConstraint.class) Predicate predicate) {
        log.debug("REST request to get all DatasourceConstraints");
        return datasourceConstraintService.findAll(predicate);
    }

    /**
     * GET  /datasource-constraints/:id : get the "id" datasourceConstraint.
     *
     * @param id the id of the datasourceConstraint to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the datasourceConstraint, or with status 404 (Not Found)
     */
    @GetMapping("/datasource-constraints/{id}")
    @Timed
    public ResponseEntity<DatasourceConstraint> getDatasourceConstraint(@PathVariable Long id) {
        log.debug("REST request to get DatasourceConstraint : {}", id);
        DatasourceConstraint datasourceConstraint = datasourceConstraintService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(datasourceConstraint));
    }

    /**
     * DELETE  /datasource-constraints/:id : delete the "id" datasourceConstraint.
     *
     * @param id the id of the datasourceConstraint to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/datasource-constraints/{id}")
    @Timed
    public ResponseEntity<Void> deleteDatasourceConstraint(@PathVariable Long id) {
        log.debug("REST request to delete DatasourceConstraint : {}", id);
        datasourceConstraintService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
