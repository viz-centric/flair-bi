package com.flair.bi.service.impl;

import com.flair.bi.domain.ClientLogo;
import com.flair.bi.domain.QClientLogo;
import com.flair.bi.domain.User;
import com.flair.bi.repository.ClientLogoRepository;
import com.flair.bi.service.ClientLogoService;
import com.flair.bi.service.UserService;
import com.google.common.collect.ImmutableList;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing ClientLogo.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClientLogoServiceImpl implements ClientLogoService{

    private final Logger log = LoggerFactory.getLogger(ClientLogoServiceImpl.class);
    
    private final ClientLogoRepository clientLogoRepository;
    private final UserService userService;

    /**
     * Save a clientLogo.
     *
     * @param clientLogo the entity to save
     * @return the persisted entity
     */
    @Override
    public ClientLogo save(ClientLogo clientLogo) {
        log.debug("Request to save ClientLogo : {}", clientLogo);
        User user = userService.getUserWithAuthoritiesByLoginOrError();
        if (clientLogo.getRealm() == null) {
            clientLogo.setRealm(user.getFirstRealm());
        } else {
            if (!user.getRealmIds().contains(clientLogo.getRealm().getId())) {
                throw new IllegalStateException("Cannot update client logo for realm " + clientLogo.getRealm().getId());
            }
        }
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
        return ImmutableList.copyOf(
                clientLogoRepository.findAll(hasRealmPermissions())
        );
    }

    private BooleanExpression hasRealmPermissions() {
        User user = userService.getUserWithAuthoritiesByLoginOrError();
        return QClientLogo.clientLogo.realm.id.in(user.getRealmIds());
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
        return clientLogoRepository.findOne(hasRealmPermissions()
                .and(QClientLogo.clientLogo.id.eq(id))).orElse(null);
    }

    /**
     *  Delete the  clientLogo by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ClientLogo : {}", id);
        ClientLogo clientLogo = findOne(id);
        clientLogoRepository.delete(clientLogo);
    }

    /**
     *  Update the "url" based on "id".
     *
     *  @param id and url
     */
    @Override
    public void updateImageLocation(String url, Long id) {
        log.debug("Request to update ClientLogo url : {} id {}", url, id);
        User user = userService.getUserWithAuthoritiesByLoginOrError();
        clientLogoRepository.updateImageLocation(url, id, user.getFirstRealm().getId());
    }
}
