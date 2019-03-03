package com.flair.bi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.authorization.PermissionReport;
import com.flair.bi.authorization.SecuredEntity;
import com.flair.bi.domain.enumeration.Action;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.springframework.cloud.cloudfoundry.com.fasterxml.jackson.annotation.JsonView;

import java.io.Serializable;
import java.util.*;
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
    @Size(max = 20)
    @Column(name = "dashboard_name", length = 20, nullable = false)
    private String dashboardName;

    @NotNull
    @Size(max = 20)
    @Column(name = "category", length = 20, nullable = false)
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

        Set<PermissionReport> reports = this.getPermissions()
            .stream()
            .map(y -> new PermissionReport(y, grantee.getAvailablePermissions().contains(y)))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        granteePermissionReport.setGrantee(grantee);
        granteePermissionReport.getInfo().put("id", this.id);
        granteePermissionReport.getInfo().put("dashboardName", this.dashboardName);
        granteePermissionReport.getInfo().put("permissionMetadata", reports);

        return granteePermissionReport;
    }


}
