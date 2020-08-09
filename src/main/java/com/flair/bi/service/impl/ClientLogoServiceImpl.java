package com.flair.bi.service.impl;

import com.flair.bi.service.ClientLogoService;
import com.flair.bi.domain.ClientLogo;
import com.flair.bi.repository.ClientLogoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service Implementation for managing ClientLogo.
 */
@Service
@Transactional
public class ClientLogoServiceImpl implements ClientLogoService{

    private final Logger log = LoggerFactory.getLogger(ClientLogoServiceImpl.class);
    
    private final ClientLogoRepository clientLogoRepository;

    public ClientLogoServiceImpl(ClientLogoRepository clientLogoRepository) {
        this.clientLogoRepository = clientLogoRepository;
    }

    /**
     * Save a clientLogo.
     *
     * @param clientLogo the entity to save
     * @return the persisted entity
     */
    @Override
    public ClientLogo save(ClientLogo clientLogo) {
        log.debug("Request to save ClientLogo : {}", clientLogo);
        ClientLogo result = clientLogoRepository.save(clientLogo);
        return result;
    }

    /**
     *  Get all the clientLogos.
     *  
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<ClientLogo> findAll() {
        log.debug("Request to get all ClientLogos");
        List<ClientLogo> result = clientLogoRepository.findAll();

        return result;
    }

    /**
     *  Get one clientLogo by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public ClientLogo findOne(Long id) {
        log.debug("Request to get ClientLogo : {}", id);
        ClientLogo clientLogo = clientLogoRepository.getOne(id);
        return clientLogo;
    }

    /**
     *  Delete the  clientLogo by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ClientLogo : {}", id);
        clientLogoRepository.deleteById(id);
    }

    /**
     *  Update the "url" based on "id".
     *
     *  @param id and url
     */
    @Override
    public void updateImageLocation(String url, Long id) {
        log.debug("Request to update ClientLogo url : {}",url, id);
        clientLogoRepository.updateImageLocation(url,id);
    }
}
