package com.flair.bi.service.impl;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.RealmRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.security.UserGroupRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.service.UserService;
import com.flair.bi.service.mapper.RealmMapper;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.web.rest.dto.RealmDTO;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

import static java.util.Arrays.asList;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmService {

    private final RealmRepository realmRepository;
    private final RealmMapper realmMapper;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserGroupService userGroupService;
    private final PasswordEncoder passwordEncoder;
    private final UserGroupRepository userGroupRepository;


    @Transactional
    public RealmDTO save(RealmDTO realmDTO) {
        log.debug("Saving realm : {}", realmDTO);
        Realm realm = realmMapper.fromDTO(realmDTO);
        Realm finalRealm = realmRepository.save(realm);
        AuthoritiesConstants.ALL.stream()
                .forEach(auth -> {
                    UserGroup ug = userGroupService.save(createUserGroup(finalRealm, auth));
                    if (ug.getName().equals(AuthoritiesConstants.ADMIN)) {
                        userRepository.save(createUser(finalRealm, ug));
                    }
                });
//        userService.createUser(new ManagedUserVM());

        return realmMapper.toDTO(finalRealm);
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
        Page<Realm> entities = realmRepository.findAll(predicate,pageable);
        return entities;
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
        // TODO
        realmRepository.deleteById(id);
    }

    private User createUser(Realm realm, UserGroup userGroup){
        User newUser = new User();
        newUser.setLogin(realm.getName().trim()+realm.getId());
        String encryptedPassword = passwordEncoder.encode(realm.getName().trim()+realm.getId()+"@123");
        newUser.setUserGroups(new HashSet<>(asList(userGroup)));
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(realm.getName());
        newUser.setLastName("Administrator");
        newUser.setEmail(realm.getName().trim()+realm.getId()+"@localhost");
        newUser.setLangKey(Constants.LanguageKeys.ENGLISH);
        newUser.setActivated(true);
        newUser.setCreatedBy("system");
        newUser.setLastModifiedBy("system");
        newUser.setRealm(realm);
        return newUser;
    }

    private UserGroup createUserGroup(Realm realm, String name){
        UserGroup userGroup = new UserGroup();
        userGroup.setName(name);
        userGroup.setRealm(realm);
        return userGroup;
    }
}
