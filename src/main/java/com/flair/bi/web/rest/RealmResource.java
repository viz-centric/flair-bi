package com.flair.bi.web.rest;

import com.flair.bi.domain.Realm;
import com.flair.bi.domain.View;
import com.flair.bi.service.impl.CreateRealmData;
import com.flair.bi.service.impl.RealmService;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.github.jhipster.web.util.ResponseUtil;
import io.micrometer.core.annotation.Timed;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Realm.
 */
@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api")
public class RealmResource {

    private static final String ENTITY_NAME = "realm";

    private final RealmService realmService;

    /**
     * POST  /realms : Create a new realm.
     *
     * @param realmDTO the realm to create
     * @return the ResponseEntity with status 201 (Created) and with body the new realm, or with status 400 (Bad Request) if the realm has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/realms")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'WRITE', 'APPLICATION')")
    public ResponseEntity<CreateRealmData> createRealm(@RequestBody RealmDTO realmDTO) throws URISyntaxException {
        log.debug("REST request to save Realm : {}", realmDTO);
        if (realmDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new realm cannot already have an ID")).body(null);
        }
        CreateRealmData result = realmService.createLoggedIn(realmDTO);
        return ResponseEntity.created(new URI("/api/realms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PostMapping("/realms-anonym")
    @Timed
    public ResponseEntity<CreateRealmData> createRealmAnonym(@RequestBody RealmDTO realmDTO) throws URISyntaxException {
        log.debug("REST anonym request to save Realm : {}", realmDTO);
        if (realmDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new realm cannot already have an ID")).body(null);
        }
        CreateRealmData result = realmService.createAnonym(realmDTO);
        return ResponseEntity.created(new URI("/api/realms/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
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
    @PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'READ', 'APPLICATION')")
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
    @PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'READ', 'APPLICATION')")
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
    @PreAuthorize("@accessControlManager.hasAccess('REALM-MANAGEMENT', 'DELETE', 'APPLICATION')")
    public ResponseEntity<Void> deleteRealm(@PathVariable Long id) {
        log.debug("REST request to delete Realm : {}", id);
        realmService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}


