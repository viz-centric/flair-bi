package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.authorization.AccessControlManager;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.config.Constants;
import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.User;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.service.DashboardService;
import com.flair.bi.service.MailService;
import com.flair.bi.service.UserService;
import com.flair.bi.view.ViewService;
import com.flair.bi.web.rest.util.HeaderUtil;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.flair.bi.web.rest.vm.ChangePermissionVM;
import com.flair.bi.web.rest.vm.ManagedUserVM;
import com.querydsl.core.types.Predicate;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityNotFoundException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing users.
 *
 * <p>This class accesses the User entity, and needs to fetch its collection of authorities.</p>
 * <p>
 * For a normal use-case, it would be better to have an eager relationship between User and Permission,
 * and send everything to the client side: there would be no View Model and DTO, a lot less code, and an outer-join
 * which would be good for performance.
 * </p>
 * <p>
 * We use a View Model and a DTO for 3 reasons:
 * <ul>
 * <li>We want to keep a lazy association between the user and the authorities, because people will
 * quite often do relationships with the user, and we don't want them to get the authorities all
 * the time for nothing (for performance reasons). This is the #1 goal: we should not impact our users'
 * application because of this use-case.</li>
 * <li> Not having an outer join causes n+1 requests to the database. This is not a real issue as
 * we have by default a second-level cache. This means on the first HTTP call we do the n+1 requests,
 * but then all authorities come from the cache, so in fact it's much better than doing an outer join
 * (which will get lots of data from the database, for each HTTP call).</li>
 * <li> As this manages users, for security reasons, we'd rather have a DTO layer.</li>
 * </ul>
 * <p>Another option would be to have a specific JPA entity graph to handle this case.</p>
 */
