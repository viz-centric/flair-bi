package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.service.FileUploaderStatusService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.flair.bi.service.dto.FileUploaderStatusDTO;

import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
 * REST controller for managing FileUploaderStatus.
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class FileUploaderStatusResource {

    private final FileUploaderStatusService fileUploaderStatusService;

    /**
     * POST  /file-uploader-statuses : Create a new fileUploaderStatus.
     *
     * @param fileUploaderStatusDTO the fileUploaderStatusDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new fileUploaderStatusDTO, or with status 400 (Bad Request) if the fileUploaderStatus has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/file-uploader-statuses")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
    public ResponseEntity<FileUploaderStatusDTO> createFileUploaderStatus(@Valid @RequestBody FileUploaderStatusDTO fileUploaderStatusDTO) throws URISyntaxException {
        log.debug("REST request to save FileUploaderStatus : {}", fileUploaderStatusDTO);
        if (fileUploaderStatusDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("fileUploaderStatus", "idexists", "A new fileUploaderStatus cannot already have an ID")).body(null);
        }
        FileUploaderStatusDTO result = fileUploaderStatusService.save(fileUploaderStatusDTO);
        return ResponseEntity.created(new URI("/api/file-uploader-statuses/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("fileUploaderStatus", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /file-uploader-statuses : Updates an existing fileUploaderStatus.
     *
     * @param fileUploaderStatusDTO the fileUploaderStatusDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated fileUploaderStatusDTO,
     * or with status 400 (Bad Request) if the fileUploaderStatusDTO is not valid,
     * or with status 500 (Internal Server Error) if the fileUploaderStatusDTO couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/file-uploader-statuses")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
    public ResponseEntity<FileUploaderStatusDTO> updateFileUploaderStatus(@Valid @RequestBody FileUploaderStatusDTO fileUploaderStatusDTO) throws URISyntaxException {
        log.debug("REST request to update FileUploaderStatus : {}", fileUploaderStatusDTO);
        if (fileUploaderStatusDTO.getId() == null) {
            return createFileUploaderStatus(fileUploaderStatusDTO);
        }
        FileUploaderStatusDTO result = fileUploaderStatusService.save(fileUploaderStatusDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("fileUploaderStatus", fileUploaderStatusDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /file-uploader-statuses : get all the fileUploaderStatuses.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of fileUploaderStatuses in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/file-uploader-statuses")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
    public ResponseEntity<List<FileUploaderStatusDTO>> getAllFileUploaderStatuses(@ApiParam Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of FileUploaderStatuses");
        Page<FileUploaderStatusDTO> page = fileUploaderStatusService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/file-uploader-statuses");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /file-uploader-statuses/:id : get the "id" fileUploaderStatus.
     *
     * @param id the id of the fileUploaderStatusDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the fileUploaderStatusDTO, or with status 404 (Not Found)
     */
    @GetMapping("/file-uploader-statuses/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
    public ResponseEntity<FileUploaderStatusDTO> getFileUploaderStatus(@PathVariable Long id) {
        log.debug("REST request to get FileUploaderStatus : {}", id);
        FileUploaderStatusDTO fileUploaderStatusDTO = fileUploaderStatusService.findOne(id);
        return Optional.ofNullable(fileUploaderStatusDTO)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /file-uploader-statuses/:id : delete the "id" fileUploaderStatus.
     *
     * @param id the id of the fileUploaderStatusDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/file-uploader-statuses/{id}")
    @Timed
    @PreAuthorize("@accessControlManager.hasAccess('FILE_UPLOADER', 'WRITE', 'APPLICATION')")
    public ResponseEntity<Void> deleteFileUploaderStatus(@PathVariable Long id) {
        log.debug("REST request to delete FileUploaderStatus : {}", id);
        fileUploaderStatusService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("fileUploaderStatus", id.toString())).build();
    }

}
