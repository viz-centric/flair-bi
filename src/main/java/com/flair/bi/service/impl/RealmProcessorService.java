package com.flair.bi.service.impl;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.Functions;
import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.domain.VisualizationColors;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.DatasourceService;
import com.flair.bi.service.FieldTypeService;
import com.flair.bi.service.FunctionsService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.VisualizationColorsService;
import com.flair.bi.service.properttype.PropertyTypeService;
import com.flair.bi.service.security.UserGroupService;
import com.flair.bi.view.ViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealmProcessorService {
    private final UserService userService;
    private final UserGroupService userGroupService;
    private final PasswordEncoder passwordEncoder;
    private final FunctionsService functionsService;
    private final VisualizationColorsService visualizationColorsService;
    private final PropertyTypeService propertyTypeService;
    private final FieldTypeService fieldTypeService;
    private final ViewService viewService;
    private final DashboardService dashboardService;
    private final DatasourceService datasourceService;

    public void saveRealmDependentRecords(Realm realm,Long vizcentricId){
        createUserGroups(realm, vizcentricId);
        UserGroup adminGroup = getAdminGroup(realm);
        createUser(realm, adminGroup);
        createFunctions(realm, vizcentricId);
        createVisualizationColors(realm, vizcentricId);
        createFieldTypes(realm, vizcentricId);
    }

    private void createUser(Realm realm, UserGroup adminGroup) {
        User newUser = new User();
        newUser.setLogin(realm.getName().trim()+ realm.getId());
        String encryptedPassword = passwordEncoder.encode(realm.getName().trim()+ realm.getId()+"@123");
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(realm.getName());
        newUser.setLastName("Administrator");
        newUser.setEmail(realm.getName().trim()+ realm.getId()+"@localhost");
        newUser.setLangKey(Constants.LanguageKeys.ENGLISH);
        newUser.setActivated(true);
        newUser.setCreatedBy("system");
        newUser.setLastModifiedBy("system");
        newUser.setRealm(realm);
        newUser.setUserGroups(assignGroupToUser(adminGroup));
        userService.saveUser(newUser);
    }

    private void createFunctions(Realm realm, Long vizcentricId) {
        List<Functions> functions = functionsService.findByRealmId(vizcentricId)
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
        functionsService.saveAll(functions);
    }

    private void createVisualizationColors(Realm realm, Long vizcentricId) {
        List<VisualizationColors> visualizationColors = visualizationColorsService.findByRealmId(vizcentricId)
                .stream()
                .map(v ->{
                    VisualizationColors visualizationColor = new VisualizationColors();
                    visualizationColor.setCode(v.getCode());
                    visualizationColor.setRealm(realm);
                    return visualizationColor;
                }).collect(Collectors.toList());
        visualizationColorsService.saveAll(visualizationColors);
    }

    private void createFieldTypes(Realm realm, Long vizcentricId) {
        List<FieldType> existingFieldTypes = fieldTypeService.getAllByRealmId(vizcentricId);
        List<Pair<FieldType, FieldType>> newFieldTypes = existingFieldTypes
                .stream()
                .map(ft -> {
                    FieldType fieldType = new FieldType();
                    fieldType.setRealm(realm);
                    fieldType.setConstraint(ft.getConstraint());
                    fieldType.setFeatureType(ft.getFeatureType());
                    fieldType.setVisualization(ft.getVisualization());
                    return Pair.of(fieldType, ft);
                })
                .collect(Collectors.toList());

        fieldTypeService.saveAll(newFieldTypes
                .stream()
                .map(pair -> pair.getLeft())
                .collect(Collectors.toSet()));

        newFieldTypes.forEach(pair -> {
            FieldType ft = pair.getRight();
            FieldType fieldType = pair.getLeft();
            ft.getPropertyTypes()
                    .stream()
                    .map(pt -> pt.getPropertyType())
                    .forEach(pt -> {
                        PropertyType propertyType = propertyTypeService.findById(pt.getId());
                        fieldType.addPropertyType(propertyType);
                    });
        });

        fieldTypeService.saveAll(newFieldTypes
                .stream()
                .map(pair -> pair.getLeft())
                .collect(Collectors.toSet()));
    }

    private UserGroup getAdminGroup(Realm realm) {
        return userGroupService.findAllByNameInAndRealmId(Set.of(AuthoritiesConstants.ADMIN), realm.getId()).get(0);
    }

    private void createUserGroups(Realm realm, Long vizcentricId) {
        List<UserGroup> existingGroups = userGroupService.findAllByRealmId(vizcentricId);
        Set<UserGroup> userGroups = existingGroups.stream()
                .filter(g -> !g.getName().equals(AuthoritiesConstants.SUPERADMIN))
                .map(g -> createGroup(realm, g))
                .collect(Collectors.toSet());
        userGroupService.saveAll(userGroups);
    }

    private UserGroup createGroup(Realm realm, UserGroup g) {
        UserGroup group = new UserGroup();
        group.setName(g.getName());
        group.setPermissions(g.getPermissions()
                .stream()
                .map(p -> createPermission(p))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        group.setRealm(realm);
        group.setUsers(new HashSet<>());
        return group;
    }

    private Permission createPermission(Permission p) {
        // we skip all permissions assigned to specific dashboards, views, etc
        try {
            Long.parseLong(p.getResource());
            return null;
        } catch (NumberFormatException ignored) {
        }
        Permission permission = new Permission();
        permission.setAction(p.getAction());
        permission.setKey(p.getKey());
        permission.setScope(p.getScope());
        permission.setResource(p.getResource());
        return permission;
    }

    public void deleteRealmDependentRecords(Long id){
        visualizationColorsService.deleteAllByRealmId(id);
        functionsService.deleteAllByRealmId(id);
        userService.deleteAllByRealmId(id);
        userGroupService.deleteAllByRealmId(id);
        viewService.deleteAllByRealmId(id);
        dashboardService.deleteAllByRealmId(id);
        datasourceService.deleteAllByRealmId(id);
    }

    private Set<UserGroup> assignGroupToUser(UserGroup userGroup){
        Set<UserGroup> userGroups = new HashSet<>();
        userGroups.add(userGroup);
        return userGroups;
    }

}
