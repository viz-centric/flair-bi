package com.flair.bi.web.rest;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.View;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.micrometer.core.annotation.Timed;
import io.swagger.annotations.ApiParam;
import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Realm.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RealmResource {

    private final Logger log = LoggerFactory.getLogger(RealmResource.class);

    private static final String ENTITY_NAME = "realm";

    private final RealmService realmService;

    /**
     * POST  /realms : Create a new realm.
     *
     * @param realm the realm to create
     * @return the ResponseEntity with status 201 (Created) and with body the new realm, or with status 400 (Bad Request) if the realm has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/realms")
    @Timed
    public ResponseEntity<RealmDTO> createRealm(@RequestBody RealmDTO realm) throws URISyntaxException {
        log.debug("REST request to save Realm : {}", realm);
        if (realm.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new realm cannot already have an ID")).body(null);
        }
        RealmDTO result = realmService.save(realm);
        return ResponseEntity.created(new URI("/api/realms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /realms : Updates an existing realm.
     *
     * @param realm the realm to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated realm,
     * or with status 400 (Bad Request) if the realm is not valid,
     * or with status 500 (Internal Server Error) if the realm couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/realms")
    @Timed
    public ResponseEntity<RealmDTO> updateRealm(@RequestBody RealmDTO realm) throws URISyntaxException {
        log.debug("REST request to update Realm : {}", realm);
        if (realm.getId() == null) {
            return createRealm(realm);
        }
        RealmDTO result = realmService.save(realm);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, realm.getId().toString()))
            .body(result);
    }

    /**
     * GET  /realms : get all the realms.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of realms in body
     */
    @GetMapping("/realms")
    @Timed
    public ResponseEntity<List<Realm>> getAllRealms(@QuerydslPredicate(root = View.class) Predicate predicate,
                                                    @ApiParam Pageable pageable,
                                                    @RequestParam(name = "paginate", defaultValue = "false", required = false) boolean shouldPaginate)
            throws URISyntaxException {
        log.debug("REST request to get a page of Realms");
        Page<Realm> page = realmService.findAll(predicate, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/realms");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /realms/:id : get the "id" realm.
     *
     * @param id the id of the realm to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the realm, or with status 404 (Not Found)
     */
    @GetMapping("/realms/{id}")
    @Timed
    public ResponseEntity<RealmDTO> getRealm(@PathVariable Long id) {
        log.debug("REST request to get Realm : {}", id);
        RealmDTO realm = realmService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(realm));
    }

    /**
     * DELETE  /realms/:id : delete the "id" realm.
     *
     * @param id the id of the realm to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/realms/{id}")
    @Timed
    public ResponseEntity<Void> deleteRealm(@PathVariable Long id) {
        log.debug("REST request to delete Realm : {}", id);
        realmService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}


