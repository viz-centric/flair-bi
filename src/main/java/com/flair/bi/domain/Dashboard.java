package com.flair.bi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.authorization.DashboardGranteePermissionReport;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.authorization.PermissionReport;
import com.flair.bi.authorization.PermissionStatus;
import com.flair.bi.authorization.SecuredEntity;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A Dashboard.
 */
@Entity
@Table(name = "dashboards")
@Getter
@Setter
@EqualsAndHashCode(of = "id", callSuper = false)
public class Dashboard extends AbstractAuditingEntity implements Serializable, SecuredEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Size(max = 30)
    @Column(name = "dashboard_name", length = 30, nullable = false,unique=true)
    private String dashboardName;

    @NotNull
    @Size(max = 30)
    @Column(name = "category", length = 30, nullable = false)
    private String category;

    @Size(max = 100)
    @Column(name = "description", length = 100)
    private String description;

    @NotNull
    @Column(name = "published", nullable = false)
    private boolean published;

    @Transient
    @JsonProperty
    private byte[] image;

    @Transient
	public byte[] getImage() {
		return image;
	}

	public void setImage(byte[] image) {
		this.image = image;
	}

	@Column(name = "image_location")
    private String imageLocation;

    @Column(name = "image_content_type")
    private String imageContentType;

    @OneToMany(mappedBy = "viewDashboard")
    @JsonIgnore
    private Set<View> dashboardViews = new HashSet<>();

    @ManyToOne
    @NotNull
    private Datasource dashboardDatasource;

    @OneToMany(mappedBy = "dashboard", cascade = CascadeType.ALL)
    private Set<DashboardRelease> dashboardReleases = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_release_id", referencedColumnName = "id")
    private DashboardRelease currentRelease;

    @ManyToOne(optional = false)
    private Realm realm;

    public Dashboard add(DashboardRelease dashboardRelease) {
        dashboardRelease.setDashboard(this);
        dashboardReleases.add(dashboardRelease);
        return this;
    }

    public Dashboard remove(DashboardRelease dashboardRelease) {
        dashboardRelease.setDashboard(null);
        dashboardReleases.remove(dashboardRelease);
        return this;
    }


    public Dashboard dashboardName(String dashboardName) {
        this.dashboardName = dashboardName;
        return this;
    }

    public Dashboard category(String category) {
        this.category = category;
        return this;
    }

    public Dashboard description(String description) {
        this.description = description;
        return this;
    }

    public Dashboard published(Boolean published) {
        this.published = published;
        return this;
    }

    public Dashboard image(byte[] image) {
        this.image = image;
        return this;
    }

    public Dashboard imageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
        return this;
    }

    public Dashboard dashboardViews(Set<View> views) {
        this.dashboardViews = views;
        return this;
    }

    public Dashboard addDashboardView(View view) {
        dashboardViews.add(view);
        view.setViewDashboard(this);
        return this;
    }

    public Dashboard removeDashboardView(View view) {
        dashboardViews.remove(view);
        view.setViewDashboard(null);
        return this;
    }

    public Dashboard dashboardDatasources(Datasource datasource) {
        this.dashboardDatasource = datasource;
        return this;
    }

    /**
     * Get the entity identifiers
     *
     * @return collection of entity resources
     */
    @JsonIgnore
    @Override
    public List<String> getResources() {
        return Collections.singletonList(this.id.toString());
    }

    /**
     * List of available actions that can be performed against secured entity
     *
     * @return collection of {@link Action}
     */
    @JsonIgnore
    @Override
    public List<Action> getActions() {
        return Arrays.asList(Action.READ,
            Action.WRITE,
            Action.UPDATE,
            Action.DELETE,
            Action.READ_PUBLISHED,
            Action.DELETE_PUBLISHED,
            Action.TOGGLE_PUBLISH,
            Action.REQUEST_PUBLISH,
            Action.MANAGE_PUBLISH);
    }

    /**
     * Under which scope is this entity being protected
     *
     * @return scope or realm
     */
    @JsonIgnore
    @Override
    public String getScope() {
        return "DASHBOARD";
    }

    @Override
    public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
        GranteePermissionReport<T> granteePermissionReport = new GranteePermissionReport<>();

        Set<Permission> availablePermissions = grantee.getAvailablePermissions();
        Set<Permission> permissions = this.getPermissions();

        Set<PermissionReport> reports = permissions
            .stream()
            .map(permission -> new PermissionReport(permission, availablePermissions.contains(permission)))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        granteePermissionReport.setGrantee(grantee);
        granteePermissionReport.getInfo().put("id", this.id);
        granteePermissionReport.getInfo().put("dashboardName", this.dashboardName);
        granteePermissionReport.getInfo().put("permissionMetadata", reports);

        PermissionStatus permStatus = getPermissionStatus(reports);
        granteePermissionReport.getInfo().put("status", permStatus);

        return granteePermissionReport;
    }

    @Override
    public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee,List<GranteePermissionReport<T>> viewPermissions) {
        DashboardGranteePermissionReport<T> granteePermissionReport = new DashboardGranteePermissionReport<>();

        Set<Permission> availablePermissions = grantee.getAvailablePermissions();
        Set<Permission> permissions = this.getPermissions();

        Set<PermissionReport> reports = permissions
                .stream()
                .map(y -> new PermissionReport(y, availablePermissions.contains(y)))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        granteePermissionReport.setGrantee(grantee);
        granteePermissionReport.setViews(viewPermissions);
        granteePermissionReport.getInfo().put("id", this.id);
        granteePermissionReport.getInfo().put("dashboardName", this.dashboardName);
        granteePermissionReport.getInfo().put("permissionMetadata", reports);

        PermissionStatus permStatus = getPermissionStatus(reports);
        granteePermissionReport.getInfo().put("status", permStatus);

        return granteePermissionReport;
    }

    private PermissionStatus getPermissionStatus(Set<PermissionReport> reports) {
        PermissionStatus permStatus;
        if (reports.stream().allMatch(report -> report.isHasIt())) {
            permStatus = PermissionStatus.ALLOW;
        } else if (reports.stream().anyMatch(report -> report.isHasIt())) {
            permStatus = PermissionStatus.PARTIAL;
        } else {
            permStatus = PermissionStatus.DENY;
        }
        return permStatus;
    }


}