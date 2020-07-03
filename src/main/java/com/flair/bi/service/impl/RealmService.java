package com.flair.bi.service.impl;

import com.flair.bi.domain.Realm;
import com.flair.bi.repository.RealmRepository;
import com.flair.bi.service.mapper.RealmMapper;
import com.flair.bi.web.rest.dto.RealmDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmService {

    private final RealmRepository realmRepository;
    private final RealmMapper realmMapper;

    @Transactional
    public RealmDTO save(RealmDTO realmDTO) {
        log.debug("Saving realm : {}", realmDTO);
        Realm realm = realmMapper.fromDTO(realmDTO);
        realm = realmRepository.save(realm);
        return realmMapper.toDTO(realm);
    }

    @Transactional(readOnly = true)
    public List<RealmDTO> findAll() {
        log.debug("Request to get all realms");
        List<Realm> entities = realmRepository.findAll();
        return realmMapper.toDTOs(entities);
    }

    @Transactional(readOnly = true)
    public RealmDTO findOne(Long id) {
        log.debug("Request to get Functions : {}", id);
        Realm entity = realmRepository.getOne(id);
        return realmMapper.toDTO(entity);
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Request to delete Functions : {}", id);
        realmRepository.deleteById(id);
    }
}
