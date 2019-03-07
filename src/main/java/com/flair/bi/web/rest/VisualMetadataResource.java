package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.view.VisualMetadataService;
import com.flair.bi.view.VisualMetadataValidationService;
import com.flair.bi.web.rest.dto.QueryValidationResponseDTO;
import com.flair.bi.web.rest.dto.SaveVisualMetadataDTO;
import com.flair.bi.web.rest.dto.ValidateVisualMetadataDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing VisualMetadata.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class VisualMetadataResource {

    private final VisualMetadataService visualMetadataService;
    private final VisualMetadataValidationService visualMetadataValidationService;
    
    @PostMapping("/visualmetadata/validate")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'READ', 'APPLICATION')")
    public ResponseEntity<?> validateVisualMetadata(@Valid @RequestBody ValidateVisualMetadataDTO requestDto,
                                                    Authentication principal) {
        String userId = principal.getName();
        log.debug("REST request to validate VisualMetadata {} user {}", requestDto, userId);

        QueryValidationResponseDTO validationResult = visualMetadataValidationService.validate(requestDto.getDatasourceId(),
            requestDto.getQueryDTO(),
            requestDto.getVisualMetadataId(),
            requestDto.getConditionExpression(),
            userId);

        return ResponseEntity.ok(validationResult);
    }


    /**
     * POST  /visualMetadata : Create a new visualMetadata.
     *
     * @param visualMetadata the visualMetadata to create
     * @return the ResponseEntity with status 201 (Created) and with body the new visualMetadata, or with status 400 (Bad Request) if the visualMetadata has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/visualmetadata")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'WRITE', 'APPLICATION')")
    public ResponseEntity<VisualMetadata> createVisualMetadata(@Valid @RequestBody SaveVisualMetadataDTO visualMetadata) throws URISyntaxException {
        log.debug("REST request to save VisualMetadata : {}", visualMetadata);
        if (visualMetadata.getVisualMetadata().getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("visualMetadata", "idexists", "A new visualMetadata cannot already have an ID")).body(null);
        }
        VisualMetadata result = visualMetadataService.save(visualMetadata.getViewId(), visualMetadata.getVisualMetadata());
        return ResponseEntity.created(new URI("/api/visualMetadata/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("visualMetadata", result.getId()))
            .body(result);
    }

    /**
     * PUT  /visualMetadata : Updates an existing visualMetadata.
     *
     * @param visualMetadata the visualMetadata to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated visualMetadata,
     * or with status 400 (Bad Request) if the visualMetadata is not valid,
     * or with status 500 (Internal Server Error) if the visualMetadata couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/visualmetadata")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'UPDATE', 'APPLICATION')")
    public ResponseEntity<VisualMetadata> updateVisualMetadata(@Valid @RequestBody SaveVisualMetadataDTO visualMetadata) throws URISyntaxException {
        log.debug("REST request to update VisualMetadata : {}", visualMetadata);
        if (visualMetadata.getVisualMetadata().getId() == null) {
            return createVisualMetadata(visualMetadata);
        }
        VisualMetadata result = visualMetadataService.save(visualMetadata.getViewId(), visualMetadata.getVisualMetadata());
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("visualMetadata", result.getId()))
            .body(result);
    }

    /**
     * GET  /visualmetadata : get all the visualmetadata.
     *
     * @param views views
     * @return the ResponseEntity with status 200 (OK) and the list of visualmetadata in body
     */
    @GetMapping("/visualmetadata")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'READ', 'APPLICATION')")
    public List<VisualMetadata> getAllVisualMetadata(@RequestParam(name = "views") Long views) {
        log.debug("REST request to get all VisualMetadata");
        return visualMetadataService.findAllByPrincipalPermissionsByViewId(views);
    }

    /**
     * GET  /visualmetadata/:id : get the "id" visualmetadata.
     *
     * @param id the id of the visualmetadata to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the visualmetadata, or with status 404 (Not Found)
     */
    @GetMapping("/visualmetadata/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'READ', 'APPLICATION')")
    public ResponseEntity<VisualMetadata> getVisualMetadata(@PathVariable String id) {
        log.debug("REST request to get VisualMetadata : {}", id);
        VisualMetadata visualMetadata = visualMetadataService.findOne(id);
        return Optional.ofNullable(visualMetadata)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /visualmetadata/:id : delete the "id" visualmetadata.
     *
     * @param id the id of the visualmetadata to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/visualmetadata/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUAL-METADATA', 'DELETE', 'APPLICATION')")
    public ResponseEntity<Void> deleteVisualMetadata(@PathVariable String id) {
        log.debug("REST request to delete VisualMetadata : {}", id);
        visualMetadataService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("visualmetadata", id)).build();
    }
}
