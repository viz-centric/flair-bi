package com.flair.bi.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.flair.bi.authorization.DashboardGranteePermissionReport;
import com.flair.bi.authorization.GranteePermissionReport;
import com.flair.bi.authorization.PermissionGrantee;
import com.flair.bi.authorization.PermissionReport;
import com.flair.bi.authorization.SecuredEntity;
import com.flair.bi.domain.enumeration.Action;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.viewwatch.ViewWatch;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
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
 * A View.
 */
@Entity
@Table(name = "views")
@Getter
@Setter
@EqualsAndHashCode(of = "id", callSuper = false)
public class View extends AbstractAuditingEntity implements Serializable, SecuredEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToMany(mappedBy = "view", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ViewRelease> releases = new HashSet<>();

    @AttributeOverrides(value = {
        @AttributeOverride(name = "id", column = @Column(name = "current_editing_state_id")),
        @AttributeOverride(name = "readOnly", column = @Column(name = "current_editing_read_only"))}
    )
    private ViewState currentEditingState;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_release_id", referencedColumnName = "id")
    private ViewRelease currentRelease;

    @NotNull
    @Size(max = 60)
    @Column(name = "view_name", length = 60, nullable = false)
    private String viewName;

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

    @ManyToOne
    @NotNull
    private Dashboard viewDashboard;

    @JsonIgnore
    @OneToMany(mappedBy = "view", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private Set<ViewWatch> viewWatches = new HashSet<>();

    @Column(name = "watch_count", nullable = false)
    private int watchCount = 0;

    @OneToMany(mappedBy = "view", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<ViewFeatureCriteria> viewFeatureCriterias = new HashSet<>();

    @ManyToOne(optional = false)
    private Realm realm;

    public View add(ViewRelease viewRelease) {
        viewRelease.setView(this);
        releases.add(viewRelease);
        return this;
    }

    public View remove(ViewRelease viewRelease) {
        viewRelease.setView(null);
        releases.remove(viewRelease);
        return this;
    }

    public View add(ViewFeatureCriteria criteria){
        criteria.setView(this);
        viewFeatureCriterias.add(criteria);
        return this;
    }

    public View remove(ViewFeatureCriteria criteria){
        viewFeatureCriterias.remove(criteria);
        criteria.setView(null);
        return this;
    }

    public View viewName(String viewName) {
        this.viewName = viewName;
        return this;
    }

    public View description(String description) {
        this.description = description;
        return this;
    }

    public View imageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
        return this;
    }

    public View viewDashboard(Dashboard dashboard) {
        this.viewDashboard = dashboard;
        return this;
    }

    public View published(Boolean published) {
        this.published = published;
        return this;
    }

    public View image(byte[] image) {
        this.image = image;
        return this;
    }

    /**
     * Get the entity identifiers
     *
     * @return collection of entity resources
     */
    @Override
    @JsonIgnore
    public List<String> getResources() {
        return Collections.singletonList(this.id.toString());
    }

    /**
     * List of available actions that can be performed against secured entity
     *
     * @return collection of {@link Action}
     */
    @Override
    @JsonIgnore
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
    @Override
    @JsonIgnore
    public String getScope() {
        return "VIEW";
    }

    @Override
    public <T extends PermissionGrantee> GranteePermissionReport<T> getGranteePermissionReport(T grantee) {
        Set<Permission> availablePermissions = grantee.getAvailablePermissions();
        Set<Permission> permissions = this.getPermissions();

        GranteePermissionReport<T> granteePermissionReport = new GranteePermissionReport<>();
        granteePermissionReport.setGrantee(grantee);
        granteePermissionReport.getInfo().put("viewName", this.viewName);
        granteePermissionReport.getInfo().put("id", this.id);
        granteePermissionReport.getInfo().put("permissionMetadata", permissions
            .stream()
            .map(y -> new PermissionReport(y, availablePermissions.contains(y)))
            .collect(Collectors.toCollection(LinkedHashSet::new)));

        return granteePermissionReport;
    }

    @Override
    public <T extends PermissionGrantee> DashboardGranteePermissionReport<T> getDashboardGranteePermissionReport(T grantee, List<GranteePermissionReport<T>> viewPermissions) {
        return null;
    }
}
