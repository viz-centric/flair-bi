package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.service.HierarchyService;
import com.flair.bi.service.dto.HierarchyDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class HierarchyResource {

    private final HierarchyService hierarchyService;

    @GetMapping(path = "/hierarchies")
    @Timed
    public ResponseEntity<List<Hierarchy>> getAll(@QuerydslPredicate(root = Hierarchy.class) Predicate predicate) {
        return ResponseEntity.ok(hierarchyService.findAll(predicate));
    }

    /**
     * PUT  /hierarchies : Updates an existing hierarchy.
     *
     * @param hierarchy the hierarchy to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated hierarchy,
     * or with status 400 (Bad Request) if the hierarchy is not valid,
     * or with status 404 (Not Found) if hierarchy with given id does not exists,
     * or with status 500 (Internal Server Error) if the hierarchy couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/hierarchies")
    @Timed
    public ResponseEntity<Hierarchy> updateHierarchy(@Valid @RequestBody HierarchyDTO hierarchy) throws URISyntaxException {
        log.debug("REST request to update Hierarchy : {}", hierarchy);
        if (hierarchy.getId() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Hierarchy result = hierarchyService.findOne(hierarchy.getId());

        if (null == result) {
            return ResponseEntity.notFound().build();
        }

        result.setDrilldown(hierarchy.getDrilldown());
        result.setName(hierarchy.getName());
        result = hierarchyService.save(result);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("hierarchies", hierarchy.getId().toString()))
            .body(result);
    }


    /**
     * POST  /features : Create a new hierarchy.
     *
     * @param hierarchy the hierarchy to create
     * @return the ResponseEntity with status 201 (Created) and with body the new hierarchy, or with status 400 (Bad Request) if the hierarchy has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/hierarchies")
    @Timed
    public ResponseEntity<HierarchyDTO> createHierarchy(@Valid @RequestBody HierarchyDTO hierarchy) throws URISyntaxException {
        log.debug("REST request to save Hierarchy : {}", hierarchy);
        if (hierarchy.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("hierarchies", "idexists", "A new features cannot already have an ID")).body(null);
        }
        HierarchyDTO result = hierarchyService.save(hierarchy);
        return ResponseEntity.created(new URI("/api/hierarchies/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("hierarchies", result.getId().toString()))
            .body(result);
    }

    /**
     * DELETE  /hierarchies/:id : delete the "id" hierarchies.
     *
     * @param id the id of the hierarchy to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/hierarchies/{id}")
    @Timed
    public ResponseEntity<Void> deleteHierarchies(@PathVariable Long id) {
        log.debug("REST request to delete Hierarchy : {}", id);
        hierarchyService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("hierarchies", id.toString())).build();
    }

}