@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class UserResource {

    private final UserRepository userRepository;

    private final MailService mailService;

    private final UserService userService;

    private final DashboardService dashboardService;

    private final ViewService viewService;

    private final AccessControlManager accessControlManager;

    /**
     * POST  /users  : Creates a new user.
     * <p>
     * Creates a new user if the login and email are not already used, and sends an
     * mail with an activation link.
     * The user needs to be activated on creation.
     * </p>
     *
     * @param managedUserVM the user to create
     * @return the ResponseEntity with status 201 (Created) and with body the new user, or with status 400 (Bad Request) if the login or email is already in use
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/users")
    @Timed
    public ResponseEntity<?> createUser(@RequestBody ManagedUserVM managedUserVM) throws URISyntaxException {
        log.debug("REST request to save User : {}", managedUserVM);

        //Lowercase the user login before comparing with database
        if (userRepository.findOneByLogin(managedUserVM.getLogin().toLowerCase()).isPresent()) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert("userManagement", "userexists", "Login already in use"))
                .body(null);
        } else if (userRepository.findOneByEmail(managedUserVM.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert("userManagement", "emailexists", "Email already in use"))
                .body(null);
        } else {
            User newUser = userService.createUser(managedUserVM);
            mailService.sendCreationEmail(newUser);
            return ResponseEntity.created(new URI("/api/users/" + newUser.getLogin()))
                .headers(HeaderUtil.createAlert("userManagement.created", newUser.getLogin()))
                .body(newUser);
        }
    }

    /**
     * PUT  /users : Updates an existing User.
     *
     * @param managedUserVM the user to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated user,
     * or with status 400 (Bad Request) if the login or email is already in use,
     * or with status 500 (Internal Server Error) if the user couldn't be updated
     */
    @PutMapping("/users")
    @Timed
    public ResponseEntity<ManagedUserVM> updateUser(@RequestBody ManagedUserVM managedUserVM) {
        log.debug("REST request to update User : {}", managedUserVM);
        Optional<User> existingUser = userRepository.findOneByEmail(managedUserVM.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(managedUserVM.getId()))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("userManagement", "emailexists", "E-mail already in use")).body(null);
        }
        existingUser = userRepository.findOneByLogin(managedUserVM.getLogin().toLowerCase());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(managedUserVM.getId()))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("userManagement", "userexists", "Login already in use")).body(null);
        }
        userService.updateUser(managedUserVM.getId(), managedUserVM.getLogin(), managedUserVM.getFirstName(),
            managedUserVM.getLastName(), managedUserVM.getEmail(), managedUserVM.isActivated(),
            managedUserVM.getLangKey(), managedUserVM.getUserGroups());

        return ResponseEntity.ok()
            .headers(HeaderUtil.createAlert("userManagement.updated", managedUserVM.getLogin()))
            .body(new ManagedUserVM(userService.getUserWithAuthorities(managedUserVM.getId())));
    }

    /**
     * GET  /users : get all users.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and with body all users
     * @throws URISyntaxException if the pagination headers couldn't be generated
     */
    @GetMapping("/users")
    @Timed
    public ResponseEntity<List<ManagedUserVM>> getAllUsers(@ApiParam Pageable pageable)
        throws URISyntaxException {

        Page<User> page = userService.findAllWithAuthorities(pageable);
        List<ManagedUserVM> managedUserVMs = page.getContent().stream()
            .map(ManagedUserVM::new)
            .collect(Collectors.toList());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/users");
        return new ResponseEntity<>(managedUserVMs, headers, HttpStatus.OK);
    }

    /**
     * GET  /users/:login : get the "login" user.
     *
     * @param login the login of the user to find
     * @return the ResponseEntity with status 200 (OK) and with body the "login" user, or with status 404 (Not Found)
     */
    @GetMapping("/users/{login:" + Constants.LOGIN_REGEX + "}")
    @Timed
    public ResponseEntity<ManagedUserVM> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userService.getUserWithAuthoritiesByLogin(login)
            .map(ManagedUserVM::new)
            .map(managedUserVM -> new ResponseEntity<>(managedUserVM, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE /users/:login : delete the "login" User.
     *
     * @param login the login of the user to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/users/{login:" + Constants.LOGIN_REGEX + "}")
    @Timed
    public ResponseEntity<Void> deleteUser(@PathVariable String login) {
        log.debug("REST request to delete User: {}", login);
        userService.deleteUser(login);
        return ResponseEntity.ok().headers(HeaderUtil.createAlert("userManagement.deleted", login)).build();
    }

    /**
     * GET /users/:login/dashboardsMetadata : get permission information for dashboards for certain user
     *
     * @param login    usr login information
     * @param pageable pagination parameters
     * @throws URISyntaxException exception
     * @return the ResponseEntity with status 200(OK),
     * or status 404 (Not Found) if user with provided login does not exist
     */
    @GetMapping("/users/{login:" + Constants.LOGIN_REGEX + "}/dashboardPermissions")
    @Timed
    public ResponseEntity<List<GranteePermissionReport<User>>> getDashboardPermissionMetadataUser(@PathVariable String login, @ApiParam Pageable pageable) throws URISyntaxException {
        final Page<Dashboard> dashboardPage = dashboardService.findAll(pageable);
        final User user = userService.getUserWithAuthoritiesByLogin(login)
            .orElseThrow(() -> new EntityNotFoundException(String.format("User with login: %s was not found", login)));

        List<GranteePermissionReport<User>> body = dashboardPage
            .getContent()
            .stream()
            .map(x -> x.getGranteePermissionReport(user))
            .collect(Collectors.toList());


        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(dashboardPage, "/api/dashboards/permissions");
        return new ResponseEntity<>(body, headers, HttpStatus.OK);
    }


    @GetMapping("/users/{login:" + Constants.LOGIN_REGEX + "}/dashboardPermissions/{id}/viewPermissions")
    @Timed
    public ResponseEntity<List<GranteePermissionReport<User>>> getViewPermissionMetadataUser(@PathVariable String login, @PathVariable Long id) {
        final User user = userService.getUserWithAuthoritiesByLogin(login)
            .orElseThrow(() -> new EntityNotFoundException(String.format("User with login: %s was not found", login)));

        List<GranteePermissionReport<User>> body = viewService
            .findByDashboardId(id)
            .stream()
            .map(x -> x.getGranteePermissionReport(user))
            .collect(Collectors.toList());

        return ResponseEntity.ok(body);
    }

    @PutMapping("/users/{login:" + Constants.LOGIN_REGEX + "}/changePermissions")
    @Timed
    public ResponseEntity<Void> changePermissions(@PathVariable String login, @RequestBody List<ChangePermissionVM> changePermissionVMS) {
        changePermissionVMS.forEach(x -> {
            if (x.getAction() == ChangePermissionVM.Action.ADD) {
                accessControlManager.grantAccess(login, Permission.fromStringValue(x.getId()));
            } else {
                accessControlManager.revokeAccess(login, Permission.fromStringValue(x.getId()));
            }
        });

        return ResponseEntity.ok().build();
    }
    
    /**
     * GET  /users : get all users matching with search criteria.
     *
     * @param pageable the pagination information
     * @param predicate predicate
     * @return the ResponseEntity with status 200 (OK) and with body all users
     * @throws URISyntaxException if the pagination headers couldn't be generated
     */
    @GetMapping("/users/search")
    @Timed
    public ResponseEntity<List<ManagedUserVM>> getSearchedUsers(@ApiParam Pageable pageable,@QuerydslPredicate(root = User.class) Predicate predicate)
        throws URISyntaxException {
        Page<User> page = userService.findAllWithAuthorities(pageable,predicate);
        List<ManagedUserVM> managedUserVMs = page.getContent().stream()
            .map(ManagedUserVM::new)
            .collect(Collectors.toList());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/users");
        return new ResponseEntity<>(managedUserVMs, headers, HttpStatus.OK);
    }
}
