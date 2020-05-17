package com.flair.bi.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.service.FunctionsService;
import com.flair.bi.service.dto.FunctionsDTO;
import com.flair.bi.web.rest.util.HeaderUtil;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing Functions.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class FunctionsResource {

    private final FunctionsService functionsService;

    /**
     * POST  /functions : Create a new functions.
     *
     * @param functionsDTO the functionsDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new functionsDTO, or with status 400 (Bad Request) if the functions has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/functions")
    @Timed
    public ResponseEntity<FunctionsDTO> createFunctions(@RequestBody FunctionsDTO functionsDTO) throws URISyntaxException {
        log.debug("REST request to save Functions : {}", functionsDTO);
        if (functionsDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("functions", "idexists", "A new functions cannot already have an ID")).body(null);
        }
        FunctionsDTO result = functionsService.save(functionsDTO);
        return ResponseEntity.created(new URI("/api/functions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("functions", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /functions : Updates an existing functions.
     *
     * @param functionsDTO the functionsDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated functionsDTO,
     * or with status 400 (Bad Request) if the functionsDTO is not valid,
     * or with status 500 (Internal Server Error) if the functionsDTO couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/functions")
    @Timed
    public ResponseEntity<FunctionsDTO> updateFunctions(@RequestBody FunctionsDTO functionsDTO) throws URISyntaxException {
        log.debug("REST request to update Functions : {}", functionsDTO);
        if (functionsDTO.getId() == null) {
            return createFunctions(functionsDTO);
        }
        FunctionsDTO result = functionsService.save(functionsDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("functions", functionsDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /functions : get all the functions.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of functions in body
     */
    @GetMapping("/functions")
    @Timed
    public List<FunctionsDTO> getAllFunctions() {
        log.debug("REST request to get all Functions");
        return functionsService.findAll();
    }

    /**
     * GET  /functions/:id : get the "id" functions.
     *
     * @param id the id of the functionsDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the functionsDTO, or with status 404 (Not Found)
     */
    @GetMapping("/functions/{id}")
    @Timed
    public ResponseEntity<FunctionsDTO> getFunctions(@PathVariable Long id) {
        log.debug("REST request to get Functions : {}", id);
        FunctionsDTO functionsDTO = functionsService.findOne(id);
        return Optional.ofNullable(functionsDTO)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /functions/:id : delete the "id" functions.
     *
     * @param id the id of the functionsDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/functions/{id}")
    @Timed
    public ResponseEntity<Void> deleteFunctions(@PathVariable Long id) {
        log.debug("REST request to delete Functions : {}", id);
        functionsService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("functions", id.toString())).build();
    }

}
