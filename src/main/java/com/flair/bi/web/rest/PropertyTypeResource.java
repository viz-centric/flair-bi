package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.service.dto.PropertyTypeDTO;
import com.flair.bi.service.mapper.PropertyTypeMapper;
import com.flair.bi.service.properttype.PropertyTypeService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.flair.bi.web.rest.util.ResponseUtil;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST endpoint for {@link PropertyType}
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class PropertyTypeResource {

    private final PropertyTypeService propertyTypeService;

    private final PropertyTypeMapper propertyTypeMapper;

    /**
     * GET  /propertyTypes : get all property types.
     *
     * @param pageable pageable
     * @throws URISyntaxException exception
     * @return the ResponseEntity with status 200 (OK) and the list of property types in body
     */
    @GetMapping("/propertyTypes")
    @Timed
    public ResponseEntity<List<PropertyTypeDTO>> getAllPropertyTypes(@ApiParam Pageable pageable) throws URISyntaxException {
        log.debug("REST request to get all Property Types");
        final Page<PropertyType> page = propertyTypeService.findAll(pageable);
        final List<PropertyTypeDTO> content = propertyTypeMapper.propertyTypesToPropertyTypeDTOs(page.getContent());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/propertyTypes");
        return ResponseEntity.status(200).headers(headers).body(content);
    }

    /**
     * GET  /datasources/:id : get the "id" propertyType.
     *
     * @param id the id of the propertyType to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the propertyType, or with status 404 (Not Found)
     */
    @GetMapping("/propertyTypes/{id}")
    @Timed
    public ResponseEntity<PropertyType> getPropertyType(@PathVariable Long id) {
        log.debug("REST request to get property type with id: {}", id);
        return ResponseUtil.wrapOrNotFound(
            Optional.ofNullable(propertyTypeService.findById(id)));
    }

    /**
     * POST  /datasources : Create a new property type.
     *
     * @param propertyType the property type to create
     * @return the ResponseEntity with status 201 (Created) and with body the new propertyType, or with status 400 (Bad Request) if the propertyType has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/propertyTypes")
    @Timed
    public ResponseEntity<PropertyType> insertPropertyType(@Valid @RequestBody PropertyType propertyType) throws URISyntaxException {
        log.debug("REST request to insert Property type : {}", propertyType);
        if (propertyType.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("propertyTypes", "idexists", "A new property type cannot already have an ID")).body(null);
        }
        PropertyType result = propertyTypeService.save(propertyType);
        return ResponseEntity.created(new URI("/api/propertyTypes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("propertyTypes", result.getId().toString()))
            .body(result);
    }


    /**
     * PUT  /propertyTypes : Updates an existing property type.
     *
     * @param propertyType the property type to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated property type,
     * or with status 400 (Bad Request) if the property type is not valid,
     * or with status 500 (Internal Server Error) if the property type could not be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/propertyTypes")
    @Timed
    public ResponseEntity<PropertyType> updateDatasources(@Valid @RequestBody PropertyType propertyType) throws URISyntaxException {
        log.debug("REST request to update Property type : {}", propertyType);
        if (propertyType.getId() == null) {
            return insertPropertyType(propertyType);
        }
        PropertyType result = propertyTypeService.save(propertyType);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("datasources", propertyType.getId().toString()))
            .body(result);
    }

    /**
     * DELETE  /propertyTypes/:id : delete the "id" propertyTypes.
     *
     * @param id the id of the propertyTypes to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/propertyTypes/{id}")
    @Timed
    public ResponseEntity<Void> deleteDatasources(@PathVariable Long id) {
        log.debug("REST request to delete Property type : {}", id);
        propertyTypeService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("propertyType", id.toString())).build();
    }


}
