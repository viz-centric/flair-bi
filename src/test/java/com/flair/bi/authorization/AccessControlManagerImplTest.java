package com.flair.bi.authorization;

import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.User;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.PermissionKey;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.security.PermissionEdgeRepository;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.repository.security.UserGroupRepository;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.UserService;
import com.flair.bi.web.rest.UserResourceIntTest;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Ignore
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FlairbiApp.class)
@Transactional
public class AccessControlManagerImplTest {

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserGroupRepository userGroupRepository;
    @Autowired
    PermissionRepository permissionRepository;
    @Autowired
    PermissionEdgeRepository permissionEdgeRepository;
    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    @Qualifier("userDetailsService")
    org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Autowired
    UserService userService;

    private AccessControlManager accessControlManager;

    @Before
    public void setup() {
        accessControlManager = new AccessControlManagerImpl(userRepository, userGroupRepository, permissionRepository,
                permissionEdgeRepository);
    }

    /**
     * If there is no currently authenticated the has access should return false
     */
    @Test
    public void hasAccessNotAuthenticatedReturnsFalseTest() {

        Permission a = new Permission("a", Action.READ, "a");
        boolean result = accessControlManager.hasAccess(a);
        Assert.assertEquals(false, result);

        result = accessControlManager.hasAccess(SecurityUtils.getCurrentUserLogin(), a);
        Assert.assertEquals(false, result);

    }

    @Test
    public void hasAccessNoPermissionReturnsFalseTest() {

        // create user
        User user = UserResourceIntTest.createEntity(userService);

        Permission a = new Permission("a", Action.READ, "a");
        accessControlManager.addPermission(a);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());

