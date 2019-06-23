package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Datasource;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.GrpcConnectionService;
import com.flair.bi.service.dto.ConnectionFilterParamsDTO;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.service.dto.DeleteInfo;
import com.flair.bi.service.dto.ListTablesResponseDTO;
import com.flair.bi.web.rest.dto.ConnectionDTO;
import com.flair.bi.web.rest.dto.DatasourceDTO;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import com.querydsl.core.types.Predicate;
import io.swagger.annotations.ApiParam;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
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
import javax.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing Datasource.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class DatasourcesResource {

    private static final String ENTITY_NAME = "datasources";
    private final DatasourceService datasourceService;
    private final DashboardService dashboardService;
    private final GrpcConnectionService grpcConnectionService;

    /**
     * POST  /datasource : Create a new datasource.
     *
     * @param request the datasource to create
     * @return the ResponseEntity with status 201 (Created) and with body the new datasource, or with status 400 (Bad Request) if the datasource has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/datasources")
    @Timed
    public ResponseEntity<?> createDatasources(@Valid @RequestBody CreateDatasourceRequest request) throws URISyntaxException {
        log.debug("REST request to save datasource request {}", request);

        Datasource datasource = request.getDatasource();
        if (datasource.getId() != null) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new datasource cannot already have an ID"))
                    .body(null);
        }

        Optional<Datasource> existingDatasource = datasourceService.findAllByConnectionAndName(
                datasource.getConnectionName(), datasource.getName())
                .stream()
                .findFirst();

        if (existingDatasource.isPresent()) {
            Datasource existing = existingDatasource.get();
            boolean actionApplied = handleDatasourceCreateAction(datasource, request.getAction(), existing.getId());
            if (!actionApplied) {
                log.info("Same datasource already exists for id {} connection {} name {}",
                        existing.getId(), existing.getConnectionName(), existing.getName());
                return ResponseEntity.ok(CreateDatasourceResponse.builder()
                        .error(CreateDatasourceResponse.Error.SAME_NAME_EXISTS)
                        .datasourceName(existing.getName())
                        .build());
            }
        }

        Datasource result = datasourceService.save(datasource);
        return ResponseEntity.created(new URI("/api/datasource/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /datasource : Updates an existing datasource.
     *
     * @param request the datasource to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated datasource,
     * or with status 400 (Bad Request) if the datasource is not valid,
     * or with status 500 (Internal Server Error) if the datasource couldn't be updated
     */
    @PutMapping("/datasources")
    @Timed
    public ResponseEntity<?> updateDatasources(@Valid @RequestBody CreateDatasourceRequest request) {
        log.debug("REST request to update Datasource : {}", request);
        Datasource datasource = request.getDatasource();
        if (datasource.getId() == null) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idnotexist", "Please provide a resource ID to update the datasource."))
                    .body(null);
        }

        Optional<Datasource> existingDatasource = datasourceService.findAllByConnectionAndName(
                datasource.getConnectionName(), datasource.getName())
                .stream()
                .filter(it -> !it.getId().equals(datasource.getId()))
                .findFirst();

        if (existingDatasource.isPresent()) {
            Datasource existing = existingDatasource.get();
            log.warn("Updating datasource but already exists with the same name {} connection {} id {}",
                    existing.getName(), existing.getConnectionName(), existing.getId());

            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "flairbiApp.datasources.error.datasources.same_name_connection_already_exists"))
                    .body(null);
        }

        Datasource result = datasourceService.save(datasource);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, datasource.getId().toString()))
            .body(result);
    }

    private boolean handleDatasourceCreateAction(Datasource datasource, CreateDatasourceRequest.Action action, Long existingDatasourceId) {
        if (action == CreateDatasourceRequest.Action.DELETE) {
            log.info("Update/create datasource and deleting existing with connection {} and table {} existing {}",
                    datasource.getConnectionName(), datasource.getName(), existingDatasourceId);
            datasourceService.deleteByConnectionAndName(datasource.getConnectionName(), datasource.getName());
            return true;
        } else if (action == CreateDatasourceRequest.Action.EDIT) {
            log.info("Updating/creating datasource and editing existing with connection {} and table {} existing {}",
                    datasource.getConnectionName(), datasource.getName(), existingDatasourceId);
            datasource.setId(existingDatasourceId);
            return true;
        }
        return false;
    }

    /**
     * GET  /datasources : get all the datasources.
     *
     * @param predicate predicate
     * @return the ResponseEntity with status 200 (OK) and the list of datasources in body
     */
    @GetMapping("/datasources")
    @Timed
    public List<DatasourceDTO> getAllDatasources(@QuerydslPredicate(root = Datasource.class) Predicate predicate) {
        log.debug("REST request to get all Datasource");
        List<Datasource> datasourceList = datasourceService.findAll(predicate);
        List<ConnectionDTO> connectionServiceAllConnections = grpcConnectionService.getAllConnections(new ConnectionFilterParamsDTO());
        return datasourceList.stream()
                .map(datasource -> {
                    Optional<ConnectionDTO> optionalConnection = connectionServiceAllConnections.stream()
                            .filter(it -> Objects.equals(it.getLinkId(), datasource.getConnectionName()))
                            .findFirst();
                    return DatasourceDTO.builder()
                            .connectionName(datasource.getConnectionName())
                            .connectionReadableName(optionalConnection.map(i -> i.getName()).orElse(""))
                            .dashboardSet(datasource.getDashboardSet())
                            .datasourceConstraints(datasource.getDatasourceConstraints())
                            .features(datasource.getFeatures())
                            .hierarchies(datasource.getHierarchies())
                            .lastUpdated(datasource.getLastUpdated())
                            .id(datasource.getId())
                            .name(datasource.getName())
                            .queryPath(datasource.getQueryPath())
                            .connectionId(optionalConnection.map(i -> i.getId()).orElse(0L))
                            .status(datasource.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * GET  /datasources/:id : get the "id" datasources.
     *
     * @param id the id of the datasources to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the datasources, or with status 404 (Not Found)
     */
    @GetMapping("/datasources/{id}")
    @Timed
    public ResponseEntity<Datasource> getDatasources(@PathVariable Long id) {
        log.debug("REST request to get Datasource : {}", id);
        Datasource datasource = datasourceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(datasource));
    }

    /**
     * DELETE  /datasources/:id : delete the "id" datasources.
     *
     * @param id the id of the datasources to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/datasources/{id}")
    @Timed
    public ResponseEntity<Void> deleteDatasources(@PathVariable Long id) {
        log.debug("REST request to delete Datasource : {}", id);
        datasourceService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }


    @GetMapping("/datasources/count")
    @Timed
    public ResponseEntity<CountDTO> datasourceCount() {
        return ResponseEntity.ok(new CountDTO(datasourceService.getCount(null)));
    }

    /**
     * DELETE  /datasources : get all the datasources.
     *
     * @param predicate predicate
     * @return the ResponseEntity with status 200 (OK) and the list of datasources in body
     */
    @DeleteMapping("/datasources")
    @Timed
    public ResponseEntity<Void> deleteDatasources(@QuerydslPredicate(root = Datasource.class) Predicate predicate) {
        log.debug("REST request to get all Datasource");
        datasourceService.delete(predicate);
        return ResponseEntity.ok(null);
    }


    @GetMapping("/datasources/{id}/deleteInfo")
    public ResponseEntity<List<DeleteInfo>> getDatasourceDeleteInfo(@PathVariable Long id) {

        List<Dashboard> dashboards =
            dashboardService.findAllByDatasourceIds(Collections.singletonList(id));

        List<DeleteInfo> deleteInfos = new ArrayList<>();

        dashboards.forEach(x -> deleteInfos.add(new DeleteInfo("Dashboard", x.getDashboardName())));


        return ResponseEntity.ok(deleteInfos);
    }
    
    @PostMapping("/datasources/listTables")
    @Timed
    public ResponseEntity<?> listTables(@RequestBody ListTablesRequest listTablesRequest) {
        log.debug("REST request to get list tables {}", listTablesRequest);

        ListTablesResponseDTO response = grpcConnectionService.listTables(listTablesRequest.getConnectionLinkId(),
            listTablesRequest.getSearchTerm(),
            listTablesRequest.getConnection(),
            10);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/datasources/search")
    @Timed
    public ResponseEntity<List<Datasource>> getSearchedDatasources(@ApiParam Pageable pageable, @QuerydslPredicate(root = Datasource.class) Predicate predicate) throws URISyntaxException {
        log.debug("REST request to get Searched Datasources");
        Page<Datasource> page=datasourceService.search(pageable,predicate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/datasources");
        return ResponseEntity.status(200).headers(headers).body(page.getContent());
    }

    @Data
    public static class ListTablesRequest {
        String connectionLinkId;
        @NotNull
        @NotEmpty
        String searchTerm;
        ConnectionDTO connection;
    }

    @Builder
    @Getter
    private static class CreateDatasourceResponse {
        enum Error {
            OK, SAME_NAME_EXISTS;
        }
        private Error error;
        private String datasourceName;
    }

    @Data
    private static class CreateDatasourceRequest {
        enum Action {
            EDIT, DELETE;
        }
        @NotNull
        private Datasource datasource;
        private Action action;
    }

}
