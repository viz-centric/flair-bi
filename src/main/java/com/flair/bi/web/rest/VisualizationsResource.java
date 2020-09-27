package com.flair.bi.web.rest;

import com.flair.bi.domain.Visualization;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.VisualizationService;
import com.flair.bi.service.dto.IdentifierDTO;
import com.flair.bi.service.dto.VisualizationDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import java.util.Optional;

/**
 * REST controller for managing Visualization.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class VisualizationsResource {

	private final VisualizationService visualizationService;

	/**
	 * POST /visualization : Create a new visualization.
	 *
	 * @param visualization the visualization to create
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         visualization, or with status 400 (Bad Request) if the visualization
	 *         has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/visualizations")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'WRITE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> createVisualizations(@Valid @RequestBody Visualization visualization)
			throws URISyntaxException {
		log.debug("REST request to save Visualization : {}", visualization);
		if (visualization.getId() != null) {
			return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("visualization", "idexists",
					"A new visualization cannot already have an ID")).body(null);
		}
		VisualizationDTO result = visualizationService.save(visualization);
		return ResponseEntity.created(new URI("/api/visualization/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert("visualization", result.getId().toString())).body(result);
	}

	/**
	 * PUT /visualization : Updates an existing visualization.
	 *
	 * @param visualization the visualization to update
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         visualization, or with status 400 (Bad Request) if the visualization
	 *         is not valid, or with status 500 (Internal Server Error) if the
	 *         visualization couldnt be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/visualizations")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS','UPDATE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> updateVisualizations(@Valid @RequestBody Visualization visualization)
			throws URISyntaxException {
		log.debug("REST request to update Visualization : {}", visualization);
		if (visualization.getId() == null) {
			return createVisualizations(visualization);
		}
		VisualizationDTO result = visualizationService.save(visualization);
		return ResponseEntity.ok()
				.headers(HeaderUtil.createEntityUpdateAlert("visualization", visualization.getId().toString()))
				.body(result);
	}

	/**
	 * GET /visualizations : get all the visualizations.
	 *
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         visualizations in body
	 */
	@GetMapping("/visualizations")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'READ','APPLICATION')")
	public List<VisualizationDTO> getAllVisualizations() {
		log.debug("REST request to get all Visualization");
		return visualizationService.findAll();
	}

	/**
	 * GET /visualizations/:id : get the "id" visualizations.
	 *
	 * @param id the id of the visualizations to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         visualizations, or with status 404 (Not Found)
	 */
	@GetMapping("/visualizations/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> getVisualizations(@PathVariable Long id) {
		log.debug("REST request to get Visualization : {}", id);
		VisualizationDTO visualization = visualizationService.findOne(id);
		return Optional.ofNullable(visualization).map(result -> new ResponseEntity<>(result, HttpStatus.OK))
				.orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	/**
	 * DELETE /visualizations/:id : delete the "id" visualizations.
	 *
	 * @param id the id of the visualizations to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/visualizations/{id}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS','DELETE','APPLICATION')")
	public ResponseEntity<Void> deleteVisualizations(@PathVariable Long id) {
		log.debug("REST request to delete Visualization : {}", id);
		visualizationService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("visualizations", id.toString()))
				.build();
	}

	@GetMapping("/visualizations/{id}/fieldTypes/{fieldTypeId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<FieldType> getFieldTypeDetails(@PathVariable Long id, @PathVariable Long fieldTypeId) {
		return ResponseEntity.ok(visualizationService.getFieldType(id, fieldTypeId));
	}

	@PostMapping("/visualizations/{id}/fieldTypes")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'UPDATE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> createNewFieldType(@PathVariable Long id,
			@Valid @RequestBody FieldType fieldType) throws URISyntaxException {
		if (fieldType.getId() != null) {
			return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("fieldTypes", "idexists",
					"A new field type cannot already have an ID")).body(null);
		}
		VisualizationDTO result = visualizationService.saveFieldType(id, fieldType);
		return ResponseEntity.created(new URI("/api/visualizations/" + id + "/fieldTypes/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert("fieldType", result.getId().toString())).body(result);
	}

	@DeleteMapping("/visualizations/{id}/fieldTypes/{fieldTypeId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'DELETE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> deleteFieldType(@PathVariable Long id, @PathVariable Long fieldTypeId) {
		final VisualizationDTO body = visualizationService.deleteFieldType(id, fieldTypeId);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("fieldType", fieldTypeId.toString()))
				.body(body);
	}

	@PostMapping("/visualizations/{id}/propertyTypes")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'UPDATE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> assignPropertyType(@PathVariable Long id,
			@RequestBody IdentifierDTO<Long> propertyType) {
		return ResponseEntity.ok(visualizationService.assignPropertyType(id, propertyType.getId()));
	}

	@DeleteMapping("/visualizations/{id}/propertyTypes/{propertyTypeId}")
	@PreAuthorize("@accessControlManager.hasAccess('VISUALIZATIONS', 'UPDATE', 'APPLICATION')")
	public ResponseEntity<VisualizationDTO> removePropertyType(@PathVariable Long id, @PathVariable Long propertyTypeId) {
		return ResponseEntity.ok(visualizationService.removePropertyType(id, propertyTypeId));
	}

}
