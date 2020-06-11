package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.VisualizationColorsService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.service.dto.VisualizationColorsDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing VisualizationColors.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class VisualizationColorsResource {

    private final VisualizationColorsService visualizationColorsService;

    /**
     * POST  /visualization-colors : Create a new visualizationColors.
     *
     * @param visualizationColorsDTO the visualizationColorsDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new visualizationColorsDTO, or with status 400 (Bad Request) if the visualizationColors has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/visualization-colors")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUALIZATION_COLORS', 'WRITE','APPLICATION')")
    public ResponseEntity<VisualizationColorsDTO> createVisualizationColors(@Valid @RequestBody VisualizationColorsDTO visualizationColorsDTO) throws URISyntaxException {
        log.debug("REST request to save VisualizationColors : {}", visualizationColorsDTO);
        if (visualizationColorsDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("visualizationColors", "idexists", "A new visualizationColors cannot already have an ID")).body(null);
        }
        VisualizationColorsDTO result = visualizationColorsService.save(visualizationColorsDTO);
        return ResponseEntity.created(new URI("/api/visualization-colors/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("visualizationColors", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /visualization-colors : Updates an existing visualizationColors.
     *
     * @param visualizationColorsDTO the visualizationColorsDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated visualizationColorsDTO,
     * or with status 400 (Bad Request) if the visualizationColorsDTO is not valid,
     * or with status 500 (Internal Server Error) if the visualizationColorsDTO couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/visualization-colors")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUALIZATION_COLORS', 'UPDATE','APPLICATION')")
    public ResponseEntity<VisualizationColorsDTO> updateVisualizationColors(@Valid @RequestBody VisualizationColorsDTO visualizationColorsDTO) throws URISyntaxException {
        log.debug("REST request to update VisualizationColors : {}", visualizationColorsDTO);
        if (visualizationColorsDTO.getId() == null) {
            return createVisualizationColors(visualizationColorsDTO);
        }
        VisualizationColorsDTO result = visualizationColorsService.save(visualizationColorsDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("visualizationColors", visualizationColorsDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /visualization-colors : get all the visualizationColors.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of visualizationColors in body
     */
    @GetMapping("/visualization-colors")
    @Timed
    public List<VisualizationColorsDTO> getAllVisualizationColors() {
        log.debug("REST request to get all VisualizationColors");
        return visualizationColorsService.findAll();
    }

    /**
     * GET  /visualization-colors/:id : get the "id" visualizationColors.
     *
     * @param id the id of the visualizationColorsDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the visualizationColorsDTO, or with status 404 (Not Found)
     */
    @GetMapping("/visualization-colors/{id}")
    @Timed
    public ResponseEntity<VisualizationColorsDTO> getVisualizationColors(@PathVariable Long id) {
        log.debug("REST request to get VisualizationColors : {}", id);
        VisualizationColorsDTO visualizationColorsDTO = visualizationColorsService.findOne(id);
        return Optional.ofNullable(visualizationColorsDTO)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /visualization-colors/:id : delete the "id" visualizationColors.
     *
     * @param id the id of the visualizationColorsDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/visualization-colors/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('VISUALIZATION_COLORS', 'DELETE','APPLICATION')")
    public ResponseEntity<Void> deleteVisualizationColors(@PathVariable Long id) {
        log.debug("REST request to delete VisualizationColors : {}", id);
        visualizationColorsService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("visualizationColors", id.toString())).build();
    }

}
