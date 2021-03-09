package com.flair.bi.service.impl;

import com.flair.bi.domain.DraftUser;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.RealmCreationToken;
import com.flair.bi.repository.RealmRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.service.mapper.RealmMapper;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmService {

    public static final long VIZ_CENTRIC_REALM = 1L;

    private final RealmRepository realmRepository;
    private final RealmMapper realmMapper;
    private final RealmProcessorService realmProcessorService;
    private final UserService userService;

    @Transactional
    public CreateRealmData createLoggedIn(RealmDTO realmDTO) {
        log.debug("Saving realm : {}", realmDTO);
        Realm realm = realmMapper.fromDTO(realmDTO);
        realm = realmRepository.save(realm);
        realmProcessorService.saveRealmDependentRecords(realm, SecurityUtils.getUserAuth().getRealmId());
        return new CreateRealmData(realm.getId(), realm.getName(), Optional.ofNullable(realm.getRealmCreationToken()).map(t -> t.getToken()).orElse(null));
    }

    @Transactional
    public CreateRealmData createAnonym(RealmDTO realmDTO) {
        log.debug("Saving realm anonym: {}", realmDTO);
        Realm realm = realmMapper.fromDTO(realmDTO);
        realmRepository.save(realm);
        RealmCreationToken realmCreationToken = new RealmCreationToken();
        realmCreationToken.setToken(UUID.randomUUID().toString());
        realmCreationToken.setDateCreated(Instant.now());
        realmCreationToken.setRealm(realm);
        realm.setRealmCreationToken(realmCreationToken);
        realmRepository.save(realm);
        return new CreateRealmData(realm.getId(), realm.getName(), realm.getRealmCreationToken().getToken());
    }

    @Transactional(readOnly = true)
    public List<RealmDTO> findAll(Pageable pageable) {
        log.debug("Request to get all realms");
        Page<Realm> entities = realmRepository.findAll(pageable);
        return realmMapper.toDTOs(entities.getContent());
    }

    @Transactional(readOnly = true)
    public Page<Realm> findAll(Predicate predicate, Pageable pageable) {
        log.debug("Request to get all realms");
        return realmRepository.findAll(predicate,pageable);
    }

    @Transactional(readOnly = true)
    public RealmDTO findOne(Long id) {
        log.debug("Request to get Functions : {}", id);
        Realm entity = realmRepository.getOne(id);
        return realmMapper.toDTO(entity);
    }

    @Transactional(readOnly = true)
    public Realm findOneAsRealm(Long id) {
        log.debug("Request to get Functions : {}", id);
        return realmRepository.getOne(id);
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Request to delete Functions : {}", id);
        realmProcessorService.deleteRealmDependentRecords(id);
        realmRepository.deleteById(id);
    }

    @Transactional
    public ReplicateRealmResult replicateRealm(Long realmId, DraftUser draftUser) {
        Realm realm = realmRepository.getOne(realmId);
        return realmProcessorService.replicateRealm(realm, draftUser, VIZ_CENTRIC_REALM);
    }

    public Set<Realm> findAllByUsername(String username) {
        return userService.getUserByLoginNoRealmCheck(username).map(u -> u.getRealms()).orElseGet(() -> new HashSet<>());
    }
}