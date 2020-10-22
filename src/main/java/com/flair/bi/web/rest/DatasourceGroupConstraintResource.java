package com.flair.bi.web.rest;

import com.flair.bi.domain.DatasourceGroupConstraint;
import com.flair.bi.service.DatasourceGroupConstraintService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.querydsl.core.types.Predicate;
import io.micrometer.core.annotation.Timed;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/datasource-group-constraints")
@Slf4j
@RequiredArgsConstructor
public class DatasourceGroupConstraintResource {

	private static final String ENTITY_NAME = "datasourceGroupConstraint";
	private final DatasourceGroupConstraintService datasourceGroupConstraintService;

	@PostMapping
	@Timed
	public ResponseEntity<DatasourceGroupConstraint> createDatasourceGroupConstraint(
			@Valid @RequestBody DatasourceGroupConstraint datasourceGroupConstraint) throws URISyntaxException {
		log.debug("REST request to save DatasourceGroupConstraint : {}", datasourceGroupConstraint);
		if (datasourceGroupConstraint.getId() != null) {
			return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists",
					"A new datasourceGroupConstraint cannot already have an ID")).body(null);
		}
		DatasourceGroupConstraint result = datasourceGroupConstraintService.save(datasourceGroupConstraint);
		return ResponseEntity.created(new URI("/api/datasource-group-constraints/" + result.getId()))
				.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
	}

	@PutMapping
	@Timed
	public ResponseEntity<DatasourceGroupConstraint> updateDatasourceConstraint(
			@Valid @RequestBody DatasourceGroupConstraint datasourceGroupConstraint) throws URISyntaxException {
		log.debug("REST request to update DatasourceGroupConstraint : {}", datasourceGroupConstraint);
		if (datasourceGroupConstraint.getId() == null) {
			return createDatasourceGroupConstraint(datasourceGroupConstraint);
		}
		DatasourceGroupConstraint result = datasourceGroupConstraintService.save(datasourceGroupConstraint);
		return ResponseEntity.ok()
				.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, datasourceGroupConstraint.getId().toString()))
				.body(result);
	}

	@GetMapping
	@Timed
	public List<DatasourceGroupConstraint> getAllDatasourceConstraints(
			@QuerydslPredicate(root = DatasourceGroupConstraint.class) Predicate predicate) {
		log.debug("REST request to get all DatasourceGroupConstraint");
		return datasourceGroupConstraintService.findAll(predicate);
	}

	@GetMapping("/{id}")
	@Timed
	public ResponseEntity<DatasourceGroupConstraint> getDatasourceConstraint(@PathVariable Long id) {
		log.debug("REST request to get DatasourceGroupConstraint : {}", id);
		DatasourceGroupConstraint datasourceGroupConstraint = datasourceGroupConstraintService.findOne(id);
		return ResponseUtil.wrapOrNotFound(Optional.ofNullable(datasourceGroupConstraint));
	}

	@DeleteMapping("/{id}")
	@Timed
	public ResponseEntity<Void> deleteDatasourceConstraint(@PathVariable Long id) {
		log.debug("REST request to delete DatasourceGroupConstraint : {}", id);
		datasourceGroupConstraintService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
	}
}
