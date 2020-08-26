package com.flair.bi.service.impl;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.Functions;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.FunctionsRepository;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.VisualizationColorsRepository;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.service.security.UserGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmProcessorService {
    private final UserRepository userRepository;
    private final UserGroupService userGroupService;
    private final PasswordEncoder passwordEncoder;
    private final FunctionsRepository functionsRepository;
    private final VisualizationColorsRepository visualizationColorsRepository;

    public void saveRealmDependentRecords(Realm realm,Long vizcentricId){
        // TODO create user group service is not done yet
        userGroupService.save(createUserGroup(realm));
        userRepository.save(createUser(realm));
        functionsRepository.saveAll(buildFunctionsList(realm,vizcentricId));
        visualizationColorsRepository.saveAll(buildVisualizationColorsList(realm,vizcentricId));
    }

    public void deleteRealmDependentRecords(Long id){
        // TODO
        visualizationColorsRepository.deleteByRealmId(id);
        functionsRepository.deleteByRealmId(id);
    }

    private User createUser(Realm realm){
        User newUser = new User();
        newUser.setLogin(realm.getName().trim()+realm.getId());
        String encryptedPassword = passwordEncoder.encode(realm.getName().trim()+realm.getId()+"@123");
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

    private UserGroup createUserGroup(Realm realm){
        UserGroup userGroup = new UserGroup();
        userGroup.setName(AuthoritiesConstants.ADMIN);
        userGroup.setRealm(realm);
        return userGroup;
    }

    private List<Functions> buildFunctionsList(Realm realm, Long vizcentricId){
        List<Functions> functions = functionsRepository.findByRealmId(vizcentricId)
                .stream()
                .map(f -> {
                    Functions function = new Functions();
                    function.setDescription(f.getDescription());
                    function.dimensionUse(f.isDimensionUse());
                    function.measureUse(f.isMeasureUse());
                    function.setName(f.getName());
                    function.setValidation(f.getValidation());
                    function.setValue(f.getValue());
                    function.setRealm(realm);
                    return function;
                }).collect(Collectors.toList());
        return functions;
    }

    private List<VisualizationColors> buildVisualizationColorsList(Realm realm, Long vizcentricId){
        List<VisualizationColors> visualizationColors = visualizationColorsRepository.findByRealmId(vizcentricId)
                .stream()
                .map(v ->{
                    VisualizationColors visualizationColor = new VisualizationColors();
                    visualizationColor.setCode(v.getCode());
                    visualizationColor.setRealm(realm);
                    return visualizationColor;
                }).collect(Collectors.toList());
        return visualizationColors;
    }
}
