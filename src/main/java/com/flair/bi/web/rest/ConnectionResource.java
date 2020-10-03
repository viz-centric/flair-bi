package com.flair.bi.web.rest;

import com.flair.bi.domain.Datasource;
import com.flair.bi.domain.QDatasource;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.GrpcQueryService;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.DeleteInfo;
import com.flair.bi.service.dto.RunQueryResponseDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.project.bi.query.dto.QueryDTO;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/connection")
public class ConnectionResource {

	private final DatasourceService datasourceService;
	private final DashboardService dashboardService;
	private final GrpcConnectionService grpcConnectionService;
	private final GrpcQueryService grpcQueryService;

	@GetMapping("/{connectionLinkId}/deleteInfo")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<List<DeleteInfo>> getConnectionDeleteInfo(@PathVariable String connectionLinkId) {
		final List<Datasource> datasource = datasourceService
				.findAll(QDatasource.datasource.connectionName.eq(connectionLinkId));

		final List<DeleteInfo> deleteInfos = new ArrayList<>();

		datasource.forEach(x -> deleteInfos.add(new DeleteInfo("Datasource", x.getName())));

		dashboardService.findAllByDatasourceIds(datasource.stream().map(Datasource::getId).collect(Collectors.toList()))
				.forEach(y -> deleteInfos.add(new DeleteInfo("Dashboard", y.getDashboardName())));

		return ResponseEntity.ok(deleteInfos);
	}

	@GetMapping
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<List<ConnectionDTO>> getConnections(@RequestParam(required = false) String linkId,
			@RequestParam(required = false) Long connectionType) {
		log.debug("Get connections by link {} and connection type {}", linkId, connectionType);

		List<ConnectionDTO> connections = grpcConnectionService
				.getAllConnections(new ConnectionFilterParamsDTO()
						.setConnectionType(connectionType)
						.setLinkId(linkId));

		log.debug("Get connections returned {}", connections);

		return ResponseEntity.ok(connections);
	}

	@PostMapping
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'WRITE', 'APPLICATION')")
	public ResponseEntity<ConnectionDTO> saveConnection(@Valid @RequestBody ConnectionDTO connection) {
		log.debug("Save connection {}", connection);

		ConnectionDTO connectionDTO = grpcConnectionService.saveConnection(connection);

		log.debug("Saved connection {}", connectionDTO);

		return ResponseEntity.ok(connectionDTO);
	}

	@PutMapping
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'WRITE', 'APPLICATION')")
	public ResponseEntity<ConnectionDTO> updateConnection(@Valid @RequestBody ConnectionDTO connection) {
		log.debug("Update connection {}", connection);

		ConnectionDTO connectionDTO = grpcConnectionService.updateConnection(connection);

		log.debug("Updated connection {}", connectionDTO);

		return ResponseEntity.ok(connectionDTO);
	}

	@DeleteMapping("/{connectionId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'DELETE', 'APPLICATION')")
	public ResponseEntity<ConnectionDTO> deleteConnection(@PathVariable Long connectionId) {
		log.info("Delete connection {}", connectionId);

		ConnectionDTO connection = grpcConnectionService.getConnection(connectionId);
		if (connection == null) {
			log.info("Cannot delete a connection that does not exist {}", connectionId);
			return ResponseEntity.unprocessableEntity().build();
		}

		boolean success = grpcConnectionService.deleteConnection(connectionId);

		log.debug("Deleted connection {} success {}", connectionId, success);

		if (!success) {
			return ResponseEntity.unprocessableEntity().build();
		}

		datasourceService.delete(QDatasource.datasource.connectionName.eq(connection.getLinkId()));

		log.debug("Deleted datasources for connection {}", connection.getLinkId());

		return ResponseEntity.ok().build();
	}

	@GetMapping("/{connectionId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<ConnectionDTO> getConnection(@PathVariable Long connectionId) {
		log.info("Get connection {}", connectionId);

		ConnectionDTO connection = grpcConnectionService.getConnection(connectionId);

		log.debug("Got connection {}", connectionId);

		return ResponseEntity.ok(connection);
	}

	@PostMapping("/features/{datasourceId}")
	@Timed
	@PreAuthorize("@accessControlManager.hasAccess('CONNECTIONS', 'READ', 'APPLICATION')")
	public ResponseEntity<?> fetchFeatures(@PathVariable("datasourceId") Long datasourceId,
			@RequestBody QueryDTO query) {

		log.info("Fetching features for datasource {} and query {}", datasourceId, query);

		Datasource datasource = datasourceService.findOne(datasourceId);
		if (datasource == null) {
			log.warn("No datasource found for {} for query {}", datasourceId, query);
			return ResponseEntity.badRequest().build();
		}

		RunQueryResponseDTO result = grpcQueryService.sendRunQuery(query, datasource);

		log.debug("Fetch features result {}", result);

		if (result.getResult() == null) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}

		return ResponseEntity.ok(result.getResult());
	}
}
