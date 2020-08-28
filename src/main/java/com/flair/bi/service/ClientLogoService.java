package com.flair.bi.service;

import com.flair.bi.domain.ClientLogo;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Service Interface for managing ClientLogo.
 */
public interface ClientLogoService {

    /**
     * Save a clientLogo.
     *
     * @param clientLogo the entity to save
     * @return the persisted entity
     */
    ClientLogo save(ClientLogo clientLogo);

    /**
     *  Get all the clientLogos.
     *  
     *  @return the list of entities
     */
    List<ClientLogo> findAll();

    /**
     *  Get the "id" clientLogo.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    ClientLogo findOne(Long id);

    /**
     *  Delete the "id" clientLogo.
     *
     *  @param id the id of the entity
     */
    void delete(Long id);

    /**
     *  Update the "url" based on "id".
     *
     *  @param id and url
     */
    void updateImageLocation(String url,Long id);
}