        // set that the user is authenticated
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(), userDetails.getPassword(), userDetails.getAuthorities()));

        boolean result = accessControlManager.hasAccess(a);

        Assert.assertEquals(false, result);

        result = accessControlManager.hasAccess(SecurityUtils.getCurrentUserLogin(), a);
        Assert.assertEquals(false, result);
    }

    @Test
    public void hasAccessReturnsTrueTest() {
        // create user
        User user = UserResourceIntTest.createEntity(userService);

        Permission a = new Permission("a", Action.READ, "a");
        accessControlManager.addPermission(a);

        // grant access
        accessControlManager.grantAccess(user.getLogin(), a);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());

        // set that the user is authenticated
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(), userDetails.getPassword(), userDetails.getAuthorities()));

        boolean result = accessControlManager.hasAccess(a);

        Assert.assertEquals(true, result);

        result = accessControlManager.hasAccess(SecurityUtils.getCurrentUserLogin(), a);
        Assert.assertEquals(true, result);

    }

    /**
     * Circular check
     */
    @Test
    public void permissionChainGivesCorrectResultCircular() {
        Permission a = new Permission("a", Action.READ, "a");
        Permission b = new Permission("b", Action.READ, "b");
        Permission c = new Permission("c", Action.READ, "c");
        accessControlManager.addPermission(a);
        accessControlManager.addPermission(b);
        accessControlManager.addPermission(c);

        accessControlManager.connectPermissions(a, b, true, false);
        accessControlManager.connectPermissions(a, c, false, false);
        accessControlManager.connectPermissions(b, c, false, false);

        Collection<Permission> permissions = accessControlManager.getPermissionChain(a);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b));

        permissions = accessControlManager.getPermissionChain(b);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b));

        permissions = accessControlManager.getPermissionChain(c);

        Assert.assertEquals(3, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b));
        Assert.assertTrue(permissions.contains(c));
    }

    /**
     * Transitivity check
     * <p>
     * a -> b -> c
     */
    @Test
    public void permissionChainGivesCorrectResultTransitive() {
        Permission a = new Permission("a", Action.READ, "a");
        Permission b = new Permission("b", Action.READ, "b");
        Permission c = new Permission("c", Action.READ, "c");
        accessControlManager.addPermission(a);
        accessControlManager.addPermission(b);
        accessControlManager.addPermission(c);

        accessControlManager.connectPermissions(a, b, false, false);
        accessControlManager.connectPermissions(b, c, false, true);

        Collection<Permission> permissions = accessControlManager.getPermissionChain(c);

        Assert.assertEquals(3, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b));
        Assert.assertTrue(permissions.contains(c));
    }

    /**
     * No bidirectional check
     * <p>
     * a -> b c -> d
     */
    @Test
    public void permissionChainGivesCorrectResultNoBidirectional() {
        Permission a = new Permission("a", Action.READ, "a");
        Permission b = new Permission("b", Action.READ, "b");
        Permission c = new Permission("c", Action.READ, "c");
        Permission d = new Permission("d", Action.READ, "d");
        accessControlManager.addPermission(a);
        accessControlManager.addPermission(b);
        accessControlManager.addPermission(c);
        accessControlManager.addPermission(d);

        accessControlManager.connectPermissions(a, b, false, false);
        accessControlManager.connectPermissions(c, d, false, false);

        Collection<Permission> permissions = accessControlManager.getPermissionChain(a);

        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));

        permissions = accessControlManager.getPermissionChain(b);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(b));
        Assert.assertTrue(permissions.contains(a));

        permissions = accessControlManager.getPermissionChain(c);
        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(c));

        permissions = accessControlManager.getPermissionChain(d);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(d));
        Assert.assertTrue(permissions.contains(c));

    }

    @Test
    public void permissionChainGivesCorrectResultBiDirectionalTransitive() {
        Permission a = new Permission("a", Action.READ, "a");
        Permission b1 = new Permission("b1", Action.READ, "b");
        Permission b2 = new Permission("b2", Action.READ, "b");
        Permission b3 = new Permission("b3", Action.READ, "b");
        Permission c1 = new Permission("c1", Action.READ, "c");
        Permission c2 = new Permission("c2", Action.READ, "c");
        accessControlManager.addPermission(a);
        accessControlManager.addPermission(b1);
        accessControlManager.addPermission(b2);
        accessControlManager.addPermission(b3);
        accessControlManager.addPermission(c1);
        accessControlManager.addPermission(c2);

        accessControlManager.connectPermissions(b1, a, true, true);
        accessControlManager.connectPermissions(b2, a, true, true);
        accessControlManager.connectPermissions(b3, a, true, true);
        accessControlManager.connectPermissions(c1, b1, true, true);
        accessControlManager.connectPermissions(c2, b1, true, true);

        Collection<Permission> permissions = accessControlManager.getPermissionChain(b1);

        Assert.assertEquals(4, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b1));
        Assert.assertTrue(permissions.contains(c1));
        Assert.assertTrue(permissions.contains(c2));

        permissions = accessControlManager.getPermissionChain(b2);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b2));

        permissions = accessControlManager.getPermissionChain(b3);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b3));

        permissions = accessControlManager.getPermissionChain(b3);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b3));

    }

    @Test
    public void permissionChainGivesCorrectResultBidirectional() {
        Permission a = new Permission("a", Action.READ, "a");
        Permission b = new Permission("b", Action.READ, "b");
        Permission c = new Permission("c", Action.READ, "c");
        Permission d = new Permission("d", Action.READ, "d");
        accessControlManager.addPermission(a);
        accessControlManager.addPermission(b);
        accessControlManager.addPermission(c);
        accessControlManager.addPermission(d);

        accessControlManager.connectPermissions(a, b, true, false);
        accessControlManager.connectPermissions(c, d, true, false);

        Collection<Permission> permissions = accessControlManager.getPermissionChain(a);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));
        Assert.assertTrue(permissions.contains(b));

        permissions = accessControlManager.getPermissionChain(b);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(b));
        Assert.assertTrue(permissions.contains(a));

        permissions = accessControlManager.getPermissionChain(c);
        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(c));
        Assert.assertTrue(permissions.contains(d));

        permissions = accessControlManager.getPermissionChain(d);

        Assert.assertEquals(2, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(d));
        Assert.assertTrue(permissions.contains(c));

        accessControlManager.disconnectPermissions(a, b);
        accessControlManager.disconnectPermissions(c, d);

        permissions = accessControlManager.getPermissionChain(a);

        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(a));

        permissions = accessControlManager.getPermissionChain(b);

        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(b));

        permissions = accessControlManager.getPermissionChain(c);
        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(c));

        permissions = accessControlManager.getPermissionChain(d);

        Assert.assertEquals(1, permissions.toArray().length);
        Assert.assertTrue(permissions.contains(d));

    }

    /**
     * Checks if permission is added to context
     */
    @Test
    public void addPermissionTest() {

        SecuredEntity a = new SecuredEntity() {
            @Override
            public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
                return null;
            }

            @Override
            public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
                return null;
            }

            @Override
            public List<String> getResources() {
                return Collections.singletonList("test");
            }

            @Override
            public List<Action> getActions() {
                return Arrays.asList(Action.READ, Action.WRITE);
            }

            @Override
            public String getScope() {
                return "test";
            }
        };

        Collection<Permission> perm = accessControlManager.addPermissions(a);

        Assert.assertEquals(2, perm.toArray().length);
        Assert.assertTrue(perm.contains(new Permission("test", Action.READ, "test")));
        Assert.assertTrue(perm.contains(new Permission("test", Action.WRITE, "test")));

        Assert.assertTrue(permissionRepository.getOne(new PermissionKey("test", Action.READ, "test")) != null);
        Assert.assertTrue(permissionRepository.getOne(new PermissionKey("test", Action.WRITE, "test")) != null);
    }

    @Test
    public void removePermissionTest() {

        SecuredEntity a = new SecuredEntity() {
            @Override
            public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
                return null;
            }

            @Override
            public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
                return null;
            }

            @Override
            public List<String> getResources() {
                return Collections.singletonList("a");
            }

            @Override
            public List<Action> getActions() {
                return Arrays.asList(Action.READ, Action.WRITE);
            }

            @Override
            public String getScope() {
                return "a";
            }
        };

        accessControlManager.addPermissions(a);
        accessControlManager.removePermissions(a);
        // the entity does not exist in persistence storage
        Assert.assertTrue(permissionRepository.getOne(new PermissionKey("a", Action.READ, "a")) == null);
        Assert.assertTrue(permissionRepository.getOne(new PermissionKey("a", Action.WRITE, "a")) == null);
    }

    @Test
    public void grantRevokeUserAccessCheck() {

        SecuredEntity a = new SecuredEntity() {
            @Override
            public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
                return null;
            }

            @Override
            public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
                return null;
            }

            @Override
            public List<String> getResources() {
                return Collections.singletonList("test");
            }

            @Override
            public List<Action> getActions() {
                return Arrays.asList(Action.READ, Action.WRITE);
            }

            @Override
            public String getScope() {
                return "a";
            }
        };

        User test = new User();

        test.setLogin("test");
        test.setPassword(passwordEncoder.encode("test"));
        test.setActivated(true);
        userRepository.save(test);

        accessControlManager.addPermissions(a);

        accessControlManager.grantAccess("test", "test", Action.READ, "a");

        // assert that user has
        Assert.assertTrue(userRepository.findOneByLogin("test").map(User::getPermissions).orElse(Collections.emptySet())
                .contains(new Permission("test", Action.READ, "a")));

        accessControlManager.revokeAccess("test", "test", Action.READ, "a");

        // assert that user has
        Assert.assertFalse(userRepository.findOneByLogin("test").map(User::getPermissions)
                .orElse(Collections.emptySet()).contains(new Permission("test", Action.READ, "a")));

    }

    @Test
    public void grantRevokeUserGroupAccessCheck() {

        SecuredEntity a = new SecuredEntity() {
            @Override
            public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
                return null;
            }

            @Override
            public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
                return null;
            }

            @Override
            public List<String> getResources() {
                return Collections.singletonList("test");
            }

            @Override
            public List<Action> getActions() {
                return Arrays.asList(Action.READ, Action.WRITE);
            }

            @Override
            public String getScope() {
                return "b";
            }
        };

        UserGroup test = new UserGroup();

        test.setName("test");
        userGroupRepository.save(test);
        accessControlManager.addPermissions(a);
        accessControlManager.assignPermission("test", new Permission("test", Action.READ, "b"));

        // assert that user group has permissions
        Assert.assertTrue(userGroupRepository.getOne("test").getPermissions()
                .contains(new Permission("test", Action.READ, "b")));

        accessControlManager.dissociatePermission("test", new Permission("test", Action.READ, "b"));

        // assert that user group does not have a permission
        Assert.assertFalse(userGroupRepository.getOne("test").getPermissions()
                .contains(new Permission("test", Action.READ, "b")));
    }

}