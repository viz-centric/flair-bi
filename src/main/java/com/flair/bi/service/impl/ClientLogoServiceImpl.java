package com.flair.bi.service.impl;

import com.flair.bi.domain.ClientLogo;
import com.flair.bi.domain.QClientLogo;
import com.flair.bi.domain.User;
import com.flair.bi.repository.ClientLogoRepository;
import com.flair.bi.security.SecurityUtils;
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
import java.util.Objects;

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
            clientLogo.setRealm(user.getRealmById(SecurityUtils.getUserAuth().getRealmId()));
        } else {
            if (!Objects.equals(SecurityUtils.getUserAuth().getRealmId(), clientLogo.getRealm().getId())) {
                throw new IllegalStateException("Cannot update client logo for realm " + clientLogo.getRealm().getId());
            }
        }
        return clientLogoRepository.save(clientLogo);
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
        return QClientLogo.clientLogo.realm.id.eq(SecurityUtils.getUserAuth().getRealmId());
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
        clientLogoRepository.updateImageLocation(url, id, SecurityUtils.getUserAuth().getRealmId());
    }
}
