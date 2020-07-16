package com.flair.bi.web.rest;

import com.flair.bi.service.FileUploadService;
import io.micrometer.core.annotation.Timed;
import com.flair.bi.domain.ClientLogo;
import com.flair.bi.service.ClientLogoService;
import com.flair.bi.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ClientLogo.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClientLogoResource {

    private final Logger log = LoggerFactory.getLogger(ClientLogoResource.class);

    private static final String ENTITY_NAME = "clientLogo";
        
    private final ClientLogoService clientLogoService;

    private final FileUploadService imageUploadService;

    /**
     * POST  /client-logos : Create a new clientLogo.
     *
     * @param clientLogo the clientLogo to create
     * @return the ResponseEntity with status 201 (Created) and with body the new clientLogo, or with status 400 (Bad Request) if the clientLogo has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/client-logos")
    @Timed
    public ResponseEntity<ClientLogo> createClientLogo(@Valid @RequestBody ClientLogo clientLogo) throws URISyntaxException {
        log.debug("REST request to save ClientLogo : {}", clientLogo);
        if (clientLogo.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new clientLogo cannot already have an ID")).body(null);
        }
        ClientLogo result = clientLogoService.save(clientLogo);
        try {
            if (clientLogo.getImage() != null) {
                String loc = imageUploadService.uploadedImageAndReturnPath(clientLogo.getImage(), result.getId(),
                        clientLogo.getImageContentType(), "clientlogo");
                clientLogo.setUrl(loc);
                clientLogoService.updateImageLocation(loc, result.getId());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert("clientlogo", "imageupload", "image is not uploaded"))
                    .body(null);
        }
        return ResponseEntity.created(new URI("/api/client-logos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /client-logos : Updates an existing clientLogo.
     *
     * @param clientLogo the clientLogo to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated clientLogo,
     * or with status 400 (Bad Request) if the clientLogo is not valid,
     * or with status 500 (Internal Server Error) if the clientLogo couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/client-logos")
    @Timed
    public ResponseEntity<ClientLogo> updateClientLogo(@Valid @RequestBody ClientLogo clientLogo) throws URISyntaxException {
        log.debug("REST request to update ClientLogo : {}", clientLogo);
        if (clientLogo.getId() == null) {
            return createClientLogo(clientLogo);
        }
        try {
            if (clientLogo.getImage() != null) {
                String imageLocation = clientLogoService.findOne(clientLogo.getId()).getUrl();
                imageUploadService.deleteImage(imageLocation);
                String loc = imageUploadService.uploadedImageAndReturnPath(clientLogo.getImage(), clientLogo.getId(),
                        clientLogo.getImageContentType(), "clientlogo");
                clientLogo.setUrl(loc);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .headers(HeaderUtil.createFailureAlert("clientlogo", "imageupload", "image is not uploaded"))
                    .body(null);
        }
        ClientLogo result = clientLogoService.save(clientLogo);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, clientLogo.getId().toString()))
            .body(result);
    }

    /**
     * GET  /client-logos : get all the clientLogos.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of clientLogos in body
     */
     /**this api is not required. hence commenting it for now.**/

    @GetMapping("/client-logos")
    @Timed
    public List<ClientLogo> getAllClientLogos() {
        log.debug("REST request to get all ClientLogos");
        return clientLogoService.findAll();
    }

    /**
     * GET  /client-logos/:id : get the "id" clientLogo.
     *
     * @param id the id of the clientLogo to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the clientLogo, or with status 404 (Not Found)
     */
    @GetMapping("/client-logos/{id}")
    @Timed
    public ResponseEntity<ClientLogo> getClientLogo(@PathVariable Long id) {
        log.debug("REST request to get ClientLogo : {}", id);
        ClientLogo clientLogo = clientLogoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(clientLogo));
    }

    /**
     * DELETE  /client-logos/:id : delete the "id" clientLogo.
     *
     * @param id the id of the clientLogo to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/client-logos/{id}")
    @Timed
    public ResponseEntity<Void> deleteClientLogo(@PathVariable Long id) {
        log.debug("REST request to delete ClientLogo : {}", id);
        ClientLogo clientLogo = clientLogoService.findOne(id);
        imageUploadService.deleteImage(clientLogo.getUrl());
        clientLogoService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}
