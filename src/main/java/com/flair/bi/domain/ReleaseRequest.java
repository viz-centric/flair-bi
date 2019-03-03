package com.flair.bi.domain;


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
import javax.persistence.OneToOne;
import javax.persistence.Table;

/**
 * Holds a request by the user to create a new release
 */
@Entity
@Table(name = "release_requests")
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class ReleaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requested_by_login", referencedColumnName = "login", nullable = false)
    private User requestedBy;

    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    private DashboardRelease release;

    @Column(name = "release_request_comment")
    private String comment;
}
